import React, { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Download, Users } from 'lucide-react'
import { Badge } from '../../components/common/Badge.tsx'
import { eventsService } from '../../services/events.service.ts'
import { operationsService } from '../../services/operations.service.ts'
import type { Event } from '../../types/event.ts'
import type { EventAttendee } from '../../types/operations.ts'

function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message)
  }
  return 'Terjadi kesalahan saat memuat data peserta.'
}

export const AttendeesPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const requestedEventId = searchParams.get('eventId') || ''
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEventId, setSelectedEventId] = useState(requestedEventId)
  const [attendees, setAttendees] = useState<EventAttendee[]>([])
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [loadingAttendees, setLoadingAttendees] = useState(Boolean(requestedEventId))
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    let active = true
    eventsService.getMyEvents()
      .then((result) => {
        if (!active) return
        setEvents(result)
        const nextEventId = result.some((event) => event.id === requestedEventId)
          ? requestedEventId
          : (result[0]?.id || '')
        if (nextEventId) setLoadingAttendees(true)
        setSelectedEventId(nextEventId)
      })
      .catch((cause: unknown) => {
        if (active) setError(getErrorMessage(cause))
      })
      .finally(() => {
        if (active) setLoadingEvents(false)
      })
    return () => { active = false }
  }, [requestedEventId])

  useEffect(() => {
    if (!selectedEventId) {
      return
    }

    let active = true
    operationsService.getAttendees(selectedEventId)
      .then((result) => {
        if (active) setAttendees(result)
      })
      .catch((cause: unknown) => {
        if (active) {
          setAttendees([])
          setError(getErrorMessage(cause))
        }
      })
      .finally(() => {
        if (active) setLoadingAttendees(false)
      })
    return () => { active = false }
  }, [selectedEventId])

  const filteredAttendees = useMemo(() => {
    const query = search.trim().toLowerCase()
    return attendees.filter((attendee) =>
      `${attendee.name} ${attendee.email} ${attendee.registrationId}`.toLowerCase().includes(query)
    )
  }, [attendees, search])

  const activeAttendees = attendees.filter((attendee) => attendee.status !== 'cancelled')
  const totalTickets = activeAttendees.reduce((sum, attendee) => sum + attendee.quantity, 0)
  const checkedInCount = activeAttendees.filter((attendee) => attendee.status === 'checked_in').length

  const exportCsv = () => {
    const rows = [
      ['Nama', 'Email', 'ID Registrasi', 'Kategori Tiket', 'Jumlah Tiket', 'Status', 'Waktu Registrasi'],
      ...filteredAttendees.map((attendee) => [
        attendee.name,
        attendee.email,
        attendee.registrationId,
        attendee.ticketTierName,
        String(attendee.quantity),
        attendee.status,
        attendee.registeredAt,
      ]),
    ]
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\r\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `peserta-${selectedEventId}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const selectedEvent = events.find((event) => event.id === selectedEventId)

  return (
    <div className="font-['Montserrat',sans-serif] text-white">
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge variant="accent">MANAJEMEN PESERTA</Badge>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">Daftar Peserta</h1>
          <p className="mt-1 text-sm text-[#9C9C9C]">Lihat registrasi, jumlah tiket, dan status check-in tiap acara.</p>
        </div>
        <button
          type="button"
          onClick={exportCsv}
          disabled={!filteredAttendees.length}
          className="inline-flex items-center gap-2 rounded-full border border-[#3D3D3D] bg-[#151515] px-4 py-2.5 text-xs font-bold text-white hover:border-[#CFFE06] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Download size={15} /> Ekspor CSV
        </button>
      </header>

      <section className="mb-5 grid gap-3 sm:grid-cols-3">
        {[
          { label: 'Peserta Terdaftar', value: activeAttendees.length },
          { label: 'Total Tiket', value: totalTickets },
          { label: 'Sudah Check-in', value: checkedInCount },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-[#262626] bg-[#151515] p-4">
            <div className="text-xs text-[#9C9C9C]">{stat.label}</div>
            <div className="mt-2 text-2xl font-extrabold text-white">{stat.value}</div>
          </div>
        ))}
      </section>

      <section className="rounded-xl border border-[#262626] bg-[#151515]">
        <div className="flex flex-col gap-3 border-b border-[#262626] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm font-bold">
            <Users size={17} className="text-[#CFFE06]" /> Peserta Acara
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <select
              aria-label="Pilih acara"
              value={selectedEventId}
              onChange={(event) => {
                setLoadingAttendees(Boolean(event.target.value))
                setAttendees([])
                setError('')
                setSelectedEventId(event.target.value)
              }}
              disabled={loadingEvents}
              className="rounded-lg border border-[#3D3D3D] bg-[#0A0A0A] px-3 py-2 text-xs text-white outline-none focus:border-[#CFFE06]"
            >
              <option value="">Pilih acara</option>
              {events.map((event) => <option key={event.id} value={event.id}>{event.title}</option>)}
            </select>
            <input
              aria-label="Cari peserta"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari nama, email, atau ID..."
              className="rounded-lg border border-[#3D3D3D] bg-[#0A0A0A] px-3 py-2 text-xs text-white outline-none placeholder:text-[#777] focus:border-[#CFFE06]"
            />
          </div>
        </div>

        {error && <p role="alert" className="m-4 rounded-lg border border-red-900 bg-red-950/40 p-3 text-xs text-red-300">{error}</p>}
        {selectedEvent && (
          <div className="px-4 pt-4 text-xs text-[#9C9C9C]">{selectedEvent.title}</div>
        )}
        {loadingAttendees || loadingEvents ? (
          <p className="p-8 text-center text-sm text-[#9C9C9C]">Memuat daftar peserta...</p>
        ) : !selectedEventId ? (
          <p className="p-8 text-center text-sm text-[#9C9C9C]">Anda belum memiliki acara untuk dikelola.</p>
        ) : filteredAttendees.length === 0 ? (
          <p className="p-8 text-center text-sm text-[#9C9C9C]">Belum ada peserta yang cocok dengan pencarian.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-xs">
              <thead className="text-[#9C9C9C]">
                <tr className="border-b border-[#262626]">
                  <th className="px-4 py-3 font-semibold">Peserta</th>
                  <th className="px-4 py-3 font-semibold">ID Registrasi</th>
                  <th className="px-4 py-3 font-semibold">Kategori</th>
                  <th className="px-4 py-3 font-semibold">Tiket</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Terdaftar</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendees.map((attendee) => (
                  <tr key={attendee.id} className="border-b border-[#262626] last:border-0">
                    <td className="px-4 py-3">
                      <div className="font-bold text-white">{attendee.name}</div>
                      <div className="mt-1 text-[#9C9C9C]">{attendee.email}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-[#CFFE06]">{attendee.registrationId}</td>
                    <td className="px-4 py-3 text-white">{attendee.ticketTierName || '-'}</td>
                    <td className="px-4 py-3 text-white">{attendee.quantity}</td>
                    <td className="px-4 py-3">
                      <Badge variant={attendee.status === 'checked_in' ? 'accent' : 'dark'}>
                        {attendee.status === 'checked_in' ? 'Hadir' : attendee.status === 'cancelled' ? 'Dibatalkan' : 'Terdaftar'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-[#9C9C9C]">
                      {new Date(attendee.registeredAt).toLocaleDateString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
