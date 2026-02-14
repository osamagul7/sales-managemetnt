import React from 'react'
import { X } from 'lucide-react'

const Modal = ({
  isOpen = false,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  className = ''
}) => {
  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose?.()
    }
  }

  const handleEscapeKey = (e) => {
    if (e.key === 'Escape') {
      onClose?.()
    }
  }

  React.useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey)
      document.body.style.overflow = 'hidden'
    } else {
      document.removeEventListener('keydown', handleEscapeKey)
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0"
        onClick={handleBackdropClick}
      >
        <div 
          className={`
            relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:w-full sm:max-w-lg
            ${sizeClasses[size]}
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-md hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          )}

          {/* Body */}
          <div className="px-6 py-4">
            {children}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
            <button
              onClick={onClose}
              className="btn-outline"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Modal
