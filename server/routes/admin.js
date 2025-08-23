const express = require('express');
const { body, validationResult } = require('express-validator');
const { requireAdmin } = require('../middleware/auth');
const Order = require('../models/Order');
const XeroxOrder = require('../models/XeroxOrder');
const Queue = require('../models/Queue');
const User = require('../models/User');
const MenuItem = require('../models/MenuItem');

const router = express.Router();

// Apply admin middleware to all routes
router.use(requireAdmin);

// Get admin dashboard statistics
router.get('/dashboard', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get orders statistics
    const totalOrders = await Order.countDocuments();
    const todayOrders = await Order.countDocuments({
      createdAt: { $gte: today }
    });
    const ordersByServiceType = await Order.aggregate([
      { $group: { _id: '$serviceType', count: { $sum: 1 } } }
    ]);
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const totalRevenue = await Order.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    // Get xerox orders statistics
    const totalXeroxOrders = await XeroxOrder.countDocuments();
    const todayXeroxOrders = await XeroxOrder.countDocuments({
      createdAt: { $gte: today }
    });
    const xeroxOrdersByStatus = await XeroxOrder.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const xeroxTotalRevenue = await XeroxOrder.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    // Get queues statistics
    const totalQueues = await Queue.countDocuments();
    const activeQueues = await Queue.countDocuments({ status: 'active' });
    const queuesByServiceType = await Queue.aggregate([
      { $group: { _id: '$serviceType', count: { $sum: 1 } } }
    ]);
    const totalCustomers = await Queue.aggregate([
      { $unwind: '$customers' },
      { $group: { _id: null, count: { $sum: 1 } } }
    ]);

    // Get users statistics
    const totalUsers = await User.countDocuments();
    const students = await User.countDocuments({ role: 'student' });
    const admins = await User.countDocuments({ role: 'admin' });

    const dashboardStats = {
      orders: {
        total: totalOrders,
        today: todayOrders,
        byServiceType: ordersByServiceType.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        byStatus: ordersByStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        totalRevenue: totalRevenue[0]?.total || 0
      },
      xeroxOrders: {
        total: totalXeroxOrders,
        today: todayXeroxOrders,
        byStatus: xeroxOrdersByStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        totalRevenue: xeroxTotalRevenue[0]?.total || 0
      },
      queues: {
        total: totalQueues,
        active: activeQueues,
        byServiceType: queuesByServiceType.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        totalCustomers: totalCustomers[0]?.count || 0
      },
      users: {
        total: totalUsers,
        students,
        admins
      }
    };

    res.json({ dashboardStats });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to get dashboard statistics' });
  }
});

// Menu Management Routes

// Add new menu item
router.post('/menu', [
  body('name').trim().isLength({ min: 2 }),
  body('description').trim().isLength({ min: 10 }),
  body('price').isFloat({ min: 0 }),
  body('category').trim().notEmpty(),
  body('image').optional().isURL(),
  body('available').optional().isBoolean(),
  body('serviceType').isIn(['canteen', 'xerox'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, price, category, image, available = true, serviceType } = req.body;

    const menuItem = new MenuItem({
      name,
      description,
      price,
      category,
      image,
      available,
      serviceType
    });

    await menuItem.save();

    res.status(201).json({
      message: 'Menu item added successfully',
      menuItem
    });
  } catch (error) {
    console.error('Add menu item error:', error);
    res.status(500).json({ error: 'Failed to add menu item' });
  }
});

// Update menu item
router.put('/menu/:itemId', [
  body('name').optional().trim().isLength({ min: 2 }),
  body('description').optional().trim().isLength({ min: 10 }),
  body('price').optional().isFloat({ min: 0 }),
  body('category').optional().trim().notEmpty(),
  body('image').optional().isURL(),
  body('available').optional().isBoolean(),
  body('serviceType').optional().isIn(['canteen', 'xerox'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { itemId } = req.params;
    const updateData = req.body;

    const menuItem = await MenuItem.findByIdAndUpdate(
      itemId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.json({
      message: 'Menu item updated successfully',
      menuItem
    });
  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(500).json({ error: 'Failed to update menu item' });
  }
});

// Delete menu item
router.delete('/menu/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;

    const menuItem = await MenuItem.findByIdAndDelete(itemId);
    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
});

// Queue Management Routes

// Get all queues
router.get('/queues', async (req, res) => {
  try {
    const queues = await Queue.find().populate('customers.userId', 'name email');
    res.json({ queues });
  } catch (error) {
    console.error('Get queues error:', error);
    res.status(500).json({ error: 'Failed to get queues' });
  }
});

// Update queue status
router.put('/queues/:queueId/status', [
  body('status').isIn(['active', 'paused', 'closed'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { queueId } = req.params;
    const { status } = req.body;

    const queue = await Queue.findByIdAndUpdate(
      queueId,
      { status },
      { new: true }
    );

    if (!queue) {
      return res.status(404).json({ error: 'Queue not found' });
    }

    // Notify clients about queue status change
    const io = req.app.get('io');
    io.to(`queue-${queueId}`).emit('queue-status-updated', { queueId, status });

    res.json({
      message: 'Queue status updated successfully',
      queue
    });
  } catch (error) {
    console.error('Update queue status error:', error);
    res.status(500).json({ error: 'Failed to update queue status' });
  }
});

// Call next customer in queue
router.post('/queues/:queueId/call-next', async (req, res) => {
  try {
    const { queueId } = req.params;

    const queue = await Queue.findById(queueId);
    if (!queue) {
      return res.status(404).json({ error: 'Queue not found' });
    }

    const nextCustomer = queue.callNext();
    if (!nextCustomer) {
      return res.status(400).json({ error: 'No customers in queue' });
    }

    await queue.save();

    // Notify the specific customer
    const io = req.app.get('io');
    io.to(`queue-${queueId}`).emit('customer-called', {
      queueId,
      customer: nextCustomer
    });

    res.json({
      message: 'Next customer called',
      customer: nextCustomer
    });
  } catch (error) {
    console.error('Call next customer error:', error);
    res.status(500).json({ error: 'Failed to call next customer' });
  }
});

// Reports Routes

// Get daily reports
router.get('/reports/daily', async (req, res) => {
  try {
    const { serviceType, date } = req.query;
    const reportDate = date ? new Date(date) : new Date();
    reportDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(reportDate);
    nextDay.setDate(nextDay.getDate() + 1);

    let orderQuery = { createdAt: { $gte: reportDate, $lt: nextDay } };
    let xeroxQuery = { createdAt: { $gte: reportDate, $lt: nextDay } };

    if (serviceType) {
      orderQuery.serviceType = serviceType;
    }

    // Get orders for the day
    const dailyOrders = await Order.find(orderQuery)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    // Get xerox orders for the day
    const dailyXeroxOrders = await XeroxOrder.find(xeroxQuery)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    // Calculate revenue
    const orderRevenue = await Order.aggregate([
      { $match: { ...orderQuery, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    const xeroxRevenue = await XeroxOrder.aggregate([
      { $match: { ...xeroxQuery, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    const totalRevenue = (orderRevenue[0]?.total || 0) + (xeroxRevenue[0]?.total || 0);

    res.json({
      date: reportDate.toISOString().split('T')[0],
      orders: dailyOrders,
      xeroxOrders: dailyXeroxOrders,
      totalRevenue,
      orderCount: dailyOrders.length,
      xeroxOrderCount: dailyXeroxOrders.length
    });
  } catch (error) {
    console.error('Daily reports error:', error);
    res.status(500).json({ error: 'Failed to get daily reports' });
  }
});

// User Management Routes

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    
    // Get order counts for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const orderCount = await Order.countDocuments({ userId: user._id });
        const xeroxOrderCount = await XeroxOrder.countDocuments({ userId: user._id });
        
        return {
          ...user.toObject(),
          orderCount,
          xeroxOrderCount
        };
      })
    );

    res.json({ users: usersWithStats });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Update user role
router.put('/users/:userId/role', [
  body('role').isIn(['student', 'admin'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId } = req.params;
    const { role } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User role updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

module.exports = router;
