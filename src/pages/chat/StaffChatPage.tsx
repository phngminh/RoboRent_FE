// src/pages/chat/StaffChatPage.tsx
import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { Send, Paperclip, Calendar, MapPin, Package } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { getChatMessages, sendMessage } from '../../apis/chat.api'
import { MessageType } from '../../types/chat.types'
import type { ChatMessageResponse } from '../../types/chat.types'
import ChatMessage from '../../components/chat/ChatMessage'
import Header from '../../components/header'
import { toast } from 'react-toastify'

export default function StaffChatPage() {
  const { rentalId } = useParams<{ rentalId: string }>()
  const { user } = useAuth()
  const [messages, setMessages] = useState<ChatMessageResponse[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isSending, setIsSending] = useState(false)

  // Mock rental data
  const rentalDetails = {
    customerName: 'Sarah Johnson',
    packageName: 'Registration Assistant Package',
    eventDate: 'June 15-16, 2025',
    eventTime: '9:00 AM - 5:00 PM',
    eventAddress: 'Tech Convention Center, 123 Innovation Blvd, San Francisco, CA',
    robotsRequested: 4
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  
  const handleSendMessage = async () => {
  if (!inputMessage.trim() || !rentalId || isSending) return

  setIsSending(true)
  const messageContent = inputMessage.trim()
  
  try {
    const newMessage = await sendMessage({
      rentalId: parseInt(rentalId),
      messageType: MessageType.Text,
      content: messageContent
    })
    
    // Add to messages list
    setMessages(prev => [...prev, newMessage])
    setInputMessage('')
    toast.success('Message sent!')
  } catch (error: any) {
    console.error('Failed to send message:', error)
    toast.error(error.response?.data?.error || 'Failed to send message')
  } finally {
    setIsSending(false)
  }

  // Load messages
  useEffect(() => {
    if (!rentalId) return

    const loadMessages = async () => {
      setIsLoading(true)
      try {
        const response = await getChatMessages(parseInt(rentalId), 1, 50)
        setMessages(response.messages)
      } catch (error) {
        console.error('Failed to load messages:', error)
        toast.error('Failed to load chat messages')
      } finally {
        setIsLoading(false)
      }
    }

    loadMessages()
  }, [rentalId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-16 h-screen flex">
        {/* Left Sidebar */}
        <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Active Chats</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="p-8 text-center">
              <p className="text-gray-500 text-sm">Customer chats will appear here</p>
            </div>
          </div>
        </div>

        {/* Center - Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Chat Header */}
          <div className="border-b border-gray-200 p-4 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                {rentalDetails.customerName.charAt(0)}
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  {rentalDetails.customerName}
                </h1>
                <p className="text-sm text-gray-500">
                  #{rentalId} • {rentalDetails.packageName}
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-2" />
                  <p className="text-gray-500">Loading messages...</p>
                </div>
              </div>
            ) : messages.length > 0 ? (
              <>
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    isOwnMessage={message.senderRole === 'Staff' || message.senderId === user?.id}
                  />
                ))}
                <div ref={messagesEndRef} />
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-400">No messages yet. Start the conversation!</p>
              </div>
            )}
          </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex gap-2">
            <button className="p-3 hover:bg-gray-100 rounded-full transition-colors">
            <Paperclip size={20} className="text-gray-600" />
            </button>
            <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isSending}
            className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
            <Send size={20} />
            </button>
        </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-96 border-l border-gray-200 bg-gray-50 overflow-y-auto">
          <div className="p-6 bg-white border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Rental Information</h2>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{rentalDetails.eventDate}</p>
                  <p className="text-xs text-gray-600">{rentalDetails.eventTime}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-900">{rentalDetails.eventAddress}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Package className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{rentalDetails.packageName}</p>
                  <p className="text-xs text-gray-600">
                    {rentalDetails.robotsRequested} Robots Requested
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}