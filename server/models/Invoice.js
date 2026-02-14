const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: [true, 'Order is required']
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'Customer is required']
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    },
    unitPrice: {
      type: Number,
      required: true,
      min: [0, 'Unit price cannot be negative']
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
    total: {
      type: Number,
      required: true,
      min: [0, 'Total cannot be negative']
    }
  }],
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
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Total amount cannot be negative']
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: [0, 'Paid amount cannot be negative']
  },
  balanceDue: {
    type: Number,
    required: true,
    min: [0, 'Balance due cannot be negative']
  },
  status: {
    type: String,
    enum: ['Draft', 'Sent', 'Paid', 'Overdue', 'Void'],
    default: 'Draft'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Pre-save middleware to populate customer info from order
invoiceSchema.pre('save', async function(next) {
  if (this.isModified('order') && this.order) {
    try {
      const Order = mongoose.model('Order');
      const Customer = mongoose.model('Customer');
      
      const order = await Order.findById(this.order).populate('customer');
      if (order && order.customer) {
        // Copy customer info
        this.customer = order.customer._id;
      }
      
      // Copy items from order
      this.items = order.items.map(item => ({
        product: item.product,
        description: item.product.name || 'Product',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        tax: item.tax,
        total: item.totalPrice
      }));
      
      // Copy totals
      this.subTotal = order.subTotal;
      this.discount = order.discount;
      this.tax = order.tax;
      this.totalAmount = order.grandTotal;
      this.paidAmount = order.paidAmount;
      this.balanceDue = order.grandTotal - order.paidAmount;
    } catch (error) {
      return next(error);
    }
  }
});

// Pre-save middleware to calculate totals
invoiceSchema.pre('save', function(next) {
  // Calculate subtotal
  this.subTotal = this.items.reduce((total, item) => {
    return total + item.total;
  }, 0);

  // Calculate total amount
  this.totalAmount = this.subTotal - this.discount + this.tax;

  // Calculate balance due
  this.balanceDue = this.totalAmount - this.paidAmount;

  // Update status based on payment
  if (this.balanceDue <= 0) {
    this.status = 'Paid';
    if (!this.paidDate) {
      this.paidDate = new Date();
    }
  } else if (this.status === 'Paid') {
    this.status = 'Sent';
  }

  // Check if overdue
  if (this.status === 'Sent' && new Date() > this.dueDate) {
    this.status = 'Overdue';
  }

  next();
});

// Static method to generate invoice number
invoiceSchema.statics.generateInvoiceNumber = async function() {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}`;
  
  // Find the highest invoice number for this year
  const lastInvoice = await this.findOne({ 
    invoiceNumber: { $regex: `^${prefix}` } 
  }).sort({ invoiceNumber: -1 });
  
  let sequence = 1;
  if (lastInvoice) {
    const lastSequence = parseInt(lastInvoice.invoiceNumber.split('-')[2]);
    sequence = lastSequence + 1;
  }
  
  return `${prefix}-${sequence.toString().padStart(4, '0')}`;
};

// Static method to get overdue invoices
invoiceSchema.statics.getOverdueInvoices = function() {
  return this.find({
    status: 'Overdue'
  }).populate('order');
};

module.exports = mongoose.model('Invoice', invoiceSchema);
