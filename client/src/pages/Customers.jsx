import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Filter, Download, Edit, Eye, Trash2, Phone, Mail, MapPin, Building, User } from 'lucide-react'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import Badge from '../components/Badge'
import LoadingSpinner from '../components/LoadingSpinner'
import api from '../utils/api'
import { formatCurrency, formatDate, getStatusBadgeColor } from '../utils/helpers'
import toast from 'react-hot-toast'

const Customers = () => {
  const navigate = useNavigate()
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 })
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [filters, setFilters] = useState({ status: '', category: '' })

  const columns = [
    {
      key: 'name',
      title: 'Customer',
      render: (value, row) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
            <User className="h-4 w-4 text-gray-400" />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{typeof value === 'object' ? value.name || value : value}</div>
            <div className="text-sm text-gray-500">{row.company}</div>
          </div>
        </div>
      )
    },
    {
      key: 'email',
      title: 'Email',
      render: (value) => (
        <div className="flex items-center">
          <Mail className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-sm">{value}</span>
        </div>
      )
    },
    {
      key: 'phone',
      title: 'Phone',
      render: (value) => (
        <div className="flex items-center">
          <Phone className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-sm">{value}</span>
        </div>
      )
    },
    {
      key: 'creditLimit',
      title: 'Credit Limit',
      render: (value) => (
        <span className="text-sm font-medium">{formatCurrency(value)}</span>
      )
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
    fetchCustomers()
  }, [pagination.page, searchTerm, filters])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page,
        limit: 10,
        search: searchTerm,
        ...filters
      })
      
      const response = await api.get(`/customers?${params}`)
      setCustomers(response.data.data)
      setPagination({
        page: response.data.pagination.page,
        totalPages: response.data.pagination.totalPages
      })
    } catch (error) {
      console.error('Failed to fetch customers:', error)
      toast.error('Failed to fetch customers')
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
    setSelectedCustomer(null)
    setShowModal(true)
  }

  const handleEdit = (customer) => {
    setSelectedCustomer(customer)
    setShowModal(true)
  }

  const handleDelete = async (customer) => {
    if (window.confirm(`Are you sure you want to delete ${customer.name}?`)) {
      try {
        await api.delete(`/customers/${customer._id}`)
        toast.success('Customer deleted successfully')
        fetchCustomers()
      } catch (error) {
        console.error('Failed to delete customer:', error)
        toast.error('Failed to delete customer')
      }
    }
  }

  const handleView = (customer) => {
    navigate(`/customers/${customer._id}`)
  }

  const handleModalClose = () => {
    setShowModal(false)
    setSelectedCustomer(null)
  }

  const handleSave = async (customerData) => {
    try {
      if (selectedCustomer) {
        await api.put(`/customers/${selectedCustomer._id}`, customerData)
        toast.success('Customer updated successfully')
      } else {
        await api.post('/customers', customerData)
        toast.success('Customer created successfully')
      }
      handleModalClose()
      fetchCustomers()
    } catch (error) {
      console.error('Failed to save customer:', error)
      toast.error('Failed to save customer')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Customers</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your customer database
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stat-card">
          <div className="stat-card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                <Building className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="stat-card-title">Total Customers</dt>
                  <dd className="stat-card-value">{customers.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                <Phone className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="stat-card-title">Active Customers</dt>
                  <dd className="stat-card-value">
                    {customers.filter(c => c.status === 'active').length}
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
                <Mail className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="stat-card-title">New This Month</dt>
                  <dd className="stat-card-value">12</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={customers}
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

      {/* Customer Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleModalClose}
        title={selectedCustomer ? 'Edit Customer' : 'Add Customer'}
        size="lg"
      >
        <CustomerForm
          customer={selectedCustomer}
          onSave={handleSave}
          onCancel={handleModalClose}
        />
      </Modal>
    </div>
  )
}

// Customer Form Component
const CustomerForm = ({ customer, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    creditLimit: 0,
    status: 'active',
    ...customer
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
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
            Name *
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
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="input"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="input"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company
          </label>
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleChange}
            className="input"
          />
        </div>
      </div>

      {/* Address */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Address</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Street
            </label>
            <input
              type="text"
              name="address.street"
              value={formData.address.street}
              onChange={handleChange}
              className="input"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>
            <input
              type="text"
              name="address.city"
              value={formData.address.city}
              onChange={handleChange}
              className="input"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              State
            </label>
            <input
              type="text"
              name="address.state"
              value={formData.address.state}
              onChange={handleChange}
              className="input"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ZIP Code
            </label>
            <input
              type="text"
              name="address.zipCode"
              value={formData.address.zipCode}
              onChange={handleChange}
              className="input"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country
            </label>
            <input
              type="text"
              name="address.country"
              value={formData.address.country}
              onChange={handleChange}
              className="input"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Credit Limit
          </label>
          <input
            type="number"
            name="creditLimit"
            value={formData.creditLimit}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="input"
          />
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
          {customer ? 'Update' : 'Create'} Customer
        </button>
      </div>
    </form>
  )
}

export default Customers
