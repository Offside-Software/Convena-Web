import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Calendar, CheckCircle, LayoutDashboard, Menu, X, LogIn, LogOut } from 'lucide-react'
import { Button } from '../common/Button.tsx'
import { Badge } from '../common/Badge.tsx'
import { authService } from '../../services/auth.service.ts'
import type { User } from '../../types/user.ts'
import { BrandLogo } from '../common/BrandLogo.tsx'

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
  }, [isLoggedIn, location.pathname])

  // Non-logged in users ONLY see: Explore events and Verify certificate
  const publicNavLinks = [
    { label: 'Explore Events', path: '/events', icon: <Calendar size={16} /> },
    { label: 'Verify Certificate', path: '/verify', icon: <CheckCircle size={16} /> },
  ]

  const isActive = (path: string) => {
    if (path === '/events' && (location.pathname === '/events' || location.pathname.startsWith('/events/'))) return true
    if (path === '/verify' && location.pathname.startsWith('/verify')) return true
    return false
  }

  const handleLogout = () => {
    authService.logout()
    setIsLoggedIn(false)
    setUser(null)
    setMobileMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 bg-[#000000]/95 backdrop-blur-md border-b border-[#202020]">
      <div className="max-w-[1280px] mx-auto py-3.5 px-4 sm:px-6 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="no-underline">
          <BrandLogo />
        </Link>

        {/* Public Desktop Navigation: ONLY Explore Events & Verify Certificate */}
        <nav className="hidden md:flex items-center gap-1">
          {publicNavLinks.map((link) => {
            const active = isActive(link.path)
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`inline-flex items-center gap-2 font-['Montserrat',sans-serif] font-semibold text-xs tracking-wide py-2 px-4 rounded-full transition-all duration-200 no-underline ${
                  active
                    ? 'bg-[#202020] text-[#CFFE06] border border-[#3D3D3D]'
                    : 'text-[#9C9C9C] hover:text-white hover:bg-[#151515]'
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              {/* Dedicated Admin Workspace Button */}
              <Link to="/dashboard" className="no-underline">
                <Button
                  variant="accent"
                  size="sm"
                  icon={<LayoutDashboard size={15} />}
                  className="hidden sm:inline-flex"
                >
                  Admin Workspace
                </Button>
              </Link>

              {/* Admin Profile Chip */}
              <Link to="/dashboard" className="no-underline hidden md:flex items-center gap-2.5 px-2.5 py-1 bg-[#151515] border border-[#3D3D3D] rounded-full hover:border-[#CFFE06]/40 transition-colors">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-[#202020] text-[#CFFE06] flex items-center justify-center font-bold text-xs">
                    {(user?.name || user?.username || 'A').charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="font-['Montserrat',sans-serif] font-semibold text-xs text-white max-w-[110px] truncate">
                  {user?.name || user?.username || 'Admin'}
                </span>
                <Badge variant="accent" className="text-[10px] py-0 px-2">
                  ADMIN
                </Badge>
              </Link>

              {/* Logout Button */}
              <button
                type="button"
                onClick={handleLogout}
                title="Keluar"
                className="p-2 rounded-full bg-[#151515] border border-[#3D3D3D] text-[#9C9C9C] hover:text-[#DF00D0] hover:border-[#DF00D0]/50 transition-colors cursor-pointer"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link to="/login" className="no-underline">
                <Button variant="accent" size="sm" icon={<LogIn size={15} />}>
                  Login
                </Button>
              </Link>
              <Link to="/register" className="hidden sm:inline-flex no-underline">
                <Button variant="outline" size="sm">
                  Register
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="p-2 rounded-full bg-[#151515] border border-[#3D3D3D] text-[#9C9C9C] hover:text-white md:hidden cursor-pointer"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="bg-[#151515] border-t border-[#202020] p-4 flex flex-col gap-2 md:hidden">
          {publicNavLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 font-['Montserrat',sans-serif] font-semibold text-sm py-2.5 px-4 rounded-xl no-underline transition-colors ${
                isActive(link.path)
                  ? 'bg-[#202020] text-[#CFFE06] border border-[#3D3D3D]'
                  : 'text-[#9C9C9C] hover:text-white hover:bg-[#202020]'
              }`}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          ))}

          {isLoggedIn ? (
            <div className="pt-2 border-t border-[#202020] flex flex-col gap-2">
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="no-underline"
              >
                <Button variant="accent" fullWidth icon={<LayoutDashboard size={16} />}>
                  Admin Workspace
                </Button>
              </Link>
              <Button
                variant="outline"
                fullWidth
                icon={<LogOut size={16} />}
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          ) : (
            <div className="pt-2 border-t border-[#202020] flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="no-underline"
              >
                <Button variant="accent" fullWidth icon={<LogIn size={16} />}>
                  Login
                </Button>
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="no-underline"
              >
                <Button variant="outline" fullWidth>
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
