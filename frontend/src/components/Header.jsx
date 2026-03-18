import React from 'react'

export default function Header({ connected, user, onLogout, usersCount }) {
  return (
    <header className="top">
      <div className="inner">
        <div className="title">Realtime Chat <span style={{color: connected ? '#10b981' : '#9ca3af'}}>{connected ? '●' : '○'}</span></div>
        <div className="user">
          {user?.username}
          <button className="btn btn-ghost" onClick={onLogout} style={{marginLeft:8}}>Logout</button>
        </div>
      </div>
    </header>
  )
}
