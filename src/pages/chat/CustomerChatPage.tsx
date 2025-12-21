// src/pages/chat/CustomerChatPage.tsx
import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Send, Calendar, MapPin, Package, CheckCircle2, Search, ChevronLeft, ChevronRight, Circle, XCircle, Loader2, Truck, Video, FileText, CreditCard, PartyPopper, Bot } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { signalRService } from '../../utils/signalr'
import { getChatMessages, sendMessage, getMyChatRooms, markRentalAsRead } from '../../apis/chat.api'
import { getQuotesByRentalId, customerAction, getPriceQuoteById } from '../../apis/priceQuote.api'
import type { ChatMessageResponse, RentalQuotesResponse, PriceQuoteResponse } from '../../types/chat.types'
import { MessageType, DemoStatus, QuoteStatus } from '../../types/chat.types'
import ChatMessage from '../../components/chat/ChatMessage'
import DemoVideoCard from '../../components/chat/DemoVideoCard'
import QuoteCard from '../../components/chat/QuoteCard'
import CustomerQuoteDetailModal from '../../components/chat/CustomerQuoteDetailModal'
import { toast } from 'react-toastify'
import { formatDistanceToNow } from 'date-fns'
import Header from '../../components/header'
import { getRentalByIdAsync } from '../../apis/rental.customer.api'
import { formatMoney } from '../../utils/format'

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
  lastMessageTime?: string  // For sorting - ISO date string
}

const CustomerChatPage: React.FC = () => {
  const { rentalId } = useParams<{ rentalId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
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
  const [, setRentalStatus] = useState<string>('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [sidebarWidth, setSidebarWidth] = useState(320)
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true)
  const [lastViewedQuoteTime, setLastViewedQuoteTime] = useState<Date | null>(null)
  const [rentalInfo, setRentalInfo] = useState<any | null>(null)

  // const hasPendingDemo = messages.some(
  //   msg => msg.messageType === MessageType.Demo && msg.status === DemoStatus.Pending
  // )

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    const loadRentalInfo = async () => {
      if (!rentalId) return
      try {
        const data = await getRentalByIdAsync(parseInt(rentalId))
        setRentalInfo(data)
      } catch (err) {
        console.error("Failed to load rental info:", err)
      }
    }

    loadRentalInfo()
  }, [rentalId])

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
          setCustomerRentals(prev => prev.map(rental =>
            rental.rentalId === parseInt(rentalId)
              ? { ...rental, unread: 0 }
              : rental
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
      if (!user?.accountId) return

      setIsLoadingRentals(true)
      try {
        const response = await getMyChatRooms(1, 50)
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
  }, [user?.accountId, rentalId])

  // SignalR setup
  useEffect(() => {
    if (!rentalId) return

    let isSubscribed = true

    const setupSignalR = async () => {
      try {
        await signalRService.connect()
        await signalRService.joinRentalChat(parseInt(rentalId))

        const handleReceiveMessage = async (message: ChatMessageResponse) => {
          if (!isSubscribed) return

          setMessages(prev => {
            if (prev.some(m => m.id === message.id)) {
              console.warn('⚠️ Duplicate message ignored:', message.id)
              return prev
            }
            return [...prev, message]
          })

          scrollToBottom()

          // 🎯 Auto-mark as read since user is in the chat room
          try {
            await markRentalAsRead(parseInt(rentalId))
            setCustomerRentals(prev => prev.map(rental =>
              rental.rentalId === parseInt(rentalId)
                ? { ...rental, unread: 0 }
                : rental
            ))
          } catch (error) {
            console.error('Failed to auto-mark as read:', error)
          }
        }

        const handleDemoStatusChanged = (messageId: number, status: string) => {
          if (!isSubscribed) return

          setMessages(prev => prev.map(msg =>
            msg.id === messageId ? { ...msg, status: status as DemoStatus } : msg
          ))
        }

        const handleQuoteAccepted = async (quoteId: number) => {
          if (!isSubscribed) return
          await loadQuotes()
        }

        const handleQuoteStatusChanged = async (data: {
          QuoteId: number
          Status: string
          QuoteNumber: number
          Total: number
        }) => {
          if (!isSubscribed) return
          await loadQuotes()
        }

        const handleQuoteCreated = async (data: {
          QuoteId: number
          QuoteNumber: number
          Total: number
        }) => {
          if (!isSubscribed) return
          toast.info(`New quote #${data.QuoteNumber} received! Total: ${formatMoney(data.Total)}`)
          await loadQuotes()
        }

        // 🎯 NEW: Handle contract pending customer signature (Manager signed)
        const handleContractPendingSignature = (data: {
          ContractId: number
          RentalId: number
          Message: string
        }) => {
          if (!isSubscribed) return
          toast.info(`📝 ${data.Message}`)
        }

        // 🎯 NEW: Facebook-like sidebar update when message comes to a different room
        // NOTE: SignalR auto-converts PascalCase to camelCase
        const handleNewMessageInRoom = (data: {
          rentalId: number
          senderId: number
          senderName: string
          preview: string
          timestamp: string
        }) => {
          if (!isSubscribed) return

          // Update sidebar: increase unread count, update last message, and SORT to top
          setCustomerRentals(prev => {
            const matchingRental = prev.find(r => r.rentalId === data.rentalId)
            if (!matchingRental) return prev

            const updated = prev.map(rental =>
              rental.rentalId === data.rentalId
                ? {
                  ...rental,
                  unread: rental.rentalId !== parseInt(rentalId || '0') ? rental.unread + 1 : 0,
                  lastMessage: data.preview,
                  timestamp: 'just now',
                  lastMessageTime: new Date().toISOString()
                }
                : rental
            )

            // Sort by lastMessageTime descending (newest first)
            return updated.sort((a, b) => {
              const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0
              const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0
              return timeB - timeA
            })
          })
        }

        // Empty handlers to prevent console warnings
        const handleUserJoined = (_connectionId: string) => { }
        const handleUserLeft = (_connectionId: string) => { }

        signalRService.onUserJoined(handleUserJoined)
        signalRService.onUserLeft(handleUserLeft)
        signalRService.onReceiveMessage(handleReceiveMessage)
        signalRService.onDemoStatusChanged(handleDemoStatusChanged)
        signalRService.onQuoteAccepted(handleQuoteAccepted)
        signalRService.onQuoteStatusChanged(handleQuoteStatusChanged)
        signalRService.onQuoteCreated(handleQuoteCreated)
        signalRService.onContractPendingCustomerSignature(handleContractPendingSignature)
        signalRService.onNewMessageInRoom(handleNewMessageInRoom)

      } catch (error) {
        console.error('SignalR setup failed:', error)
      }
    }

    setupSignalR()

    return () => {
      isSubscribed = false

      if (rentalId) {
        signalRService.leaveRentalChat(parseInt(rentalId))
        signalRService.offUserJoined()
        signalRService.offUserLeft()
        signalRService.offReceiveMessage()
        signalRService.offDemoStatusChanged()
        signalRService.offQuoteAccepted()
        signalRService.offQuoteStatusChanged()
        signalRService.offQuoteCreated()
        signalRService.offContractPendingCustomerSignature()
        signalRService.offNewMessageInRoom()
      }
    }
  }, [rentalId, user?.accountId])

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

      // 🎯 Update sender's own sidebar (NewMessageInRoom only goes to recipient)
      setCustomerRentals(prev => {
        const updated = prev.map(rental =>
          rental.rentalId === parseInt(rentalId)
            ? {
              ...rental,
              lastMessage: content.length > 50 ? content.substring(0, 50) + '...' : content,
              timestamp: 'just now',
              lastMessageTime: new Date().toISOString()
            }
            : rental
        )
        // Sort by lastMessageTime descending (newest first)
        return updated.sort((a, b) => {
          const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0
          const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0
          return timeB - timeA
        })
      })
    } catch (error) {
      console.error('Failed to send message:', error)
      toast.error('Failed to send message')
    } finally {
      setIsSending(false)
    }
  }

  const handleQuickReply = async (reply: string) => {
    if (!rentalId || isSending) return

    setIsSending(true)
    try {
      await sendMessage({
        rentalId: parseInt(rentalId),
        messageType: MessageType.Text,
        content: reply
      })
    } catch (error) {
      console.error('Failed to send quick reply:', error)
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

  // Helper function to determine progress steps
  type StepStatus = 'completed' | 'in-progress' | 'pending' | 'failed'

  interface ProgressStep {
    id: string
    label: string
    status: StepStatus
    icon: React.ReactNode
    substatus: string
  }

  const getProgressSteps = (): ProgressStep[] => {
    const status = rentalInfo?.status || ''
    const steps: ProgressStep[] = []

    // Step 1: Robot Scheduling
    const scheduleStatus: StepStatus =
      ['Scheduled', 'PendingDemo', 'AcceptedDemo', 'DeniedDemo', 'PendingPriceQuote', 'AcceptedPriceQuote', 'RejectedPriceQuote', 'PendingContract', 'PendingDeposit', 'DeliveryScheduled', 'Completed'].includes(status)
        ? 'completed'
        : status === 'Received'
          ? 'in-progress'
          : 'pending'

    steps.push({
      id: 'schedule',
      label: 'Robot Scheduling',
      status: scheduleStatus,
      icon: <Bot className="w-5 h-5" />,
      substatus:
        scheduleStatus === 'completed' ? 'Robots scheduled ✓' :
          scheduleStatus === 'in-progress' ? 'Staff is scheduling robots...' :
            'Waiting for staff to schedule robots'
    })

    // Step 2: Demo Review
    const demoStatus: StepStatus =
      ['AcceptedDemo', 'PendingPriceQuote', 'AcceptedPriceQuote', 'RejectedPriceQuote', 'PendingContract', 'PendingDeposit', 'DeliveryScheduled', 'Completed'].includes(status)
        ? 'completed'
        : status === 'PendingDemo'
          ? 'in-progress'
          : status === 'DeniedDemo'
            ? 'failed'
            : 'pending'

    steps.push({
      id: 'demo',
      label: 'Demo Review',
      status: demoStatus,
      icon: <Video className="w-5 h-5" />,
      substatus:
        demoStatus === 'completed' ? 'Demo approved ✓' :
          demoStatus === 'in-progress' ? 'Review demo video...' :
            demoStatus === 'failed' ? 'Demo rejected - awaiting new demo' :
              'Waiting for staff to send demo'
    })

    // Step 3: Price Quote
    const quoteStatus: StepStatus =
      ['AcceptedPriceQuote', 'PendingContract', 'PendingDeposit', 'DeliveryScheduled', 'Completed'].includes(status)
        ? 'completed'
        : (status === 'PendingPriceQuote' || fullQuotes.some(q => q.status === 'PendingCustomer'))
          ? 'in-progress'
          : 'pending'

    steps.push({
      id: 'quote',
      label: 'Price Quote',
      status: quoteStatus,
      icon: <FileText className="w-5 h-5" />,
      substatus:
        quoteStatus === 'completed' ? 'Quote approved ✓' :
          quoteStatus === 'in-progress' ? `Reviewing quote #${quotesData?.totalQuotes || 1}` :
            'Waiting for price quote'
    })

    // Step 4: Contract Signing
    const contractStatus: StepStatus =
      ['PendingDeposit', 'DeliveryScheduled', 'Completed'].includes(status)
        ? 'completed'
        : status === 'PendingContract'
          ? 'in-progress'
          : 'pending'

    steps.push({
      id: 'contract',
      label: 'Contract Signing',
      status: contractStatus,
      icon: <FileText className="w-5 h-5" />,
      substatus:
        contractStatus === 'completed' ? 'Contract signed ✓' :
          contractStatus === 'in-progress' ? 'Review and sign contract' :
            'Waiting for contract'
    })

    // Step 5: Deposit Payment
    const depositStatus: StepStatus =
      ['DeliveryScheduled', 'Completed'].includes(status)
        ? 'completed'
        : status === 'PendingDeposit'
          ? 'in-progress'
          : 'pending'

    steps.push({
      id: 'deposit',
      label: 'Deposit Payment',
      status: depositStatus,
      icon: <CreditCard className="w-5 h-5" />,
      substatus:
        depositStatus === 'completed' ? 'Deposit paid ✓' :
          depositStatus === 'in-progress' ? 'Pay deposit to confirm' :
            'Waiting for deposit payment'
    })

    // Step 6: Delivery Scheduled
    const deliveryStatus: StepStatus =
      status === 'Completed'
        ? 'completed'
        : status === 'DeliveryScheduled'
          ? 'in-progress'
          : 'pending'

    steps.push({
      id: 'delivery',
      label: 'Delivery Scheduled',
      status: deliveryStatus,
      icon: <Truck className="w-5 h-5" />,
      substatus:
        deliveryStatus === 'completed' ? 'Robots delivered ✓' :
          deliveryStatus === 'in-progress' ? 'Delivery scheduled' :
            'Waiting for delivery schedule'
    })

    // Step 7: Event Completed
    const completedStatus: StepStatus =
      status === 'Completed' ? 'completed' : 'pending'

    steps.push({
      id: 'completed',
      label: 'Event Completed',
      status: completedStatus,
      icon: <PartyPopper className="w-5 h-5" />,
      substatus:
        completedStatus === 'completed' ? 'Event completed successfully! ✓' :
          'Awaiting event day'
    })

    return steps
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

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
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${rental.rentalId.toString() === rentalId ? 'bg-orange-50 border-l-4 border-l-orange-500' : ''
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
                    Event Name: {rentalInfo?.eventName} • <span className="text-blue-600">{rentalInfo?.status}</span>
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
                    onStatusUpdate={() => { }}
                  />
                ) : (
                  <ChatMessage
                    message={message}
                    isOwnMessage={
                      message.senderRole === 'Customer' || message.senderId === user?.accountId
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
                  onClick={() => handleQuickReply(reply)}
                  disabled={isSending}
                  className="px-4 py-1.5 bg-orange-50 text-orange-600 border border-orange-200 rounded-full text-sm hover:bg-orange-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

              {!rentalInfo ? (
                <p className="text-gray-500 text-sm">Loading...</p>
              ) : (
                <div className="space-y-4">

                  {/* DATE + TIME */}
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(rentalInfo.eventDate).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </p>

                      <p className="text-xs text-gray-600">
                        {rentalInfo.startTime?.substring(0, 5)} - {rentalInfo.endTime?.substring(0, 5)}
                      </p>
                    </div>
                  </div>

                  {/* LOCATION */}
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-900">
                        {rentalInfo.address}
                      </p>
                      <p className="text-xs text-gray-600">
                        {rentalInfo.city}
                      </p>
                    </div>
                  </div>

                  {/* PACKAGE */}
                  <div className="flex items-start gap-3">
                    <Package className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {rentalInfo.eventActivityName}
                      </p>
                      <p className="text-xs text-gray-600">
                        {rentalInfo.activityTypeName}
                      </p>
                    </div>
                  </div>

                </div>
              )}
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
                  // The latest quote (highest quoteNumber) is always new
                  const maxQuoteNumber = Math.max(...fullQuotes.map(q => q.quoteNumber))
                  const isNew = quote.quoteNumber === maxQuoteNumber

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

            {/* Progress Timeline */}
            <div className="p-6 bg-gradient-to-br from-white to-gray-50 border-t border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Progress Timeline</h2>

              {(rentalInfo?.status === 'Canceled' || rentalInfo?.status === 'ForceCancelled') ? (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                  <p className="text-red-700 font-medium flex items-center gap-2">
                    <XCircle className="w-5 h-5" />
                    This rental has been cancelled
                  </p>
                </div>
              ) : (
                <div className="relative space-y-0">
                  {/* Vertical gradient line */}
                  <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-green-300 via-blue-300 to-gray-200" />

                  {getProgressSteps().map((step, index) => {
                    const isLast = index === getProgressSteps().length - 1
                    const statusColors = {
                      completed: {
                        bg: 'bg-green-50',
                        border: 'border-green-500',
                        text: 'text-green-700',
                        icon: 'text-green-600'
                      },
                      'in-progress': {
                        bg: 'bg-blue-50',
                        border: 'border-blue-500',
                        text: 'text-blue-900',
                        icon: 'text-blue-600'
                      },
                      failed: {
                        bg: 'bg-red-50',
                        border: 'border-red-500',
                        text: 'text-red-700',
                        icon: 'text-red-600'
                      },
                      pending: {
                        bg: 'bg-gray-50',
                        border: 'border-gray-300',
                        text: 'text-gray-400',
                        icon: 'text-gray-400'
                      }
                    }

                    const colors = statusColors[step.status]

                    return (
                      <div key={step.id} className={`relative flex items-start gap-3 pb-6 ${isLast ? 'pb-0' : ''}`}>
                        {/* Icon circle */}
                        <div className={`relative z-10 flex items-center justify-center w-6 h-6 rounded-full border-2 ${colors.border} ${colors.bg} ${colors.icon} flex-shrink-0 transition-all duration-300 ${step.status === 'in-progress' ? 'shadow-lg' : ''}`}>
                          {step.status === 'completed' ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : step.status === 'in-progress' ? (
                            <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse" />
                          ) : step.status === 'failed' ? (
                            <XCircle className="w-4 h-4" />
                          ) : (
                            <Circle className="w-3 h-3" />
                          )}
                        </div>

                        {/* Step content */}
                        <div className={`flex-1 ${step.status === 'in-progress' ? 'transform scale-105' : ''} transition-all duration-300`}>
                          <div className={`flex items-center gap-2 mb-1 ${colors.text}`}>
                            <span className={`${colors.icon}`}>
                              {step.icon}
                            </span>
                            <span className={`text-sm font-semibold ${step.status === 'in-progress' ? 'text-blue-900' : step.status === 'completed' ? 'text-gray-700' : colors.text}`}>
                              {step.label}
                            </span>
                          </div>
                          <p className={`text-xs ml-7 ${step.status === 'in-progress' ? 'text-blue-700 font-medium' : step.status === 'completed' ? 'text-gray-600' : colors.text}`}>
                            {step.substatus}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
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

export default CustomerChatPage