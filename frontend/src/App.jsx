import React, { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import ChatWindow from './components/ChatWindow'
import Login from './components/Login'

export default function App() {
  const [connected, setConnected] = useState(false)
  const [user, setUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [users, setUsers] = useState([])
  const socketRef = useRef(null)

  useEffect(() => {
    async function getSession() {
      try {
        const resp = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/me`, { credentials: 'include' })
        if (!resp.ok) return
        const data = await resp.json()
        if (data.user) setUser(data.user)
      } catch (err) {
        console.error('session check failed', err)
      }
    }
    getSession()
  }, [])

  useEffect(() => {
    if (!user) return
    const backend = import.meta.env.VITE_API_URL || ''
    const socket = io(backend, { path: '/socket.io', withCredentials: true })
    socketRef.current = socket

    socket.on('connect', () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))
    // initial messages (filter out system notifications)
    socket.on('messages', (ms) => setMessages(ms.filter(m => !(m.user && (m.user.username === 'System' || m.user.username === 'anon' && !m.text)))) )
    // single new message (ignore system join/leave)
    socket.on('message', (m) => {
      if (!m || !m.text) return
      if (m.user && m.user.username === 'System') return
      setMessages(prev => [...prev, m])
    })
    socket.on('users', (list) => setUsers(list))

    // ensure no-op handlers for legacy system events so they won't add chat messages
    socket.on('user-joined', () => {})
    socket.on('user-left', () => {})

    socket.emit('join', user)

    return () => socket.disconnect()
  }, [user])

  async function handleLogin(u) { setUser(u) }
  async function handleLogout() {
    try { await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/logout`, { method: 'POST', credentials: 'include' }) } catch (e) {}
    setUser(null)
    if (socketRef.current) { socketRef.current.disconnect(); socketRef.current = null }
  }

  function sendMessage(text) {
    if (!socketRef.current) return
    socketRef.current.emit('chat-message', { text })
  }

  if (!user) return <Login onLogin={handleLogin} />

  return (
    <div className="app">
      <Header connected={connected} user={user} onLogout={handleLogout} usersCount={users.length} />
      <div className="main">
        <ChatWindow messages={messages} user={user} onSend={sendMessage} />
        <Sidebar users={users} />
      </div>
    </div>
  )
}
