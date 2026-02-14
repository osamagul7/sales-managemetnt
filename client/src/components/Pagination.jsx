import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  showPageNumbers = true,
  className = ''
}) => {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1)
    }
  }

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1)
    }
  }

  const handlePageClick = (page) => {
    onPageChange(page)
  }

  const getPageNumbers = () => {
    const delta = 2
    const range = []
    let rangeWithDots = []

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots = [1]
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages)
    } else if (currentPage + delta === totalPages - 1) {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  if (totalPages <= 1) return null

  return (
    <div className={`flex items-center justify-between px-6 py-3 bg-white border-t border-gray-200 ${className}`}>
      <div className="flex items-center text-sm text-gray-700">
        <span className="mr-4">
          Page {currentPage} of {totalPages}
        </span>
        
        {showPageNumbers && (
          <div className="flex items-center space-x-1">
            <button
              onClick={handlePrevious}
              disabled={currentPage === 1}
              className="p-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            {getPageNumbers().map((page, index) => (
              <button
                key={index}
                onClick={() => handlePageClick(page)}
                className={`
                  px-3 py-1 border border-gray-300 rounded-md text-sm
                  ${page === currentPage 
                    ? 'bg-primary-600 text-white border-primary-600' 
                    : 'hover:bg-gray-50'
                  }
                  ${typeof page === 'string' ? 'cursor-default' : ''}
                `}
                disabled={typeof page === 'string'}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Pagination
