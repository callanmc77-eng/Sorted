import { useState } from 'react'
import { useAdminStore } from '@/store/adminStore'

export function AdminLoginForm() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [failed, setFailed] = useState(false)
  const { login } = useAdminStore()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const ok = login(username, password)
    if (!ok) {
      setFailed(true)
      setPassword('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {failed && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          Incorrect username or password.
        </p>
      )}
      <label className="flex flex-col gap-1">
        <span className="text-xs text-navy-muted font-medium">Username</span>
        <input
          type="text"
          value={username}
          autoComplete="username"
          onChange={(e) => { setUsername(e.target.value); setFailed(false) }}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-navy
                     focus:outline-none focus:ring-2 focus:ring-navy/20"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs text-navy-muted font-medium">Password</span>
        <input
          type="password"
          value={password}
          autoComplete="current-password"
          onChange={(e) => { setPassword(e.target.value); setFailed(false) }}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-navy
                     focus:outline-none focus:ring-2 focus:ring-navy/20"
        />
      </label>
      <button
        type="submit"
        className="w-full py-2.5 bg-navy text-white rounded-lg text-sm font-semibold
                   hover:bg-navy/90 transition-colors mt-1"
      >
        Sign in
      </button>
    </form>
  )
}
