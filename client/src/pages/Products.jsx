import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Filter, Download, Edit, Eye, Trash2, Package, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import Badge from '../components/Badge'
import LoadingSpinner from '../components/LoadingSpinner'
import api from '../utils/api'
import { formatCurrency, formatDate, getStatusBadgeColor } from '../utils/helpers'
import toast from 'react-hot-toast'

const Products = () => {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 })
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [filters, setFilters] = useState({ category: '', status: '', stockStatus: '' })
  const [categories, setCategories] = useState([])

  const columns = [
    {
      key: 'name',
      title: 'Product',
      render: (value, row) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center">
            <Package className="h-5 w-5 text-gray-600" />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{typeof value === 'object' ? value.name || value : value}</div>
            <div className="text-sm text-gray-500">SKU: {row.sku}</div>
          </div>
        </div>
      )
    },
    {
      key: 'category',
      title: 'Category',
      render: (value) => (
        <Badge variant="info">{value}</Badge>
      )
    },
    {
      key: 'price',
      title: 'Price',
      render: (value) => (
        <span className="text-sm font-medium">{formatCurrency(value)}</span>
      )
    },
    {
      key: 'stock',
      title: 'Stock',
      render: (value, row) => {
        const stockStatus = value <= row.minStockLevel ? 'low' : value === 0 ? 'out' : 'normal'
        const statusColor = stockStatus === 'low' ? 'warning' : stockStatus === 'out' ? 'danger' : 'success'
        
        return (
          <div className="flex items-center">
            <span className="text-sm font-medium">{value}</span>
            <Badge variant={statusColor} className="ml-2">
              {stockStatus}
            </Badge>
          </div>
        )
      }
    },
    {
      key: 'status',
      title: 'Status',
      render: (value) => (
        <Badge variant={value === 'active' ? 'success' : 'danger'}>
          {value}
        </Badge>
      )
    }
  ]

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [pagination.page, searchTerm, filters])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page,
        limit: 10,
        search: searchTerm,
        ...filters
      })
      
      const response = await api.get(`/products?${params}`)
      setProducts(response.data.data)
      setPagination({
        page: response.data.pagination.page,
        totalPages: response.data.pagination.totalPages
      })
    } catch (error) {
      console.error('Failed to fetch products:', error)
      toast.error('Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await api.get('/products/categories')
      setCategories(response.data.data)
    } catch (error) {
      console.error('Failed to fetch categories:', error)
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
    setSelectedProduct(null)
    setShowModal(true)
  }

  const handleEdit = (product) => {
    setSelectedProduct(product)
    setShowModal(true)
  }

  const handleDelete = async (product) => {
    if (window.confirm(`Are you sure you want to delete ${product.name}?`)) {
      try {
        await api.delete(`/products/${product._id}`)
        toast.success('Product deleted successfully')
        fetchProducts()
      } catch (error) {
        console.error('Failed to delete product:', error)
        toast.error('Failed to delete product')
      }
    }
  }

  const handleView = (product) => {
    navigate(`/products/${product._id}`)
  }

  const handleModalClose = () => {
    setShowModal(false)
    setSelectedProduct(null)
  }

  const handleSave = async (productData) => {
    try {
      if (selectedProduct) {
        await api.put(`/products/${selectedProduct._id}`, productData)
        toast.success('Product updated successfully')
      } else {
        await api.post('/products', productData)
        toast.success('Product created successfully')
      }
      handleModalClose()
      fetchProducts()
    } catch (error) {
      console.error('Failed to save product:', error)
      toast.error('Failed to save product')
    }
  }

  const lowStockProducts = products.filter(p => p.stock <= p.minStockLevel)
  const outOfStockProducts = products.filter(p => p.stock === 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your product inventory
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="stat-card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="stat-card-title">Total Products</dt>
                  <dd className="stat-card-value">{products.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="stat-card-title">In Stock</dt>
                  <dd className="stat-card-value">
                    {products.filter(p => p.stock > 0).length}
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
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="stat-card-title">Low Stock</dt>
                  <dd className="stat-card-value">{lowStockProducts.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="stat-card-title">Out of Stock</dt>
                  <dd className="stat-card-value">{outOfStockProducts.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
        <div className="card border-l-4 border-yellow-400 bg-yellow-50">
          <div className="card-body">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Inventory Alert
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  {lowStockProducts.length > 0 && (
                    <p>{lowStockProducts.length} products are running low on stock.</p>
                  )}
                  {outOfStockProducts.length > 0 && (
                    <p>{outOfStockProducts.length} products are out of stock.</p>
                  )}
                  <button
                    onClick={() => setFilters({ stockStatus: 'low' })}
                    className="text-yellow-800 underline hover:text-yellow-900"
                  >
                    View Low Stock Items
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Data Table */}
      <DataTable
        data={products}
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

      {/* Product Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleModalClose}
        title={selectedProduct ? 'Edit Product' : 'Add Product'}
        size="lg"
      >
        <ProductForm
          product={selectedProduct}
          categories={categories}
          onSave={handleSave}
          onCancel={handleModalClose}
        />
      </Modal>
    </div>
  )
}

// Product Form Component
const ProductForm = ({ product, categories, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    category: '',
    price: 0,
    stock: 0,
    minStockLevel: 10,
    status: 'active',
    ...product
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="input"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            SKU *
          </label>
          <input
            type="text"
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            required
            className="input"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="input"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="input"
          >
            <option value="">Select Category</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price ($) *
          </label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="input"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Stock Quantity *
          </label>
          <input
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            required
            min="0"
            className="input"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Min Stock Level *
          </label>
          <input
            type="number"
            name="minStockLevel"
            value={formData.minStockLevel}
            onChange={handleChange}
            required
            min="0"
            className="input"
          />
        </div>
      </div>

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
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
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
          {product ? 'Update' : 'Create'} Product
        </button>
      </div>
    </form>
  )
}

export default Products
