import React from 'react'

export default function Header({ connected, user, onLogout, usersCount }) {
  return (
    <header className="top">
      <div className="inner">
        <div className="title">Realtime Chat {connected ? '●' : '○'}</div>
        <div className="user">{user?.username} <button onClick={onLogout}>Logout</button></div>
      </div>
    </header>
  )
}
