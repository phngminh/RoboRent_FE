// src/utils/signalr.ts
import * as signalR from '@microsoft/signalr'
import type { ChatMessageResponse } from '../types/chat.types'

const API_URL = 'https://localhost:7249'

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
}

export const signalRService = new SignalRService()