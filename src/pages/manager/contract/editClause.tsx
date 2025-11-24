import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from '../../../components/ui/dialog'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Textarea } from '../../../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { cn } from '../../../lib/utils'
import { editClause, type TemplateClauseResponse } from '../../../apis/contractTemplates.api'
import { toast } from 'react-toastify'

interface EditTemplateClauseProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  clause: TemplateClauseResponse | null
}

interface FormData {
  titleOrCode: string
  body: string
  isMandatory: boolean
  isEditable: boolean
}

const EditTemplateClause: React.FC<EditTemplateClauseProps> = ({ open, onClose, onSuccess, clause }) => {
  const [formData, setFormData] = useState<FormData>({
    titleOrCode: '',
    body: '',
    isMandatory: false,
    isEditable: false,
  })
  const [originalFormData, setOriginalFormData] = useState<FormData>({
    titleOrCode: '',
    body: '',
    isMandatory: false,
    isEditable: false,
  })
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})

  useEffect(() => {
    if (open && clause) {
      const newFormData: FormData = {
        titleOrCode: clause.title,
        body: clause.body,
        isMandatory: clause.isMandatory,
        isEditable: clause.isEditable,
      }
      setFormData(newFormData)
      setOriginalFormData(newFormData)
      setErrors({})
    }
  }, [open, clause])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (Object.keys(errors).length > 0) {
      setErrors({})
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

  const hasChanges = () => {
    return JSON.stringify(formData) !== JSON.stringify(originalFormData)
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}

    if (!formData.titleOrCode.trim()) {
      newErrors.titleOrCode = 'Title or Code is required!'
    }

    if (!formData.body.trim()) {
      newErrors.body = 'Body is required!'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm() || !hasChanges() || !clause) return
    try {
      const payload = {
        clauseCode: clause.id,
        title: formData.titleOrCode,
        body: formData.body,
        isMandatory: formData.isMandatory,
        isEditable: formData.isEditable,
      }
      await editClause(clause.id, payload)
      toast.success('Clause updated successfully!')

      setOriginalFormData(formData)
      onSuccess()
    } catch (err) {
      console.error(err)
      toast.error('Failed to update clause!')
    }
  }

  const resetForm = () => {
    setFormData({
      titleOrCode: '',
      body: '',
      isMandatory: false,
      isEditable: false,
    })
    setOriginalFormData({
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
      <DialogContent className='sm:max-w-[580px] flex flex-col max-h-[90vh] p-8'>
        <DialogHeader>
          <DialogTitle>Edit Clause</DialogTitle>
        </DialogHeader>
        <div className='flex-1 overflow-y-auto overflow-x-visible pr-1 pl-1'>
          <div className='space-y-4 py-4'>
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
              <Textarea
                id='body'
                name='body'
                value={formData.body}
                onChange={handleInputChange}
                placeholder='Enter body'
                className={cn(errors.body && 'border-destructive')}
              />
              {errors.body && <ErrorMessage message={errors.body} />}
            </div>
            <div className='space-y-2'>
              <Label htmlFor='isMandatory'>Mandatory</Label>
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
              <Label htmlFor='isEditable'>Editable</Label>
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

export default EditTemplateClause