import React, { useEffect, useMemo, useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Sparkles,
  DollarSign,
  Calendar,
  ShieldCheck,
  Building2,
  PaintBucket,
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
  const { sidebarLinks } = useMemo(() => {
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
        icon: <LayoutDashboard size={15} />,
        visible: true,
      },
      {
        label: 'Organisasi & RBAC',
        path: '/dashboard/organization',
        icon: <Building2 size={15} />,
        visible: canAccessOrg,
      },
      {
        label: 'Kelola Event',
        path: '/dashboard/events',
        icon: <Calendar size={15} />,
        visible: canAccessEvents,
      },
      {
        label: 'Task Panitia',
        path: '/dashboard/tasks',
        icon: <ListTodo size={15} />,
        visible: canAccessTasks,
      },
      {
        label: 'Sponsorship Pipeline',
        path: '/dashboard/sponsorship',
        icon: <Sparkles size={15} />,
        visible: canAccessSponsorship,
      },
      {
        label: 'Anggaran & SPJ',
        path: '/dashboard/finances',
        icon: <DollarSign size={15} />,
        visible: canAccessFinances,
      },
      {
        label: 'Design Sertifikat',
        path: '/dashboard/certificate',
        icon: <PaintBucket size={15} />,
        visible: canAccessCertificates,
      },
      {
        label: 'Validasi Sertifikat',
        path: '/dashboard/verify',
        icon: <ShieldCheck size={15} />,
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
    authService.logout()
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
        <aside className="hidden md:flex w-60 bg-[#151515] border-r border-[#202020] flex-col justify-between p-3.5">
          <div className="space-y-3.5">
            <div className="pb-3 border-b border-[#202020] flex items-center justify-between">
              <div className="h-5 w-28 bg-[#262626] rounded" />
              <div className="w-2 h-2 rounded-full bg-[#262626]" />
            </div>
            <div className="space-y-1.5 pt-1">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-8 w-full bg-[#202020] rounded-full" />
              ))}
            </div>
          </div>
          <div className="pt-3 border-t border-[#202020]">
            <div className="h-10 w-full bg-[#202020] rounded-lg" />
          </div>
        </aside>

        {/* Main Content Skeleton */}
        <div className="flex-1 flex flex-col">
          <header className="hidden md:flex items-center justify-between py-2 px-5 bg-[#000000] border-b border-[#202020]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#151515]" />
              <div className="h-3.5 w-24 bg-[#242424] rounded" />
            </div>
          </header>
          <main className="p-4 sm:p-5 flex-1 space-y-4">
            <div className="h-6 w-56 bg-[#202020] rounded-lg" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 bg-[#151515] border border-[#262626] rounded-xl" />
              ))}
            </div>
            <div className="h-56 bg-[#151515] border border-[#262626] rounded-xl" />
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col md:flex-row font-['Montserrat',sans-serif]">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between px-3.5 py-2.5 bg-[#151515] border-b border-[#202020] sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg bg-[#202020] text-white border border-[#3D3D3D] cursor-pointer"
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <BrandLogo size="sm" />
        </div>
        <Badge variant="accent" className="text-[10px] py-0 px-2">Workspace</Badge>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen z-50 w-60 bg-[#151515] border-r border-[#202020] flex flex-col justify-between p-3.5 overflow-y-auto transition-transform duration-200 ease-in-out md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col gap-3.5">
          {/* Logo & Workspace Title */}
          <div className="flex items-center justify-between pb-3 border-b border-[#202020]">
            <div className="min-w-0 pr-2">
              <BrandLogo size="sm" />
            </div>
            <span className="w-2 h-2 shrink-0 rounded-full bg-[#CFFE06] shadow-[0_0_8px_#CFFE06]" />
          </div>

          {/* Nav Items */}
          <div>
            <nav className="flex flex-col gap-1">
              {sidebarLinks.map((item) => {
                const active = isCurrent(item.path)
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    style={active ? { backgroundColor: '#CFFE06', color: '#000000' } : undefined}
                    className={`flex items-center gap-2.5 px-3 py-1.5 rounded-full no-underline font-semibold text-xs transition-all duration-150 ${
                      active
                        ? '!bg-[#CFFE06] !text-[#000000] font-bold shadow-[0_0_12px_rgba(207,254,6,0.22)]'
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
                      className={`truncate ${active ? '!text-[#000000] font-bold' : ''}`}
                    >
                      {item.label}
                    </span>
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Quick Assistant Card */}
          <div className="mt-1 p-3 bg-[#202020] border border-[#3D3D3D]/50 rounded-lg">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#CFFE06] mb-1">
              <Sparkles size={13} />
              <span>AI LPJ & SPJ Ready</span>
            </div>
            <p className="m-0 !text-[11px] !text-[#9C9C9C] !leading-snug">
              Kuitansi SPJ otomatis direkap ke dalam draf LPJ kegiatan secara instan.
            </p>
          </div>
        </div>

        {/* Sidebar Footer: Profile & Logout */}
        <div className="pt-3 mt-3 border-t border-[#202020] flex flex-col gap-2">
          <div className="flex items-center gap-2.5 p-1.5 px-2 rounded-lg bg-[#202020] border border-[#3D3D3D]/40">
            {currentUser?.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover border border-[#CFFE06] shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#151515] border border-[#CFFE06] text-[#CFFE06] flex items-center justify-center font-bold text-xs shrink-0">
                {(currentUser?.name || 'A').charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white truncate leading-tight">
                {currentUser?.name || 'Arya Pratama'}
              </div>
              <div className="text-[10px] text-[#9C9C9C] truncate leading-tight mt-0.5">
                {currentUser?.company || 'Telkom University'}
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              title="Keluar Akun"
              className="p-1.5 rounded-full bg-[#151515] text-[#9C9C9C] hover:text-[#DF00D0] hover:bg-[#DF00D0]/10 transition-colors flex items-center justify-center cursor-pointer shrink-0"
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
        <header className="hidden md:flex items-center justify-between py-2 px-5 bg-[#000000] border-b border-[#202020]">
          <div className="flex items-center gap-2.5">
            <Link
              to="/"
              className="w-7 h-7 rounded-full bg-[#151515] border border-[#3D3D3D] flex items-center justify-center text-[#9C9C9C] hover:text-[#CFFE06] transition-colors no-underline"
              title="Kembali ke Beranda"
            >
              <ChevronLeft size={15} />
            </Link>
            <div>
              <p className="!text-xs font-bold !text-white tracking-tight m-0 !leading-none">
                Workspace
              </p>
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="p-4 sm:p-5 flex-1 bg-[#000000]">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
