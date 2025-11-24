import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from '../../../components/ui/dialog'
import { Button } from '../../../components/ui/button'
import { type TemplateClauseResponse, deleteClause } from '../../../apis/contractTemplates.api'
import { toast } from 'react-toastify'

interface DeleteTemplateClauseProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  clause?: TemplateClauseResponse | null
}

const DeleteTemplateClause: React.FC<DeleteTemplateClauseProps> = ({ open, onClose, onSuccess, clause }) => {
  const decodeHtml = (html: string) => {
    const txt = document.createElement('textarea')
    txt.innerHTML = html
    return txt.value
  }

  const handleSubmit = async () => {
    if (!clause) return
    try {
      await deleteClause(clause.id)
      toast.success(`Clause '${clause.title}' deleted successfully!`)
      onSuccess()
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete clause!')
    }
  }

  return (
    <Dialog 
      open={open} 
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose()
      }}
    >
      <DialogContent className='sm:max-w-[500px] p-6'>
        <DialogHeader>
          <DialogTitle className='text-xl font-semibold text-gray-900 mt-5'>
            Are you sure you want to remove clause <span className='text-blue-600'>"{decodeHtml(clause?.title || '')}"</span> from "{decodeHtml(clause?.contractTemplateTitle || '')}"?
          </DialogTitle>
        </DialogHeader>
        <div className='pb-1 -mt-2'>
          <p className='text-base text-gray-600'>
            This action <span className='font-semibold'>cannot be undone</span>.
          </p>
        </div>
        <DialogFooter className='flex justify-end gap-3'>
          <Button 
            type='button' 
            variant='outline' 
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button 
            type='button' 
            onClick={handleSubmit} 
            className='bg-red-600 hover:bg-red-700 text-white'
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteTemplateClause