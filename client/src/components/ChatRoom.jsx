import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

const ChatRoom = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [currentRoom, setCurrentRoom] = useState('general');
  const [rooms, setRooms] = useState(['general']);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const { socket, connected, sendMessage, sendTyping, joinRoom, leaveRoom, markMessageRead, addReaction } = useSocket();
  const { user, logout } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    // Listen for new messages
    socket.on('receive_message', (message) => {
      setMessages(prev => [...prev, message]);
      if (message.sender._id !== user?.id) {
        setUnreadCount(prev => prev + 1);
        playNotificationSound();
        showBrowserNotification('New message', `${message.sender.username}: ${message.content}`);
      }
    });

    // Listen for private messages
    socket.on('private_message', (message) => {
      setMessages(prev => [...prev, message]);
      if (message.sender._id !== user?.id) {
        setUnreadCount(prev => prev + 1);
        playNotificationSound();
        showBrowserNotification('Private message', `${message.sender.username}: ${message.content}`);
      }
    });

    // Listen for typing indicators
    socket.on('typing', (data) => {
      if (data.isTyping) {
        setTypingUsers(prev => [...prev.filter(u => u !== data.username), data.username]);
      } else {
        setTypingUsers(prev => prev.filter(u => u !== data.username));
      }
    });

    // Listen for user online/offline
    socket.on('user_online', (userData) => {
      setOnlineUsers(prev => [...prev.filter(u => u.userId !== userData.userId), userData]);
    });

    socket.on('user_offline', (userData) => {
      setOnlineUsers(prev => prev.filter(u => u.userId !== userData.userId));
    });

    // Listen for room events
    socket.on('room_joined', (roomName) => {
      setCurrentRoom(roomName);
      if (!rooms.includes(roomName)) {
        setRooms(prev => [...prev, roomName]);
      }
    });

    socket.on('user_joined_room', (data) => {
      showBrowserNotification('User joined', `${data.username} joined ${data.room}`);
    });

    socket.on('user_left_room', (data) => {
      showBrowserNotification('User left', `${data.username} left ${data.room}`);
    });

    // Listen for message reactions
    socket.on('message_reaction', (data) => {
      setMessages(prev => prev.map(msg => 
        msg._id === data.messageId 
          ? { ...msg, reactions: { ...msg.reactions, [data.reaction]: [...(msg.reactions?.[data.reaction] || []), data.userId] } }
          : msg
      ));
    });

    // Listen for read receipts
    socket.on('message_read', (data) => {
      setMessages(prev => prev.map(msg => 
        msg._id === data.messageId 
          ? { ...msg, read: true, readAt: data.readAt }
          : msg
      ));
    });

    // Listen for notifications
    socket.on('new_message_notification', (notification) => {
      setNotifications(prev => [...prev, { ...notification, id: Date.now() }]);
    });

    return () => {
      socket.off('receive_message');
      socket.off('private_message');
      socket.off('typing');
      socket.off('user_online');
      socket.off('user_offline');
      socket.off('room_joined');
      socket.off('user_joined_room');
      socket.off('user_left_room');
      socket.off('message_reaction');
      socket.off('message_read');
      socket.off('new_message_notification');
    };
  }, [socket, user]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !connected) return;

    const messageData = {
      content: newMessage,
      room: currentRoom,
      timestamp: new Date().toISOString(),
    };

    sendMessage(messageData);
    setNewMessage('');
    sendTyping({ room: currentRoom, isTyping: false });
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    sendTyping({ room: currentRoom, isTyping: e.target.value.length > 0 });
  };

  const handleRoomChange = (roomName) => {
    if (currentRoom !== roomName) {
      leaveRoom(currentRoom);
      joinRoom(roomName);
      setCurrentRoom(roomName);
      setMessages([]); // Clear messages for new room
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In a real app, you'd upload to a file service
      const fileUrl = URL.createObjectURL(file);
      const messageData = {
        content: `File: ${file.name}`,
        room: currentRoom,
        messageType: 'file',
        fileUrl,
        fileName: file.name,
        fileSize: file.size,
      };
      sendMessage(messageData);
    }
  };

  const handleReaction = (messageId, reaction) => {
    addReaction(messageId, reaction);
  };

  const playNotificationSound = () => {
    // Create and play a simple notification sound
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
    audio.play().catch(() => {}); // Ignore errors
  };

  const showBrowserNotification = (title, body) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  };

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        {/* User Info */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{user?.username}</h3>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-600">
                  {connected ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
            <button
              onClick={logout}
              className="text-sm text-red-600 hover:text-red-800 px-2 py-1 rounded"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Rooms */}
        <div className="p-4">
          <h4 className="font-medium mb-2">Rooms</h4>
          <div className="space-y-1">
            {rooms.map(room => (
              <button
                key={room}
                onClick={() => handleRoomChange(room)}
                className={`w-full text-left px-3 py-2 rounded text-sm ${
                  currentRoom === room ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                }`}
              >
                #{room}
              </button>
            ))}
          </div>
        </div>

        {/* Online Users */}
        <div className="p-4 border-t">
          <h4 className="font-medium mb-2">Online Users ({onlineUsers.length})</h4>
          <div className="space-y-1">
            {onlineUsers.map(user => (
              <div key={user.userId} className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>{user.username}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">#{currentRoom}</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-600">
                  {connected ? 'Online' : 'Offline'}
                </span>
              </div>
              {unreadCount > 0 && (
                <div className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {unreadCount}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.sender._id === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender._id === user?.id
                    ? 'bg-blue-400 text-white'
                    : 'bg-white text-gray-900'
                }`}
              >
                <div className="text-sm font-medium mb-1">
                  {message.sender._id === user?.id ? "You" : message.sender.username}
                </div>
                
                {message.messageType === 'file' ? (
                  <div className="text-sm">
                    <a 
                      href={message.fileUrl} 
                      download={message.fileName}
                      className="underline hover:no-underline"
                    >
                      📎 {message.fileName}
                    </a>
                  </div>
                ) : (
                  <div className="text-sm">{message.content}</div>
                )}
                
                <div className={`text-xs mt-1 ${
                  message.sender._id === user?.id ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {new Date(message.createdAt).toLocaleTimeString()}
                  {message.read && <span className="ml-2">✓✓</span>}
                </div>

                {/* Reactions */}
                {message.reactions && Object.keys(message.reactions).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {Object.entries(message.reactions).map(([reaction, users]) => (
                      <button
                        key={reaction}
                        onClick={() => handleReaction(message._id, reaction)}
                        className="bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded text-xs"
                      >
                        {reaction} {users.length}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {typingUsers.length > 0 && (
            <div className="text-sm text-gray-500 italic">
              {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="bg-white border-t px-6 py-4">
          <form onSubmit={handleSendMessage} className="flex space-x-4">
            <div className="flex-1 flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={handleTyping}
                placeholder="Type a message..."
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!connected}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-2 text-gray-600 hover:text-gray-800"
                disabled={!connected}
              >
                📎
              </button>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
            <button
              type="submit"
              disabled={!connected || !newMessage.trim()}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
