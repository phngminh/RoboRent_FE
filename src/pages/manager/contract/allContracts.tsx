import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader } from '../../../components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table'
import { Input } from '../../../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { Button } from '../../../components/ui/button'
import { Search, Plus, Eye, Edit, Lock, Unlock } from 'lucide-react'
import { getAllTemplates, type ContractTemplateResponse } from '../../../apis/contractTemplates.api'
import DetailContractTemplate from './detailContractTemplate'
import CreateContractTemplate from './createContractTemplate'
import EditContractTemplate from './editContractTemplate'
import DeleteContractTemplate from './deleteContractTemplate'

const ContractTemplates: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplateResponse | null>(null)
  const [templates, setTemplates] = useState<ContractTemplateResponse[]>([])
  const [filteredTemplates, setFilteredTemplates] = useState<ContractTemplateResponse[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Status')
  const [appliedStatus, setAppliedStatus] = useState('All Status')
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false)
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false)
  const [isEditModalVisible, setIsEditModalVisible] = useState(false)
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false)

  const pageSize = 5
  const totalPages = Math.ceil(filteredTemplates.length / pageSize)
  const paginatedTemplates = filteredTemplates.slice((currentPage - 1) * pageSize, currentPage * pageSize)

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

  useEffect(() => {
    fetchTemplates()
  }, [])

  useEffect(() => {
    let filtered = [...templates]
    if (search.trim()) {
      const searchTerm = search.toLowerCase()
      filtered = filtered.filter((template) =>
        template.title.toLowerCase().includes(searchTerm)
      )
    }

    if (appliedStatus !== 'All Status') {
      filtered = filtered.filter((template) => template.status === appliedStatus)
    }

    setFilteredTemplates(filtered)
    setCurrentPage(1)
  }, [templates, search, appliedStatus])

  const statusOptions = ['All Status', 'Initiated', 'Updated', 'Disabled']

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Initiated':
        return 'bg-gray-100 text-gray-800'
      case 'Updated':
        return 'bg-green-100 text-green-800'
      case 'Disabled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
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

  const columns = [
    {
      key: 'templateCode',
      title: 'Code',
      accessor: 'templateCode' as keyof ContractTemplateResponse,
      className: 'w-[100px] whitespace-nowrap',
    },
    {
      key: 'title',
      title: 'Title',
      accessor: 'title' as keyof ContractTemplateResponse,
      className: 'whitespace-nowrap',
    },
    {
      key: 'description',
      title: 'Description',
      accessor: 'description' as keyof ContractTemplateResponse,
      className: 'max-w-md',
    },
    {
      key: 'status',
      title: 'Status',
      className: 'w-[120px] whitespace-nowrap',
    },
    {
      key: 'version',
      title: 'Version',
      accessor: 'version' as keyof ContractTemplateResponse,
      className: 'w-[80px] whitespace-nowrap',
    },
    {
      key: 'createdAt',
      title: 'Created At',
      className: 'w-[120px] whitespace-nowrap',
    },
    {
      key: 'createdByName',
      title: 'Created By',
      accessor: 'createdByName' as keyof ContractTemplateResponse,
      className: 'w-[120px] whitespace-nowrap',
    },
    {
      key: 'actions',
      title: 'Actions',
      className: 'w-[200px] whitespace-nowrap',
    },
  ]

  const getActionButton = (template: ContractTemplateResponse) => {
    const isDisabled = template.status === 'Disabled'
    const baseClass = 'flex items-center space-x-1 rounded px-2 py-1 text-sm transition-colors'
    const actionClass = isDisabled 
      ? 'bg-green-100 text-green-800 hover:bg-green-200' 
      : 'bg-red-100 text-red-800 hover:bg-red-200'
    const Icon = isDisabled ? Unlock : Lock
    return (
      <button
        onClick={() => {
          setSelectedTemplate(template)
          setIsDeleteModalVisible(true)
        }}
        className={`${baseClass} ${actionClass}`}
      >
        <Icon size={14} />
        <span>{isDisabled ? 'Activate' : 'Disable'}</span>
      </button>
    )
  }

  return (
    <div className='space-y-6 bg-gray-50 p-6'>
      <Card className='rounded-xl shadow-sm border border-gray-100'>
        <CardHeader className='pb-0'>
          <h2 className='text-lg font-semibold text-gray-800 text-center mb-3'>Filter Templates</h2>
        </CardHeader>
        <CardContent className='p-6 pt-0'>
          <div className='flex flex-col gap-4 md:flex-row md:items-end md:gap-4'>
            <div className='flex flex-1 md:gap-4'>
              <div className='w-full md:w-48'>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'>
                    <SelectValue placeholder='Status' />
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

              <div className='flex-1'>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Search by Title</label>
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500' size={18} />
                  <Input
                    placeholder='Enter template title...'
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
            Contract Templates
          </h2>
          <Button
            onClick={() => setIsCreateModalVisible(true)}
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
                  ) : paginatedTemplates.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={columns.length} className='text-center py-6 text-gray-500 text-sm'>
                        No templates found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedTemplates.map((template) => (
                      <TableRow key={template.id} className='hover:bg-gray-50'>
                        {columns.map((column) => {
                          const cellClass = `px-6 py-4 text-sm text-gray-900 text-center ${column.className || ''}`
                          let content: React.ReactNode
                          if (column.key === 'description') {
                            content = <span className='max-w-md truncate'>{template[column.accessor as keyof ContractTemplateResponse] || 'N/A'}</span>
                          } else if (column.key === 'status') {
                            content = <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(template.status)}`}>
                              {template.status}
                            </span>
                          } else if (column.key === 'createdAt') {
                            content = new Date(template.createdAt).toLocaleDateString()
                          } else if (column.key === 'actions') {
                            content = (
                              <div className='flex items-center justify-center space-x-2 text-sm'>
                                <button
                                  onClick={() => {
                                    setSelectedTemplate(template)
                                    setIsDetailModalVisible(true)
                                  }}
                                  className='flex items-center space-x-1 rounded px-2 py-1 bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors'
                                >
                                  <Eye size={14} />
                                  <span>View</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedTemplate(template)
                                    setIsEditModalVisible(true)
                                  }}
                                  className='flex items-center space-x-1 rounded px-2 py-1 bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition-colors'
                                >
                                  <Edit size={14} />
                                  <span>Edit</span>
                                </button>
                                {getActionButton(template)}
                              </div>
                            )
                          } else {
                            content = template[column.accessor as keyof ContractTemplateResponse]
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
              Showing {paginatedTemplates.length} of {filteredTemplates.length} template{filteredTemplates.length === 1 ? '' : 's'}
            </div>
          </div>
        </CardContent>
      </Card>

      <DetailContractTemplate
        open={isDetailModalVisible}
        onClose={() => setIsDetailModalVisible(false)}
        template={selectedTemplate}
      />

      <CreateContractTemplate
        open={isCreateModalVisible}
        onClose={() => setIsCreateModalVisible(false)}
        onSuccess={() => {
          setIsCreateModalVisible(false)
          fetchTemplates()
        }}
      />

      <EditContractTemplate
        open={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        template={selectedTemplate}
        onSuccess={() => {
          setIsEditModalVisible(false)
          fetchTemplates()
        }}
      />

      <DeleteContractTemplate
        open={isDeleteModalVisible}
        onClose={() => setIsDeleteModalVisible(false)}
        template={selectedTemplate}
        onSuccess={() => {
          setIsDeleteModalVisible(false)
          fetchTemplates()
        }}
      />
    </div>
  )
}

export default ContractTemplates