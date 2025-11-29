import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '../../../components/ui/dialog'
import { Button } from '../../../components/ui/button'
import type { ContractDraftResponse } from '../../../apis/contractDraft.api'

interface ViewContractDraftProps {
  open: boolean
  onClose: () => void
  draft?: ContractDraftResponse | null
}

const ViewContractDraft: React.FC<ViewContractDraftProps> = ({ open, onClose, draft }) => {
  if (!draft) {
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
          <DialogTitle className='text-center text-2xl'>{draft.title}</DialogTitle>
        </DialogHeader>
        <DialogDescription></DialogDescription>
        <div className='flex-1 overflow-y-auto overflow-x-visible pr-3 pl-3 space-y-6'>
          <div className='space-y-2'>
            <div
              className='prose max-w-none prose-sm'
              dangerouslySetInnerHTML={{ __html: draft.bodyJson }}
            />
          </div>
        </div>
        <DialogFooter>
          <div className='flex-1 text-xs text-muted-foreground'>
            <p>Created on {new Date(draft.createdAt).toLocaleDateString()} by {draft.staffName}</p>
            {draft.updatedAt && (
              <p>Last updated on {new Date(draft.updatedAt).toLocaleDateString()}</p>
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

export default ViewContractDraft