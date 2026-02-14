const Invoice = require('../models/Invoice');
const Order = require('../models/Order');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get all invoices
// @route   GET /api/invoices
// @access  Private
const getInvoices = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const search = req.query.search || '';
  const status = req.query.status || '';
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;

  // Build query
  let query = {};

  // Salespersons can only see their own invoices
  if (req.user.role === 'salesperson') {
    query.createdBy = req.user._id;
  }

  if (search) {
    query.$or = [
      { invoiceNumber: { $regex: search, $options: 'i' } }
    ];
  }

  if (status) {
    query.status = status;
  }

  if (startDate || endDate) {
    query.issueDate = {};
    if (startDate) query.issueDate.$gte = new Date(startDate);
    if (endDate) query.issueDate.$lte = new Date(endDate);
  }

  const skip = (page - 1) * limit;

  const invoices = await Invoice.find(query)
    .populate('customer', 'name email company')
    .populate('order', 'orderNumber')
    .populate('createdBy', 'name email')
    .populate({
      path: 'items',
      populate: {
        path: 'product',
        select: 'name description'
      }
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Invoice.countDocuments(query);

  res.json({
    success: true,
    data: invoices,
    pagination: {
      page,
      limit,
      total: total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get single invoice
// @route   GET /api/invoices/:id
// @access  Private
const getInvoice = asyncHandler(async (req, res) => {
  let query = { _id: req.params.id };

  // Salespersons can only see their own invoices
  if (req.user.role === 'salesperson') {
    query.createdBy = req.user._id;
  }

  const invoice = await Invoice.findOne(query)
    .populate('customer', 'name email phone address company taxId')
    .populate('order', 'orderNumber items status paymentMethod')
    .populate('createdBy', 'name email')
    .populate('paymentHistory.recordedBy', 'name email');

  if (!invoice) {
    return res.status(404).json({
      success: false,
      message: 'Invoice not found'
    });
  }

  res.status(200).json({
    success: true,
    data: invoice
  });
});

// @desc    Create invoice from order
// @route   POST /api/invoices
// @access  Private
const createInvoice = asyncHandler(async (req, res) => {
  const { order, dueDate, paymentTerms, notes, terms } = req.body;

  // Validate order exists
  const orderDoc = await Order.findById(order)
    .populate('customer')
    .populate('items.product');

  if (!orderDoc) {
    return res.status(400).json({
      success: false,
      message: 'Order not found'
    });
  }

  // Check if invoice already exists for this order
  const existingInvoice = await Invoice.findOne({ order });
  if (existingInvoice) {
    return res.status(400).json({
      success: false,
      message: 'Invoice already exists for this order'
    });
  }

  // Check order ownership
  if (req.user.role === 'salesperson' && orderDoc.createdBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to create invoice for this order'
    });
  }

  // Generate invoice number
  const invoiceNumber = await Invoice.generateInvoiceNumber();

  // Create invoice
  const invoice = await Invoice.create({
    invoiceNumber,
    order,
    customer: orderDoc.customer._id,
    dueDate: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    paymentTerms: paymentTerms || 'Net 30',
    notes,
    terms,
    companyInfo: {
      name: 'Your Company Name', // This should come from settings
      address: {
        street: '123 Business St',
        city: 'Business City',
        state: 'BC',
        zipCode: '12345',
        country: 'USA'
      },
      phone: '+1 (555) 123-4567',
      email: 'billing@yourcompany.com',
      website: 'www.yourcompany.com',
      taxId: 'TAX-123456'
    },
    createdBy: req.user._id
  });

  // Populate and return invoice
  const populatedInvoice = await Invoice.findById(invoice._id)
    .populate('customer', 'name email company')
    .populate('order', 'orderNumber')
    .populate('createdBy', 'name email');

  res.status(201).json({
    success: true,
    message: 'Invoice created successfully',
    data: populatedInvoice
  });
});

// @desc    Update invoice
// @route   PUT /api/invoices/:id
// @access  Private
const updateInvoice = asyncHandler(async (req, res) => {
  let query = { _id: req.params.id };

  // Salespersons can only update their own invoices
  if (req.user.role === 'salesperson') {
    query.createdBy = req.user._id;
  }

  const invoice = await Invoice.findOne(query);

  if (!invoice) {
    return res.status(404).json({
      success: false,
      message: 'Invoice not found'
    });
  }

  // Prevent modification of paid invoices
  if (invoice.status === 'Paid') {
    return res.status(400).json({
      success: false,
      message: 'Cannot modify paid invoice'
    });
  }

  const { status, notes, terms, paymentTerms } = req.body;

  invoice.status = status || invoice.status;
  invoice.notes = notes !== undefined ? notes : invoice.notes;
  invoice.terms = terms !== undefined ? terms : invoice.terms;
  invoice.paymentTerms = paymentTerms || invoice.paymentTerms;

  if (status === 'Sent' && invoice.status !== 'Sent') {
    invoice.sentDate = new Date();
  }

  await invoice.save();

  const updatedInvoice = await Invoice.findById(invoice._id)
    .populate('customer', 'name email company')
    .populate('order', 'orderNumber')
    .populate('createdBy', 'name email');

  res.status(200).json({
    success: true,
    message: 'Invoice updated successfully',
    data: updatedInvoice
  });
});

// @desc    Delete invoice
// @route   DELETE /api/invoices/:id
// @access  Private/Admin
const deleteInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);

  if (!invoice) {
    return res.status(404).json({
      success: false,
      message: 'Invoice not found'
    });
  }

  // Prevent deletion of paid invoices
  if (invoice.status === 'Paid') {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete paid invoice'
    });
  }

  await invoice.remove();

  res.status(200).json({
    success: true,
    message: 'Invoice deleted successfully'
  });
});

// @desc    Add payment to invoice
// @route   PUT /api/invoices/:id/payment
// @access  Private
const addPayment = asyncHandler(async (req, res) => {
  let query = { _id: req.params.id };

  // Salespersons can only update their own invoices
  if (req.user.role === 'salesperson') {
    query.createdBy = req.user._id;
  }

  const invoice = await Invoice.findOne(query);

  if (!invoice) {
    return res.status(404).json({
      success: false,
      message: 'Invoice not found'
    });
  }

  const { amount, method, reference, notes } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Payment amount must be greater than 0'
    });
  }

  if (invoice.paidAmount + amount > invoice.totalAmount) {
    return res.status(400).json({
      success: false,
      message: 'Payment amount exceeds invoice total'
    });
  }

  // Add payment to history
  const payment = {
    amount,
    method,
    reference,
    notes,
    recordedBy: req.user._id
  };

  await invoice.addPayment(payment);

  const updatedInvoice = await Invoice.findById(invoice._id)
    .populate('customer', 'name email company')
    .populate('order', 'orderNumber')
    .populate('createdBy', 'name email')
    .populate('paymentHistory.recordedBy', 'name email');

  res.status(200).json({
    success: true,
    message: 'Payment added successfully',
    data: updatedInvoice
  });
});

// @desc    Get overdue invoices
// @route   GET /api/invoices/overdue
// @access  Private
const getOverdueInvoices = asyncHandler(async (req, res) => {
  let query = {
    status: { $in: ['Sent', 'Overdue'] },
    dueDate: { $lt: new Date() },
    balanceDue: { $gt: 0 }
  };

  // Salespersons can only see their own invoices
  if (req.user.role === 'salesperson') {
    query.createdBy = req.user._id;
  }

  const invoices = await Invoice.find(query)
    .populate('customer', 'name email company')
    .populate('order', 'orderNumber')
    .sort({ dueDate: 1 });

  const totalOverdue = invoices.reduce((sum, invoice) => sum + invoice.balanceDue, 0);

  res.status(200).json({
    success: true,
    data: invoices,
    count: invoices.length,
    totalOverdue
  });
});

// @desc    Get invoice statistics
// @route   GET /api/invoices/stats
// @access  Private
const getInvoiceStats = asyncHandler(async (req, res) => {
  let matchQuery = {};

  // Salespersons can only see their own invoices
  if (req.user.role === 'salesperson') {
    matchQuery.createdBy = req.user._id;
  }

  const totalInvoices = await Invoice.countDocuments(matchQuery);
  const draftInvoices = await Invoice.countDocuments({ ...matchQuery, status: 'Draft' });
  const sentInvoices = await Invoice.countDocuments({ ...matchQuery, status: 'Sent' });
  const paidInvoices = await Invoice.countDocuments({ ...matchQuery, status: 'Paid' });
  const overdueInvoices = await Invoice.countDocuments({ ...matchQuery, status: 'Overdue' });

  // Financial calculations
  const financialData = await Invoice.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$totalAmount' },
        totalPaid: { $sum: '$paidAmount' },
        totalOutstanding: { $sum: '$balanceDue' },
        averageInvoiceAmount: { $avg: '$totalAmount' }
      }
    }
  ]);

  // Invoices this month
  const thisMonth = new Date();
  thisMonth.setDate(1);
  const invoicesThisMonth = await Invoice.countDocuments({
    ...matchQuery,
    createdAt: { $gte: thisMonth }
  });

  // Overdue amount
  const overdueData = await Invoice.aggregate([
    {
      $match: {
        ...matchQuery,
        status: { $in: ['Sent', 'Overdue'] },
        dueDate: { $lt: new Date() },
        balanceDue: { $gt: 0 }
      }
    },
    {
      $group: {
        _id: null,
        totalOverdue: { $sum: '$balanceDue' },
        count: { $sum: 1 }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalInvoices,
      draftInvoices,
      sentInvoices,
      paidInvoices,
      overdueInvoices,
      invoicesThisMonth,
      ...(financialData[0] || {
        totalAmount: 0,
        totalPaid: 0,
        totalOutstanding: 0,
        averageInvoiceAmount: 0
      }),
      ...(overdueData[0] || { totalOverdue: 0, count: 0 })
    }
  });
});

module.exports = {
  getInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  addPayment,
  getOverdueInvoices,
  getInvoiceStats
};
