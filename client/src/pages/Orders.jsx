import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Filter, Download, Edit, Eye, Trash2, ShoppingCart, DollarSign, Package, Calendar, User } from 'lucide-react'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import Badge from '../components/Badge'
import LoadingSpinner from '../components/LoadingSpinner'
import api from '../utils/api'
import { formatCurrency, formatDate, getStatusBadgeColor } from '../utils/helpers'
import toast from 'react-hot-toast'

const Orders = () => {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 })
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [filters, setFilters] = useState({ status: '', dateRange: '', customer: '' })

  const columns = [
    {
      key: 'orderNumber',
      title: 'Order #',
      render: (value) => (
        <span className="font-mono text-sm">{value}</span>
      )
    },
    {
      key: 'customer',
      title: 'Customer',
      render: (value, row) => (
        <div className="flex items-center">
          <User className="h-4 w-4 text-gray-400 mr-2" />
          <div>
            <div className="text-sm font-medium text-gray-900">{typeof value === 'object' ? value.name || value : value}</div>
            <div className="text-xs text-gray-500">{row.customer?.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'items',
      title: 'Items',
      render: (value, row) => (
        <div className="text-sm">
          {value.length} item{value.length !== 1 ? 's' : ''}
        </div>
      )
    },
    {
      key: 'subTotal',
      title: 'Subtotal',
      render: (value) => (
        <span className="text-sm font-medium">{formatCurrency(value)}</span>
      )
    },
    {
      key: 'grandTotal',
      title: 'Total',
      render: (value) => (
        <span className="text-sm font-bold">{formatCurrency(value)}</span>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (value) => (
        <Badge variant={getStatusBadgeColor(value)}>
          {value}
        </Badge>
      )
    },
    {
      key: 'createdAt',
      title: 'Date',
      render: (value) => (
        <span className="text-sm">{formatDate(value)}</span>
      )
    }
  ]

  useEffect(() => {
    fetchOrders()
  }, [pagination.page, searchTerm, filters])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page,
        limit: 10,
        search: searchTerm,
        ...filters
      })
      
      const response = await api.get(`/orders?${params}`)
      setOrders(response.data.data)
      setPagination({
        page: response.data.pagination.page,
        totalPages: response.data.pagination.totalPages
      })
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      toast.error('Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (term) => {
    setSearchTerm(term)
    setPagination({ page: 1, totalPages: 1 })
  }

  const handleFilter = (newFilters) => {
    setFilters(newFilters)
    setPagination({ page: 1, totalPages: 1 })
  }

  const handleAdd = () => {
    setSelectedOrder(null)
    setShowModal(true)
  }

  const handleEdit = (order) => {
    setSelectedOrder(order)
    setShowModal(true)
  }

  const handleDelete = async (order) => {
    if (window.confirm(`Are you sure you want to delete order ${order.orderNumber}?`)) {
      try {
        await api.delete(`/orders/${order._id}`)
        toast.success('Order deleted successfully')
        fetchOrders()
      } catch (error) {
        console.error('Failed to delete order:', error)
        toast.error('Failed to delete order')
      }
    }
  }

  const handleView = (order) => {
    navigate(`/orders/${order._id}`)
  }

  const handleModalClose = () => {
    setShowModal(false)
    setSelectedOrder(null)
  }

  const handleSave = async (orderData) => {
    try {
      if (selectedOrder) {
        await api.put(`/orders/${selectedOrder._id}`, orderData)
        toast.success('Order updated successfully')
      } else {
        await api.post('/orders', orderData)
        toast.success('Order created successfully')
      }
      handleModalClose()
      fetchOrders()
    } catch (error) {
      console.error('Failed to save order:', error)
      toast.error('Failed to save order')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage customer orders
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Create Order</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="stat-card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="stat-card-title">Total Orders</dt>
                  <dd className="stat-card-value">{orders.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="stat-card-title">Total Revenue</dt>
                  <dd className="stat-card-value">
                    {formatCurrency(orders.reduce((sum, order) => sum + order.grandTotal, 0))}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="stat-card-title">This Month</dt>
                  <dd className="stat-card-value">
                    {orders.filter(order => {
                      const orderDate = new Date(order.createdAt)
                      const now = new Date()
                      return orderDate.getMonth() === now.getMonth() && 
                             orderDate.getFullYear() === now.getFullYear()
                    }).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="stat-card-title">Pending Orders</dt>
                  <dd className="stat-card-value">
                    {orders.filter(order => order.status === 'Pending').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={orders}
        columns={columns}
        loading={loading}
        pagination={true}
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={(page) => setPagination({ ...pagination, page })}
        onSearch={handleSearch}
        onFilter={handleFilter}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        actions={['view', 'edit', 'delete']}
        searchable={true}
        filterable={true}
        exportable={true}
      />

      {/* Order Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleModalClose}
        title={selectedOrder ? 'Edit Order' : 'Create Order'}
        size="xl"
      >
        <OrderForm
          order={selectedOrder}
          onSave={handleSave}
          onCancel={handleModalClose}
        />
      </Modal>
    </div>
  )
}

// Order Form Component
const OrderForm = ({ order, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    customer: '',
    items: [],
    status: 'Pending',
    notes: ''
  })
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchCustomers()
    fetchProducts()
  }, [])

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers?limit=100')
      setCustomers(response.data.data)
    } catch (error) {
      console.error('Failed to fetch customers:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products?limit=100')
      setProducts(response.data.data)
    } catch (error) {
      console.error('Failed to fetch products:', error)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { product: '', quantity: 1, price: 0 }]
    }))
  }

  const handleRemoveItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))
  }

  const handleItemChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  const calculateTotals = () => {
    const subTotal = formData.items.reduce((sum, item) => {
      const itemTotal = item.price * item.quantity
      return sum + itemTotal
    }, 0)
    
    return {
      subTotal,
      grandTotal: subTotal * 1.1 // 10% tax
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const totals = calculateTotals()
    onSave({ ...formData, ...totals })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Customer *
          </label>
          <select
            name="customer"
            value={formData.customer}
            onChange={handleChange}
            required
            className="input"
          >
            <option value="">Select Customer</option>
            {customers.map(customer => (
              <option key={customer._id} value={customer._id}>
                {customer.name}
              </option>
            ))}
          </select>
        </div>

        {/* Order Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="input"
          >
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Order Items */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Order Items</h3>
          <button
            type="button"
            onClick={handleAddItem}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Item</span>
          </button>
        </div>

        <div className="space-y-4">
          {formData.items.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product *
                  </label>
                  <select
                    name={`product-${index}`}
                    value={item.product}
                    onChange={(e) => handleItemChange(index, 'product', e.target.value)}
                    required
                    className="input"
                  >
                    <option value="">Select Product</option>
                    {products.map(product => (
                      <option key={product._id} value={product._id}>
                        {product.name} - {formatCurrency(product.price)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    name={`quantity-${index}`}
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                    required
                    min="1"
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price
                  </label>
                  <input
                    type="number"
                    name={`price-${index}`}
                    value={item.price}
                    onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value))}
                    required
                    min="0"
                    step="0.01"
                    className="input"
                    disabled={!!item.product}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total
                  </label>
                  <div className="input bg-gray-100">
                    {formatCurrency(item.price * item.quantity)}
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  className="text-red-600 hover:text-red-800 p-2"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Order Notes
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          className="input"
          placeholder="Add any special instructions or notes..."
        />
      </div>

      {/* Order Summary */}
      <div className="border-t border-gray-200 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">Order Summary</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Subtotal:</span>
                <span className="text-sm font-medium">
                  {formatCurrency(calculateTotals().subTotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Tax (10%):</span>
                <span className="text-sm font-medium">
                  {formatCurrency(calculateTotals().subTotal * 0.1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-lg font-bold text-gray-900">Total:</span>
                <span className="text-lg font-bold text-primary-600">
                  {formatCurrency(calculateTotals().grandTotal)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="btn-outline"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary"
        >
          {order ? 'Update' : 'Create'} Order
        </button>
      </div>
    </form>
  )
}

export default Orders
