import React, { useState, useEffect } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Download, Calendar, TrendingUp, DollarSign, Users, Package, ShoppingCart } from 'lucide-react'
import api from '../utils/api'
import { formatCurrency, formatDate } from '../utils/helpers'
import toast from 'react-hot-toast'

const Reports = () => {
  const [salesData, setSalesData] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [customerStats, setCustomerStats] = useState([])
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState('30')
  const [reportType, setReportType] = useState('sales')

  useEffect(() => {
    fetchReportData()
  }, [reportType, dateRange])

  const fetchReportData = async () => {
    try {
      setLoading(true)
      
      if (reportType === 'sales') {
        const [salesResponse, productsResponse] = await Promise.all([
          api.get(`/dashboard/monthly-sales?days=${dateRange}`),
          api.get('/dashboard/top-products?limit=10')
        ])
        
        setSalesData(salesResponse.data.data || [])
        setTopProducts(productsResponse.data.data || [])
      } else if (reportType === 'customers') {
        const response = await api.get('/dashboard/customer-analytics')
        setCustomerStats(response.data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch report data:', error)
      toast.error('Failed to fetch report data')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      let data = []
      
      if (reportType === 'sales') {
        data = salesData
      } else if (reportType === 'customers') {
        data = customerStats
      }
      
      const csv = [
        ['Date', 'Type', 'Amount', 'Status'].join(','),
        ...data.map(item => {
          if (reportType === 'sales') {
            return [formatDate(item.date), 'Sales', formatCurrency(item.amount), item.status || 'Completed']
          } else if (reportType === 'customers') {
            return [formatDate(item.date), 'Customers', item.count, 'Active']
          }
          return []
        })
      ].join('\n')
      
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${reportType}-report-${formatDate(new Date())}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success('Report exported successfully')
    } catch (error) {
      console.error('Failed to export report:', error)
      toast.error('Failed to export report')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
        <p className="mt-1 text-sm text-gray-600">
          Generate and view business reports
        </p>
      </div>

      {/* Report Controls */}
      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Type
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="input"
              >
                <option value="sales">Sales Report</option>
                <option value="customers">Customer Analytics</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="input"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <button
                onClick={handleExport}
                className="btn-primary w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Report */}
      {reportType === 'sales' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Chart */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Sales Trend</h3>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="loading-spinner h-8 w-8"></div>
                </div>
              ) : salesData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No sales data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Top Products */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Top Products</h3>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="loading-spinner h-8 w-8"></div>
                </div>
              ) : topProducts.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topProducts}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No product data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Customer Analytics */}
      {reportType === 'customers' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Customer Stats */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Customer Statistics</h3>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="loading-spinner h-8 w-8"></div>
                </div>
              ) : customerStats.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="stat-card">
                    <div className="stat-card-content">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                          <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="stat-card-title">Total Customers</dt>
                            <dd className="stat-card-value">{customerStats.totalCustomers || 0}</dd>
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
                            <dt className="stat-card-title">New This Month</dt>
                            <dd className="stat-card-value">{customerStats.newCustomers || 0}</dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="stat-card">
                    <div className="stat-card-content">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                          <ShoppingCart className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="stat-card-title">Active Customers</dt>
                            <dd className="stat-card-value">{customerStats.activeCustomers || 0}</dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No customer data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Customer Distribution */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Customer Distribution</h3>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="loading-spinner h-8 w-8"></div>
                </div>
              ) : customerStats.length > 0 && customerStats.customerDistribution ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={customerStats.customerDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      label
                    >
                      {customerStats.customerDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No distribution data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Reports
