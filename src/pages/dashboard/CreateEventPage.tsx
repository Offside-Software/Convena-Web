import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Calendar,
  MapPin,
  Building,
  Check,
  AlertCircle,
  Plus,
  Trash2,
  Ticket,
  Globe,
  Radio,
  Video,
  ArrowLeft,
  Save,
  Send,
} from 'lucide-react'
import { Button } from '../../components/common/Button.tsx'
import { Badge } from '../../components/common/Badge.tsx'
import { eventsService } from '../../services/events.service.ts'
import type {
  EventCategory,
  EventStatus,
  EventVisibility,
  LocationType,
  TicketTier,
} from '../../types/event.ts'

const DEFAULT_BANNERS = [
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80',
  'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&q=80',
  'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1200&q=80',
  'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200&q=80',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&q=80',
  'https://images.unsplash.com/photo-1531058020387-3be344556be6?w=1200&q=80',
]

const CATEGORY_OPTIONS: { id: EventCategory; label: string; desc: string }[] = [
  { id: 'festival', label: 'Festival & Expo', desc: 'Pameran, festival musik/budaya, dan expo komunitas' },
  { id: 'seminar', label: 'Seminar / Talkshow', desc: 'Sesi paparan materi, diskusi panel, dan sharing session' },
  { id: 'workshop', label: 'Hands-on Workshop', desc: 'Pelatihan teknis intensif dan praktik langsung' },
  { id: 'competition', label: 'Kompetisi & Hackathon', desc: 'Perlombaan karya inovasi, hackathon, dan turnamen' },
  { id: 'conference', label: 'Konferensi', desc: 'Konferensi tingkat nasional/internasional riset dan industri' },
  { id: 'gathering', label: 'Gathering & Temu Panitia', desc: 'Temu komunitas, konsolidasi, dan internal meetup' },
]

const INITIAL_TIERS: TicketTier[] = [
  {
    id: 'tier-standard',
    name: 'Standard',
    price: 0,
    quota: 250,
    sold: 0,
    benefits: ['Akses Acara Utama', 'E-Sertifikat Digital Terverifikasi', 'Materi Presentasi Pembicara (PDF)'],
    isAvailable: true,
  },
  {
    id: 'tier-gold',
    name: 'Gold',
    price: 50000,
    quota: 100,
    sold: 0,
    benefits: [
      'Semua Keuntungan Standard',
      'Akses Sesi Q&A Eksklusif Pembicara',
      'Lunch Box & Coffee Break',
      'Prioritas Masuk & Check-in di Lokasi',
    ],
    isAvailable: true,
  },
  {
    id: 'tier-platinum',
    name: 'Platinum',
    price: 150000,
    quota: 50,
    sold: 0,
    benefits: [
      'Semua Keuntungan Gold',
      'Akses VIP Seluruh Sesi & Workshop Tambahan',
      'Networking Dinner dengan Pembicara & Sponsor',
      'Tempat Duduk Baris Depan (VIP Front-Row)',
      'Official Merch Kit & Tote Bag Eksklusif',
    ],
    isAvailable: true,
  },
]

export const CreateEventPage: React.FC = () => {
  const navigate = useNavigate()

  // 1. General State
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<EventCategory>('festival')
  const [shortDescription, setShortDescription] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // 2. Location State
  const [locationType, setLocationType] = useState<LocationType>('offline')
  const [venueName, setVenueName] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [onlineUrl, setOnlineUrl] = useState('')

  // 3. Organization State
  const [organizationName, setOrganizationName] = useState('')
  const [company, setCompany] = useState('')

  // 4. Design State
  const [bannerUrl, setBannerUrl] = useState(DEFAULT_BANNERS[0])
  const [isCustomBanner, setIsCustomBanner] = useState(false)
  const [customBannerUrl, setCustomBannerUrl] = useState('')

  // 5. Ticketing State
  const [ticketTiers, setTicketTiers] = useState<TicketTier[]>(INITIAL_TIERS)
  const [newBenefitInputs, setNewBenefitInputs] = useState<Record<string, string>>({})

  // 6. Publication & Submission State
  const [visibility, setVisibility] = useState<EventVisibility>('public')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Handlers for Ticket Tiers
  const handleAddTier = () => {
    const id = `tier-${Date.now()}`
    const newTier: TicketTier = {
      id,
      name: `Kategori ${ticketTiers.length + 1}`,
      price: 25000,
      quota: 50,
      sold: 0,
      benefits: ['Akses Acara', 'E-Sertifikat'],
      isAvailable: true,
    }
    setTicketTiers((prev) => [...prev, newTier])
  }

  const handleUpdateTier = (id: string, updates: Partial<TicketTier>) => {
    setTicketTiers((prev) =>
      prev.map((tier) => (tier.id === id ? { ...tier, ...updates } : tier))
    )
  }

  const handleRemoveTier = (id: string) => {
    if (ticketTiers.length <= 1) {
      alert('Event harus memiliki minimal 1 kategori tiket!')
      return
    }
    setTicketTiers((prev) => prev.filter((tier) => tier.id !== id))
  }

  const handleAddBenefit = (tierId: string) => {
    const text = (newBenefitInputs[tierId] || '').trim()
    if (!text) return
    setTicketTiers((prev) =>
      prev.map((t) => (t.id === tierId ? { ...t, benefits: [...t.benefits, text] } : t))
    )
    setNewBenefitInputs((prev) => ({ ...prev, [tierId]: '' }))
  }

  const handleRemoveBenefit = (tierId: string, index: number) => {
    setTicketTiers((prev) =>
      prev.map((t) =>
        t.id === tierId
          ? { ...t, benefits: t.benefits.filter((_, i) => i !== index) }
          : t
      )
    )
  }

  // Active banner URL
  const activeBanner = isCustomBanner ? customBannerUrl || DEFAULT_BANNERS[0] : bannerUrl

  // Calculate Capacity
  const totalCapacity = ticketTiers.reduce((acc, t) => acc + (Number(t.quota) || 0), 0)

  // Submit Handler
  const handleSave = async (submitStatus: EventStatus) => {
    setErrorMessage(null)

    if (!title.trim()) {
      setErrorMessage('Judul kegiatan / acara wajib diisi.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    if (!startDate || !endDate) {
      setErrorMessage('Waktu mulai dan waktu selesai acara wajib ditentukan.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    if (end <= start) {
      setErrorMessage('Waktu selesai harus lebih lambat dari waktu mulai.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    if (ticketTiers.length === 0) {
      setErrorMessage('Mohon tentukan minimal satu kategori tiket untuk acara Anda.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    try {
      setIsLoading(true)

      await eventsService.createEvent({
        title: title.trim(),
        category,
        status: submitStatus,
        visibility,
        shortDescription: shortDescription.trim() || undefined,
        description: description.trim() || undefined,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        locationType,
        venueName: venueName.trim() || undefined,
        address: address.trim() || undefined,
        city: city.trim() || undefined,
        onlineUrl: onlineUrl.trim() || undefined,
        organizationName: organizationName.trim() || undefined,
        company: company.trim() || undefined,
        bannerUrl: activeBanner,
        ticketTiers: ticketTiers.map((tier) => ({
          ...tier,
          price: Number(tier.price) || 0,
          quota: Number(tier.quota) || 0,
        })),
      })

      navigate('/dashboard/events')
    } catch (err: unknown) {
      const error = err as { message?: string }
      setErrorMessage(error?.message || 'Gagal menyimpan data event. Silakan periksa kembali formulir Anda.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="font-['Montserrat',sans-serif] bg-[#000000] text-white min-h-screen pb-20">
      {/* Top Header / Navigation Breadcrumb */}
      <div className="border-b border-[#202020] pb-6 mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Link
            to="/dashboard/events"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#9C9C9C] hover:text-[#CFFE06] transition-colors no-underline"
          >
            <ArrowLeft size={14} /> Kembali ke Kelola Event
          </Link>
          <span className="text-xs text-[#555555]">/</span>
          <span className="text-xs text-[#CFFE06] font-semibold">Buat Event Baru</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="accent">PANEL PEMBUATAN EVENT</Badge>
              <Badge variant="dark" className="text-[11px]">
                {locationType.toUpperCase()}
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white m-0">
              Buat & Publikasikan Event
            </h1>
            <p className="text-xs sm:text-sm text-[#9C9C9C] mt-1 max-w-2xl">
              Lengkapi 6 kelompok data berikut secara terperinci untuk mengaktifkan halaman registrasi,
              penjualan tiket, dan manajemen kepanitiaan Anda.
            </p>
          </div>

          {/* Quick Header Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="md"
              icon={<Save size={16} />}
              onClick={() => handleSave('draft')}
              disabled={isLoading}
            >
              Simpan Draft
            </Button>
            <Button
              type="button"
              variant="accent"
              size="md"
              icon={<Send size={16} />}
              onClick={() => handleSave('published')}
              disabled={isLoading}
            >
              {isLoading ? 'Menyimpan...' : 'Publikasikan'}
            </Button>
          </div>
        </div>
      </div>

      {/* Global Error Notification */}
      {errorMessage && (
        <div className="bg-[#200010] border border-[#DF00D0] text-[#FF88EC] rounded-2xl p-4 text-xs sm:text-sm font-semibold flex items-center gap-3 mb-8 shadow-[0_0_20px_rgba(223,0,208,0.15)]">
          <AlertCircle size={20} className="shrink-0 text-[#DF00D0]" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* FORM BODY: 6 SEPARATED GROUPS */}
      <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
        {/* ========================================================= */}
        {/* GROUP 1: INFORMASI UMUM (GENERAL) */}
        {/* ========================================================= */}
        <section className="bg-[#121212] border border-[#2A2A2A] rounded-2xl p-6 sm:p-8 hover:border-[#3D3D3D] transition-colors">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#202020]">
            <div className="w-9 h-9 rounded-xl bg-[#CFFE06]/10 border border-[#CFFE06]/30 flex items-center justify-center text-[#CFFE06] font-bold text-sm">
              1
            </div>
            <div>
              <h2 className="text-lg font-bold text-white m-0">Informasi Umum (General)</h2>
              <p className="text-xs text-[#9C9C9C] m-0">
                Judul utama, ringkasan, kategori, serta tanggal pelaksanaan acara.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-[#E0E0E0] uppercase tracking-wider mb-2">
                Judul Kegiatan / Acara *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Arkavidia 9.0: National Tech Festival & Hackathon"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#333333] rounded-xl text-sm font-medium text-white placeholder:text-[#9C9C9C]/50 outline-none focus:border-[#CFFE06] focus:ring-1 focus:ring-[#CFFE06] transition-all"
              />
            </div>

            {/* Category Select Grid */}
            <div>
              <label className="block text-xs font-bold text-[#E0E0E0] uppercase tracking-wider mb-2">
                Kategori Acara *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {CATEGORY_OPTIONS.map((cat) => {
                  const isSelected = category === cat.id
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#1e240a] border-[#CFFE06] shadow-[0_0_15px_rgba(207,254,6,0.15)]'
                          : 'bg-[#181818] border-[#2A2A2A] hover:border-[#3D3D3D] text-[#9C9C9C]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-bold ${isSelected ? 'text-[#CFFE06]' : 'text-white'}`}>
                          {cat.label}
                        </span>
                        {isSelected && <Check size={14} className="text-[#CFFE06]" />}
                      </div>
                      <p className="text-[11px] text-[#888888] leading-tight m-0">{cat.desc}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Date and Time: Start & End */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-[#E0E0E0] uppercase tracking-wider mb-2">
                  <Calendar size={13} className="inline mr-1.5 text-[#CFFE06]" />
                  Waktu Mulai Acara *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#1A1A1A] border border-[#333333] rounded-xl text-sm font-medium text-white outline-none focus:border-[#CFFE06] transition-all [color-scheme:dark]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#E0E0E0] uppercase tracking-wider mb-2">
                  <Calendar size={13} className="inline mr-1.5 text-[#CFFE06]" />
                  Waktu Selesai Acara *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#1A1A1A] border border-[#333333] rounded-xl text-sm font-medium text-white outline-none focus:border-[#CFFE06] transition-all [color-scheme:dark]"
                />
              </div>
            </div>

            {/* Short Description */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-[#E0E0E0] uppercase tracking-wider">
                  Ringkasan Singkat (Short Description)
                </label>
                <span className="text-[10px] text-[#777777]">Maks. 160 karakter untuk kartu event</span>
              </div>
              <input
                type="text"
                maxLength={160}
                placeholder="e.g. Festival teknologi tahunan mahasiswa dengan kompetisi hackathon, talkshow, dan expo prototipe inovatif."
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#1A1A1A] border border-[#333333] rounded-xl text-sm font-medium text-white placeholder:text-[#9C9C9C]/50 outline-none focus:border-[#CFFE06] transition-all"
              />
            </div>

            {/* Full Description */}
            <div>
              <label className="block text-xs font-bold text-[#E0E0E0] uppercase tracking-wider mb-2">
                Deskripsi Lengkap Kegiatan
              </label>
              <textarea
                rows={5}
                placeholder="Jelaskan secara mendalam mengenai latar belakang kegiatan, susunan agenda, profil narasumber atau juri, syarat & ketentuan peserta, serta benefit yang diperoleh..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#333333] rounded-xl text-sm font-medium text-white placeholder:text-[#9C9C9C]/50 outline-none focus:border-[#CFFE06] transition-all leading-relaxed"
              />
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* GROUP 2: FORMAT & LOKASI PENYELENGGARAAN (LOCATION) */}
        {/* ========================================================= */}
        <section className="bg-[#121212] border border-[#2A2A2A] rounded-2xl p-6 sm:p-8 hover:border-[#3D3D3D] transition-colors">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#202020]">
            <div className="w-9 h-9 rounded-xl bg-[#CFFE06]/10 border border-[#CFFE06]/30 flex items-center justify-center text-[#CFFE06] font-bold text-sm">
              2
            </div>
            <div>
              <h2 className="text-lg font-bold text-white m-0">Format & Lokasi Penyelenggaraan (Location)</h2>
              <p className="text-xs text-[#9C9C9C] m-0">
                Pilih format tatap muka, daring penuh, atau hybrid serta rincian venue/tautan meeting.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Format Penyelenggaraan selector */}
            <div>
              <label className="block text-xs font-bold text-[#E0E0E0] uppercase tracking-wider mb-2">
                Format Penyelenggaraan *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: 'offline' as LocationType,
                    label: 'Tatap Muka (Offline)',
                    desc: 'Acara berlangsung secara fisik di venue tertentu',
                    icon: <MapPin size={18} className="text-[#CFFE06]" />,
                  },
                  {
                    id: 'online' as LocationType,
                    label: 'Daring Penuh (Online)',
                    desc: 'Diselenggarakan melalui Zoom, GMeet, atau streaming',
                    icon: <Video size={18} className="text-[#DF00D0]" />,
                  },
                  {
                    id: 'hybrid' as LocationType,
                    label: 'Campuran (Hybrid)',
                    desc: 'Peserta dapat hadir langsung atau melalui online meeting',
                    icon: <Radio size={18} className="text-[#CFFE06]" />,
                  },
                ].map((fmt) => {
                  const isSelected = locationType === fmt.id
                  return (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => setLocationType(fmt.id)}
                      className={`text-left p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#1e240a] border-[#CFFE06] shadow-[0_0_15px_rgba(207,254,6,0.15)]'
                          : 'bg-[#181818] border-[#2A2A2A] hover:border-[#3D3D3D]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        {fmt.icon}
                        {isSelected && <Check size={16} className="text-[#CFFE06]" />}
                      </div>
                      <div>
                        <span className={`block text-xs font-bold mb-1 ${isSelected ? 'text-[#CFFE06]' : 'text-white'}`}>
                          {fmt.label}
                        </span>
                        <p className="text-[11px] text-[#888888] leading-tight m-0">{fmt.desc}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Offline/Hybrid Physical Venue Fields */}
            {locationType !== 'online' && (
              <div className="space-y-4 pt-2 border-t border-[#202020]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#E0E0E0] uppercase tracking-wider mb-2">
                      <MapPin size={13} className="inline mr-1 text-[#CFFE06]" />
                      Nama Gedung / Venue
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Telkom University Convention Hall / Aula Barat ITB"
                      value={venueName}
                      onChange={(e) => setVenueName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#1A1A1A] border border-[#333333] rounded-xl text-sm font-medium text-white placeholder:text-[#9C9C9C]/50 outline-none focus:border-[#CFFE06] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#E0E0E0] uppercase tracking-wider mb-2">
                      Kota Pelaksanaan
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Bandung, Jawa Barat"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#1A1A1A] border border-[#333333] rounded-xl text-sm font-medium text-white placeholder:text-[#9C9C9C]/50 outline-none focus:border-[#CFFE06] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#E0E0E0] uppercase tracking-wider mb-2">
                    Alamat Lengkap Venue
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Jl. Telekomunikasi No. 1, Terusan Buahbatu, Sukapura, Kec. Dayeuhkolot"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#1A1A1A] border border-[#333333] rounded-xl text-sm font-medium text-white placeholder:text-[#9C9C9C]/50 outline-none focus:border-[#CFFE06] transition-all"
                  />
                </div>
              </div>
            )}

            {/* Online/Hybrid Meeting URL Fields */}
            {locationType !== 'offline' && (
              <div className="pt-2 border-t border-[#202020]">
                <label className="block text-xs font-bold text-[#E0E0E0] uppercase tracking-wider mb-2">
                  <Globe size={13} className="inline mr-1 text-[#CFFE06]" />
                  Tautan Pertemuan Online (Online Meeting URL)
                </label>
                <input
                  type="url"
                  placeholder="https://zoom.us/j/... atau https://meet.google.com/..."
                  value={onlineUrl}
                  onChange={(e) => setOnlineUrl(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#1A1A1A] border border-[#333333] rounded-xl text-sm font-medium text-white placeholder:text-[#9C9C9C]/50 outline-none focus:border-[#CFFE06] transition-all"
                />
                <p className="text-[11px] text-[#888888] mt-1.5 m-0">
                  Tautan ini akan diberikan kepada peserta yang telah mengantongi tiket valid saat mendekati hari H.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ========================================================= */}
        {/* GROUP 3: PENYELENGGARA & PERUSAHAAN (ORGANIZATION) */}
        {/* ========================================================= */}
        <section className="bg-[#121212] border border-[#2A2A2A] rounded-2xl p-6 sm:p-8 hover:border-[#3D3D3D] transition-colors">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#202020]">
            <div className="w-9 h-9 rounded-xl bg-[#CFFE06]/10 border border-[#CFFE06]/30 flex items-center justify-center text-[#CFFE06] font-bold text-sm">
              3
            </div>
            <div>
              <h2 className="text-lg font-bold text-white m-0">Penyelenggara & Instansi (Organization)</h2>
              <p className="text-xs text-[#9C9C9C] m-0">
                Identitas badan pelaksana acara serta nama institusi atau perusahaan induk.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-[#E0E0E0] uppercase tracking-wider mb-2">
                <Building size={13} className="inline mr-1 text-[#CFFE06]" />
                Nama Organisasi / Kepanitiaan
              </label>
              <input
                type="text"
                placeholder="e.g. BEM Kema Tel-U / HMIF ITB"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#1A1A1A] border border-[#333333] rounded-xl text-sm font-medium text-white placeholder:text-[#9C9C9C]/50 outline-none focus:border-[#CFFE06] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#E0E0E0] uppercase tracking-wider mb-2">
                <Building size={13} className="inline mr-1 text-[#CFFE06]" />
                Nama Perusahaan / Institusi (Company)
              </label>
              <input
                type="text"
                placeholder="e.g. Telkom University / PT Convena Global / ITB"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#1A1A1A] border border-[#333333] rounded-xl text-sm font-medium text-white placeholder:text-[#9C9C9C]/50 outline-none focus:border-[#CFFE06] transition-all"
              />
              <p className="text-[11px] text-[#888888] mt-1.5 m-0">
                Dapat berupa nama kampus, perusahaan korporasi sponsor, atau institusi asosiasi.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* GROUP 4: DESAIN SAMPUL & BANNER (DESIGN) */}
        {/* ========================================================= */}
        <section className="bg-[#121212] border border-[#2A2A2A] rounded-2xl p-6 sm:p-8 hover:border-[#3D3D3D] transition-colors">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#202020] flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#CFFE06]/10 border border-[#CFFE06]/30 flex items-center justify-center text-[#CFFE06] font-bold text-sm">
                4
              </div>
              <div>
                <h2 className="text-lg font-bold text-white m-0">Desain Sampul & Banner (Design)</h2>
                <p className="text-xs text-[#9C9C9C] m-0">
                  Pilih dari koleksi template resolusi tinggi atau input URL poster mandiri.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsCustomBanner(!isCustomBanner)}
              className="text-xs font-bold text-[#CFFE06] hover:underline cursor-pointer bg-transparent border-none flex items-center gap-1"
            >
              {isCustomBanner ? 'Pilih Template Tersedia' : 'Gunakan URL Banner Sendiri'}
            </button>
          </div>

          <div className="space-y-5">
            {isCustomBanner ? (
              <div>
                <label className="block text-xs font-bold text-[#E0E0E0] uppercase tracking-wider mb-2">
                  Tautan URL Banner Gambar (Direct Image URL)
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/banner-event.jpg"
                  value={customBannerUrl}
                  onChange={(e) => setCustomBannerUrl(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#1A1A1A] border border-[#333333] rounded-xl text-sm font-medium text-white placeholder:text-[#9C9C9C]/50 outline-none focus:border-[#CFFE06] transition-all"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-[#E0E0E0] uppercase tracking-wider mb-2">
                  Pilihan Template Banner
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {DEFAULT_BANNERS.map((url, i) => {
                    const isSelected = bannerUrl === url
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setBannerUrl(url)}
                        className={`relative rounded-xl overflow-hidden border cursor-pointer transition-all aspect-video group ${
                          isSelected
                            ? 'border-[#CFFE06] ring-2 ring-[#CFFE06]'
                            : 'border-[#2A2A2A] opacity-60 hover:opacity-100 hover:border-[#444444]'
                        }`}
                      >
                        <img
                          src={url}
                          alt={`Template ${i + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 bg-[#CFFE06] text-black rounded-full p-0.5 shadow-md">
                            <Check size={12} className="stroke-[3]" />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Live Preview Display */}
            <div>
              <span className="block text-xs font-bold text-[#9C9C9C] uppercase tracking-wider mb-2">
                Pratinjau Banner Sampul
              </span>
              <div className="relative h-44 sm:h-56 w-full rounded-2xl overflow-hidden border border-[#333333] bg-[#161616]">
                <img
                  src={activeBanner}
                  alt="Banner Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                  <div>
                    <Badge variant="accent" className="mb-1 text-[10px]">
                      {category.toUpperCase()}
                    </Badge>
                    <h3 className="text-base sm:text-lg font-bold text-white m-0 drop-shadow-md">
                      {title || 'Judul Acara Anda'}
                    </h3>
                    <p className="text-xs text-[#E0E0E0] m-0 drop-shadow">
                      {organizationName || 'Penyelenggara Acara'} • {company || 'Nama Perusahaan/Institusi'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* GROUP 5: KATEGORI TIKET (TICKETING) */}
        {/* ========================================================= */}
        <section className="bg-[#121212] border border-[#2A2A2A] rounded-2xl p-6 sm:p-8 hover:border-[#3D3D3D] transition-colors">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#202020] flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#CFFE06]/10 border border-[#CFFE06]/30 flex items-center justify-center text-[#CFFE06] font-bold text-sm">
                5
              </div>
              <div>
                <h2 className="text-lg font-bold text-white m-0">Kategori Tiket & Kuota (Ticketing)</h2>
                <p className="text-xs text-[#9C9C9C] m-0">
                  Tersedia default Standard, Gold, dan Platinum yang dapat Anda sesuaikan, tambahkan, atau hapus.
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={<Plus size={14} />}
              onClick={handleAddTier}
            >
              Tambah Kategori Tiket
            </Button>
          </div>

          <div className="space-y-6">
            {ticketTiers.map((tier, idx) => {
              const isFree = Number(tier.price) === 0
              return (
                <div
                  key={tier.id}
                  className="p-5 bg-[#171717] border border-[#2E2E2E] rounded-xl hover:border-[#3E3E3E] transition-all space-y-4"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-[#242424]">
                    <div className="flex items-center gap-2">
                      <Ticket size={16} className="text-[#CFFE06]" />
                      <span className="text-sm font-extrabold text-white">
                        Tier #{idx + 1}: {tier.name}
                      </span>
                      <Badge variant={isFree ? 'accent' : 'dark'}>
                        {isFree ? 'GRATIS' : `Rp ${Number(tier.price).toLocaleString('id-ID')}`}
                      </Badge>
                      <Badge variant="grey" className="text-[10px]">
                        Kuota: {tier.quota} Tiket
                      </Badge>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveTier(tier.id)}
                      className="text-xs text-[#FF6B6B] hover:text-white hover:bg-[#FF3B30]/20 px-2 py-1 rounded-lg transition-colors cursor-pointer bg-transparent border-none flex items-center gap-1"
                    >
                      <Trash2 size={13} /> Hapus Tier
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Tier Name */}
                    <div>
                      <label className="block text-[11px] font-bold text-[#AAAAAA] uppercase tracking-wider mb-1.5">
                        Nama Kategori Tiket
                      </label>
                      <input
                        type="text"
                        value={tier.name}
                        onChange={(e) => handleUpdateTier(tier.id, { name: e.target.value })}
                        className="w-full px-3.5 py-2 bg-[#1F1F1F] border border-[#333333] rounded-xl text-sm font-semibold text-white outline-none focus:border-[#CFFE06]"
                      />
                    </div>

                    {/* Price */}
                    <div>
                      <label className="block text-[11px] font-bold text-[#AAAAAA] uppercase tracking-wider mb-1.5">
                        Harga Tiket (Rp)
                      </label>
                      <input
                        type="number"
                        min={0}
                        step={5000}
                        value={tier.price}
                        onChange={(e) => handleUpdateTier(tier.id, { price: Number(e.target.value) })}
                        className="w-full px-3.5 py-2 bg-[#1F1F1F] border border-[#333333] rounded-xl text-sm font-semibold text-white outline-none focus:border-[#CFFE06]"
                      />
                      <span className="text-[10px] text-[#777777]">Isi 0 untuk tiket gratis</span>
                    </div>

                    {/* Quota */}
                    <div>
                      <label className="block text-[11px] font-bold text-[#AAAAAA] uppercase tracking-wider mb-1.5">
                        Kuota Tiket (Pax)
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={tier.quota}
                        onChange={(e) => handleUpdateTier(tier.id, { quota: Number(e.target.value) })}
                        className="w-full px-3.5 py-2 bg-[#1F1F1F] border border-[#333333] rounded-xl text-sm font-semibold text-white outline-none focus:border-[#CFFE06]"
                      />
                    </div>
                  </div>

                  {/* Tier Benefits */}
                  <div>
                    <label className="block text-[11px] font-bold text-[#AAAAAA] uppercase tracking-wider mb-1.5">
                      Fasilitas & Keuntungan (Benefits)
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2.5">
                      {tier.benefits.map((benefit, bIdx) => (
                        <span
                          key={bIdx}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#222222] border border-[#383838] rounded-full text-xs text-[#E0E0E0]"
                        >
                          <Check size={12} className="text-[#CFFE06]" />
                          <span>{benefit}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveBenefit(tier.id, bIdx)}
                            className="text-[#9C9C9C] hover:text-white ml-0.5 bg-transparent border-none cursor-pointer"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>

                    {/* Add Benefit input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Tambah keuntungan (e.g. Akses VIP Lounge, Lunch box, Merchandise)..."
                        value={newBenefitInputs[tier.id] || ''}
                        onChange={(e) =>
                          setNewBenefitInputs({ ...newBenefitInputs, [tier.id]: e.target.value })
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAddBenefit(tier.id)
                          }
                        }}
                        className="flex-1 px-3.5 py-1.5 bg-[#1A1A1A] border border-[#333333] rounded-lg text-xs text-white placeholder:text-[#666666] outline-none focus:border-[#CFFE06]"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddBenefit(tier.id)}
                      >
                        Tambah
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}

              {/* Ticketing Summary Footer */}
              <div className="p-4 bg-[#181818] border border-[#2E2E2E] rounded-xl flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-4 text-xs">
                  <div>
                    <span className="text-[#888888] block">Total Kategori</span>
                    <span className="font-bold text-white text-sm">{ticketTiers.length} Kategori</span>
                  </div>
                  <div className="border-l border-[#333333] pl-4">
                    <span className="text-[#888888] block">Total Kapasitas Kuota</span>
                    <span className="font-bold text-[#CFFE06] text-sm">{totalCapacity.toLocaleString('id-ID')} Peserta</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  icon={<Plus size={14} />}
                  onClick={handleAddTier}
                >
                  Tambah Kategori Lain
                </Button>
              </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* GROUP 6: STATUS PENERBITAN (SAVE TO DRAFT OR PUBLISH) */}
        {/* ========================================================= */}
        <section className="bg-[#121212] border border-[#2A2A2A] rounded-2xl p-6 sm:p-8 hover:border-[#3D3D3D] transition-colors">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#202020]">
            <div className="w-9 h-9 rounded-xl bg-[#CFFE06]/10 border border-[#CFFE06]/30 flex items-center justify-center text-[#CFFE06] font-bold text-sm">
              6
            </div>
            <div>
              <h2 className="text-lg font-bold text-white m-0">Visibilitas & Publikasi (Draft / Publish)</h2>
              <p className="text-xs text-[#9C9C9C] m-0">
                Tentukan aksesibilitas acara sebelum menyimpan draft atau mempublikasikannya langsung.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Visibility Option */}
            <div>
              <label className="block text-xs font-bold text-[#E0E0E0] uppercase tracking-wider mb-2">
                Aksesibilitas / Visibilitas
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setVisibility('public')}
                  className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                    visibility === 'public'
                      ? 'bg-[#1e240a] border-[#CFFE06] shadow-[0_0_15px_rgba(207,254,6,0.15)]'
                      : 'bg-[#181818] border-[#2A2A2A] hover:border-[#3D3D3D]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-bold ${visibility === 'public' ? 'text-[#CFFE06]' : 'text-white'}`}>
                      Katalog Publik (Public)
                    </span>
                    {visibility === 'public' && <Check size={16} className="text-[#CFFE06]" />}
                  </div>
                  <p className="text-[11px] text-[#888888] leading-tight m-0">
                    Dapat dicari di katalog umum Convena, terindeks mesin pencari, dan bebas diakses peserta.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setVisibility('private')}
                  className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                    visibility === 'private'
                      ? 'bg-[#1e240a] border-[#CFFE06] shadow-[0_0_15px_rgba(207,254,6,0.15)]'
                      : 'bg-[#181818] border-[#2A2A2A] hover:border-[#3D3D3D]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-bold ${visibility === 'private' ? 'text-[#CFFE06]' : 'text-white'}`}>
                      Khusus Tautan (Private)
                    </span>
                    {visibility === 'private' && <Check size={16} className="text-[#CFFE06]" />}
                  </div>
                  <p className="text-[11px] text-[#888888] leading-tight m-0">
                    Hanya dapat diakses melalui link langsung. Tidak muncul di beranda atau katalog publik.
                  </p>
                </button>
              </div>
            </div>

            {/* Final Action Buttons */}
            <div className="pt-6 border-t border-[#222222] flex flex-col sm:flex-row items-center justify-between gap-4">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => navigate('/dashboard/events')}
                disabled={isLoading}
              >
                Batal & Kembali
              </Button>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  icon={<Save size={16} />}
                  onClick={() => handleSave('draft')}
                  disabled={isLoading}
                  className="flex-1 sm:flex-initial"
                >
                  {isLoading ? 'Menyimpan...' : 'Simpan sebagai Draft'}
                </Button>

                <Button
                  type="button"
                  variant="accent"
                  size="md"
                  icon={<Send size={16} />}
                  onClick={() => handleSave('published')}
                  disabled={isLoading}
                  className="flex-1 sm:flex-initial"
                >
                  {isLoading ? 'Menyimpan...' : 'Publikasikan Sekarang'}
                </Button>
              </div>
            </div>
          </div>
        </section>
      </form>
    </div>
  )
}
