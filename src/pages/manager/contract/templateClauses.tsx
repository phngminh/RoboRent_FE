import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader } from '../../../components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table'
import { Input } from '../../../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { Button } from '../../../components/ui/button'
import { Search, Plus, Eye, Edit, Trash2 } from 'lucide-react'
import { getAllClauses, type TemplateClauseResponse } from '../../../apis/contractTemplates.api'

const Clauses: React.FC = () => {
  const [clauses, setClauses] = useState<TemplateClauseResponse[]>([])
  const [filteredClauses, setFilteredClauses] = useState<TemplateClauseResponse[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Status')
  const [appliedStatus, setAppliedStatus] = useState('All Status')
  const [mandatoryFilter, setMandatoryFilter] = useState('All Status')
  const [appliedMandatory, setAppliedMandatory] = useState('All Status')
  const [templateFilter, setTemplateFilter] = useState('')
  const [appliedTemplate, setAppliedTemplate] = useState('')
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
    if (templateFilter || !clauses.length) return

    const [first] = [...new Set(
      clauses.map(c => c.contractTemplateTitle).filter(Boolean)
    )].sort()

    if (first) {
      setTemplateFilter(first)
      setAppliedTemplate(first)
    }
  }, [clauses, templateFilter])


  useEffect(() => {
    let filtered = clauses || []

    if (search.trim()) {
      const searchTerm = search.toLowerCase()
      filtered = filtered.filter((clause) =>
        clause.title.toLowerCase().includes(searchTerm)
      )
    }

    if (appliedStatus !== 'All Status') {
      filtered = filtered.filter((clause) =>
        appliedStatus === 'Editable' ? clause.isEditable : !clause.isEditable
      )
    }

    if (appliedMandatory !== 'All Status') {
      const shouldBeMandatory = appliedMandatory === 'Mandatory'
      filtered = filtered.filter((clause) => clause.isMandatory === shouldBeMandatory)
    }

    if (appliedTemplate) {
      filtered = filtered.filter((clause) => clause.contractTemplateTitle === appliedTemplate)
    }
    
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    setFilteredClauses(filtered)
    setCurrentPage(1)
  }, [clauses, search, appliedStatus, appliedMandatory, appliedTemplate])

  const statusOptions = ['All Status', 'Editable', 'Non-Editable']
  const mandatoryOptions = ['All Status', 'Mandatory', 'Optional']
  const templateOptions = Array.from(
    new Set(
      clauses
        .map((clause) => clause.contractTemplateTitle)
        .filter((title) => Boolean(title))
    )
  ).sort()

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
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const applyFilters = () => {
    setAppliedStatus(statusFilter)
    setAppliedMandatory(mandatoryFilter)
    setAppliedTemplate(templateFilter)
  }

  const clearFilters = () => {
    setSearch('')
    setStatusFilter('All Status')
    setMandatoryFilter('All Status')
    setTemplateFilter('')
    setAppliedStatus('All Status')
    setAppliedMandatory('All Status')
    setAppliedTemplate('')
    setCurrentPage(1)
  }

  const columns = [
    {
      key: 'clauseCode',
      title: 'Code',
      accessor: 'clauseCode' as keyof TemplateClauseResponse,
      className: 'w-40 whitespace-nowrap',
    },
    {
      key: 'title',
      title: 'Title',
      accessor: 'title' as keyof TemplateClauseResponse,
      className: 'w-60 whitespace-nowrap',
    },
    {
      key: 'isMandatory',
      title: 'Mandatory',
      className: 'w-24 whitespace-nowrap',
    },
    {
      key: 'isEditable',
      title: 'Editable',
      className: 'w-24 whitespace-nowrap',
    },
    {
      key: 'contractTemplateTitle',
      title: 'Template',
      accessor: 'contractTemplateTitle' as keyof TemplateClauseResponse,
      className: 'w-40 whitespace-nowrap',
    },
    {
      key: 'createdAt',
      title: 'Created At',
      className: 'w-32 whitespace-nowrap',
    },
    {
      key: 'actions',
      title: 'Actions',
      className: 'w-40 whitespace-nowrap',
    },
  ]

  const getMandatoryColor = (isMandatory: boolean) => {
    return isMandatory ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
  }

  const getEditableColor = (isEditable: boolean) => {
    return isEditable ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
  }

  return (
    <div className='space-y-6 bg-gray-50 p-6'>
      <Card className='rounded-xl shadow-sm border border-gray-100'>
        <CardHeader className='pb-0'>
          <h2 className='text-lg font-semibold text-gray-800 text-center mb-3'>Filter Clauses</h2>
        </CardHeader>
        <CardContent className='p-6 pt-0'>
          <div className='flex flex-col gap-4 md:flex-row md:items-end md:gap-4'>
            <div className='flex flex-1 md:gap-4'>
              <div className='w-full md:w-40'>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Editable Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'>
                    <SelectValue placeholder='Editable Status' />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='w-full md:w-40'>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Mandatory Status</label>
                <Select value={mandatoryFilter} onValueChange={setMandatoryFilter}>
                  <SelectTrigger className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'>
                    <SelectValue placeholder='Mandatory Status' />
                  </SelectTrigger>
                  <SelectContent>
                    {mandatoryOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='flex-1'>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Template</label>
                <Select value={templateFilter} onValueChange={setTemplateFilter}>
                  <SelectTrigger className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'>
                    <SelectValue placeholder='Select Template' />
                  </SelectTrigger>
                  <SelectContent>
                    {templateOptions.map((template) => (
                      <SelectItem key={template} value={template}>
                        {template}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='flex-1'>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Search by Title</label>
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500' size={18} />
                  <Input
                    placeholder='Enter clause title...'
                    className='w-full pl-10 pr-4 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className='flex gap-2'>
              <Button
                onClick={applyFilters}
                className='px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
              >
                Apply Filters
              </Button>

              <Button
                onClick={clearFilters}
                variant='outline'
                size='sm'
                className='px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors'
              >
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className='rounded-xl shadow-sm border border-gray-300 relative'>
        <CardHeader className='p-6 border-b border-gray-100 relative'>
          <h2 className='text-xl text-gray-800 font-semibold text-center w-full'>
            Template Clauses
          </h2>
          <Button
            onClick={handleCreateClause}
            className='absolute right-6 top-3.5 bg-green-600 text-white px-4 py-1.5 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2'
          >
            <Plus size={18} />
            <span>Create</span>
          </Button>
        </CardHeader>

        <CardContent className='p-0'>
          <div className='overflow-x-auto'>
            <div className='rounded-md border overflow-hidden'>
              <Table>
                <TableHeader className='bg-gray-50'>
                  <TableRow>
                    {columns.map((column) => (
                      <TableHead
                        key={column.key}
                        className={`px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider ${column.className || ''}`}
                      >
                        {column.title}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={columns.length} className='text-center py-6 text-gray-500 text-sm'>
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : paginatedClauses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={columns.length} className='text-center py-6 text-gray-500 text-sm'>
                        No clauses found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedClauses.map((clause) => (
                      <TableRow key={clause.id} className='hover:bg-gray-50'>
                        {columns.map((column) => {
                          const cellClass = `px-6 py-4 text-sm text-gray-900 text-center ${column.className || ''}`
                          let content: React.ReactNode
                          if (column.key === 'title' || column.key === 'clauseCode') {
                            content = <span className='truncate'>{clause[column.accessor as keyof TemplateClauseResponse]}</span>
                          } else if (column.key === 'isMandatory') {
                            content = (
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getMandatoryColor(clause.isMandatory)}`}>
                                {clause.isMandatory ? 'Yes' : 'No'}
                              </span>
                            )
                          } else if (column.key === 'isEditable') {
                            content = (
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEditableColor(clause.isEditable)}`}>
                                {clause.isEditable ? 'Yes' : 'No'}
                              </span>
                            )
                          } else if (column.key === 'createdAt') {
                            content = new Date(clause.createdAt).toLocaleDateString()
                          } else if (column.key === 'actions') {
                            content = (
                              <div className='flex items-center justify-center space-x-2 text-sm text-gray-600'>
                                <button
                                  onClick={() => handleViewDetails(clause.id)}
                                  className='flex items-center space-x-1 hover:text-gray-800'
                                >
                                  <Eye size={14} />
                                  <span>View</span>
                                </button>
                                <button
                                  onClick={() => handleEdit(clause.id)}
                                  className='flex items-center space-x-1 hover:text-gray-800'
                                >
                                  <Edit size={14} />
                                  <span>Edit</span>
                                </button>
                                <button
                                  onClick={() => handleDelete(clause.id)}
                                  className='flex items-center space-x-1 hover:text-gray-800'
                                >
                                  <Trash2 size={14} />
                                  <span>Delete</span>
                                </button>
                              </div>
                            )
                          } else {
                            content = clause[column.accessor as keyof TemplateClauseResponse]
                          }
                          return <TableCell key={column.key} className={cellClass}>{content}</TableCell>
                        })}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className='px-6 py-4 border-t border-gray-100 flex items-center justify-between'>
            <div className='flex space-x-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 text-sm transition-colors ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:text-gray-800'}`}
              >
                Previous
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={page === currentPage ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => handlePageChange(page)}
                  className='px-3 py-1 text-sm rounded transition-colors'
                >
                  {page}
                </Button>
              ))}
              <Button
                variant='outline'
                size='sm'
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 text-sm transition-colors ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:text-gray-800'}`}
              >
                Next
              </Button>
            </div>
            <div className='text-sm text-gray-500'>
              Showing {paginatedClauses.length} of {filteredClauses.length} clause{filteredClauses.length === 1 ? '' : 's'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Clauses