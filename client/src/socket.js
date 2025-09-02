// socket.js - Socket.io client setup
import { io } from 'socket.io-client';
import { useEffect, useState } from 'react';

// Socket.io connection URL
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// Create socket instance
export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Custom hook for using socket.io
export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [lastMessage, setLastMessage] = useState(null);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);

  // Connect to socket server
  const connect = ({ userId, username }) => {
    socket.connect();
    if (userId && username) {
      socket.emit('user_join', { userId, username }); // ✅ matches backend
    }
  };

  // Disconnect from socket server
  const disconnect = () => {
    socket.disconnect();
  };

  // Send a room message
  const sendMessage = (roomId, content) => {
    socket.emit('send_message', { room: roomId, content });
  };

  // Send a private message
  const sendPrivateMessage = (to, content) => {
    socket.emit('send_message', { receiver: to, content });
  };

  // Join a room
  const joinRoom = (roomId) => {
    socket.emit('join_room', roomId);
  };

  // Leave a room
  const leaveRoom = (roomId) => {
    socket.emit('leave_room', roomId);
  };

  // Set typing status
  const setTyping = (roomId, isTyping, receiver) => {
    socket.emit('typing', { room: roomId, isTyping, receiver });
  };

  // Socket event listeners
  useEffect(() => {
    // Connection events
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    // Message events
    const onReceiveMessage = (message) => {
      setLastMessage(message);
      setMessages((prev) => [...prev, message]);
    };

    const onPrivateMessage = (message) => {
      setLastMessage(message);
      setMessages((prev) => [...prev, message]);
    };

    // Online users
    const onOnlineUsers = (userList) => {
      setUsers(userList);
    };

    // Room events
    const onRoomCreated = (room) => {
      // system log
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          system: true,
          message: `Room "${room.name}" was created`,
          timestamp: new Date().toISOString(),
        },
      ]);
    };

    const onRoomJoined = ({ roomId, user }) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          system: true,
          message: `${user.username} joined room ${roomId}`,
          timestamp: new Date().toISOString(),
        },
      ]);
    };

    const onRoomLeft = ({ roomId, user }) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          system: true,
          message: `${user.username} left room ${roomId}`,
          timestamp: new Date().toISOString(),
        },
      ]);
    };

    // Typing events
    const onTyping = (data) => {
      if (data.isTyping) {
        setTypingUsers((prev) => [...prev, data.username]);
      } else {
        setTypingUsers((prev) => prev.filter((u) => u !== data.username));
      }
    };

    // ✅ Register all listeners
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('receive_message', onReceiveMessage);
    socket.on('private_message', onPrivateMessage);
    socket.on('online_users', onOnlineUsers);
    socket.on('room_created', onRoomCreated);
    socket.on('room_joined', onRoomJoined);
    socket.on('room_left', onRoomLeft);
    socket.on('typing', onTyping);

    // Cleanup
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('receive_message', onReceiveMessage);
      socket.off('private_message', onPrivateMessage);
      socket.off('online_users', onOnlineUsers);
      socket.off('room_created', onRoomCreated);
      socket.off('room_joined', onRoomJoined);
      socket.off('room_left', onRoomLeft);
      socket.off('typing', onTyping);
    };
  }, []);

  return {
    socket,
    isConnected,
    lastMessage,
    messages,
    users,
    typingUsers,
    connect,
    disconnect,
    sendMessage,
    sendPrivateMessage,
    joinRoom,
    leaveRoom,
    setTyping,
  };
};

export default socket;
