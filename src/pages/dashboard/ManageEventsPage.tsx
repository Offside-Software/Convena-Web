import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Calendar, Users, MapPin, ArrowUpRight } from 'lucide-react'
import { Button } from '../../components/common/Button.tsx'
import { Badge } from '../../components/common/Badge.tsx'
import { ProgressBar } from '../../components/common/ProgressBar.tsx'
import { SearchBar } from '../../components/common/SearchBar.tsx'
import { eventsService } from '../../services/events.service.ts'
import type { Event } from '../../types/event.ts'

export const ManageEventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all')

  useEffect(() => {
    let isMounted = true
    eventsService.getMyEvents().then((myEvents) => {
      if (!isMounted) return
      if (myEvents && myEvents.length > 0) {
        setEvents(myEvents)
        setLoading(false)
      } else {
        eventsService.getEvents().then((allEvents) => {
          if (!isMounted) return
          setEvents(allEvents)
          setLoading(false)
        })
      }
    })
    return () => {
      isMounted = false
    }
  }, [])

  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      (e.description && e.description.toLowerCase().includes(search.toLowerCase())) ||
      (e.organizationName && e.organizationName.toLowerCase().includes(search.toLowerCase())) ||
      (e.company && e.company.toLowerCase().includes(search.toLowerCase()))

    const matchesStatus = statusFilter === 'all' || e.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="font-['Montserrat',sans-serif] bg-[#000000] text-white">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <div className="mb-2">
            <Badge variant="accent">
              MANAJEMEN KEGIATAN
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight m-0">
            Kelola Event Organisasi
          </h1>
          <p className="text-xs sm:text-sm text-[#9C9C9C] mt-1">
            Pantau kuota tiket, rincian peserta, dan buat acara baru untuk kepengurusan Anda.
          </p>
        </div>

        <Link to="/dashboard/events/create" className="no-underline">
          <Button
            variant="accent"
            size="md"
            icon={<Plus size={16} />}
          >
            Buat Event Baru
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-[#151515] border border-[#3D3D3D]/50 rounded-xl mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <SearchBar
          containerClassName="w-full sm:w-auto flex-1"
          inputContainerClassName="rounded-full"
          placeholder="Cari event yang Anda kelola..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          showSubmitButton={false}
          clearable
        />

        {/* Status Filter Tabs */}
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
        <div className="py-24 text-center">
          <div className="w-10 h-10 border-2 border-[#CFFE06] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-semibold text-xs text-[#9C9C9C]">
            Memuat daftar event kelolaan...
          </p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="py-16 text-center p-8 bg-[#151515] border border-[#3D3D3D]/50 rounded-xl max-w-lg mx-auto">
          <h3 className="font-bold text-lg text-white mb-2">
            Belum Ada Event
          </h3>
          <p className="text-[#9C9C9C] text-xs mb-6">
            Tidak ada event yang sesuai dengan pencarian atau filter Anda.
          </p>
          <Link to="/dashboard/events/create" className="no-underline">
            <Button
              variant="accent"
              size="sm"
              icon={<Plus size={15} />}
            >
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
                className="p-5 bg-[#151515] border border-[#3D3D3D]/60 rounded-xl hover:border-[#CFFE06]/40 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
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
                      <Badge variant={evt.status === 'published' ? 'accent' : 'grey'} className="text-[10px] py-0 px-2">
                        {evt.status === 'published' ? 'PUBLISHED' : 'DRAFT'}
                      </Badge>
                      <span className="text-xs text-[#9C9C9C] font-medium">
                        {evt.organizationName} • {evt.company}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-white m-0">
                      {evt.title}
                    </h3>

                    <div className="flex items-center gap-4 text-xs text-[#9C9C9C] flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-[#CFFE06]" />
                        <span>{dateStr}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin size={13} className="text-[#CFFE06]" />
                        <span>{evt.location.venueName || (evt.location.type === 'online' ? 'Online' : 'Venue Acara')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Attendees Progress & Actions */}
                <div className="w-full md:w-auto flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-[#202020]">
                  <div className="w-full sm:w-48">
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

                  <div className="flex items-center gap-2">
                    <Link to={`/events/${evt.id}`} className="no-underline">
                      <Button variant="outline" size="sm" icon={<ArrowUpRight size={14} />}>
                        Lihat Halaman Publik
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
