const API_BASE_URL = 'http://localhost:5000/api';

class RoomService {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`
    };
  }

  // Get all public rooms
  async getPublicRooms() {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/public`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch public rooms');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching public rooms:', error);
      throw error;
    }
  }

  // Get user's rooms
  async getUserRooms() {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/user`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user rooms');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching user rooms:', error);
      throw error;
    }
  }

  // Create a new room
  async createRoom(roomData) {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(roomData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create room');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  }

  // Join a room
  async joinRoom(roomId) {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/join`, {
        method: 'POST',
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to join room');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error joining room:', error);
      throw error;
    }
  }

  // Leave a room
  async leaveRoom(roomId) {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/leave`, {
        method: 'POST',
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to leave room');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error leaving room:', error);
      throw error;
    }
  }

  // Get room details
  async getRoomDetails(roomId) {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/${roomId}`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch room details');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching room details:', error);
      throw error;
    }
  }
}

export default new RoomService();

