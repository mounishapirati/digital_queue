const mongoose = require('mongoose');

const queueCustomerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  position: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['waiting', 'called', 'served', 'left'],
    default: 'waiting'
  }
});

const queueSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  serviceType: {
    type: String,
    enum: ['canteen', 'xerox'],
    required: true
  },
  currentNumber: {
    type: Number,
    default: 0
  },
  customers: [queueCustomerSchema],
  status: {
    type: String,
    enum: ['active', 'paused', 'closed'],
    default: 'active'
  },
  maxCapacity: {
    type: Number,
    default: 100
  },
  estimatedWaitTime: {
    type: Number, // in minutes
    default: 15
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
queueSchema.index({ serviceType: 1, status: 1 });

// Virtual for queue length
queueSchema.virtual('queueLength').get(function() {
  return this.customers && this.customers.filter(customer => customer.status === 'waiting').length || 0;
});

// Virtual for estimated wait time
queueSchema.virtual('currentWaitTime').get(function() {
  return this.queueLength * this.estimatedWaitTime;
});

// Method to add customer to queue
queueSchema.methods.addCustomer = function(userId, name) {
  const position = this.currentNumber + 1;
  this.currentNumber = position;
  
  this.customers.push({
    userId,
    name,
    position,
    joinedAt: new Date(),
    status: 'waiting'
  });
  
  return position;
};

// Method to remove customer from queue
queueSchema.methods.removeCustomer = function(userId) {
  const customerIndex = this.customers.findIndex(c => c.userId.toString() === userId.toString());
  if (customerIndex !== -1) {
    this.customers.splice(customerIndex, 1);
    // Reorder remaining customers
    this.customers.forEach((customer, index) => {
      customer.position = index + 1;
    });
    this.currentNumber = this.customers.length;
  }
};

// Method to call next customer
queueSchema.methods.callNext = function() {
  const nextCustomer = this.customers.find(c => c.status === 'waiting');
  if (nextCustomer) {
    nextCustomer.status = 'called';
    return nextCustomer;
  }
  return null;
};

module.exports = mongoose.model('Queue', queueSchema);
