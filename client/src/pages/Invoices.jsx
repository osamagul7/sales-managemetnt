import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Filter, Download, Edit, Eye, Trash2, FileText, DollarSign, AlertTriangle, Calendar } from 'lucide-react'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import Badge from '../components/Badge'
import LoadingSpinner from '../components/LoadingSpinner'
import api from '../utils/api'
import { formatCurrency, formatDate, getStatusBadgeColor } from '../utils/helpers'
import toast from 'react-hot-toast'

const Invoices = () => {
  const navigate = useNavigate()
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 })
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [filters, setFilters] = useState({ status: '', dateRange: '', customer: '' })

  const columns = [
    {
      key: 'invoiceNumber',
      title: 'Invoice #',
      render: (value) => (
        <span className="font-mono text-sm">{value}</span>
      )
    },
    {
      key: 'customer',
      title: 'Customer',
      render: (value, row) => (
        <div className="flex items-center">
          <div className="text-sm font-medium text-gray-900">{typeof value === 'object' ? value.name || value : value}</div>
          <div className="text-xs text-gray-500">{row.customer?.email}</div>
        </div>
      )
    },
    {
      key: 'order',
      title: 'Order',
      render: (value, row) => (
        <span className="font-mono text-sm">{typeof value === 'object' ? value.orderNumber || value : value}</span>
      )
    },
    {
      key: 'totalAmount',
      title: 'Total',
      render: (value) => (
        <span className="text-sm font-bold">{formatCurrency(value)}</span>
      )
    },
    {
      key: 'paidAmount',
      title: 'Paid',
      render: (value, row) => (
        <div className="flex items-center">
          <span className="text-sm">{formatCurrency(value)}</span>
          <Badge 
            variant={value >= row.totalAmount ? 'success' : 'warning'}
            className="ml-2"
          >
            {value >= row.totalAmount ? 'Paid' : 'Partial'}
          </Badge>
        </div>
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
      key: 'dueDate',
      title: 'Due Date',
      render: (value) => (
        <span className="text-sm">{formatDate(value)}</span>
      )
    },
    {
      key: 'createdAt',
      title: 'Created',
      render: (value) => (
        <span className="text-sm">{formatDate(value)}</span>
      )
    }
  ]

  useEffect(() => {
    fetchInvoices()
  }, [pagination.page, searchTerm, filters])

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page,
        limit: 10,
        search: searchTerm,
        ...filters
      })
      
      const response = await api.get(`/invoices?${params}`)
      setInvoices(response.data.data)
      setPagination({
        page: response.data.pagination.page,
        totalPages: response.data.pagination.totalPages
      })
    } catch (error) {
      console.error('Failed to fetch invoices:', error)
      toast.error('Failed to fetch invoices')
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
    setSelectedInvoice(null)
    setShowModal(true)
  }

  const handleEdit = (invoice) => {
    setSelectedInvoice(invoice)
    setShowModal(true)
  }

  const handleDelete = async (invoice) => {
    if (window.confirm(`Are you sure you want to delete invoice ${invoice.invoiceNumber}?`)) {
      try {
        await api.delete(`/invoices/${invoice._id}`)
        toast.success('Invoice deleted successfully')
        fetchInvoices()
      } catch (error) {
        console.error('Failed to delete invoice:', error)
        toast.error('Failed to delete invoice')
      }
    }
  }

  const handleView = (invoice) => {
    navigate(`/invoices/${invoice._id}`)
  }

  const handleDownload = async (invoice) => {
    try {
      const response = await api.get(`/invoices/${invoice._id}/download`)
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `invoice-${invoice.invoiceNumber}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success('Invoice downloaded successfully')
    } catch (error) {
      console.error('Failed to download invoice:', error)
      toast.error('Failed to download invoice')
    }
  }

  const handleModalClose = () => {
    setShowModal(false)
    setSelectedInvoice(null)
  }

  const handleSave = async (invoiceData) => {
    try {
      if (selectedInvoice) {
        await api.put(`/invoices/${selectedInvoice._id}`, invoiceData)
        toast.success('Invoice updated successfully')
      } else {
        await api.post('/invoices', invoiceData)
        toast.success('Invoice created successfully')
      }
      handleModalClose()
      fetchInvoices()
    } catch (error) {
      console.error('Failed to save invoice:', error)
      toast.error('Failed to save invoice')
    }
  }

  const overdueInvoices = invoices.filter(inv => inv.status === 'Overdue')
  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0)
  const paidRevenue = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Invoices</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage customer invoices
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Create Invoice</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="stat-card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="stat-card-title">Total Invoices</dt>
                  <dd className="stat-card-value">{invoices.length}</dd>
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
                  <dd className="stat-card-value">{formatCurrency(totalRevenue)}</dd>
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
                    {invoices.filter(inv => {
                      const invDate = new Date(inv.createdAt)
                      const now = new Date()
                      return invDate.getMonth() === now.getMonth() && 
                             invDate.getFullYear() === now.getFullYear()
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
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="stat-card-title">Paid Revenue</dt>
                  <dd className="stat-card-value">{formatCurrency(paidRevenue)}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="stat-card-title">Overdue</dt>
                  <dd className="stat-card-value">{overdueInvoices.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {overdueInvoices.length > 0 && (
        <div className="card border-l-4 border-red-400 bg-red-50">
          <div className="card-body">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Overdue Invoices Alert
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  {overdueInvoices.length} invoices are overdue. 
                  <button
                    onClick={() => setFilters({ status: 'Overdue' })}
                    className="text-red-800 underline hover:text-red-900 ml-2"
                  >
                    View Overdue
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Data Table */}
      <DataTable
        data={invoices}
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
        actions={['view', 'edit', 'delete', 'download']}
        searchable={true}
        filterable={true}
        exportable={true}
      />

      {/* Invoice Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleModalClose}
        title={selectedInvoice ? 'Edit Invoice' : 'Create Invoice'}
        size="lg"
      >
        <InvoiceForm
          invoice={selectedInvoice}
          onSave={handleSave}
          onCancel={handleModalClose}
        />
      </Modal>
    </div>
  )
}

// Invoice Form Component
const InvoiceForm = ({ invoice, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    order: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'Draft',
    notes: ''
  })
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await api.get('/orders?status=Completed&limit=100')
      setOrders(response.data.data)
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }

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
        {/* Order Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Order *
          </label>
          <select
            name="order"
            value={formData.order}
            onChange={handleChange}
            required
            className="input"
          >
            <option value="">Select Order</option>
            {orders.map(order => (
              <option key={order._id} value={order._id}>
                {order.orderNumber} - {formatCurrency(order.grandTotal)}
              </option>
            ))}
          </select>
        </div>

        {/* Issue Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Issue Date *
          </label>
          <input
            type="date"
            name="issueDate"
            value={formData.issueDate}
            onChange={handleChange}
            required
            className="input"
          />
        </div>

        {/* Due Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Due Date *
          </label>
          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            required
            className="input"
          />
        </div>
      </div>

      {/* Invoice Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notes
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          className="input"
          placeholder="Add any invoice notes or terms..."
        />
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
          {invoice ? 'Update' : 'Create'} Invoice
        </button>
      </div>
    </form>
  )
}

export default Invoices
