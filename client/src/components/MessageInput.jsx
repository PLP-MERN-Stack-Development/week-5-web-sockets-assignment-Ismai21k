import { useState, useRef } from 'react';
import { useSocket } from '../context/SocketContext';

const MessageInput = ({ currentRoom, onSendMessage, disabled }) => {
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const fileInputRef = useRef(null);
  const { sendTyping } = useSocket();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || disabled) return;

    onSendMessage({
      content: newMessage,
      room: currentRoom,
      timestamp: new Date().toISOString(),
    });
    
    setNewMessage('');
    setIsTyping(false);
    sendTyping({ room: currentRoom, isTyping: false });
  };

  const handleTyping = (e) => {
    const value = e.target.value;
    setNewMessage(value);
    
    const typing = value.length > 0;
    if (typing !== isTyping) {
      setIsTyping(typing);
      sendTyping({ room: currentRoom, isTyping: typing });
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In a real app, you'd upload to a file service
      const fileUrl = URL.createObjectURL(file);
      onSendMessage({
        content: `File: ${file.name}`,
        room: currentRoom,
        messageType: 'file',
        fileUrl,
        fileName: file.name,
        fileSize: file.size,
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="bg-white border-t px-6 py-4">
      <form onSubmit={handleSubmit} className="flex space-x-4">
        <div className="flex-1 flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={disabled}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={disabled}
            title="Attach file"
          >
            📎
          </button>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
        </div>
        <button
          type="submit"
          disabled={disabled || !newMessage.trim()}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default MessageInput;

