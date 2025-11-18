import React, { useEffect, useState } from 'react'
import { Eye, Search, Plus, Edit, Trash2 } from 'lucide-react'
import { getAllClauses, type TemplateClauseResponse } from '../../../apis/contractTemplates.api'

const Clauses: React.FC = () => {
  const [clauses, setClauses] = useState<TemplateClauseResponse[]>([])
  const [filteredClauses, setFilteredClauses] = useState<TemplateClauseResponse[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('Editable Status')
  const [appliedStatus, setAppliedStatus] = useState('Editable Status')
  const [mandatoryFilter, setMandatoryFilter] = useState('Mandatory Status')
  const [appliedMandatory, setAppliedMandatory] = useState('Mandatory Status')
  const [templateFilter, setTemplateFilter] = useState('All Templates')
  const [appliedTemplate, setAppliedTemplate] = useState('All Templates')
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const pageSize = 5
  const totalPages = Math.max(1, Math.ceil(filteredClauses.length / pageSize))
  const paginatedClauses = filteredClauses.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  useEffect(() => {
    const fetchClauses = async () => {
      try {
        setLoading(true)
        const clausesData = await getAllClauses()
        console.log('Fetched clauses:', clausesData)
        setClauses(clausesData)
        setFilteredClauses(clausesData)
      } catch (err) {
        console.error('Failed to load clauses', err)
        setClauses([])
        setFilteredClauses([])
      } finally {
        setLoading(false)
      }
    }
    fetchClauses()
  }, [])

  useEffect(() => {
    let filtered = clauses || []

    if (search.trim()) {
      const searchTerm = search.toLowerCase()
      filtered = filtered.filter((clause) =>
        clause.title.toLowerCase().includes(searchTerm)
      )
    }

    if (appliedStatus !== 'Editable Status') {
      filtered = filtered.filter((clause) =>
        appliedStatus === 'Editable' ? clause.isEditable : !clause.isEditable
      )
    }

    if (appliedMandatory !== 'Mandatory Status') {
      const shouldBeMandatory = appliedMandatory === 'Mandatory'
      filtered = filtered.filter((clause) => clause.isMandatory === shouldBeMandatory)
    }

    if (appliedTemplate !== 'All Templates') {
      filtered = filtered.filter((clause) => clause.contractTemplateTitle === appliedTemplate)
    }
    
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    setFilteredClauses(filtered)
    setCurrentPage(1)
  }, [clauses, search, appliedStatus, appliedMandatory, appliedTemplate])

  const statusOptions = ['Editable Status', 'Editable', 'Non-Editable']
  const mandatoryOptions = ['Mandatory Status', 'Mandatory', 'Optional']
  const templateOptions = [
    'All Templates',
    ...Array.from(
      new Set(
        clauses
          .map((clause) => clause.contractTemplateTitle)
          .filter((title) => Boolean(title))
      )
    ),
  ]
  const handleViewDetails = (clauseId: number) => {
    console.log('Viewing details for clause:', clauseId)
  }

  const handleCreateClause = () => {
    console.log('Creating new clause')
  }

  const handleEdit = (clauseId: number) => {
    console.log('Editing clause:', clauseId)
  }

  const handleDelete = (clauseId: number) => {
    console.log('Deleting clause:', clauseId)
  }

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
  }

  const applyFilters = () => {
    setAppliedStatus(statusFilter)
    setAppliedMandatory(mandatoryFilter)
    setAppliedTemplate(templateFilter)
  }

  const clearFilters = () => {
    setSearch('')
    setStatusFilter('Editable Status')
    setMandatoryFilter('Mandatory Status')
    setTemplateFilter('All Templates')
    setAppliedStatus('Editable Status')
    setAppliedMandatory('Mandatory Status')
    setAppliedTemplate('All Templates')
    setCurrentPage(1)
  }

  return (
    <div className='space-y-6 bg-gray-50 p-6'>
      <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-200 space-y-4'>
        <h2 className='text-lg font-semibold text-gray-800 text-left ml-4'>Filter Clauses</h2>
        <div className='flex flex-col gap-3 lg:flex-row lg:items-center'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-3 flex-1'>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <select
              value={mandatoryFilter}
              onChange={(e) => setMandatoryFilter(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            >
              {mandatoryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <select
              value={templateFilter}
              onChange={(e) => setTemplateFilter(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            >
              {templateOptions.map((template) => (
                <option key={template} value={template}>
                  {template}
                </option>
              ))}
            </select>
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

        <div className='relative'>
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

      {/* Table */}
      <div className='bg-white rounded-xl shadow-sm border border-gray-300'>
        <div className='p-6 border-b border-gray-100 flex items-center justify-between gap-4'>
          <div className='flex flex-col items-center text-center flex-1 ml-32'>
            <h2 className='text-xl text-gray-800 font-semibold'>Template Clauses</h2>
          </div>
          <button
            onClick={handleCreateClause}
            className='bg-green-600 text-white px-4 py-1.5 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2'
          >
            <Plus size={18} />
            <span>Create</span>
          </button>
        </div>
        
        <div className='overflow-x-auto'>
          <table className='w-full table-fixed'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-40'>
                  Code
                </th>
                <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-60'>
                  Title
                </th>
                <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24'>
                  Mandatory
                </th>
                <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24'>
                  Editable
                </th>
                <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-40'>
                  Template
                </th>
                <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32'>
                  Created At
                </th>
                <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-40'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {loading ? (
                <tr>
                  <td colSpan={7} className='text-center py-6 text-gray-500 text-sm'>
                    Loading...
                  </td>
                </tr>
              ) : paginatedClauses.length === 0 ? (
                <tr>
                  <td colSpan={7} className='text-center py-6 text-gray-500 text-sm'>
                    No clauses found.
                  </td>
                </tr>
              ) : (
                paginatedClauses.map((clause) => (
                  <tr key={clause.id} className='hover:bg-gray-50'>
                    <td className='px-6 py-4 text-sm text-gray-900 text-center w-40 truncate'>
                      {clause.clauseCode}
                    </td>
                    <td className='px-6 py-4 text-sm text-gray-900 text-center w-60 truncate'>
                      <div className='flex items-center justify-center space-x-2'>
                        <span>{clause.title}</span>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-center w-24'>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        clause.isMandatory ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {clause.isMandatory ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-center w-24'>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        clause.isEditable ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {clause.isEditable ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center w-40'>
                      {clause.contractTemplateTitle}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center w-32'>
                      {new Date(clause.createdAt).toLocaleDateString()}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-center w-40'>
                      <div className='flex items-center justify-center space-x-2 text-gray-600'>
                        <button
                          onClick={() => handleViewDetails(clause.id)}
                          className='flex items-center space-x-1 hover:text-gray-800 text-xs'
                        >
                          <Eye size={14} />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => handleEdit(clause.id)}
                          className='flex items-center space-x-1 hover:text-gray-800 text-xs'
                        >
                          <Edit size={14} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(clause.id)}
                          className='flex items-center space-x-1 hover:text-gray-800 text-xs'
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
            Showing {paginatedClauses.length} of {filteredClauses.length} clause{filteredClauses.length === 1 ? '' : 's'}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Clauses