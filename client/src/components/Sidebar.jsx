import {  useAuth  } from "../context/AuthContext";
import { useRooms } from "../hooks/useRooms";
import { useState, useEffect  }  from "react"; 
import CreateRoomModal from "./CreateRoomModal";
const Sidebar = ({ currentRoom, onRoomChange, onlineUsers }) => {
  const { user, logout } = useAuth();
  const {
    rooms,
    loading: roomsLoading,
    error: roomsError,
    createRoom,
  } = useRooms();
  const [showCreateRoom, setShowCreateRoom] = useState(false);

  const handleCreateRoom = async (roomData) => {
    try {
      await createRoom(roomData);
      setShowCreateRoom(false);
    } catch (error) {
      console.error("Failed to create room:", error);
    }
  };

  console.log("onlineUsers :", onlineUsers)

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col">
      {/* User Info */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">{user?.username}</h3>
            <p className="text-sm text-gray-600">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="text-sm text-red-600 hover:text-red-800 px-2 py-1 rounded hover:bg-red-50"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Rooms */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-900">Rooms</h4>
            <button
              onClick={() => setShowCreateRoom(true)}
              className="text-sm text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50"
            >
              + New
            </button>
          </div>

          {roomsLoading && <div className="text-sm text-gray-500">Loading rooms...</div>}
          {roomsError && <div className="text-sm text-red-500">Error: {roomsError}</div>}

          <div className="space-y-1">
            {rooms.map((room) => (
              <button
                key={room._id || room}
                onClick={() => onRoomChange(room._id || room)}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                  currentRoom === (room._id || room)
                    ? "bg-blue-100 text-blue-700"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>#{room.name || room}</span>
                  {room.type === "private" && (
                    <span className="text-xs text-gray-500">🔒</span>
                  )}
                </div>
                {room.description && (
                  <div className="text-xs text-gray-500 truncate">
                    {room.description}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Online Users */}
        <div className="p-4 border-t">
          <h4 className="font-medium text-gray-900 mb-2">
            Online Users ({onlineUsers.length})
          </h4>
          <div className="space-y-1">
            {onlineUsers.map((user) => (
              <div key={user.userId} className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-gray-700">{user.username}</span>
              </div>
            ))}
            {onlineUsers.length === 0 && (
              <div className="text-sm text-gray-500">No users online</div>
            )}
          </div>
        </div>
      </div>

      {/* Create Room Modal */}
      {showCreateRoom && (
        <CreateRoomModal
          onClose={() => setShowCreateRoom(false)}
          onCreate={handleCreateRoom}
        />
      )}
    </div>
  );
};

export default Sidebar;