// src/pages/chat/CustomerChatPage.tsx
import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Send, Calendar, MapPin, Package, CheckCircle2, Search, ChevronLeft, ChevronRight, LogOut } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { signalRService } from '../../utils/signalr'
import { getChatMessages, sendMessage, getCustomerChatRooms } from '../../apis/chat.api'
import { getQuotesByRentalId, customerAction, getPriceQuoteById } from '../../apis/priceQuote.api'
import type { ChatMessageResponse, RentalDetailsPlaceholder, RentalQuotesResponse, PriceQuoteResponse } from '../../types/chat.types'
import { MessageType, DemoStatus, QuoteStatus } from '../../types/chat.types'
import ChatMessage from '../../components/chat/ChatMessage'
import DemoVideoCard from '../../components/chat/DemoVideoCard'
import QuoteCard from '../../components/chat/QuoteCard'
import CustomerQuoteDetailModal from '../../components/chat/CustomerQuoteDetailModal'
import { toast } from 'react-toastify'
import { formatDistanceToNow } from 'date-fns'
import { Link } from 'react-router-dom'
import logo from '../../assets/logo1.png'

// Interface cho rental trong sidebar
interface CustomerRental {
  id: number
  rentalId: number
  packageName: string
  eventDate: string
  status: string
  lastMessage: string
  timestamp: string
  unread: number
}

export default function CustomerChatPage() {
  const { rentalId } = useParams<{ rentalId: string }>()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [messages, setMessages] = useState<ChatMessageResponse[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [quotesData, setQuotesData] = useState<RentalQuotesResponse | null>(null)
  const [fullQuotes, setFullQuotes] = useState<PriceQuoteResponse[]>([])
  const [selectedQuote, setSelectedQuote] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [customerRentals, setCustomerRentals] = useState<CustomerRental[]>([])
  const [isLoadingRentals, setIsLoadingRentals] = useState(false)
  const [rentalStatus, setRentalStatus] = useState<string>('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [sidebarWidth, setSidebarWidth] = useState(320)
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true)
  const [lastViewedQuoteTime, setLastViewedQuoteTime] = useState<Date | null>(null)

  const hasPendingDemo = messages.some(
    msg => msg.messageType === MessageType.Demo && msg.status === DemoStatus.Pending
  )

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

  // Filter rentals based on search
  const filteredRentals = customerRentals.filter(rental => 
    rental.packageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rental.rentalId.toString().includes(searchQuery) ||
    rental.eventDate.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Placeholder rental data
  const [rentalDetails] = useState<RentalDetailsPlaceholder>({
    id: parseInt(rentalId || '0'),
    eventDate: 'June 15-16, 2025',
    eventTime: '9:00 AM - 5:00 PM',
    eventAddress: 'Tech Convention Center, 123 Innovation Blvd, San Francisco, CA',
    packageName: 'Registration Assistant Package',
    robotsRequested: 4,
    customizationNotes: 'Company branding on display screens, welcome message in 3 languages, integration with event app for badge scanning',
    companyName: 'TechConf Inc.',
    customerName: user?.name || 'Customer',
    phoneNumber: '(555) 123-4567',
    email: user?.email || 'customer@example.com'
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Load messages
  useEffect(() => {
    if (!rentalId) return

    const loadMessages = async () => {
      try {
        const response = await getChatMessages(parseInt(rentalId), 1, 50)
        setMessages(response.messages)
      } catch (error) {
        console.error('Failed to load messages:', error)
        toast.error('Failed to load chat messages')
      }
    }

    loadMessages()
  }, [rentalId])

  // Load quotes
  const loadQuotes = async () => {
    if (!rentalId) return
    try {
      const quotes = await getQuotesByRentalId(parseInt(rentalId))
      setQuotesData(quotes)
      
      const fullQuoteDetails = await Promise.all(
        quotes.quotes
          .filter(q => q.status !== QuoteStatus.PendingManager)
          .map(q => getPriceQuoteById(q.id))
      )
      setFullQuotes(fullQuoteDetails)
    } catch (error) {
      console.error('Failed to load quotes:', error)
    }
  }

  const handleLogout = () => {
    logout()
  }

  useEffect(() => {
    loadQuotes()
  }, [rentalId])

  // Track when user views quotes - with localStorage persistence
  useEffect(() => {
    if (fullQuotes.length > 0 && !lastViewedQuoteTime) {
      const savedTime = localStorage.getItem(`lastViewedQuotes_${rentalId}`)
      if (savedTime) {
        setLastViewedQuoteTime(new Date(savedTime))
      } else {
        const now = new Date()
        setLastViewedQuoteTime(now)
        localStorage.setItem(`lastViewedQuotes_${rentalId}`, now.toISOString())
      }
    }
  }, [fullQuotes.length, rentalId])

  // Load rentals from API
  useEffect(() => {
    const loadRentals = async () => {
      if (!user?.id) return
      
      setIsLoadingRentals(true)
      try {
        const response = await getCustomerChatRooms(user.id, 1, 50)
        const mappedRentals: CustomerRental[] = response.rooms.map(room => ({
          id: room.id,
          rentalId: room.rentalId,
          packageName: room.packageName || 'Unknown Package',
          eventDate: room.eventDate || 'TBD',
          status: room.status || 'Unknown',
          lastMessage: room.lastMessage || 'No messages',
          timestamp: room.lastMessageTime 
            ? formatDistanceToNow(new Date(room.lastMessageTime), { addSuffix: true })
            : 'No messages',
          unread: room.unreadCount
        }))
        setCustomerRentals(mappedRentals)
        
        const currentRental = response.rooms.find(r => r.rentalId === parseInt(rentalId || '0'))
        if (currentRental?.rentalStatus) {
          setRentalStatus(currentRental.rentalStatus)
        }
      } catch (error) {
        console.error('Failed to load rentals:', error)
        toast.error('Failed to load chat list')
      } finally {
        setIsLoadingRentals(false)
      }
    }

    loadRentals()
  }, [user?.id, rentalId])

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
            if (prev.some(m => m.id === message.id)) {
              console.warn('⚠️ Duplicate message ignored:', message.id)
              return prev
            }
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

        const handleQuoteAccepted = async (quoteId: number) => {
          if (!isSubscribed) return
          
          console.log('📢 Quote accepted event received:', quoteId)
          await loadQuotes()
        }

        const handleQuoteStatusChanged = async (data: { 
          QuoteId: number
          Status: string
          QuoteNumber: number
          Total: number 
        }) => {
          if (!isSubscribed) return
          console.log('📢 Quote status changed:', data)
          await loadQuotes()
        }
        
        const handleQuoteCreated = async (data: {
          QuoteId: number
          QuoteNumber: number
          Total: number
        }) => {
          if (!isSubscribed) return
          console.log('📢 New quote created:', data)
          toast.info(`New quote #${data.QuoteNumber} received! Total: $${data.Total.toLocaleString()}`)
          await loadQuotes()
        }

        const handleSidebarUpdate = async () => {
          if (!isSubscribed || !user?.id) return
          try {
            const response = await getCustomerChatRooms(user.id, 1, 50)
            const mappedRentals: CustomerRental[] = response.rooms.map(room => ({
              id: room.id,
              rentalId: room.rentalId,
              packageName: room.packageName || 'Unknown Package',
              eventDate: room.eventDate || 'TBD',
              status: room.status || 'Unknown',
              lastMessage: room.lastMessage || 'No messages',
              timestamp: room.lastMessageTime 
                ? formatDistanceToNow(new Date(room.lastMessageTime), { addSuffix: true })
                : 'No messages',
              unread: room.unreadCount
            }))
            setCustomerRentals(mappedRentals)
          } catch (error) {
            console.error('Failed to reload rentals:', error)
          }
        }

        const originalReceiveMessage = handleReceiveMessage
        const wrappedReceiveMessage = (message: ChatMessageResponse) => {
          originalReceiveMessage(message)
          handleSidebarUpdate()
        }
        
        signalRService.onReceiveMessage(wrappedReceiveMessage)
        signalRService.onDemoStatusChanged(handleDemoStatusChanged)
        signalRService.onQuoteAccepted(handleQuoteAccepted)
        signalRService.onQuoteStatusChanged(handleQuoteStatusChanged)
        signalRService.onQuoteCreated(handleQuoteCreated)

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
        signalRService.offQuoteAccepted()
        signalRService.offQuoteStatusChanged()
        signalRService.offQuoteCreated()
      }
    }
  }, [rentalId, user?.id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !rentalId || isSending) return

    setIsSending(true)
    const content = inputMessage.trim()
    try {
      await sendMessage({
        rentalId: parseInt(rentalId),
        messageType: MessageType.Text,
        content
      })
      setInputMessage('')
    } catch (error) {
      console.error('Failed to send message:', error)
      toast.error('Failed to send message')
    } finally {
      setIsSending(false)
    }
  }

  const handleAcceptQuote = async (quoteId: number) => {
    try {
      const result = await customerAction(quoteId, 'approve')
      toast.success(result.message || 'Quote accepted successfully!')
      setSelectedQuote(null)
      
      await loadQuotes()
    } catch (error: any) {
      console.error('Failed to accept quote:', error)
      toast.error(error.response?.data?.error || 'Failed to accept quote')
    }
  }
  
  const handleRejectQuote = async (quoteId: number, reason: string) => {
    try {
      const result = await customerAction(quoteId, 'reject', reason)
      toast.success(result.message || 'Quote rejected successfully!')
      setSelectedQuote(null)
      
      await loadQuotes()
    } catch (error: any) {
      console.error('Failed to reject quote:', error)
      toast.error(error.response?.data?.error || 'Failed to reject quote')
    }
  }

  const handleRentalClick = (rentalIdToNavigate: number) => {
    navigate(`/customer/chat/${rentalIdToNavigate}`)
  }

  const quickReplies = [
    'Show me a demo',
    'Send price quote',
    'I agree',
    'Need changes'
  ]

  const selectedQuoteData = fullQuotes.find(q => q.id === selectedQuote)

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
      <header className='fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-100 py-3 px-24 font-orbitron flex items-center justify-between'>
        <div className='flex items-center space-x-4'>
          <img
            src={logo}
            alt='logo'
            className={`w-8 h-7 transition-all duration-200 filter drop-shadow-[0_0_2px_black]`}
          />
          <Link
            to='/'
            className='text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent tracking-wider'
          >
            ROBORENT
          </Link>
        </div>

        <div className='flex items-center space-x-4'>
          <Link
            to='/customer'
            className='flex items-center space-x-2 hover:opacity-80 transition-opacity duration-200'
          >
            <div className='h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center'>
              <img
                src={user?.picture}
                alt='User Avatar'
                className='h-7 w-7 rounded-full object-cover'
              />
            </div>
            <span className='text-gray-700 text-lg font-bold'>
              {user?.name || user?.userName || 'User'}
            </span>
          </Link>

          <button
            onClick={handleLogout}
            className='flex items-center space-x-1 text-gray-700 hover:text-gray-900 transition-colors'
            title='Logout'
          >
            <LogOut size={18} />
            <span className='text-lg font-bold'>Logout</span>
          </button>
        </div>
      </header>
      
      <div className="pt-16 h-screen flex">
        {/* Left Sidebar - Rental List */}
        {isSidebarOpen && (
          <div 
            style={{ width: `${sidebarWidth}px` }}
            className="border-r border-gray-200 bg-white flex flex-col relative"
          >
            {/* Resize handle */}
            <div
              onMouseDown={handleMouseDown}
              className="absolute right-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-orange-500 transition-colors z-10"
            />

            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">My Rentals</h2>
              <div className="relative mt-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search rentals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {isLoadingRentals ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500 text-sm">Loading rentals...</p>
                </div>
              ) : filteredRentals.length > 0 ? (
                filteredRentals.map((rental) => (
                  <div
                    key={rental.id}
                    onClick={() => handleRentalClick(rental.rentalId)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                      rental.rentalId.toString() === rentalId ? 'bg-orange-50 border-l-4 border-l-orange-500' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Package className="w-4 h-4 text-orange-500 flex-shrink-0" />
                          <p className="font-semibold text-gray-900 text-sm truncate">
                            {rental.packageName}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 ml-6">
                          #{rental.rentalId}
                        </p>
                      </div>
                      {rental.unread > 0 && (
                        <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full flex-shrink-0">
                          {rental.unread}
                        </span>
                      )}
                    </div>
                    
                    <div className="ml-6 space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <p className="text-xs text-gray-600">{rental.eventDate}</p>
                      </div>
                      <p className={`text-xs font-medium ${getStatusColor(rental.status)}`}>
                        {rental.status}
                      </p>
                    </div>

                    <p className="text-sm text-gray-600 truncate mt-2 ml-6">
                      {rental.lastMessage}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 ml-6">{rental.timestamp}</p>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <p className="text-gray-500 text-sm">No rentals found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Chat Header */}
          <div className="border-b border-gray-200 p-4 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title={isSidebarOpen ? "Hide sidebar" : "Show sidebar"}
                >
                  {isSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                </button>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    Chat with Staff
                  </h1>
                  <p className="text-sm text-gray-500">
                    Rental ID: #{rentalId} • <span className="text-blue-600">Demo Phase</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title={isRightSidebarOpen ? "Hide details" : "Show details"}
              >
                {isRightSidebarOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
              </button>
            </div>
          </div>

          {/* Messages */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-6 space-y-4"
          >
            {messages.map((message) => (
              <div key={message.id}>
                {message.messageType === MessageType.Demo ? (
                  <DemoVideoCard 
                    message={message} 
                    isCustomer={true}
                    onStatusUpdate={() => {}}
                  />
                ) : (
                  <ChatMessage 
                    message={message}
                    isOwnMessage={
                      message.senderRole === 'Customer' || message.senderId === user?.id
                    }
                  />
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          <div className="px-6 py-2 border-t border-gray-100">
            <div className="flex gap-2 flex-wrap">
              {quickReplies.map((reply) => (
                <button
                  key={reply}
                  onClick={() => setInputMessage(reply)}
                  className="px-4 py-1.5 bg-orange-50 text-orange-600 border border-orange-200 rounded-full text-sm hover:bg-orange-100 transition-colors"
                >
                  {reply}
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4 bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask a question or send feedback..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isSending}
                className="p-3 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        {isRightSidebarOpen && (
          <div className="w-96 border-l border-gray-200 bg-gray-50 overflow-y-auto">
            {/* Rental Request Info */}
            <div className="p-6 bg-white border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Your Rental Request
              </h2>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {rentalDetails.eventDate}
                    </p>
                    <p className="text-xs text-gray-600">{rentalDetails.eventTime}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-900">{rentalDetails.eventAddress}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Package className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {rentalDetails.packageName}
                    </p>
                    <p className="text-xs text-gray-600">
                      {rentalDetails.robotsRequested} robots requested for ~{rentalDetails.robotsRequested * 100} attendees
                    </p>
                  </div>
                </div>
              </div>

              <button className="w-full mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                Edit Request
              </button>
            </div>

            {/* Quotes Received */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">
                  Quotes Received
                </h2>
                <span className="text-sm text-gray-500">
                  {quotesData?.totalQuotes || 0} of 3
                </span>
              </div>

              <div className="space-y-3">
                {fullQuotes.map((quote) => {
                  // Check if quote is new (created after last viewed time)
                  const isNew = lastViewedQuoteTime 
                    ? new Date(quote.createdAt) > lastViewedQuoteTime
                    : false

                  return (
                    <QuoteCard
                      key={quote.id}
                      quote={quote}
                      onViewDetails={() => setSelectedQuote(quote.id)}
                      isNew={isNew}
                    />
                  )
                })}

                {fullQuotes.length === 0 && (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No quotes received yet
                  </div>
                )}
              </div>
            </div>

            {/* Next Steps */}
            <div className="p-6 bg-white border-t border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Next Steps</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-600">Demo approved</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-blue-500 flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  </div>
                  <span className="text-sm text-gray-900 font-medium">Reviewing quote #{quotesData?.totalQuotes || 1}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                  <span className="text-sm text-gray-400">Waiting for contract</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedQuote && selectedQuoteData && (
        <CustomerQuoteDetailModal
          quote={selectedQuoteData}
          allQuotes={fullQuotes}
          isOpen={!!selectedQuote}
          onClose={() => setSelectedQuote(null)}
          onRejectQuote={handleRejectQuote}
          onAcceptQuote={handleAcceptQuote}
        />
      )}
    </div>
  )
}