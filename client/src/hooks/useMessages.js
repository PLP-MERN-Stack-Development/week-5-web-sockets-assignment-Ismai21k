import { useState, useEffect, useCallback } from 'react';
import messageService from '../services/messageService';

export const useMessages = (currentRoom) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch messages for current room
  const fetchMessages = useCallback(async () => {
    if (!currentRoom) return;
    
    try {
      setLoading(true);
      setError(null);
      const messages = await messageService.getMessages(currentRoom);
      setMessages(messages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentRoom]);

  // Send a message
  const sendMessage = useCallback(async (messageData) => {
    try {
      setError(null);
      const message = await messageService.sendMessage({
        ...messageData,
        room: currentRoom
      });
      setMessages(prev => [...prev, message]);
      return message;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [currentRoom]);

  // Mark message as read
  const markAsRead = useCallback(async (messageId) => {
    try {
      setError(null);
      await messageService.markAsRead(messageId);
      setMessages(prev => prev.map(msg => 
        msg._id === messageId ? { ...msg, read: true } : msg
      ));
    } catch (err) {
      setError(err.message);
    }
  }, []);

  // Add a new message (for real-time updates)
  const addMessage = useCallback((message) => {
    setMessages(prev => [...prev, message]);
  }, []);

  // Update message reactions
  const updateMessageReaction = useCallback((messageId, reaction, userId) => {
    setMessages(prev => prev.map(msg => {
      if (msg._id === messageId) {
        const reactions = { ...msg.reactions };
        if (!reactions[reaction]) {
          reactions[reaction] = [];
        }
        if (!reactions[reaction].includes(userId)) {
          reactions[reaction] = [...reactions[reaction], userId];
        }
        return { ...msg, reactions };
      }
      return msg;
    }));
  }, []);

  // Mark message as read (for real-time updates)
  const markMessageAsRead = useCallback((messageId, readBy, readAt) => {
    setMessages(prev => prev.map(msg => 
      msg._id === messageId 
        ? { ...msg, read: true, readAt, readBy }
        : msg
    ));
  }, []);

  // Clear messages when room changes
  useEffect(() => {
    setMessages([]);
    if (currentRoom) {
      fetchMessages();
    }
  }, [currentRoom, fetchMessages]);

  return {
    messages,
    loading,
    error,
    sendMessage,
    markAsRead,
    addMessage,
    updateMessageReaction,
    markMessageAsRead,
    fetchMessages
  };
};

