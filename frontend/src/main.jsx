import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles.css'

// Dispatch Google events when redirected back from auth code flow or id_token in URL
const params = new URLSearchParams(window.location.search)
const idToken = params.get('id_token')
const authed = params.get('authed')
if (idToken) {
  window.dispatchEvent(new CustomEvent('google-id-token', { detail: idToken }))
  params.delete('id_token')
}
if (authed) {
  window.dispatchEvent(new CustomEvent('google-authed'))
  params.delete('authed')
}
if (idToken || authed) {
  const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '') + window.location.hash
  window.history.replaceState({}, document.title, newUrl)
}

createRoot(document.getElementById('root')).render(<App />)
