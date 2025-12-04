import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '../../../components/ui/dialog'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { cn } from '../../../lib/utils'
import { createClause, getAllTemplates } from '../../../apis/contractTemplates.api'
import { toast } from 'react-toastify'
import FormInput from '../../../components/formInput'

interface CreateTemplateClauseProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

interface FormData {
  contractTemplateId: number
  titleOrCode: string
  body: string
  isMandatory: boolean
  isEditable: boolean
}

interface TemplateOption {
  id: number
  title: string
}

const CreateTemplateClause: React.FC<CreateTemplateClauseProps> = ({ open, onClose, onSuccess }) => {
  const [templates, setTemplates] = useState<TemplateOption[]>([])
  const [formData, setFormData] = useState<FormData>({
    contractTemplateId: 0,
    titleOrCode: '',
    body: '',
    isMandatory: false,
    isEditable: false,
  })
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})

  const fetchTemplates = async () => {
    try {
      const templatesData = await getAllTemplates()
      const filteredTemplates = templatesData.filter(t =>t.status === 'Updated' || t.status === 'Initiated')
      setTemplates(filteredTemplates)
      if (templates.length > 0 && formData.contractTemplateId === 0) {
        setFormData(prev => ({ ...prev, contractTemplateId: templates[0].id }))
      }
    } catch (err) {
      console.error('Failed to load templates', err)
      setTemplates([])
    }
  }

  useEffect(() => {
    fetchTemplates()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (Object.keys(errors).length > 0) {
      setErrors({})
    }
  }

  const handleTemplateChange = (value: string) => {
    const id = parseInt(value)
    setFormData((prev) => ({ ...prev, contractTemplateId: id }))
    if (errors.contractTemplateId) {
      setErrors((prev) => {
        const { contractTemplateId, ...rest } = prev
        return rest
      })
    }
  }

  const handleMandatoryChange = (value: string) => {
    const isMandatory = value === 'Mandatory'
    setFormData((prev) => ({ ...prev, isMandatory }))
  }

  const handleEditableChange = (value: string) => {
    const isEditable = value === 'Editable'
    setFormData((prev) => ({ ...prev, isEditable }))
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}

    if (formData.contractTemplateId === 0) {
      newErrors.contractTemplateId = 'Template is required!'
    }
    
    if (!formData.titleOrCode.trim()) {
      newErrors.titleOrCode = 'Title or Code is required!'
    }

    if (!formData.body || formData.body.trim() === '' || formData.body === '<p><br></p>') {
      newErrors.body = 'Body is required!'
    }

    if (formData.titleOrCode.trim().length > 100) {
      newErrors.titleOrCode = 'Title or Code must not exceed 100 characters!'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return
    try {
      console.log('Submitting form data:', formData)
      await createClause(formData)
      toast.success('Clause created successfully!')

      resetForm()
      onSuccess()
    } catch (err : any) {
      console.error(err)
      const errorMessage = err.response?.data?.message || err.message || 'An unexpected error occurred.'
      toast.error(errorMessage)
    }
  }

  const resetForm = () => {
    setFormData({
      contractTemplateId: 0,
      titleOrCode: '',
      body: '',
      isMandatory: false,
      isEditable: false,
    })
    setErrors({})
  }

  const ErrorMessage = ({ message }: { message: string }) => (
    <p className='text-sm text-destructive mt-1'>{message}</p>
  )

  const handleQuillChange = (value: string) => {
    setFormData((prev) => ({ ...prev, body: value }))
    if (errors.body) {
      setErrors((prev) => {
        const { body, ...rest } = prev
        return rest
      })
    }
  }

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
      <DialogContent className='sm:max-w-[680px] flex flex-col max-h-[90vh] p-8'>
        <DialogHeader>
          <DialogTitle>Create New Clause</DialogTitle>
        </DialogHeader>
        <DialogDescription></DialogDescription>
        <div className='flex-1 overflow-y-auto overflow-x-visible pr-1 pl-1 -mt-4'>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='contractTemplateId'>Template</Label>
              <Select 
                value={formData.contractTemplateId ? formData.contractTemplateId.toString() : ''}
                onValueChange={handleTemplateChange}
              >
                <SelectTrigger id='contractTemplateId' className='w-full'>
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
                        {template.title}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.contractTemplateId && <ErrorMessage message={errors.contractTemplateId} />}
            </div>
            <div className='space-y-2'>
              <Label htmlFor='titleOrCode'>Title or Code</Label>
              <Input
                id='titleOrCode'
                name='titleOrCode'
                value={formData.titleOrCode}
                onChange={handleInputChange}
                placeholder='Enter title or code'
                className={cn(errors.titleOrCode && 'border-destructive')}
              />
              {errors.titleOrCode && <ErrorMessage message={errors.titleOrCode} />}
            </div>
            <div className='space-y-2'>
              <Label htmlFor='body'>Body</Label>
              <div
                className={cn(errors.body && 'border-destructive p-1')}
                style={{
                  minHeight: '150px',
                  height: 'auto',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <FormInput
                  value={formData.body}
                  onChange={handleQuillChange}
                />
              </div>
              {errors.body && <ErrorMessage message={errors.body} />}
            </div>
            <div className='space-y-2'>
              <Label htmlFor='isMandatory'>Mandatory?</Label>
              <Select value={formData.isMandatory ? 'Mandatory' : 'Optional'} onValueChange={handleMandatoryChange}>
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Select Mandatory Status' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='Mandatory'>Mandatory</SelectItem>
                  <SelectItem value='Optional'>Optional</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='isEditable'>Editable?</Label>
              <Select value={formData.isEditable ? 'Editable' : 'Non-Editable'} onValueChange={handleEditableChange}>
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Select Editable Status' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='Editable'>Editable</SelectItem>
                  <SelectItem value='Non-Editable'>Non-Editable</SelectItem>
                </SelectContent>
              </Select>
            </div>
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

export default CreateTemplateClause