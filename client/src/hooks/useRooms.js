import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import roomService from '../services/roomService';

export const useRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [publicRooms, setPublicRooms] = useState([]);
  const [userRooms, setUserRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { socket } = useSocket();

  // Fetch public rooms
  const fetchPublicRooms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const rooms = await roomService.getPublicRooms();
      setPublicRooms(rooms);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch user's rooms
  const fetchUserRooms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const rooms = await roomService.getUserRooms();
      setUserRooms(rooms);
      setRooms(prev => {
        // merge public + user rooms (avoid duplicates)
        const map = new Map();
        [...publicRooms, ...rooms].forEach(r => map.set(r._id, r));
        return Array.from(map.values());
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [publicRooms]);

  // Create a new room (only return, let socket handle sync)
  const createRoom = useCallback(async (roomData) => {
    try {
      setLoading(true);
      setError(null);
      const newRoom = await roomService.createRoom(roomData);
      // Don’t push to state here -> backend will emit "room_created"
      return newRoom;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Join a room
  const joinRoom = useCallback(async (roomId) => {
    try {
      setLoading(true);
      setError(null);
      const room = await roomService.joinRoom(roomId);

      setUserRooms(prev => {
        const exists = prev.find(r => r._id === roomId);
        return exists ? prev : [...prev, room];
      });

      setRooms(prev => {
        const exists = prev.find(r => r._id === roomId);
        return exists ? prev : [...prev, room];
      });

      return room;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Leave a room
  const leaveRoom = useCallback(async (roomId) => {
    try {
      setLoading(true);
      setError(null);
      await roomService.leaveRoom(roomId);
      setUserRooms(prev => prev.filter(r => r._id !== roomId));
      setRooms(prev => prev.filter(r => r._id !== roomId));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get room details
  const getRoomDetails = useCallback(async (roomId) => {
    try {
      setError(null);
      return await roomService.getRoomDetails(roomId);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Initialize rooms
  useEffect(() => {
    fetchPublicRooms();
  }, [fetchPublicRooms]);

  useEffect(() => {
    if (publicRooms.length > 0) {
      fetchUserRooms();
    }
  }, [publicRooms, fetchUserRooms]);

  // 🔥 Socket: Listen for new rooms created by anyone
  useEffect(() => {
    if (!socket) return;

    const handleRoomCreated = (room) => {
      setRooms(prev => {
        const exists = prev.find(r => r._id === room._id);
        return exists ? prev : [...prev, room];
      });

      setPublicRooms(prev => {
        const exists = prev.find(r => r._id === room._id);
        return exists ? prev : [...prev, room];
      });
    };

    socket.on('room_created', handleRoomCreated);

    return () => {
      socket.off('room_created', handleRoomCreated);
    };
  }, [socket]);

  return {
    rooms,
    publicRooms,
    userRooms,
    loading,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
    getRoomDetails,
    fetchPublicRooms,
    fetchUserRooms
  };
};
