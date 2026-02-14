import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, Search, Filter, Download, Trash2, Edit, Eye, Plus } from 'lucide-react'

const DataTable = ({
  data = [],
  columns = [],
  loading = false,
  pagination = true,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  onSearch,
  onFilter,
  onAdd,
  onEdit,
  onDelete,
  onView,
  actions = [],
  searchable = true,
  filterable = true,
  exportable = true,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const handleSearch = (value) => {
    setSearchTerm(value)
    onSearch?.(value)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(searchTerm)
    }
  }

  const renderPagination = () => {
    if (!pagination || totalPages <= 1) return null

    return (
      <div className="flex items-center justify-between px-6 py-3 bg-white border-t border-gray-200">
        <div className="text-sm text-gray-700">
          Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, data.length)} of {data.length} results
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange?.(currentPage - 1)}
            disabled={currentPage === 1}
            className="btn-outline px-3 py-1 disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <span className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => onPageChange?.(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="btn-outline px-3 py-1 disabled:opacity-50"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {searchable && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            )}
            
            {filterable && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-outline flex items-center space-x-2"
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
              </button>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {onAdd && (
              <button onClick={onAdd} className="btn-primary flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Add</span>
              </button>
            )}
            
            {exportable && (
              <button className="btn-outline flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && filterable && (
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select className="input">
                <option value="">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <input type="date" className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select className="input">
                <option value="">All</option>
                <option value="electronics">Electronics</option>
                <option value="clothing">Clothing</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="table-header">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="table-header-cell">
                  {column.title}
                </th>
              ))}
              {actions.length > 0 && (
                <th className="table-header-cell text-right">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="table-body">
            {loading ? (
              <tr>
                <td colSpan={columns.length + (actions.length > 0 ? 1 : 0)} className="text-center py-8">
                  <div className="loading-spinner h-8 w-8 mx-auto"></div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions.length > 0 ? 1 : 0)} className="text-center py-8">
                  <div className="text-center">
                    <div className="text-gray-500 text-lg mb-2">No data found</div>
                    <p className="text-gray-400">Try adjusting your search or filters</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr key={row.id} className="table-row">
                  {columns.map((column) => (
                    <td key={column.key} className="table-cell">
                      {column.render ? column.render(row[column.key], row) : 
                        typeof row[column.key] === 'object' ? 
                          JSON.stringify(row[column.key]) : 
                          row[column.key]
                      }
                    </td>
                  ))}
                  {actions.length > 0 && (
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {actions.includes('view') && (
                          <button
                            onClick={() => onView?.(row)}
                            className="text-gray-400 hover:text-gray-600 p-1"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        )}
                        {actions.includes('edit') && (
                          <button
                            onClick={() => onEdit?.(row)}
                            className="text-gray-400 hover:text-gray-600 p-1"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                        {actions.includes('delete') && (
                          <button
                            onClick={() => onDelete?.(row)}
                            className="text-red-400 hover:text-red-600 p-1"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {renderPagination()}
    </div>
  )
}

export default DataTable
