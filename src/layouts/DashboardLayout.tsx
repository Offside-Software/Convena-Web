import React, { useEffect, useMemo, useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Sparkles,
  DollarSign,
  Calendar,
  ShieldCheck,
  Building2,
  LogOut,
  ListTodo,
  ChevronLeft,
  Menu,
  X,
} from 'lucide-react'
import { authService } from '../services/auth.service.ts'
import { organizationService } from '../services/organization.service.ts'
import { eventsService } from '../services/events.service.ts'
import type { User } from '../types/user.ts'
import type { Organization } from '../types/organization.ts'
import type { Event } from '../types/event.ts'
import { BrandLogo } from '../components/common/BrandLogo.tsx'
import { Badge } from '../components/common/Badge.tsx'

export const DashboardLayout: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [userOrgs, setUserOrgs] = useState<Organization[]>([])
  const [myEvents, setMyEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    let isMounted = true
    Promise.all([
      authService.getCurrentUser(),
      organizationService.getOrganizations().catch(() => [] as Organization[]),
      eventsService.getMyEvents().catch(() => [] as Event[]),
    ]).then(([u, orgs, evts]) => {
      if (!isMounted) return
      if (u) {
        setCurrentUser(u)
        setUserOrgs(orgs)
        setMyEvents(evts)
        setLoading(false)
      } else {
        navigate('/login', { replace: true })
      }
    })
    return () => {
      isMounted = false
    }
  }, [location.pathname, navigate])

  // Aggregate permissions across user's organizations and event roles
  const { sidebarLinks, roleSummaryLabel } = useMemo(() => {
    const orgPerms = new Set<string>()
    const orgRoleNames = new Set<string>()
    for (const org of userOrgs) {
      if (org.myRole) orgRoleNames.add(org.myRole.toLowerCase())
      for (const p of org.myPermissions || []) {
        orgPerms.add(p)
      }
    }

    const eventRoles = new Set<string>()
    for (const ev of myEvents) {
      if (ev.myRole) eventRoles.add(ev.myRole.toLowerCase())
    }

    const isOwnerOrAdmin =
      orgRoleNames.has('owner') ||
      orgRoleNames.has('admin') ||
      eventRoles.has('owner') ||
      eventRoles.has('admin')

    const canAccessOrg =
      isOwnerOrAdmin ||
      userOrgs.length === 0 ||
      orgPerms.has('org:view') ||
      orgPerms.has('org:manage_members') ||
      orgPerms.has('org:manage_roles')

    const canAccessEvents =
      isOwnerOrAdmin ||
      orgPerms.has('event:create') ||
      orgPerms.has('event:edit') ||
      orgPerms.has('event:manage_team') ||
      eventRoles.has('committee')

    const canAccessTasks =
      isOwnerOrAdmin ||
      orgPerms.has('event:edit') ||
      orgPerms.has('event:manage_team') ||
      eventRoles.has('committee') ||
      eventRoles.has('treasurer') ||
      eventRoles.has('sponsor')

    const canAccessSponsorship =
      isOwnerOrAdmin ||
      orgPerms.has('sponsor:view') ||
      orgPerms.has('sponsor:manage') ||
      eventRoles.has('sponsor') ||
      eventRoles.has('committee')

    const canAccessFinances =
      isOwnerOrAdmin ||
      orgPerms.has('finance:view') ||
      orgPerms.has('finance:manage_budget') ||
      orgPerms.has('finance:submit_expense') ||
      orgPerms.has('finance:audit_spj') ||
      eventRoles.has('treasurer') ||
      eventRoles.has('committee')

    const canAccessCertificates =
      isOwnerOrAdmin ||
      orgPerms.has('cert:issue') ||
      orgPerms.has('cert:verify') ||
      eventRoles.has('committee')

    const allLinks = [
      {
        label: 'Dashboard Overview',
        path: '/dashboard',
        icon: <LayoutDashboard size={18} />,
        visible: true,
      },
      {
        label: 'Organisasi & RBAC',
        path: '/dashboard/organization',
        icon: <Building2 size={18} />,
        visible: canAccessOrg,
      },
      {
        label: 'Kelola Event',
        path: '/dashboard/events',
        icon: <Calendar size={18} />,
        visible: canAccessEvents,
      },
      {
        label: 'Task Panitia',
        path: '/dashboard/tasks',
        icon: <ListTodo size={18} />,
        visible: canAccessTasks,
      },
      {
        label: 'Sponsorship Pipeline',
        path: '/dashboard/sponsorship',
        icon: <Sparkles size={18} />,
        visible: canAccessSponsorship,
      },
      {
        label: 'Anggaran & SPJ',
        path: '/dashboard/finances',
        icon: <DollarSign size={18} />,
        visible: canAccessFinances,
      },
      {
        label: 'Validasi Sertifikat',
        path: '/dashboard/verify',
        icon: <ShieldCheck size={18} />,
        visible: canAccessCertificates,
      },
    ]

    const primaryOrg = userOrgs[0]
    const primaryEventRole = myEvents[0]?.myCustomTitle || myEvents[0]?.myRole
    const summary = primaryOrg
      ? `${primaryOrg.myRoleDisplay || primaryOrg.myRole || 'Member'} • ${primaryOrg.name}`
      : primaryEventRole
        ? `Panitia (${primaryEventRole})`
        : 'Anggota Workspace'

    return {
      sidebarLinks: allLinks.filter((link) => link.visible),
      roleSummaryLabel: summary,
    }
  }, [userOrgs, myEvents])

  const handleLogout = async () => {
    await authService.logout()
    navigate('/')
  }

  const isCurrent = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard'
    }
    return location.pathname.startsWith(path)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000000] text-white flex flex-col md:flex-row font-['Montserrat',sans-serif] animate-pulse">
        {/* Sidebar Skeleton */}
        <aside className="hidden md:flex w-72 bg-[#151515] border-r border-[#202020] flex-col justify-between p-5">
          <div className="space-y-6">
            <div className="pb-4 border-b border-[#202020] space-y-2">
              <div className="h-6 w-32 bg-[#262626] rounded" />
              <div className="h-3 w-20 bg-[#202020] rounded" />
            </div>
            <div className="space-y-2.5 pt-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-10 w-full bg-[#202020] rounded-full" />
              ))}
            </div>
          </div>
          <div className="pt-4 border-t border-[#202020]">
            <div className="h-12 w-full bg-[#202020] rounded-xl" />
          </div>
        </aside>

        {/* Main Content Skeleton */}
        <div className="flex-1 flex flex-col">
          <header className="hidden md:flex items-center justify-between py-4 px-8 bg-[#000000] border-b border-[#202020]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#151515]" />
              <div className="space-y-1.5">
                <div className="h-4 w-28 bg-[#242424] rounded" />
                <div className="h-3 w-64 bg-[#1c1c1c] rounded" />
              </div>
            </div>
          </header>
          <main className="p-4 sm:p-6 lg:p-8 flex-1 space-y-6">
            <div className="h-8 w-72 bg-[#202020] rounded-lg" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-28 bg-[#151515] border border-[#262626] rounded-xl" />
              ))}
            </div>
            <div className="h-72 bg-[#151515] border border-[#262626] rounded-xl" />
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col md:flex-row font-['Montserrat',sans-serif]">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#151515] border-b border-[#202020] sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg bg-[#202020] text-white border border-[#3D3D3D] cursor-pointer"
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <BrandLogo />
        </div>
        <Badge variant="accent">Workspace</Badge>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen z-50 w-72 bg-[#151515] border-r border-[#202020] flex flex-col justify-between p-5 transition-transform duration-200 ease-in-out md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col gap-6">
          {/* Logo & Workspace Title */}
          <div className="flex items-center justify-between pb-4 border-b border-[#202020]">
            <div className="min-w-0 pr-2">
              <BrandLogo />
              <div
                className="text-[11px] font-semibold text-[#CFFE06] mt-1 truncate"
                title={roleSummaryLabel}
              >
                {roleSummaryLabel}
              </div>
            </div>
            <span className="w-2.5 h-2.5 shrink-0 rounded-full bg-[#CFFE06] shadow-[0_0_8px_#CFFE06]" />
          </div>

          {/* Nav Items */}
          <div className="pt-2">
            <div className="text-[11px] font-bold text-[#9C9C9C] uppercase tracking-wider mb-3 px-3">
              Menu Sesuai Role
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
          <div className="mt-4 p-4 bg-[#202020] border border-[#3D3D3D]/50 rounded-xl">
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
                {currentUser?.company || 'Telkom University'}
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              title="Keluar Akun"
              className="py-2 px-2 rounded-full bg-[#202020] text-[11px] text-[#9C9C9C] hover:text-[#DF00D0] hover:bg-[#DF00D0]/10 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <LogOut size={13} />
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

      {/* Main Workspace Content */}
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
              <p className="text-m font-bold !text-white tracking-tight m-0">
                Workspace
              </p>
              <p className="text-xs text-[#9C9C9C] m-0">
                Pusat kendali kegiatan, sponsorship, dan keuangan organisasi ({roleSummaryLabel})
              </p>
            </div>
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
