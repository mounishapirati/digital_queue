const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  total: {
    type: Number,
    required: true
  }
});

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  total: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'preparing', 'ready', 'completed', 'cancelled'],
    default: 'pending'
  },
  serviceType: {
    type: String,
    enum: ['canteen', 'xerox'],
    default: 'canteen'
  },
  paymentMethod: {
    type: String,
    enum: ['online', 'offline'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  qrCodeData: {
    type: String
  },
  specialInstructions: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
orderSchema.index({ userId: 1, status: 1, serviceType: 1, createdAt: -1 });

// Virtual for order status timeline
orderSchema.virtual('statusHistory').get(function() {
  const history = [];
  if (this.createdAt) history.push({ status: 'pending', timestamp: this.createdAt });
  if (this.updatedAt && this.status !== 'pending') {
    history.push({ status: this.status, timestamp: this.updatedAt });
  }
  return history;
});

module.exports = mongoose.model('Order', orderSchema);
