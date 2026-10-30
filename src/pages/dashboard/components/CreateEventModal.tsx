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
    } catch (err: unknown) {
      const error = err as { message?: string }
      setErrorMessage(error?.message || 'Gagal menyimpan event. Periksa data kembali.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Buat Event Baru"
      maxWidth="max-w-[620px]"
    >
      <form onSubmit={handleSubmit} className="space-y-4 font-['Montserrat',sans-serif]">
        {errorMessage && (
          <div className="bg-[#202020] border border-[#DF00D0] text-[#DF00D0] rounded-xl p-3 text-xs font-semibold flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Section: Title */}
        <div>
          <label className="block font-semibold text-xs text-[#9C9C9C] mb-1.5">
            Judul Kegiatan / Acara *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Arkavidia 9.0: National Tech Festival"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#1c1c1c] border border-[#333333] rounded-xl text-sm font-medium text-white placeholder:text-[#9C9C9C]/40 outline-none focus:border-[#CFFE06]"
          />
        </div>

        {/* Section: Category & Location Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-xs text-[#9C9C9C] mb-1.5">
              Kategori Event
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as EventCategory)}
              className="w-full px-3.5 py-2.5 bg-[#1c1c1c] border border-[#333333] rounded-xl text-sm font-medium text-white outline-none focus:border-[#CFFE06] cursor-pointer"
            >
              <option value="festival" className="bg-[#151515]">Festival & Expo</option>
              <option value="seminar" className="bg-[#151515]">Seminar / Talkshow</option>
              <option value="workshop" className="bg-[#151515]">Hands-on Workshop</option>
              <option value="competition" className="bg-[#151515]">Kompetisi & Hackathon</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-xs text-[#9C9C9C] mb-1.5">
              Format Penyelenggaraan
            </label>
            <select
              value={locationType}
              onChange={(e) => setLocationType(e.target.value as 'offline' | 'online' | 'hybrid')}
              className="w-full px-3.5 py-2.5 bg-[#1c1c1c] border border-[#333333] rounded-xl text-sm font-medium text-white outline-none focus:border-[#CFFE06] cursor-pointer"
            >
              <option value="offline" className="bg-[#151515]">Tatap Muka (Offline)</option>
              <option value="online" className="bg-[#151515]">Daring Penuh (Online)</option>
              <option value="hybrid" className="bg-[#151515]">Campuran (Hybrid)</option>
            </select>
          </div>
        </div>

        {/* Section: Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-xs text-[#9C9C9C] mb-1.5">
              <Calendar size={13} className="inline mr-1 text-[#CFFE06]" />
              Waktu Mulai *
            </label>
            <input
              type="datetime-local"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#1c1c1c] border border-[#333333] rounded-xl text-sm font-medium text-white outline-none focus:border-[#CFFE06]"
            />
          </div>

          <div>
            <label className="block font-semibold text-xs text-[#9C9C9C] mb-1.5">
              <Calendar size={13} className="inline mr-1 text-[#CFFE06]" />
              Waktu Selesai *
            </label>
            <input
              type="datetime-local"
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#1c1c1c] border border-[#333333] rounded-xl text-sm font-medium text-white outline-none focus:border-[#CFFE06]"
            />
          </div>
        </div>

        {/* Section: Location Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {locationType !== 'online' && (
            <>
              <div>
                <label className="block font-semibold text-xs text-[#9C9C9C] mb-1.5">
                  <MapPin size={13} className="inline mr-1 text-[#CFFE06]" />
                  Gedung / Tempat
                </label>
                <input
                  type="text"
                  placeholder="e.g. Telkom University Convention Hall"
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#1c1c1c] border border-[#333333] rounded-xl text-sm font-medium text-white placeholder:text-[#9C9C9C]/40 outline-none focus:border-[#CFFE06]"
                />
              </div>

              <div>
                <label className="block font-semibold text-xs text-[#9C9C9C] mb-1.5">
                  Kota
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bandung"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#1c1c1c] border border-[#333333] rounded-xl text-sm font-medium text-white placeholder:text-[#9C9C9C]/40 outline-none focus:border-[#CFFE06]"
                />
              </div>
            </>
          )}

          {locationType !== 'offline' && (
            <div className={locationType === 'online' ? 'sm:col-span-2' : ''}>
              <label className="block font-semibold text-xs text-[#9C9C9C] mb-1.5">
                Tautan Online / Zoom
              </label>
              <input
                type="url"
                placeholder="https://zoom.us/j/..."
                value={onlineUrl}
                onChange={(e) => setOnlineUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#1c1c1c] border border-[#333333] rounded-xl text-sm font-medium text-white placeholder:text-[#9C9C9C]/40 outline-none focus:border-[#CFFE06]"
              />
            </div>
          )}
        </div>

        {/* Section: Organizing Body */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-xs text-[#9C9C9C] mb-1.5">
              <Building size={13} className="inline mr-1 text-[#CFFE06]" />
              Nama Organisasi / BEM
            </label>
            <input
              type="text"
              placeholder="e.g. BEM Kema Tel-U"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#1c1c1c] border border-[#333333] rounded-xl text-sm font-medium text-white placeholder:text-[#9C9C9C]/40 outline-none focus:border-[#CFFE06]"
            />
          </div>

          <div>
            <label className="block font-semibold text-xs text-[#9C9C9C] mb-1.5">
              Universitas / Kampus
            </label>
            <input
              type="text"
              placeholder="e.g. Telkom University"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#1c1c1c] border border-[#333333] rounded-xl text-sm font-medium text-white placeholder:text-[#9C9C9C]/40 outline-none focus:border-[#CFFE06]"
            />
          </div>
        </div>

        {/* Section: Short Description */}
        <div>
          <label className="block font-semibold text-xs text-[#9C9C9C] mb-1.5">
            Ringkasan Singkat (1-2 Kalimat)
          </label>
          <input
            type="text"
            placeholder="Festival teknologi tahunan terbesar mahasiswa informatika"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#1c1c1c] border border-[#333333] rounded-xl text-sm font-medium text-white placeholder:text-[#9C9C9C]/40 outline-none focus:border-[#CFFE06]"
          />
        </div>

        {/* Section: Full Description */}
        <div>
          <label className="block font-semibold text-xs text-[#9C9C9C] mb-1.5">
            Deskripsi Lengkap Kegiatan
          </label>
          <textarea
            rows={3}
            placeholder="Jelaskan detail susunan kegiatan, pembicara, dan syarat peserta..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#1c1c1c] border border-[#333333] rounded-xl text-sm font-medium text-white placeholder:text-[#9C9C9C]/40 outline-none focus:border-[#CFFE06]"
          />
        </div>

        {/* Section: Banner Image Picker */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="font-semibold text-xs text-[#9C9C9C] flex items-center gap-1">
              <Image size={13} className="text-[#CFFE06]" />
              Pilih Banner Sampul
            </label>
            <button
              type="button"
              onClick={() => setCustomBanner(!customBanner)}
              className="text-xs font-semibold text-[#CFFE06] hover:underline cursor-pointer bg-transparent border-none"
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
              className="w-full px-3.5 py-2.5 bg-[#1c1c1c] border border-[#333333] rounded-xl text-sm font-medium text-white placeholder:text-[#9C9C9C]/40 outline-none focus:border-[#CFFE06]"
            />
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {DEFAULT_BANNERS.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setBannerUrl(url)}
                  className={`relative rounded-lg overflow-hidden border cursor-pointer transition-all h-16 ${
                    bannerUrl === url
                      ? 'border-[#CFFE06] ring-1 ring-[#CFFE06]'
                      : 'border-[#3D3D3D] opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={url} alt={`Banner ${i}`} className="w-full h-full object-cover" />
                  {bannerUrl === url && (
                    <div className="absolute top-1 right-1 bg-[#CFFE06] text-black rounded-full p-0.5">
                      <Check size={10} className="stroke-[3]" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-[#3D3D3D]/60 flex justify-end gap-2.5">
          <Button type="button" variant="outline" size="md" onClick={onClose} disabled={isLoading}>
            Batal
          </Button>
          <Button
            type="submit"
            variant="accent"
            size="md"
            icon={<Sparkles size={16} />}
            disabled={isLoading}
          >
            {isLoading ? 'Menyimpan...' : 'Buat Event'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
