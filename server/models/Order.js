const mongoose = require('mongoose');

// Order item schema
const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  unitPrice: {
    type: Number,
    required: [true, 'Unit price is required'],
    min: [0, 'Unit price cannot be negative']
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot exceed 100']
  },
  tax: {
    type: Number,
    default: 0,
    min: [0, 'Tax cannot be negative'],
    max: [100, 'Tax cannot exceed 100']
  },
  totalPrice: {
    type: Number,
    required: true,
    min: [0, 'Total price cannot be negative']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [200, 'Item notes cannot exceed 200 characters']
  }
}, { _id: false });

// Order schema
const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'Customer is required']
  },
  items: [orderItemSchema],
  subTotal: {
    type: Number,
    required: true,
    min: [0, 'Subtotal cannot be negative']
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative']
  },
  tax: {
    type: Number,
    default: 0,
    min: [0, 'Tax cannot be negative']
  },
  shipping: {
    type: Number,
    default: 0,
    min: [0, 'Shipping cannot be negative']
  },
  grandTotal: {
    type: Number,
    required: true,
    min: [0, 'Grand total cannot be negative']
  },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  paymentStatus: {
    type: String,
    enum: ['Unpaid', 'Partial', 'Paid'],
    default: 'Unpaid'
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Card', 'Bank Transfer', 'Check', 'Other'],
    default: 'Cash'
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: [0, 'Paid amount cannot be negative']
  },
  dueDate: {
    type: Date
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  shippingDate: {
    type: Date
  },
  deliveryDate: {
    type: Date
  },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  billingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  internalNotes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Internal notes cannot exceed 1000 characters']
  },
  tags: [{
    type: String,
    trim: true
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Virtual for outstanding balance
orderSchema.virtual('outstandingBalance').get(function() {
  return this.grandTotal - this.paidAmount;
});

// Virtual for payment status based on amount
orderSchema.virtual('paymentStatusCalculated').get(function() {
  if (this.paidAmount <= 0) return 'Unpaid';
  if (this.paidAmount >= this.grandTotal) return 'Paid';
  return 'Partial';
});

// Indexes
orderSchema.index({ orderNumber: 1 }, { unique: true });
orderSchema.index({ customer: 1 });
orderSchema.index({ createdBy: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ orderDate: -1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'items.product': 1 });

// Pre-save middleware to calculate totals
orderSchema.pre('save', function(next) {
  // Calculate subtotal
  this.subTotal = this.items.reduce((total, item) => {
    return total + item.totalPrice;
  }, 0);

  // Calculate grand total
  this.grandTotal = this.subTotal - this.discount + this.tax + this.shipping;

  // Set due date if not set
  if (!this.dueDate && this.paymentStatus !== 'Paid') {
    this.dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
  }

  next();
});

// Pre-remove middleware to restore stock
orderSchema.pre('remove', async function(next) {
  const Product = mongoose.model('Product');
  
  // Restore stock for all items
  for (const item of this.items) {
    await Product.findByIdAndUpdate(
      item.product,
      { $inc: { stock: item.quantity } }
    );
  }
  
  next();
});

// Static method to generate order number
orderSchema.statics.generateOrderNumber = async function() {
  const year = new Date().getFullYear();
  const prefix = `ORD-${year}`;
  
  // Find the highest order number for this year
  const lastOrder = await this.findOne({ 
    orderNumber: { $regex: `^${prefix}` } 
  }).sort({ orderNumber: -1 });
  
  let sequence = 1;
  if (lastOrder) {
    const lastSequence = parseInt(lastOrder.orderNumber.split('-')[2]);
    sequence = lastSequence + 1;
  }
  
  return `${prefix}-${sequence.toString().padStart(4, '0')}`;
};

// Static method to get sales data for dashboard
orderSchema.statics.getSalesData = async function(startDate, endDate) {
  const matchStage = {
    orderDate: {
      $gte: startDate,
      $lte: endDate
    },
    status: { $ne: 'Cancelled' }
  };

  const pipeline = [
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$grandTotal' },
        totalOrders: { $sum: 1 },
        averageOrderValue: { $avg: '$grandTotal' },
        paidOrders: {
          $sum: {
            $cond: [{ $eq: ['$paymentStatus', 'Paid'] }, 1, 0]
          }
        },
        totalPaidAmount: { $sum: '$paidAmount' }
      }
    }
  ];

  const result = await this.aggregate(pipeline);
  return result[0] || {
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    paidOrders: 0,
    totalPaidAmount: 0
  };
};

module.exports = mongoose.model('Order', orderSchema);
