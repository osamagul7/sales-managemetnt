import React, { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  User
} from 'lucide-react'

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Products', href: '/products', icon: Package },
    { name: 'Orders', href: '/orders', icon: ShoppingCart },
    { name: 'Invoices', href: '/invoices', icon: FileText },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
    ...(user?.role === 'admin' ? [{ name: 'Users', href: '/users', icon: Users }] : []),
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  const isActive = (href) => {
    return location.pathname === href || 
           (href !== '/dashboard' && location.pathname.startsWith(href))
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-gray-600 opacity-75"></div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`
        sidebar
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* Sidebar header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-white">SalesHub</h1>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Sidebar navigation */}
        <nav className="mt-5 px-2">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    navigate(item.href)
                    setSidebarOpen(false)
                  }}
                  className={`sidebar-link w-full text-left ${
                    isActive(item.href) ? 'active' : ''
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </button>
              )
            })}
          </div>
        </nav>

        {/* Sidebar footer */}
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-700">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">{user?.name}</p>
              <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="sidebar-link w-full text-left"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top navigation */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-600"
              >
                <Menu className="h-6 w-6" />
              </button>
              
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  Welcome back, <span className="font-medium text-gray-900">{user?.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout
