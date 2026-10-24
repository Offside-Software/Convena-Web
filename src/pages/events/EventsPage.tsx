import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Filter, Plus, Search, Sparkles } from 'lucide-react'
import { EventCard } from '../../components/domain/EventCard.tsx'
import { Button } from '../../components/common/Button.tsx'
import { Badge } from '../../components/common/Badge.tsx'
import { Modal } from '../../components/common/Modal.tsx'
import { Input } from '../../components/common/Input.tsx'
import { Select } from '../../components/common/Select.tsx'
import { MemphisShape } from '../../components/shapes/MemphisShape.tsx'
import { eventsService } from '../../services/events.service.ts'
import type { Event, EventCategory } from '../../types/event.ts'

export const EventsPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const initialSearch = searchParams.get('search') || ''
  const isCreateParam = searchParams.get('new') === 'true'

  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(initialSearch)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedCampus, setSelectedCampus] = useState<string>('all')

  // Create event modal state
  const [isModalOpen, setIsModalOpen] = useState(isCreateParam)
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState<EventCategory>('seminar')
  const [newVenue, setNewVenue] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newPrice, setNewPrice] = useState(0)

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
  ]

  useEffect(() => {
    let isMounted = true
    eventsService
      .getEvents({
        search: search || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        university: selectedCampus !== 'all' ? selectedCampus : undefined,
      })
      .then((result) => {
        if (isMounted) {
          setEvents(result)
          setLoading(false)
        }
      })
    return () => {
      isMounted = false
    }
  }, [search, selectedCategory, selectedCampus])

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle) return

    await eventsService.createEvent({
      title: newTitle,
      shortDescription: newDesc.substring(0, 100),
      description: newDesc,
      category: newCategory,
      location: {
        type: 'offline',
        venueName: newVenue || 'Kampus Utama',
        city: 'Bandung',
      },
      ticketTiers: [
        {
          id: `tier-${Date.now()}`,
          name: 'Regular Student Ticket',
          price: Number(newPrice) || 0,
          quota: 200,
          sold: 0,
          benefits: ['Akses Acara Penuh', 'E-Certificate Tervalidasi'],
          isAvailable: true,
        },
      ],
    })

    setIsModalOpen(false)
    setNewTitle('')
    setNewDesc('')
    setNewVenue('')
    const updated = await eventsService.getEvents({
      search: search || undefined,
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      university: selectedCampus !== 'all' ? selectedCampus : undefined,
    })
    setEvents(updated)
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

        <Button variant="pink" size="md" icon={<Plus size={18} />} onClick={() => setIsModalOpen(true)}>
          Buat Event Baru
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-5 bg-white border-2 border-[#121215] rounded-xl shadow-[4px_4px_0px_0px_#121215] mb-8 flex flex-col gap-4">
        <div className="flex gap-3 flex-wrap">
          {/* Keyword Search */}
          <div className="grow basis-[300px]">
            <Input
              placeholder="Cari berdasarkan judul acara, topik, pembicara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search size={18} />}
              className="!mb-0"
            />
          </div>

          {/* Campus Select */}
          <div className="w-full sm:w-[240px]">
            <Select
              options={campuses}
              value={selectedCampus}
              onChange={(e) => setSelectedCampus(e.target.value)}
              className="!mb-0"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-black font-['Space_Grotesk',sans-serif] flex items-center gap-1 uppercase tracking-wider text-[#121215]">
            <Filter size={15} /> Kategori:
          </span>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.value
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => setSelectedCategory(cat.value)}
                className={`font-['Space_Grotesk',sans-serif] font-bold text-xs py-1 px-3 rounded-full border-2 border-[#121215] cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#FFE600] shadow-[2px_2px_0px_0px_#121215] -translate-x-px -translate-y-px text-[#121215]'
                    : 'bg-white text-[#121215] hover:bg-gray-100'
                }`}
              >
                {cat.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="text-center py-16">
          <MemphisShape type="starburst" size={60} color="#FF4B91" animate="fast" />
          <p className="mt-4 font-bold text-sm text-[#121215]">Memuat daftar kegiatan ormawa...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 px-6 bg-white border-2 border-[#121215] rounded-xl shadow-[4px_4px_0px_0px_#121215]">
          <MemphisShape type="cross" size={50} color="#FF4B91" />
          <h3 className="text-xl font-['Space_Grotesk',sans-serif] font-black text-[#121215] my-3">
            Tidak Ada Event yang Sesuai
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Coba ubah kata kunci pencarian atau bersihkan filter kampus & kategori.
          </p>
          <Button
            variant="yellow"
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

      {/* Create Event Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Publikasikan Event Kampus Baru"
        headerColor="pink"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button variant="yellow" size="sm" onClick={handleCreateSubmit}>
              Simpan & Terbitkan
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Input
            label="Nama / Judul Acara"
            placeholder="Contoh: Arkavidia 10.0 atau National Debate"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
            className="!mb-0"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Kategori Acara"
              options={[
                { label: 'Seminar', value: 'seminar' },
                { label: 'Workshop', value: 'workshop' },
                { label: 'Kompetisi', value: 'competition' },
                { label: 'Festival', value: 'festival' },
              ]}
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as EventCategory)}
              className="!mb-0"
            />
            <Input
              label="Harga Tiket Masuk (Rp)"
              type="number"
              placeholder="0 jika gratis"
              value={newPrice}
              onChange={(e) => setNewPrice(Number(e.target.value))}
              className="!mb-0"
            />
          </div>

          <Input
            label="Lokasi / Tempat Acara"
            placeholder="Contoh: Aula Barat ITB atau Zoom Webinar"
            value={newVenue}
            onChange={(e) => setNewVenue(e.target.value)}
            className="!mb-0"
          />

          <div>
            <label className="block font-['Space_Grotesk',sans-serif] font-bold text-xs uppercase tracking-wider text-[#121215] mb-1.5">
              Deskripsi Singkat & Target Peserta
            </label>
            <textarea
              rows={3}
              placeholder="Jelaskan tujuan acara, benefit, serta pembicara yang diundang..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full p-3 bg-white border-2 border-[#121215] rounded-xl text-sm font-medium text-[#121215] shadow-[2px_2px_0px_0px_#121215] focus:outline-none focus:border-[#FF4B91] transition-all"
            />
          </div>
        </form>
      </Modal>
    </div>
  )
}
