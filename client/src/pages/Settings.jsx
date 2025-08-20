import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const [notifications, setNotifications] = useState(true);
  const [sound, setSound] = useState(true);

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold mb-4">Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Notifications</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
              />
              <span className="slider round"></span>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Sound</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={sound}
                onChange={(e) => setSound(e.target.checked)}
              />
              <span className="slider round"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;