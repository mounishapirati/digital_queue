import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { isAuthenticated, token } = useAuth();

  useEffect(() => {
    if (isAuthenticated && token) {
      // Create socket connection
      const newSocket = io('http://localhost:5000', {
        auth: {
          token: token
        }
      });

      // Connection events
      newSocket.on('connect', () => {
        console.log('Connected to server');
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
      });

      // Queue events
      newSocket.on('queue-updated', (data) => {
        console.log('Queue updated:', data);
        // You can emit a custom event or use a state management solution
        // to update the UI when queue changes
      });

      newSocket.on('customer-called', (data) => {
        console.log('Customer called:', data);
        toast.success(`Queue number ${data.queueNumber} is being called!`);
      });

      newSocket.on('queue-status-changed', (data) => {
        console.log('Queue status changed:', data);
        const statusMessages = {
          active: 'Queue is now active',
          paused: 'Queue is paused',
          closed: 'Queue is closed'
        };
        toast.info(statusMessages[data.status] || 'Queue status updated');
      });

      // Order events
      newSocket.on('new-order', (data) => {
        console.log('New order received:', data);
        toast.success('New order received!');
      });

      newSocket.on('order-updated', (data) => {
        console.log('Order updated:', data);
        const statusMessages = {
          pending: 'Order is pending',
          preparing: 'Order is being prepared',
          ready: 'Order is ready for pickup!',
          completed: 'Order completed',
          cancelled: 'Order cancelled'
        };
        toast.info(statusMessages[data.order.status] || 'Order status updated');
      });

      newSocket.on('order-ready', (data) => {
        console.log('Order ready:', data);
        toast.success('Your order is ready for pickup!', {
          duration: 10000,
          icon: '🍽️',
        });
      });

      setSocket(newSocket);

      // Cleanup on unmount
      return () => {
        newSocket.close();
      };
    } else {
      // Disconnect if not authenticated
      if (socket) {
        socket.close();
        setSocket(null);
        setIsConnected(false);
      }
    }
  }, [isAuthenticated, token]);

  // Join queue room
  const joinQueue = (queueId) => {
    if (socket && isConnected) {
      socket.emit('join-queue', queueId);
    }
  };

  // Leave queue room
  const leaveQueue = (queueId) => {
    if (socket && isConnected) {
      socket.emit('leave-queue', queueId);
    }
  };

  // Track order
  const trackOrder = (orderId) => {
    if (socket && isConnected) {
      socket.emit('track-order', orderId);
    }
  };

  const value = {
    socket,
    isConnected,
    joinQueue,
    leaveQueue,
    trackOrder,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
