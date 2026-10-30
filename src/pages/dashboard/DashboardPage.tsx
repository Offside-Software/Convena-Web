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
import { CreateEventModal } from './components/CreateEventModal.tsx'
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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
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
        eventsService.getMyEvents().then((myEvents) => {
          if (!isMounted) return
          if (myEvents.length > 0) {
            setEvents(myEvents)
          } else {
            eventsService.getEvents().then((allEvts) => {
              if (isMounted) setEvents(allEvts.slice(0, 3))
            })
          }
        })

        financeService.getBudgetSummary('evt-arkavidia-2026').then((b) => {
          if (isMounted) setBudget(b)
        })

        sponsorshipService.getLeads().then((l) => {
          if (isMounted) setLeads(l)
        })
      }
    })

    return () => {
      isMounted = false
    }
  }, [])

  const handleEventCreated = (newEvent: Event) => {
    setEvents((prev) => [newEvent, ...prev])
  }

  if (authLoading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-2 border-[#CFFE06] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="font-semibold text-xs text-[#9C9C9C]">
          Memeriksa sesi pengguna...
        </p>
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
              ADMIN WORKSPACE
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
          <Button
            variant="accent"
            size="md"
            icon={<Plus size={16} />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Buat Event Baru
          </Button>
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
                <Button
                  variant="accent"
                  size="sm"
                  icon={<Plus size={15} />}
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  Buat Event Pertama
                </Button>
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
                        src={evt.bannerUrl}
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

                    <Link to={`/events/${evt.id}`} className="no-underline">
                      <Button variant="outline" size="sm" icon={<ArrowUpRight size={14} />}>
                        Kelola
                      </Button>
                    </Link>
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
          <Card headerColor="dark" headerTitle="Realisasi Anggaran Arkavidia">
            {budget && (
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
                    max={budget.totalBudgetPlanned}
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
                          max={c.plannedAmount}
                          color={c.spentAmount >= c.plannedAmount ? 'purple' : 'accent'}
                          showPercentage={false}
                          height={6}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5">
                  <Link to="/dashboard/finances" className="no-underline">
                    <Button variant="outline" fullWidth size="sm">
                      Buka Rincian SPJ & Kuitansi →
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Modal: Create Event */}
      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onEventCreated={handleEventCreated}
      />
    </div>
  )
}
