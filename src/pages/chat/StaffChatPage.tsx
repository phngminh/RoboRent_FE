// src/pages/chat/StaffChatPage.tsx
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Send, Paperclip, Calendar, MapPin, Package } from 'lucide-react'
import Header from '../../components/header'

export default function StaffChatPage() {
  const { rentalId } = useParams<{ rentalId: string }>()
  const [inputMessage, setInputMessage] = useState('')

  // Mock rental data for now
  const rentalDetails = {
    customerName: 'Sarah Johnson',
    packageName: 'Registration Assistant Package',
    eventDate: 'June 15-16, 2025',
    eventTime: '9:00 AM - 5:00 PM',
    eventAddress: 'Tech Convention Center, 123 Innovation Blvd, San Francisco, CA',
    robotsRequested: 4
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-16 h-screen flex">
        {/* Left Sidebar - Customer List (Empty for now) */}
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

          {/* Messages Area (Empty) */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400">Messages will appear here</p>
            </div>
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
                placeholder="Type a message..."
                disabled
                className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
              />
              <button
                disabled
                className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Rental Details */}
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