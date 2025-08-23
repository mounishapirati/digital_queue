const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const XeroxOrder = require('../models/XeroxOrder');
const User = require('../models/User');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Configure multer for xerox file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/xerox';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'xerox-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only PDF, DOC, DOCX, images
    if (file.mimetype.startsWith('image/') || 
        file.mimetype === 'application/pdf' || 
        file.mimetype === 'application/msword' ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, PDF, DOC, and DOCX files are allowed.'));
    }
  }
});

// Place a new xerox order
router.post('/', authenticateToken, upload.array('files', 5), [
  body('copies').isInt({ min: 1, max: 100 }),
  body('paperSize').isIn(['A4', 'A3', 'Letter']),
  body('colorMode').isIn(['black', 'color']),
  body('binding').optional().isIn(['none', 'staples', 'spiral', 'hardcover']),
  body('specialInstructions').optional().isString(),
  body('paymentMethod').isIn(['online', 'offline'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'At least one file is required' });
    }

    const { 
      copies, 
      paperSize, 
      colorMode, 
      binding = 'none', 
      specialInstructions, 
      paymentMethod 
    } = req.body;
    const { userId } = req.user;

    // Calculate price based on options
    let basePrice = 2; // Base price per page
    if (paperSize === 'A3') basePrice *= 1.5;
    if (colorMode === 'color') basePrice *= 2;
    if (binding === 'staples') basePrice += 5;
    if (binding === 'spiral') basePrice += 15;
    if (binding === 'hardcover') basePrice += 25;

    // Count total pages from uploaded files
    let totalPages = 0;
    const uploadedFiles = req.files.map(file => {
      // For now, assume 1 page per file (in production, you'd analyze PDFs)
      totalPages += 1;
      return {
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype
      };
    });

    const totalPrice = basePrice * totalPages * copies;

    // Create xerox order
    const xeroxOrder = new XeroxOrder({
      userId,
      files: uploadedFiles,
      copies: parseInt(copies),
      paperSize,
      colorMode,
      binding,
      specialInstructions,
      totalPages,
      totalPrice,
      paymentMethod,
      status: 'pending'
    });

    await xeroxOrder.save();

    // Update user's xerox order history
    const user = await User.findById(userId);
    if (user) {
      user.xeroxOrders.push(xeroxOrder._id);
      await user.save();
    }

    // Notify admin about new xerox order
    const io = req.app.get('io');
    io.emit('new-xerox-order', { xeroxOrder });

    res.status(201).json({
      message: 'Xerox order placed successfully',
      xeroxOrder: {
        id: xeroxOrder._id,
        files: xeroxOrder.files.map(f => ({ filename: f.filename, originalName: f.originalName })),
        copies: xeroxOrder.copies,
        paperSize: xeroxOrder.paperSize,
        colorMode: xeroxOrder.colorMode,
        binding: xeroxOrder.binding,
        totalPrice: xeroxOrder.totalPrice,
        status: xeroxOrder.status,
        createdAt: xeroxOrder.createdAt
      }
    });
  } catch (error) {
    console.error('Place xerox order error:', error);
    res.status(500).json({ error: 'Failed to place xerox order' });
  }
});

// Get user's xerox orders
router.get('/my-orders', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const xeroxOrders = await XeroxOrder.find({ userId })
      .sort({ createdAt: -1 });

    res.json({ xeroxOrders });
  } catch (error) {
    console.error('Get xerox orders error:', error);
    res.status(500).json({ error: 'Failed to get xerox orders' });
  }
});

// Get specific xerox order
router.get('/:orderId', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { userId } = req.user;

    const xeroxOrder = await XeroxOrder.findById(orderId);
    if (!xeroxOrder) {
      return res.status(404).json({ error: 'Xerox order not found' });
    }

    // Check if user owns this order or is admin
    if (xeroxOrder.userId.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ xeroxOrder });
  } catch (error) {
    console.error('Get xerox order error:', error);
    res.status(500).json({ error: 'Failed to get xerox order' });
  }
});

// Cancel xerox order
router.post('/:orderId/cancel', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { userId } = req.user;

    const xeroxOrder = await XeroxOrder.findById(orderId);
    if (!xeroxOrder) {
      return res.status(404).json({ error: 'Xerox order not found' });
    }

    // Check if user owns this order or is admin
    if (xeroxOrder.userId.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (xeroxOrder.status !== 'pending') {
      return res.status(400).json({ error: 'Order cannot be cancelled' });
    }

    xeroxOrder.status = 'cancelled';
    await xeroxOrder.save();

    // Notify admin about order cancellation
    const io = req.app.get('io');
    io.emit('xerox-order-updated', { orderId, status: 'cancelled' });

    res.json({ message: 'Xerox order cancelled successfully' });
  } catch (error) {
    console.error('Cancel xerox order error:', error);
    res.status(500).json({ error: 'Failed to cancel xerox order' });
  }
});

// Admin: Update xerox order status
router.put('/:orderId/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!['pending', 'processing', 'ready', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const xeroxOrder = await XeroxOrder.findById(orderId);
    if (!xeroxOrder) {
      return res.status(404).json({ error: 'Xerox order not found' });
    }

    xeroxOrder.status = status;
    await xeroxOrder.save();

    // Notify user about order status update
    const io = req.app.get('io');
    io.emit('xerox-order-updated', { orderId, status });

    // Send notification when order is ready
    if (status === 'ready') {
      io.emit('xerox-order-ready', { 
        orderId, 
        message: 'Your xerox order is ready for collection!'
      });
    }

    res.json({ message: 'Xerox order status updated successfully' });
  } catch (error) {
    console.error('Update xerox order status error:', error);
    res.status(500).json({ error: 'Failed to update xerox order status' });
  }
});

// Admin: Get all xerox orders
router.get('/admin/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = {};
    if (status) query.status = status;

    const xeroxOrders = await XeroxOrder.find(query)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ xeroxOrders });
  } catch (error) {
    console.error('Get all xerox orders error:', error);
    res.status(500).json({ error: 'Failed to get xerox orders' });
  }
});

// Get xerox order statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const totalOrders = await XeroxOrder.countDocuments();
    const pendingOrders = await XeroxOrder.countDocuments({ status: 'pending' });
    const completedOrders = await XeroxOrder.countDocuments({ status: 'completed' });
    const totalRevenue = await XeroxOrder.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    const ordersByStatus = await XeroxOrder.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const ordersByPaperSize = await XeroxOrder.aggregate([
      { $group: { _id: '$paperSize', count: { $sum: 1 } } }
    ]);

    const ordersByColorMode = await XeroxOrder.aggregate([
      { $group: { _id: '$colorMode', count: { $sum: 1 } } }
    ]);

    res.json({
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      ordersByStatus,
      ordersByPaperSize,
      ordersByColorMode
    });
  } catch (error) {
    console.error('Get xerox stats error:', error);
    res.status(500).json({ error: 'Failed to get xerox statistics' });
  }
});

module.exports = router;
