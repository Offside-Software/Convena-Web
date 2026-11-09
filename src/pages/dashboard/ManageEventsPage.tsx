import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus,
  Calendar,
  Users,
  MapPin,
  ArrowUpRight,
  DollarSign,
  ListTodo,
  Edit3,
  QrCode,
  UserPlus,
  X,
  RefreshCw,
  CheckCircle2,
  Copy,
  Trash2,
  Building2,
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { Button } from '../../components/common/Button.tsx'
import { Badge } from '../../components/common/Badge.tsx'
import { ProgressBar } from '../../components/common/ProgressBar.tsx'
import { SearchBar } from '../../components/common/SearchBar.tsx'
import { eventsService } from '../../services/events.service.ts'
import { organizationService } from '../../services/organization.service.ts'
import type { Event, EventRegistration } from '../../types/event.ts'
import type { EventMember, EventRole } from '../../types/membership.ts'
import type { OrgMember, Organization } from '../../types/organization.ts'

const DIVISION_OPTIONS = [
  'BPH / Inti',
  'Divisi Acara',
  'Divisi Logistik & Perlengkapan',
  'Divisi Humas & Publikasi',
  'Divisi Sponsorship & Fundraising',
  'Divisi Keuangan & SPJ',
  'Divisi IT & Multimedia',
  'Divisi Konsumsi',
  'Divisi Keamanan & Medis',
]

const ROLE_OPTIONS: Array<{ value: EventRole; label: string }> = [
  { value: 'admin', label: 'Admin Event (Wakil Ketua / BPH)' },
  { value: 'committee', label: 'Panitia Divisi (Committee)' },
  { value: 'treasurer', label: 'Bendahara Event (Treasurer)' },
  { value: 'sponsor', label: 'Tim Sponsorship (Sponsor)' },
]

export const ManageEventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([])
  const [userOrgs, setUserOrgs] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all')
  const [orgFilter, setOrgFilter] = useState<string>('all')

  // Per-Event Team & Division Assignment Modal State
  const [teamModalEvent, setTeamModalEvent] = useState<Event | null>(null)
  const [eventMembers, setEventMembers] = useState<EventMember[]>([])
  const [orgMembers, setOrgMembers] = useState<OrgMember[]>([])
  const [loadingTeam, setLoadingTeam] = useState(false)
  const [assignEmail, setAssignEmail] = useState('')
  const [assignRole, setAssignRole] = useState<EventRole>('committee')
  const [assignDivision, setAssignDivision] = useState(DIVISION_OPTIONS[1])
  const [assignTitle, setAssignTitle] = useState('')
  const [teamFeedback, setTeamFeedback] = useState<string | null>(null)

  // Per-Event Attendance QR Modal State
  const [qrModalEvent, setQrModalEvent] = useState<Event | null>(null)
  const [qrToken, setQrToken] = useState<string>('')
  const [qrPayload, setQrPayload] = useState<string>('')
  const [registrations, setRegistrations] = useState<EventRegistration[]>([])
  const [loadingQr, setLoadingQr] = useState(false)
  const [copiedQr, setCopiedQr] = useState(false)

  useEffect(() => {
    let isMounted = true
    Promise.all([
      eventsService.getMyEvents(),
      organizationService.getOrganizations().catch(() => [] as Organization[]),
    ])
      .then(async ([myEvents, orgs]) => {
        if (!isMounted) return
        setUserOrgs(orgs)
        if (myEvents && myEvents.length > 0) {
          setEvents(myEvents)
          setLoading(false)
        } else {
          const allEvents = await eventsService.getEvents().catch(() => [])
          if (!isMounted) return
          setEvents(allEvents)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!isMounted) return
        setEvents([])
        setLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

  const openTeamModal = async (evt: Event) => {
    setTeamModalEvent(evt)
    setTeamFeedback(null)
    setLoadingTeam(true)
    try {
      const targetOrgId = evt.organizationId || userOrgs[0]?.id
      const [members, orgMems] = await Promise.all([
        eventsService.getEventMembers(evt.id),
        targetOrgId
          ? organizationService.getMembers(targetOrgId).catch(() => [] as OrgMember[])
          : Promise.resolve([] as OrgMember[]),
      ])
      setEventMembers(members)
      setOrgMembers(orgMems)
      if (orgMems.length > 0 && !assignEmail) {
        setAssignEmail(orgMems[0].email)
      }
    } finally {
      setLoadingTeam(false)
    }
  }

  const handleAssignMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!teamModalEvent || !assignEmail.trim()) return
    setTeamFeedback(null)
    try {
      const res = await eventsService.addEventMember(teamModalEvent.id, {
        email: assignEmail.trim(),
        role: assignRole,
        division: assignDivision,
        customTitle: assignTitle.trim() || `${assignDivision}`,
      })
      setTeamFeedback(res.message)
      setAssignTitle('')
      const updated = await eventsService.getEventMembers(teamModalEvent.id)
      setEventMembers(updated)
    } catch (err: any) {
      setTeamFeedback(err?.message || 'Gagal menugaskan anggota ke event ini.')
    }
  }

  const handleUpdateMemberDivisionOrRole = async (
    member: EventMember,
    newRole: EventRole,
    newDivision: string
  ) => {
    if (!teamModalEvent) return
    try {
      await eventsService.updateEventMember(teamModalEvent.id, member.userId, {
        role: newRole,
        division: newDivision,
        customTitle: member.customTitle,
      })
      const updated = await eventsService.getEventMembers(teamModalEvent.id)
      setEventMembers(updated)
    } catch (err: any) {
      setTeamFeedback(err?.message || 'Gagal memperbarui divisi/role anggota.')
    }
  }

  const handleRemoveMember = async (userId: string) => {
    if (!teamModalEvent) return
    try {
      await eventsService.removeEventMember(teamModalEvent.id, userId)
      const updated = await eventsService.getEventMembers(teamModalEvent.id)
      setEventMembers(updated)
    } catch (err: any) {
      setTeamFeedback(err?.message || 'Gagal menghapus anggota dari event.')
    }
  }

  const openQrModal = async (evt: Event) => {
    setQrModalEvent(evt)
    setCopiedQr(false)
    setLoadingQr(true)
    try {
      const existingToken = evt.attendanceQrToken
      if (existingToken) {
        setQrToken(existingToken)
        setQrPayload(`CONVENA-ATTEND:${evt.id}:${existingToken}`)
      } else {
        const gen = await eventsService.generateAttendanceQr(evt.id)
        setQrToken(gen.qrToken)
        setQrPayload(gen.qrPayload)
      }
      const regs = await eventsService.getEventRegistrations(evt.id)
      setRegistrations(regs)
    } catch {
      const fallbackToken = evt.attendanceQrToken || `CVN-${evt.id.slice(0, 6).toUpperCase()}`
      setQrToken(fallbackToken)
      setQrPayload(`CONVENA-ATTEND:${evt.id}:${fallbackToken}`)
    } finally {
      setLoadingQr(false)
    }
  }

  const handleRegenerateQr = async () => {
    if (!qrModalEvent) return
    setLoadingQr(true)
    try {
      const gen = await eventsService.generateAttendanceQr(qrModalEvent.id)
      setQrToken(gen.qrToken)
      setQrPayload(gen.qrPayload)
      setEvents((prev) =>
        prev.map((e) => (e.id === qrModalEvent.id ? { ...e, attendanceQrToken: gen.qrToken } : e))
      )
    } finally {
      setLoadingQr(false)
    }
  }

  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      (e.description && e.description.toLowerCase().includes(search.toLowerCase())) ||
      (e.organizationName && e.organizationName.toLowerCase().includes(search.toLowerCase())) ||
      (e.company && e.company.toLowerCase().includes(search.toLowerCase()))

    const matchesStatus = statusFilter === 'all' || e.status === statusFilter
    const matchesOrg =
      orgFilter === 'all' ||
      e.organizationId === orgFilter ||
      (e.organizationName &&
        userOrgs.find((o) => o.id === orgFilter)?.name === e.organizationName)
    return matchesSearch && matchesStatus && matchesOrg
  })

  const checkedInCount = registrations.filter((r) => r.status === 'checked_in').length

  return (
    <div className="font-['Montserrat',sans-serif] bg-[#000000] text-white">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <div className="mb-2">
            <Badge variant="accent">MANAJEMEN KEGIATAN ORGANISASI</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight m-0">
            Kelola Event Organisasi
          </h1>
          <p className="text-xs sm:text-sm text-[#9C9C9C] mt-1">
            Revisi event kapan saja, atur penugasan Role & Divisi anggota per event, dan buat QR Presensi peserta.
          </p>
        </div>

        <Link to="/dashboard/events/create" className="no-underline">
          <Button variant="accent" size="md" icon={<Plus size={16} />}>
            Buat Event Baru
          </Button>
        </Link>
      </div>

      {/* Organization Scope Selector */}
      {userOrgs.length > 0 && (
        <div className="mb-4 flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-[#9C9C9C] flex items-center gap-1.5 mr-1">
            <Building2 size={14} className="text-[#CFFE06]" /> Organisasi:
          </span>
          <button
            type="button"
            onClick={() => setOrgFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
              orgFilter === 'all'
                ? 'bg-[#CFFE06] text-black border-[#CFFE06]'
                : 'bg-[#151515] text-[#9C9C9C] border-[#333333] hover:text-white'
            }`}
          >
            Semua Organisasi ({events.length})
          </button>
          {userOrgs.map((org) => (
            <button
              key={org.id}
              type="button"
              onClick={() => setOrgFilter(org.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                orgFilter === org.id
                  ? 'bg-[#CFFE06] text-black border-[#CFFE06]'
                  : 'bg-[#151515] text-[#9C9C9C] border-[#333333] hover:text-white'
              }`}
            >
              {org.name}
            </button>
          ))}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 bg-[#151515] border border-[#3D3D3D]/50 rounded-xl mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <SearchBar
          containerClassName="w-full sm:w-auto flex-1"
          inputContainerClassName="rounded-full"
          placeholder="Cari event yang Anda kelola..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          showSubmitButton={false}
          clearable
        />

        <div className="flex items-center gap-2 self-start sm:self-center">
          {(
            [
              { id: 'all', label: 'Semua Event' },
              { id: 'published', label: 'Aktif / Published' },
              { id: 'draft', label: 'Draft' },
            ] as const
          ).map((tab) => {
            const active = statusFilter === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`text-xs font-semibold py-1.5 px-3.5 rounded-full transition-all cursor-pointer ${
                  active
                    ? 'bg-[#CFFE06] text-black shadow-[0_0_10px_rgba(207,254,6,0.2)]'
                    : 'bg-[#202020] text-[#9C9C9C] hover:text-white border border-[#3D3D3D]'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Events List */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-5 bg-[#151515] border border-[#262626] rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
            >
              <div className="h-20 w-full bg-[#202020] rounded-xl" />
            </div>
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="py-16 text-center p-8 bg-[#151515] border border-[#3D3D3D]/50 rounded-xl max-w-lg mx-auto">
          <h3 className="font-bold text-lg text-white mb-2">Belum Ada Event</h3>
          <p className="text-[#9C9C9C] text-xs mb-6">
            Tidak ada event yang sesuai dengan pencarian atau filter organisasi Anda.
          </p>
          <Link to="/dashboard/events/create" className="no-underline">
            <Button variant="accent" size="sm" icon={<Plus size={15} />}>
              Buat Event Baru
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map((evt) => {
            const dateStr = new Date(evt.startDate).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })
            return (
              <div
                key={evt.id}
                className="p-5 bg-[#151515] border border-[#3D3D3D]/60 rounded-xl hover:border-[#CFFE06]/40 transition-colors flex flex-col xl:flex-row items-start xl:items-center justify-between gap-5"
              >
                {/* Left: Thumbnail & Details */}
                <div className="flex items-start gap-4">
                  <img
                    src={evt.bannerUrl || ''}
                    alt={evt.title}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl border border-[#3D3D3D] object-cover shrink-0"
                  />
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="accent" className="text-[10px] py-0 px-2">
                        {evt.category.toUpperCase()}
                      </Badge>
                      <Badge
                        variant={evt.status === 'published' ? 'accent' : 'grey'}
                        className="text-[10px] py-0 px-2"
                      >
                        {evt.status === 'published' ? 'PUBLISHED' : 'DRAFT'}
                      </Badge>
                      <span className="text-xs text-[#CFFE06] font-semibold">
                        {evt.organizationName}
                      </span>
                      <span className="text-xs text-[#9C9C9C]">• {evt.company}</span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-white m-0">{evt.title}</h3>

                    <div className="flex items-center gap-4 text-xs text-[#9C9C9C] flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-[#CFFE06]" />
                        <span>{dateStr}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin size={13} className="text-[#CFFE06]" />
                        <span>
                          {evt.location.venueName ||
                            (evt.location.type === 'online' ? 'Online' : 'Venue Acara')}
                        </span>
                      </div>
                      {evt.myRole && (
                        <Badge variant="dark" className="text-[10px]">
                          Role Anda: {evt.myRole.toUpperCase()}
                          {evt.myDivision ? ` • ${evt.myDivision}` : ''}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Attendees Progress & Comprehensive Actions */}
                <div className="w-full xl:w-auto flex flex-col sm:flex-row xl:flex-col items-start xl:items-end justify-between gap-4 pt-3 xl:pt-0 border-t xl:border-t-0 border-[#202020]">
                  <div className="w-full sm:w-52">
                    <div className="flex justify-between text-xs text-[#9C9C9C] mb-1">
                      <span className="flex items-center gap-1">
                        <Users size={12} className="text-[#CFFE06]" /> Kuota Tiket
                      </span>
                      <span className="text-white font-semibold">
                        {evt.attendeeCount} / {evt.totalCapacity}
                      </span>
                    </div>
                    <ProgressBar
                      value={evt.attendeeCount}
                      max={evt.totalCapacity}
                      color="accent"
                      showPercentage={false}
                      height={6}
                    />
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Link to={`/dashboard/events/${evt.id}/edit`} className="no-underline">
                      <Button variant="outline" size="sm" icon={<Edit3 size={14} />}>
                        Edit / Revisi
                      </Button>
                    </Link>

                    <Button
                      variant="outline"
                      size="sm"
                      icon={<UserPlus size={14} />}
                      onClick={() => openTeamModal(evt)}
                    >
                      Tim & Divisi
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      icon={<QrCode size={14} />}
                      onClick={() => openQrModal(evt)}
                    >
                      QR Presensi
                    </Button>

                    <Link to={`/dashboard/tasks?eventId=${evt.id}`} className="no-underline">
                      <Button variant="outline" size="sm" icon={<ListTodo size={14} />}>
                        Task Panitia
                      </Button>
                    </Link>

                    <Link to={`/dashboard/finances?eventId=${evt.id}`} className="no-underline">
                      <Button variant="accent" size="sm" icon={<DollarSign size={14} />}>
                        Anggaran & SPJ
                      </Button>
                    </Link>

                    <Link to={`/events/${evt.id}`} className="no-underline">
                      <Button variant="outline" size="sm" icon={<ArrowUpRight size={14} />}>
                        Halaman Publik
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL 1: ASSIGN ORGANIZATION MEMBER TO ROLE & DIVISION PER EVENT  */}
      {/* ================================================================= */}
      {teamModalEvent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#151515] border border-[#333333] rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6">
            <div className="flex items-start justify-between gap-4 border-b border-[#262626] pb-4">
              <div>
                <Badge variant="accent" className="mb-1">
                  PENUGASAN PANITIA PER EVENT
                </Badge>
                <h2 className="text-lg font-extrabold text-white m-0">
                  Tim, Role & Divisi — {teamModalEvent.title}
                </h2>
                <p className="text-xs text-[#9C9C9C] m-0 mt-1">
                  Pilih anggota dari organisasi ({teamModalEvent.organizationName}) dan tetapkan Role serta Divisi khusus untuk event ini.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTeamModalEvent(null)}
                className="p-2 rounded-lg bg-[#202020] text-[#9C9C9C] hover:text-white border border-[#333333] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {teamFeedback && (
              <div className="p-3 rounded-xl bg-[#1e240a] border border-[#CFFE06]/50 text-xs text-[#CFFE06] font-semibold">
                {teamFeedback}
              </div>
            )}

            {/* Assignment Form */}
            <form
              onSubmit={handleAssignMember}
              className="p-4 rounded-xl bg-[#1C1C1C] border border-[#2E2E2E] space-y-4"
            >
              <div className="text-xs font-bold text-[#CFFE06] uppercase tracking-wider">
                Tugaskan Anggota Organisasi ke Event Ini
              </div>

              {orgMembers.length > 0 && (
                <div>
                  <label className="block text-[11px] font-semibold text-[#9C9C9C] mb-1.5">
                    Pilih Cepat dari Anggota Organisasi ({teamModalEvent.organizationName}):
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {orgMembers.map((om) => (
                      <button
                        key={om.userId}
                        type="button"
                        onClick={() => setAssignEmail(om.email)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                          assignEmail === om.email
                            ? 'bg-[#CFFE06] text-black border-[#CFFE06]'
                            : 'bg-[#242424] text-[#CCCCCC] border-[#383838] hover:border-[#CFFE06]/50'
                        }`}
                      >
                        {om.displayName} ({om.roleDisplayName})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#CCCCCC] mb-1">
                    Email Anggota *
                  </label>
                  <input
                    type="email"
                    required
                    value={assignEmail}
                    onChange={(e) => setAssignEmail(e.target.value)}
                    placeholder="email@student.itb.ac.id"
                    className="w-full px-3 py-2 rounded-xl bg-[#121212] border border-[#333333] text-xs text-white outline-none focus:border-[#CFFE06]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#CCCCCC] mb-1">
                    Role di Event Ini *
                  </label>
                  <select
                    value={assignRole}
                    onChange={(e) => setAssignRole(e.target.value as EventRole)}
                    className="w-full px-3 py-2 rounded-xl bg-[#121212] border border-[#333333] text-xs text-white outline-none focus:border-[#CFFE06]"
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#CCCCCC] mb-1">
                    Divisi Kepanitiaan *
                  </label>
                  <select
                    value={assignDivision}
                    onChange={(e) => setAssignDivision(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#121212] border border-[#333333] text-xs text-white outline-none focus:border-[#CFFE06]"
                  >
                    {DIVISION_OPTIONS.map((div) => (
                      <option key={div} value={div}>
                        {div}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#CCCCCC] mb-1">
                    Jabatan Spesifik (Opsional)
                  </label>
                  <input
                    type="text"
                    value={assignTitle}
                    onChange={(e) => setAssignTitle(e.target.value)}
                    placeholder="e.g. Koordinator Lapangan / Staff Acara"
                    className="w-full px-3 py-2 rounded-xl bg-[#121212] border border-[#333333] text-xs text-white outline-none focus:border-[#CFFE06]"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" variant="accent" size="sm" icon={<UserPlus size={14} />}>
                  Simpan Penugasan ke Event
                </Button>
              </div>
            </form>

            {/* Existing Event Members List */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-white uppercase tracking-wider">
                Susunan Panitia Aktif di Event Ini ({eventMembers.length})
              </div>
              {loadingTeam ? (
                <div className="text-xs text-[#9C9C9C]">Memuat daftar panitia event...</div>
              ) : (
                <div className="space-y-2">
                  {eventMembers.map((m) => (
                    <div
                      key={m.id}
                      className="p-3 rounded-xl bg-[#1C1C1C] border border-[#2A2A2A] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{m.displayName}</span>
                          <Badge variant="accent" className="text-[10px]">
                            {m.role.toUpperCase()}
                          </Badge>
                          <Badge variant="dark" className="text-[10px]">
                            {m.division || 'Umum'}
                          </Badge>
                        </div>
                        <div className="text-[11px] text-[#9C9C9C] mt-0.5">
                          {m.email} {m.customTitle ? `• ${m.customTitle}` : ''}
                        </div>
                      </div>

                      {m.role !== 'owner' && (
                        <div className="flex items-center gap-2">
                          <select
                            value={m.division || 'Umum'}
                            onChange={(e) =>
                              handleUpdateMemberDivisionOrRole(m, m.role, e.target.value)
                            }
                            className="px-2.5 py-1 rounded-lg bg-[#121212] border border-[#333333] text-[11px] text-white"
                          >
                            {DIVISION_OPTIONS.map((div) => (
                              <option key={div} value={div}>
                                {div}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(m.userId)}
                            className="p-1.5 rounded-lg bg-[#2A1215] text-[#FF6B6B] hover:text-white border border-[#5C1E24] cursor-pointer"
                            title="Hapus dari event"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL 2: EVENT ATTENDANCE QR GENERATOR & LIVE CHECK-IN MONITOR    */}
      {/* ================================================================= */}
      {qrModalEvent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#151515] border border-[#333333] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6">
            <div className="flex items-start justify-between gap-4 border-b border-[#262626] pb-4">
              <div>
                <Badge variant="accent" className="mb-1">
                  QR PRESENSI KEHADIRAN RESMI
                </Badge>
                <h2 className="text-lg font-extrabold text-white m-0">
                  QR Presensi — {qrModalEvent.title}
                </h2>
                <p className="text-xs text-[#9C9C9C] m-0 mt-1">
                  Tampilkan QR ini di meja registrasi. Peserta yang sudah terdaftar & lunas dapat memindai QR ini dari aplikasi Mobile atau Web untuk bukti kehadiran.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setQrModalEvent(null)}
                className="p-2 rounded-lg bg-[#202020] text-[#9C9C9C] hover:text-white border border-[#333333] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-2xl bg-[#1C1C1C] border border-[#2E2E2E]">
              <div className="p-4 bg-white rounded-2xl shrink-0 shadow-lg">
                {qrPayload ? (
                  <QRCodeSVG value={qrPayload} size={180} level="M" />
                ) : (
                  <div className="w-[180px] h-[180px] flex items-center justify-center text-black text-xs">
                    Memuat QR...
                  </div>
                )}
              </div>

              <div className="space-y-3 flex-1">
                <div>
                  <span className="text-[11px] font-bold text-[#9C9C9C] uppercase tracking-wider block">
                    Token Presensi Aktif
                  </span>
                  <div className="text-base font-mono font-extrabold text-[#CFFE06] mt-0.5">
                    {qrToken}
                  </div>
                  <div className="text-[11px] font-mono text-[#888888] break-all mt-1">
                    Payload: {qrPayload}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#121212] border border-[#282828] text-xs text-[#CCCCCC] space-y-1">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-[#CFFE06]" />
                    Validasi Otomatis Berlapis:
                  </div>
                  <p className="m-0 text-[11px] text-[#9C9C9C]">
                    Sistem otomatis menolak peserta yang belum terdaftar atau belum menyelesaikan pembayaran tiket berbayar.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    type="button"
                    variant="accent"
                    size="sm"
                    icon={<Copy size={14} />}
                    onClick={() => {
                      navigator.clipboard.writeText(qrPayload)
                      setCopiedQr(true)
                    }}
                  >
                    {copiedQr ? 'Kode Tersalin!' : 'Salin Kode QR'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    icon={<RefreshCw size={14} />}
                    onClick={handleRegenerateQr}
                    disabled={loadingQr}
                  >
                    Buat Ulang Token QR
                  </Button>
                </div>
              </div>
            </div>

            {/* Live Attendance & Registration Check */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Peserta Terdaftar & Status Kehadiran
                </span>
                <Badge variant="accent">
                  Hadir: {checkedInCount} / {registrations.length} Terdaftar
                </Badge>
              </div>

              {registrations.length === 0 ? (
                <div className="p-4 rounded-xl bg-[#1C1C1C] border border-[#2A2A2A] text-xs text-[#9C9C9C] text-center">
                  Belum ada peserta yang mendaftar melalui sistem untuk event ini.
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {registrations.map((reg) => (
                    <div
                      key={reg.id}
                      className="p-3 rounded-xl bg-[#1C1C1C] border border-[#2A2A2A] flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="text-xs font-bold text-white">
                          {reg.attendeeName}{' '}
                          <span className="font-mono text-[11px] text-[#CFFE06]">
                            ({reg.ticketCode})
                          </span>
                        </div>
                        <div className="text-[11px] text-[#9C9C9C]">
                          {reg.tierName} •{' '}
                          {reg.price === 0
                            ? 'Tiket Gratis'
                            : `Rp ${reg.price.toLocaleString('id-ID')} (${reg.paymentMethod.toUpperCase()})`}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={reg.paymentStatus === 'paid' ? 'accent' : 'grey'}
                          className="text-[10px]"
                        >
                          {reg.paymentStatus === 'paid' ? 'LUNAS' : 'PENDING'}
                        </Badge>
                        <Badge
                          variant={reg.status === 'checked_in' ? 'accent' : 'dark'}
                          className="text-[10px]"
                        >
                          {reg.status === 'checked_in' ? 'HADIR (CHECKED-IN)' : 'TERDAFTAR'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
