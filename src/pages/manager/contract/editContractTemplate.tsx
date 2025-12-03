import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '../../../components/ui/dialog'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Textarea } from '../../../components/ui/textarea'
import { cn } from '../../../lib/utils'
import { editTemplate, type ContractTemplateResponse } from '../../../apis/contractTemplates.api'
import { toast } from 'react-toastify'
import { useAuth } from '../../../contexts/AuthContext'

interface EditContractTemplateProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  template: ContractTemplateResponse | null
}

interface FormData {
  templateCode: string
  title: string
  description: string
  version: string
}

const EditContractTemplate: React.FC<EditContractTemplateProps> = ({ open, onClose, onSuccess, template }) => {
  const { user } = useAuth()
  const [formData, setFormData] = useState<FormData>({
    templateCode: '',
    title: '',
    description: '',
    version: '',
  })
  const [originalFormData, setOriginalFormData] = useState<FormData>({
    templateCode: '',
    title: '',
    description: '',
    version: '',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})

  useEffect(() => {
    if (open && template) {
      const newFormData: FormData = {
        templateCode: template.templateCode || '',
        title: template.title || '',
        description: template.description || '',
        version: template.version || '',
      }
      setFormData(newFormData)
      setOriginalFormData(newFormData)
      setErrors({})
    }
  }, [open, template])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (Object.keys(errors).length > 0) {
      setErrors({})
    }
  }

  const hasChanges = () => {
    return JSON.stringify(formData) !== JSON.stringify(originalFormData)
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}

    if (!formData.templateCode.trim()) {
      newErrors.templateCode = 'Template code is required!'
    }
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required!'
    }

    if (!formData.version.trim()) {
      newErrors.version = 'Version is required!'
    }

    if (formData.templateCode.trim().length > 100) {
      newErrors.templateCode = 'Template code must not exceed 100 characters!'
    }

    if (formData.title.trim().length > 100) {
      newErrors.title = 'Title must not exceed 100 characters!'
    }

    if (formData.description.trim().length > 200) {
      newErrors.description = 'Description must not exceed 200 characters!'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm() || !hasChanges() || !template) return
    try {
      const payload = {
        id: template.id,
        templateCode: formData.templateCode,
        title: formData.title,
        description: formData.description,
        version: formData.version,
        status: template.status,
        bodyJson: template.bodyJson,
        updatedBy: user.accountId,
      }
      console.log('Submitting payload:', payload)
      await editTemplate(template.id, payload)
      toast.success('Template updated successfully!')

      setOriginalFormData(formData)
      onSuccess()
    } catch (err : any) {
      console.error(err)
      const errorMessage = err.response?.data?.message || err.message || 'An unexpected error occurred.'
      toast.error(errorMessage)
    }
  }

  const resetForm = () => {
    setFormData({
      templateCode: '',
      title: '',
      description: '',
      version: '',
    })
    setOriginalFormData({
      templateCode: '',
      title: '',
      description: '',
      version: '',
    })
    setErrors({})
  }

  const ErrorMessage = ({ message }: { message: string }) => (
    <p className='text-sm text-destructive mt-1'>{message}</p>
  )

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
          <DialogTitle>Edit Contract Template</DialogTitle>
        </DialogHeader>
        <DialogDescription></DialogDescription>
        <div className='flex-1 overflow-y-auto overflow-x-visible pr-1 pl-1'>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='templateCode'>Template Code</Label>
              <Input
                id='templateCode'
                name='templateCode'
                value={formData.templateCode}
                onChange={handleInputChange}
                placeholder='Enter template code'
                className={cn(errors.templateCode && 'border-destructive')}
              />
              {errors.templateCode && <ErrorMessage message={errors.templateCode} />}
            </div>
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
              <Label htmlFor='description'>Description</Label>
              <Textarea
                id='description'
                name='description'
                value={formData.description}
                onChange={handleInputChange}
                placeholder='Enter description'
                className={cn(errors.description && 'border-destructive')}
              />
              {errors.description && <ErrorMessage message={errors.description} />}
            </div>
            <div className='space-y-2'>
              <Label htmlFor='version'>Version</Label>
              <Input
                id='version'
                name='version'
                value={formData.version}
                onChange={handleInputChange}
                placeholder='Enter version'
                className={cn(errors.version && 'border-destructive')}
              />
              {errors.version && <ErrorMessage message={errors.version} />}
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
          <Button 
            type='button' 
            onClick={handleSubmit}
            disabled={!hasChanges()}
          >
            Update
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default EditContractTemplate