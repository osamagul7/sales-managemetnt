const express = require('express');
const router = express.Router();
const {
  getInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  addPayment,
  getOverdueInvoices,
  getInvoiceStats
} = require('../controllers/invoiceController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const {
  validateInvoice,
  validateId,
  validateQuery
} = require('../utils/validators');

// All routes require authentication
router.use(protect);

// Public routes for all authenticated users
router.get('/', validateQuery, getInvoices);
router.get('/stats', getInvoiceStats);
router.get('/overdue', getOverdueInvoices);
router.get('/:id', validateId, getInvoice);

// Routes that require modification permissions
router.post('/', validateInvoice, createInvoice);
router.put('/:id', validateId, updateInvoice);
router.put('/:id/payment', validateId, addPayment);

// Delete route requires admin role
router.delete('/:id', validateId, authorize('admin'), deleteInvoice);

module.exports = router;
