const API_BASE_URL = 'http://localhost:5000/api';

class MessageService {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`
    };
  }

  // Get messages for a room or between users
  async getMessages(room, userId) {
    try {
      const params = new URLSearchParams();
      if (room) params.append('room', room);
      if (userId) params.append('userId', userId);

      const response = await fetch(`${API_BASE_URL}/messages?${params}`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  // Send a message
  async sendMessage(messageData) {
    try {
      const response = await fetch(`${API_BASE_URL}/messages`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(messageData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send message');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Mark message as read
  async markAsRead(messageId) {
    try {
      const response = await fetch(`${API_BASE_URL}/messages/read`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ messageId })
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark message as read');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  }
}

export default new MessageService();

