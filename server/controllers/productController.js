const Product = require('../models/Product');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get all products
// @route   GET /api/products
// @access  Private
const getProducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const search = req.query.search || '';
  const category = req.query.category || '';
  const isActive = req.query.isActive;
  const stockStatus = req.query.stockStatus; // low_stock, out_of_stock, in_stock

  // Build query
  let query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { sku: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } }
    ];
  }

  if (category) {
    query.category = category;
  }

  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  if (stockStatus) {
    switch (stockStatus) {
      case 'low_stock':
        query.$expr = { $lte: ['$stock', '$minStockLevel'] };
        break;
      case 'out_of_stock':
        query.stock = 0;
        break;
      case 'in_stock':
        query.$expr = { $gt: ['$stock', '$minStockLevel'] };
        break;
    }
  }

  const skip = (page - 1) * limit;

  const products = await Product.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Product.countDocuments(query);

  res.status(200).json({
    success: true,
    data: products,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Private
const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  res.status(200).json({
    success: true,
    data: product
  });
});

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin/Manager
const createProduct = asyncHandler(async (req, res) => {
  // Check for duplicate SKU
  const existingProduct = await Product.findOne({ sku: req.body.sku });
  if (existingProduct) {
    return res.status(400).json({
      success: false,
      message: 'Product with this SKU already exists'
    });
  }

  const product = await Product.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: product
  });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin/Manager
const updateProduct = asyncHandler(async (req, res) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  // Check for duplicate SKU if SKU is being changed
  if (req.body.sku && req.body.sku !== product.sku) {
    const existingProduct = await Product.findOne({ sku: req.body.sku });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: 'Product with this SKU already exists'
      });
    }
  }

  product = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: 'Product updated successfully',
    data: product
  });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  await product.remove();

  res.status(200).json({
    success: true,
    message: 'Product deleted successfully'
  });
});

// @desc    Update product stock
// @route   PUT /api/products/:id/stock
// @access  Private/Admin/Manager
const updateStock = asyncHandler(async (req, res) => {
  const { quantity, operation } = req.body;

  if (!quantity || quantity <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Quantity must be a positive number'
    });
  }

  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  const update = operation === 'add' 
    ? { $inc: { stock: quantity } }
    : { $inc: { stock: -quantity } };

  // Check if stock would go negative
  if (operation === 'subtract' && product.stock < quantity) {
    return res.status(400).json({
      success: false,
      message: 'Insufficient stock for this operation'
    });
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    update,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: `Stock ${operation === 'add' ? 'increased' : 'decreased'} successfully`,
    data: updatedProduct
  });
});

// @desc    Get low stock products
// @route   GET /api/products/low-stock
// @access  Private
const getLowStockProducts = asyncHandler(async (req, res) => {
  const products = await Product.getLowStockProducts();

  res.status(200).json({
    success: true,
    data: products,
    count: products.length
  });
});

// @desc    Get product categories
// @route   GET /api/products/categories
// @access  Private
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Product.distinct('category', { isActive: true });

  res.status(200).json({
    success: true,
    data: categories
  });
});

// @desc    Get product statistics
// @route   GET /api/products/stats
// @access  Private
const getProductStats = asyncHandler(async (req, res) => {
  const totalProducts = await Product.countDocuments();
  const activeProducts = await Product.countDocuments({ isActive: true });
  const lowStockProducts = await Product.countDocuments({
    $expr: { $lte: ['$stock', '$minStockLevel'] },
    isActive: true
  });
  const outOfStockProducts = await Product.countDocuments({
    stock: 0,
    isActive: true
  });

  // Get category distribution
  const categoryStats = await Product.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalStock: { $sum: '$stock' },
        totalValue: { $sum: { $multiply: ['$stock', '$price'] } }
      }
    },
    { $sort: { count: -1 } }
  ]);

  // Get top valued products
  const topValuedProducts = await Product.find({ isActive: true })
    .sort({ stock: -1 })
    .limit(10)
    .select('name sku stock price category');

  res.status(200).json({
    success: true,
    data: {
      totalProducts,
      activeProducts,
      inactiveProducts: totalProducts - activeProducts,
      lowStockProducts,
      outOfStockProducts,
      categoryStats,
      topValuedProducts
    }
  });
});

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
  getLowStockProducts,
  getCategories,
  getProductStats
};
