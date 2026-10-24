import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Filter, Plus, Search, Sparkles } from 'lucide-react'
import { EventCard } from '../../components/domain/EventCard.tsx'
import { Button } from '../../components/common/Button.tsx'
import { Badge } from '../../components/common/Badge.tsx'
import { MemphisShape } from '../../components/shapes/MemphisShape.tsx'
import { CreateEventModal } from '../dashboard/components/CreateEventModal.tsx'
import { eventsService } from '../../services/events.service.ts'
import { authService } from '../../services/auth.service.ts'
import type { Event } from '../../types/event.ts'
import type { User } from '../../types/user.ts'

export const EventsPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialSearch = searchParams.get('search') || ''
  const isCreateParam = searchParams.get('new') === 'true'

  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(initialSearch)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedCampus, setSelectedCampus] = useState<string>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const categories = [
    { label: 'Semua Kategori', value: 'all' },
    { label: 'Festival', value: 'festival' },
    { label: 'Seminar', value: 'seminar' },
    { label: 'Workshop', value: 'workshop' },
    { label: 'Kompetisi', value: 'competition' },
  ]

  const campuses = [
    { label: 'Semua Kampus', value: 'all' },
    { label: 'Institut Teknologi Bandung', value: 'ITB' },
    { label: 'Universitas Indonesia', value: 'UI' },
    { label: 'Universitas Gadjah Mada', value: 'UGM' },
    { label: 'Institut Teknologi Sepuluh Nopember', value: 'ITS' },
  ]

  useEffect(() => {
    let isMounted = true
    authService.getCurrentUser().then((user) => {
      if (isMounted) {
        setCurrentUser(user)
        if (isCreateParam && user) {
          setIsModalOpen(true)
        }
      }
    })

    return () => {
      isMounted = false
    }
  }, [isCreateParam])

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

  const handleOpenCreateModal = () => {
    if (!currentUser) {
      navigate('/login?redirect=/events?new=true')
      return
    }
    setIsModalOpen(true)
  }

  const handleEventCreated = (newEvent: Event) => {
    setEvents((prev) => [newEvent, ...prev])
  }

  return (
    <div className="max-w-[1280px] mx-auto py-10 px-4 sm:px-6">
      {/* Header bar */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <div className="inline-flex mb-1.5">
            <Badge variant="yellow" tilt="left" icon={<Sparkles size={14} />}>
              KATALOG RESMI
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-['Space_Grotesk',sans-serif] font-black text-[#121215] m-0">
            Jelajahi Event Ormawa
          </h1>
          <p className="text-gray-500 text-sm sm:text-base mt-1">
            Temukan seminar, kompetisi, hackathon, dan festival mahasiswa se-Indonesia.
          </p>
        </div>

        <Button
          variant="pink"
          size="md"
          icon={<Plus size={18} />}
          onClick={handleOpenCreateModal}
        >
          Buat Event Baru
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-5 bg-white border-2 border-[#121215] rounded-xl shadow-[4px_4px_0px_0px_#121215] mb-8 flex flex-col gap-4">
        {/* Search input */}
        <div className="relative">
          <Search size={20} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan judul, topik, pembicara, atau tagar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 border-[#121215] rounded-lg font-medium text-sm text-[#121215] focus:outline-none focus:bg-white focus:border-[#FFE600] transition-all"
          />
        </div>

        {/* Categories and Campus pill filters */}
        <div className="flex items-center justify-between flex-wrap gap-4 pt-2 border-t-2 border-gray-100">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-gray-500 flex items-center gap-1 mr-1">
              <Filter size={14} /> Kategori:
            </span>
            {categories.map((cat) => {
              const active = selectedCategory === cat.value
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`text-xs font-bold py-1.5 px-3 rounded-full border-2 border-[#121215] transition-all cursor-pointer ${
                    active
                      ? 'bg-[#FFE600] shadow-[2px_2px_0px_0px_#121215] text-[#121215]'
                      : 'bg-white hover:bg-gray-100 text-[#121215]'
                  }`}
                >
                  {cat.label}
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-gray-500 mr-1">Kampus:</span>
            {campuses.map((camp) => {
              const active = selectedCampus === camp.value
              return (
                <button
                  key={camp.value}
                  type="button"
                  onClick={() => setSelectedCampus(camp.value)}
                  className={`text-xs font-bold py-1 px-2.5 rounded-md border-2 border-[#121215] transition-all cursor-pointer ${
                    active
                      ? 'bg-[#00F5D4] shadow-[2px_2px_0px_0px_#121215] text-[#121215]'
                      : 'bg-white hover:bg-gray-100 text-[#121215]'
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
        <div className="py-20 text-center">
          <div className="inline-block animate-spin mb-4">
            <MemphisShape type="starburst" size={36} color="#FFE600" />
          </div>
          <div className="font-['Space_Grotesk',sans-serif] font-bold text-lg text-[#121215]">
            Memuat Katalog Kegiatan...
          </div>
        </div>
      ) : events.length === 0 ? (
        <div className="py-16 text-center p-8 bg-white border-2 border-[#121215] rounded-xl shadow-[4px_4px_0px_0px_#121215] max-w-lg mx-auto">
          <div className="text-4xl mb-3">🔍</div>
          <h3 className="font-['Space_Grotesk',sans-serif] font-black text-xl text-[#121215] mb-2">
            Tidak Ada Event Ditemukan
          </h3>
          <p className="text-gray-500 text-sm mb-6">
            Coba sesuaikan kata kunci pencarian atau ubah filter kategori/kampus Anda.
          </p>
          <Button
            variant="yellow"
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

      {/* Unified Create Event Modal */}
      {currentUser && (
        <CreateEventModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onEventCreated={handleEventCreated}
        />
      )}
    </div>
  )
}
