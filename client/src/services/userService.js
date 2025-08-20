const API_BASE_URL = 'http://localhost:5000/api';

class UserService {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`
    };
  }

  // Get all users
  async getUsers() {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  // Update user online status
  async updateOnlineStatus(online) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/online`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ online })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update online status');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating online status:', error);
      throw error;
    }
  }
}

export default new UserService();

