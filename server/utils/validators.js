const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().reduce((acc, error) => {
        acc[error.path] = error.msg;
        return acc;
      }, {})
    });
  }
  next();
};

// User validation
const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('role')
    .optional()
    .isIn(['admin', 'manager', 'salesperson'])
    .withMessage('Role must be admin, manager, or salesperson'),
  handleValidationErrors
];

const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

const validateUserUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('role')
    .optional()
    .isIn(['admin', 'manager', 'salesperson'])
    .withMessage('Role must be admin, manager, or salesperson'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  handleValidationErrors
];

// Customer validation
const validateCustomer = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('address.street')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Street address cannot exceed 200 characters'),
  body('address.city')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('City cannot exceed 50 characters'),
  body('address.state')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('State cannot exceed 50 characters'),
  body('address.zipCode')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Zip code cannot exceed 20 characters'),
  body('company')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Company name cannot exceed 100 characters'),
  body('creditLimit')
    .optional()
    .isNumeric()
    .withMessage('Credit limit must be a number')
    .isFloat({ min: 0 })
    .withMessage('Credit limit cannot be negative'),
  handleValidationErrors
];

// Product validation
const validateProduct = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  body('price')
    .isNumeric()
    .withMessage('Price must be a number')
    .isFloat({ min: 0 })
    .withMessage('Price cannot be negative'),
  body('cost')
    .optional()
    .isNumeric()
    .withMessage('Cost must be a number')
    .isFloat({ min: 0 })
    .withMessage('Cost cannot be negative'),
  body('stock')
    .optional()
    .isNumeric()
    .withMessage('Stock must be a number')
    .isInt({ min: 0 })
    .withMessage('Stock cannot be negative'),
  body('minStockLevel')
    .optional()
    .isNumeric()
    .withMessage('Minimum stock level must be a number')
    .isInt({ min: 0 })
    .withMessage('Minimum stock level cannot be negative'),
  body('unit')
    .trim()
    .notEmpty()
    .withMessage('Unit is required'),
  body('sku')
    .trim()
    .notEmpty()
    .withMessage('SKU is required')
    .isLength({ max: 50 })
    .withMessage('SKU cannot exceed 50 characters'),
  handleValidationErrors
];

// Order validation
const validateOrder = [
  body('customer')
    .isMongoId()
    .withMessage('Valid customer ID is required'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item'),
  body('items.*.product')
    .isMongoId()
    .withMessage('Valid product ID is required for each item'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  body('items.*.unitPrice')
    .isNumeric()
    .withMessage('Unit price must be a number')
    .isFloat({ min: 0 })
    .withMessage('Unit price cannot be negative'),
  body('discount')
    .optional()
    .isNumeric()
    .withMessage('Discount must be a number')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Discount must be between 0 and 100'),
  body('tax')
    .optional()
    .isNumeric()
    .withMessage('Tax must be a number')
    .isFloat({ min: 0 })
    .withMessage('Tax cannot be negative'),
  body('shipping')
    .optional()
    .isNumeric()
    .withMessage('Shipping must be a number')
    .isFloat({ min: 0 })
    .withMessage('Shipping cannot be negative'),
  body('paymentMethod')
    .optional()
    .isIn(['Cash', 'Card', 'Bank Transfer', 'Check', 'Other'])
    .withMessage('Invalid payment method'),
  body('status')
    .optional()
    .isIn(['Pending', 'Processing', 'Completed', 'Cancelled'])
    .withMessage('Invalid order status'),
  handleValidationErrors
];

// Invoice validation
const validateInvoice = [
  body('order')
    .isMongoId()
    .withMessage('Valid order ID is required'),
  body('dueDate')
    .isISO8601()
    .withMessage('Valid due date is required'),
  body('paymentTerms')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Payment terms cannot exceed 100 characters'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
  handleValidationErrors
];

// ID parameter validation
const validateId = [
  param('id')
    .isMongoId()
    .withMessage('Valid ID is required'),
  handleValidationErrors
];

// Pagination and query validation
const validateQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search term cannot exceed 100 characters'),
  query('sort')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Sort field cannot exceed 50 characters'),
  handleValidationErrors
];

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validateCustomer,
  validateProduct,
  validateOrder,
  validateInvoice,
  validateId,
  validateQuery
};
