import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Filter, Search, Sparkles } from 'lucide-react'
import { EventCard } from '../../components/domain/EventCard.tsx'
import { Button } from '../../components/common/Button.tsx'
import { Badge } from '../../components/common/Badge.tsx'
import { eventsService } from '../../services/events.service.ts'
import type { Event } from '../../types/event.ts'

export const EventsPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const initialSearch = searchParams.get('search') || ''

  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(initialSearch)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedCampus, setSelectedCampus] = useState<string>('all')

  const categories = [
    { label: 'Semua Kategori', value: 'all' },
    { label: 'Festival', value: 'festival' },
    { label: 'Seminar', value: 'seminar' },
    { label: 'Workshop', value: 'workshop' },
    { label: 'Kompetisi', value: 'competition' },
  ]

  const campuses = [
    { label: 'Semua Kampus', value: 'all' },
    { label: 'Telkom University', value: 'Telkom' },
    { label: 'ITB', value: 'ITB' },
    { label: 'UI', value: 'UI' },
    { label: 'UGM', value: 'UGM' },
    { label: 'ITS', value: 'ITS' },
  ]

  useEffect(() => {
    let isMounted = true
    const fetchEvents = async () => {
      setLoading(true)
      const data = await eventsService.getEvents({
        search: search || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        university: selectedCampus !== 'all' ? selectedCampus : undefined,
      })
      if (isMounted) {
        setEvents(data)
        setLoading(false)
      }
    }

    const timer = setTimeout(fetchEvents, 300)
    return () => {
      isMounted = false
      clearTimeout(timer)
    }
  }, [search, selectedCategory, selectedCampus])

  return (
    <div className="max-w-[1280px] mx-auto py-10 px-4 sm:px-6 font-['Montserrat',sans-serif] bg-[#000000] text-white">
      {/* Header bar - Strictly for Discovering Events */}
      <div className="mb-8">
        <div className="inline-flex mb-2">
          <Badge variant="accent" icon={<Sparkles size={13} />}>
            EXPLORE EVENTS
          </Badge>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white m-0 tracking-tight">
          Jelajahi Event Kampus
        </h1>
        <p className="text-[#9C9C9C] text-sm sm:text-base mt-1">
          Temukan seminar, kompetisi, hackathon, dan festival mahasiswa se-Indonesia.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-5 bg-[#151515] border border-[#3D3D3D]/50 rounded-xl mb-8 flex flex-col gap-4">
        <div className="bg-[#202020] border border-[#3D3D3D] rounded-xl flex gap-3 items-center px-4 py-2.5 focus-within:border-[#CFFE06] transition-colors">
          <Search size={18} className="text-[#9C9C9C] shrink-0" />
          <input
            type="text"
            placeholder="Cari berdasarkan judul acara, topik, ormawa, atau tagar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-sm font-medium text-white placeholder:text-[#9C9C9C]/60"
          />
        </div>

        {/* Categories and Campus pill filters */}
        <div className="flex items-center justify-between flex-wrap gap-4 pt-2 border-t border-[#202020]">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-[#9C9C9C] flex items-center gap-1 mr-1">
              <Filter size={13} /> Kategori:
            </span>
            {categories.map((cat) => {
              const active = selectedCategory === cat.value
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`text-xs font-bold py-1.5 px-3.5 rounded-full transition-all cursor-pointer ${
                    active
                      ? 'bg-[#CFFE06] text-[#000000] shadow-[0_0_12px_rgba(207,254,6,0.25)]'
                      : 'bg-[#202020] text-[#9C9C9C] hover:text-white border border-[#3D3D3D]/60'
                  }`}
                >
                  {cat.label}
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-[#9C9C9C] mr-1">Kampus:</span>
            {campuses.map((camp) => {
              const active = selectedCampus === camp.value
              return (
                <button
                  key={camp.value}
                  type="button"
                  onClick={() => setSelectedCampus(camp.value)}
                  className={`text-xs font-bold py-1.5 px-3.5 rounded-full transition-all cursor-pointer ${
                    active
                      ? 'bg-[#CFFE06] text-[#000000]'
                      : 'bg-[#202020] text-[#9C9C9C] hover:text-white border border-[#3D3D3D]/60'
                  }`}
                >
                  {camp.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Events Grid Section */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="w-10 h-10 border-2 border-[#CFFE06] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <div className="font-bold text-sm text-[#9C9C9C]">
            Memuat Katalog Kegiatan...
          </div>
        </div>
      ) : events.length === 0 ? (
        <div className="py-16 text-center p-8 bg-[#151515] border border-[#3D3D3D]/50 rounded-xl max-w-lg mx-auto">
          <h3 className="font-bold text-lg text-white mb-2">
            Tidak Ada Event Ditemukan
          </h3>
          <p className="text-[#9C9C9C] text-xs mb-6">
            Coba sesuaikan kata kunci pencarian atau ubah filter kategori/kampus Anda.
          </p>
          <Button
            variant="accent"
            size="sm"
            onClick={() => {
              setSearch('')
              setSelectedCategory('all')
              setSelectedCampus('all')
            }}
          >
            Reset Semua Filter
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  )
}
