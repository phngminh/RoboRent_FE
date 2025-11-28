import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '../../../components/ui/dialog'
import { Button } from '../../../components/ui/button'
import type { TemplateClauseResponse } from '../../../apis/contractTemplates.api'

interface DetailTemplateClauseProps {
  open: boolean
  onClose: () => void
  clause?: TemplateClauseResponse | null
}

const DetailTemplateClause: React.FC<DetailTemplateClauseProps> = ({ open, onClose, clause }) => {
  if (!clause) {
    return null
  }

  const decodeHtml = (html: string) => {
    const txt = document.createElement('textarea')
    txt.innerHTML = html
    return txt.value
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
          <DialogTitle className='text-center text-2xl'>{decodeHtml(clause.title)}</DialogTitle>
        </DialogHeader>
        <DialogDescription></DialogDescription>
        <div className='flex-1 overflow-y-auto overflow-x-visible pr-3 pl-3 space-y-6'>
          <div className='space-y-2'>
            <div
              className='prose max-w-none prose-sm'
              dangerouslySetInnerHTML={{ __html: clause.body }}
            />
          </div>
        </div>
        <DialogFooter className='-mt-2'>
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

export default DetailTemplateClause