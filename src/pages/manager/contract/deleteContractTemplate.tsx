import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from '../../../components/ui/dialog'
import { Button } from '../../../components/ui/button'
import { type ContractTemplateResponse } from '../../../apis/contractTemplates.api'
import { toast } from 'react-toastify'
import { deleteTemplate } from '../../../apis/contractTemplates.api'

interface DeleteContractTemplateProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  template?: ContractTemplateResponse | null
}

const DeleteContractTemplate: React.FC<DeleteContractTemplateProps> = ({ open, onClose, onSuccess, template }) => {
  const handleSubmit = async () => {
    if (!template) return
    try {
      await deleteTemplate(template.id)
      toast.success(`Template '${template.title}' deleted successfully!`)
      onSuccess()
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete template!')
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
            Are you sure you want to delete the contract template <span>"{template?.title}"</span>?
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

export default DeleteContractTemplate