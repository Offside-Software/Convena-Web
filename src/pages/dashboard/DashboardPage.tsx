import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  DollarSign,
  Sparkles,
  Receipt,
  Plus,
  ArrowUpRight,
  FileCheck,
  CalendarCheck,
} from 'lucide-react'
import { StatCard } from '../../components/domain/StatCard.tsx'
import { Card } from '../../components/common/Card.tsx'
import { Button } from '../../components/common/Button.tsx'
import { Badge } from '../../components/common/Badge.tsx'
import { ProgressBar } from '../../components/common/ProgressBar.tsx'
import { authService } from '../../services/auth.service.ts'
import { eventsService } from '../../services/events.service.ts'
import { financeService } from '../../services/finance.service.ts'
import { sponsorshipService } from '../../services/sponsorship.service.ts'
import type { Event } from '../../types/event.ts'
import type { User } from '../../types/user.ts'
import type { EventBudgetSummary } from '../../types/finance.ts'
import type { SponsorLead } from '../../types/sponsorship.ts'

export const DashboardPage: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [dataLoading, setDataLoading] = useState(true)
  const [events, setEvents] = useState<Event[]>([])
  const [budget, setBudget] = useState<EventBudgetSummary | null>(null)
  const [leads, setLeads] = useState<SponsorLead[]>([])

  useEffect(() => {
    let isMounted = true

    authService.getCurrentUser().then((user) => {
      if (!isMounted) return
      setCurrentUser(user)
      setAuthLoading(false)

      if (user) {
        const loadEventsAndBudget = async () => {
          try {
            let activeEvents = await eventsService.getMyEvents()
            if (activeEvents.length === 0) {
              const allEvts = await eventsService.getEvents()
              activeEvents = allEvts.slice(0, 3)
            }
            if (!isMounted) return
            setEvents(activeEvents)

            if (activeEvents.length > 0) {
              const b = await financeService.getBudgetSummary(activeEvents[0].id)
              if (isMounted) setBudget(b)
            }
          } catch {
            // ignore error
          }
        }

        Promise.all([
          loadEventsAndBudget(),
          sponsorshipService.getLeads().then((l) => {
            if (isMounted) setLeads(l)
          }),
        ]).finally(() => {
          if (isMounted) setDataLoading(false)
        })
      } else {
        setDataLoading(false)
      }
    })

    return () => {
      isMounted = false
    }
  }, [])

  if (authLoading || dataLoading) {
    return (
      <div className="font-['Montserrat',sans-serif] bg-[#000000] text-white space-y-8 animate-pulse">
        {/* Header Bar Skeleton */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="h-5 w-24 bg-[#242424] rounded-full" />
              <div className="h-4 w-36 bg-[#202020] rounded" />
            </div>
            <div className="h-8 w-72 sm:w-96 bg-[#262626] rounded-lg" />
            <div className="h-4 w-64 sm:w-[440px] bg-[#1c1c1c] rounded" />
          </div>
          <div className="flex gap-2.5">
            <div className="h-10 w-40 bg-[#262626] rounded-full" />
            <div className="h-10 w-32 bg-[#202020] rounded-full" />
          </div>
        </div>

        {/* 4 Metric Stat Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-5 bg-[#151515] border border-[#262626] rounded-xl space-y-3"
            >
              <div className="flex justify-between items-center">
                <div className="h-3.5 w-28 bg-[#242424] rounded" />
                <div className="w-8 h-8 rounded-lg bg-[#242424]" />
              </div>
              <div className="h-7 w-32 bg-[#262626] rounded" />
              <div className="h-3 w-36 bg-[#202020] rounded" />
            </div>
          ))}
        </div>

        {/* Two Column Section Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6">
          <div className="space-y-6">
            <div className="bg-[#151515] border border-[#262626] rounded-xl overflow-hidden">
              <div className="px-6 py-4 bg-[#202020] border-b border-[#262626]">
                <div className="h-5 w-48 bg-[#2c2c2c] rounded" />
              </div>
              <div className="p-6 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3.5 border border-[#262626] rounded-xl bg-[#181818]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-[#262626]" />
                      <div className="space-y-2">
                        <div className="h-4 w-48 bg-[#262626] rounded" />
                        <div className="h-3 w-36 bg-[#202020] rounded" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-8 w-24 bg-[#242424] rounded-full" />
                      <div className="h-8 w-20 bg-[#242424] rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="p-5 bg-[#151515] border border-[#262626] rounded-xl flex items-center gap-3.5"
                >
                  <div className="w-10 h-10 rounded-full bg-[#242424] shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-36 bg-[#262626] rounded" />
                    <div className="h-3 w-44 bg-[#202020] rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#151515] border border-[#262626] rounded-xl overflow-hidden">
            <div className="px-6 py-4 bg-[#202020] border-b border-[#262626]">
              <div className="h-5 w-56 bg-[#2c2c2c] rounded" />
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <div className="h-3 w-32 bg-[#242424] rounded" />
                  <div className="h-3 w-28 bg-[#242424] rounded" />
                </div>
                <div className="h-2 w-full bg-[#262626] rounded-full" />
                <div className="h-3 w-40 bg-[#202020] rounded" />
              </div>
              <div className="pt-4 border-t border-[#262626] space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between">
                      <div className="h-3 w-36 bg-[#242424] rounded" />
                      <div className="h-3 w-20 bg-[#242424] rounded" />
                    </div>
                    <div className="h-1.5 w-full bg-[#262626] rounded-full" />
                  </div>
                ))}
              </div>
              <div className="h-9 w-full bg-[#242424] rounded-full mt-4" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!currentUser) return null

  const totalAttendees = events.reduce((sum, e) => sum + e.attendeeCount, 0)
  const totalSponsorValue = leads
    .filter((l) => l.stage === 'committed' || l.stage === 'paid')
    .reduce((sum, l) => sum + l.value, 0)

  return (
    <div className="font-['Montserrat',sans-serif] bg-[#000000] text-white">
      {/* Header Bar */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Badge variant="accent">
              WORKSPACE
            </Badge>
            <span className="text-xs text-[#9C9C9C]">
              Halo, <span className="text-white font-bold">{currentUser.displayName || currentUser.name}</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight m-0">
            Ringkasan Manajemen Ormawa
          </h1>
          <p className="text-xs sm:text-sm text-[#9C9C9C] mt-1">
            Pantau kinerja kegiatan, serapan anggaran SPJ kuitansi, dan kesepakatan sponsorship.
          </p>
        </div>

        <div className="flex gap-2.5">
          <Link to="/dashboard/events/create" className="no-underline">
            <Button
              variant="accent"
              size="md"
              icon={<Plus size={16} />}
            >
              Buat Event Baru
            </Button>
          </Link>
          <Link to="/dashboard/finances" className="no-underline">
            <Button variant="outline" size="md" icon={<Receipt size={16} />}>
              Catat SPJ
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Primary Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Pendaftar"
          value={totalAttendees.toLocaleString('id-ID')}
          change="+18.4%"
          isPositive={true}
          icon={<Users size={18} />}
          subtitle="dari target 1.750"
        />

        <StatCard
          title="Sponsor Terkumpul"
          value={`Rp ${(totalSponsorValue / 1000000).toFixed(1)} jt`}
          change="3 Deal Baru"
          isPositive={true}
          icon={<Sparkles size={18} />}
          subtitle="Pipeline aktif Rp 100 jt"
        />

        <StatCard
          title="Realisasi Pengeluaran"
          value={budget ? `Rp ${(budget.totalExpenseRealized / 1000000).toFixed(1)} jt` : 'Rp 0'}
          change={`${budget ? Math.round((budget.totalExpenseRealized / budget.totalBudgetPlanned) * 100) : 0}%`}
          isPositive={true}
          icon={<DollarSign size={18} />}
          subtitle="dari pagu anggaran"
        />

        <StatCard
          title="Kuitansi SPJ Pending"
          value={budget?.pendingSpjCount || 0}
          change="Perlu review"
          isPositive={false}
          icon={<Receipt size={18} />}
          subtitle="Bendahara Organisasi"
        />
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6">
        {/* Left Column: Active Events Management */}
        <div className="space-y-6">
          <Card headerColor="dark" headerTitle="Event Aktif Kepengurusan">
            {events.length === 0 ? (
              <div className="p-8 text-center bg-[#151515] rounded-xl border border-dashed border-[#3D3D3D]">
                <CalendarCheck size={36} className="text-[#9C9C9C] mx-auto mb-2" />
                <h4 className="font-bold text-sm text-white mb-1">
                  Belum Ada Event Aktif
                </h4>
                <p className="text-xs text-[#9C9C9C] mb-4">
                  Buat event pertama Anda sekarang untuk mulai mengelola tiket, anggaran, dan sponsorship.
                </p>
                <Link to="/dashboard/events/create" className="no-underline">
                  <Button
                    variant="accent"
                    size="sm"
                    icon={<Plus size={15} />}
                  >
                    Buat Event Pertama
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {events.map((evt) => (
                  <div
                    key={evt.id}
                    className="flex items-center justify-between p-3.5 border border-[#3D3D3D]/50 rounded-xl bg-[#151515] hover:border-[#CFFE06]/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={evt.bannerUrl || ''}
                        alt=""
                        className="w-12 h-12 rounded-lg border border-[#3D3D3D] object-cover"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">{evt.title}</span>
                          {evt.myRole && (
                            <Badge
                              variant="accent"
                              className="text-[10px] py-0.5 px-2 capitalize"
                            >
                              {evt.myRole}
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-[#9C9C9C] mt-0.5">
                          {evt.attendeeCount} / {evt.totalCapacity} Tiket Terbit • {evt.category}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link to={`/dashboard/finances?eventId=${evt.id}`} className="no-underline">
                        <Button variant="outline" size="sm" icon={<Receipt size={14} />}>
                          RAB & SPJ
                        </Button>
                      </Link>
                      <Link to={`/events/${evt.id}`} className="no-underline">
                        <Button variant="outline" size="sm" icon={<ArrowUpRight size={14} />}>
                          Kelola
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Quick Action Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link to="/dashboard/sponsorship" className="no-underline">
              <div className="p-5 bg-[#151515] border border-[#3D3D3D]/60 rounded-xl hover:border-[#CFFE06]/50 transition-colors flex items-center gap-3.5 cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-[#202020] text-[#CFFE06] flex items-center justify-center shrink-0">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white m-0">
                    Sponsorship CRM
                  </h4>
                  <p className="m-0 text-xs text-[#9C9C9C] mt-0.5">
                    Buka kanban pipeline mitra
                  </p>
                </div>
              </div>
            </Link>

            <Link to="/dashboard/verify" className="no-underline">
              <div className="p-5 bg-[#151515] border border-[#3D3D3D]/60 rounded-xl hover:border-[#CFFE06]/50 transition-colors flex items-center gap-3.5 cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-[#202020] text-[#CFFE06] flex items-center justify-center shrink-0">
                  <FileCheck size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white m-0">
                    Validasi Sertifikat
                  </h4>
                  <p className="m-0 text-xs text-[#9C9C9C] mt-0.5">
                    Validasi sertifikat di workspace
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Right Column: Financial Burn Rate & SPJ Audit Status */}
        <div className="space-y-6">
          <Card
            headerColor="dark"
            headerTitle={
              events[0]
                ? `Realisasi Anggaran: ${events[0].title}`
                : 'Realisasi Anggaran Event'
            }
          >
            {budget ? (
              <div>
                <div className="mb-5">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-[#9C9C9C]">
                      Pagu: Rp {budget.totalBudgetPlanned.toLocaleString('id-ID')}
                    </span>
                    <span className="text-[#CFFE06] font-bold">
                      Rp {budget.totalExpenseRealized.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <ProgressBar
                    value={budget.totalExpenseRealized}
                    max={budget.totalBudgetPlanned || 1}
                    color="accent"
                    height={8}
                  />
                  <div className="text-xs text-[#9C9C9C] mt-1.5">
                    Sisa Anggaran: <span className="text-white font-semibold">Rp {budget.remainingBudget.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                <div className="border-t border-[#3D3D3D]/50 pt-4">
                  <h4 className="text-xs font-bold text-white mb-3 uppercase tracking-wider">
                    Alokasi per Pos Biaya
                  </h4>
                  <div className="flex flex-col gap-3">
                    {budget.categories.map((c) => (
                      <div key={c.category}>
                        <div className="flex justify-between text-xs text-[#9C9C9C] mb-1">
                          <span>{c.label}</span>
                          <span className="text-white font-medium">Rp {(c.spentAmount / 1000000).toFixed(1)} jt</span>
                        </div>
                        <ProgressBar
                          value={c.spentAmount}
                          max={c.plannedAmount || 1}
                          color={c.plannedAmount > 0 && c.spentAmount >= c.plannedAmount ? 'purple' : 'accent'}
                          showPercentage={false}
                          height={6}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5">
                  <Link
                    to={events[0] ? `/dashboard/finances?eventId=${events[0].id}` : '/dashboard/finances'}
                    className="no-underline"
                  >
                    <Button variant="outline" fullWidth size="sm">
                      Buka Rincian SPJ & Kuitansi →
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-[#9C9C9C]">
                Pilih atau buat event terlebih dahulu untuk memantau anggaran RAB dan kuitansi SPJ.
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
