import { Routes, Route, NavLink, Link, useLocation } from 'react-router-dom'
import { useAuth, logout } from './data/auth'
import Catalog from './pages/Catalog'
import TitleDetail from './pages/TitleDetail'
import CopyDetail from './pages/CopyDetail'
import Scan from './pages/Scan'
import Intake from './pages/Intake'
import Labels from './pages/Labels'
import Checkout from './pages/Checkout'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import RequireVolunteer from './components/RequireVolunteer'

function Header() {
  const isVolunteer = useAuth()
  const loc = useLocation()
  return (
    <header className="app-header">
      <div className="app-header-inner">
        <Link to="/" className="brand">
          <span className="dot">◆</span> Gurdwara Library
        </Link>
        <nav className="nav">
          <NavLink to="/" end>
            Browse
          </NavLink>
          <NavLink to="/scan">Scan</NavLink>
          {isVolunteer && <NavLink to="/intake">Add / Donation</NavLink>}
          {isVolunteer && <NavLink to="/checkout">Checkout</NavLink>}
          {isVolunteer && <NavLink to="/dashboard">Dashboard</NavLink>}
          {isVolunteer && <NavLink to="/labels">Labels</NavLink>}
          {isVolunteer ? (
            <>
              <span className="vol-tag">Volunteer</span>
              <a
                href="#logout"
                onClick={(e) => {
                  e.preventDefault()
                  logout()
                }}
              >
                Log out
              </a>
            </>
          ) : (
            <NavLink to="/login" state={{ from: loc.pathname }}>
              Volunteer login
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  )
}

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Catalog />} />
          <Route path="/title/:titleId" element={<TitleDetail />} />
          <Route path="/copy/:copyId" element={<CopyDetail />} />
          <Route path="/scan" element={<Scan />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/intake"
            element={
              <RequireVolunteer>
                <Intake />
              </RequireVolunteer>
            }
          />
          <Route
            path="/labels"
            element={
              <RequireVolunteer>
                <Labels />
              </RequireVolunteer>
            }
          />
          <Route
            path="/checkout"
            element={
              <RequireVolunteer>
                <Checkout />
              </RequireVolunteer>
            }
          />
          <Route
            path="/dashboard"
            element={
              <RequireVolunteer>
                <Dashboard />
              </RequireVolunteer>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  )
}

function NotFound() {
  return (
    <div className="empty">
      <h1>Not found</h1>
      <p>
        <Link to="/">Back to the catalog</Link>
      </p>
    </div>
  )
}
