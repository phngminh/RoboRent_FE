import React from 'react'
import { ArrowLeft, CheckCircle, XCircle, FileText, Calendar, User, AlertTriangle } from 'lucide-react'

interface ReportDetailProps {
  reportId: string
  onBack: () => void
}

const ReportDetail: React.FC<ReportDetailProps> = ({ reportId, onBack }) => {
  // Mock data - in real app, this would be fetched based on reportId
  const report = {
    id: reportId,
    contractId: 'CONT-2023-005',
    reporterRole: 'Legal Counsel',
    reporterName: 'John Smith',
    accusedRole: 'Vendor A',
    accusedName: 'ABC Corporation',
    category: 'Financial',
    status: 'Pending',
    createdAt: '2024-03-10',
    description: 'The vendor has failed to make scheduled payments as per the contract terms. Three consecutive monthly payments have been missed, totaling $45,000. Despite multiple reminders and formal notices, no response has been received from the vendor.',
    evidence: [
      { type: 'Document', name: 'Payment Reminder Notice.pdf', date: '2024-02-15' },
      { type: 'Email', name: 'Formal Notice to Vendor.pdf', date: '2024-02-28' },
      { type: 'Contract', name: 'Original Contract Agreement.pdf', date: '2023-10-26' }
    ],
    contractDetails: {
      startDate: '2023-10-26',
      endDate: '2024-10-26',
      totalValue: '$150,000',
      paymentTerms: 'Monthly installments of $12,500'
    },
    impact: 'High',
    severity: 'Critical'
  }

  const handleApprove = () => {
    console.log('Approving report:', reportId)
    // TODO: Implement approve functionality
    alert('Report approved successfully!')
  }

  const handleReject = () => {
    console.log('Rejecting report:', reportId)
    // TODO: Implement reject functionality
    if (confirm('Are you sure you want to reject this report?')) {
      alert('Report rejected.')
    }
  }

  return (
    <div className='space-y-6 bg-gray-50 p-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-4'>
          <button
            onClick={onBack}
            className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
          >
            <ArrowLeft size={20} className='text-gray-600' />
          </button>
          <div>
            <h1 className='text-2xl font-bold text-gray-800'>Report Details</h1>
            <p className='text-gray-600 mt-1'>Review breach of contract report information</p>
          </div>
        </div>
        <div className='flex items-center space-x-2'>
          <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
            report.status === 'Pending' ? 'bg-orange-100 text-orange-800' :
            report.status === 'Under Review' ? 'bg-blue-100 text-blue-800' :
            report.status === 'Resolved' ? 'bg-green-100 text-green-800' :
            'bg-red-100 text-red-800'
          }`}>
            {report.status}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Left Column - Main Details */}
        <div className='lg:col-span-2 space-y-6'>
          {/* Report Information */}
          <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100'>
            <h2 className='text-xl font-semibold text-gray-800 mb-4 flex items-center space-x-2'>
              <FileText size={20} />
              <span>Report Information</span>
            </h2>
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='text-sm font-medium text-gray-500'>Report ID</label>
                  <p className='text-sm text-gray-900 mt-1 font-medium'>{report.id}</p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-500'>Contract ID</label>
                  <p className='text-sm text-gray-900 mt-1 font-medium'>{report.contractId}</p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-500'>Category</label>
                  <p className='text-sm text-gray-900 mt-1'>{report.category}</p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-500'>Created Date</label>
                  <p className='text-sm text-gray-900 mt-1 flex items-center space-x-1'>
                    <Calendar size={14} />
                    <span>{report.createdAt}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100'>
            <h2 className='text-xl font-semibold text-gray-800 mb-4'>Description</h2>
            <p className='text-sm text-gray-700 leading-relaxed'>{report.description}</p>
          </div>

          {/* Evidence */}
          <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100'>
            <h2 className='text-xl font-semibold text-gray-800 mb-4'>Evidence & Documents</h2>
            <div className='space-y-3'>
              {report.evidence.map((item, index) => (
                <div key={index} className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                  <div className='flex items-center space-x-3'>
                    <FileText className='text-blue-600' size={20} />
                    <div>
                      <p className='text-sm font-medium text-gray-900'>{item.name}</p>
                      <p className='text-xs text-gray-500'>{item.type} • {item.date}</p>
                    </div>
                  </div>
                  <button className='text-blue-600 hover:text-blue-700 text-sm font-medium'>
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className='space-y-6'>
          {/* Parties Involved */}
          <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100'>
            <h2 className='text-xl font-semibold text-gray-800 mb-4 flex items-center space-x-2'>
              <User size={20} />
              <span>Parties Involved</span>
            </h2>
            <div className='space-y-4'>
              <div>
                <label className='text-sm font-medium text-gray-500'>Reporter</label>
                <p className='text-sm text-gray-900 mt-1 font-medium'>{report.reporterName}</p>
                <p className='text-xs text-gray-500 mt-1'>{report.reporterRole}</p>
              </div>
              <div className='border-t border-gray-200 pt-4'>
                <label className='text-sm font-medium text-gray-500'>Accused Party</label>
                <p className='text-sm text-gray-900 mt-1 font-medium'>{report.accusedName}</p>
                <p className='text-xs text-gray-500 mt-1'>{report.accusedRole}</p>
              </div>
            </div>
          </div>

          {/* Contract Details */}
          <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100'>
            <h2 className='text-xl font-semibold text-gray-800 mb-4'>Contract Details</h2>
            <div className='space-y-3'>
              <div>
                <label className='text-sm font-medium text-gray-500'>Start Date</label>
                <p className='text-sm text-gray-900 mt-1'>{report.contractDetails.startDate}</p>
              </div>
              <div>
                <label className='text-sm font-medium text-gray-500'>End Date</label>
                <p className='text-sm text-gray-900 mt-1'>{report.contractDetails.endDate}</p>
              </div>
              <div>
                <label className='text-sm font-medium text-gray-500'>Total Value</label>
                <p className='text-sm text-gray-900 mt-1 font-medium'>{report.contractDetails.totalValue}</p>
              </div>
              <div>
                <label className='text-sm font-medium text-gray-500'>Payment Terms</label>
                <p className='text-sm text-gray-900 mt-1'>{report.contractDetails.paymentTerms}</p>
              </div>
            </div>
          </div>

          {/* Severity & Impact */}
          <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100'>
            <h2 className='text-xl font-semibold text-gray-800 mb-4 flex items-center space-x-2'>
              <AlertTriangle size={20} className='text-orange-500' />
              <span>Severity & Impact</span>
            </h2>
            <div className='space-y-3'>
              <div>
                <label className='text-sm font-medium text-gray-500'>Severity</label>
                <p className='text-sm text-gray-900 mt-1'>
                  <span className='inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800'>
                    {report.severity}
                  </span>
                </p>
              </div>
              <div>
                <label className='text-sm font-medium text-gray-500'>Impact Level</label>
                <p className='text-sm text-gray-900 mt-1'>
                  <span className='inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800'>
                    {report.impact}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100'>
        <div className='flex items-center justify-end space-x-4'>
          <button
            onClick={onBack}
            className='px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors'
          >
            Cancel
          </button>
          <button
            onClick={handleReject}
            className='px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2'
          >
            <XCircle size={18} />
            <span>Reject Report</span>
          </button>
          <button
            onClick={handleApprove}
            className='px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2'
          >
            <CheckCircle size={18} />
            <span>Approve Report</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ReportDetail

