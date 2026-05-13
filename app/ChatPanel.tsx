'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createThread, getThreadState, streamChat } from '@/lib/chat-client'
import { getThreads, addThread, type ThreadInfo } from '@/lib/chat-store'
import { MarkdownMessage } from '@/app/MarkdownMessage'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

function timeAgo(iso: string): string {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export function ChatPanel({ onClose }: { onClose: () => void }) {
  const [threadId, setThreadId] = useState<string | null>(null)
  const [threads, setThreads] = useState<ThreadInfo[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Initialize: create a new thread on open
  useEffect(() => {
    const existing = getThreads()
    setThreads(existing)
    createThread()
      .then((info) => {
        addThread(info)
        setThreads((prev) => [...prev, info])
        setThreadId(info.id)
      })
      .catch(() => setError('Failed to create conversation'))
  }, [])

  const handleNewThread = async () => {
    try {
      const info = await createThread()
      addThread(info)
      setThreads((prev) => [...prev, info])
      setThreadId(info.id)
      setMessages([])
      setError(null)
    } catch {
      setError('Failed to create new conversation')
    }
  }

  const handleSwitchThread = async (id: string) => {
    setIsLoadingHistory(true)
    setError(null)
    try {
      const state = await getThreadState(id)
      setThreadId(id)
      setMessages(state.messages as Message[])
    } catch {
      setError('Failed to load conversation')
    } finally {
      setIsLoadingHistory(false)
    }
  }

  const handleSend = async () => {
    if (!input.trim() || isStreaming || !threadId) return

    const userMessage: Message = { role: 'user', content: input.trim() }
    setInput('')
    setMessages((prev) => [...prev, userMessage])
    setIsStreaming(true)
    setError(null)

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const assistantMessage: Message = { role: 'assistant', content: '' }
      setMessages((prev) => [...prev, assistantMessage])

      await streamChat(threadId, [userMessage], controller.signal, (fullContent) => {
        setMessages((prev) => {
          const updated = [...prev]
          const last = updated[updated.length - 1]
          if (last && last.role === 'assistant') {
            last.content = fullContent
          }
          return updated
        })
      })
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      setMessages((prev) => {
        const updated = [...prev]
        const last = updated[updated.length - 1]
        if (last && last.role === 'assistant') {
          last.content += ' \u26a0\ufe0f Connection lost. Try again.'
        }
        return updated
      })
    } finally {
      setIsStreaming(false)
      abortRef.current = null
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleClose = () => {
    abortRef.current?.abort()
    onClose()
  }

  return (
    <div className="chat-panel-inner">
      {/* Header */}
      <div className="chat-panel-header">
        <span className="chat-panel-title">PolyBot</span>
        <div className="chat-panel-header-actions">
          <button
            className="chat-new-btn"
            onClick={handleNewThread}
            aria-label="+"
            title="New conversation"
          >
            +
          </button>
          <button className="chat-close-btn" onClick={handleClose} aria-label="Close">
            ✕
          </button>
        </div>
      </div>

      {/* Thread selector */}
      {threads.length > 0 && (
        <div className="chat-thread-selector">
          <select
            value={threadId ?? ''}
            onChange={(e) => handleSwitchThread(e.target.value)}
          >
            {[...threads].reverse().map((t) => (
              <option key={t.id} value={t.id}>
                {t.id.slice(0, 8)}... {timeAgo(t.createdAt)}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Messages */}
      <div className="chat-messages">
        {isLoadingHistory && <div className="chat-loading">Loading...</div>}
        {error && <div className="chat-error">{error}</div>}
        {!isLoadingHistory && messages.length === 0 && (
          <div className="chat-welcome">
            Ask me about crypto, prediction markets, or news.
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`chat-bubble ${msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-assistant'}`}
          >
            {msg.role === 'assistant' ? (
              <MarkdownMessage content={msg.content} />
            ) : (
              msg.content
            )}
            {isStreaming && i === messages.length - 1 && msg.role === 'assistant' && (
              <span className="chat-cursor">|</span>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="chat-input-area">
        <textarea
          className="chat-input"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          disabled={isStreaming}
        />
        <button
          className="chat-send-btn"
          onClick={handleSend}
          disabled={isStreaming || !input.trim()}
          aria-label="Send"
        >
          Send
        </button>
      </div>
    </div>
  )
}
