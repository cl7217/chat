import React, { useState, useEffect } from 'react'

export default function Login({ onLogin }) {
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    function onToken(e) {
      const token = e.detail
      if (!token) return
      fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/google`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ id_token: token }), credentials: 'include' })
        .then(r => r.json())
        .then(data => { if (data.user) onLogin(data.user); else alert(data.error || 'Google login failed') })
        .catch(() => alert('Google login failed'))
    }
    window.addEventListener('google-id-token', onToken)

    // render GSI button if available
    if (window.google && window.google.accounts && window.google.accounts.id) {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
      if (!window.__gsi_initialized) {
        window.google.accounts.id.initialize({ client_id: clientId, callback: (r) => window.dispatchEvent(new CustomEvent('google-id-token', { detail: r.credential })) })
        window.__gsi_initialized = true
      }
      const btn = document.getElementById('google-btn')
      if (btn && !btn.dataset.gsiRendered) { window.google.accounts.id.renderButton(btn, { theme: 'outline', size: 'large' }); btn.dataset.gsiRendered = '1' }
    }

    return () => window.removeEventListener('google-id-token', onToken)
  }, [onLogin])

  async function doLogin() {
    const resp = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/login`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ username: name, password }), credentials: 'include' })
    const data = await resp.json()
    if (!resp.ok) return alert(data.error || 'Login failed')
    onLogin(data.user)
  }

  async function doRegister() {
    const resp = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/register`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ username: name, password }), credentials: 'include' })
    const data = await resp.json()
    if (!resp.ok) return alert(data.error || 'Register failed')
    onLogin(data.user)
  }

  return (
    <div className="login">
      <h2>Join chat</h2>
      <input placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
      <input placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} type="password" />
      <div className="buttons">
        <button className="btn btn-primary" onClick={doLogin}>Login</button>
        <button className="btn btn-ghost" onClick={doRegister}>Register</button>
      </div>
      <div style={{height:12}} />
      <div className="center">
        <div id="google-btn" className="btn-google" />
      </div>
      <div className="note muted center">Or sign in with Google</div>
    </div>
  )
}
