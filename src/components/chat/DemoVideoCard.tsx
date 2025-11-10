// src/components/chat/DemoVideoCard.tsx
import { useState } from 'react'
import { Play, Check, X } from 'lucide-react'
import type { ChatMessageResponse } from '../../types/chat.types'
import { DemoStatus } from '../../types/chat.types'
import { updateMessageStatus } from '../../apis/chat.api'
import { toast } from 'react-toastify'

interface DemoVideoCardProps {
  message: ChatMessageResponse
  isCustomer: boolean
  onStatusUpdate?: (messageId: number, status: string) => void
}

export default function DemoVideoCard({ message, isCustomer, onStatusUpdate }: DemoVideoCardProps) {
  const [currentStatus, setCurrentStatus] = useState(message.status)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusUpdate = async (status: typeof DemoStatus.Accepted | typeof DemoStatus.Rejected) => {
    setIsUpdating(true)
    try {
      await updateMessageStatus(message.id, { status })
      setCurrentStatus(status)
      toast.success(`Demo ${status === DemoStatus.Accepted ? 'accepted' : 'rejected'}`)
      onStatusUpdate?.(message.id, status)
    } catch (error) {
      console.error('Failed to update demo status:', error)
      toast.error('Failed to update demo status')
    } finally {
      setIsUpdating(false)
    }
  }

  const videoUrl = message.videoUrls?.[0]
  const isPending = currentStatus === DemoStatus.Pending
  const isAccepted = currentStatus === DemoStatus.Accepted
  const isRejected = currentStatus === DemoStatus.Rejected

  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-md">
        {/* Video thumbnail */}
        <div className="relative bg-gray-900 rounded-2xl overflow-hidden">
          {videoUrl ? (
            <video 
              src={videoUrl} 
              className="w-full h-64 object-cover"
              controls
              poster={videoUrl.replace('.mp4', '-thumb.jpg')}
            />
          ) : (
            <div className="w-full h-64 flex items-center justify-center bg-gray-800">
              <Play className="w-16 h-16 text-white opacity-50" />
            </div>
          )}
        </div>

        {/* Demo info */}
        <div className="bg-white rounded-2xl p-4 mt-2 shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-1">
            {message.content || 'Registration Assistant Robot Demo'}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            This demo shows how our robots can handle event check-ins, provide information, and assist attendees.
          </p>

          {/* Status / Action buttons */}
          {isCustomer && isPending && (
            <div className="flex gap-2">
              <button
                onClick={() => handleStatusUpdate(DemoStatus.Accepted)}
                disabled={isUpdating}
                className="flex-1 flex items-center justify-center gap-2 bg-green-50 text-green-700 border border-green-200 px-4 py-2 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
              >
                <Check size={18} />
                Accept Demo
              </button>
              <button
                onClick={() => handleStatusUpdate(DemoStatus.Rejected)}
                disabled={isUpdating}
                className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-700 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
              >
                <X size={18} />
                Reject & Give Feedback
              </button>
            </div>
          )}

          {isAccepted && (
            <div className="text-center text-sm text-green-600 font-medium">
              ✓ Demo accepted
            </div>
          )}

          {isRejected && (
            <div className="text-center text-sm text-red-600 font-medium">
              ✗ Demo rejected
            </div>
          )}

          {!isCustomer && (
            <div className="text-center text-sm text-gray-500">
              Status: <span className="font-medium">{currentStatus || 'Pending'}</span>
            </div>
          )}
        </div>

        {/* Timestamp */}
        <div className="text-xs text-gray-500 mt-2 text-center">
          Demo phase in progress • {new Date(message.createdAt).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </div>
  )
}