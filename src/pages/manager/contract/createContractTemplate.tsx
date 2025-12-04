import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '../../../components/ui/dialog'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Textarea } from '../../../components/ui/textarea'
import { cn } from '../../../lib/utils'
import { createTemplateWithBody, createTemplate } from '../../../apis/contractTemplates.api'
import { toast } from 'react-toastify'
import { useAuth } from '../../../contexts/AuthContext'
import FormInput from '../../../components/formInput'

interface CreateContractTemplateProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

interface FormData {
  templateCode: string
  title: string
  description: string
  version: string
  body: string
}

const CreateContractTemplate: React.FC<CreateContractTemplateProps> = ({ open, onClose, onSuccess }) => {
  const { user } = useAuth()
  const [withBody, setWithBody] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    templateCode: '',
    title: '',
    description: '',
    version: '',
    body: '',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (Object.keys(errors).length > 0) {
      setErrors({})
    }
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

    if (!withBody && (!formData.body || formData.body.trim() === '' || formData.body === '<p><br></p>')) {
      newErrors.body = 'Body is required!'
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
    if (!validateForm()) return
    try {
      if (withBody) {
        const payload = {
          templateCode: formData.templateCode,
          title: formData.title,
          description: formData.description,
          version: formData.version,
        }
        await createTemplateWithBody(payload)
      } else {
        const payload = {
          templateCode: formData.templateCode,
          title: formData.title,
          description: formData.description,
          bodyJson: formData.body,
          status: 'Initiated',
          version: formData.version,
          createdBy: user?.accountId,
        }
        await createTemplate(payload)
      }
      toast.success('Template created successfully!')

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
      templateCode: '',
      title: '',
      description: '',
      version: '',
      body: '',
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
          <DialogTitle></DialogTitle>
          <div className='flex rounded-md border bg-background p-1 py-2'>
            <Button
              type='button'
              variant={withBody ? 'ghost' : 'default'}
              className={cn('w-full justify-start rounded-l-md px-3', withBody && 'text-muted-foreground')}
              onClick={() => setWithBody(false)}
            >
              Create New Template
            </Button>
            <Button
              type='button'
              variant={!withBody ? 'ghost' : 'default'}
              className={cn('w-full justify-start rounded-r-md px-3', !withBody && 'text-muted-foreground')}
              onClick={() => setWithBody(true)}
            >
              Create New Template With Body
            </Button>
          </div>
        </DialogHeader>
        <DialogDescription></DialogDescription>
        <div className='flex-1 overflow-y-auto overflow-x-visible pr-1 pl-1 -mt-8'>
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
            {!withBody && (
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
            )}
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
          <Button type='button' onClick={handleSubmit}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CreateContractTemplate