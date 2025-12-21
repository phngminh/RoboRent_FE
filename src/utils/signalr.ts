// src/utils/signalr.ts
import * as signalR from '@microsoft/signalr'
import type { ChatMessageResponse } from '../types/chat.types'

const API_URL = import.meta.env.VITE_API_URL.replace('/api', '')

class SignalRService {
  private connection: signalR.HubConnection | null = null
  private isConnecting = false

  async connect(): Promise<signalR.HubConnection> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      return this.connection
    }

    if (this.isConnecting) {
      // Wait for existing connection attempt
      await new Promise(resolve => setTimeout(resolve, 100))
      return this.connect()
    }

    this.isConnecting = true

    try {
      const token = localStorage.getItem('token')?.replace(/"/g, '')

      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(`${API_URL}/chatHub`, {
          accessTokenFactory: () => token || ''
        })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Information)
        .build()

      // Handle connection close - refresh token if needed
      this.connection.onclose(async (error?: Error) => {
        console.log('SignalR connection closed:', error)

        // Check if token might be expired
        const currentToken = localStorage.getItem('token')?.replace(/"/g, '')
        if (!currentToken || this.isTokenExpired(currentToken)) {
          console.log('Token expired, refreshing...')
          try {
            const { refreshToken } = await import('../apis/auth.api')
            const newToken = await refreshToken()
            if (newToken) {
              localStorage.setItem('token', JSON.stringify(newToken))
              console.log('Token refreshed, reconnecting...')
              // Reconnect with new token
              setTimeout(() => this.connect(), 1000)
            }
          } catch (err) {
            console.error('Failed to refresh token:', err)
          }
        }
      })

      await this.connection.start()
      console.log('SignalR Connected')

      this.isConnecting = false
      return this.connection
    } catch (error) {
      this.isConnecting = false
      console.error('SignalR Connection Error:', error)
      throw error
    }
  }

  // Helper to check if JWT token is expired
  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const exp = payload.exp * 1000 // Convert to milliseconds
      return Date.now() >= exp - 60000 // Refresh 1 min before expiry
    } catch {
      return true
    }
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.stop()
      this.connection = null
    }
  }

  async joinRentalChat(rentalId: number) {
    const conn = await this.connect()
    await conn.invoke('JoinRentalChat', rentalId)
  }

  async leaveRentalChat(rentalId: number) {
    const conn = await this.connect()
    await conn.invoke('LeaveRentalChat', rentalId)
  }

  async sendTypingIndicator(rentalId: number, userName: string) {
    const conn = await this.connect()
    await conn.invoke('UserTyping', rentalId, userName)
  }

  // Event handlers to prevent console warnings (these events are sent by ChatHub)
  onUserJoined(callback: (connectionId: string) => void) {
    this.connection?.on('UserJoined', callback)
  }

  offUserJoined() {
    this.connection?.off('UserJoined')
  }

  onUserLeft(callback: (connectionId: string) => void) {
    this.connection?.on('UserLeft', callback)
  }

  offUserLeft() {
    this.connection?.off('UserLeft')
  }

  onReceiveMessage(callback: (message: ChatMessageResponse) => void) {
    this.connection?.on('ReceiveMessage', callback)
  }

  onDemoStatusChanged(callback: (messageId: number, status: string) => void) {
    this.connection?.on('DemoStatusChanged', callback)
  }

  onUserTyping(callback: (userName: string) => void) {
    this.connection?.on('UserIsTyping', callback)
  }

  offReceiveMessage() {
    this.connection?.off('ReceiveMessage')
  }

  offDemoStatusChanged() {
    this.connection?.off('DemoStatusChanged')
  }

  offUserTyping() {
    this.connection?.off('UserIsTyping')
  }

  onQuoteAccepted(callback: (quoteId: number) => void) {
    this.connection?.on('QuoteAccepted', callback)
  }

  offQuoteAccepted() {
    this.connection?.off('QuoteAccepted')
  }

  // 🔴 NEW: QuoteRejected event (fixes bug #1!)
  onQuoteRejected(callback: (data: {
    QuoteId: number
    QuoteNumber: number
    Reason: string
  }) => void) {
    this.connection?.on('QuoteRejected', callback)
  }

  offQuoteRejected() {
    this.connection?.off('QuoteRejected')
  }

  onQuoteStatusChanged(callback: (data: {
    QuoteId: number
    Status: string
    QuoteNumber: number
    Total: number
  }) => void) {
    this.connection?.on('QuoteStatusChanged', callback)
  }

  offQuoteStatusChanged() {
    this.connection?.off('QuoteStatusChanged')
  }

  onQuoteCreated(callback: (data: {
    QuoteId: number
    QuoteNumber: number
    Total: number
  }) => void) {
    this.connection?.on('QuoteCreated', callback)
  }

  offQuoteCreated() {
    this.connection?.off('QuoteCreated')
  }

  // Contract Events
  onContractPendingCustomerSignature(callback: (data: {
    ContractId: number
    RentalId: number
    Message: string
  }) => void) {
    this.connection?.on('ContractPendingCustomerSignature', callback)
  }

  offContractPendingCustomerSignature() {
    this.connection?.off('ContractPendingCustomerSignature')
  }

  onContractActivated(callback: (data: {
    ContractId: number
    RentalId: number
    Message: string
  }) => void) {
    this.connection?.on('ContractActivated', callback)
  }

  offContractActivated() {
    this.connection?.off('ContractActivated')
  }

  onContractChangeRequested(callback: (data: {
    ContractId: number
    RentalId: number
    Message: string
    ChangeRequest: string
  }) => void) {
    this.connection?.on('ContractChangeRequested', callback)
  }

  offContractChangeRequested() {
    this.connection?.off('ContractChangeRequested')
  }

  // 🎯 NEW: Facebook-like sidebar update event
  // Fired when a message is sent to a room user is NOT currently viewing
  // NOTE: SignalR auto-converts PascalCase to camelCase
  onNewMessageInRoom(callback: (data: {
    rentalId: number
    senderId: number
    senderName: string
    preview: string
    timestamp: string
  }) => void) {
    this.connection?.on('NewMessageInRoom', callback)
  }

  offNewMessageInRoom() {
    this.connection?.off('NewMessageInRoom')
  }

}

export const signalRService = new SignalRService()