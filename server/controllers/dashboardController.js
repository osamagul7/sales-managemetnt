const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const Invoice = require('../models/Invoice');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = asyncHandler(async (req, res) => {
  let matchQuery = {};

  // Salespersons can only see their own data
  if (req.user.role === 'salesperson') {
    matchQuery.createdBy = req.user._id;
  }

  // Get date ranges
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  // Total Revenue (excluding cancelled orders)
  const totalRevenueData = await Order.aggregate([
    { $match: { ...matchQuery, status: { $ne: 'Cancelled' } } },
    { $group: { _id: null, total: { $sum: '$grandTotal' } } }
  ]);

  // Revenue this month
  const revenueThisMonthData = await Order.aggregate([
    {
      $match: {
        ...matchQuery,
        status: { $ne: 'Cancelled' },
        orderDate: { $gte: startOfMonth }
      }
    },
    { $group: { _id: null, total: { $sum: '$grandTotal' } } }
  ]);

  // Revenue last month
  const revenueLastMonthData = await Order.aggregate([
    {
      $match: {
        ...matchQuery,
        status: { $ne: 'Cancelled' },
        orderDate: { $gte: startOfLastMonth, $lte: endOfLastMonth }
      }
    },
    { $group: { _id: null, total: { $sum: '$grandTotal' } } }
  ]);

  // Total Orders
  const totalOrders = await Order.countDocuments(matchQuery);

  // Orders this month
  const ordersThisMonth = await Order.countDocuments({
    ...matchQuery,
    orderDate: { $gte: startOfMonth }
  });

  // Total Customers
  let customerQuery = {};
  if (req.user.role === 'salesperson') {
    customerQuery.createdBy = req.user._id;
  }
  const totalCustomers = await Customer.countDocuments(customerQuery);

  // New customers this month
  const newCustomersThisMonth = await Customer.countDocuments({
    ...customerQuery,
    createdAt: { $gte: startOfMonth }
  });

  // Total Products
  const totalProducts = await Product.countDocuments({ isActive: true });

  // Low stock products
  const lowStockProducts = await Product.countDocuments({
    $expr: { $lte: ['$stock', '$minStockLevel'] },
    isActive: true
  });

  // Unpaid invoices amount
  const unpaidInvoicesData = await Invoice.aggregate([
    {
      $match: {
        ...matchQuery,
        status: { $in: ['Sent', 'Overdue'] },
        balanceDue: { $gt: 0 }
      }
    },
    { $group: { _id: null, total: { $sum: '$balanceDue' } } }
  ]);

  // Calculate revenue growth
  const revenueThisMonth = revenueThisMonthData[0]?.total || 0;
  const revenueLastMonth = revenueLastMonthData[0]?.total || 0;
  const revenueGrowth = revenueLastMonth > 0 
    ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth * 100).toFixed(1)
    : 0;

  res.status(200).json({
    success: true,
    data: {
      totalRevenue: totalRevenueData[0]?.total || 0,
      revenueThisMonth,
      revenueGrowth: parseFloat(revenueGrowth),
      totalOrders,
      ordersThisMonth,
      totalCustomers,
      newCustomersThisMonth,
      totalProducts,
      lowStockProducts,
      unpaidInvoices: unpaidInvoicesData[0]?.total || 0
    }
  });
});

// @desc    Get monthly sales data for chart
// @route   GET /api/dashboard/monthly-sales
// @access  Private
const getMonthlySales = asyncHandler(async (req, res) => {
  let matchQuery = { status: { $ne: 'Cancelled' } };

  // Salespersons can only see their own data
  if (req.user.role === 'salesperson') {
    matchQuery.createdBy = req.user._id;
  }

  // Get last 12 months of data
  const monthlySales = await Order.aggregate([
    {
      $match: {
        ...matchQuery,
        orderDate: {
          $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) // 12 months ago
        }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$orderDate' },
          month: { $month: '$orderDate' }
        },
        revenue: { $sum: '$grandTotal' },
        orders: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  // Format data for chart
  const formattedData = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Initialize with zeros for last 12 months
  for (let i = 11; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    
    const monthData = monthlySales.find(s => s._id.year === year && s._id.month === month);
    formattedData.push({
      month: monthNames[month - 1],
      year,
      revenue: monthData?.revenue || 0,
      orders: monthData?.orders || 0
    });
  }

  res.status(200).json({
    success: true,
    data: formattedData
  });
});

// @desc    Get top 5 products
// @route   GET /api/dashboard/top-products
// @access  Private
const getTopProducts = asyncHandler(async (req, res) => {
  let matchQuery = { status: { $ne: 'Cancelled' } };

  // Salespersons can only see their own data
  if (req.user.role === 'salesperson') {
    matchQuery.createdBy = req.user._id;
  }

  const topProducts = await Order.aggregate([
    { $match: matchQuery },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.product',
        totalRevenue: { $sum: '$items.totalPrice' },
        totalQuantity: { $sum: '$items.quantity' },
        orderCount: { $addToSet: '$_id' }
      }
    },
    {
      $addFields: {
        orderCount: { $size: '$orderCount' }
      }
    },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product'
      }
    },
    { $unwind: '$product' },
    {
      $project: {
        name: '$product.name',
        sku: '$product.sku',
        category: '$product.category',
        totalRevenue: 1,
        totalQuantity: 1,
        orderCount: 1
      }
    },
    { $sort: { totalRevenue: -1 } },
    { $limit: 5 }
  ]);

  res.status(200).json({
    success: true,
    data: topProducts
  });
});

// @desc    Get order status breakdown
// @route   GET /api/dashboard/order-status
// @access  Private
const getOrderStatusBreakdown = asyncHandler(async (req, res) => {
  let matchQuery = {};

  // Salespersons can only see their own data
  if (req.user.role === 'salesperson') {
    matchQuery.createdBy = req.user._id;
  }

  const statusBreakdown = await Order.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalValue: { $sum: '$grandTotal' }
      }
    },
    { $sort: { count: -1 } }
  ]);

  res.status(200).json({
    success: true,
    data: statusBreakdown
  });
});

// @desc    Get recent orders
// @route   GET /api/dashboard/recent-orders
// @access  Private
const getRecentOrders = asyncHandler(async (req, res) => {
  let query = {};

  // Salespersons can only see their own orders
  if (req.user.role === 'salesperson') {
    query.createdBy = req.user._id;
  }

  const recentOrders = await Order.find(query)
    .populate('customer', 'name company')
    .populate('createdBy', 'name')
    .populate('items.product', 'name')
    .sort({ createdAt: -1 })
    .limit(5);

  res.status(200).json({
    success: true,
    data: recentOrders
  });
});

// @desc    Get sales by category
// @route   GET /api/dashboard/sales-by-category
// @access  Private
const getSalesByCategory = asyncHandler(async (req, res) => {
  let matchQuery = { status: { $ne: 'Cancelled' } };

  // Salespersons can only see their own data
  if (req.user.role === 'salesperson') {
    matchQuery.createdBy = req.user._id;
  }

  const salesByCategory = await Order.aggregate([
    { $match: matchQuery },
    { $unwind: '$items' },
    {
      $lookup: {
        from: 'products',
        localField: 'items.product',
        foreignField: '_id',
        as: 'product'
      }
    },
    { $unwind: '$product' },
    {
      $group: {
        _id: '$product.category',
        revenue: { $sum: '$items.totalPrice' },
        quantity: { $sum: '$items.quantity' },
        orders: { $addToSet: '$_id' }
      }
    },
    {
      $addFields: {
        orderCount: { $size: '$orders' }
      }
    },
    {
      $project: {
        category: '$_id',
        revenue: 1,
        quantity: 1,
        orderCount: 1
      }
    },
    { $sort: { revenue: -1 } }
  ]);

  res.status(200).json({
    success: true,
    data: salesByCategory
  });
});

// @desc    Get customer analytics
// @route   GET /api/dashboard/customer-analytics
// @access  Private
const getCustomerAnalytics = asyncHandler(async (req, res) => {
  let matchQuery = { status: { $ne: 'Cancelled' } };

  // Salespersons can only see their own data
  if (req.user.role === 'salesperson') {
    matchQuery.createdBy = req.user._id;
  }

  // Top customers by revenue
  const topCustomers = await Order.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$customer',
        totalRevenue: { $sum: '$grandTotal' },
        orderCount: { $sum: 1 },
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
    {
      $project: {
        name: '$customer.name',
        company: '$customer.company',
        email: '$customer.email',
        totalRevenue: 1,
        orderCount: 1,
        averageOrderValue: 1
      }
    },
    { $sort: { totalRevenue: -1 } },
    { $limit: 10 }
  ]);

  // New customers vs returning customers
  const customerTypeData = await Order.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$customer',
        firstOrderDate: { $min: '$orderDate' },
        orderCount: { $sum: 1 }
      }
    },
    {
      $addFields: {
        isNew: {
          $gte: ['$firstOrderDate', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)]
        }
      }
    },
    {
      $group: {
        _id: '$isNew',
        count: { $sum: 1 },
        totalRevenue: { $sum: '$orderCount' }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      topCustomers,
      customerTypes: customerTypeData
    }
  });
});

module.exports = {
  getDashboardStats,
  getMonthlySales,
  getTopProducts,
  getOrderStatusBreakdown,
  getRecentOrders,
  getSalesByCategory,
  getCustomerAnalytics
};
