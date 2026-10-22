import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { Navbar } from '../components/layout/Navbar.tsx'
import { Footer } from '../components/layout/Footer.tsx'
import { LayoutDashboard, Sparkles, DollarSign, Calendar, ShieldCheck } from 'lucide-react'

export const DashboardLayout: React.FC = () => {
  const location = useLocation()

  const sidebarLinks = [
    { label: 'Ringkasan Organisasi', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { label: 'Sponsorship Pipeline', path: '/dashboard/sponsorship', icon: <Sparkles size={18} /> },
    { label: 'Anggaran & SPJ', path: '/dashboard/finances', icon: <DollarSign size={18} /> },
    { label: 'Kelola Event', path: '/events', icon: <Calendar size={18} /> },
    { label: 'Validasi Sertifikat', path: '/verify', icon: <ShieldCheck size={18} /> },
  ]

  const isCurrent = (path: string) => {
    if (path === '/dashboard' && location.pathname === '/dashboard') return true
    if (path !== '/dashboard' && location.pathname === path) return true
    return false
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--mem-bg)' }}>
      <Navbar />

      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          width: '100%',
          padding: '1.5rem',
          flexGrow: 1,
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6 items-start">
          {/* Dashboard Left Sidebar */}
          <aside
            className="memphis-box"
            style={{
              padding: '1.25rem',
              backgroundColor: '#FFFFFF',
              position: 'sticky',
              top: '90px',
            }}
          >
            <div style={{ paddingBottom: '1rem', marginBottom: '1rem', borderBottom: '2px dashed var(--mem-gray-200)' }}>
              <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--mem-gray-500)', textTransform: 'uppercase' }}>
                Ruang Kerja Ormawa
              </div>
              <h3 style={{ fontSize: '1.1rem', margin: '2px 0 0' }}>HMIF ITB</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--mem-pink)', fontWeight: 700 }}>Kepengurusan 2026/2027</span>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {sidebarLinks.map((item) => {
                const active = isCurrent(item.path)
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      fontFamily: 'var(--font-display)',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      color: 'var(--mem-dark)',
                      backgroundColor: active ? 'var(--mem-yellow)' : 'transparent',
                      border: active ? '2px solid var(--mem-dark)' : '2px solid transparent',
                      boxShadow: active ? '2px 2px 0px var(--mem-dark)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>

            <div
              style={{
                marginTop: '1.5rem',
                padding: '0.85rem',
                backgroundColor: 'var(--mem-cyan-light)',
                border: '2px solid var(--mem-dark)',
                borderRadius: '8px',
                fontSize: '0.8rem',
              }}
            >
              <div style={{ fontWeight: 800, marginBottom: '4px' }}>⚡ Bantuan LPJ AI</div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--mem-dark)' }}>
                Draf laporan pertanggungjawaban kegiatan Anda otomatis terkompilasi dari data kuitansi SPJ.
              </p>
            </div>
          </aside>

          {/* Main Outlet Area */}
          <section style={{ minWidth: 0 }}>
            <Outlet />
          </section>
        </div>
      </div>

      <Footer />
    </div>
  )
}
