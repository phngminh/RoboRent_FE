import React from 'react'
import { AlertTriangle, X } from 'lucide-react'

interface ConflictConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  message: string
  assignableCount: number
  totalCount: number
}

const ConflictConfirmDialog: React.FC<ConflictConfirmDialogProps> = ({
  open,
  onClose,
  onConfirm,
  message,
  assignableCount,
  totalCount
}) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-slate-400" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Travel Time Conflict</h3>
            <p className="text-sm text-slate-500">Staff cannot complete all schedules</p>
          </div>
        </div>

        {/* Content */}
        <div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <p className="text-sm text-amber-800 mb-2">{message}</p>
          <p className="text-xs text-amber-600 font-medium">
            Only {assignableCount} of {totalCount} schedules can be assigned to this staff due to travel time constraints.
          </p>
        </div>

        {/* Info box */}
        <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-700">
            <strong>Note:</strong> The system will only assign the earliest {assignableCount} schedule(s) that the staff can realistically complete.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
          >
            Assign {assignableCount} Schedule{assignableCount > 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConflictConfirmDialog
