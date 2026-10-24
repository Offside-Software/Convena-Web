import React, { useState } from 'react'
import { Calendar, MapPin, Building, Image, Sparkles, Check, AlertCircle } from 'lucide-react'
import { Modal } from '../../../components/common/Modal.tsx'
import { Button } from '../../../components/common/Button.tsx'
import { eventsService } from '../../../services/events.service.ts'
import type { Event, EventCategory } from '../../../types/event.ts'

export interface CreateEventModalProps {
  isOpen: boolean
  onClose: () => void
  onEventCreated: (event: Event) => void
}

const DEFAULT_BANNERS = [
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80',
  'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&q=80',
  'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1200&q=80',
  'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200&q=80',
]

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  onEventCreated,
}) => {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<EventCategory>('festival')
  const [shortDescription, setShortDescription] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [locationType, setLocationType] = useState<'offline' | 'online' | 'hybrid'>('offline')
  const [venueName, setVenueName] = useState('')
  const [city, setCity] = useState('')
  const [onlineUrl, setOnlineUrl] = useState('')
  const [organizationName, setOrganizationName] = useState('')
  const [university, setUniversity] = useState('')
  const [bannerUrl, setBannerUrl] = useState(DEFAULT_BANNERS[0])
  const [customBanner, setCustomBanner] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!title.trim()) {
      setErrorMessage('Judul event wajib diisi')
      return
    }

    if (!startDate || !endDate) {
      setErrorMessage('Tanggal mulai dan selesai wajib diisi')
      return
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    if (end < start) {
      setErrorMessage('Tanggal selesai tidak boleh lebih awal dari tanggal mulai')
      return
    }

    try {
      setIsLoading(true)
      const created = await eventsService.createEvent({
        title: title.trim(),
        category,
        shortDescription: shortDescription.trim() || undefined,
        description: description.trim() || undefined,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        locationType,
        venueName: venueName.trim() || undefined,
        city: city.trim() || undefined,
        onlineUrl: onlineUrl.trim() || undefined,
        organizationName: organizationName.trim() || undefined,
        university: university.trim() || undefined,
        bannerUrl,
      })

      onEventCreated(created)
      onClose()
      // Reset form
      setTitle('')
      setShortDescription('')
      setDescription('')
      setStartDate('')
      setEndDate('')
      setVenueName('')
      setCity('')
      setOnlineUrl('')
      setOrganizationName('')
      setUniversity('')
    } catch (err: unknown) {
      const error = err as { message?: string }
      setErrorMessage(error?.message || 'Gagal membuat event. Pastikan Anda telah masuk.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Buat Event Baru Ormawa"
      headerColor="pink"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {errorMessage && (
          <div className="p-3 bg-[#FF4B91]/15 border-2 border-[#FF4B91] rounded-xl flex items-center gap-2 text-xs font-bold text-[#121215]">
            <AlertCircle size={16} className="text-[#FF4B91] shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Section: Basic Info */}
        <div>
          <label className="block font-['Space_Grotesk',sans-serif] font-bold text-xs uppercase tracking-wider text-[#121215] mb-1.5">
            Judul Kegiatan / Event <span className="text-[#FF4B91]">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Arkavidia 10.0: National Tech Festival"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border-2 border-[#121215] rounded-xl text-sm font-semibold text-[#121215] shadow-[3px_3px_0px_0px_#121215] focus:outline-none focus:border-[#01CDFE] focus:shadow-[4px_4px_0px_0px_#01CDFE] transition-all"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-['Space_Grotesk',sans-serif] font-bold text-xs uppercase tracking-wider text-[#121215] mb-1.5">
              Kategori Acara <span className="text-[#FF4B91]">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as EventCategory)}
              className="w-full px-3.5 py-2.5 bg-white border-2 border-[#121215] rounded-xl text-sm font-semibold text-[#121215] shadow-[3px_3px_0px_0px_#121215] focus:outline-none focus:border-[#01CDFE] cursor-pointer"
            >
              <option value="festival">Festival & Expo</option>
              <option value="seminar">Seminar / Talkshow</option>
              <option value="workshop">Workshop & Pelatihan</option>
              <option value="competition">Kompetisi & Hackathon</option>
              <option value="conference">Konferensi Ilmiah</option>
              <option value="gathering">Gathering & Musyawarah</option>
            </select>
          </div>

          <div>
            <label className="block font-['Space_Grotesk',sans-serif] font-bold text-xs uppercase tracking-wider text-[#121215] mb-1.5">
              Format Lokasi <span className="text-[#FF4B91]">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['offline', 'online', 'hybrid'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setLocationType(mode)}
                  className={`py-2 px-1 text-xs font-['Space_Grotesk',sans-serif] font-bold capitalize rounded-lg border-2 border-[#121215] transition-all cursor-pointer ${
                    locationType === mode
                      ? 'bg-[#FFE600] shadow-[2px_2px_0px_0px_#121215]'
                      : 'bg-white hover:bg-gray-100'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section: Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-['Space_Grotesk',sans-serif] font-bold text-xs uppercase tracking-wider text-[#121215] mb-1.5">
              <Calendar size={14} className="inline mr-1 text-gray-500" />
              Waktu Mulai <span className="text-[#FF4B91]">*</span>
            </label>
            <input
              type="datetime-local"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border-2 border-[#121215] rounded-xl text-sm font-medium text-[#121215] shadow-[3px_3px_0px_0px_#121215] focus:outline-none focus:border-[#01CDFE]"
            />
          </div>

          <div>
            <label className="block font-['Space_Grotesk',sans-serif] font-bold text-xs uppercase tracking-wider text-[#121215] mb-1.5">
              <Calendar size={14} className="inline mr-1 text-gray-500" />
              Waktu Selesai <span className="text-[#FF4B91]">*</span>
            </label>
            <input
              type="datetime-local"
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border-2 border-[#121215] rounded-xl text-sm font-medium text-[#121215] shadow-[3px_3px_0px_0px_#121215] focus:outline-none focus:border-[#01CDFE]"
            />
          </div>
        </div>

        {/* Section: Location Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {locationType !== 'online' && (
            <>
              <div>
                <label className="block font-['Space_Grotesk',sans-serif] font-bold text-xs uppercase tracking-wider text-[#121215] mb-1.5">
                  <MapPin size={14} className="inline mr-1 text-gray-500" />
                  Gedung / Tempat
                </label>
                <input
                  type="text"
                  placeholder="e.g. Aula Barat ITB"
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border-2 border-[#121215] rounded-xl text-sm font-medium text-[#121215] shadow-[3px_3px_0px_0px_#121215] focus:outline-none focus:border-[#01CDFE]"
                />
              </div>

              <div>
                <label className="block font-['Space_Grotesk',sans-serif] font-bold text-xs uppercase tracking-wider text-[#121215] mb-1.5">
                  Kota
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bandung"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border-2 border-[#121215] rounded-xl text-sm font-medium text-[#121215] shadow-[3px_3px_0px_0px_#121215] focus:outline-none focus:border-[#01CDFE]"
                />
              </div>
            </>
          )}

          {locationType !== 'offline' && (
            <div className={locationType === 'online' ? 'sm:col-span-2' : ''}>
              <label className="block font-['Space_Grotesk',sans-serif] font-bold text-xs uppercase tracking-wider text-[#121215] mb-1.5">
                Tautan Online / Zoom
              </label>
              <input
                type="url"
                placeholder="https://zoom.us/j/..."
                value={onlineUrl}
                onChange={(e) => setOnlineUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border-2 border-[#121215] rounded-xl text-sm font-medium text-[#121215] shadow-[3px_3px_0px_0px_#121215] focus:outline-none focus:border-[#01CDFE]"
              />
            </div>
          )}
        </div>

        {/* Section: Organizing Body */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-['Space_Grotesk',sans-serif] font-bold text-xs uppercase tracking-wider text-[#121215] mb-1.5">
              <Building size={14} className="inline mr-1 text-gray-500" />
              Nama Organisasi / BEM
            </label>
            <input
              type="text"
              placeholder="e.g. HMIF ITB"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border-2 border-[#121215] rounded-xl text-sm font-medium text-[#121215] shadow-[3px_3px_0px_0px_#121215] focus:outline-none focus:border-[#01CDFE]"
            />
          </div>

          <div>
            <label className="block font-['Space_Grotesk',sans-serif] font-bold text-xs uppercase tracking-wider text-[#121215] mb-1.5">
              Universitas / Kampus
            </label>
            <input
              type="text"
              placeholder="e.g. Institut Teknologi Bandung"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border-2 border-[#121215] rounded-xl text-sm font-medium text-[#121215] shadow-[3px_3px_0px_0px_#121215] focus:outline-none focus:border-[#01CDFE]"
            />
          </div>
        </div>

        {/* Section: Short Description */}
        <div>
          <label className="block font-['Space_Grotesk',sans-serif] font-bold text-xs uppercase tracking-wider text-[#121215] mb-1.5">
            Ringkasan Singkat (1-2 Kalimat)
          </label>
          <input
            type="text"
            placeholder="Festival teknologi tahunan terbesar mahasiswa informatika"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border-2 border-[#121215] rounded-xl text-sm font-medium text-[#121215] shadow-[3px_3px_0px_0px_#121215] focus:outline-none focus:border-[#01CDFE]"
          />
        </div>

        {/* Section: Banner Image Picker */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="font-['Space_Grotesk',sans-serif] font-bold text-xs uppercase tracking-wider text-[#121215] flex items-center gap-1">
              <Image size={14} className="text-gray-500" />
              Pilih Gambar Sampul / Banner
            </label>
            <button
              type="button"
              onClick={() => setCustomBanner(!customBanner)}
              className="text-xs font-bold text-[#01CDFE] hover:underline cursor-pointer"
            >
              {customBanner ? 'Pilih Template' : 'Gunakan URL Sendiri'}
            </button>
          </div>

          {customBanner ? (
            <input
              type="url"
              placeholder="https://example.com/banner.jpg"
              value={bannerUrl}
              onChange={(e) => setBannerUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border-2 border-[#121215] rounded-xl text-sm font-medium text-[#121215] shadow-[3px_3px_0px_0px_#121215]"
            />
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {DEFAULT_BANNERS.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setBannerUrl(url)}
                  className={`relative rounded-lg overflow-hidden border-2 cursor-pointer transition-all h-16 ${
                    bannerUrl === url
                      ? 'border-[#121215] ring-2 ring-[#FF4B91] shadow-[2px_2px_0px_0px_#121215]'
                      : 'border-gray-200 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={url} alt={`Banner ${i}`} className="w-full h-full object-cover" />
                  {bannerUrl === url && (
                    <div className="absolute top-1 right-1 bg-[#00F5D4] rounded-full p-0.5 border border-[#121215]">
                      <Check size={10} className="text-[#121215] stroke-[3]" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t-2 border-[#121215] flex justify-end gap-3">
          <Button type="button" variant="outline" size="md" onClick={onClose} disabled={isLoading}>
            Batal
          </Button>
          <Button
            type="submit"
            variant="pink"
            size="md"
            icon={<Sparkles size={16} />}
            disabled={isLoading}
          >
            {isLoading ? 'Menyimpan ke Basis Data...' : 'Buat Event Sekarang'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
