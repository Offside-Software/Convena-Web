import React, { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
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
import { LocationPickerMap } from '../../components/maps/LocationPickerMap.tsx'
import { eventsService } from '../../services/events.service.ts'
import { organizationService } from '../../services/organization.service.ts'
import type { Organization } from '../../types/organization.ts'
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
  const { id: editEventId } = useParams<{ id?: string }>()
  const isEditMode = Boolean(editEventId)

  // 1. General State
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<EventCategory>('festival')
  const [shortDescription, setShortDescription] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [currentStatus, setCurrentStatus] = useState<EventStatus>('draft')

  // 2. Location State
  const [locationType, setLocationType] = useState<LocationType>('offline')
  const [venueName, setVenueName] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [onlineUrl, setOnlineUrl] = useState('')
  const [latitude, setLatitude] = useState<number | null>(-6.8915)
  const [longitude, setLongitude] = useState<number | null>(107.6107)

  // 3. Organization State
  const [organizationId, setOrganizationId] = useState<string>('')
  const [organizationName, setOrganizationName] = useState('')
  const [company, setCompany] = useState('')
  const [userOrgs, setUserOrgs] = useState<Organization[]>([])

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

  React.useEffect(() => {
    let isMounted = true
    organizationService.getOrganizations().then((orgs) => {
      if (!isMounted) return
      setUserOrgs(orgs)
      if (!editEventId && orgs.length > 0) {
        setOrganizationId((curr) => curr || orgs[0].id)
        setOrganizationName((curr) => curr || orgs[0].name)
        if (orgs[0].company) {
          setCompany((curr) => curr || orgs[0].company || '')
        }
      }
    })

    if (editEventId) {
      eventsService.getEventById(editEventId).then((ev) => {
        if (!isMounted || !ev) return
        setTitle(ev.title)
        setCategory(ev.category)
        setShortDescription(ev.shortDescription || '')
        setDescription(ev.description || '')
        setCurrentStatus(ev.status)
        if (ev.startDate) {
          setStartDate(new Date(ev.startDate).toISOString().slice(0, 16))
        }
        if (ev.endDate) {
          setEndDate(new Date(ev.endDate).toISOString().slice(0, 16))
        }
        setLocationType(ev.locationType || 'offline')
        setVenueName(ev.venueName || '')
        setAddress(ev.address || '')
        setCity(ev.city || '')
        setOnlineUrl(ev.onlineUrl || '')
        if (typeof ev.latitude === 'number') setLatitude(ev.latitude)
        if (typeof ev.longitude === 'number') setLongitude(ev.longitude)
        if (ev.organizationId) setOrganizationId(ev.organizationId)
        setOrganizationName(ev.organizationName || '')
        setCompany(ev.company || '')
        setVisibility(ev.visibility || 'public')
        if (ev.bannerUrl) {
          if (DEFAULT_BANNERS.includes(ev.bannerUrl)) {
            setBannerUrl(ev.bannerUrl)
            setIsCustomBanner(false)
          } else {
            setCustomBannerUrl(ev.bannerUrl)
            setIsCustomBanner(true)
          }
        }
        if (Array.isArray(ev.ticketTiers) && ev.ticketTiers.length > 0) {
          setTicketTiers(ev.ticketTiers)
        }
      })
    }

    return () => {
      isMounted = false
    }
  }, [editEventId])

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

      const payload = {
        title: title.trim(),
        organizationId: organizationId || undefined,
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
        latitude: locationType !== 'online' ? latitude : null,
        longitude: locationType !== 'online' ? longitude : null,
        organizationName: organizationName.trim() || undefined,
        company: company.trim() || undefined,
        bannerUrl: activeBanner,
        ticketTiers: ticketTiers.map((tier) => ({
          ...tier,
          price: Number(tier.price) || 0,
          quota: Number(tier.quota) || 0,
        })),
      }

      if (isEditMode && editEventId) {
        await eventsService.updateEvent(editEventId, payload)
      } else {
        await eventsService.createEvent(payload)
      }

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
    <div className="font-['Montserrat',sans-serif] bg-[#000000] text-white min-h-screen pb-12">
      {/* Top Header / Navigation Breadcrumb */}
      <div className="border-b border-[#202020] pb-3 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Link
            to="/dashboard/events"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#9C9C9C] hover:text-[#CFFE06] transition-colors no-underline"
          >
            <ArrowLeft size={13} /> Kembali ke Kelola Event
          </Link>
          <span className="text-xs text-[#555555]">/</span>
          <span className="text-xs text-[#CFFE06] font-semibold">
            {isEditMode ? 'Edit & Revisi Event' : 'Buat Event Baru'}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="accent" className="text-[10px] py-0 px-2">
                {isEditMode ? `REVISI EVENT (${currentStatus.toUpperCase()})` : 'PANEL PEMBUATAN EVENT'}
              </Badge>
              <Badge variant="dark" className="text-[10px] py-0 px-2">
                {locationType.toUpperCase()}
              </Badge>
            </div>
            <h1 className="!text-lg sm:!text-xl font-extrabold tracking-tight !text-white m-0 !leading-snug">
              {isEditMode ? 'Edit & Revisi Event' : 'Buat & Publikasikan Event'}
            </h1>
            <p className="!text-xs !text-[#9C9C9C] mt-0.5 max-w-2xl !leading-normal m-0">
              {isEditMode
                ? 'Perbarui detail event kapan saja termasuk event yang sudah dipublikasikan untuk revisi mendesak.'
                : 'Lengkapi 6 kelompok data berikut secara terperinci untuk mengaktifkan halaman registrasi, penjualan tiket, dan manajemen kepanitiaan Anda.'}
            </p>
          </div>

          {/* Quick Header Action Buttons — Prioritize Save as Draft */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="accent"
              size="sm"
              className="!py-1.5 !px-3 !text-xs"
              icon={<Save size={13} />}
              onClick={() => handleSave('draft')}
              disabled={isLoading}
            >
              {isLoading ? 'Menyimpan...' : 'Simpan sebagai Draft'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="!py-1.5 !px-3 !text-xs"
              icon={<Send size={13} />}
              onClick={() => handleSave('published')}
              disabled={isLoading}
            >
              {isEditMode && currentStatus === 'published' ? 'Simpan & Tetap Publik' : 'Publikasikan'}
            </Button>
          </div>
        </div>
      </div>

      {/* Global Error Notification */}
      {errorMessage && (
        <div className="bg-[#200010] border border-[#DF00D0] text-[#FF88EC] rounded-xl p-3 text-xs font-semibold flex items-center gap-2.5 mb-4 shadow-[0_0_20px_rgba(223,0,208,0.15)]">
          <AlertCircle size={16} className="shrink-0 text-[#DF00D0]" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* FORM BODY: MULTI-COLUMN RESPONSIVE WORKSPACE */}
      <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
        {/* ROW 1: 2-COLUMN GRID ON DESKTOP (LEFT: INFO & LOCATION, RIGHT: ORG & BANNER) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* LEFT COLUMN: Groups 1 & 2 */}
          <div className="lg:col-span-7 space-y-4">
            {/* GROUP 1: INFORMASI UMUM (GENERAL) */}
            <section className="bg-[#121212] border border-[#2A2A2A] rounded-xl p-3.5 sm:p-4 hover:border-[#3D3D3D] transition-colors">
              <div className="flex items-center gap-2.5 mb-3.5 pb-2.5 border-b border-[#202020]">
                <div>
                  <h2 className="!text-sm sm:!text-base font-bold !text-white m-0">Informasi Umum (General)</h2>
                  <p className="!text-[11px] !text-[#9C9C9C] m-0 !leading-tight">
                    Judul utama, ringkasan, kategori, serta tanggal pelaksanaan acara.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {/* Title */}
                <div>
                  <label className="block text-[11px] font-bold text-[#E0E0E0] uppercase tracking-wider mb-1">
                    Judul Kegiatan / Acara *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Arkavidia 9.0: National Tech Festival & Hackathon"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#333333] rounded-lg text-xs font-medium text-white placeholder:text-[#9C9C9C]/50 outline-none focus:border-[#CFFE06] focus:ring-1 focus:ring-[#CFFE06] transition-all"
                  />
                </div>

                {/* Category Select Grid */}
                <div>
                  <label className="block text-[11px] font-bold text-[#E0E0E0] uppercase tracking-wider mb-1">
                    Kategori Acara *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {CATEGORY_OPTIONS.map((cat) => {
                      const isSelected = category === cat.id
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setCategory(cat.id)}
                          className={`text-left p-2 rounded-lg border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#1e240a] border-[#CFFE06] shadow-[0_0_12px_rgba(207,254,6,0.15)]'
                              : 'bg-[#181818] border-[#2A2A2A] hover:border-[#3D3D3D] text-[#9C9C9C]'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-0.5">
                            <span className={`text-xs font-bold truncate ${isSelected ? 'text-[#CFFE06]' : 'text-white'}`}>
                              {cat.label}
                            </span>
                            {isSelected && <Check size={12} className="text-[#CFFE06] shrink-0" />}
                          </div>
                          <p className="!text-[10px] !text-[#888888] !leading-tight m-0 line-clamp-1">{cat.desc}</p>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Date and Time: Start & End */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-0.5">
                  <div>
                    <label className="block text-[11px] font-bold text-[#E0E0E0] uppercase tracking-wider mb-1">
                      <Calendar size={12} className="inline mr-1 text-[#CFFE06]" />
                      Waktu Mulai Acara *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-1.5 bg-[#1A1A1A] border border-[#333333] rounded-lg text-xs font-medium text-white outline-none focus:border-[#CFFE06] transition-all [color-scheme:dark]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#E0E0E0] uppercase tracking-wider mb-1">
                      <Calendar size={12} className="inline mr-1 text-[#CFFE06]" />
                      Waktu Selesai Acara *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-1.5 bg-[#1A1A1A] border border-[#333333] rounded-lg text-xs font-medium text-white outline-none focus:border-[#CFFE06] transition-all [color-scheme:dark]"
                    />
                  </div>
                </div>

                {/* Short Description */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-[#E0E0E0] uppercase tracking-wider">
                      Ringkasan Singkat (Short Description)
                    </label>
                    <span className="text-[10px] text-[#777777]">Maks. 160 karakter</span>
                  </div>
                  <input
                    type="text"
                    maxLength={160}
                    placeholder="e.g. Festival teknologi tahunan mahasiswa dengan kompetisi hackathon, talkshow..."
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#1A1A1A] border border-[#333333] rounded-lg text-xs font-medium text-white placeholder:text-[#9C9C9C]/50 outline-none focus:border-[#CFFE06] transition-all"
                  />
                </div>

                {/* Full Description */}
                <div>
                  <label className="block text-[11px] font-bold text-[#E0E0E0] uppercase tracking-wider mb-1">
                    Deskripsi Lengkap Kegiatan
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Jelaskan secara mendalam mengenai latar belakang kegiatan, susunan agenda, profil narasumber atau juri, syarat & ketentuan peserta..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#333333] rounded-lg text-xs font-medium text-white placeholder:text-[#9C9C9C]/50 outline-none focus:border-[#CFFE06] transition-all leading-relaxed"
                  />
                </div>
              </div>
            </section>

            {/* FORMAT & LOKASI PENYELENGGARAAN (LOCATION) */}
            <section className="bg-[#121212] border border-[#2A2A2A] rounded-xl p-3.5 sm:p-4 hover:border-[#3D3D3D] transition-colors">
              <div className="flex items-center gap-2.5 mb-3.5 pb-2.5 border-b border-[#202020]">
                <div>
                  <h2 className="!text-sm sm:!text-base font-bold !text-white m-0">Format & Lokasi Penyelenggaraan (Location)</h2>
                  <p className="!text-[11px] !text-[#9C9C9C] m-0 !leading-tight">
                    Pilih format tatap muka, daring penuh, atau hybrid serta rincian venue/tautan meeting.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {/* Format Penyelenggaraan selector */}
                <div>
                  <label className="block text-[11px] font-bold text-[#E0E0E0] uppercase tracking-wider mb-1">
                    Format Penyelenggaraan *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      {
                        id: 'offline' as LocationType,
                        label: 'Tatap Muka',
                        sub: 'Offline',
                        icon: <MapPin size={14} className="text-[#CFFE06]" />,
                      },
                      {
                        id: 'online' as LocationType,
                        label: 'Daring Penuh',
                        sub: 'Online',
                        icon: <Video size={14} className="text-[#DF00D0]" />,
                      },
                      {
                        id: 'hybrid' as LocationType,
                        label: 'Campuran',
                        sub: 'Hybrid',
                        icon: <Radio size={14} className="text-[#CFFE06]" />,
                      },
                    ].map((fmt) => {
                      const isSelected = locationType === fmt.id
                      return (
                        <button
                          key={fmt.id}
                          type="button"
                          onClick={() => setLocationType(fmt.id)}
                          className={`text-left p-2.5 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'bg-[#1e240a] border-[#CFFE06] shadow-[0_0_12px_rgba(207,254,6,0.15)]'
                              : 'bg-[#181818] border-[#2A2A2A] hover:border-[#3D3D3D]'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            {fmt.icon}
                            {isSelected && <Check size={13} className="text-[#CFFE06]" />}
                          </div>
                          <div>
                            <span className={`block text-xs font-bold leading-tight ${isSelected ? 'text-[#CFFE06]' : 'text-white'}`}>
                              {fmt.label}
                            </span>
                            <span className="text-[10px] text-[#777777] block">({fmt.sub})</span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Offline/Hybrid Physical Venue Fields */}
                {locationType !== 'online' && (
                  <div className="space-y-3 pt-1 border-t border-[#202020]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-[#E0E0E0] uppercase tracking-wider mb-1">
                          <MapPin size={12} className="inline mr-1 text-[#CFFE06]" />
                          Nama Gedung / Venue
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Telkom Convention Hall"
                          value={venueName}
                          onChange={(e) => setVenueName(e.target.value)}
                          className="w-full px-3 py-1.5 bg-[#1A1A1A] border border-[#333333] rounded-lg text-xs font-medium text-white placeholder:text-[#9C9C9C]/50 outline-none focus:border-[#CFFE06] transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#E0E0E0] uppercase tracking-wider mb-1">
                          Kota Pelaksanaan
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Bandung, Jawa Barat"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full px-3 py-1.5 bg-[#1A1A1A] border border-[#333333] rounded-lg text-xs font-medium text-white placeholder:text-[#9C9C9C]/50 outline-none focus:border-[#CFFE06] transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#E0E0E0] uppercase tracking-wider mb-1">
                        Alamat Lengkap Venue
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Jl. Telekomunikasi No. 1, Terusan Buahbatu, Sukapura"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full px-3 py-1.5 bg-[#1A1A1A] border border-[#333333] rounded-lg text-xs font-medium text-white placeholder:text-[#9C9C9C]/50 outline-none focus:border-[#CFFE06] transition-all"
                      />
                    </div>

                    {/* Leaflet Map Location Picker */}
                    <LocationPickerMap
                      latitude={latitude}
                      longitude={longitude}
                      city={city}
                      venueName={venueName}
                      onChange={({ latitude: lat, longitude: lng }) => {
                        setLatitude(lat)
                        setLongitude(lng)
                      }}
                    />
                  </div>
                )}

                {/* Online/Hybrid Meeting URL Fields */}
                {locationType !== 'offline' && (
                  <div className="pt-1 border-t border-[#202020]">
                    <label className="block text-[11px] font-bold text-[#E0E0E0] uppercase tracking-wider mb-1">
                      <Globe size={12} className="inline mr-1 text-[#CFFE06]" />
                      Tautan Pertemuan Online (Online Meeting URL)
                    </label>
                    <input
                      type="url"
                      placeholder="https://zoom.us/j/... atau https://meet.google.com/..."
                      value={onlineUrl}
                      onChange={(e) => setOnlineUrl(e.target.value)}
                      className="w-full px-3 py-1.5 bg-[#1A1A1A] border border-[#333333] rounded-lg text-xs font-medium text-white placeholder:text-[#9C9C9C]/50 outline-none focus:border-[#CFFE06] transition-all"
                    />
                    <p className="!text-[10px] !text-[#888888] mt-1 m-0">
                      Tautan ini akan diberikan kepada peserta yang telah mengantongi tiket valid saat mendekati hari H.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: Groups 3 & 4 */}
          <div className="lg:col-span-5 space-y-4">
            {/* PENYELENGGARA & PERUSAHAAN (ORGANIZATION) */}
            <section className="bg-[#121212] border border-[#2A2A2A] rounded-xl p-3.5 sm:p-4 hover:border-[#3D3D3D] transition-colors">
              <div className="flex items-center gap-2.5 mb-3.5 pb-2.5 border-b border-[#202020]">
                <div>
                  <h2 className="!text-sm sm:!text-base font-bold !text-white m-0">Penyelenggara & Instansi</h2>
                  <p className="!text-[11px] !text-[#9C9C9C] m-0 !leading-tight">
                    Identitas badan pelaksana acara serta instansi induk.
                  </p>
                </div>
              </div>

              {userOrgs.length > 0 && (
                <div className="mb-3 p-2.5 bg-[#1A1A1A] border border-[#2B2B2B] rounded-lg">
                  <span className="text-[11px] font-semibold text-[#9C9C9C] block mb-1.5">
                    Pilih Organisasi Induk Event Ini *:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {userOrgs.map((org) => {
                      const isSelected = organizationId === org.id || (!organizationId && organizationName === org.name)
                      return (
                        <button
                          key={org.id}
                          type="button"
                          onClick={() => {
                            setOrganizationId(org.id)
                            setOrganizationName(org.name)
                            if (org.company) setCompany(org.company)
                          }}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#CFFE06]/15 border-[#CFFE06] text-[#CFFE06]'
                              : 'bg-[#222222] border-[#333333] text-[#CCCCCC] hover:text-white hover:border-[#555555]'
                          }`}
                        >
                          {org.name} ({org.myRoleDisplay || org.myRole || 'Member'})
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#E0E0E0] uppercase tracking-wider mb-1">
                    <Building size={12} className="inline mr-1 text-[#CFFE06]" />
                    Nama Organisasi / Kepanitiaan
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BEM Kema Tel-U / HMIF ITB"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#1A1A1A] border border-[#333333] rounded-lg text-xs font-medium text-white placeholder:text-[#9C9C9C]/50 outline-none focus:border-[#CFFE06] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#E0E0E0] uppercase tracking-wider mb-1">
                    <Building size={12} className="inline mr-1 text-[#CFFE06]" />
                    Nama Perusahaan / Institusi (Company)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Telkom University / PT Convena Global"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#1A1A1A] border border-[#333333] rounded-lg text-xs font-medium text-white placeholder:text-[#9C9C9C]/50 outline-none focus:border-[#CFFE06] transition-all"
                  />
                  <p className="!text-[10px] !text-[#888888] mt-1 m-0">
                    Dapat berupa nama kampus, perusahaan sponsor, atau institusi asosiasi.
                  </p>
                </div>
              </div>
            </section>

            {/* GROUP 4: DESAIN SAMPUL & BANNER (DESIGN) */}
            <section className="bg-[#121212] border border-[#2A2A2A] rounded-xl p-3.5 sm:p-4 hover:border-[#3D3D3D] transition-colors">
              <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-[#202020] flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div>
                    <h2 className="!text-sm sm:!text-base font-bold !text-white m-0">Desain Sampul & Banner</h2>
                    <p className="!text-[11px] !text-[#9C9C9C] m-0 !leading-tight">
                      Template preset atau URL banner mandiri.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCustomBanner(!isCustomBanner)}
                  className="text-[11px] font-bold text-[#CFFE06] hover:underline cursor-pointer bg-transparent border-none flex items-center gap-1"
                >
                  {isCustomBanner ? 'Template Tersedia' : 'URL Banner Sendiri'}
                </button>
              </div>

              <div className="space-y-3">
                {isCustomBanner ? (
                  <div>
                    <label className="block text-[11px] font-bold text-[#E0E0E0] uppercase tracking-wider mb-1">
                      Tautan URL Banner Gambar (Direct URL)
                    </label>
                    <input
                      type="url"
                      placeholder="https://example.com/banner-event.jpg"
                      value={customBannerUrl}
                      onChange={(e) => setCustomBannerUrl(e.target.value)}
                      className="w-full px-3 py-1.5 bg-[#1A1A1A] border border-[#333333] rounded-lg text-xs font-medium text-white placeholder:text-[#9C9C9C]/50 outline-none focus:border-[#CFFE06] transition-all"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] font-bold text-[#E0E0E0] uppercase tracking-wider mb-1">
                      Pilihan Template Banner
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {DEFAULT_BANNERS.map((url, i) => {
                        const isSelected = bannerUrl === url
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setBannerUrl(url)}
                            className={`relative rounded-lg overflow-hidden border cursor-pointer transition-all aspect-video group ${
                              isSelected
                                ? 'border-[#CFFE06] ring-1 ring-[#CFFE06]'
                                : 'border-[#2A2A2A] opacity-60 hover:opacity-100 hover:border-[#444444]'
                            }`}
                          >
                            <img
                              src={url}
                              alt={`Template ${i + 1}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                            {isSelected && (
                              <div className="absolute top-1 right-1 bg-[#CFFE06] text-black rounded-full p-0.5 shadow-md">
                                <Check size={10} className="stroke-[3]" />
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
                  <span className="block text-[11px] font-bold text-[#9C9C9C] uppercase tracking-wider mb-1">
                    Pratinjau Banner Sampul
                  </span>
                  <div className="relative h-28 sm:h-32 w-full rounded-xl overflow-hidden border border-[#333333] bg-[#161616]">
                    <img
                      src={activeBanner}
                      alt="Banner Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                    <div className="absolute bottom-2.5 left-2.5 right-2.5">
                      <Badge variant="accent" className="mb-0.5 text-[9px] py-0 px-1.5">
                        {category.toUpperCase()}
                      </Badge>
                      <h3 className="!text-xs sm:!text-sm font-bold !text-white m-0 drop-shadow-md truncate">
                        {title || 'Judul Acara Anda'}
                      </h3>
                      <p className="!text-[10px] !text-[#E0E0E0] m-0 drop-shadow truncate">
                        {organizationName || 'Penyelenggara Acara'} • {company || 'Nama Perusahaan/Institusi'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* ========================================================= */}
        {/* ROW 2: GROUP 5: KATEGORI TIKET (TICKETING) - HORIZONTAL 3 CARDS */}
        {/* ========================================================= */}
        <section className="bg-[#121212] border border-[#2A2A2A] rounded-xl p-3.5 sm:p-4 hover:border-[#3D3D3D] transition-colors">
          <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-[#202020] flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#CFFE06]/10 border border-[#CFFE06]/30 flex items-center justify-center text-[#CFFE06] font-bold text-xs shrink-0">
                5
              </div>
              <div>
                <h2 className="!text-sm sm:!text-base font-bold !text-white m-0">Kategori Tiket & Kuota (Ticketing)</h2>
                <p className="!text-[11px] !text-[#9C9C9C] m-0 !leading-tight">
                  Tersedia default Standard, Gold, dan Platinum yang dapat Anda sesuaikan, tambahkan, atau hapus.
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="!py-1 !px-2.5 !text-xs"
              icon={<Plus size={13} />}
              onClick={handleAddTier}
            >
              Tambah Kategori Tiket
            </Button>
          </div>

          <div className="space-y-3">
            {/* Horizontal Grid of 3 Cards on Desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 items-stretch">
              {ticketTiers.map((tier, idx) => {
                const isFree = Number(tier.price) === 0
                return (
                  <div
                    key={tier.id}
                    className="p-3 bg-[#171717] border border-[#2E2E2E] rounded-lg hover:border-[#3E3E3E] transition-all flex flex-col justify-between space-y-2.5"
                  >
                    <div>
                      {/* Tier Card Header */}
                      <div className="flex items-center justify-between pb-2 border-b border-[#242424] mb-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Ticket size={13} className="text-[#CFFE06] shrink-0" />
                          <span className="text-xs font-extrabold text-white truncate">
                            Tier #{idx + 1}: {tier.name || 'Unnamed'}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveTier(tier.id)}
                          className="text-[11px] text-[#FF6B6B] hover:text-white hover:bg-[#FF3B30]/20 px-1.5 py-0.5 rounded transition-colors cursor-pointer bg-transparent border-none flex items-center gap-1 shrink-0"
                          title="Hapus Tier"
                        >
                          <Trash2 size={12} />
                          <span className="sr-only sm:not-sr-only text-[10px]">Hapus</span>
                        </button>
                      </div>

                      {/* Badges */}
                      <div className="flex items-center gap-1.5 flex-wrap mb-2.5">
                        <Badge variant={isFree ? 'accent' : 'dark'} className="text-[10px] py-0 px-1.5 font-bold">
                          {isFree ? 'GRATIS' : `Rp ${Number(tier.price).toLocaleString('id-ID')}`}
                        </Badge>
                        <Badge variant="grey" className="text-[10px] py-0 px-1.5">
                          Kuota: {tier.quota} Tiket
                        </Badge>
                      </div>

                      {/* Inputs */}
                      <div className="space-y-2">
                        {/* Tier Name */}
                        <div>
                          <label className="block text-[10px] font-bold text-[#AAAAAA] uppercase tracking-wider mb-1">
                            Nama Kategori
                          </label>
                          <input
                            type="text"
                            value={tier.name}
                            onChange={(e) => handleUpdateTier(tier.id, { name: e.target.value })}
                            className="w-full px-2.5 py-1 bg-[#1F1F1F] border border-[#333333] rounded-md text-xs font-semibold text-white outline-none focus:border-[#CFFE06]"
                          />
                        </div>

                        {/* Price and Quota in 2 cols */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-[#AAAAAA] uppercase tracking-wider mb-1">
                              Harga (Rp)
                            </label>
                            <input
                              type="number"
                              min={0}
                              step={5000}
                              value={tier.price}
                              onChange={(e) => handleUpdateTier(tier.id, { price: Number(e.target.value) })}
                              className="w-full px-2 py-1 bg-[#1F1F1F] border border-[#333333] rounded-md text-xs font-semibold text-white outline-none focus:border-[#CFFE06]"
                            />
                            <span className="text-[9px] text-[#777777] block mt-0.5">0 = gratis</span>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-[#AAAAAA] uppercase tracking-wider mb-1">
                              Kuota (Pax)
                            </label>
                            <input
                              type="number"
                              min={1}
                              value={tier.quota}
                              onChange={(e) => handleUpdateTier(tier.id, { quota: Number(e.target.value) })}
                              className="w-full px-2 py-1 bg-[#1F1F1F] border border-[#333333] rounded-md text-xs font-semibold text-white outline-none focus:border-[#CFFE06]"
                            />
                          </div>
                        </div>

                        {/* Benefits list */}
                        <div className="pt-1">
                          <label className="block text-[10px] font-bold text-[#AAAAAA] uppercase tracking-wider mb-1">
                            Fasilitas / Keuntungan
                          </label>
                          <div className="flex flex-wrap gap-1 mb-2 min-h-[22px]">
                            {tier.benefits.map((benefit, bIdx) => (
                              <span
                                key={bIdx}
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#222222] border border-[#383838] rounded text-[10px] text-[#E0E0E0]"
                              >
                                <Check size={9} className="text-[#CFFE06]" />
                                <span className="truncate max-w-[120px]">{benefit}</span>
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
                        </div>
                      </div>
                    </div>

                    {/* Add Benefit Input */}
                    <div className="flex gap-1.5 pt-2 border-t border-[#222222]">
                      <input
                        type="text"
                        placeholder="Tambah keuntungan..."
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
                        className="flex-1 bg-[#1A1A1A] border border-[#333333] rounded-md text-[10px] text-white placeholder:text-[#666666] outline-none focus:border-[#CFFE06]"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-[11px]"
                        icon={<Plus size={15}/>}
                        onClick={() => handleAddBenefit(tier.id)}
                      >
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Ticketing Summary Footer */}
            <div className="p-3 bg-[#181818] border border-[#2E2E2E] rounded-lg flex items-center justify-between flex-wrap gap-2.5">
              <div className="flex items-center gap-3 text-xs">
                <div>
                  <span className="text-[#888888] block text-[10px]">Total Kategori</span>
                  <span className="font-bold text-white text-xs">{ticketTiers.length} Kategori</span>
                </div>
                <div className="border-l border-[#333333] pl-3">
                  <span className="text-[#888888] block text-[10px]">Total Kapasitas Kuota</span>
                  <span className="font-bold text-[#CFFE06] text-xs">{totalCapacity.toLocaleString('id-ID')} Peserta</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* ROW 3: GROUP 6: STATUS PENERBITAN (SAVE TO DRAFT OR PUBLISH) */}
        {/* ========================================================= */}
        <section className="bg-[#121212] border border-[#2A2A2A] rounded-xl p-3.5 sm:p-4 hover:border-[#3D3D3D] transition-colors">
          <div className="flex items-center gap-2.5 mb-3.5 pb-2.5 border-b border-[#202020]">
            <div className="w-7 h-7 rounded-lg bg-[#CFFE06]/10 border border-[#CFFE06]/30 flex items-center justify-center text-[#CFFE06] font-bold text-xs shrink-0">
              6
            </div>
            <div>
              <h2 className="!text-sm sm:!text-base font-bold !text-white m-0">Visibilitas & Publikasi (Draft / Publish)</h2>
              <p className="!text-[11px] !text-[#9C9C9C] m-0 !leading-tight">
                Tentukan aksesibilitas acara sebelum menyimpan draft atau mempublikasikannya langsung.
              </p>
            </div>
          </div>

          <div className="space-y-3.5">
            {/* Visibility Option */}
            <div>
              <label className="block text-[11px] font-bold text-[#E0E0E0] uppercase tracking-wider mb-1">
                Aksesibilitas / Visibilitas
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setVisibility('public')}
                  className={`text-left p-3 rounded-lg border transition-all cursor-pointer ${
                    visibility === 'public'
                      ? 'bg-[#1e240a] border-[#CFFE06] shadow-[0_0_12px_rgba(207,254,6,0.15)]'
                      : 'bg-[#181818] border-[#2A2A2A] hover:border-[#3D3D3D]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`text-xs font-bold ${visibility === 'public' ? 'text-[#CFFE06]' : 'text-white'}`}>
                      Katalog Publik (Public)
                    </span>
                    {visibility === 'public' && <Check size={14} className="text-[#CFFE06]" />}
                  </div>
                  <p className="!text-[10px] !text-[#888888] !leading-tight m-0">
                    Dapat dicari di katalog umum Convena, terindeks mesin pencari, dan bebas diakses peserta.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setVisibility('private')}
                  className={`text-left p-3 rounded-lg border transition-all cursor-pointer ${
                    visibility === 'private'
                      ? 'bg-[#1e240a] border-[#CFFE06] shadow-[0_0_12px_rgba(207,254,6,0.15)]'
                      : 'bg-[#181818] border-[#2A2A2A] hover:border-[#3D3D3D]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`text-xs font-bold ${visibility === 'private' ? 'text-[#CFFE06]' : 'text-white'}`}>
                      Khusus Tautan (Private)
                    </span>
                    {visibility === 'private' && <Check size={14} className="text-[#CFFE06]" />}
                  </div>
                  <p className="!text-[10px] !text-[#888888] !leading-tight m-0">
                    Hanya dapat diakses melalui link langsung. Tidak muncul di beranda atau katalog publik.
                  </p>
                </button>
              </div>
            </div>

            {/* Final Action Buttons */}
            <div className="pt-3.5 border-t border-[#222222] flex flex-col sm:flex-row items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="!py-1.5 !px-3 !text-xs"
                onClick={() => navigate('/dashboard/events')}
                disabled={isLoading}
              >
                Batal & Kembali
              </Button>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="accent"
                  size="sm"
                  className="!py-1.5 !px-3.5 !text-xs flex-1 sm:flex-initial"
                  icon={<Save size={14} />}
                  onClick={() => handleSave('draft')}
                  disabled={isLoading}
                >
                  {isLoading ? 'Menyimpan...' : 'Simpan sebagai Draft'}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="!py-1.5 !px-3.5 !text-xs flex-1 sm:flex-initial"
                  icon={<Send size={14} />}
                  onClick={() => handleSave('published')}
                  disabled={isLoading}
                >
                  {isLoading
                    ? 'Menyimpan...'
                    : isEditMode && currentStatus === 'published'
                      ? 'Simpan & Tetap Publik'
                      : 'Publikasikan Sekarang'}
                </Button>
              </div>
            </div>
          </div>
        </section>
      </form>
    </div>
  )
}
