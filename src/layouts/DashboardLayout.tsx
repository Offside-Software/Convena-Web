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
    <div className="flex flex-col min-h-screen bg-[#FAF9F6]">
      <Navbar />

      <div className="max-w-[1280px] mx-auto w-full p-4 sm:p-6 grow">
        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6 items-start">
          {/* Dashboard Left Sidebar */}
          <aside className="p-5 bg-white border-2 border-[#121215] rounded-xl shadow-[4px_4px_0px_0px_#121215] sticky top-[90px]">
            <div className="pb-4 mb-4 border-b-2 border-dashed border-gray-200">
              <div className="text-xs font-mono text-gray-500 uppercase tracking-wider">
                Ruang Kerja Ormawa
              </div>
              <h3 className="text-lg font-['Space_Grotesk',sans-serif] font-black text-[#121215] mt-0.5">
                HMIF ITB
              </h3>
              <span className="text-xs text-[#FF4B91] font-bold">Kepengurusan 2026/2027</span>
            </div>

            <nav className="flex flex-col gap-1.5">
              {sidebarLinks.map((item) => {
                const active = isCurrent(item.path)
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg no-underline font-['Space_Grotesk',sans-serif] font-bold text-sm transition-all ${
                      active
                        ? 'bg-[#FFE600] border-2 border-[#121215] shadow-[2px_2px_0px_0px_#121215] text-[#121215]'
                        : 'border-2 border-transparent text-[#121215] hover:bg-gray-100'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>

            <div className="mt-6 p-3.5 bg-[#70E7FF] border-2 border-[#121215] rounded-xl text-xs shadow-[2px_2px_0px_0px_#121215]">
              <div className="font-extrabold text-[#121215] mb-1">⚡ Bantuan LPJ AI</div>
              <p className="m-0 text-[11px] text-[#121215] leading-relaxed">
                Draf laporan pertanggungjawaban kegiatan Anda otomatis terkompilasi dari data kuitansi SPJ.
              </p>
            </div>
          </aside>

          {/* Main Outlet Area */}
          <section className="min-w-0">
            <Outlet />
          </section>
        </div>
      </div>

      <Footer />
    </div>
  )
}
