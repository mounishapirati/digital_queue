import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Clock, Users, MapPin, Play, Pause, Square, UserCheck, UserX } from 'lucide-react';

const Queue = () => {
  const { user } = useAuth();
  const [queues, setQueues] = useState([]);
  const [activeQueues, setActiveQueues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQueues();
    fetchActiveQueues();
  }, []);

  const fetchQueues = async () => {
    try {
      const response = await fetch('/api/queue', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setQueues(data.queues || []);
    } catch (error) {
      console.error('Failed to fetch queues:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveQueues = async () => {
    try {
      const response = await fetch('/api/queue/user/active', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setActiveQueues(data.activeQueues || []);
    } catch (error) {
      console.error('Failed to fetch active queues:', error);
    }
  };

  const joinQueue = async (queueId) => {
    try {
      const response = await fetch(`/api/queue/${queueId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        await fetchActiveQueues();
        await fetchQueues();
      }
    } catch (error) {
      console.error('Failed to join queue:', error);
    }
  };

  const leaveQueue = async (queueId) => {
    try {
      const response = await fetch(`/api/queue/${queueId}/leave`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        await fetchActiveQueues();
        await fetchQueues();
      }
    } catch (error) {
      console.error('Failed to leave queue:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-gray-600">Loading queues...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Queue Management</h1>
          <p className="mt-2 text-gray-600">Join and manage your place in digital queues</p>
        </div>

        {/* Active Queues */}
        {activeQueues.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Active Queues</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeQueues.map((queue) => (
                <div key={queue.queueId} className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">{queue.queueName}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      queue.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {queue.status === 'waiting' ? 'Waiting' : 'Called'}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      Position: {queue.position}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      Est. Wait: {queue.estimatedWaitTime} min
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      {queue.serviceType === 'canteen' ? 'Canteen Service' : 'Xerox Service'}
                    </div>
                  </div>

                  <button
                    onClick={() => leaveQueue(queue.queueId)}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <UserX className="h-4 w-4 mr-2" />
                    Leave Queue
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available Queues */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Queues</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {queues.map((queue) => {
              const isInQueue = activeQueues.some(aq => aq.queueId === queue.id);
              
              return (
                <div key={queue.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">{queue.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      queue.status === 'active' ? 'bg-green-100 text-green-800' : 
                      queue.status === 'paused' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {queue.status === 'active' ? 'Active' : queue.status === 'paused' ? 'Paused' : 'Closed'}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      {queue.customerCount} people waiting
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      Est. wait: {queue.estimatedWaitTime || 'Unknown'} min
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      {queue.serviceType === 'canteen' ? 'Canteen Service' : 'Xerox Service'}
                    </div>
                  </div>

                  {isInQueue ? (
                    <button
                      disabled
                      className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-400 bg-gray-100 cursor-not-allowed"
                    >
                      <UserCheck className="h-4 w-4 mr-2" />
                      Already in Queue
                    </button>
                  ) : (
                    <button
                      onClick={() => joinQueue(queue.id)}
                      disabled={queue.status !== 'active'}
                      className={`w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md ${
                        queue.status === 'active'
                          ? 'text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                          : 'text-gray-400 bg-gray-100 cursor-not-allowed'
                      }`}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {queue.status === 'active' ? 'Join Queue' : 'Queue Closed'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {queues.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">No queues available at the moment.</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Queue;
