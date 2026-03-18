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

  function onKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <main className="chat-window">
      <div className="messages">
        {messages.map((m, idx) => {
          const isMe = user && m.user && (user.id === m.user.id || user._id === m.user._id)
          const key = m.id || m._id || idx
          const time = m.createdAt ? new Date(m.createdAt).toLocaleTimeString() : ''
          const avatarLabel = m.user?.username ? m.user.username.charAt(0).toUpperCase() : '?'

          return (
            <div key={key} className={`msg ${isMe ? 'me' : 'other'}`}>
              <div className="avatar">
                {m.user?.picture
                  ? <img src={m.user.picture} alt={m.user?.username || 'avatar'} className="avatar-img" />
                  : avatarLabel
                }
              </div>

              <div className="bubble">
                <div className="text">{m.text}</div>
                <div className="meta">{m.user?.username || 'Anonymous'} · {time}</div>
              </div>
            </div>
          )
        })}
        <div ref={endRef} />
      </div>

      <div className="composer">
        <input ref={inputRef} type="text" placeholder="Type a message" onKeyDown={onKey} />
        <button className="send" onClick={send}>Send</button>
      </div>
    </main>
  )
}
