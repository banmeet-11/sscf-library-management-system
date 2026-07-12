import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../data/auth'

// Gate volunteer-only routes. Public browsing stays open (planning doc §7.7).
export default function RequireVolunteer({ children }) {
  const isVolunteer = useAuth()
  const loc = useLocation()
  if (!isVolunteer) {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />
  }
  return children
}
