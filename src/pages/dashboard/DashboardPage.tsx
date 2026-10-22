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
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <Badge variant="cyan" tilt="left" style={{ marginBottom: '0.4rem' }}>
            ORGANIZER OVERVIEW
          </Badge>
          <h1 style={{ fontSize: '2.4rem', margin: 0 }}>Dashboard Panitia Ormawa</h1>
          <p style={{ color: 'var(--mem-gray-500)', margin: '4px 0 0' }}>
            Pantau performa kegiatan, realisasi anggaran SPJ, dan kemitraan sponsorship.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/events?new=true" style={{ textDecoration: 'none' }}>
            <Button variant="pink" size="md" icon={<Plus size={18} />}>
              Event Baru
            </Button>
          </Link>
          <Link to="/dashboard/finances" style={{ textDecoration: 'none' }}>
            <Button variant="yellow" size="md" icon={<Receipt size={18} />}>
              Catat SPJ
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Primary Metric Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card headerColor="yellow" headerTitle="Event Aktif Kepengurusan">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {events.map((evt) => (
                <div
                  key={evt.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem',
                    border: '2px solid var(--mem-dark)',
                    borderRadius: '8px',
                    backgroundColor: 'var(--mem-surface)',
                    boxShadow: '2px 2px 0px var(--mem-dark)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img
                      src={evt.bannerUrl}
                      alt=""
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '6px',
                        border: '1.5px solid var(--mem-dark)',
                        objectFit: 'cover',
                      }}
                    />
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{evt.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--mem-gray-500)' }}>
                        {evt.attendeeCount} / {evt.totalCapacity} Tiket Terbit
                      </div>
                    </div>
                  </div>

                  <Link to={`/events/${evt.id}`} style={{ textDecoration: 'none' }}>
                    <Button variant="outline" size="sm" icon={<ArrowUpRight size={14} />}>
                      Kelola
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Action Tiles */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
            }}
          >
            <Link to="/dashboard/sponsorship" style={{ textDecoration: 'none' }}>
              <div
                className="memphis-box"
                style={{
                  padding: '1.25rem',
                  backgroundColor: 'var(--mem-pink-light)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  cursor: 'pointer',
                }}
              >
                <Sparkles size={28} style={{ color: 'var(--mem-pink)' }} />
                <div>
                  <h4 style={{ fontSize: '1rem', margin: 0 }}>Sponsorship CRM</h4>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--mem-dark)' }}>
                    Buka kanban pipeline mitra
                  </p>
                </div>
              </div>
            </Link>

            <Link to="/verify" style={{ textDecoration: 'none' }}>
              <div
                className="memphis-box"
                style={{
                  padding: '1.25rem',
                  backgroundColor: 'var(--mem-yellow-light)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  cursor: 'pointer',
                }}
              >
                <FileCheck size={28} style={{ color: 'var(--mem-dark)' }} />
                <div>
                  <h4 style={{ fontSize: '1rem', margin: 0 }}>Validasi Sertifikat</h4>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--mem-dark)' }}>
                    Cek kode sertifikat publik
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Right Column: Financial Burn Rate & SPJ Audit Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card headerColor="cyan" headerTitle="Anggaran & Realisasi Arkavidia 9.0">
            {budget && (
              <div>
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700 }}>Total Pagu: Rp {budget.totalBudgetPlanned.toLocaleString('id-ID')}</span>
                    <span style={{ color: 'var(--mem-pink)', fontWeight: 800 }}>
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
                  <div style={{ fontSize: '0.8rem', color: 'var(--mem-gray-500)', marginTop: '4px' }}>
                    Sisa Anggaran Tersedia: Rp {budget.remainingBudget.toLocaleString('id-ID')}
                  </div>
                </div>

                <div style={{ borderTop: '2px dashed var(--mem-gray-200)', paddingTop: '1rem' }}>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
                    Alokasi per Pos Biaya
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {budget.categories.map((c) => (
                      <div key={c.category}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600 }}>
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

                <div style={{ marginTop: '1.25rem' }}>
                  <Link to="/dashboard/finances" style={{ textDecoration: 'none' }}>
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
