import { useSocket } from '../context/SocketContext';

const MessageItem = ({ message, isOwnMessage }) => {
  const { addReaction } = useSocket();

  const handleReaction = (reaction) => {
    addReaction(message._id, reaction);
  };

  const renderMessageContent = () => {
    if (message.messageType === 'file') {
      return (
        <div className="text-sm">
          <a 
            href={message.fileUrl} 
            download={message.fileName}
            className="underline hover:no-underline flex items-center space-x-2"
          >
            <span>📎</span>
            <span>{message.fileName}</span>
          </a>
          {message.fileSize && (
            <div className="text-xs text-gray-500 mt-1">
              {(message.fileSize / 1024).toFixed(1)} KB
            </div>
          )}
        </div>
      );
    }

    return <div className="text-sm">{message.content}</div>;
  };

  const renderReactions = () => {
    if (!message.reactions || Object.keys(message.reactions).length === 0) {
      return null;
    }

    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {Object.entries(message.reactions).map(([reaction, users]) => (
          <button
            key={reaction}
            onClick={() => handleReaction(reaction)}
            className="bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded text-xs transition-colors"
          >
            {reaction} {users.length}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isOwnMessage
            ? 'bg-blue-400 text-white'
            : 'bg-white text-gray-900'
        }`}
      >
        <div className="text-sm font-medium mb-1">
          {isOwnMessage ? "You" : message.sender.username}
        </div>
        
        {renderMessageContent()}
        
        <div className={`text-xs mt-1 ${
          isOwnMessage ? 'text-blue-100' : 'text-gray-500'
        }`}>
          {new Date(message.createdAt).toLocaleTimeString()}
          {message.read && <span className="ml-2">✓✓</span>}
        </div>

        {renderReactions()}

        {/* Reaction buttons */}
        <div className="flex space-x-1 mt-2">
          {['👍', '❤️', '😂', '😮', '😢', '😡'].map((reaction) => (
            <button
              key={reaction}
              onClick={() => handleReaction(reaction)}
              className="text-xs hover:bg-gray-200 rounded px-1 py-0.5 transition-colors"
            >
              {reaction}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;

