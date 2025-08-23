const mongoose = require('mongoose');

const uploadedFileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  }
});

const xeroxOrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  files: [uploadedFileSchema],
  copies: {
    type: Number,
    required: true,
    min: 1,
    max: 100
  },
  paperSize: {
    type: String,
    enum: ['A4', 'A3', 'Letter'],
    default: 'A4'
  },
  colorMode: {
    type: String,
    enum: ['black', 'color'],
    default: 'black'
  },
  binding: {
    type: String,
    enum: ['none', 'staples', 'spiral', 'hardcover'],
    default: 'none'
  },
  specialInstructions: {
    type: String,
    trim: true
  },
  totalPages: {
    type: Number,
    required: true,
    min: 1
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
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
  status: {
    type: String,
    enum: ['pending', 'processing', 'ready', 'completed', 'cancelled'],
    default: 'pending'
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
xeroxOrderSchema.index({ userId: 1, status: 1, createdAt: -1 });

// Virtual for order status timeline
xeroxOrderSchema.virtual('statusHistory').get(function() {
  const history = [];
  if (this.createdAt) history.push({ status: 'pending', timestamp: this.createdAt });
  if (this.updatedAt && this.status !== 'pending') {
    history.push({ status: this.status, timestamp: this.updatedAt });
  }
  return history;
});

module.exports = mongoose.model('XeroxOrder', xeroxOrderSchema);
