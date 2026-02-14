const Customer = require('../models/Customer');
const Order = require('../models/Order');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get all customers
// @route   GET /api/customers
// @access  Private
const getCustomers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const search = req.query.search || '';
  const isActive = req.query.isActive;

  // Build query
  let query = { createdBy: req.user._id };

  // Admin and managers can see all customers
  if (req.user.role === 'admin' || req.user.role === 'manager') {
    delete query.createdBy;
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } }
    ];
  }

  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  const skip = (page - 1) * limit;

  const customers = await Customer.find(query)
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Customer.countDocuments(query);

  res.status(200).json({
    success: true,
    data: customers,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get single customer
// @route   GET /api/customers/:id
// @access  Private
const getCustomer = asyncHandler(async (req, res) => {
  let query = { _id: req.params.id };

  // Salespersons can only see their own customers
  if (req.user.role === 'salesperson') {
    query.createdBy = req.user._id;
  }

  const customer = await Customer.findOne(query).populate('createdBy', 'name email');

  if (!customer) {
    return res.status(404).json({
      success: false,
      message: 'Customer not found'
    });
  }

  res.status(200).json({
    success: true,
    data: customer
  });
});

// @desc    Create customer
// @route   POST /api/customers
// @access  Private
const createCustomer = asyncHandler(async (req, res) => {
  const customerData = {
    ...req.body,
    createdBy: req.user._id
  };

  const customer = await Customer.create(customerData);
  await customer.populate('createdBy', 'name email');

  res.status(201).json({
    success: true,
    message: 'Customer created successfully',
    data: customer
  });
});

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Private
const updateCustomer = asyncHandler(async (req, res) => {
  let query = { _id: req.params.id };

  // Salespersons can only update their own customers
  if (req.user.role === 'salesperson') {
    query.createdBy = req.user._id;
  }

  const customer = await Customer.findOne(query);

  if (!customer) {
    return res.status(404).json({
      success: false,
      message: 'Customer not found'
    });
  }

  // Update customer
  const updatedCustomer = await Customer.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('createdBy', 'name email');

  res.status(200).json({
    success: true,
    message: 'Customer updated successfully',
    data: updatedCustomer
  });
});

// @desc    Delete customer
// @route   DELETE /api/customers/:id
// @access  Private
const deleteCustomer = asyncHandler(async (req, res) => {
  let query = { _id: req.params.id };

  // Salespersons can only delete their own customers
  if (req.user.role === 'salesperson') {
    query.createdBy = req.user._id;
  }

  const customer = await Customer.findOne(query);

  if (!customer) {
    return res.status(404).json({
      success: false,
      message: 'Customer not found'
    });
  }

  // Check if customer has orders
  const orderCount = await Order.countDocuments({ customer: req.params.id });
  if (orderCount > 0) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete customer with existing orders'
    });
  }

  await customer.remove();

  res.status(200).json({
    success: true,
    message: 'Customer deleted successfully'
  });
});

// @desc    Get customer with order history
// @route   GET /api/customers/:id/orders
// @access  Private
const getCustomerOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;

  let customerQuery = { _id: req.params.id };

  // Salespersons can only see their own customers
  if (req.user.role === 'salesperson') {
    customerQuery.createdBy = req.user._id;
  }

  const customer = await Customer.findOne(customerQuery);
  if (!customer) {
    return res.status(404).json({
      success: false,
      message: 'Customer not found'
    });
  }

  const skip = (page - 1) * limit;

  const orders = await Order.find({ customer: req.params.id })
    .populate('items.product', 'name sku')
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Order.countDocuments({ customer: req.params.id });

  // Calculate customer statistics
  const stats = await Order.aggregate([
    { $match: { customer: customer._id, status: { $ne: 'Cancelled' } } },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$grandTotal' },
        averageOrderValue: { $avg: '$grandTotal' },
        totalPaid: { $sum: '$paidAmount' },
        outstandingBalance: { $sum: { $subtract: ['$grandTotal', '$paidAmount'] } }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      customer,
      orders,
      statistics: stats[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        totalPaid: 0,
        outstandingBalance: 0
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// @desc    Get customer statistics
// @route   GET /api/customers/stats
// @access  Private
const getCustomerStats = asyncHandler(async (req, res) => {
  let matchQuery = {};

  // Salespersons can only see their own customers
  if (req.user.role === 'salesperson') {
    matchQuery.createdBy = req.user._id;
  }

  const totalCustomers = await Customer.countDocuments(matchQuery);
  const activeCustomers = await Customer.countDocuments({ ...matchQuery, isActive: true });

  // Get customers with most orders
  const topCustomers = await Order.aggregate([
    {
      $match: {
        status: { $ne: 'Cancelled' },
        ...(req.user.role === 'salesperson' && { createdBy: req.user._id })
      }
    },
    {
      $group: {
        _id: '$customer',
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$grandTotal' },
        averageOrderValue: { $avg: '$grandTotal' }
      }
    },
    {
      $lookup: {
        from: 'customers',
        localField: '_id',
        foreignField: '_id',
        as: 'customer'
      }
    },
    { $unwind: '$customer' },
    { $sort: { totalRevenue: -1 } },
    { $limit: 10 }
  ]);

  // Get new customers this month
  const thisMonth = new Date();
  thisMonth.setDate(1);
  const newCustomersThisMonth = await Customer.countDocuments({
    ...matchQuery,
    createdAt: { $gte: thisMonth }
  });

  res.status(200).json({
    success: true,
    data: {
      totalCustomers,
      activeCustomers,
      inactiveCustomers: totalCustomers - activeCustomers,
      newCustomersThisMonth,
      topCustomers
    }
  });
});

module.exports = {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerOrders,
  getCustomerStats
};
