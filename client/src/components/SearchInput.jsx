import React, { useState } from 'react'
import { Search, X } from 'lucide-react'

const SearchInput = ({
  placeholder = 'Search...',
  value = '',
  onChange,
  onSearch,
  onClear,
  className = '',
  disabled = false,
  autoFocus = false
}) => {
  const [localValue, setLocalValue] = useState(value)

  const handleChange = (e) => {
    const newValue = e.target.value
    setLocalValue(newValue)
    onChange?.(newValue)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onSearch?.(localValue)
    }
  }

  const handleClear = () => {
    setLocalValue('')
    onChange?.('')
    onClear?.()
  }

  const handleSearchClick = () => {
    onSearch?.(localValue)
  }

  React.useEffect(() => {
    setLocalValue(value)
  }, [value])

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-gray-400" />
      </div>
      
      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        className={`
          block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md
          focus:ring-primary-500 focus:border-primary-500
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
        `}
      />
      
      {localValue && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          <button
            onClick={handleClear}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100"
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      
      {!localValue && onSearch && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          <button
            onClick={handleSearchClick}
            className="text-primary-600 hover:text-primary-700 p-1 rounded-md hover:bg-primary-50"
            type="button"
          >
            <Search className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}

export default SearchInput
