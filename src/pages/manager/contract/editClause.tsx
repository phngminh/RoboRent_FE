import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '../../../components/ui/dialog'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { cn } from '../../../lib/utils'
import { editClause, type TemplateClauseResponse } from '../../../apis/contractTemplates.api'
import { toast } from 'react-toastify'
import FormInput from '../../../components/formInput'

interface EditTemplateClauseProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  clause: TemplateClauseResponse
}

interface FormData {
  clauseCode: string
  title: string
  body: string
  isMandatory: boolean
  isEditable: boolean
}

const EditTemplateClause: React.FC<EditTemplateClauseProps> = ({ open, onClose, onSuccess, clause }) => {
  const [isEditorReady, setIsEditorReady] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    clauseCode: '',
    title: '',
    body: '',
    isMandatory: false,
    isEditable: false,
  })
  const [originalFormData, setOriginalFormData] = useState<FormData>({
    clauseCode: '',
    title: '',
    body: '',
    isMandatory: false,
    isEditable: false,
  })
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})

  const decodeHtml = (html: string) => {
    const txt = document.createElement('textarea')
    txt.innerHTML = html
    return txt.value
  }

  useEffect(() => {
    if (open && clause) {
      const newFormData: FormData = {
        clauseCode: decodeHtml(clause.clauseCode),
        title: decodeHtml(clause.title),
        body: clause.body,
        isMandatory: clause.isMandatory,
        isEditable: clause.isEditable,
      }
      setFormData(newFormData)
      setOriginalFormData(newFormData)
      setErrors({})
      setIsEditorReady(true)
    } else {
      setIsEditorReady(false)
      resetForm()
    }
  }, [open, clause])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    if (!formData.clauseCode.trim()) {
      newErrors.clauseCode = 'Clause code is required!'
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required!'
    }

    if (!formData.body || formData.body.trim() === '' || formData.body === '<p><br></p>') {
      newErrors.body = 'Body is required!'
    }

    if (formData.clauseCode.trim().length > 100) {
      newErrors.clauseCode = 'Clause code must not exceed 100 characters!'
    }

    if (formData.title.trim().length > 100) {
      newErrors.title = 'Title must not exceed 100 characters!'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm() || !hasChanges() || !clause) return
    try {
      const payload = {
        clauseCode: formData.clauseCode,
        title: formData.title,
        body: formData.body,
        isMandatory: formData.isMandatory,
        isEditable: formData.isEditable,
      }
      await editClause(clause.id, payload)
      toast.success('Clause updated successfully!')

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
      clauseCode: '',
      title: '',
      body: '',
      isMandatory: false,
      isEditable: false,
    })
    setOriginalFormData({
      clauseCode: '',
      title: '',
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

  if (!clause) return null

  return (
    <Dialog 
      open={open} 
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onClose()
        }
      }}
    >
      <DialogContent className='sm:max-w-[680px] flex flex-col max-h-[90vh] p-8'>
        <DialogHeader>
          <DialogTitle>Edit Clause</DialogTitle>
        </DialogHeader>
        <DialogDescription></DialogDescription>
        <div className='flex-1 overflow-y-auto overflow-x-visible pr-1 pl-1 -mt-4'>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='clauseCode'>Clause Code</Label>
              <Input
                id='clauseCode'
                name='clauseCode'
                value={formData.clauseCode}
                onChange={handleInputChange}
                placeholder='Enter clause code'
                className={cn(errors.clauseCode && 'border-destructive')}
              />
              {errors.clauseCode && <ErrorMessage message={errors.clauseCode} />}
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
                <div
                  className={cn(errors.body && 'border-destructive p-1')}
                  style={{
                    minHeight: '150px',
                    height: 'auto',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  {isEditorReady ? (
                    <FormInput
                      editorKey={clause.id}
                      value={formData.body}
                      onChange={handleQuillChange}
                    />
                  ) : (
                    <div className='flex items-center justify-center h-[150px] border border-gray-300 rounded-md text-gray-500'>
                      Initializing editor...
                    </div>
                  )}
                </div>
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