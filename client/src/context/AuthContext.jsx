import React, { createContext, useContext, useReducer, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../utils/api'

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isLoading: true,
  isAuthenticated: false
}

// Action types
const AUTH_SUCCESS = 'AUTH_SUCCESS'
const AUTH_FAILURE = 'AUTH_FAILURE'
const LOGOUT = 'LOGOUT'
const SET_LOADING = 'SET_LOADING'
const CLEAR_ERROR = 'CLEAR_ERROR'

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false
      }
    case AUTH_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false
      }
    case LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false
      }
    case SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      }
    case CLEAR_ERROR:
      return {
        ...state,
        error: null
      }
    default:
      return state
  }
}

// Create context
const AuthContext = createContext()

// Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Set token in localStorage and axios defaults
  const setAuthToken = (token) => {
    if (token) {
      localStorage.setItem('token', token)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']
    }
  }

  // Load user on app start
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token')
      
      if (token) {
        setAuthToken(token)
        try {
          const response = await api.get('/auth/me')
          dispatch({
            type: AUTH_SUCCESS,
            payload: {
              user: response.data.data,
              token
            }
          })
        } catch (error) {
          console.error('Failed to load user:', error)
          setAuthToken(null)
          dispatch({ type: AUTH_FAILURE })
        }
      } else {
        dispatch({ type: AUTH_FAILURE })
        dispatch({ type: SET_LOADING, payload: false })
      }
    }

    loadUser()
  }, [])

  // Login function
  const login = async (credentials) => {
    try {
      dispatch({ type: SET_LOADING, payload: true })
      const response = await api.post('/auth/login', credentials)
      
      const { token, user } = response.data
      
      setAuthToken(token)
      
      dispatch({
        type: AUTH_SUCCESS,
        payload: { user, token }
      })

      toast.success('Login successful!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed'
      toast.error(message)
      dispatch({ type: AUTH_FAILURE })
      return { success: false, message }
    }
  }

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: SET_LOADING, payload: true })
      const response = await api.post('/auth/register', userData)
      
      const { token, user } = response.data
      
      setAuthToken(token)
      
      dispatch({
        type: AUTH_SUCCESS,
        payload: { user, token }
      })

      toast.success('Registration successful!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed'
      toast.error(message)
      dispatch({ type: AUTH_FAILURE })
      return { success: false, message }
    }
  }

  // Logout function
  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setAuthToken(null)
      dispatch({ type: LOGOUT })
      toast.success('Logged out successfully')
    }
  }

  // Update profile function
  const updateProfile = async (userData) => {
    try {
      const response = await api.put('/auth/profile', userData)
      
      dispatch({
        type: AUTH_SUCCESS,
        payload: {
          user: response.data.data,
          token: state.token
        }
      })

      toast.success('Profile updated successfully!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed'
      toast.error(message)
      return { success: false, message }
    }
  }

  // Change password function
  const changePassword = async (passwordData) => {
    try {
      await api.put('/auth/change-password', passwordData)
      toast.success('Password changed successfully!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Password change failed'
      toast.error(message)
      return { success: false, message }
    }
  }

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    setAuthToken
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
