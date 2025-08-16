const { setUserOnlineStatus } = require('../controllers/userController');
const Message = require('../models/message');
const User = require('../models/user');

module.exports = (io) => {
  // Store connected users and their socket info
  const connectedUsers = new Map();
  const typingUsers = new Map();

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Handle user joining
    socket.on('user_join', async ({ userId, username }) => {
      socket.userId = userId;
      socket.username = username;
      
      // Store user connection info
      connectedUsers.set(userId, {
        socketId: socket.id,
        username,
        rooms: new Set(['general']), // Default room
        lastSeen: new Date()
      });

      // Join default room
      socket.join('general');
      
      // Update online status
      await setUserOnlineStatus(userId, true);
      
      // Broadcast user online status
      io.emit('user_online', { userId, username });
      
      // Send current online users to the new user
      const onlineUsers = Array.from(connectedUsers.entries()).map(([id, user]) => ({
        userId: id,
        username: user.username,
        online: true
      }));
      socket.emit('online_users', onlineUsers);
    });

    // Handle joining rooms
    socket.on('join_room', (roomName) => {
      if (socket.userId) {
        const user = connectedUsers.get(socket.userId);
        if (user) {
          user.rooms.add(roomName);
          socket.join(roomName);
          socket.emit('room_joined', roomName);
          socket.to(roomName).emit('user_joined_room', {
            userId: socket.userId,
            username: socket.username,
            room: roomName
          });
        }
      }
    });

    // Handle leaving rooms
    socket.on('leave_room', (roomName) => {
      if (socket.userId) {
        const user = connectedUsers.get(socket.userId);
        if (user) {
          user.rooms.delete(roomName);
          socket.leave(roomName);
          socket.to(roomName).emit('user_left_room', {
            userId: socket.userId,
            username: socket.username,
            room: roomName
          });
        }
      }
    });

    // Handle chat messages
    socket.on('send_message', async (messageData) => {
      try {
        const message = new Message({
          sender: socket.userId,
          content: messageData.content,
          room: messageData.room || 'general',
          receiver: messageData.receiver, // For private messages
          messageType: messageData.messageType || 'text', // text, image, file
          fileUrl: messageData.fileUrl,
          fileName: messageData.fileName,
          timestamp: new Date(),
        });

        await message.save();

        // Populate sender info
        const populatedMessage = await message.populate('sender', 'username');

        // Emit to appropriate recipients
        if (messageData.receiver) {
          // Private message
          const receiverSocket = connectedUsers.get(messageData.receiver);
          if (receiverSocket) {
            socket.to(receiverSocket.socketId).emit('private_message', populatedMessage);
          }
          socket.emit('private_message', populatedMessage);
        } else {
          // Room message
          io.to(messageData.room || 'general').emit('receive_message', populatedMessage);
        }

        // Send notification to receiver if it's a private message
        if (messageData.receiver) {
          const receiverSocket = connectedUsers.get(messageData.receiver);
          if (receiverSocket) {
            socket.to(receiverSocket.socketId).emit('new_message_notification', {
              sender: socket.username,
              message: messageData.content.substring(0, 50) + '...',
              type: 'private'
            });
          }
        }
      } catch (error) {
        console.error('Error saving message:', error);
        socket.emit('message_error', { error: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('typing', (data) => {
      const { room = 'general', isTyping, receiver } = data;
      
      if (receiver) {
        // Private typing indicator
        const receiverSocket = connectedUsers.get(receiver);
        if (receiverSocket) {
          socket.to(receiverSocket.socketId).emit('typing', {
            userId: socket.userId,
            username: socket.username,
            isTyping,
            type: 'private'
          });
        }
      } else {
        // Room typing indicator
        socket.to(room).emit('typing', {
          userId: socket.userId,
          username: socket.username,
          isTyping,
          room
        });
      }
    });

    // Read receipts
    socket.on('mark_read', async (messageId) => {
      try {
        const message = await Message.findByIdAndUpdate(
          messageId,
          { read: true, readAt: new Date() },
          { new: true }
        ).populate('sender', 'username');

        if (message) {
          // Notify sender that message was read
          const senderSocket = connectedUsers.get(message.sender._id.toString());
          if (senderSocket) {
            socket.to(senderSocket.socketId).emit('message_read', {
              messageId,
              readBy: socket.userId,
              readAt: new Date()
            });
          }
        }
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    });

    // Message reactions
    socket.on('add_reaction', async (data) => {
      try {
        const { messageId, reaction } = data;
        const message = await Message.findById(messageId);
        
        if (message) {
          if (!message.reactions) message.reactions = {};
          if (!message.reactions[reaction]) message.reactions[reaction] = [];
          
          if (!message.reactions[reaction].includes(socket.userId)) {
            message.reactions[reaction].push(socket.userId);
            await message.save();
            
            // Broadcast reaction to all users in the room
            const populatedMessage = await message.populate('sender', 'username');
            io.to(message.room || 'general').emit('message_reaction', {
              messageId,
              reaction,
              userId: socket.userId,
              username: socket.username
            });
          }
        }
      } catch (error) {
        console.error('Error adding reaction:', error);
      }
    });

    // File upload notification
    socket.on('file_upload_start', (data) => {
      socket.to(data.room || 'general').emit('file_upload_progress', {
        userId: socket.userId,
        username: socket.username,
        fileName: data.fileName,
        progress: 0
      });
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      if (socket.userId) {
        const user = connectedUsers.get(socket.userId);
        if (user) {
          // Leave all rooms
          user.rooms.forEach(room => {
            socket.to(room).emit('user_left_room', {
              userId: socket.userId,
              username: socket.username,
              room
            });
          });
          
          // Remove from connected users
          connectedUsers.delete(socket.userId);
          
          // Update online status
          await setUserOnlineStatus(socket.userId, false);
          
          // Broadcast user offline
          io.emit('user_offline', { 
            userId: socket.userId, 
            username: socket.username 
          });
        }
      }
    });
  });
};
