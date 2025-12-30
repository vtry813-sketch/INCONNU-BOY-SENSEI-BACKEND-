import { useState, useEffect, useCallback } from 'react';
import socketService from '../services/socket';

export const useSocket = () => {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Initialize socket connection
    const initSocket = async () => {
      try {
        await socketService.connect();
        setConnected(true);
      } catch (error) {
        setError(error.message);
        setConnected(false);
      }
    };

    initSocket();

    // Cleanup on unmount
    return () => {
      socketService.disconnect();
    };
  }, []);

  const joinServerRoom = useCallback((serverId) => {
    if (socketService.isConnected()) {
      socketService.joinServerRoom(serverId);
    }
  }, []);

  const leaveServerRoom = useCallback((serverId) => {
    if (socketService.isConnected()) {
      socketService.leaveServerRoom(serverId);
    }
  }, []);

  const sendCommand = useCallback((serverId, command) => {
    if (socketService.isConnected()) {
      socketService.sendCommand(serverId, command);
    }
  }, []);

  const addListener = useCallback((event, callback) => {
    socketService.addListener(event, callback);
    
    // Return cleanup function
    return () => {
      socketService.removeListener(event, callback);
    };
  }, []);

  const removeListener = useCallback((event, callback) => {
    socketService.removeListener(event, callback);
  }, []);

  return {
    connected,
    error,
    joinServerRoom,
    leaveServerRoom,
    sendCommand,
    addListener,
    removeListener,
    isConnected: socketService.isConnected,
  };
};
