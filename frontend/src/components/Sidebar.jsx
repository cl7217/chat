import React from 'react'

export default function Sidebar({ users }) {
  return (
    <aside className="sidebar">
      <h4>Users</h4>
      <ul>
        {users.map(u=> <li key={u.id}>{u.username}</li>)}
      </ul>
    </aside>
  )
}
