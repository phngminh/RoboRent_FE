import React, { useEffect, useState } from 'react'
import { Eye, Search, Plus, Edit, Trash2 } from 'lucide-react'
import { getAllTemplates, type ContractTemplateResponse } from '../../../apis/contractTemplates.api'

const ContractTemplates: React.FC = () => {
  const [templates, setTemplates] = useState<ContractTemplateResponse[]>([])
  const [filteredTemplates, setFilteredTemplates] = useState<ContractTemplateResponse[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Status')
  const [appliedStatus, setAppliedStatus] = useState('All Status')
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const pageSize = 5
  const totalPages = Math.max(1, Math.ceil(filteredTemplates.length / pageSize))
  const paginatedTemplates = filteredTemplates.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true)
        const templatesData = await getAllTemplates()
        console.log('Fetched templates:', templatesData)
        setTemplates(templatesData)
        setFilteredTemplates(templatesData)
      } catch (err) {
        console.error('Failed to load templates', err)
        setTemplates([])
        setFilteredTemplates([])
      } finally {
        setLoading(false)
      }
    }
    fetchTemplates()
  }, [])

  useEffect(() => {
    let filtered = templates || []

    if (search.trim()) {
      const searchTerm = search.toLowerCase()
      filtered = filtered.filter((template) =>
        template.title.toLowerCase().includes(searchTerm)
      )
    }

    if (appliedStatus !== 'All Status') {
      filtered = filtered.filter((template) => template.status === appliedStatus)
    }

    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    setFilteredTemplates(filtered)
    setCurrentPage(1)
  }, [templates, search, appliedStatus])

  const statusOptions = ['All Status', 'Initiated', 'Completed']

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Initiated':
        return 'bg-gray-100 text-gray-800'
      case 'Completed':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleViewDetails = (templateId: number) => {
    console.log('Viewing details for template:', templateId)
  }

  const handleCreateTemplate = () => {
    console.log('Creating new template')
  }

  const handleEdit = (templateId: number) => {
    console.log('Editing template:', templateId)
  }

  const handleDelete = (templateId: number) => {
    console.log('Deleting template:', templateId)
  }

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
  }

  const applyFilters = () => {
    setAppliedStatus(statusFilter)
  }

  const clearFilters = () => {
    setSearch('')
    setStatusFilter('All Status')
    setAppliedStatus('All Status')
    setCurrentPage(1)
  }

  return (
    <div className='space-y-6 bg-gray-50 p-6'>
      <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-200 space-y-4'>
        <h2 className='text-lg font-semibold text-gray-800 text-left ml-4'>Filter Templates</h2>
        <div className='flex flex-col gap-3 md:flex-row md:items-center'>
          <div className='flex flex-col sm:flex-row gap-3 flex-1'>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className='w-full sm:w-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <div className='relative flex-1 min-w-[200px]'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500' size={18} />
              <input
                type='text'
                placeholder='Search by title...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className='w-full pl-10 pr-4 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>
          </div>

          <div className='flex gap-2 flex-col sm:flex-row sm:justify-end'>
            <button
              onClick={applyFilters}
              className='w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors'
            >
              Apply Filters
            </button>
            <button
              onClick={clearFilters}
              className='w-full sm:w-auto bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors'
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Templates Table */}
      <div className='bg-white rounded-xl shadow-sm border border-gray-300'>
        <div className='p-6 border-b border-gray-100 flex items-center justify-between gap-4'>
          <div className='flex flex-col items-center text-center flex-1 ml-32'>
            <h2 className='text-xl text-gray-800 font-semibold'>Contract Templates</h2>
          </div>
          <button
            onClick={handleCreateTemplate}
            className='bg-green-600 text-white px-4 py-1.5 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2'
          >
            <Plus size={18} />
            <span>Create</span>
          </button>
        </div>
        
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Code
                </th>
                <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Title
                </th>
                <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Description
                </th>
                <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Status
                </th>
                <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Version
                </th>
                <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap'>
                  Created At
                </th>
                <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap'>
                  Created By
                </th>
                <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {loading ? (
                <tr>
                  <td colSpan={8} className='text-center py-6 text-gray-500 text-sm'>
                    Loading...
                  </td>
                </tr>
              ) : paginatedTemplates.length === 0 ? (
                <tr>
                  <td colSpan={8} className='text-center py-6 text-gray-500 text-sm'>
                    No templates found.
                  </td>
                </tr>
              ) : (
                paginatedTemplates.map((template) => (
                  <tr key={template.id} className='hover:bg-gray-50'>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center'>
                      {template.templateCode}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center'>
                      {template.title}
                    </td>
                    <td className='px-6 py-4 text-sm text-gray-900 max-w-md truncate text-center'>
                      {template.description}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-center'>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(template.status)}`}>
                        {template.status}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center'>
                      {template.version}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center'>
                      {new Date(template.createdAt).toLocaleDateString()}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center'>
                      {template.createdByName}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-center'>
                      <div className='flex items-center justify-center space-x-3 text-sm text-gray-600'>
                        <button
                          onClick={() => handleViewDetails(template.id)}
                          className='flex items-center space-x-1 hover:text-gray-800'
                        >
                          <Eye size={14} />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => handleEdit(template.id)}
                          className='flex items-center space-x-1 hover:text-gray-800'
                        >
                          <Edit size={14} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(template.id)}
                          className='flex items-center space-x-1 hover:text-gray-800'
                        >
                          <Trash2 size={14} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className='px-6 py-4 border-t border-gray-100 flex items-center justify-between'>
          <div className='flex space-x-2'>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 text-sm transition-colors ${
                currentPage === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, index) => {
              const pageNumber = index + 1
              const isActive = pageNumber === currentPage
              return (
                <button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {pageNumber}
                </button>
              )
            })}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 text-sm transition-colors ${
                currentPage === totalPages
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Next
            </button>
          </div>
          <div className='text-sm text-gray-500'>
            Showing {paginatedTemplates.length} of {filteredTemplates.length} template{filteredTemplates.length === 1 ? '' : 's'}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContractTemplates