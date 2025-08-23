const express = require('express');
const { body, validationResult } = require('express-validator');
const QRCode = require('qrcode');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const User = require('../models/User');

const router = express.Router();

// Place a new order
router.post('/', [
  body('items').isArray({ min: 1 }),
  body('items.*.itemId').notEmpty(),
  body('items.*.quantity').isInt({ min: 1 }),
  body('paymentMethod').isIn(['online', 'offline']),
  body('specialInstructions').optional().isString(),
  body('serviceType').isIn(['canteen', 'xerox'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Debug logging
    console.log('Order request body:', req.body);
    console.log('User from token:', req.user);
    console.log('User ID:', req.user?.id);

    const { items, paymentMethod, specialInstructions, serviceType } = req.body;
    const userId = req.user.id; // Changed from req.user.userId to req.user.id

    // Validate menu items and calculate total
    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.itemId);
      if (!menuItem) {
        return res.status(400).json({ error: `Menu item ${item.itemId} not found` });
      }
      if (!menuItem.available) {
        return res.status(400).json({ error: `Menu item ${menuItem.name} is not available` });
      }
      if (menuItem.serviceType !== serviceType) {
        return res.status(400).json({ error: `Menu item ${menuItem.name} is not available for ${serviceType} service` });
      }

      const itemTotal = menuItem.price * item.quantity;
      total += itemTotal;

      orderItems.push({
        menuItemId: item.itemId,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
        total: itemTotal
      });
    }

    // Create order
    const order = new Order({
      userId,
      items: orderItems,
      total,
      paymentMethod,
      specialInstructions,
      serviceType,
      status: 'pending'
    });

    await order.save();

    // Update user's order history
    const user = await User.findById(userId);
    if (user) {
      user.orders.push(order._id);
      await user.save();
    }

    // Generate QR code for canteen orders
    let qrCodeData = null;
    if (serviceType === 'canteen') {
      qrCodeData = {
        orderId: order._id,
        userId: userId,
        total: total,
        timestamp: order.createdAt
      };
    }

    // Notify admin about new order
    const io = req.app.get('io');
    io.emit('new-order', { order });

    res.status(201).json({
      message: 'Order placed successfully',
      order: {
        id: order._id,
        items: order.items,
        total: order.total,
        status: order.status,
        serviceType: order.serviceType,
        qrCodeData
      }
    });

  } catch (error) {
    console.error('Place order error:', error);
    res.status(500).json({ error: 'Failed to place order' });
  }
});

// Get user's orders
router.get('/my-orders', async (req, res) => {
  try {
    const userId = req.user.id;
    const { serviceType } = req.query;

    let query = { userId };
    if (serviceType) {
      query.serviceType = serviceType;
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .populate('items.menuItemId', 'name image');

    res.json({ orders });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to get orders' });
  }
});

// Get specific order
router.get('/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await Order.findById(orderId)
      .populate('items.menuItemId', 'name image description');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if user owns this order or is admin
    if (order.userId.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to get order' });
  }
});

// Cancel order
router.post('/:orderId/cancel', async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if user owns this order or is admin
    if (order.userId.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ error: 'Order cannot be cancelled' });
    }

    order.status = 'cancelled';
    await order.save();

    // Notify admin about order cancellation
    const io = req.app.get('io');
    io.emit('order-updated', { orderId, status: 'cancelled' });

    res.json({ message: 'Order cancelled successfully' });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ error: 'Failed to cancel order' });
  }
});

// Generate QR code for order
router.get('/:orderId/qr', async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if user owns this order or is admin
    if (order.userId.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (order.serviceType !== 'canteen') {
      return res.status(400).json({ error: 'QR code is only available for canteen orders' });
    }

    // Generate QR code data
    const qrData = {
      orderId: order._id,
      userId: order.userId,
      total: order.total,
      timestamp: order.createdAt,
      items: order.items.map(item => ({
        name: item.name,
        quantity: item.quantity
      }))
    };

    // Generate QR code as data URL
    const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    res.json({
      qrCode: qrCodeDataURL,
      orderData: qrData
    });
  } catch (error) {
    console.error('Generate QR code error:', error);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// Admin: Update order status
router.put('/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!['pending', 'preparing', 'ready', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.status = status;
    await order.save();

    // Notify user about order status update
    const io = req.app.get('io');
    io.emit('order-updated', { orderId, status });

    // Send notification when order is ready
    if (status === 'ready') {
      const message = order.serviceType === 'canteen' 
        ? 'Your canteen order is ready for collection!' 
        : 'Your xerox order is ready for collection!';
      
      io.emit('order-ready', { 
        orderId, 
        message,
        serviceType: order.serviceType
      });
    }

    res.json({ message: 'Order status updated successfully' });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Admin: Get all orders
router.get('/admin/all', async (req, res) => {
  try {
    const { serviceType, status } = req.query;
    
    let query = {};
    if (serviceType) query.serviceType = serviceType;
    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ orders });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ error: 'Failed to get orders' });
  }
});

// Admin: Get order statistics
router.get('/admin/stats', async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const completedOrders = await Order.countDocuments({ status: 'completed' });
    const totalRevenue = await Order.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const ordersByServiceType = await Order.aggregate([
      { $group: { _id: '$serviceType', count: { $sum: 1 } } }
    ]);

    res.json({
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      ordersByStatus,
      ordersByServiceType
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

module.exports = router;
