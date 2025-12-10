import React, { useState, useEffect } from 'react'
import { ArrowLeft, FileText, Calendar, User, ImageIcon, Eye, Download } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Button } from '../../../components/ui/button'
import { getReportById, type ContractReportResponse } from '../../../apis/contractReport.api'

interface ReportDetailProps {
  onBack: () => void
}

const CustomerReportDetail: React.FC<ReportDetailProps> = ({ onBack }) => {
  const { reportId: reportIdString } = useParams<{ reportId: string }>()
  const reportId = reportIdString ? parseInt(reportIdString, 10) : 0
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

  const evidenceItems = report && report.evidencePath 
    ? report.evidencePath
        .split(';')
        .filter(path => path.trim() !== '')
        .map((path) => {
          const trimmedPath = path.trim()
          const name = trimmedPath.split('/').pop()?.split('?')[0] || 'Unknown File'
          const extension = name.split('.').pop()?.toLowerCase() || ''
          const imageExts = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp']
          const videoExts = ['mp4', 'mov', 'avi', 'webm', 'mkv']
          const isImage = imageExts.includes(extension)
          const isVideo = videoExts.includes(extension)
          const isMedia = isImage || isVideo
          const type = isImage ? 'Image' : isVideo ? 'Video' : 'Document'
          const icon = isMedia 
            ? <ImageIcon className='text-blue-600' size={20} /> 
            : <FileText className='text-blue-600' size={20} />
          
          return {
            type,
            name,
            url: trimmedPath,
            date: new Date(report.createdAt).toLocaleDateString(),
            icon,
            isImage: isMedia // Repurposed to mean "viewable media"
          }
        })
    : []

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch file')
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
      toast.success('Download started successfully')
    } catch (error) {
      console.error('Download failed:', error)
      toast.error('Failed to download file')
    }
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

          {report.paymentLink && (
            <div className='rounded-lg shadow-sm border border-gray-200'>
              <div className='p-6 pb-3 border-b border-gray-200'>
                <h2 className='text-2xl font-semibold text-gray-800'>Payment Link</h2>
                </div>
                <div className='p-6'>{report.paymentLink}</div>
            </div>
          )}
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

          {evidenceItems.length > 0 && (
            <div className='rounded-lg shadow-sm border border-gray-200'>
              <div className='p-6 pb-3 border-b border-gray-200'>
                <h2 className='text-2xl font-semibold text-gray-800'>Evidence & Documents</h2>
              </div>
              <div className='p-6 space-y-3'>
                {evidenceItems.map((item, index) => (
                  <div key={index} className='flex flex-col space-y-3 p-3 bg-gray-50 rounded-lg'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center space-x-3 flex-1'>
                        {item.icon}
                        <div>
                          <p className='text-sm font-medium text-gray-900'>{item.name}</p>
                          <p className='text-xs text-gray-500'>{item.type} • {item.date}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className='flex justify-end gap-2 pt-2'>
                      {item.isImage ? (
                        <>
                          <Button
                            onClick={() => window.open(item.url, '_blank')}
                            variant='outline'
                            size='sm'
                            className='px-3 py-1 text-xs flex items-center space-x-1'
                          >
                            <Eye size={14} />
                            View
                          </Button>
                          <Button
                            onClick={() => handleDownload(item.url, item.name)}
                            variant='outline'
                            size='sm'
                            className='px-3 py-1 text-xs flex items-center space-x-1'
                          >
                            <Download size={14} />
                            <span>Download</span>
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            onClick={() => handleDownload(item.url, item.name)}
                            variant='outline'
                            size='sm'
                            className='px-3 py-1 text-xs flex items-center space-x-1'
                          >
                            <Download size={14} />
                            <span>Download</span>
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CustomerReportDetail