# PolyBot Chat Widget — Design Spec

**Date:** 2026-05-11
**Status:** Draft

## Overview

Add a floating chat widget to the bottom-right corner of newsai_v1. Clicking the `✦` button opens a slide-out panel (~25vw) that connects to the PolyBot LangGraph API server (localhost:2024) via SSE streaming. Users can manage multiple conversation threads — create new ones and switch between existing ones.

## File Structure

```
app/ChatWidget.tsx    — floating button + panel shell (fixed positioning, open/close, z-index, animation)
app/ChatPanel.tsx     — panel content (message list, input, thread selector, + new thread button)
lib/chat-client.ts    — pure async functions, SSE streaming client for PolyBot HTTP API, zero React dependency
lib/chat-store.ts     — pure sync functions, localStorage read/write of thread ID list
```

## Component Tree

```
<ChatWidget>                          ← position: fixed, z-index: 300
  ├── <button .chat-fab>              ← 40x40 circle, ✦ / ✕ toggle
  └── <aside .chat-panel>            ← slide-in from right, width: 25vw (min 320px, max 480px)
       └── <ChatPanel>                ← all data logic
            ├── <header>
            │    ├── "PolyBot" title
            │    ├── [+ New] button
            │    └── <select> thread picker
            ├── <div .messages>
            │    ├── welcome text (no messages yet)
            │    └── message bubbles (user right-aligned, assistant left-aligned)
            └── <footer>
                 ├── <textarea> input
                 └── [Send] button
```

## Module Contracts

### `lib/chat-store.ts`

```ts
getThreadIds(): string[]
addThreadId(id: string): void
```

- Reads/writes a `chat_threads` JSON array to localStorage.
- No dedup, no delete, no ordering. Just append + read.
- Thread list is append-only. The newest thread is the "current" active one.

### `lib/chat-client.ts`

```ts
createThread(): Promise<string>
// POST /threads -> returns thread_id UUID

getThreadState(threadId: string): Promise<{ messages: Message[] }>
// GET /threads/{threadId}/state -> history

streamChat(threadId: string, messages: {role:string, content:string}[]): AsyncGenerator<string>
// POST /threads/{threadId}/runs/stream
// Body: { "assistant_id": "base", "input": { "messages": [...] }, "stream_mode": ["messages"] }
// SSE parse: filter "event: messages", extract content from data JSON, yield each token string
```

- All functions use `fetch()`. API base URL is `http://localhost:2024`.
- `streamChat` takes an `AbortSignal` via closure for cancellation.

### `app/ChatPanel.tsx`

Props: `{ onClose: () => void }`

State:
- `threadId: string | null` — current active thread
- `messages: { role: "user" | "assistant", content: string }[]` — displayed messages
- `input: string`
- `isStreaming: boolean`

Calls `chat-client` and `chat-store` functions. Does not touch localStorage or fetch directly.

### `app/ChatWidget.tsx`

No props. Owns open/closed boolean state. Renders the FAB and the panel shell. On open, renders `<ChatPanel>`. On close, unmounts ChatPanel (resets state).

## Data Flow

### New conversation
```
User clicks [+] -> ChatPanel calls createThread() -> chat-store.addThreadId(id) -> setThreadId(id) -> show welcome
```

### Sending a message
```
User types + Enter
  -> append {role:"user", content} to messages state
  -> streamChat(threadId, [userMessage])
  -> for each token: append to last assistant message bubble in state
  -> on done: messages persisted server-side via LangGraph thread
```

### Switching threads
```
User selects old thread from <select>
  -> getThreadState(threadId)
  -> setMessages(history)
  -> setThreadId(threadId)
  -> subsequent sends go to this thread
```

## SSE Parsing (`chat-client.ts` details)

The PolyBot API returns SSE in this format:
```
event: metadata
data: {"run_id":"..."}

event: messages
data: [{"type":"AIMessageChunk","content":"ETH","tool_calls":[],...}]

event: messages
data: [{"type":"AIMessageChunk","content":" currently",...}]
```

Parsing algorithm:
1. `fetch()` with `Accept: text/event-stream`, read `response.body` as `ReadableStream<Uint8Array>`
2. Decode chunks to text, split by `\n\n` into events
3. For each event: if line starts with `event: messages`, parse the following `data:` line as JSON
4. Extract `content` from each `AIMessageChunk` in the array
5. Yield each content string. Empty string content (from tool calls) is skipped.

Tool call chunks (where `content` is empty but `tool_calls` has data) are consumed silently — not shown to the user.

## Visual Design

### Floating Button (`.chat-fab`)
```css
position: fixed; bottom: 20px; right: 20px;
width: 40px; height: 40px; border-radius: 50%;
background: var(--surface); border: 1px solid var(--border);
color: var(--muted); cursor: pointer;
font-size: 18px; z-index: 300;
box-shadow: 0 2px 8px rgba(0,0,0,.06);
```
- Icon: `✦` when closed, `✕` when open.
- Hover: `box-shadow: 0 4px 12px rgba(0,0,0,.12)`.
- Same style as the deleted `TweaksPanel` toggle from commit `0f5f3ac`.

### Panel (`.chat-panel`)
```css
position: fixed; top: 0; right: 0; bottom: 0;
width: 25vw; min-width: 320px; max-width: 480px;
background: var(--bg); border-left: 1px solid var(--border);
box-shadow: -4px 0 24px rgba(0,0,0,.08);
z-index: 299;
display: flex; flex-direction: column;
```
- Animation: `transform: translateX(100%)` -> `translateX(0)`, 200ms ease-out.
- The panel does NOT push page content. It overlays on top.
- Users can still interact with uncovered parts of the page behind the panel.

### ChatPanel Internal Layout
- **Header**: "PolyBot" title + `[+ New]` button + thread selector dropdown. Fixed height ~48px, border-bottom.
- **Messages area**: `flex: 1`, overflow-y: auto, padding: 16px. Scrolls to bottom on new messages.
- **User bubble**: `align-self: flex-end`, `background: var(--surface)`, rounded, max-width 80%.
- **Assistant bubble**: `align-self: flex-start`, `background: var(--accent)` at very low opacity, rounded, max-width 80%. Content streams in token by token.
- **Streaming cursor**: a blinking `|` appended to the last assistant bubble while `isStreaming` is true. `@keyframes blink` alternating opacity.
- **Input area**: `<textarea>` + Send button. Fixed at bottom, border-top. Enter sends, Shift+Enter newline. Send button disabled while `isStreaming` or input is empty.

## Error Handling

| Scenario | Behavior |
|----------|----------|
| Network failure (`fetch` throws) | Append `⚠️ Connection lost. Try again.` to the assistant bubble in progress |
| SSE stream breaks mid-response | Same as above. Already-rendered tokens are kept. |
| User closes panel while streaming | `AbortController.abort()` cancels the fetch |
| HTTP 409 (thread busy) | Show inline error: "Agent is busy. Retrying..." — auto-retry once after 2 seconds |
| `getThreadState` fails | Show toast-like message: "Failed to load conversation." Keep current view. |
| `createThread` fails | Alert user: "Failed to create new conversation. Try again." |

## Edge Cases & States

### Empty states
- First visit, no threads exist: ChatPanel auto-calls `createThread()`, shows "Ask me about crypto, prediction markets, or news."
- User clicks `+` while panel is open: creates new thread, clears messages, shows welcome message.
- Thread list in localStorage: starts empty, grows on each `+` click, never cleared automatically.

### Loading states
- `getThreadState()` in progress: messages area shows "Loading..."
- Waiting for first SSE token: show blinking cursor on an empty assistant bubble.

### Multi-tab
- Two tabs: each manages its own `threadId` state in memory. localStorage thread list is shared but each tab reads it on mount. No conflict prevention — acceptable.

### CSS variable coupling
- All colors use existing globals: `--bg`, `--surface`, `--border`, `--muted`, `--accent`, `--text`.
- No new CSS variables defined.
- Font: inherits from body (Geist).

## Tests

All tests follow TDD: write failing test first, then implement.

### `chat-store.test.ts` (pure, no mocking needed)
- `getThreadIds()` returns empty array when localStorage is empty
- `getThreadIds()` returns parsed array
- `addThreadId()` appends to existing list
- `addThreadId()` works on first call (no existing key)

### `chat-client.test.ts` (mock `fetch`)
- `createThread()` returns thread ID on success
- `createThread()` throws on HTTP error
- `getThreadState()` returns messages array
- `streamChat()` yields tokens from valid SSE stream
- `streamChat()` skips events that aren't `messages` type
- `streamChat()` skips chunks where content is empty (tool calls)
- `streamChat()` aborts on signal

### `ChatPanel.test.tsx` (React Testing Library, mock chat-client and chat-store)
- Renders welcome message when no thread/messages
- Renders message bubbles for user and assistant
- Calls streamChat on form submit, appends tokens
- Disables send button while streaming
- Clicking `+` creates new thread and clears messages
- Switching thread dropdown loads history
- Shows loading state while fetching history

---

## Layout Integration

`ChatWidget` is rendered in `app/layout.tsx` as a sibling of `<Topbar />`, outside `<div .app-layout>`, because it uses `position: fixed` and must not be constrained by any layout container:

```tsx
<body>
  <LanguageProvider>
    <Topbar />
    <div className="app-layout">{children}</div>
    <ChatWidget />  // fixed position, z-index 300
  </LanguageProvider>
</body>
```

## Implementation Order

1. `lib/chat-store.ts` — pure, test-first, simplest module
2. `lib/chat-client.ts` — pure async, mock fetch in tests
3. `app/ChatPanel.tsx` — React component, mock dependencies
4. `app/ChatWidget.tsx` — thin shell, integration
5. Wire into `app/layout.tsx`
