const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
  getLowStockProducts,
  getCategories,
  getProductStats
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const {
  validateProduct,
  validateId,
  validateQuery
} = require('../utils/validators');

// All routes require authentication
router.use(protect);

// Public routes for all authenticated users
router.get('/', validateQuery, getProducts);
router.get('/stats', getProductStats);
router.get('/categories', getCategories);
router.get('/low-stock', getLowStockProducts);
router.get('/:id', validateId, getProduct);

// Routes that require admin or manager role
router.post('/', authorize('admin', 'manager'), validateProduct, createProduct);
router.put('/:id', validateId, authorize('admin', 'manager'), validateProduct, updateProduct);
router.delete('/:id', validateId, authorize('admin'), deleteProduct);
router.put('/:id/stock', validateId, authorize('admin', 'manager'), updateStock);

module.exports = router;
