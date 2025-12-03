import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Textarea } from '../../../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { ArrowLeft, Eye } from 'lucide-react'
import { getDraftById, type ContractDraftResponse } from '../../../apis/contractDraft.api'
import { getClausesByTemplate, type TemplateClauseResponse } from '../../../apis/contractTemplates.api'
import { getRequestById, type RentalRequestResponse } from '../../../apis/rentalRequest.api'
import { useParams } from 'react-router-dom'
import ViewContractDraft from '../../manager/contractDraft/fullContractDraft'

interface StaffDetailContractDraft {
  onBack: () => void
}

const StaffDetailContractDraft: React.FC<StaffDetailContractDraft> = ({ onBack }) => {
  const { draftId: draftIdString } = useParams<{ draftId: string }>()
  const draftId = draftIdString ? parseInt(draftIdString, 10) : 0
  const [draft, setDraft] = useState<ContractDraftResponse | null>(null)
  const [rental, setRental] = useState<RentalRequestResponse | null>(null)
  const [clauses, setClauses] = useState<TemplateClauseResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isViewModalVisible, setIsViewModalVisible] = useState(false)

  const fetchDraft = async () => {
    try {
      setLoading(true)
      const draftData = await getDraftById(draftId)
      if (draftData) {
        setDraft(draftData)
        if (draftData.contractTemplatesId) {
          fetchClauses(draftData.contractTemplatesId)
        }
        if (draftData.rentalId) {
          fetchRental(draftData.rentalId)
        }
      } else {
        setError('Failed to load draft')
      }
    } catch (err) {
      console.error('Failed to load draft', err)
      setError('Failed to load draft details')
    } finally {
      setLoading(false)
    }
  }

  const fetchClauses = async (templateId: number) => {
    try {
      const clauses = await getClausesByTemplate(templateId)
      setClauses(clauses)
    } catch (err) {
      console.error('Failed to load clauses', err)
    }
  }

  const fetchRental = async (requestId: number) => {
    try {
      const rental = await getRequestById(requestId)
      setRental(rental)
    } catch (err) {
      console.error('Failed to load rental details', err)
    }
  }

  useEffect(() => {
    if (draftId) {
      fetchDraft()
    } else {
      setError('Invalid draft ID')
      setLoading(false)
    }
  }, [draftId])

  const decodeHtml = (html: string) => {
    const txt = document.createElement('textarea')
    txt.innerHTML = html
    return txt.value
  }

  if (loading) {
    return (
      <div className='space-y-6 bg-gray-50 p-6'>
        <div className='flex items-center justify-center py-12'>
          <p className='text-gray-500'>Loading draft details...</p>
        </div>
      </div>
    )
  }

  if (error || !draft) {
    return (
      <div className='space-y-6 bg-gray-50 p-6'>
        <div className='flex items-center justify-center py-12'>
          <p className='text-red-500'>{error || 'Draft not found'}</p>
        </div>
        <div className='flex justify-center'>
          <Button onClick={onBack} variant='outline'>
            <ArrowLeft size={18} className='mr-2' />
            Back to List
          </Button>
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
        Back to Drafts
      </Button>

      <Card className='rounded-lg shadow-sm border border-gray-200'>
        <CardHeader className='pb-3 border-b border-gray-200'>
          <CardTitle className='text-2xl font-semibold text-gray-900 text-left'>Contract Details</CardTitle>
        </CardHeader>
        <CardContent className='p-6 space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div className='space-y-4'>
              <div>
                <label className='block text-xs font-medium text-gray-600 mb-1'>Contract Title</label>
                <Input value={draft.title} readOnly className='bg-white border-gray-300' />
              </div>
              <div>
                <label className='block text-xs font-medium text-gray-600 mb-1'>Status</label>
                <Select value={draft.status} disabled>
                  <SelectTrigger className='bg-white border-gray-300'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Draft'>Draft</SelectItem>
                    <SelectItem value='PendingManagerSignature'>PendingManagerSignature</SelectItem>
                    <SelectItem value='PendingCustomerSignature'>PendingCustomerSignature</SelectItem>
                    <SelectItem value='ChangeRequested'>ChangeRequested</SelectItem>
                    <SelectItem value='Expired'>Expired</SelectItem>
                    <SelectItem value='Active'>Active</SelectItem>
                    <SelectItem value='Rejected'>Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className='block text-xs font-medium text-gray-600 mb-1'>Comments from Staff</label>
                <Textarea value={draft.comments || 'N/A'} readOnly className='bg-white border-gray-300 min-h-[100px]' />
              </div>
            </div>

            <div className='space-y-4'>
              {rental && (
                <>
                  <div>
                    <label className='block text-xs font-medium text-gray-600 mb-1'>Event Name</label>
                    <Input value={rental.eventName} readOnly className='bg-white border-gray-300' />
                  </div>
                  <div>
                    <label className='block text-xs font-medium text-gray-600 mb-1'>Event Date</label>
                    <Input value={new Date(rental.eventDate).toLocaleDateString('vi-VN')} readOnly className='bg-white border-gray-300' />
                  </div>
                  <div>
                    <label className='block text-xs font-medium text-gray-600 mb-1'>Event Description</label>
                    <Textarea value={rental.description} readOnly className='bg-white border-gray-300 min-h-[100px]' />
                  </div>
                </>
              )}
            </div>

            <div className='flex items-center justify-center'>
              <img 
                src='https://i0.wp.com/www.blackdiamondnet.com/wp-content/uploads/2024/03/job-contract-photo-scaled.jpeg?fit=2560%2C1685&quality=89&ssl=1'
                alt='Contract Document'
                className='rounded-lg w-full max-w-md h-64 object-cover border border-gray-300'
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className='rounded-lg shadow-sm border border-gray-200'>
        <CardHeader className='pb-3 border-b border-gray-200'>
          <div className='flex justify-between items-center'>
            <CardTitle className='text-2xl font-semibold text-gray-900 text-left'>Draft Clauses</CardTitle>
            <Button variant='outline' className='flex items-center gap-1' onClick={() => setIsViewModalVisible(true)}>
              <Eye size={16} />
              View Full Contract
            </Button>
          </div>
        </CardHeader>
        <CardContent className='p-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {clauses.map((clause) => {
              return (
                <Card key={clause.id}
                  className='p-4 border border-gray-200 hover:shadow-md transition-shadow h-48 flex flex-col overflow-hidden space-y-2'
                >
                  <h4 className='font-semibold text-gray-900 text-sm leading-tight'>
                    {decodeHtml(clause.title)}
                  </h4>

                  <div className='flex-1 overflow-hidden'>
                    <div
                      className='prose max-w-none prose-sm text-xs text-gray-600 overflow-hidden'
                      style={{
                        display: '-webkit-box',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: 6,
                      }}
                      dangerouslySetInnerHTML={{ __html: clause.body }}
                    />
                  </div>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <ViewContractDraft
        open={isViewModalVisible}
        onClose={() => setIsViewModalVisible(false)}
        draft={draft}
      />
    </div>
  )
}

export default StaffDetailContractDraft