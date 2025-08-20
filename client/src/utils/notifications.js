class NotificationManager {
  constructor() {
    this.hasPermission = false;
    this.init();
  }

  init() {
    if ('Notification' in window) {
      this.hasPermission = Notification.permission === 'granted';
    }
  }

  async requestPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      this.hasPermission = permission === 'granted';
      return this.hasPermission;
    }
    return this.hasPermission;
  }

  showNotification(title, body, options = {}) {
    if (this.hasPermission) {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      });
    }
  }

  playNotificationSound() {
    try {
      // Create a simple notification sound using Web Audio API
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      console.warn('Could not play notification sound:', error);
    }
  }

  showMessageNotification(sender, message) {
    this.showNotification(
      `New message from ${sender}`,
      message.length > 50 ? `${message.substring(0, 50)}...` : message
    );
    this.playNotificationSound();
  }

  showUserJoinedNotification(username, room) {
    this.showNotification(
      'User joined room',
      `${username} joined ${room}`
    );
  }

  showUserLeftNotification(username, room) {
    this.showNotification(
      'User left room',
      `${username} left ${room}`
    );
  }
}

export default new NotificationManager();

