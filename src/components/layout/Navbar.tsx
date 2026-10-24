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
    <header className="sticky top-0 z-50 bg-white border-b-4 border-[#121215] shadow-[0_4px_0px_rgba(18,18,21,0.1)]">
      {/* Top micro announcement banner */}
      <div className="bg-[#FFE600] border-b-2 border-[#121215] py-1 px-4 text-xs font-bold font-['Space_Grotesk',sans-serif] flex items-center justify-center gap-2 overflow-hidden text-[#121215]">
        <span className="bg-[#FF4B91] text-white py-0.5 px-1.5 rounded text-[11px] font-black">
          NEW
        </span>
        <span>Platform Manajemen Event & Organisasi Mahasiswa Indonesia Terintegrasi</span>
        <MemphisShape type="cross" size={12} color="#121215" />
      </div>

      <div className="max-w-[1280px] mx-auto py-3 px-4 sm:px-6 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <div className="w-[42px] h-[42px] bg-[#FF4B91] border-2 border-[#121215] rounded-lg shadow-[3px_3px_0px_0px_#121215] flex items-center justify-center relative -rotate-3">
            <span className="font-['Space_Grotesk',sans-serif] font-black text-2xl text-white">
              C
            </span>
            <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-[#FFE600] border-2 border-[#121215] rounded-full" />
          </div>
          <div className="mr-4">
            <span className="font-['Space_Grotesk',sans-serif] font-black text-2xl tracking-tight text-[#121215] block leading-none">
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
                className={`inline-flex items-center gap-1.5 font-['Space_Grotesk',sans-serif] font-bold text-sm py-1.5 px-3 rounded-md no-underline transition-all ${
                  active
                    ? 'border-2 border-[#121215] bg-[#FFE600] shadow-[2px_2px_0px_0px_#121215] text-[#121215]'
                    : 'border-2 border-transparent text-[#121215] hover:bg-gray-100'
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Action CTAs */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              <Link to="/dashboard" className="no-underline">
                <div className="flex items-center gap-2 px-2.5 py-1.5 border-2 border-[#121215] rounded-lg bg-white shadow-[2px_2px_0px_0px_#121215] hover:bg-gray-50 transition-all cursor-pointer">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-7 h-7 rounded-md border border-[#121215] object-cover"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-md border border-[#121215] bg-[#FFE600] flex items-center justify-center font-['Space_Grotesk',sans-serif] font-black text-xs text-[#121215]">
                      {(user?.name || user?.username || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="hidden md:inline font-['Space_Grotesk',sans-serif] font-bold text-xs text-[#121215] max-w-[120px] truncate">
                    {user?.name || user?.username || 'Pengguna'}
                  </span>
                  <Badge variant="cyan">
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
                className="hidden md:flex p-1.5 bg-[#FAF9F6] hover:bg-red-50 border-2 border-[#121215] rounded-md shadow-[2px_2px_0px_0px_#121215] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 transition-all cursor-pointer text-[#121215] hover:text-red-600"
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
            className="p-1.5 bg-[#FFE600] border-2 border-[#121215] rounded-md shadow-[2px_2px_0px_0px_#121215] cursor-pointer md:hidden text-[#121215]"
          >
            {mobileMenuOpen ? <X size={22} strokeWidth={2.5} /> : <Menu size={22} strokeWidth={2.5} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="bg-white border-t-2 border-[#121215] p-4 sm:p-6 flex flex-col gap-2.5">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 font-['Space_Grotesk',sans-serif] font-bold text-base py-2.5 px-4 rounded-lg border-2 border-[#121215] shadow-[3px_3px_0px_0px_#121215] no-underline text-[#121215] ${
                isActive(link.path) ? 'bg-[#FFE600]' : 'bg-[#FAF9F6]'
              }`}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          ))}
          <Link
            to="/events?new=true"
            onClick={() => setMobileMenuOpen(false)}
            className="no-underline mt-2"
          >
            <Button variant="pink" fullWidth icon={<PlusCircle size={18} />}>
              Buat Event Baru
            </Button>
          </Link>

          {!isLoggedIn ? (
            <div className="flex flex-col gap-2 mt-1">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="no-underline"
              >
                <Button variant="cyan" fullWidth icon={<LogIn size={18} />}>
                  Masuk ke Akun
                </Button>
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="no-underline"
              >
                <Button variant="yellow" fullWidth>
                  Daftar Akun Baru
                </Button>
              </Link>
            </div>
          ) : (
            <div className="mt-1">
              <Button
                variant="outline"
                fullWidth
                icon={<LogOut size={18} />}
                onClick={() => {
                  authService.logout()
                  setIsLoggedIn(false)
                  setMobileMenuOpen(false)
                }}
              >
                Keluar Akun
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
