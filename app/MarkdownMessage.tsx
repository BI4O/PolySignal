'use client'

import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

function Link({ href, children }: { href?: string; children?: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}

export function MarkdownMessage({ content }: { content: string }) {
  return (
    <div className="chat-markdown">
      <Markdown remarkPlugins={[remarkGfm]} components={{ a: Link }}>
        {content}
      </Markdown>
    </div>
  )
}
