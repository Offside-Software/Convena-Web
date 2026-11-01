import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Calendar, CheckCircle, LayoutDashboard, Menu, X, LogIn, LogOut } from 'lucide-react'
import { Button } from '../common/Button.tsx'
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
            <div className="flex items-center gap-2.5">
              {/* Combined Workspace & Username Pill: Shows Username normally, transforms to Workspace on hover */}
              <Link
                to="/dashboard"
                title="Buka Workspace"
                className="group relative inline-flex items-center gap-2 py-1.5 pl-2 pr-3.5 bg-[#151515] border border-[#3D3D3D] hover:border-[#CFFE06] hover:bg-[#CFFE06] rounded-full transition-all duration-200 no-underline cursor-pointer hover:shadow-[0_0_15px_rgba(207,254,6,0.3)] select-none"
              >
                {/* Avatar / Dashboard Icon Badge */}
                <div className="relative w-6 h-6 rounded-full overflow-hidden shrink-0 flex items-center justify-center bg-[#202020] text-[#CFFE06] font-bold text-xs group-hover:bg-black transition-colors">
                  <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-150 group-hover:opacity-0">
                    {user?.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.name || user.username || 'User'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>
                        {(user?.name || user?.username || 'U').charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                    <LayoutDashboard size={13} className="text-[#CFFE06]" />
                  </div>
                </div>

                {/* Shared Grid Cell for Username & Workspace: Preserves max width across hover states */}
                <div className="grid grid-cols-1 grid-rows-1 min-w-0 items-center">
                  {/* Default state: Username */}
                  <span className="col-start-1 row-start-1 font-['Montserrat',sans-serif] font-semibold text-xs text-white transition-opacity duration-150 group-hover:opacity-0 truncate max-w-[150px] pointer-events-none select-none">
                    {user?.name || user?.username || 'User'}
                  </span>

                  {/* Hover state: Workspace */}
                  <span className="col-start-1 row-start-1 font-['Montserrat',sans-serif] font-bold text-xs text-black transition-opacity duration-150 opacity-0 group-hover:opacity-100 flex items-center justify-center pointer-events-none select-none whitespace-nowrap">
                    Workspace
                  </span>
                </div>
              </Link>

              {/* Logout Button */}
              <button
                type="button"
                onClick={handleLogout}
                title="Keluar"
                className="p-2 rounded-full bg-[#151515] border border-[#3D3D3D] text-[#9C9C9C] hover:text-[#DF00D0] hover:border-[#DF00D0]/50 transition-colors cursor-pointer hidden sm:flex items-center justify-center"
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
                  Workspace
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
