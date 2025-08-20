import { useSocket } from '../context/SocketContext';

const ChatHeader = ({ currentRoom, unreadCount }) => {
  const { connected } = useSocket();

  return (
    <div className="bg-white shadow-sm border-b px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h1 className="text-xl font-semibold text-gray-900">
            #{currentRoom}
          </h1>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600">
              {connected ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {unreadCount > 0 && (
            <div className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
              {unreadCount}
            </div>
          )}
          
          <div className="text-sm text-gray-600">
            {connected ? 'Connected' : 'Disconnected'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
