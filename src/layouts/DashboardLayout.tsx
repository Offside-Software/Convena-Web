import React, { useEffect, useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Sparkles,
  DollarSign,
  Calendar,
  ShieldCheck,
  LogOut,
  ExternalLink,
  ChevronLeft,
  Menu,
  X,
  PlusCircle,
} from 'lucide-react'
import { authService } from '../services/auth.service.ts'
import type { User } from '../types/user.ts'
import { BrandLogo } from '../components/common/BrandLogo.tsx'
import { Badge } from '../components/common/Badge.tsx'
import { Button } from '../components/common/Button.tsx'

export const DashboardLayout: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    let isMounted = true
    authService.getCurrentUser().then((u) => {
      if (!isMounted) return
      if (u) {
        setCurrentUser(u)
        setLoading(false)
      } else {
        // Non logged in users cannot access admin workspace: redirect to login
        navigate('/login', { replace: true })
      }
    })
    return () => {
      isMounted = false
    }
  }, [location.pathname, navigate])

  // All workspace navigation links stay within /dashboard/*
  const sidebarLinks = [
    { label: 'Dashboard Overview', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { label: 'Kelola Event', path: '/dashboard/events', icon: <Calendar size={18} /> },
    { label: 'Sponsorship Pipeline', path: '/dashboard/sponsorship', icon: <Sparkles size={18} /> },
    { label: 'Anggaran & SPJ', path: '/dashboard/finances', icon: <DollarSign size={18} /> },
    { label: 'Validasi Sertifikat', path: '/dashboard/verify', icon: <ShieldCheck size={18} /> },
  ]

  const isCurrent = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard'
    return location.pathname === path || location.pathname.startsWith(`${path}/`)
  }

  const handleLogout = () => {
    authService.logout()
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center font-['Montserrat',sans-serif] text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-[#CFFE06] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#9C9C9C]">Memuat Admin Workspace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#000000] text-white font-['Montserrat',sans-serif] flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#151515] border-b border-[#202020] sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-full bg-[#202020] text-[#9C9C9C] hover:text-white"
          >
            <Menu size={20} />
          </button>
          <BrandLogo size="sm" />
        </div>
        <Badge variant="accent" className="text-[10px]">ADMIN</Badge>
      </div>

      {/* Admin Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-[270px] bg-[#151515] border-r border-[#202020] flex flex-col justify-between p-5 transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Workspace Header */}
          <div className="flex items-center justify-between pb-5 border-b border-[#202020]">
            <Link to="/" className="no-underline">
              <BrandLogo size="sm" />
            </Link>
            <div className="flex items-center gap-2">
              <Badge variant="accent" className="text-[10px] py-0.5 px-2">
                WORKSPACE
              </Badge>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="md:hidden text-[#9C9C9C] hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="pt-5">
            <div className="text-[11px] font-bold text-[#9C9C9C] uppercase tracking-wider mb-3 px-3">
              Admin Menu
            </div>
            <nav className="flex flex-col gap-1.5">
              {sidebarLinks.map((item) => {
                const active = isCurrent(item.path)
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    style={active ? { backgroundColor: '#CFFE06', color: '#000000' } : undefined}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-full no-underline font-semibold text-xs transition-all duration-150 ${
                      active
                        ? '!bg-[#CFFE06] !text-[#000000] font-bold shadow-[0_0_15px_rgba(207,254,6,0.25)]'
                        : 'text-[#9C9C9C] hover:text-white hover:bg-[#202020]'
                    }`}
                  >
                    <span
                      className="shrink-0 flex items-center justify-center"
                      style={active ? { color: '#000000' } : undefined}
                    >
                      {item.icon}
                    </span>
                    <span
                      style={active ? { color: '#000000', fontWeight: 'bold' } : undefined}
                      className={active ? '!text-[#000000] font-bold' : ''}
                    >
                      {item.label}
                    </span>
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Quick Assistant Card */}
          <div className="mt-6 p-4 bg-[#202020] border border-[#3D3D3D]/50 rounded-xl">
            <div className="flex items-center gap-2 text-xs font-bold text-[#CFFE06] mb-1">
              <Sparkles size={14} />
              <span>AI LPJ & SPJ Ready</span>
            </div>
            <p className="m-0 text-[11px] text-[#9C9C9C] leading-relaxed">
              Kuitansi SPJ otomatis direkap ke dalam draf LPJ kegiatan secara instan.
            </p>
          </div>
        </div>

        {/* Sidebar Footer: Profile & Logout */}
        <div className="pt-4 border-t border-[#202020] flex flex-col gap-3">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-[#202020] border border-[#3D3D3D]/40">
            {currentUser?.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-9 h-9 rounded-full object-cover border border-[#CFFE06]"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#151515] border border-[#CFFE06] text-[#CFFE06] flex items-center justify-center font-bold text-sm">
                {(currentUser?.name || 'A').charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white truncate">
                {currentUser?.name || 'Arya Pratama'}
              </div>
              <div className="text-[10px] text-[#9C9C9C] truncate">
                {currentUser?.company || currentUser?.university || 'Telkom University'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/events"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-full bg-[#202020] text-[11px] text-[#9C9C9C] hover:text-white hover:bg-[#3D3D3D] transition-colors no-underline"
            >
              <ExternalLink size={13} />
              <span>Lihat Publik</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              title="Keluar Akun"
              className="py-2 px-3 rounded-full bg-[#202020] text-[11px] text-[#9C9C9C] hover:text-[#DF00D0] hover:bg-[#DF00D0]/10 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <LogOut size={13} />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Workspace Workspace Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Workspace Top Header Bar */}
        <header className="hidden md:flex items-center justify-between py-4 px-8 bg-[#000000] border-b border-[#202020]">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="w-8 h-8 rounded-full bg-[#151515] border border-[#3D3D3D] flex items-center justify-center text-[#9C9C9C] hover:text-[#CFFE06] transition-colors no-underline"
              title="Kembali ke Beranda"
            >
              <ChevronLeft size={18} />
            </Link>
            <div>
              <h1 className="font-bold text-white tracking-tight m-0">
                Workspace
              </h1>
              <p className="text-xs text-[#9C9C9C] m-0">
                Pusat kendali kegiatan, sponsorship, dan keuangan organisasi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/events"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#151515] border border-[#3D3D3D] text-xs font-semibold text-[#9C9C9C] hover:text-white transition-colors no-underline"
            >
              <ExternalLink size={13} />
              <span>Portal Publik</span>
            </Link>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 bg-[#000000]">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
