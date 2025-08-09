import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const newSocket = io('http://localhost:5000', {
        auth: {
          token: localStorage.getItem('token'),
        },
      });

      newSocket.on('connect', () => {
        console.log('Connected to server');
        setConnected(true);
        
        // Join with user info
        newSocket.emit('user_join', {
          userId: user.id,
          username: user.username,
        });
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
        setConnected(false);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [user]);

  const sendMessage = useCallback((messageData) => {
    if (socket && connected) {
      socket.emit('send_message', messageData);
    }
  }, [socket, connected]);

  const sendPrivateMessage = useCallback((to, content) => {
    if (socket && connected) {
      socket.emit('private_message', { to, content });
    }
  }, [socket, connected]);

  const sendTyping = useCallback((isTyping) => {
    if (socket && connected) {
      socket.emit('typing', isTyping);
    }
  }, [socket, connected]);

  const value = useMemo(() => ({
    socket,
    connected,
    sendMessage,
    sendPrivateMessage,
    sendTyping,
  }), [socket, connected, sendMessage, sendPrivateMessage, sendTyping]);

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
