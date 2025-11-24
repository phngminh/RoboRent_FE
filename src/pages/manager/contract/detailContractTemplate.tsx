import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from '../../../components/ui/dialog'
import { Button } from '../../../components/ui/button'
import type { ContractTemplateResponse } from '../../../apis/contractTemplates.api'

interface DetailContractTemplateProps {
  open: boolean
  onClose: () => void
  template?: ContractTemplateResponse | null
}

const DetailContractTemplate: React.FC<DetailContractTemplateProps> = ({ open, onClose, template }) => {
  if (!template) {
    return null
  }

  return (
    <Dialog 
      open={open} 
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onClose()
        }
      }}
    >
      <DialogContent className='sm:max-w-[780px] flex flex-col max-h-[90vh] p-8'>
        <DialogHeader>
          <DialogTitle className='text-center text-2xl'>{template.title}</DialogTitle>
        </DialogHeader>
        <div className='flex-1 overflow-y-auto overflow-x-visible pr-3 pl-3 space-y-6'>
          <div className='space-y-2'>
            <div
              className='prose max-w-none prose-sm'
              dangerouslySetInnerHTML={{ __html: template.bodyJson }}
            />
          </div>
        </div>
        <DialogFooter>
          <div className='flex-1 text-xs text-muted-foreground'>
            <p>Created on {new Date(template.createdAt).toLocaleDateString()} by {template.createdByName}</p>
            {template.updatedAt && (
              <p>Last updated on {new Date(template.updatedAt).toLocaleDateString()} by {template.updatedByName}</p>
            )}
          </div>
          <Button 
            type='button' 
            variant='outline' 
            onClick={() => onClose()}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DetailContractTemplate