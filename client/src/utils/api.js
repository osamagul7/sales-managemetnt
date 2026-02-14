import axios from 'axios'
import toast from 'react-hot-toast'

// Create axios instance
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle network errors
    if (!error.response) {
      toast.error('Network error. Please check your connection.')
      return Promise.reject(error)
    }

    // Handle authentication errors
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']
      
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
        toast.error('Session expired. Please login again.')
      }
      return Promise.reject(error)
    }

    // Handle forbidden errors
    if (error.response?.status === 403) {
      toast.error('Access denied. You don\'t have permission to perform this action.')
      return Promise.reject(error)
    }

    // Handle not found errors
    if (error.response?.status === 404) {
      toast.error('Resource not found.')
      return Promise.reject(error)
    }

    // Handle server errors
    if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.')
      return Promise.reject(error)
    }

    // Handle validation errors
    if (error.response?.status === 400) {
      const message = error.response?.data?.message || 'Invalid request'
      if (error.response?.data?.errors) {
        // Handle multiple validation errors
        const errors = Object.values(error.response.data.errors).join(', ')
        toast.error(errors)
      } else {
        toast.error(message)
      }
      return Promise.reject(error)
    }

    // Handle other errors
    const message = error.response?.data?.message || 'An error occurred'
    toast.error(message)
    
    return Promise.reject(error)
  }
)

export default api
