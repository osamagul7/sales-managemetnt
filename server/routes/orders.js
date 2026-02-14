const express = require('express');
const router = express.Router();
const {
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,
  addPayment,
  getOrderStats
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const {
  validateOrder,
  validateId,
  validateQuery
} = require('../utils/validators');

// All routes require authentication
router.use(protect);

// Public routes for all authenticated users
router.get('/', validateQuery, getOrders);
router.get('/stats', getOrderStats);
router.get('/:id', validateId, getOrder);

// Routes that require modification permissions
router.post('/', validateOrder, createOrder);
router.put('/:id', validateId, updateOrder);
router.put('/:id/payment', validateId, addPayment);

// Delete route requires admin role
router.delete('/:id', validateId, authorize('admin'), deleteOrder);

module.exports = router;
