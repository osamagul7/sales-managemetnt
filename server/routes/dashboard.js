const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getMonthlySales,
  getTopProducts,
  getOrderStatusBreakdown,
  getRecentOrders,
  getSalesByCategory,
  getCustomerAnalytics
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.get('/stats', getDashboardStats);
router.get('/monthly-sales', getMonthlySales);
router.get('/top-products', getTopProducts);
router.get('/order-status', getOrderStatusBreakdown);
router.get('/recent-orders', getRecentOrders);
router.get('/sales-by-category', getSalesByCategory);
router.get('/customer-analytics', getCustomerAnalytics);

module.exports = router;
