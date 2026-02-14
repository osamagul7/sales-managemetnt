import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Filter, Download, Edit, Eye, Trash2, Users as UsersIcon, Shield, Key } from 'lucide-react'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import Badge from '../components/Badge'
import LoadingSpinner from '../components/LoadingSpinner'
import api from '../utils/api'
import { formatDate, getStatusBadgeColor } from '../utils/helpers'
import toast from 'react-hot-toast'

const Users = () => {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 })
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [filters, setFilters] = useState({ role: '', status: '', dateRange: '' })

  const columns = [
    {
      key: 'name',
      title: 'User',
      render: (value, row) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-600">
              {value.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">{row.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'email',
      title: 'Email',
      render: (value) => (
        <div className="flex items-center">
          <div className="text-sm">{value}</div>
        </div>
      )
    },
    {
      key: 'role',
      title: 'Role',
      render: (value) => (
        <Badge variant={value === 'admin' ? 'danger' : value === 'manager' ? 'warning' : 'info'}>
          {value}
        </Badge>
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
    },
    {
      key: 'createdAt',
      title: 'Created',
      render: (value) => (
        <span className="text-sm">{formatDate(value)}</span>
      )
    },
    {
      key: 'lastLogin',
      title: 'Last Login',
      render: (value) => (
        <span className="text-sm">{value ? formatDate(value) : 'Never'}</span>
      )
    }
  ]

  useEffect(() => {
    fetchUsers()
  }, [pagination.page, searchTerm, filters])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page,
        limit: 10,
        search: searchTerm,
        ...filters
      })
      
      const response = await api.get(`/users?${params}`)
      setUsers(response.data.data)
      setPagination({
        page: response.data.pagination.page,
        totalPages: response.data.pagination.totalPages
      })
    } catch (error) {
      console.error('Failed to fetch users:', error)
      toast.error('Failed to fetch users')
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
    setSelectedUser(null)
    setShowModal(true)
  }

  const handleEdit = (user) => {
    setSelectedUser(user)
    setShowModal(true)
  }

  const handleView = (user) => {
    navigate(`/users/${user._id}`)
  }

  const handleDelete = async (user) => {
    if (window.confirm(`Are you sure you want to delete user ${user.name}? This action cannot be undone.`)) {
      try {
        await api.delete(`/users/${user._id}`)
        toast.success('User deleted successfully')
        fetchUsers()
      } catch (error) {
        console.error('Failed to delete user:', error)
        toast.error('Failed to delete user')
      }
    }
  }

  const handleResetPassword = async (user) => {
    const newPassword = prompt(`Enter new password for ${user.name}:`)
    if (newPassword && newPassword.length >= 6) {
      try {
        await api.put(`/users/${user._id}/reset-password`, { password: newPassword })
        toast.success('Password reset successfully')
      } catch (error) {
        console.error('Failed to reset password:', error)
        toast.error('Failed to reset password')
      }
    }
  }

  const handleToggleStatus = async (user) => {
    try {
      const newStatus = user.status === 'active' ? 'inactive' : 'active'
      await api.put(`/users/${user._id}`, { status: newStatus })
      toast.success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`)
      fetchUsers()
    } catch (error) {
      console.error('Failed to toggle user status:', error)
      toast.error('Failed to toggle user status')
    }
  }

  const handleModalClose = () => {
    setShowModal(false)
    setSelectedUser(null)
  }

  const handleSave = async (userData) => {
    try {
      if (selectedUser) {
        await api.put(`/users/${selectedUser._id}`, userData)
        toast.success('User updated successfully')
      } else {
        await api.post('/users', userData)
        toast.success('User created successfully')
      }
      handleModalClose()
      fetchUsers()
    } catch (error) {
      console.error('Failed to save user:', error)
      toast.error('Failed to save user')
    }
  }

  const activeUsers = users.filter(user => user.status === 'active')
  const adminUsers = users.filter(user => user.role === 'admin')
  const managerUsers = users.filter(user => user.role === 'manager')
  const salesUsers = users.filter(user => user.role === 'salesperson')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage user accounts and permissions
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add User</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="stat-card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                <UsersIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="stat-card-title">Total Users</dt>
                  <dd className="stat-card-value">{users.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="stat-card-title">Active Users</dt>
                  <dd className="stat-card-value">{activeUsers.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                <Key className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="stat-card-title">Admin Users</dt>
                  <dd className="stat-card-value">{adminUsers.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                <UsersIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="stat-card-title">Manager Users</dt>
                  <dd className="stat-card-value">{managerUsers.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={users}
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
        actions={['view', 'edit', 'delete', 'reset-password']}
        searchable={true}
        filterable={true}
        exportable={true}
      />

      {/* User Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleModalClose}
        title={selectedUser ? 'Edit User' : 'Add User'}
        size="lg"
      >
        <UserForm
          user={selectedUser}
          onSave={handleSave}
          onCancel={handleModalClose}
        />
      </Modal>
    </div>
  )
}

// User Form Component
const UserForm = ({ user, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'salesperson',
    status: 'active',
    ...user
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Role *
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            className="input"
          >
            <option value="salesperson">Salesperson</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
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

      {/* Password field only for new users */}
      {!user && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password *
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={6}
            className="input"
          />
        </div>
      )}

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
          {user ? 'Update' : 'Create'} User
        </button>
      </div>
    </form>
  )
}

export default Users
