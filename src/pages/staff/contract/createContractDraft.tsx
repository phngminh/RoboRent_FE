import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '../../../components/ui/dialog'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Textarea } from '../../../components/ui/textarea'
import { Label } from '../../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { cn } from '../../../lib/utils'
import { getAllTemplates, getTemplateById, type ContractTemplateResponse } from '../../../apis/contractTemplates.api'
import { getReceivedRentalByStaffIdAsync } from '../../../apis/rental.staff.api'
import { toast } from 'react-toastify'
import { useAuth } from '../../../contexts/AuthContext'
import { createDraft } from '../../../apis/contractDraft.api'
import type { RentalRequestResponse } from '../../../apis/rentalRequest.api'
import { getAllManagers, type AccountResponse } from '../../../apis/account.api'

interface CreateContractDraftProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

interface FormData {
  title: string
  comments: string
  rentalId: number | null
  contractTemplatesId: number | null
  managerId: number | null
}

const CreateContractDraft: React.FC<CreateContractDraftProps> = ({ open, onClose, onSuccess }) => {
  const { user } = useAuth()
  const [rentals, setRentals] = useState<RentalRequestResponse[]>([])
  const [templates, setTemplates] = useState<ContractTemplateResponse[]>([])
  const [managers, setManagers] = useState<AccountResponse[]>([])
  const [chosenTemplate, setChosenTemplate] = useState<ContractTemplateResponse | null>(null)
  const [chosenRental, setChosenRental] = useState<RentalRequestResponse | null>(null)
  const [formData, setFormData] = useState<FormData>({
    title: '',
    comments: '',
    rentalId: null,
    contractTemplatesId: null,
    managerId: null,
  })
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (Object.keys(errors).length > 0) {
      setErrors({})
    }
  }

  const handleRentalChange = (value: string) => {
    const rentalId = value ? parseInt(value) : null
    setFormData((prev) => ({ ...prev, rentalId }))
    if (errors.rentalId) {
      setErrors((prev) => {
        const { rentalId, ...rest } = prev
        return rest
      })
    }
    setChosenRental(null)

    if (rentalId) {
      const selectedRental = rentals.find((r) => r.id === rentalId)
      if (selectedRental) {
        setChosenRental(selectedRental)
      }
    }
  }

  const handleManagerChange = (value: string) => {
    const managerId = value ? parseInt(value) : null
    setFormData((prev) => ({ ...prev, managerId }))
    if (errors.managerId) {
      setErrors((prev) => {
        const { managerId, ...rest } = prev
        return rest
      })
    }
  }

  const handleTemplateChange = async (value: string) => {
    const templateId = value ? parseInt(value) : null
    setFormData((prev) => ({ ...prev, contractTemplatesId: templateId }))
    if (errors.contractTemplatesId) {
      setErrors((prev) => {
        const { contractTemplatesId, ...rest } = prev
        return rest
      })
    }
    setChosenTemplate(null)

    if (templateId) {
      try {
        const fullTemplate = await getTemplateById(templateId)
        console.log('Loaded template:', fullTemplate)
        setChosenTemplate(fullTemplate.data.data)
      } catch (err) {
        console.error('Failed to load template body', err)
        toast.error('Failed to load template preview!')
        setChosenTemplate(null)
      }
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required!'
    }

    if (formData.title.trim().length > 100) {
      newErrors.title = 'Title must not exceed 100 characters!'
    }

    if (formData.comments.length > 200) {
      newErrors.comments = 'Comments must not exceed 200 characters!'
    }

    if (!formData.rentalId) {
      newErrors.rentalId = 'Rental is required!'
    }

    if (!formData.managerId) {
      newErrors.managerId = 'Manager is required!'
    }

    if (!formData.contractTemplatesId) {
      newErrors.contractTemplatesId = 'Template is required!'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return
    try {
      const payload = {
        title: formData.title,
        comments: formData.comments,
        contractTemplatesId: formData.contractTemplatesId!,
        rentalId: formData.rentalId!,
        managerId: formData.managerId!,
      }
      await createDraft(payload)
      toast.success('Contract draft created successfully!')

      resetForm()
      onSuccess()
    } catch (err) {
      console.error(err)
      toast.error('Failed to create contract draft!')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      comments: '',
      rentalId: null,
      contractTemplatesId: null,
      managerId: null,
    })
    setErrors({})
    setChosenTemplate(null)
    setChosenRental(null)
  }

  const ErrorMessage = ({ message }: { message: string }) => (
    <p className='text-sm text-destructive mt-1'>{message}</p>
  )

  const fetchData = async () => {
    if (user?.accountId) {
      try {
        const rentalsData = await getReceivedRentalByStaffIdAsync(user.accountId)
        const filteredRentals = rentalsData.data.filter((rental: RentalRequestResponse) => rental.status === 'AcceptedPriceQuote' || rental.status === 'Rejected')
        setRentals(filteredRentals)
        const templatesData = await getAllTemplates()
        const filteredTemplates = templatesData.filter(t =>t.status === 'Updated' || t.status === 'Initiated')
        setTemplates(filteredTemplates)
        const managersData = await getAllManagers()
        const filteredManagers = managersData.filter(t =>t.status === 'Active')
        setManagers(filteredManagers)
      } catch (err) {
        console.error(err)
        toast.error('Failed to fetch rentals, templates, or managers!')
      }
    } else {
      setRentals([])
      setTemplates([])
      setManagers([])
    }
  }

  useEffect(() => {
    fetchData()
  }, [open, user?.accountId])

  return (
    <Dialog 
      open={open} 
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          resetForm()
          onClose()
        }
      }}
    >
      <DialogContent className='sm:max-w-[780px] flex flex-col max-h-[90vh] p-8'>
        <DialogHeader>
          <DialogTitle>Create Contract Draft</DialogTitle>
        </DialogHeader>
        <DialogDescription></DialogDescription>
        <div className='flex-1 overflow-y-auto overflow-x-visible pr-1 pl-1 -mt-8'>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='title'>Title</Label>
              <Input
                id='title'
                name='title'
                value={formData.title}
                onChange={handleInputChange}
                placeholder='Enter title'
                className={cn(errors.title && 'border-destructive')}
              />
              {errors.title && <ErrorMessage message={errors.title} />}
            </div>
            <div className='space-y-2'>
              <Label htmlFor='comments'>Comments</Label>
              <Textarea
                id='comments'
                name='comments'
                value={formData.comments}
                onChange={handleInputChange}
                placeholder='Enter comments (optional)'
                className={cn(errors.comments && 'border-destructive')}
              />
              {errors.comments && <ErrorMessage message={errors.comments} />}
            </div>
            <div className='space-y-2'>
              <Label htmlFor='rentalId'>Rental</Label>
              <Select onValueChange={handleRentalChange} value={formData.rentalId?.toString() || ''}>
                <SelectTrigger className={cn(errors.rentalId && 'border-destructive')}>
                  <SelectValue placeholder='Select a rental' />
                </SelectTrigger>
                <SelectContent>
                  {rentals.length === 0 ? (
                    <SelectItem value='no-rentals' disabled>
                      There's no available rental
                    </SelectItem>
                  ) : (
                    rentals.map((rental) => (
                      <SelectItem key={rental.id} value={rental.id.toString()}>
                        {rental.eventName}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.rentalId && <ErrorMessage message={errors.rentalId} />}
            </div>

            {chosenRental && (
              <div className='space-y-2'>
                <Label className='font-semibold text-gray-900'>Rental Details</Label>
                <div className='space-y-1 bg-gray-50 p-4 rounded-md border'>
                  <p><span className='font-medium'>Event name:</span> {chosenRental.eventName}</p>
                  <p><span className='font-medium'>Description:</span> {chosenRental.description}</p>
                  <p><span className='font-medium'>Event Activity:</span> {chosenRental.eventActivityName}</p>
                  <p><span className='font-medium'>Event Date:</span> {new Date(chosenRental.eventDate).toLocaleDateString()}</p>
                  <p><span className='font-medium'>Time:</span> {chosenRental.startTime} - {chosenRental.endTime}</p>
                </div>
              </div>
            )}

            <div className='space-y-2'>
              <Label htmlFor='managerId'>Manager</Label>
              <Select onValueChange={handleManagerChange} value={formData.managerId?.toString() || ''}>
                <SelectTrigger className={cn(errors.managerId && 'border-destructive')}>
                  <SelectValue placeholder='Select a manager' />
                </SelectTrigger>
                <SelectContent>
                  {managers.length === 0 ? (
                    <SelectItem value='no-managers' disabled>
                      There's no available manager
                    </SelectItem>
                  ) : (
                    managers.map((manager) => (
                      <SelectItem key={manager.accountId} value={manager.accountId.toString()}>
                        {manager.fullName} ({manager.email})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.managerId && <ErrorMessage message={errors.managerId} />}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='contractTemplatesId'>Template</Label>
              <Select onValueChange={handleTemplateChange} value={formData.contractTemplatesId?.toString() || ''}>
                <SelectTrigger className={cn(errors.contractTemplatesId && 'border-destructive')}>
                  <SelectValue placeholder='Select a template' />
                </SelectTrigger>
                <SelectContent>
                  {templates.length === 0 ? (
                    <SelectItem value='no-templates' disabled>
                      There's no available template
                    </SelectItem>
                  ) : (
                    templates.map((template) => (
                      <SelectItem key={template.id} value={template.id.toString()}>
                        {`${template.templateCode} - ${template.title}`}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.contractTemplatesId && <ErrorMessage message={errors.contractTemplatesId} />}
            </div>

            {chosenTemplate && (
              <div className='space-y-4'>
                <Label className='font-semibold text-gray-900'>Full Contract Preview</Label>
                <div className='space-y-6 bg-gray-50 p-4 rounded-md border'>
                  <div
                    className='prose max-w-none prose-sm'
                    dangerouslySetInnerHTML={{ __html: chosenTemplate.bodyJson }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button 
            type='button' 
            variant='outline' 
            onClick={() => {
              resetForm()
              onClose()
            }}
          >
            Cancel
          </Button>
          <Button type='button' onClick={handleSubmit}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CreateContractDraft