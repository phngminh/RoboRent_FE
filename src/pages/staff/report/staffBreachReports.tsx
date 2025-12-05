import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader } from '../../../components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table'
import { Input } from '../../../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { Button } from '../../../components/ui/button'
import { Search, Eye } from 'lucide-react'
import { getMyReports, type ContractReportResponse } from '../../../apis/contractReport.api'

interface StaffBreachReportsProps {
  onView: (reportId: number) => void
}

const StaffBreachReports: React.FC<StaffBreachReportsProps> = ({ onView }) => {
  const [reports, setReports] = useState<ContractReportResponse[]>([])
  const [filteredReports, setFilteredReports] = useState<ContractReportResponse[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Status')
  const [appliedStatus, setAppliedStatus] = useState('All Status')
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const pageSize = 5
  const totalPages = Math.ceil(filteredReports.length / pageSize)
  const paginatedReports = filteredReports.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const fetchReports = async () => {
    try {
      setLoading(true)
      const reportsData = await getMyReports()
      console.log('Fetched reports:', reportsData)
      setReports(reportsData)
      setFilteredReports(reportsData)
    } catch (err) {
      console.error('Failed to load reports', err)
      setReports([])
      setFilteredReports([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [])

  useEffect(() => {
    let filtered = [...reports]
    if (search.trim()) {
      const searchTerm = search.toLowerCase()
      filtered = filtered.filter((report) =>
        report.draftClauseTitle.toLowerCase().includes(searchTerm)
      )
    }

    if (appliedStatus !== 'All Status') {
      filtered = filtered.filter((report) => report.status === appliedStatus)
    }

    setFilteredReports(filtered)
    setCurrentPage(1)
  }, [reports, search, appliedStatus])

  const statusOptions = ['All Status', 'Pending', 'Rejected', 'Resolved']

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'Rejected':
        return 'bg-red-100 text-red-800'
      case 'Resolved':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const decodeHtml = (html: string) => {
    const txt = document.createElement('textarea')
    txt.innerHTML = html
    return txt.value
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
      key: 'id',
      title: 'ID',
      accessor: 'id' as keyof ContractReportResponse,
      className: 'w-[100px] whitespace-nowrap',
    },
     {
      key: 'draftClauseTitle',
      title: 'Title',
      accessor: 'draftClauseTitle' as keyof ContractReportResponse,
      className: 'w-[100px] whitespace-nowrap',
    },
    {
      key: 'accusedName',
      title: 'Accused Name',
      accessor: 'accusedName' as keyof ContractReportResponse,
      className: 'w-[120px] whitespace-nowrap',
    },
    {
      key: 'description',
      title: 'Description',
      accessor: 'description' as keyof ContractReportResponse,
      className: 'w-[80px] whitespace-nowrap',
    },
    {
      key: 'createdAt',
      title: 'Created At',
      className: 'w-[120px] whitespace-nowrap',
    },
    {
      key: 'reporterName',
      title: 'Reporter Name',
      accessor: 'reporterName' as keyof ContractReportResponse,
      className: 'w-[120px] whitespace-nowrap',
    },
    {
      key: 'reportRole',
      title: 'Reporter Role',
      accessor: 'reportRole' as keyof ContractReportResponse,
      className: 'max-w-md whitespace-nowrap',
    },
    {
      key: 'status',
      title: 'Status',
      className: 'w-[120px] whitespace-nowrap',
    },
    {
      key: 'actions',
      title: 'Actions',
      className: 'w-[200px] whitespace-nowrap',
    },
  ]

  return (
    <div className='space-y-6 bg-gray-50 p-6'>
      <Card className='rounded-xl shadow-sm border border-gray-100'>
        <CardHeader className='pb-0'>
          <h2 className='text-lg font-semibold text-gray-800 text-center mb-3'>Filter Reports</h2>
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
                    placeholder='Enter report title...'
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
            Breach of Contract Reports
          </h2>
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
                  ) : paginatedReports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={columns.length} className='text-center py-6 text-gray-500 text-sm'>
                        No reports found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedReports.map((report) => (
                      <TableRow key={report.id} className='hover:bg-gray-50'>
                        {columns.map((column) => {
                          const cellClass = `px-6 py-4 text-sm text-gray-900 text-center ${column.className || ''}`
                          let content: React.ReactNode
                          if (column.key === 'draftClauseTitle') {
                            content = decodeHtml(report.draftClauseTitle)
                          } else if (column.key === 'status') {
                            content = <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status)}`}>
                              {report.status}
                            </span>
                          } else if (column.key === 'createdAt' || column.key === 'reviewedAt') {
                            content = report[column.key as 'createdAt' | 'reviewedAt'] 
                                ? new Date(report[column.key as 'createdAt' | 'reviewedAt']).toLocaleDateString()
                                : 'N/A'
                          } else if (column.key === 'actions') {
                            content = (
                              <div className='flex items-center justify-center space-x-2 text-sm'>
                                <button
                                  onClick={() => onView(report.id)}
                                  className='flex items-center space-x-1 rounded px-2 py-1 bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors'
                                >
                                  <Eye size={14} />
                                  <span>View</span>
                                </button>
                              </div>
                            )
                          } else {
                            const value = report[column.accessor as keyof ContractReportResponse]
                            if (value instanceof Date) {
                              content = value.toLocaleDateString()
                            } else if (value === null || value === undefined) {
                              content = 'N/A'
                            } else {
                              content = String(value)
                            }
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
              Showing {paginatedReports.length} of {filteredReports.length} report{filteredReports.length === 1 ? '' : 's'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default StaffBreachReports