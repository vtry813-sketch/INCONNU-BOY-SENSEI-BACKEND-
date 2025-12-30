import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Socket Configuration
const SOCKET_URL = process.env.SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  // Connect to socket server
  connect = async () => {
    const token = await AsyncStorage.getItem('token');
    
    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      auth: {
        token: token,
      },
    });

    this.setupEventListeners();
  };

  // Setup event listeners
  setupEventListeners = () => {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
      this.emitEvent('connection', { connected: true });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.emitEvent('connection', { connected: false });
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.emitEvent('connection_error', error);
    });

    this.socket.on('server-status', (data) => {
      this.emitEvent('server-status', data);
    });

    this.socket.on('log', (data) => {
      this.emitEvent('log', data);
    });

    this.socket.on('notification', (data) => {
      this.emitEvent('notification', data);
    });
  };

  // Join server room
  joinServerRoom = (serverId) => {
    if (this.socket && this.socket.connected) {
      this.socket.emit('join-server', serverId);
    }
  };

  // Leave server room
  leaveServerRoom = (serverId) => {
    if (this.socket && this.socket.connected) {
      this.socket.emit('leave-server', serverId);
    }
  };

  // Send command to server
  sendCommand = (serverId, command) => {
    if (this.socket && this.socket.connected) {
      this.socket.emit('server-command', { serverId, command });
    }
  };

  // Update server status
  updateServerStatus = (data) => {
    if (this.socket && this.socket.connected) {
      this.socket.emit('server-status', data);
    }
  };

  // Add event listener
  addListener = (event, callback) => {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  };

  // Remove event listener
  removeListener = (event, callback) => {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  };

  // Emit event to listeners
  emitEvent = (event, data) => {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((callback) => {
        callback(data);
      });
    }
  };

  // Disconnect socket
  disconnect = () => {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
    }
  };

  // Check if connected
  isConnected = () => {
    return this.socket && this.socket.connected;
  };
}

// Create singleton instance
const socketService = new SocketService();

export const initSocket = async () => {
  await socketService.connect();
  return socketService;
};

export default socketService;
