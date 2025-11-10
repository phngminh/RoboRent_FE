// src/components/chat/ChatMessage.tsx
import { formatDistanceToNow } from 'date-fns'
import type { ChatMessageResponse } from '../../types/chat.types'
import { MessageType } from '../../types/chat.types'

interface ChatMessageProps {
  message: ChatMessageResponse
  isOwnMessage: boolean
}

export default function ChatMessage({ message, isOwnMessage }: ChatMessageProps) {
  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch {
      return new Date(dateString).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }
  }

  // System notifications (centered)
  if (message.messageType === MessageType.SystemNotification ||
      message.messageType === MessageType.PriceQuoteNotification ||
      message.messageType === MessageType.ContractNotification) {
    return (
      <div className="flex justify-center my-4">
        <div className="bg-gray-100 text-gray-600 text-sm px-4 py-2 rounded-full max-w-md text-center">
          {message.content}
        </div>
      </div>
    )
  }

  // Regular text messages
  if (message.messageType === MessageType.Text) {
    return (
      <div className={`flex items-start gap-3 mb-4 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isOwnMessage ? 'bg-orange-500' : 'bg-blue-500'
        }`}>
          <span className="text-white text-sm font-medium">
            {message.senderName.charAt(0).toUpperCase()}
          </span>
        </div>

        {/* Message bubble */}
        <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} max-w-[70%]`}>
          <div className={`px-4 py-2 rounded-2xl ${
            isOwnMessage 
              ? 'bg-orange-500 text-white rounded-tr-sm' 
              : 'bg-gray-100 text-gray-900 rounded-tl-sm'
          }`}>
            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
          </div>
          <span className="text-xs text-gray-500 mt-1">
            {formatTime(message.createdAt)}
          </span>
        </div>
      </div>
    )
  }

  // Demo messages handled by DemoCard component (will be separate)
  return null
}