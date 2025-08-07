const { setUserOnlineStatus } = require('../controllers/userController');
const Message = require('../models/message');
const User = require('../models/user');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Handle user joining
    socket.on('user_join', async ({ userId, username }) => {
      socket.userId = userId;
      socket.username = username;
      await setUserOnlineStatus(userId, true);
      io.emit('user_online', { userId, username });
    });

    // Handle chat messages
    socket.on('send_message', async (messageData) => {
      const message = new Message({
        ...messageData,
        sender: socket.userId,
        timestamp: new Date(),
      });
      await message.save();
      io.emit('receive_message', message);
    });

    // Typing indicator
    socket.on('typing', (data) => {
      socket.broadcast.emit('typing', data);
    });

    // Private messages
    socket.on('private_message', async ({ to, content }) => {
      const message = new Message({
        sender: socket.userId,
        receiver: to,
        content,
        isPrivate: true,
        timestamp: new Date(),
      });
      await message.save();
      socket.to(to).emit('private_message', message);
      socket.emit('private_message', message);
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      if (socket.userId) {
        await setUserOnlineStatus(socket.userId, false);
        io.emit('user_offline', { userId: socket.userId, username: socket.username });
      }
    });
  });
};
