const express = require('express');
const router = express.Router();
const {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerOrders,
  getCustomerStats
} = require('../controllers/customerController');
const { protect, authorize, checkModifyAccess } = require('../middleware/auth');
const {
  validateCustomer,
  validateId,
  validateQuery
} = require('../utils/validators');

// All routes require authentication
router.use(protect);

// Public routes for all authenticated users
router.get('/', validateQuery, getCustomers);
router.get('/stats', getCustomerStats);
router.get('/:id', validateId, getCustomer);
router.get('/:id/orders', validateId, validateQuery, getCustomerOrders);

// Routes that require modification permissions
router.post('/', validateCustomer, createCustomer);
router.put('/:id', validateId, validateCustomer, updateCustomer);
router.delete('/:id', validateId, deleteCustomer);

module.exports = router;
