import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Calendar, CheckCircle, LayoutDashboard, LogIn, LogOut, Menu, PlusCircle, X } from 'lucide-react'
import { Button } from '../common/Button.tsx'
import { Badge } from '../common/Badge.tsx'
import { MemphisShape } from '../shapes/MemphisShape.tsx'
import { authService } from '../../services/auth.service.ts'
import type { User } from '../../types/user.ts'

export const Navbar: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(() => authService.getStoredUser())

  useEffect(() => {
    const syncAuth = () => {
      setCurrentUser(authService.getStoredUser())
    }
    window.addEventListener('convena-auth-changed', syncAuth)
    window.addEventListener('storage', syncAuth)
    return () => {
      window.removeEventListener('convena-auth-changed', syncAuth)
      window.removeEventListener('storage', syncAuth)
    }
  }, [])

  const handleLogout = () => {
    authService.logout()
    setCurrentUser(null)
    navigate('/login')
  }

  const navLinks = [
    { label: 'Explore Events', path: '/events', icon: <Calendar size={18} /> },
    { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { label: 'Verify Certificate', path: '/verify', icon: <CheckCircle size={18} /> },
  ]

  const isActive = (path: string) => {
    if (path === '/events' && location.pathname === '/events') return true
    if (path === '/dashboard' && location.pathname === '/dashboard') return true
    if (path !== '/' && location.pathname.startsWith(path)) return true
    return false
  }

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: '#FFFFFF',
        borderBottom: 'var(--mem-border-thick)',
        boxShadow: '0 4px 0px rgba(18, 18, 21, 0.1)',
      }}
    >
      {/* Top micro announcement banner */}
      <div
        style={{
          backgroundColor: 'var(--mem-yellow)',
          borderBottom: '2px solid var(--mem-dark)',
          padding: '4px 1rem',
          fontSize: '0.8rem',
          fontWeight: 700,
          fontFamily: 'var(--font-display)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          overflow: 'hidden',
        }}
      >
        <span style={{ backgroundColor: 'var(--mem-pink)', color: '#fff', padding: '1px 6px', borderRadius: '4px' }}>
          NEW
        </span>
        <span>Platform Manajemen Event & Organisasi Mahasiswa Indonesia Terintegrasi</span>
        <MemphisShape type="cross" size={12} color="var(--mem-dark)" />
      </div>

      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0.75rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Brand Logo */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              backgroundColor: 'var(--mem-pink)',
              border: 'var(--mem-border)',
              borderRadius: '8px',
              boxShadow: '3px 3px 0px var(--mem-dark)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              transform: 'rotate(-3deg)',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 900,
                fontSize: '1.4rem',
                color: '#FFFFFF',
              }}
            >
              C
            </span>
            <div
              style={{
                position: 'absolute',
                top: '-6px',
                right: '-6px',
                width: '12px',
                height: '12px',
                backgroundColor: 'var(--mem-yellow)',
                border: '2px solid var(--mem-dark)',
                borderRadius: '50%',
              }}
            />
          </div>
          <div
            style={{
              marginRight: '1rem',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 900,
                fontSize: '1.6rem',
                letterSpacing: '-0.03em',
                color: 'var(--mem-dark)',
                display: 'block',
                lineHeight: 1,
              }}
            >
              CONVENA
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.65rem',
                fontWeight: 700,
                color: 'var(--mem-gray-500)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              Student Org
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => {
            const active = isActive(link.path)
            return (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  display: 'inline-flex',
                  alignItems: 'self-start',
                  height: '100%',
                  gap: '0.4rem',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  padding: '4px 0.5rem',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  border: active ? '2px solid var(--mem-dark)' : '2px solid transparent',
                  backgroundColor: active ? 'var(--mem-yellow)' : 'transparent',
                  boxShadow: active ? '2px 2px 0px var(--mem-dark)' : 'none',
                  color: 'var(--mem-dark)',
                  transition: 'all 0.15s ease',
                }}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Action CTAs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link to="/events?new=true" style={{ textDecoration: 'none' }} className="hidden md:inline-flex">
            <Button variant="pink" size="sm" icon={<PlusCircle size={16} />}>
              Buat Event
            </Button>
          </Link>

          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link to="/dashboard" style={{ textDecoration: 'none' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    minHeight: '100%',
                    gap: '0.5rem',
                    padding: '4px 8px',
                    border: 'var(--mem-border-sm)',
                    borderRadius: '8px',
                    backgroundColor: 'var(--mem-surface)',
                    boxShadow: '2px 2px 0px var(--mem-dark)',
                    cursor: 'pointer',
                  }}
                >
                  <img
                    src={
                      currentUser.avatarUrl ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80'
                    }
                    alt={currentUser.name}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      border: '1.5px solid var(--mem-dark)',
                      objectFit: 'cover',
                    }}
                  />
                  <span
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                    }}
                    className="hidden md:inline"
                  >
                    {currentUser.name.split(' ')[0]}
                  </span>
                  <Badge variant="cyan" style={{ fontSize: '0.65rem', padding: '1px 5px' }}>
                    {currentUser.role.toUpperCase()}
                  </Badge>
                </div>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                title="Keluar / Ganti Akun"
                style={{
                  padding: '6px 8px',
                  backgroundColor: 'var(--mem-bg)',
                  border: 'var(--mem-border-sm)',
                  borderRadius: '8px',
                  boxShadow: '2px 2px 0px var(--mem-dark)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <Button
                variant={location.pathname === '/login' ? 'cyan' : 'yellow'}
                size="sm"
                icon={<LogIn size={16} />}
              >
                Masuk
              </Button>
            </Link>
          )}

          {/* Mobile hamburger button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            style={{
              padding: '6px',
              backgroundColor: 'var(--mem-yellow)',
              border: 'var(--mem-border-sm)',
              borderRadius: '6px',
              boxShadow: '2px 2px 0px var(--mem-dark)',
              cursor: 'pointer',
            }}
            className="md:hidden"
          >
            {mobileMenuOpen ? <X size={22} strokeWidth={2.5} /> : <Menu size={22} strokeWidth={2.5} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderTop: 'var(--mem-border)',
            padding: '1rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem',
          }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '1rem',
                padding: '0.65rem 1rem',
                borderRadius: '8px',
                border: '2px solid var(--mem-dark)',
                backgroundColor: isActive(link.path) ? 'var(--mem-yellow)' : 'var(--mem-bg)',
                boxShadow: '3px 3px 0px var(--mem-dark)',
                color: 'var(--mem-dark)',
                textDecoration: 'none',
              }}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          ))}
          <Link
            to="/login"
            onClick={() => setMobileMenuOpen(false)}
            style={{ textDecoration: 'none' }}
          >
            <Button variant="yellow" fullWidth icon={<LogIn size={18} />}>
              {currentUser ? 'Ganti Akun / Login' : 'Masuk Akun'}
            </Button>
          </Link>
          <Link
            to="/events?new=true"
            onClick={() => setMobileMenuOpen(false)}
            style={{ textDecoration: 'none' }}
          >
            <Button variant="pink" fullWidth icon={<PlusCircle size={18} />}>
              Buat Event Baru
            </Button>
          </Link>
        </div>
      )}
    </header>
  )
}
