'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { ChatPanel } from '@/app/ChatPanel'

const MIN_PANEL_WIDTH = 320
const MAX_PANEL_WIDTH_FRACTION = 0.8

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [panelWidth, setPanelWidth] = useState<number | null>(null)
  const isDragging = useRef(false)

  const handleDragStart = useCallback(() => {
    isDragging.current = true
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return
      const newWidth = window.innerWidth - e.clientX
      const clamped = Math.max(
        MIN_PANEL_WIDTH,
        Math.min(newWidth, window.innerWidth * MAX_PANEL_WIDTH_FRACTION)
      )
      setPanelWidth(clamped)
    }

    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  return (
    <>
      <button
        className="chat-fab"
        style={
          isOpen
            ? { right: panelWidth ? `calc(${panelWidth}px + 20px)` : 'calc(25vw + 20px)' }
            : undefined
        }
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? 'Close' : 'Open chat'}
      >
        {isOpen ? '✕' : '✦'}
      </button>

      {isOpen && (
        <aside className="chat-panel" style={panelWidth ? { width: panelWidth } : undefined}>
          <div className="chat-drag-handle" onMouseDown={handleDragStart} />
          <ChatPanel onClose={() => setIsOpen(false)} />
        </aside>
      )}
    </>
  )
}
