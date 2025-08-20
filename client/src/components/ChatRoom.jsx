import { useState, useEffect } from "react";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";

import Sidebar from "./Sidebar";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { useUsers } from "../hooks/useUsers";

const ChatRoom = () => {
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [currentRoom, setCurrentRoom] = useState("general");
  const [unreadCount, setUnreadCount] = useState(0);

  const { socket, connected, sendMessage, sendTyping, joinRoom, leaveRoom } =
    useSocket();
  const { user } = useAuth();
  const { onlineUsers } = useUsers(); // centralized from hook ✅

  // --- SOCKET EVENT HANDLERS ---
  useEffect(() => {
    if (!socket) return;

    socket.on("receive_message", (message) => {
      setMessages((prev) => [...prev, message]);
      if (message.sender._id !== user?.id) {
        setUnreadCount((prev) => prev + 1);
      }
    });

    socket.on("typing", (data) => {
      if (data.isTyping) {
        setTypingUsers((prev) => [
          ...prev.filter((u) => u !== data.username),
          data.username,
        ]);
      } else {
        setTypingUsers((prev) => prev.filter((u) => u !== data.username));
      }
    });

    socket.on("room_joined", (roomName) => {
      setCurrentRoom(roomName);
      setMessages([]); // reset when entering new room
    });

    return () => {
      socket.off("receive_message");
      socket.off("typing");
      socket.off("room_joined");
    };
  }, [socket, user]);

  // --- ROOM SWITCHING ---
  const handleRoomChange = (roomName) => {
    if (currentRoom !== roomName) {
      leaveRoom(currentRoom);
      joinRoom(roomName);
      setCurrentRoom(roomName);
      setMessages([]);
    }
  };

  // --- MESSAGE SEND ---
  const handleSendMessage = (msg) => {
    sendMessage(msg);
    setUnreadCount(0); // reset on send
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar
        currentRoom={currentRoom}
        onRoomChange={handleRoomChange}
        onlineUsers={onlineUsers} // pass down from hook ✅
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <ChatHeader currentRoom={currentRoom} unreadCount={unreadCount} />

        {/* Messages */}
        <MessageList messages={messages} typingUsers={typingUsers} />

        {/* Input */}
        <MessageInput
          currentRoom={currentRoom}
          onSendMessage={handleSendMessage}
          disabled={!connected}
        />
      </div>
    </div>
  );
};

export default ChatRoom;
