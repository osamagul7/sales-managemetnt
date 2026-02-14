import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  TrendingUp,
  Users,
  ShoppingCart,
  Package,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign
} from 'lucide-react'
import api from '../utils/api'
import { formatCurrency } from '../utils/helpers'
import LoadingSpinner from '../components/LoadingSpinner'

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [monthlySales, setMonthlySales] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [recentOrders, setRecentOrders] = useState([])
  const [orderStatusBreakdown, setOrderStatusBreakdown] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, monthlyRes, productsRes, ordersRes, statusRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/monthly-sales'),
        api.get('/dashboard/top-products'),
        api.get('/dashboard/recent-orders'),
        api.get('/dashboard/order-status')
      ])

      setStats(statsRes.data.data)
      setMonthlySales(monthlyRes.data.data)
      setTopProducts(productsRes.data.data)
      setRecentOrders(ordersRes.data.data)
      setOrderStatusBreakdown(statusRes.data.data)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ title, value, icon: Icon, change, changeType, color = 'blue' }) => (
    <div className="stat-card">
      <div className="stat-card-content">
        <div className="flex items-center">
          <div className={`flex-shrink-0 bg-${color}-100 rounded-md p-3`}>
            <Icon className={`h-6 w-6 text-${color}-600`} />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="stat-card-title">{title}</dt>
              <dd className="stat-card-value">
                {typeof value === 'number' && title.includes('Revenue') ? formatCurrency(value) : value}
              </dd>
              {change !== undefined && (
                <dd className={`flex items-center text-sm ${
                  changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {changeType === 'positive' ? (
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 mr-1" />
                  )}
                  {Math.abs(change)}%
                </dd>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Welcome to your sales management dashboard
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={stats?.totalRevenue || 0}
          icon={DollarSign}
          change={stats?.revenueGrowth || 0}
          changeType={stats?.revenueGrowth >= 0 ? 'positive' : 'negative'}
          color="green"
        />
        <StatCard
          title="Total Orders"
          value={stats?.totalOrders || 0}
          icon={ShoppingCart}
          color="blue"
        />
        <StatCard
          title="Total Customers"
          value={stats?.totalCustomers || 0}
          icon={Users}
          color="purple"
        />
        <StatCard
          title="Total Products"
          value={stats?.totalProducts || 0}
          icon={Package}
          color="yellow"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Sales Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Monthly Revenue</h3>
          </div>
          <div className="card-body">
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>Chart component will be implemented here</p>
                <p className="text-sm">Monthly sales data available</p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Status Breakdown */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Order Status</h3>
          </div>
          <div className="card-body">
            <div className="space-y-3">
              {orderStatusBreakdown.map((status) => (
                <div key={status._id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${
                      status._id === 'Completed' ? 'bg-green-500' :
                      status._id === 'Processing' ? 'bg-blue-500' :
                      status._id === 'Pending' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`} />
                    <span className="text-sm text-gray-900">{status._id}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{status.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
            <button
              onClick={() => navigate('/orders')}
              className="text-sm text-primary-600 hover:text-primary-500"
            >
              View all
            </button>
          </div>
          <div className="card-body">
            <div className="overflow-hidden">
              <table className="min-w-full">
                <thead className="table-header">
                  <tr>
                    <th className="table-header-cell">Order</th>
                    <th className="table-header-cell">Customer</th>
                    <th className="table-header-cell">Amount</th>
                    <th className="table-header-cell">Status</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {recentOrders.map((order) => (
                    <tr key={order._id} className="table-row">
                      <td className="table-cell font-medium">{order.orderNumber}</td>
                      <td className="table-cell">{order.customer?.name}</td>
                      <td className="table-cell">{formatCurrency(order.grandTotal)}</td>
                      <td className="table-cell">
                        <span className={`badge-${
                          order.status === 'Completed' ? 'success' :
                          order.status === 'Processing' ? 'info' :
                          order.status === 'Pending' ? 'warning' :
                          'danger'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Top Products</h3>
            <button
              onClick={() => navigate('/products')}
              className="text-sm text-primary-600 hover:text-primary-500"
            >
              View all
            </button>
          </div>
          <div className="card-body">
            <div className="overflow-hidden">
              <table className="min-w-full">
                <thead className="table-header">
                  <tr>
                    <th className="table-header-cell">Product</th>
                    <th className="table-header-cell">Revenue</th>
                    <th className="table-header-cell">Units</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {topProducts.map((product) => (
                    <tr key={product._id} className="table-row">
                      <td className="table-cell font-medium">{product.name}</td>
                      <td className="table-cell">{formatCurrency(product.totalRevenue)}</td>
                      <td className="table-cell">{product.totalQuantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {stats?.lowStockProducts > 0 && (
        <div className="card border-l-4 border-yellow-400 bg-yellow-50">
          <div className="card-body">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Low Stock Alert
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    You have {stats.lowStockProducts} products with low stock levels. 
                    <button
                      onClick={() => navigate('/products')}
                      className="font-medium text-yellow-800 underline hover:text-yellow-900 ml-1"
                    >
                      Review inventory
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
