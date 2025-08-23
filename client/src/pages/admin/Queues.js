import React, { useState, useEffect } from 'react';
import { Clock, Users, Play, Pause, Square, UserCheck } from 'lucide-react';

const AdminQueues = () => {
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQueues();
  }, []);

  const fetchQueues = async () => {
    try {
      const response = await fetch('/api/admin/queues', {
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

  const updateQueueStatus = async (queueId, status) => {
    try {
      const response = await fetch(`/api/admin/queues/${queueId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        fetchQueues();
      }
    } catch (error) {
      console.error('Failed to update queue status:', error);
    }
  };

  const callNextCustomer = async (queueId) => {
    try {
      const response = await fetch(`/api/admin/queues/${queueId}/call-next`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        fetchQueues();
      }
    } catch (error) {
      console.error('Failed to call next customer:', error);
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Manage Queues</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {queues.map((queue) => (
            <div key={queue.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">{queue.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  queue.status === 'active' ? 'bg-green-100 text-green-800' : 
                  queue.status === 'paused' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                }`}>
                  {queue.status.charAt(0).toUpperCase() + queue.status.slice(1)}
                </span>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  {queue.customers?.length || 0} people waiting
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  Current: #{queue.currentNumber || 0}
                </div>
                <div className="text-sm text-gray-600">
                  Service: {queue.serviceType === 'canteen' ? 'Canteen' : 'Xerox'}
                </div>
              </div>

              {/* Queue Controls */}
              <div className="space-y-2">
                <div className="flex space-x-2">
                  {queue.status === 'active' ? (
                    <button
                      onClick={() => updateQueueStatus(queue.id, 'paused')}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-yellow-300 text-sm font-medium rounded-md text-yellow-700 bg-white hover:bg-yellow-50"
                    >
                      <Pause className="h-4 w-4 mr-2" />
                      Pause
                    </button>
                  ) : (
                    <button
                      onClick={() => updateQueueStatus(queue.id, 'active')}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-green-300 text-sm font-medium rounded-md text-green-700 bg-white hover:bg-green-50"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start
                    </button>
                  )}
                  
                  <button
                    onClick={() => updateQueueStatus(queue.id, 'closed')}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                  >
                    <Square className="h-4 w-4 mr-2" />
                    Close
                  </button>
                </div>

                {queue.status === 'active' && queue.customers && queue.customers.length > 0 && (
                  <button
                    onClick={() => callNextCustomer(queue.id)}
                    className="w-full inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    Call Next Customer
                  </button>
                )}
              </div>

              {/* Current Customers */}
              {queue.customers && queue.customers.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Current Queue:</h4>
                  <div className="space-y-1">
                    {queue.customers.slice(0, 3).map((customer, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          {index + 1}. {customer.userId?.name || 'Unknown'}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          customer.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {customer.status}
                        </span>
                      </div>
                    ))}
                    {queue.customers.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{queue.customers.length - 3} more customers
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {queues.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">No queues available</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminQueues;
