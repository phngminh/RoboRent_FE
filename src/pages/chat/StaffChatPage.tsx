// src/pages/chat/StaffChatPage.tsx
import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Send, Paperclip, DollarSign, FileText, Calendar, MapPin, Package, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { signalRService } from '../../utils/signalr'
import {
  getChatMessages,
  sendMessage,
  getMyChatRooms,
  markRentalAsRead
} from '../../apis/chat.api'
import { getQuotesByRentalId } from '../../apis/priceQuote.api'
import type {
  ChatMessageResponse,
  RentalQuotesResponse,
} from '../../types/chat.types'
import { MessageType, QuoteStatus, DemoStatus } from '../../types/chat.types'
import ChatMessage from '../../components/chat/ChatMessage'
import DemoVideoCard from '../../components/chat/DemoVideoCard'
import DemoUploadButton from '../../components/chat/DemoUploadButton'
import CreateQuoteModal from '../../components/chat/CreateQuoteModal'
import UpdateQuoteModal from '../../components/chat/UpdateQuoteModal'
import Header from '../../components/header'
import { toast } from 'react-toastify'
import { formatDistanceToNow } from 'date-fns'
import { getRentalByIdAsync } from '../../apis/rental.staff.api'

// Interface for customer chat list
interface CustomerChat {
  id: number
  rentalId: number
  customerName: string
  packageName: string
  eventDate: string
  status: string
  lastMessage: string
  timestamp: string
  unread: number
}

interface StaffChatPageProps {
  onViewContract: () => void
}

const StaffChatPage: React.FC<StaffChatPageProps> = ({ onViewContract }) => {
  const { rentalId } = useParams<{ rentalId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [messages, setMessages] = useState<ChatMessageResponse[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [quotesData, setQuotesData] = useState<RentalQuotesResponse | null>(null)
  const [showCreateQuoteModal, setShowCreateQuoteModal] = useState(false)
  const [showUpdateQuoteModal, setShowUpdateQuoteModal] = useState(false)
  const [selectedQuoteId, setSelectedQuoteId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [customerChats, setCustomerChats] = useState<CustomerChat[]>([])
  const [isLoadingChats, setIsLoadingChats] = useState(false)
  const [rentalStatus, setRentalStatus] = useState<string>('')
  const [rentalInfo, setRentalInfo] = useState<any | null>(null)

  // ✅ Sidebar states with LocalStorage persistence
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('staffChat_leftSidebarOpen')
    return saved !== null ? JSON.parse(saved) : true
  })

  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('staffChat_rightSidebarOpen')
    return saved !== null ? JSON.parse(saved) : true
  })

  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem('staffChat_sidebarWidth')
    return saved !== null ? parseInt(saved) : 320
  })

  useEffect(() => {
    const loadRentalInfo = async () => {
      if (!rentalId) return
      try {
        const data = await getRentalByIdAsync(parseInt(rentalId))
        setRentalInfo(data)
      } catch (error) {
        console.error("Failed to load rental info:", error)
      }
    }

    loadRentalInfo()
  }, [rentalId])

  // ✅ Persist sidebar states to localStorage
  useEffect(() => {
    localStorage.setItem('staffChat_leftSidebarOpen', JSON.stringify(isSidebarOpen))
  }, [isSidebarOpen])

  useEffect(() => {
    localStorage.setItem('staffChat_rightSidebarOpen', JSON.stringify(isRightSidebarOpen))
  }, [isRightSidebarOpen])

  useEffect(() => {
    localStorage.setItem('staffChat_sidebarWidth', sidebarWidth.toString())
  }, [sidebarWidth])

  // ✅ Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '[') {
          e.preventDefault()
          setIsSidebarOpen((prev: boolean) => !prev)
          toast.info(isSidebarOpen ? 'Left sidebar hidden' : 'Left sidebar shown', {
            position: 'bottom-left',
            autoClose: 1000
          })
        }
        if (e.key === ']') {
          e.preventDefault()
          setIsRightSidebarOpen((prev: boolean) => !prev)
          toast.info(isRightSidebarOpen ? 'Right sidebar hidden' : 'Right sidebar shown', {
            position: 'bottom-right',
            autoClose: 1000
          })
        }
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isSidebarOpen, isRightSidebarOpen])

  // Add resize handler
  const handleMouseDown = (e: React.MouseEvent) => {
    const startX = e.clientX
    const startWidth = sidebarWidth

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = startWidth + (e.clientX - startX)
      if (newWidth >= 200 && newWidth <= 500) {
        setSidebarWidth(newWidth)
      }
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  // ✅ Button disabled logic (not hidden!)
  const hasPendingDemo = messages.some(
    msg => msg.messageType === MessageType.Demo && msg.status === DemoStatus.Pending
  )

  const hasDemoAccepted = messages.some(
    msg => msg.messageType === MessageType.Demo && msg.status === DemoStatus.Accepted
  )

  // Send Demo button
  const isSendDemoDisabled =
    !(rentalStatus === 'Scheduled' || rentalStatus === 'DeniedDemo')
    || hasPendingDemo
  const sendDemoDisabledReason =
    !(rentalStatus === 'Scheduled' || rentalStatus === 'DeniedDemo')
      ? 'Rental status must be "Scheduled" or "DeniedDemo"'
      : 'A demo is already pending customer review'


  // Create Quote button
  const isCreateQuoteDisabled = !hasDemoAccepted || quotesData?.canCreateMore === false
  const createQuoteDisabledReason =
    !hasDemoAccepted
      ? 'Customer must accept a demo first'
      : 'Maximum 3 quotes reached'

  // Send Contract button
  const hasApprovedQuote = quotesData?.quotes.some(q => q.status === QuoteStatus.Approved)
  const isSendContractDisabled = !hasApprovedQuote
  const sendContractDisabledReason = 'Customer must approve a quote first'

  // Filter chats based on search
  const filteredChats = customerChats.filter(chat =>
    chat.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.rentalId.toString().includes(searchQuery) ||
    chat.packageName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Load customer chats from API
  useEffect(() => {
    const loadChats = async () => {
      if (!user?.accountId) return

      setIsLoadingChats(true)
      try {
        const response = await getMyChatRooms(1, 50)

        console.log("=== DEBUG: getMyChatRooms RESPONSE ===")
        console.log(JSON.stringify(response, null, 2))

        const mappedChats: CustomerChat[] = response.rooms.map(room => ({
          id: room.id,
          rentalId: room.rentalId,
          customerName: room.customerName || 'Unknown Customer',
          packageName: room.packageName || 'Unknown Package',
          eventDate: room.eventDate || 'TBD',
          status: room.status || 'Unknown',
          lastMessage: room.lastMessage || 'No messages',
          timestamp: room.lastMessageTime
            ? formatDistanceToNow(new Date(room.lastMessageTime), { addSuffix: true })
            : 'No messages',
          unread: room.unreadCount
        }))
        setCustomerChats(mappedChats)

        // Set rental status
        const selectedRentalId = parseInt(rentalId || '0')

        console.log("=== DEBUG: Selected rentalId ===", selectedRentalId)

        const currentChat = response.rooms.find(r => r.rentalId === selectedRentalId)

        console.log("=== DEBUG: currentChat FOUND ===")
        console.log(currentChat)

        console.log("=== DEBUG: currentChat.rentalStatus ===")
        console.log(currentChat?.rentalStatus)

        if (currentChat?.rentalStatus) {
          setRentalStatus(currentChat.rentalStatus)
        }

      } catch (error) {
        console.error('Failed to load chats:', error)
        toast.error('Failed to load chat list')
      } finally {
        setIsLoadingChats(false)
      }
    }

    loadChats()
  }, [user?.id, rentalId])


  // Load messages and mark as read
  useEffect(() => {
    if (!rentalId) return

    const loadMessages = async () => {
      try {
        const response = await getChatMessages(parseInt(rentalId), 1, 50)
        setMessages(response.messages)

        // Mark messages as read after loading
        try {
          await markRentalAsRead(parseInt(rentalId))

          // Immediately update the unread count in sidebar to 0
          setCustomerChats(prev => prev.map(chat =>
            chat.rentalId === parseInt(rentalId)
              ? { ...chat, unread: 0 }
              : chat
          ))
        } catch (error) {
          console.error('Failed to mark messages as read:', error)
          // Don't show error to user, this is not critical
        }
      } catch (error) {
        console.error('Failed to load messages:', error)
        toast.error('Failed to load chat messages')
      }
    }

    loadMessages()
  }, [rentalId])

  // Fetch quotes function
  const fetchQuotes = async (rid: number) => {
    try {
      const quotes = await getQuotesByRentalId(rid)
      setQuotesData(quotes)
    } catch (error) {
      console.error('Failed to load quotes:', error)
    }
  }

  // Load quotes
  useEffect(() => {
    if (!rentalId) return
    fetchQuotes(parseInt(rentalId))
  }, [rentalId])

  // SignalR setup
  useEffect(() => {
    if (!rentalId) return

    let isSubscribed = true

    const setupSignalR = async () => {
      try {
        await signalRService.connect()
        await signalRService.joinRentalChat(parseInt(rentalId))

        const handleReceiveMessage = (message: ChatMessageResponse) => {
          if (!isSubscribed) return
          setMessages(prev => {
            if (prev.some(m => m.id === message.id)) return prev
            return [...prev, message]
          })
          scrollToBottom()
        }

        const handleDemoStatusChanged = (messageId: number, status: string) => {
          if (!isSubscribed) return
          setMessages(prev => prev.map(msg =>
            msg.id === messageId ? { ...msg, status: status as DemoStatus } : msg
          ))
        }

        const handleQuoteStatusChanged = async (data: {
          QuoteId: number
          Status: string
          QuoteNumber: number
          Total: number
        }) => {
          if (!isSubscribed) return
          console.log('📢 Quote status changed:', data)
          if (rentalId) {
            await fetchQuotes(parseInt(rentalId))
          }
        }

        signalRService.onReceiveMessage(handleReceiveMessage)
        signalRService.onDemoStatusChanged(handleDemoStatusChanged)
        signalRService.onQuoteStatusChanged(handleQuoteStatusChanged)

      } catch (error) {
        console.error('SignalR setup failed:', error)
      }
    }

    setupSignalR()

    return () => {
      isSubscribed = false
      if (rentalId) {
        signalRService.leaveRentalChat(parseInt(rentalId))
        signalRService.offReceiveMessage()
        signalRService.offDemoStatusChanged()
        signalRService.offQuoteStatusChanged()
      }
    }
  }, [rentalId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Send message
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !rentalId || isSending) return

    setIsSending(true)
    const messageContent = inputMessage.trim()

    try {
      await sendMessage({
        rentalId: parseInt(rentalId),
        messageType: MessageType.Text,
        content: messageContent
      })
      setInputMessage('')
    } catch (error: any) {
      console.error('Failed to send message:', error)
      toast.error(error.response?.data?.error || 'Failed to send message')
    } finally {
      setIsSending(false)
    }
  }

  // Handle demo video upload success
  const handleDemoUploadSuccess = async (videoData: { url: string; publicId: string }) => {
    if (!rentalId) return

    try {
      await sendMessage({
        rentalId: parseInt(rentalId),
        messageType: MessageType.Demo,
        content: 'Registration Assistant Robot Demo',
        videoUrls: [videoData.url]
      })
      toast.success('Demo sent successfully!')
    } catch (error) {
      console.error('Failed to send demo:', error)
      toast.error('Failed to send demo')
    }
  }

  const handleChatClick = (rentalIdToNavigate: number) => {
    navigate(`/staff/chat/${rentalIdToNavigate}`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Demo Phase':
        return 'text-blue-600'
      case 'Quote Review':
        return 'text-yellow-600'
      case 'Confirmed':
        return 'text-green-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="pt-16 h-screen flex">
        {/* Left Sidebar - Customer List */}
        <div
          style={{ width: isSidebarOpen ? `${sidebarWidth}px` : '0px' }}
          className="border-r border-gray-200 bg-white flex flex-col relative overflow-hidden transition-all duration-300 ease-in-out"
        >
          {/* Resize handle */}
          {isSidebarOpen && (
            <div
              onMouseDown={handleMouseDown}
              className="absolute right-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-blue-500 transition-colors z-10"
            />
          )}

          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Active Chats</h2>
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoadingChats ? (
              <div className="p-8 text-center">
                <p className="text-gray-500 text-sm">Loading chats...</p>
              </div>
            ) : filteredChats.length > 0 ? (
              filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => handleChatClick(chat.rentalId)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${chat.rentalId.toString() === rentalId ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                        {chat.customerName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">
                          {chat.customerName}
                        </p>
                        <p className="text-xs text-gray-500">#{chat.rentalId} • {chat.packageName}</p>
                      </div>
                    </div>
                    {chat.unread > 0 && (
                      <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {chat.unread}
                      </span>
                    )}
                  </div>
                  <div className="ml-12 space-y-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      <p className="text-xs text-gray-600">{chat.eventDate}</p>
                    </div>
                    <p className={`text-xs font-medium ${getStatusColor(chat.status)}`}>
                      {chat.status}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600 truncate ml-12 mt-2">
                    {chat.lastMessage}
                  </p>
                  <p className="text-xs text-gray-400 mt-1 ml-12">{chat.timestamp}</p>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <p className="text-gray-500 text-sm">No chats found</p>
              </div>
            )}
          </div>
        </div>

        {/* Center - Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Chat Header */}
          <div className="border-b border-gray-200 p-4 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title={isSidebarOpen ? "Hide sidebar (Cmd/Ctrl + [)" : "Show sidebar (Cmd/Ctrl + [)"}
                >
                  {isSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                </button>

                {/* Safe avatar */}
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                  {rentalInfo?.customerName?.charAt(0) || "?"}
                </div>

                <div>
                  {/* Customer Name */}
                  <h1 className="text-lg font-bold text-gray-900">
                    {rentalInfo?.customerName || "Loading..."}
                  </h1>

                  {/* Rental ID + Package */}
                  <p className="text-sm text-gray-500">
                    #{rentalId} • {rentalInfo?.eventName || "Loading..."} •{" "}
                    <span className="text-green-600">Online</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title={isRightSidebarOpen ? "Hide details (Cmd/Ctrl + ])" : "Show details (Cmd/Ctrl + ])"}
              >
                {isRightSidebarOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div key={message.id}>
                {message.messageType === MessageType.Demo ? (
                  <DemoVideoCard
                    message={message}
                    isCustomer={false}
                  />
                ) : (
                  <ChatMessage
                    message={message}
                    isOwnMessage={
                      message.senderRole === 'Staff' || message.senderId === user?.id
                    }
                  />
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Action Buttons - ✅ All visible, disabled when not available */}
          <div className="border-t border-gray-100 px-6 py-3 bg-gray-50">
            <div className="flex gap-2">
              {/* Send Demo Button */}
              <DemoUploadButton
                onUploadSuccess={handleDemoUploadSuccess}
                rentalId={parseInt(rentalId || '0')}
                disabled={isSendDemoDisabled}
                disabledReason={sendDemoDisabledReason}
              />

              {/* Create Quote Button */}
              <div className="relative group">
                <button
                  onClick={() => !isCreateQuoteDisabled && setShowCreateQuoteModal(true)}
                  disabled={isCreateQuoteDisabled}
                  className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors text-sm ${isCreateQuoteDisabled
                    ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white border-gray-300 hover:bg-gray-50 text-gray-900'
                    }`}
                >
                  <DollarSign size={16} className={isCreateQuoteDisabled ? 'text-gray-400' : 'text-green-600'} />
                  Create Quote
                </button>

                {/* Tooltip */}
                {isCreateQuoteDisabled && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    {createQuoteDisabledReason}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                )}
              </div>

              {/* Send Contract Button */}
              <div className="relative group">
                <button
                  disabled={isSendContractDisabled}
                  onClick={onViewContract}
                  className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors text-sm ${isSendContractDisabled
                    ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white border-gray-300 hover:bg-gray-50 text-gray-900'
                    }`}
                >
                  <FileText size={16} className={isSendContractDisabled ? 'text-gray-400' : 'text-purple-600'} />
                  Send Contract
                </button>

                {/* Tooltip */}
                {isSendContractDisabled && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    {sendContractDisabledReason}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                )}
              </div>
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
        </div>

        {/* Right Sidebar - Rental Details */}
        <div
          style={{ width: isRightSidebarOpen ? '384px' : '0px' }}
          className="border-l border-gray-200 bg-gray-50 overflow-hidden transition-all duration-300 ease-in-out"
        >
          <div className="w-96 overflow-y-auto h-full">
            {/* Rental Info */}
            <div className="p-6 bg-white border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Rental Information</h2>

              {!rentalInfo ? (
                <p className="text-gray-500 text-sm">Loading...</p>
              ) : (
                <div className="space-y-4">

                  {/* DATE + TIME */}
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(rentalInfo.eventDate).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </p>

                      <p className="text-xs text-gray-600">
                        {rentalInfo.startTime?.substring(0, 5)} – {rentalInfo.endTime?.substring(0, 5)}
                      </p>
                    </div>
                  </div>

                  {/* LOCATION */}
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-900">{rentalInfo.address}</p>
                      <p className="text-xs text-gray-600">{rentalInfo.city}</p>
                    </div>
                  </div>

                  {/* PACKAGE */}
                  <div className="flex items-start gap-3">
                    <Package className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{rentalInfo.eventActivityName}</p>
                      <p className="text-xs text-gray-600">{rentalInfo.activityTypeName}</p>
                    </div>
                  </div>

                  {/* CUSTOMER NAME */}
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 mt-0.5 flex-shrink-0 text-blue-600 font-bold">👤</div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{rentalInfo.customerName}</p>
                      <p className="text-xs text-gray-600">{rentalInfo.phoneNumber}</p>
                      <p className="text-xs text-gray-600">{rentalInfo.email}</p>
                    </div>
                  </div>

                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                {/* Send Demo Button */}
                <DemoUploadButton
                  onUploadSuccess={handleDemoUploadSuccess}
                  rentalId={parseInt(rentalId || '0')}
                  disabled={isSendDemoDisabled}
                  disabledReason={sendDemoDisabledReason}
                />

                {/* Create Quote Button */}
                <div className="relative group">
                  <button
                    onClick={() => !isCreateQuoteDisabled && setShowCreateQuoteModal(true)}
                    disabled={isCreateQuoteDisabled}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors font-medium ${isCreateQuoteDisabled
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                  >
                    <DollarSign size={18} />
                    Create Quote
                  </button>

                  {/* Tooltip */}
                  {isCreateQuoteDisabled && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                      {createQuoteDisabledReason}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  )}
                </div>

                {/* Send Contract Button */}
                <div className="relative group">
                  <button
                    disabled={isSendContractDisabled}
                    onClick={onViewContract}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors font-medium ${isSendContractDisabled
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                      }`}
                  >
                    <FileText size={18} />
                    Send Contract
                  </button>

                  {/* Tooltip */}
                  {isSendContractDisabled && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                      {sendContractDisabledReason}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quote History */}
            <div className="p-6 bg-white border-t border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">Quote History</h3>
                <span className="text-xs text-gray-500">
                  {3 - (quotesData?.totalQuotes || 0)} quote{(3 - (quotesData?.totalQuotes || 0)) !== 1 ? 's' : ''} remaining
                </span>
              </div>

              <div className="space-y-2">
                {quotesData?.quotes.map((quote) => (
                  <div
                    key={quote.id}
                    className="p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Quote #{quote.quoteNumber}
                        </p>
                        <p className="text-xs text-gray-600">${quote.total.toLocaleString()}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${quote.status === QuoteStatus.PendingManager ? 'bg-yellow-100 text-yellow-700' :
                        quote.status === QuoteStatus.PendingCustomer ? 'bg-blue-100 text-blue-700' :
                          quote.status === QuoteStatus.Approved ? 'bg-green-100 text-green-700' :
                            quote.status === QuoteStatus.RejectedManager ? 'bg-orange-100 text-orange-700' :
                              quote.status === QuoteStatus.RejectedCustomer ? 'bg-red-100 text-red-700' :
                                quote.status === QuoteStatus.Expired ? 'bg-gray-100 text-gray-700' :
                                  'bg-gray-100 text-gray-700'
                        }`}>
                        {quote.status}
                      </span>
                    </div>

                    {/* Update Button for Rejected Quotes */}
                    {quote.status === QuoteStatus.RejectedManager && (
                      <button
                        onClick={() => {
                          setSelectedQuoteId(quote.id)
                          setShowUpdateQuoteModal(true)
                        }}
                        className="mt-2 w-full text-xs px-3 py-1.5 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
                      >
                        Update Quote
                      </button>
                    )}
                  </div>
                ))}

                {(!quotesData || quotesData.totalQuotes === 0) && (
                  <p className="text-sm text-gray-500 text-center py-4">No quotes created yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Quote Modal */}
      {rentalId && (
        <CreateQuoteModal
          isOpen={showCreateQuoteModal}
          rentalId={parseInt(rentalId)}
          currentQuoteCount={quotesData?.totalQuotes || 0}
          onClose={() => setShowCreateQuoteModal(false)}
          onSuccess={() => {
            fetchQuotes(parseInt(rentalId))
          }}
        />
      )}

      {/* Update Quote Modal */}
      {selectedQuoteId && (
        <UpdateQuoteModal
          quoteId={selectedQuoteId}
          isOpen={showUpdateQuoteModal}
          onClose={() => {
            setShowUpdateQuoteModal(false)
            setSelectedQuoteId(null)
          }}
          onSuccess={() => {
            if (rentalId) {
              fetchQuotes(parseInt(rentalId))
            }
          }}
        />
      )}
    </div>
  )
}

export default StaffChatPage 