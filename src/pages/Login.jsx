import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { login, useAuth, DEMO_PASSCODE } from '../data/auth'

export default function Login() {
  const nav = useNavigate()
  const loc = useLocation()
  const isVolunteer = useAuth()
  const [passcode, setPasscode] = useState('')
  const [error, setError] = useState('')
  const from = loc.state?.from && loc.state.from !== '/login' ? loc.state.from : '/dashboard'

  if (isVolunteer) {
    return (
      <div className="card" style={{ maxWidth: 420, margin: '2rem auto' }}>
        <h1>You're logged in</h1>
        <p className="subtitle">You have volunteer access.</p>
        <button className="btn primary" onClick={() => nav('/dashboard')}>
          Go to dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="card" style={{ maxWidth: 420, margin: '2rem auto' }}>
      <h1>Volunteer login</h1>
      <p className="subtitle">
        Browsing is open to everyone. Adding books, checking out, and the dashboard need a
        volunteer passcode.
      </p>
      {error && <div className="notice error">{error}</div>}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const res = login(passcode)
          if (res.ok) nav(from, { replace: true })
          else setError(res.error)
        }}
      >
        <div className="field">
          <label>Passcode</label>
          <input
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="Volunteer passcode"
            autoFocus
          />
        </div>
        <button className="btn primary" type="submit">
          Log in
        </button>
      </form>
      <div className="notice info" style={{ marginTop: '1.25rem', marginBottom: 0 }}>
        <strong>Prototype:</strong> the passcode is <code className="mono">{DEMO_PASSCODE}</code>. Real
        volunteer accounts (Supabase Auth) come later.
      </div>
    </div>
  )
}
