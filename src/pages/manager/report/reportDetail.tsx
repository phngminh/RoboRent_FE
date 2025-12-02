import React, { useState, useEffect } from 'react'
import { ArrowLeft, CheckCircle, XCircle, FileText, Calendar, User } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Button } from '../../../components/ui/button'
import { getReportById, managerResolve, managerReject, type ContractReportResponse } from '../../../apis/contractReport.api'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog'
import { Textarea } from '../../../components/ui/textarea'

interface ReportDetailProps {
  onBack: () => void
}

const ReportDetail: React.FC<ReportDetailProps> = ({ onBack }) => {
  const { reportId: reportIdString } = useParams<{ reportId: string }>()
  const reportId = reportIdString ? parseInt(reportIdString, 10) : 0
  const [rejectOpen, setRejectOpen] = useState(false)
  const [resolveOpen, setResolveOpen] = useState(false)
  const [resolution, setResolution] = useState('')
  const [report, setReport] = useState<ContractReportResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchReport = async () => {
    try {
      const data = await getReportById(reportId)
      console.log('Fetched report data:', data)
      setReport(data)
    } catch (error) {
      toast.error('Failed to load report details.')
      console.error('Error fetching report:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReport()
  }, [reportId])

  const decodeHtml = (html: string) => {
    const txt = document.createElement('textarea')
    txt.innerHTML = html
    return txt.value
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'Rejected':
        return 'bg-red-100 text-red-800'
      case 'Resolved':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className='space-y-6 bg-white p-6 max-w-8xl mx-auto'>
        <Button
          onClick={onBack}
          variant='ghost'
          className='flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 mb-2 -mt-4'
        >
          <ArrowLeft size={18} />
          Back to Reports
        </Button>
        <div className='flex items-center justify-center py-12'>
          <p className='text-gray-500'>Loading report details...</p>
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className='space-y-6 bg-white p-6 max-w-8xl mx-auto'>
        <Button
          onClick={onBack}
          variant='ghost'
          className='flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 mb-2 -mt-4'
        >
          <ArrowLeft size={18} />
          Back to Reports
        </Button>
        <div className='flex items-center justify-center py-12'>
          <p className='text-red-500'>Report not found</p>
        </div>
      </div>
    )
  }

  const handleConfirmResolve = async () => {
    try {
      await managerResolve(reportId, resolution)
      toast.success('Resolved successfully!')
      setResolveOpen(false)
      setResolution('')
      onBack()
    } catch (err) {
      console.log('err:', err)
      toast.error('Resolvement failed')
    }
  }

  const handleConfirmReject = async () => {
    try {
      await managerReject(reportId, resolution)
      toast.success('Rejected successfully!')
      setRejectOpen(false)
      setResolution('')
      onBack()
    } catch (err) {
      console.log('err:', err)
      toast.error('Rejection failed')
    }
  }

  const evidenceItem = report.evidencePath ? [
    { type: 'Document', name: report.evidencePath.split('/').pop() || report.evidencePath, date: '' }
  ] : []

  return (
    <div className='space-y-6 bg-white p-6 max-w-8xl mx-auto'>
      <Button
        onClick={onBack}
        variant='ghost'
        className='flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 mb-2 -mt-4'
      >
        <ArrowLeft size={18} />
        Back to Reports
      </Button>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='lg:col-span-2 space-y-6'>
          <div className='rounded-lg shadow-sm border border-gray-200'>
            <div className='p-6 pb-3 border-b border-gray-200'>
              <h2 className='text-2xl font-semibold text-gray-800 flex items-center space-x-2'>
                <FileText size={20} />
                <span className='-mt-1'>Report Information</span>
              </h2>
            </div>
            <div className='grid grid-cols-2 gap-6 p-6'>
              <div className='space-y-4'>
                <div>
                  <label className='text-sm font-medium text-gray-500'>Draft Clause Title</label>
                  <p className='text-sm text-gray-900 mt-1'>{decodeHtml(report.draftClauseTitle)}</p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-500'>Status</label>
                  <p className='text-sm text-gray-900 mt-1 font-bold rounded-full'>
                    <span className={`px-2 py-1 rounded ${getStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                  </p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-500'>Created Date</label>
                  <p className='text-sm text-gray-900 mt-1 flex items-center space-x-1'>
                    <Calendar size={14} />
                    <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                  </p>
                </div>
              </div>
              <div className='space-y-4'>
                <div>
                  <label className='text-sm font-medium text-gray-500'>Resolution</label>
                  <p className='text-sm text-gray-900 mt-1'>{report.resolution || 'No resolution provided yet.'}</p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-500'>Reviewer Name</label>
                  <p className='text-sm text-gray-900 mt-1'>{report.reviewerName || 'No reviewer name provided yet.'}</p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-500'>Reviewed At</label>
                  <p className='text-sm text-gray-900 mt-1 flex items-center space-x-1'>
                    <Calendar size={14} />
                    <span>{report.reviewedAt ? new Date(report.reviewedAt).toLocaleDateString() : 'Not reviewed yet.'}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className='rounded-lg shadow-sm border border-gray-200'>
            <div className='p-6 pb-3 border-b border-gray-200'>
              <h2 className='text-2xl font-semibold text-gray-800'>Description</h2>
            </div>
            <div className='p-6'>
              <p className='text-sm text-gray-700 leading-relaxed'>{report.description || 'No description provided.'}</p>
            </div>
          </div>
        </div>

        <div className='space-y-6'>
          <div className='rounded-lg shadow-sm border border-gray-200'>
            <div className='p-6 pb-3 border-b border-gray-200'>
              <h2 className='text-2xl font-semibold text-gray-800 flex items-center space-x-2'>
                <User size={20} />
                <span className='-mt-1'>Parties Involved</span>
              </h2>
            </div>
            <div className='p-6 space-y-4'>
              <div>
                <label className='text-sm font-medium text-blue-500'>Reporter</label>
                <p className='text-sm text-gray-900 mt-1 font-medium'>{report.reporterName}</p>
                <p className='text-xs text-gray-500 mt-1'>{report.reportRole}</p>
              </div>
              <div className='border-t border-gray-200 pt-4'>
                <label className='text-sm font-medium text-red-500'>Accused Party</label>
                <p className='text-sm text-gray-900 mt-1 font-medium'>{report.accusedName}</p>
              </div>
            </div>
          </div>

          {evidenceItem.length > 0 && (
            <div className='rounded-lg shadow-sm border border-gray-200'>
              <div className='p-6 pb-3 border-b border-gray-200'>
                <h2 className='text-2xl font-semibold text-gray-800'>Evidence & Documents</h2>
              </div>
              <div className='p-6 space-y-3'>
                {evidenceItem.map((item, index) => (
                  <div key={index} className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                    <div className='flex items-center space-x-3'>
                      <FileText className='text-blue-600' size={20} />
                      <div>
                        <p className='text-sm font-medium text-gray-900'>{item.name}</p>
                        <p className='text-xs text-gray-500'>{item.type}</p>
                      </div>
                    </div>
                    <button className='text-blue-600 hover:text-blue-700 text-sm font-medium'>
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className='flex justify-end gap-3 mr-8'>
        <Button
          onClick={() => setRejectOpen(true)} 
          disabled={report.status === 'Rejected' || report.status === 'Resolved'}
          className='bg-red-600 text-white hover:bg-red-700 flex items-center space-x-2'
        >
          <XCircle size={18} />
          <span>Reject</span>
        </Button>
        <Button
          onClick={() => setResolveOpen(true)} 
          disabled={report.status === 'Resolved' || report.status === 'Rejected'}
          className='bg-green-600 text-white hover:bg-green-700 flex items-center space-x-2'
        >
          <CheckCircle size={18} />
          <span>Resolve</span>
        </Button>
      </div>

      <Dialog 
        open={resolveOpen} 
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setResolveOpen(false)
            setResolution('')
          }
        }}
      >
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>Enter Resolution</DialogTitle>
            <DialogDescription>
              Please enter your resolution to approve the report.
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4 -mt-4'>
            <Textarea
              placeholder='Enter your resolution...'
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              className='min-h-[100px]'
            />
          </div>
          <DialogFooter>
            <Button type='submit' variant='outline' onClick={() => setResolveOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmResolve} disabled={!resolution.trim()}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog 
        open={rejectOpen} 
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setRejectOpen(false)
            setResolution('')
          }
        }}
      >
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>Enter Rejection Reason</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting the report.
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4 -mt-4'>
            <Textarea
              placeholder='Enter your resolution...'
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              className='min-h-[100px]'
            />
          </div>
          <DialogFooter>
            <Button type='submit' variant='outline' onClick={() => setRejectOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmReject} disabled={!resolution.trim()}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ReportDetail