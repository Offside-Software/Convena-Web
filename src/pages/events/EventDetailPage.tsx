import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  QrCode,
  ArrowLeft
} from 'lucide-react'
import { Button } from '../../components/common/Button.tsx'
import { Badge } from '../../components/common/Badge.tsx'
import { Card } from '../../components/common/Card.tsx'
import { Modal } from '../../components/common/Modal.tsx'
import { Input } from '../../components/common/Input.tsx'
import { MemphisShape } from '../../components/shapes/MemphisShape.tsx'
import { eventsService } from '../../services/events.service.ts'
import type { Event, TicketTier } from '../../types/event.ts'

export const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)

  // Registration modal
  const [selectedTier, setSelectedTier] = useState<TicketTier | null>(null)
  const [attendeeName, setAttendeeName] = useState('')
  const [attendeeEmail, setAttendeeEmail] = useState('')
  const [attendeeStudentId, setAttendeeStudentId] = useState('')
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [registrationResult, setRegistrationResult] = useState<{ registrationId: string; qrCode: string } | null>(null)

  useEffect(() => {
    if (id) {
      eventsService.getEventById(id).then((res) => {
        setEvent(res || null)
        setLoading(false)
      })
    }
  }, [id])

  if (loading) {
    return (
      <div className="text-center py-24 px-4">
        <MemphisShape type="starburst" size={60} color="#FF4B91" animate="fast" />
        <p className="mt-4 font-bold text-sm text-[#121215]">Memuat informasi acara...</p>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="max-w-[600px] my-16 mx-auto text-center p-8 bg-white border-2 border-[#121215] rounded-2xl shadow-[6px_6px_0px_0px_#121215]">
        <h2 className="text-2xl font-['Space_Grotesk',sans-serif] font-black text-[#121215]">Event Tidak Ditemukan</h2>
        <p className="my-4 text-sm text-gray-500">Acara yang Anda cari mungkin telah ditutup atau tautan salah.</p>
        <Link to="/events" className="no-underline">
          <Button variant="yellow">Kembali ke Katalog Event</Button>
        </Link>
      </div>
    )
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTier || !attendeeName || !attendeeEmail) return

    const res = await eventsService.registerTicket(event.id, selectedTier.id, {
      name: attendeeName,
      email: attendeeEmail,
      studentId: attendeeStudentId,
    })

    setRegistrationResult(res)
    setIsSuccessModalOpen(true)
  }

  return (
    <div className="max-w-[1280px] mx-auto py-8 px-4 sm:px-6 pb-16">
      {/* Back button */}
      <Link
        to="/events"
        className="inline-flex items-center gap-1.5 font-['Space_Grotesk',sans-serif] font-bold text-sm mb-6 text-[#121215] no-underline hover:text-[#FF4B91] transition-colors"
      >
        <ArrowLeft size={16} /> Kembali ke Semua Event
      </Link>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-10 items-start">
        {/* Left Column: Details */}
        <div>
          {/* Banner container */}
          <div className="overflow-hidden mb-8 bg-white border-2 border-[#121215] rounded-xl shadow-[4px_4px_0px_0px_#121215]">
            <div className="h-[360px] relative overflow-hidden bg-[#FFF585]">
              <img
                src={event.bannerUrl}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <Badge variant="pink" tilt="left">
                  {event.category.toUpperCase()}
                </Badge>
              </div>
              <div className="absolute top-4 right-4">
                <Badge variant="yellow">{event.university}</Badge>
              </div>
            </div>

            <div className="p-7">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-mono font-bold text-gray-500">
                  Diselenggarakan oleh:
                </span>
                <span className="font-extrabold text-sm text-[#121215]">{event.organizationName}</span>
                <CheckCircle size={16} className="text-[#01CDFE] fill-[#121215]" />
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-['Space_Grotesk',sans-serif] font-black leading-tight text-[#121215] mb-5">
                {event.title}
              </h1>

              {/* Tag pills */}
              <div className="flex gap-2 flex-wrap mb-6">
                {event.tags.map((t) => (
                  <Badge key={t} variant="outline">
                    #{t}
                  </Badge>
                ))}
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-[#FAF9F6] border-2 border-[#121215] rounded-xl mb-8">
                <div>
                  <div className="flex items-center gap-1.5 text-[#FF4B91] font-bold text-xs uppercase tracking-wider">
                    <Calendar size={16} /> Waktu & Tanggal
                  </div>
                  <div className="font-extrabold text-sm text-[#121215] mt-1">
                    {new Date(event.startDate).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 text-[#01CDFE] font-bold text-xs uppercase tracking-wider">
                    <MapPin size={16} /> Lokasi Acara
                  </div>
                  <div className="font-extrabold text-sm text-[#121215] mt-1">
                    {event.location.venueName || 'Online'}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {event.location.address || 'Link dikirim via email'}
                  </div>
                </div>
              </div>

              {/* Event Description */}
              <div className="mb-10">
                <h3 className="text-xl font-['Space_Grotesk',sans-serif] font-black text-[#121215] mb-3">
                  Tentang Acara Ini
                </h3>
                <p className="text-base leading-relaxed text-gray-700 whitespace-pre-line">
                  {event.description}
                </p>
              </div>

              {/* Rundown Schedule Preview */}
              <div className="mb-8">
                <h3 className="text-xl font-['Space_Grotesk',sans-serif] font-black text-[#121215] mb-4 flex items-center gap-2">
                  <Clock size={20} className="text-[#FF4B91]" /> Susunan Acara (Rundown)
                </h3>
                <div className="flex flex-col gap-3">
                  <div className="flex gap-4 p-3.5 border-2 border-[#121215] rounded-lg bg-white shadow-[2px_2px_0px_0px_#121215]">
                    <span className="font-mono font-black text-[#FF4B91] min-w-[90px] text-xs sm:text-sm">08:30 - 09:00</span>
                    <div>
                      <strong className="text-sm text-[#121215]">Registrasi Ulang & Check-in QR</strong>
                      <p className="text-xs m-0 text-gray-500 mt-0.5">Pemeriksaan e-tiket dan pembagian welcome kit peserta.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 p-3.5 border-2 border-[#121215] rounded-lg bg-white shadow-[2px_2px_0px_0px_#121215]">
                    <span className="font-mono font-black text-[#01CDFE] min-w-[90px] text-xs sm:text-sm">09:00 - 12:00</span>
                    <div>
                      <strong className="text-sm text-[#121215]">Opening Ceremony & Sesi Utama</strong>
                      <p className="text-xs m-0 text-gray-500 mt-0.5">Sambutan Rektorat & Pemaparan materi praktis oleh pembicara industri.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 p-3.5 border-2 border-[#121215] rounded-lg bg-white shadow-[2px_2px_0px_0px_#121215]">
                    <span className="font-mono font-black text-[#FFE600] min-w-[90px] text-xs sm:text-sm">13:00 - 16:30</span>
                    <div>
                      <strong className="text-sm text-[#121215]">Hands-on Workshop & Networking Session</strong>
                      <p className="text-xs m-0 text-gray-500 mt-0.5">Simulasi studi kasus interaktif dan jejaring kemitraan karir.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Ticket Booking Card */}
        <div className="sticky top-[90px]">
          <Card headerColor="yellow" headerTitle="Pilihan Kategori Tiket">
            <div className="flex flex-col gap-4">
              {event.ticketTiers.map((tier) => {
                const isSelected = selectedTier?.id === tier.id
                return (
                  <div
                    key={tier.id}
                    onClick={() => tier.isAvailable && setSelectedTier(tier)}
                    className={`p-4 rounded-xl transition-all relative ${
                      tier.isAvailable ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
                    } ${
                      isSelected
                        ? 'border-2 border-[#121215] bg-[#FFF585] shadow-[4px_4px_0px_0px_#121215]'
                        : 'border-2 border-gray-200 bg-white hover:border-[#121215]'
                    }`}
                  >
                    {!tier.isAvailable && (
                      <span className="absolute top-2.5 right-2.5 bg-red-500 text-white text-[11px] font-black py-0.5 px-1.5 rounded">
                        HABIS
                      </span>
                    )}

                    <div className="font-black text-sm mb-1 text-[#121215]">
                      {tier.name}
                    </div>

                    <div className="font-['Space_Grotesk',sans-serif] font-black text-xl text-[#121215] mb-2">
                      {tier.price === 0 ? 'GRATIS' : `Rp ${tier.price.toLocaleString('id-ID')}`}
                    </div>

                    <ul className="pl-4 m-0 text-xs text-gray-600 space-y-0.5">
                      {tier.benefits.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  </div>
                )
              })}

              {/* Registration Form when a tier is selected */}
              {selectedTier ? (
                <div className="border-t-2 border-dashed border-[#121215] pt-4 mt-2">
                  <h4 className="text-sm font-['Space_Grotesk',sans-serif] font-black text-[#121215] mb-3">
                    Data Pendaftar:
                  </h4>
                  <Input
                    label="Nama Lengkap"
                    placeholder="Contoh: Muhammad Rizky"
                    value={attendeeName}
                    onChange={(e) => setAttendeeName(e.target.value)}
                    required
                  />
                  <Input
                    label="Email Mahasiswa / Pribadi"
                    type="email"
                    placeholder="nama@student.ac.id"
                    value={attendeeEmail}
                    onChange={(e) => setAttendeeEmail(e.target.value)}
                    required
                  />
                  <Input
                    label="Nomor Induk Mahasiswa (NIM)"
                    placeholder="Contoh: 13522045"
                    value={attendeeStudentId}
                    onChange={(e) => setAttendeeStudentId(e.target.value)}
                  />

                  <Button
                    variant="pink"
                    fullWidth
                    size="lg"
                    onClick={handleRegister}
                    disabled={!attendeeName || !attendeeEmail}
                    className="mt-2"
                  >
                    Konfirmasi Pendaftaran Tiket
                  </Button>
                </div>
              ) : (
                <div className="p-3 bg-[#FAF9F6] rounded-lg text-center text-xs font-bold text-gray-500 border border-dashed border-gray-300">
                  Pilih salah satu kategori tiket di atas untuk mendaftar.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Success QR Ticket Modal */}
      <Modal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="Tiket Terbit Berhasil! 🎉"
        headerColor="mint"
        footer={
          <Button variant="dark" onClick={() => setIsSuccessModalOpen(false)}>
            Selesai
          </Button>
        }
      >
        <div className="text-center py-4">
          <div className="inline-block p-5 bg-white border-2 border-[#121215] rounded-xl shadow-[6px_6px_0px_0px_#121215] mb-4">
            <QrCode size={180} strokeWidth={2.5} className="mx-auto block" />
            <div className="font-mono font-black text-xs mt-3 bg-[#FFE600] py-1 px-2 border-2 border-[#121215] rounded">
              {registrationResult?.registrationId || 'REG-SUCCESS'}
            </div>
          </div>

          <h3 className="text-xl font-['Space_Grotesk',sans-serif] font-black text-[#121215] mb-2">{attendeeName}</h3>
          <p className="text-gray-600 text-xs sm:text-sm mb-4 leading-relaxed">
            Tiket untuk <strong>{event.title}</strong> telah dikonfirmasi dan QR code siap dipindai saat hari-H di pintu masuk.
          </p>

          <div className="p-4 bg-[#FFF585] border-2 border-[#121215] rounded-xl text-xs text-left space-y-1">
            <div><strong>Kategori Tiket:</strong> {selectedTier?.name}</div>
            <div><strong>Email Konfirmasi:</strong> {attendeeEmail}</div>
            <div><strong>Status E-Certificate:</strong> Berhak klaim setelah presensi QR</div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
