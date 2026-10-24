import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  DollarSign,
  Sparkles,
  Receipt,
  Plus,
  ArrowUpRight,
  FileCheck
} from 'lucide-react'
import { StatCard } from '../../components/domain/StatCard.tsx'
import { Card } from '../../components/common/Card.tsx'
import { Button } from '../../components/common/Button.tsx'
import { Badge } from '../../components/common/Badge.tsx'
import { ProgressBar } from '../../components/common/ProgressBar.tsx'
import { eventsService } from '../../services/events.service.ts'
import { financeService } from '../../services/finance.service.ts'
import { sponsorshipService } from '../../services/sponsorship.service.ts'
import type { Event } from '../../types/event.ts'
import type { EventBudgetSummary } from '../../types/finance.ts'
import type { SponsorLead } from '../../types/sponsorship.ts'

export const DashboardPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([])
  const [budget, setBudget] = useState<EventBudgetSummary | null>(null)
  const [leads, setLeads] = useState<SponsorLead[]>([])

  useEffect(() => {
    eventsService.getEvents().then(setEvents)
    financeService.getBudgetSummary('evt-arkavidia-2026').then(setBudget)
    sponsorshipService.getLeads().then(setLeads)
  }, [])

  const totalAttendees = events.reduce((sum, e) => sum + e.attendeeCount, 0)
  const totalSponsorValue = leads
    .filter((l) => l.stage === 'committed' || l.stage === 'paid')
    .reduce((sum, l) => sum + l.value, 0)

  return (
    <div>
      {/* Header Bar */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <div className="mb-1.5">
            <Badge variant="cyan" tilt="left">
              ORGANIZER OVERVIEW
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-['Space_Grotesk',sans-serif] font-black text-[#121215] m-0">
            Dashboard Panitia Ormawa
          </h1>
          <p className="text-gray-500 text-sm sm:text-base mt-1">
            Pantau performa kegiatan, realisasi anggaran SPJ, dan kemitraan sponsorship.
          </p>
        </div>

        <div className="flex gap-3">
          <Link to="/events?new=true" className="no-underline">
            <Button variant="pink" size="md" icon={<Plus size={18} />}>
              Event Baru
            </Button>
          </Link>
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
                      <div className="font-extrabold text-sm text-[#121215]">{evt.title}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {evt.attendeeCount} / {evt.totalCapacity} Tiket Terbit
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
                    <span className="font-bold text-[#121215]">Total Pagu: Rp {budget.totalBudgetPlanned.toLocaleString('id-ID')}</span>
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
    </div>
  )
}
