'use client'

import { useState } from 'react'
import { ChatPanel } from '@/app/ChatPanel'

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        className="chat-fab"
        style={isOpen ? { right: 'calc(25vw + 20px)' } : undefined}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? 'Close' : 'Open chat'}
      >
        {isOpen ? '✕' : '✦'}
      </button>

      {isOpen && (
        <aside className="chat-panel">
          <ChatPanel onClose={() => setIsOpen(false)} />
        </aside>
      )}
    </>
  )
}
