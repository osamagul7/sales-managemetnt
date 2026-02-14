const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
const getOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const search = req.query.search || '';
  const status = req.query.status || '';
  const paymentStatus = req.query.paymentStatus || '';
  const customer = req.query.customer || '';
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;

  // Build query
  let query = {};

  // Salespersons can only see their own orders
  if (req.user.role === 'salesperson') {
    query.createdBy = req.user._id;
  }

  if (search) {
    query.$or = [
      { orderNumber: { $regex: search, $options: 'i' } }
    ];
  }

  if (status) {
    query.status = status;
  }

  if (paymentStatus) {
    query.paymentStatus = paymentStatus;
  }

  if (customer) {
    query.customer = customer;
  }

  if (startDate || endDate) {
    query.orderDate = {};
    if (startDate) query.orderDate.$gte = new Date(startDate);
    if (endDate) query.orderDate.$lte = new Date(endDate);
  }

  const skip = (page - 1) * limit;

  const orders = await Order.find(query)
    .populate('customer', 'name email company')
    .populate('createdBy', 'name email')
    .populate('items.product', 'name sku')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Order.countDocuments(query);

  res.status(200).json({
    success: true,
    data: orders,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrder = asyncHandler(async (req, res) => {
  let query = { _id: req.params.id };

  // Salespersons can only see their own orders
  if (req.user.role === 'salesperson') {
    query.createdBy = req.user._id;
  }

  const order = await Order.findOne(query)
    .populate('customer', 'name email phone address company')
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email')
    .populate('items.product', 'name sku description category');

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  res.status(200).json({
    success: true,
    data: order
  });
});

// @desc    Create order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const { customer, items, discount, tax, shipping, paymentMethod, notes, dueDate } = req.body;

  // Validate customer exists
  const customerDoc = await Customer.findById(customer);
  if (!customerDoc) {
    return res.status(400).json({
      success: false,
      message: 'Customer not found'
    });
  }

  // Validate items and check stock
  let subTotal = 0;
  const processedItems = [];

  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) {
      return res.status(400).json({
        success: false,
        message: `Product with ID ${item.product} not found`
      });
    }

    if (!product.isActive) {
      return res.status(400).json({
        success: false,
        message: `Product ${product.name} is not active`
      });
    }

    if (product.stock < item.quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
      });
    }

    const itemTotal = item.unitPrice * item.quantity;
    const itemDiscount = itemTotal * (item.discount || 0) / 100;
    const itemTax = (itemTotal - itemDiscount) * (item.tax || 0) / 100;
    const finalItemTotal = itemTotal - itemDiscount + itemTax;

    processedItems.push({
      product: product._id,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discount: item.discount || 0,
      tax: item.tax || 0,
      totalPrice: finalItemTotal,
      notes: item.notes
    });

    subTotal += finalItemTotal;
  }

  // Calculate totals
  const discountAmount = subTotal * (discount || 0) / 100;
  const taxAmount = (subTotal - discountAmount) * (tax || 0) / 100;
  const shippingAmount = shipping || 0;
  const grandTotal = subTotal - discountAmount + taxAmount + shippingAmount;

  // Generate order number
  const orderNumber = await Order.generateOrderNumber();

  // Create order
  const order = await Order.create({
    orderNumber,
    customer,
    items: processedItems,
    subTotal,
    discount: discountAmount,
    tax: taxAmount,
    shipping: shippingAmount,
    grandTotal,
    paymentMethod: paymentMethod || 'Cash',
    notes,
    dueDate,
    createdBy: req.user._id
  });

  // Update product stock
  for (const item of processedItems) {
    await Product.updateStock(item.product, item.quantity, 'subtract');
  }

  // Populate and return order
  const populatedOrder = await Order.findById(order._id)
    .populate('customer', 'name email company')
    .populate('createdBy', 'name email')
    .populate('items.product', 'name sku');

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    data: populatedOrder
  });
});

// @desc    Update order
// @route   PUT /api/orders/:id
// @access  Private
const updateOrder = asyncHandler(async (req, res) => {
  let query = { _id: req.params.id };

  // Salespersons can only update their own orders
  if (req.user.role === 'salesperson') {
    query.createdBy = req.user._id;
  }

  const order = await Order.findOne(query);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  const { status, paymentStatus, notes, internalNotes } = req.body;

  // Handle order cancellation
  if (status === 'Cancelled' && order.status !== 'Cancelled') {
    // Restore stock
    for (const item of order.items) {
      await Product.updateStock(item.product, item.quantity, 'add');
    }
  }

  // Handle status change from cancelled to other
  if (order.status === 'Cancelled' && status !== 'Cancelled') {
    // Deduct stock again
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Required: ${item.quantity}`
        });
      }
      await Product.updateStock(item.product, item.quantity, 'subtract');
    }
  }

  // Update order
  order.status = status || order.status;
  order.paymentStatus = paymentStatus || order.paymentStatus;
  order.notes = notes !== undefined ? notes : order.notes;
  order.internalNotes = internalNotes !== undefined ? internalNotes : order.internalNotes;
  order.updatedBy = req.user._id;

  await order.save();

  const updatedOrder = await Order.findById(order._id)
    .populate('customer', 'name email company')
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email')
    .populate('items.product', 'name sku');

  res.status(200).json({
    success: true,
    message: 'Order updated successfully',
    data: updatedOrder
  });
});

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  // Restore stock before deleting
  if (order.status !== 'Cancelled') {
    for (const item of order.items) {
      await Product.updateStock(item.product, item.quantity, 'add');
    }
  }

  await order.remove();

  res.status(200).json({
    success: true,
    message: 'Order deleted successfully'
  });
});

// @desc    Add payment to order
// @route   PUT /api/orders/:id/payment
// @access  Private
const addPayment = asyncHandler(async (req, res) => {
  let query = { _id: req.params.id };

  // Salespersons can only update their own orders
  if (req.user.role === 'salesperson') {
    query.createdBy = req.user._id;
  }

  const order = await Order.findOne(query);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  const { amount, method, reference } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Payment amount must be greater than 0'
    });
  }

  if (order.paidAmount + amount > order.grandTotal) {
    return res.status(400).json({
      success: false,
      message: 'Payment amount exceeds order total'
    });
  }

  order.paidAmount += amount;
  
  if (order.paidAmount >= order.grandTotal) {
    order.paymentStatus = 'Paid';
  } else {
    order.paymentStatus = 'Partial';
  }

  order.updatedBy = req.user._id;
  await order.save();

  const updatedOrder = await Order.findById(order._id)
    .populate('customer', 'name email company')
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email')
    .populate('items.product', 'name sku');

  res.status(200).json({
    success: true,
    message: 'Payment added successfully',
    data: updatedOrder
  });
});

// @desc    Get order statistics
// @route   GET /api/orders/stats
// @access  Private
const getOrderStats = asyncHandler(async (req, res) => {
  let matchQuery = {};

  // Salespersons can only see their own orders
  if (req.user.role === 'salesperson') {
    matchQuery.createdBy = req.user._id;
  }

  const totalOrders = await Order.countDocuments(matchQuery);
  const pendingOrders = await Order.countDocuments({ ...matchQuery, status: 'Pending' });
  const processingOrders = await Order.countDocuments({ ...matchQuery, status: 'Processing' });
  const completedOrders = await Order.countDocuments({ ...matchQuery, status: 'Completed' });
  const cancelledOrders = await Order.countDocuments({ ...matchQuery, status: 'Cancelled' });

  const unpaidOrders = await Order.countDocuments({ ...matchQuery, paymentStatus: 'Unpaid' });
  const partialPaidOrders = await Order.countDocuments({ ...matchQuery, paymentStatus: 'Partial' });
  const fullyPaidOrders = await Order.countDocuments({ ...matchQuery, paymentStatus: 'Paid' });

  // Revenue calculations
  const revenueData = await Order.aggregate([
    { $match: { ...matchQuery, status: { $ne: 'Cancelled' } } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$grandTotal' },
        totalPaid: { $sum: '$paidAmount' },
        outstandingBalance: { $sum: { $subtract: ['$grandTotal', '$paidAmount'] } },
        averageOrderValue: { $avg: '$grandTotal' }
      }
    }
  ]);

  // Orders this month
  const thisMonth = new Date();
  thisMonth.setDate(1);
  const ordersThisMonth = await Order.countDocuments({
    ...matchQuery,
    createdAt: { $gte: thisMonth }
  });

  // Revenue this month
  const monthlyRevenue = await Order.aggregate([
    {
      $match: {
        ...matchQuery,
        status: { $ne: 'Cancelled' },
        createdAt: { $gte: thisMonth }
      }
    },
    {
      $group: {
        _id: null,
        revenue: { $sum: '$grandTotal' }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalOrders,
      pendingOrders,
      processingOrders,
      completedOrders,
      cancelledOrders,
      unpaidOrders,
      partialPaidOrders,
      fullyPaidOrders,
      ordersThisMonth,
      ...(revenueData[0] || {
        totalRevenue: 0,
        totalPaid: 0,
        outstandingBalance: 0,
        averageOrderValue: 0
      }),
      monthlyRevenue: monthlyRevenue[0]?.revenue || 0
    }
  });
});

module.exports = {
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,
  addPayment,
  getOrderStats
};
