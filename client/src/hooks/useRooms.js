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
      // Merge public + user rooms (avoid duplicates)
      const map = new Map();
      [...publicRooms, ...rooms].forEach(r => map.set(r._id, r));
      setRooms(Array.from(map.values()));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [publicRooms]);

  // Create a new room -> don’t update state here, rely on socket broadcast
  const createRoom = useCallback(async (roomData) => {
    try {
      setLoading(true);
      setError(null);
      return await roomService.createRoom(roomData);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Join a room -> just tell backend, let socket broadcast update state
  const joinRoom = useCallback(async (roomId) => {
    try {
      setLoading(true);
      setError(null);
      return await roomService.joinRoom(roomId);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Leave a room -> just tell backend, let socket broadcast update state
  const leaveRoom = useCallback(async (roomId) => {
    try {
      setLoading(true);
      setError(null);
      await roomService.leaveRoom(roomId);
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

  // 🔥 Socket events
  useEffect(() => {
    if (!socket) return;

    const handleRoomCreated = (room) => {
      setRooms(prev => prev.find(r => r._id === room._id) ? prev : [...prev, room]);
      setPublicRooms(prev => prev.find(r => r._id === room._id) ? prev : [...prev, room]);
    };

    const handleRoomJoined = ({ roomId, user }) => {
      setRooms(prev =>
        prev.map(r =>
          r._id === roomId
            ? { ...r, participants: [...(r.participants || []), user] }
            : r
        )
      );
    };

    const handleRoomLeft = ({ roomId, user }) => {
      setRooms(prev =>
        prev.map(r =>
          r._id === roomId
            ? {
                ...r,
                participants: (r.participants || []).filter(u => u._id !== user._id)
              }
            : r
        )
      );
    };

    socket.on('room_created', handleRoomCreated);
    socket.on('room_joined', handleRoomJoined);
    socket.on('room_left', handleRoomLeft);

    return () => {
      socket.off('room_created', handleRoomCreated);
      socket.off('room_joined', handleRoomJoined);
      socket.off('room_left', handleRoomLeft);
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
