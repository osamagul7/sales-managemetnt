const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    maxlength: [50, 'Category cannot exceed 50 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  cost: {
    type: Number,
    min: [0, 'Cost cannot be negative'],
    default: 0
  },
  stock: {
    type: Number,
    default: 0,
    min: [0, 'Stock cannot be negative']
  },
  minStockLevel: {
    type: Number,
    default: 10,
    min: [0, 'Minimum stock level cannot be negative']
  },
  maxStockLevel: {
    type: Number,
    min: [0, 'Maximum stock level cannot be negative']
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    trim: true,
    maxlength: [20, 'Unit cannot exceed 20 characters'],
    default: 'pcs'
  },
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    trim: true,
    uppercase: true,
    maxlength: [50, 'SKU cannot exceed 50 characters']
  },
  barcode: {
    type: String,
    trim: true,
    unique: true,
    sparse: true // Allows multiple null values
  },
  weight: {
    type: Number,
    min: [0, 'Weight cannot be negative']
  },
  dimensions: {
    length: {
      type: Number,
      min: [0, 'Length cannot be negative']
    },
    width: {
      type: Number,
      min: [0, 'Width cannot be negative']
    },
    height: {
      type: Number,
      min: [0, 'Height cannot be negative']
    }
  },
  images: [{
    type: String,
    trim: true
  }],
  tags: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isTaxable: {
    type: Boolean,
    default: true
  },
  taxRate: {
    type: Number,
    default: 0,
    min: [0, 'Tax rate cannot be negative'],
    max: [100, 'Tax rate cannot exceed 100']
  },
  discountRate: {
    type: Number,
    default: 0,
    min: [0, 'Discount rate cannot be negative'],
    max: [100, 'Discount rate cannot exceed 100']
  },
  supplier: {
    name: {
      type: String,
      trim: true
    },
    contact: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true
    }
  },
  reorderPoint: {
    type: Number,
    default: 10,
    min: [0, 'Reorder point cannot be negative']
  },
  reorderQuantity: {
    type: Number,
    default: 50,
    min: [0, 'Reorder quantity cannot be negative']
  }
}, {
  timestamps: true
});

// Virtual for stock status
productSchema.virtual('stockStatus').get(function() {
  if (this.stock <= 0) return 'out_of_stock';
  if (this.stock <= this.minStockLevel) return 'low_stock';
  if (this.stock <= this.reorderPoint) return 'reorder_needed';
  return 'in_stock';
});

// Virtual for profit margin
productSchema.virtual('profitMargin').get(function() {
  if (this.price <= 0) return 0;
  return ((this.price - this.cost) / this.price * 100).toFixed(2);
});

// Compound index for search
productSchema.index({ name: 'text', description: 'text', sku: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ stock: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ sku: 1 }, { unique: true });

// Pre-remove middleware to check if product is used in orders
productSchema.pre('remove', async function(next) {
  const Order = mongoose.model('Order');
  const ordersWithProduct = await Order.findOne({ 'items.product': this._id });
  
  if (ordersWithProduct) {
    const error = new Error('Cannot delete product that is used in orders');
    error.name = 'ValidationError';
    return next(error);
  }
  
  next();
});

// Static method to get low stock products
productSchema.statics.getLowStockProducts = function() {
  return this.find({
    $expr: { $lte: ['$stock', '$minStockLevel'] },
    isActive: true
  }).sort({ stock: 1 });
};

// Static method to update stock
productSchema.statics.updateStock = async function(productId, quantity, operation = 'subtract') {
  const update = operation === 'add' 
    ? { $inc: { stock: quantity } }
    : { $inc: { stock: -quantity } };
  
  return this.findByIdAndUpdate(
    productId,
    update,
    { new: true, runValidators: true }
  );
};

module.exports = mongoose.model('Product', productSchema);
