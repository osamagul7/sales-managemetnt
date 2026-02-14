import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { User, Settings as SettingsIcon, Bell, Shield, Database, Palette, Globe, Lock, Mail, Smartphone } from 'lucide-react'
import api from '../utils/api'
import toast from 'react-hot-toast'

const Settings = () => {
  const { user, updateProfile, changePassword } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [profileData, setProfileData] = useState({
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
    }
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    desktop: true
  })
  const [appearance, setAppearance] = useState({
    theme: 'light',
    language: 'en'
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        company: user.company || '',
        address: user.address || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        }
      })
    }
  }, [user])

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      await updateProfile(profileData)
      toast.success('Profile updated successfully')
    } catch (error) {
      console.error('Failed to update profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    
    try {
      setLoading(true)
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })
      toast.success('Password changed successfully')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      console.error('Failed to change password:', error)
      toast.error('Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleNotificationChange = (type) => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type]
    }))
  }

  const handleAppearanceChange = (e) => {
    const { name, value } = e.target
    setAppearance(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Settings Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-4 border-b-2 font-medium text-sm ${
              activeTab === 'profile' 
                ? 'border-primary-500 text-primary-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <User className="h-4 w-4 mr-2" />
            Profile
          </button>
          
          <button
            onClick={() => setActiveTab('security')}
            className={`pb-4 border-b-2 font-medium text-sm ${
              activeTab === 'security' 
                ? 'border-primary-500 text-primary-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Shield className="h-4 w-4 mr-2" />
            Security
          </button>
          
          <button
            onClick={() => setActiveTab('notifications')}
            className={`pb-4 border-b-2 font-medium text-sm ${
              activeTab === 'notifications' 
                ? 'border-primary-500 text-primary-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </button>
          
          <button
            onClick={() => setActiveTab('appearance')}
            className={`pb-4 border-b-2 font-medium text-sm ${
              activeTab === 'appearance' 
                ? 'border-primary-500 text-primary-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Palette className="h-4 w-4 mr-2" />
            Appearance
          </button>
        </nav>
      </div>

      {/* Settings Content */}
      <div className="mt-6">
        {/* Profile Settings */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">Profile Information</h3>
              </div>
              <div className="card-body">
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={profileData.name}
                        onChange={handleProfileChange}
                        className="input"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={profileData.email}
                        onChange={handleProfileChange}
                        className="input"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleProfileChange}
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
                        value={profileData.company}
                        onChange={handleProfileChange}
                        className="input"
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div className="space-y-4">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Address</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Street
                        </label>
                        <input
                          type="text"
                          name="address.street"
                          value={profileData.address.street}
                          onChange={handleProfileChange}
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
                          value={profileData.address.city}
                          onChange={handleProfileChange}
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
                          value={profileData.address.state}
                          onChange={handleProfileChange}
                          className="input"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            ZIP Code
                          </label>
                          <input
                            type="text"
                            name="address.zipCode"
                            value={profileData.address.zipCode}
                            onChange={handleProfileChange}
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
                            value={profileData.address.country}
                            onChange={handleProfileChange}
                            className="input"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      className="btn-outline"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary"
                    >
                      {loading ? (
                        <div className="flex items-center">
                          <div className="loading-spinner h-4 w-4 mr-2"></div>
                          <span>Updating...</span>
                        </div>
                      ) : (
                        'Update Profile'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
              </div>
              <div className="card-body">
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                      className="input"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                      minLength={6}
                      className="input"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                      minLength={6}
                      className="input"
                    />
                  </div>

                  <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      className="btn-outline"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary"
                    >
                      {loading ? (
                        <div className="flex items-center">
                          <div className="loading-spinner h-4 w-4 mr-2"></div>
                          <span>Changing...</span>
                        </div>
                      ) : (
                        'Change Password'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Notification Settings */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">Notification Preferences</h3>
              </div>
              <div className="card-body space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900">Email Notifications</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="email"
                      checked={notifications.email}
                      onChange={(e) => handleNotificationChange('email', e.target.checked)}
                      className="sr-only"
                    />
                    <div className="toggle"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Smartphone className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900">SMS Notifications</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="sms"
                      checked={notifications.sms}
                      onChange={(e) => handleNotificationChange('sms', e.target.checked)}
                      className="sr-only"
                    />
                    <div className="toggle"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900">Desktop Notifications</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="desktop"
                      checked={notifications.desktop}
                      onChange={(e) => handleNotificationChange('desktop', e.target.checked)}
                      className="sr-only"
                    />
                    <div className="toggle"></div>
                  </label>
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Notification Settings</h4>
                  <p className="text-sm text-gray-600">
                    Configure how you receive notifications and alerts
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Appearance Settings */}
        {activeTab === 'appearance' && (
          <div className="space-y-6">
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">Appearance</h3>
              </div>
              <div className="card-body space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Theme
                  </label>
                  <select
                    name="theme"
                    value={appearance.theme}
                    onChange={(e) => handleAppearanceChange('theme', e.target.value)}
                    className="input"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">System</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language
                  </label>
                  <select
                    name="language"
                    value={appearance.language}
                    onChange={(e) => handleAppearanceChange('language', e.target.value)}
                    className="input"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Appearance Settings</h4>
                  <p className="text-sm text-gray-600">
                    Customize the look and feel of your application
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Settings
