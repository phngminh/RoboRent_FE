import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '../../../components/ui/dialog'
import { Button } from '../../../components/ui/button'
import { type ContractTemplateResponse } from '../../../apis/contractTemplates.api'
import { toast } from 'react-toastify'
import { disableTemplate, activateTemplate } from '../../../apis/contractTemplates.api'

interface DeleteContractTemplateProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  template?: ContractTemplateResponse | null
}

const DeleteContractTemplate: React.FC<DeleteContractTemplateProps> = ({ open, onClose, onSuccess, template }) => {
  if (!template) return null

  const isDisabled = template.status === 'Disabled'
  const action = isDisabled ? 'activate' : 'disable'
  const buttonClass = isDisabled ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
  const successMessage = `Template '${template.title}' ${action}d successfully!`

  const handleSubmit = async () => {
    try {
      if (isDisabled) {
        await activateTemplate(template.id)
      } else {
        await disableTemplate(template.id)
      }
      toast.success(successMessage)
      onSuccess()
    } catch (err : any) {
      console.error(err)
      const errorMessage = err.response?.data?.message || err.message || 'An unexpected error occurred.'
      toast.error(errorMessage)
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
          <DialogTitle className='text-xl font-semibold text-gray-900 mt-5 flex items-center space-x-2'>
            <span>Are you sure you want to {action} the contract template <span>"{template.title}"</span>?</span>
          </DialogTitle>
        </DialogHeader>
        <DialogDescription></DialogDescription>
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
            className={buttonClass + ' text-white'}
          >
            {isDisabled ? 'Activate' : 'Disable'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteContractTemplate