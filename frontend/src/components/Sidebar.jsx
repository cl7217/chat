import React from 'react'

export default function Sidebar({ users }) {
  return (
    <aside className="sidebar">
      <h4>Users</h4>
      <div className="users-list">
        {users.map(u=> (
          <div key={u.id} className="user">
            <div className="avatar">{u.username?.charAt(0).toUpperCase()}</div>
            <div className="meta">{u.username}</div>
          </div>
        ))}
      </div>
    </aside>
  )
}
