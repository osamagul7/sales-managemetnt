import dayjs from 'dayjs'

// Format currency
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

// Format date
export const formatDate = (date, format = 'MM/DD/YYYY') => {
  return dayjs(date).format(format)
}

// Format date with time
export const formatDateTime = (date, format = 'MM/DD/YYYY h:mm A') => {
  return dayjs(date).format(format)
}

// Get relative time
export const getRelativeTime = (date) => {
  return dayjs(date).fromNow()
}

// Format phone number
export const formatPhoneNumber = (phone) => {
  if (!phone) return ''
  
  const cleaned = phone.replace(/\D/g, '')
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
  
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`
  }
  
  return phone
}

// Get status badge color
export const getStatusBadgeColor = (status) => {
  const statusColors = {
    // Order statuses
    'Pending': 'warning',
    'Processing': 'info',
    'Completed': 'success',
    'Cancelled': 'danger',
    
    // Payment statuses
    'Unpaid': 'danger',
    'Partial': 'warning',
    'Paid': 'success',
    
    // Invoice statuses
    'Draft': 'gray',
    'Sent': 'info',
    'Overdue': 'danger',
    'Void': 'gray',
    
    // Stock statuses
    'in_stock': 'success',
    'low_stock': 'warning',
    'out_of_stock': 'danger',
    'reorder_needed': 'warning'
  }
  
  return statusColors[status] || 'gray'
}

// Get status text
export const getStatusText = (status) => {
  return status ? status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : ''
}

// Calculate percentage
export const calculatePercentage = (value, total) => {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}

// Generate random color
export const generateRandomColor = () => {
  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

// Debounce function
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Copy to clipboard
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('Failed to copy text: ', err)
    return false
  }
}

// Download file
export const downloadFile = (data, filename, type = 'application/octet-stream') => {
  const blob = new Blob([data], { type })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

// Validate email
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

// Validate phone
export const isValidPhone = (phone) => {
  const re = /^[\d\s\-\+\(\)]+$/
  return re.test(phone)
}

// Get initials from name
export const getInitials = (name) => {
  if (!name) return ''
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2)
}

// Truncate text
export const truncateText = (text, maxLength) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// Capitalize first letter
export const capitalize = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// Convert to title case
export const toTitleCase = (str) => {
  if (!str) return ''
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  )
}

// Get file extension
export const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2)
}

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Generate unique ID
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9)
}

// Sort array by property
export const sortByProperty = (array, property, order = 'asc') => {
  return [...array].sort((a, b) => {
    const aVal = a[property]
    const bVal = b[property]
    
    if (aVal < bVal) return order === 'asc' ? -1 : 1
    if (aVal > bVal) return order === 'asc' ? 1 : -1
    return 0
  })
}

// Filter array by property
export const filterByProperty = (array, property, value) => {
  return array.filter(item => 
    item[property] && item[property].toString().toLowerCase().includes(value.toString().toLowerCase())
  )
}

// Paginate array
export const paginate = (array, page, pageSize) => {
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  return array.slice(startIndex, endIndex)
}

// Get page numbers for pagination
export const getPageNumbers = (currentPage, totalPages) => {
  const delta = 2
  const range = []
  const rangeWithDots = []
  let l

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
      range.push(i)
    }
  }

  range.forEach((i) => {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1)
      } else if (i - l !== 1) {
        rangeWithDots.push('...')
      }
    }
    rangeWithDots.push(i)
    l = i
  })

  return rangeWithDots
}
