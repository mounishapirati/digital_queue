const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const QRCode = require('qrcode');
require('dotenv').config();

// Database connection
const connectDB = require('./config/database');

const authRoutes = require('./routes/auth');
const queueRoutes = require('./routes/queue');
const orderRoutes = require('./routes/orders');
const menuRoutes = require('./routes/menu');
const adminRoutes = require('./routes/admin');
const xeroxRoutes = require('./routes/xerox');
const { authenticateToken } = require('./middleware/auth');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
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

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/queue', authenticateToken, queueRoutes);
app.use('/api/orders', authenticateToken, orderRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/admin', authenticateToken, adminRoutes);
app.use('/api/xerox', authenticateToken, xeroxRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join queue room
  socket.on('join-queue', (queueId) => {
    socket.join(`queue-${queueId}`);
    console.log(`User ${socket.id} joined queue ${queueId}`);
  });

  // Leave queue room
  socket.on('leave-queue', (queueId) => {
    socket.leave(`queue-${queueId}`);
    console.log(`User ${socket.id} left queue ${queueId}`);
  });

  // Join order tracking room
  socket.on('track-order', (orderId) => {
    socket.join(`order-${orderId}`);
    console.log(`User ${socket.id} tracking order ${orderId}`);
  });

  // Join xerox order tracking room
  socket.on('track-xerox', (orderId) => {
    socket.join(`xerox-${orderId}`);
    console.log(`User ${socket.id} tracking xerox order ${orderId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
 });

const PORT = process.env.PORT || 5000;

// Connect to database and start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Start server
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
      console.log('Database connected successfully!');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = { app, io };
