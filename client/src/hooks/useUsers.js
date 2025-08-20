import { useState, useEffect, useCallback } from "react";
import { useSocket } from "../context/SocketContext";
import userService from "../services/userService";

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { socket } = useSocket();

  // Fetch all users
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const users = await userService.getUsers();
      setUsers(users);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Add online user
  const addOnlineUser = useCallback((userData) => {
    setOnlineUsers((prev) => {
      const exists = prev.find((u) => u.userId === userData.userId);
      return exists ? prev : [...prev, userData];
    });
  }, []);

  // Remove offline user
  const removeOfflineUser = useCallback((userData) => {
    setOnlineUsers((prev) =>
      prev.filter((u) => u.userId !== userData.userId)
    );
  }, []);

  // Replace list (when server sends "online_users" on join)
  const setOnlineUsersList = useCallback((usersList) => {
    setOnlineUsers(usersList);
  }, []);

  // Hook into socket events
  useEffect(() => {
    if (!socket) return;

    socket.on("user_online", addOnlineUser);
    socket.on("user_offline", removeOfflineUser);
    socket.on("online_users", setOnlineUsersList);

    return () => {
      socket.off("user_online", addOnlineUser);
      socket.off("user_offline", removeOfflineUser);
      socket.off("online_users", setOnlineUsersList);
    };
  }, [socket, addOnlineUser, removeOfflineUser, setOnlineUsersList]);

  // Fetch all users once on mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    onlineUsers,
    loading,
    error,
    fetchUsers,
  };
};
