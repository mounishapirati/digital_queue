const express = require('express');
const Queue = require('../models/Queue');
const User = require('../models/User');

const router = express.Router();

// Get all available queues
router.get('/', async (req, res) => {
  try {
    const queues = await Queue.find({ status: { $ne: 'closed' } }).select('-customers');
    
    const queueList = queues.map(queue => ({
      id: queue._id,
      name: queue.name,
      serviceType: queue.serviceType,
      currentNumber: queue.currentNumber,
      customerCount: queue.queueLength,
      status: queue.status,
      estimatedWaitTime: queue.currentWaitTime
    }));

    res.json({ queues: queueList });
  } catch (error) {
    console.error('Get queues error:', error);
    res.status(500).json({ error: 'Failed to get queues' });
  }
});

// Get specific queue details
router.get('/:queueId', async (req, res) => {
  try {
    const { queueId } = req.params;
    const queue = await Queue.findById(queueId);

    if (!queue) {
      return res.status(404).json({ error: 'Queue not found' });
    }

    res.json({ queue });
  } catch (error) {
    console.error('Get queue error:', error);
    res.status(500).json({ error: 'Failed to get queue' });
  }
});

// Join a queue
router.post('/:queueId/join', async (req, res) => {
  try {
    const { queueId } = req.params;
    const { userId } = req.user;
    
    const queue = await Queue.findById(queueId);
    if (!queue) {
      return res.status(404).json({ error: 'Queue not found' });
    }

    if (queue.status !== 'active') {
      return res.status(400).json({ error: 'Queue is not active' });
    }

    // Check if user is already in this queue
    const existingCustomer = queue.customers.find(customer => 
      customer.userId.toString() === userId
    );
    if (existingCustomer) {
      return res.status(400).json({ error: 'Already in queue' });
    }

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Add customer to queue
    const position = queue.addCustomer(userId, user.name);
    await queue.save();

    // Update user's queue history
    user.queueHistory.push({
      queueId: queue._id,
      joinedAt: new Date(),
      position
    });
    await user.save();

    // Notify all clients in this queue
    const io = req.app.get('io');
    io.to(`queue-${queueId}`).emit('queue-updated', {
      queueId,
      customers: queue.customers,
      currentNumber: queue.currentNumber
    });

    res.json({
      message: 'Successfully joined queue',
      position,
      estimatedWaitTime: queue.currentWaitTime
    });

  } catch (error) {
    console.error('Join queue error:', error);
    res.status(500).json({ error: 'Failed to join queue' });
  }
});

// Leave a queue
router.post('/:queueId/leave', async (req, res) => {
  try {
    const { queueId } = req.params;
    const { userId } = req.user;
    
    const queue = await Queue.findById(queueId);
    if (!queue) {
      return res.status(404).json({ error: 'Queue not found' });
    }

    // Remove customer from queue
    queue.removeCustomer(userId);
    await queue.save();

    // Update user's queue history
    const user = await User.findById(userId);
    if (user) {
      const queueHistory = user.queueHistory.find(h => 
        h.queueId.toString() === queueId
      );
      if (queueHistory) {
        queueHistory.leftAt = new Date();
        await user.save();
      }
    }

    // Notify all clients in this queue
    const io = req.app.get('io');
    io.to(`queue-${queueId}`).emit('queue-updated', {
      queueId,
      customers: queue.customers,
      currentNumber: queue.currentNumber
    });

    res.json({ message: 'Successfully left queue' });

  } catch (error) {
    console.error('Leave queue error:', error);
    res.status(500).json({ error: 'Failed to leave queue' });
  }
});

// Get user's queue position
router.get('/:queueId/position', async (req, res) => {
  try {
    const { queueId } = req.params;
    const { userId } = req.user;
    
    const queue = await Queue.findById(queueId);
    if (!queue) {
      return res.status(404).json({ error: 'Queue not found' });
    }

    const customer = queue.customers.find(c => 
      c.userId.toString() === userId
    );

    if (!customer) {
      return res.status(404).json({ error: 'Not in queue' });
    }

    res.json({
      position: customer.position,
      status: customer.status,
      estimatedWaitTime: queue.currentWaitTime
    });

  } catch (error) {
    console.error('Get position error:', error);
    res.status(500).json({ error: 'Failed to get position' });
  }
});

// Get user's active queues
router.get('/user/active', async (req, res) => {
  try {
    const { userId } = req.user;
    
    const queues = await Queue.find({
      'customers.userId': userId,
      'customers.status': { $in: ['waiting', 'called'] }
    });

    const activeQueues = queues.map(queue => {
      const customer = queue.customers.find(c => 
        c.userId.toString() === userId
      );
      return {
        queueId: queue._id,
        queueName: queue.name,
        serviceType: queue.serviceType,
        position: customer.position,
        status: customer.status,
        estimatedWaitTime: queue.currentWaitTime
      };
    });

    res.json({ activeQueues });

  } catch (error) {
    console.error('Get active queues error:', error);
    res.status(500).json({ error: 'Failed to get active queues' });
  }
});

module.exports = router;
