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
  Lock,
  LogIn,
  UserPlus,
  ShieldAlert,
  CalendarCheck
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
        // Fetch user's real events from database
        eventsService.getMyEvents().then((myEvents) => {
          if (!isMounted) return
          if (myEvents.length > 0) {
            setEvents(myEvents)
          } else {
            // Fallback to public events if user hasn't created one yet
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

  // 1. Loading State
  if (authLoading) {
    return (
      <div className="py-24 text-center">
        <div className="w-12 h-12 border-4 border-[#121215] border-t-[#FFE600] rounded-full animate-spin mx-auto mb-4" />
        <p className="font-['Space_Grotesk',sans-serif] font-bold text-sm text-[#121215]">
          Memeriksa sesi pengguna...
        </p>
      </div>
    )
  }

  // 2. Unauthenticated State: Hide entire dashboard and event creation
  if (!currentUser) {
    return (
      <div className="py-12 px-4 max-w-xl mx-auto text-center">
        <div className="bg-white border-4 border-[#121215] rounded-2xl shadow-[8px_8px_0px_0px_#121215] p-8 md:p-10 relative overflow-hidden">
          <div className="inline-flex mb-4">
            <Badge variant="pink" tilt="left" icon={<ShieldAlert size={14} />}>
              AKSES TERBATAS
            </Badge>
          </div>

          <div className="w-16 h-16 bg-[#FFE600] border-3 border-[#121215] rounded-2xl shadow-[4px_4px_0px_0px_#121215] flex items-center justify-center mx-auto mb-5">
            <Lock size={32} className="text-[#121215]" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-['Space_Grotesk',sans-serif] font-black text-[#121215] mb-3">
            Masuk untuk Mengakses Dashboard
          </h2>

          <p className="text-sm sm:text-base text-gray-600 mb-8 leading-relaxed">
            Dashboard panitia, pembukuan anggaran SPJ, dan pembuatan event baru hanya dapat diakses setelah Anda masuk ke akun Convena.
          </p>

          <div className="flex flex-col sm:flex-row gap-3.5 justify-center">
            <Link to="/login" className="no-underline">
              <Button variant="yellow" size="lg" icon={<LogIn size={18} />}>
                Masuk ke Akun
              </Button>
            </Link>
            <Link to="/register" className="no-underline">
              <Button variant="cyan" size="lg" icon={<UserPlus size={18} />}>
                Daftar Akun Baru
              </Button>
            </Link>
          </div>

          <div className="mt-8 pt-4 border-t-2 border-gray-100">
            <Link to="/" className="text-xs text-gray-500 hover:text-[#121215] underline font-bold">
              ← Kembali ke Halaman Utama
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // 3. Authenticated Dashboard State
  const totalAttendees = events.reduce((sum, e) => sum + e.attendeeCount, 0)
  const totalSponsorValue = leads
    .filter((l) => l.stage === 'committed' || l.stage === 'paid')
    .reduce((sum, l) => sum + l.value, 0)

  return (
    <div>
      {/* Header Bar */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <Badge variant="cyan" tilt="left">
              ORGANIZER OVERVIEW
            </Badge>
            <span className="text-xs font-bold text-gray-500">
              Halo, <span className="text-[#121215]">{currentUser.displayName || currentUser.name}</span>
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-['Space_Grotesk',sans-serif] font-black text-[#121215] m-0">
            Dashboard Panitia Ormawa
          </h1>
          <p className="text-gray-500 text-sm sm:text-base mt-1">
            Pantau performa kegiatan, realisasi anggaran SPJ, dan kemitraan sponsorship.
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="pink"
            size="md"
            icon={<Plus size={18} />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Buat Event Baru
          </Button>
          <Link to="/dashboard/finances" className="no-underline">
            <Button variant="yellow" size="md" icon={<Receipt size={18} />}>
              Catat SPJ
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Primary Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="Total Pendaftar"
          value={totalAttendees.toLocaleString('id-ID')}
          change="+18.4%"
          isPositive={true}
          icon={<Users size={20} />}
          accentColor="yellow"
          subtitle="dari target 1.750"
        />

        <StatCard
          title="Sponsor Terkumpul"
          value={`Rp ${(totalSponsorValue / 1000000).toFixed(1)} jt`}
          change="3 Deal Baru"
          isPositive={true}
          icon={<Sparkles size={20} />}
          accentColor="pink"
          subtitle="Pipeline aktif Rp 100 jt"
        />

        <StatCard
          title="Realisasi Pengeluaran"
          value={budget ? `Rp ${(budget.totalExpenseRealized / 1000000).toFixed(1)} jt` : 'Rp 0'}
          change={`${budget ? Math.round((budget.totalExpenseRealized / budget.totalBudgetPlanned) * 100) : 0}%`}
          isPositive={true}
          icon={<DollarSign size={20} />}
          accentColor="cyan"
          subtitle="dari pagu anggaran"
        />

        <StatCard
          title="Kuitansi SPJ Pending"
          value={budget?.pendingSpjCount || 0}
          change="Perlu review"
          isPositive={false}
          icon={<Receipt size={20} />}
          accentColor="purple"
          subtitle="Bendahara HMIF"
        />
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-6">
        {/* Left Column: Active Events Management */}
        <div className="flex flex-col gap-6">
          <Card headerColor="yellow" headerTitle="Event Aktif Kepengurusan">
            {events.length === 0 ? (
              <div className="p-8 text-center bg-gray-50/50 rounded-xl border-2 border-dashed border-gray-200">
                <CalendarCheck size={36} className="text-gray-400 mx-auto mb-2" />
                <h4 className="font-['Space_Grotesk',sans-serif] font-black text-sm text-[#121215] mb-1">
                  Belum Ada Event Aktif
                </h4>
                <p className="text-xs text-gray-500 mb-4">
                  Buat event pertama Anda sekarang untuk mulai mengelola tiket, anggaran, dan sponsorship.
                </p>
                <Button
                  variant="pink"
                  size="sm"
                  icon={<Plus size={16} />}
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  Buat Event Pertama
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {events.map((evt) => (
                  <div
                    key={evt.id}
                    className="flex items-center justify-between p-3.5 border-2 border-[#121215] rounded-xl bg-white shadow-[2px_2px_0px_0px_#121215]"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={evt.bannerUrl}
                        alt=""
                        className="w-12 h-12 rounded-lg border-2 border-[#121215] object-cover"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-[#121215]">{evt.title}</span>
                          {evt.myRole && (
                            <Badge
                              variant={evt.myRole === 'owner' ? 'pink' : evt.myRole === 'admin' ? 'yellow' : 'mint'}
                              className="text-[10px] py-0.5 px-2 capitalize"
                            >
                              {evt.myRole}
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
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
              <div className="p-5 bg-[#FF94BE] border-2 border-[#121215] rounded-xl shadow-[4px_4px_0px_0px_#121215] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all flex items-center gap-3.5 cursor-pointer">
                <Sparkles size={28} className="text-[#FF4B91] shrink-0" />
                <div>
                  <h4 className="text-sm font-['Space_Grotesk',sans-serif] font-black text-[#121215] m-0">
                    Sponsorship CRM
                  </h4>
                  <p className="m-0 text-xs text-[#121215]">
                    Buka kanban pipeline mitra
                  </p>
                </div>
              </div>
            </Link>

            <Link to="/verify" className="no-underline">
              <div className="p-5 bg-[#FFF585] border-2 border-[#121215] rounded-xl shadow-[4px_4px_0px_0px_#121215] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all flex items-center gap-3.5 cursor-pointer">
                <FileCheck size={28} className="text-[#121215] shrink-0" />
                <div>
                  <h4 className="text-sm font-['Space_Grotesk',sans-serif] font-black text-[#121215] m-0">
                    Validasi Sertifikat
                  </h4>
                  <p className="m-0 text-xs text-[#121215]">
                    Cek kode sertifikat publik
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Right Column: Financial Burn Rate & SPJ Audit Status */}
        <div className="flex flex-col gap-6">
          <Card headerColor="cyan" headerTitle="Anggaran & Realisasi Arkavidia 9.0">
            {budget && (
              <div>
                <div className="mb-5">
                  <div className="flex justify-between text-xs sm:text-sm mb-1">
                    <span className="font-bold text-[#121215]">
                      Total Pagu: Rp {budget.totalBudgetPlanned.toLocaleString('id-ID')}
                    </span>
                    <span className="text-[#FF4B91] font-black">
                      Rp {budget.totalExpenseRealized.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <ProgressBar
                    value={budget.totalExpenseRealized}
                    max={budget.totalBudgetPlanned}
                    color="pink"
                    striped
                    height={14}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Sisa Anggaran Tersedia: Rp {budget.remainingBudget.toLocaleString('id-ID')}
                  </div>
                </div>

                <div className="border-t-2 border-dashed border-gray-200 pt-4">
                  <h4 className="text-xs font-['Space_Grotesk',sans-serif] font-black text-[#121215] mb-3 uppercase tracking-wider">
                    Alokasi per Pos Biaya
                  </h4>
                  <div className="flex flex-col gap-2.5">
                    {budget.categories.map((c) => (
                      <div key={c.category}>
                        <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                          <span>{c.label}</span>
                          <span>Rp {(c.spentAmount / 1000000).toFixed(1)} jt</span>
                        </div>
                        <ProgressBar
                          value={c.spentAmount}
                          max={c.plannedAmount}
                          color={c.spentAmount >= c.plannedAmount ? 'pink' : 'cyan'}
                          showPercentage={false}
                          height={8}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5">
                  <Link to="/dashboard/finances" className="no-underline">
                    <Button variant="cyan" fullWidth size="sm">
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
