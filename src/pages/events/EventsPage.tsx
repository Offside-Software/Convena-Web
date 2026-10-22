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
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      {/* Header bar */}
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
          <div style={{ display: 'inline-flex', marginBottom: '0.4rem' }}>
            <Badge variant="yellow" tilt="left" icon={<Sparkles size={14} />}>
              KATALOG RESMI
            </Badge>
          </div>
          <h1 style={{ fontSize: '2.5rem', margin: 0 }}>Jelajahi Event Ormawa</h1>
          <p style={{ color: 'var(--mem-gray-500)', margin: '4px 0 0' }}>
            Temukan seminar, kompetisi, hackathon, dan festival mahasiswa se-Indonesia.
          </p>
        </div>

        <Button variant="pink" size="md" icon={<Plus size={18} />} onClick={() => setIsModalOpen(true)}>
          Buat Event Baru
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="memphis-box"
        style={{
          padding: '1.25rem',
          backgroundColor: '#FFFFFF',
          marginBottom: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Keyword Search */}
          <div style={{ flex: '1 1 300px' }}>
            <Input
              placeholder="Cari berdasarkan judul acara, topik, pembicara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search size={18} />}
              style={{ margin: 0 }}
            />
          </div>

          {/* Campus Select */}
          <div style={{ width: '240px' }}>
            <Select
              options={campuses}
              value={selectedCampus}
              onChange={(e) => setSelectedCampus(e.target.value)}
              style={{ margin: 0 }}
            />
          </div>
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 800, fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Filter size={15} /> Kategori:
          </span>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.value
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => setSelectedCategory(cat.value)}
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '0.825rem',
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  border: '2px solid var(--mem-dark)',
                  backgroundColor: isSelected ? 'var(--mem-yellow)' : '#FFFFFF',
                  boxShadow: isSelected ? '2px 2px 0px var(--mem-dark)' : 'none',
                  cursor: 'pointer',
                  transform: isSelected ? 'translate(-1px, -1px)' : 'none',
                  transition: 'all 0.1s ease',
                }}
              >
                {cat.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <MemphisShape type="starburst" size={60} color="var(--mem-pink)" animate="fast" />
          <p style={{ marginTop: '1rem', fontWeight: 700 }}>Memuat daftar kegiatan ormawa...</p>
        </div>
      ) : events.length === 0 ? (
        <div
          className="memphis-box"
          style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            backgroundColor: '#FFFFFF',
          }}
        >
          <MemphisShape type="cross" size={50} color="var(--mem-pink)" />
          <h3 style={{ margin: '1rem 0 0.5rem' }}>Tidak Ada Event yang Sesuai</h3>
          <p style={{ color: 'var(--mem-gray-500)', marginBottom: '1.5rem' }}>
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
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.75rem',
          }}
        >
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
        <form onSubmit={handleCreateSubmit}>
          <Input
            label="Nama / Judul Acara"
            placeholder="Contoh: Arkavidia 10.0 atau National Debate"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
            />
            <Input
              label="Harga Tiket Masuk (Rp)"
              type="number"
              placeholder="0 jika gratis"
              value={newPrice}
              onChange={(e) => setNewPrice(Number(e.target.value))}
            />
          </div>

          <Input
            label="Lokasi / Tempat Acara"
            placeholder="Contoh: Aula Barat ITB atau Zoom Webinar"
            value={newVenue}
            onChange={(e) => setNewVenue(e.target.value)}
          />

          <div style={{ marginBottom: '1rem' }}>
            <label
              style={{
                display: 'block',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '0.875rem',
                marginBottom: '0.35rem',
              }}
            >
              Deskripsi Singkat & Target Peserta
            </label>
            <textarea
              rows={3}
              placeholder="Jelaskan tujuan acara, benefit, serta pembicara yang diundang..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            />
          </div>
        </form>
      </Modal>
    </div>
  )
}
