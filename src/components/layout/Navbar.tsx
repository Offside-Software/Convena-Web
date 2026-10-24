import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Calendar, CheckCircle, LayoutDashboard, Menu, PlusCircle, X, LogIn, LogOut } from 'lucide-react'
import { Button } from '../common/Button.tsx'
import { Badge } from '../common/Badge.tsx'
import { MemphisShape } from '../shapes/MemphisShape.tsx'
import { authService } from '../../services/auth.service.ts'
import type { User } from '../../types/user.ts'

export const Navbar: React.FC = () => {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(() => authService.isAuthenticated())
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    let isMounted = true
    if (isLoggedIn) {
      authService.getCurrentUser().then((u) => {
        if (!isMounted) return
        if (u) {
          setUser(u)
        } else {
          setIsLoggedIn(false)
          setUser(null)
        }
      })
    }
    return () => {
      isMounted = false
    }
  }, [isLoggedIn])

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
          <div style={{
            marginRight: "1rem"
          }}>
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
                  height: "100%",
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
          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              <Link to="/dashboard" className="no-underline">
                <div className="flex items-center gap-2 px-2.5 py-1.5 border-2 border-mem-dark rounded-lg bg-white shadow-mem-sm hover:bg-gray-50 transition-all cursor-pointer">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-7 h-7 rounded-md border border-mem-dark object-cover"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-md border border-mem-dark bg-mem-yellow flex items-center justify-center font-display font-black text-xs text-mem-dark">
                      {(user?.name || user?.username || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="hidden md:inline font-display font-bold text-xs text-mem-dark max-w-[120px] truncate">
                    {user?.name || user?.username || 'Pengguna'}
                  </span>
                  <Badge variant="cyan" style={{ fontSize: '0.65rem', padding: '1px 5px' }}>
                    {user?.role ? user.role.toUpperCase() : 'MEMBER'}
                  </Badge>
                </div>
              </Link>
              <button
                type="button"
                onClick={() => {
                  authService.logout()
                  setIsLoggedIn(false)
                  setUser(null)
                }}
                title="Keluar"
                className="hidden md:flex p-1.5 bg-mem-bg hover:bg-red-50 border-2 border-mem-dark rounded-md shadow-mem-sm hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 transition-all cursor-pointer text-mem-dark hover:text-red-600"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="no-underline">
                <Button variant="cyan" size="sm" icon={<LogIn size={15} />}>
                  Masuk
                </Button>
              </Link>
              <Link to="/register" className="hidden sm:inline-flex no-underline">
                <Button variant="yellow" size="sm">
                  Daftar
                </Button>
              </Link>
            </div>
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
            to="/events?new=true"
            onClick={() => setMobileMenuOpen(false)}
            style={{ textDecoration: 'none', marginTop: '0.5rem' }}
          >
            <Button variant="pink" fullWidth icon={<PlusCircle size={18} />}>
              Buat Event Baru
            </Button>
          </Link>

          {!isLoggedIn ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.25rem' }}>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                style={{ textDecoration: 'none' }}
              >
                <Button variant="cyan" fullWidth icon={<LogIn size={18} />}>
                  Masuk ke Akun
                </Button>
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                style={{ textDecoration: 'none' }}
              >
                <Button variant="yellow" fullWidth>
                  Daftar Akun Baru
                </Button>
              </Link>
            </div>
          ) : (
            <Button
              variant="outline"
              fullWidth
              icon={<LogOut size={18} />}
              onClick={() => {
                authService.logout()
                setIsLoggedIn(false)
                setMobileMenuOpen(false)
              }}
              style={{ marginTop: '0.25rem' }}
            >
              Keluar Akun
            </Button>
          )}
        </div>
      )}
    </header>
  )
}
