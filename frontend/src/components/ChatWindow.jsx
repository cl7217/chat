import React, { useRef, useEffect } from 'react'

export default function ChatWindow({ messages, user, onSend }) {
  const endRef = useRef()
  const inputRef = useRef()

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  function send() {
    const text = inputRef.current.value.trim()
    if (!text) return
    onSend(text)
    inputRef.current.value = ''
  }

  return (
    <main className="chat-window">
      <div className="messages">
        {messages.map(m=> (
          <div key={m.id} className={`msg ${user && m.user && user.id === m.user.id ? 'me' : 'other'}`}>
            <div className="meta">{m.user?.username} · {new Date(m.createdAt).toLocaleTimeString()}</div>
            <div className="text">{m.text}</div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="composer">
        <input ref={inputRef} placeholder="Type a message" />
        <button onClick={send}>Send</button>
      </div>
    </main>
  )
}
