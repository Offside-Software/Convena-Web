import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  QrCode,
  ArrowLeft,
  Minus,
  Plus,
  Landmark,
  ShieldCheck,
  ScanLine,
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { Button } from '../../components/common/Button.tsx'
import { Badge } from '../../components/common/Badge.tsx'
import { Modal } from '../../components/common/Modal.tsx'
import { LocationPreviewMap } from '../../components/maps/LocationPreviewMap.tsx'
import { eventsService } from '../../services/events.service.ts'
import { authService } from '../../services/auth.service.ts'
import type { Event, EventRegistration, TicketTier } from '../../types/event.ts'

export const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)

  // Ticket checkout state
  const [selectedTier, setSelectedTier] = useState<TicketTier | null>(null)
  const [ticketQuantity, setTicketQuantity] = useState(1)
  const [memberDiscountActive, setMemberDiscountActive] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'bank_transfer'>('qris')
  const [attendeeName, setAttendeeName] = useState('')
  const [attendeeEmail, setAttendeeEmail] = useState('')
  const [attendeeStudentId, setAttendeeStudentId] = useState('')
  const [isPaymentStep, setIsPaymentStep] = useState(false)
  const [registrationError, setRegistrationError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [myRegistration, setMyRegistration] = useState<EventRegistration | null>(null)

  // Attendance QR verification state for registered users
  const [attendanceQrInput, setAttendanceQrInput] = useState('')
  const [attendanceFeedback, setAttendanceFeedback] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)
  const [verifyingAttendance, setVerifyingAttendance] = useState(false)

  useEffect(() => {
    let isMounted = true
    authService.getCurrentUser().then((u) => {
      if (!isMounted || !u) return
      setAttendeeName((curr) => curr || u.name || '')
      setAttendeeEmail((curr) => curr || u.email || '')
      if (u.company) {
        setAttendeeStudentId((curr) => curr || u.company || '')
      }
    })

    const loadEvent = async () => {
      try {
        const res = id
          ? await eventsService.getEventById(id)
          : (await eventsService.getEvents())[0]
        if (!isMounted) return
        setEvent(res || null)
        if (res?.ticketTiers?.length) {
          setSelectedTier(res.ticketTiers[0])
        }
        if (res?.id) {
          const existingReg = await eventsService.getMyRegistration(res.id)
          if (isMounted && existingReg) {
            setMyRegistration(existingReg)
          }
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadEvent()
    return () => {
      isMounted = false
    }
  }, [id])

  if (loading) {
    return (
      <div className="max-w-[1280px] mx-auto py-6 px-4 sm:px-6 pb-20 font-['Montserrat',sans-serif] bg-[#000000] text-white animate-pulse">
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-10 h-10 rounded-full bg-[#1c1c1c]" />
          <div className="h-6 w-28 bg-[#242424] rounded" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_440px] gap-8 items-start">
          <div className="bg-[#141414] border border-[#262626] rounded-xl h-96" />
          <div className="bg-[#141414] border border-[#262626] rounded-xl h-96" />
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="max-w-[500px] my-16 mx-auto text-center p-8 bg-[#151515] border border-[#3D3D3D] rounded-xl text-white font-['Montserrat',sans-serif]">
        <h2 className="text-xl font-bold mb-2">Event Tidak Ditemukan</h2>
        <p className="my-4 text-xs text-[#9C9C9C]">
          Acara yang Anda cari mungkin telah ditutup atau tautan salah.
        </p>
        <Link to="/events" className="no-underline">
          <Button variant="accent">Kembali ke Katalog Event</Button>
        </Link>
      </div>
    )
  }

  const isFreeTier = (selectedTier?.price ?? 0) === 0
  const basePricePerTicket = selectedTier?.price ?? 0
  const subtotal = basePricePerTicket * ticketQuantity
  const discountAmount = !isFreeTier && memberDiscountActive ? Math.round(subtotal * 0.15) : 0
  const gatewayFee = subtotal > 0 ? 4500 : 0
  const totalToPay = isFreeTier ? 0 : Math.max(0, subtotal - discountAmount + gatewayFee)

  // Step 1 handler:
  // - For Free Tier Ticket: Register -> Done (immediately submits registration!)
  // - For Paid Tier Ticket: Register -> Payment (moves to QRIS / Bank payment step)
  const handleRegistrationSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setRegistrationError('')

    if (!attendeeName.trim() || !attendeeEmail.trim()) {
      setRegistrationError('Nama lengkap dan email wajib diisi untuk mendaftar.')
      return
    }

    if (!selectedTier) {
      setRegistrationError('Pilih kategori tiket terlebih dahulu.')
      return
    }

    if (isFreeTier) {
      // Free Tier Ticket: Register > Done
      setIsSubmitting(true)
      try {
        const res = await eventsService.registerForEvent(event.id, {
          tierId: selectedTier.id,
          paymentMethod: 'free',
          attendeeName: attendeeName.trim(),
          attendeeEmail: attendeeEmail.trim(),
          attendeeInstitution: attendeeStudentId.trim() || undefined,
        })
        setMyRegistration(res.registration)
        setIsSuccessModalOpen(true)
      } catch (error: any) {
        setRegistrationError(
          error?.message || 'Gagal memproses pendaftaran tiket gratis. Pastikan Anda sudah login.'
        )
      } finally {
        setIsSubmitting(false)
      }
    } else {
      // Paid Tier Ticket: Register > Payment (SCAN QRIS, Pay via Bank) > Done
      setIsPaymentStep(true)
    }
  }

  // Step 2 handler (Paid Tier Only): Payment (SCAN QRIS / Pay via Bank) -> Done
  const handleConfirmPaidTicket = async () => {
    if (!selectedTier) return
    setRegistrationError('')
    setIsSubmitting(true)
    try {
      const res = await eventsService.registerForEvent(event.id, {
        tierId: selectedTier.id,
        paymentMethod,
        attendeeName: attendeeName.trim(),
        attendeeEmail: attendeeEmail.trim(),
        attendeeInstitution: attendeeStudentId.trim() || undefined,
      })
      setMyRegistration(res.registration)
      setIsPaymentStep(false)
      setIsSuccessModalOpen(true)
    } catch (error: any) {
      setRegistrationError(
        error?.message || 'Pembayaran & pendaftaran tiket gagal. Pastikan Anda sudah login.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAttendByQr = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!attendanceQrInput.trim()) return
    setAttendanceFeedback(null)
    setVerifyingAttendance(true)
    try {
      const res = await eventsService.attendEventByQr(attendanceQrInput.trim(), event.id)
      setMyRegistration(res.registration)
      setAttendanceFeedback({
        type: 'success',
        text: res.message,
      })
    } catch (err: any) {
      setAttendanceFeedback({
        type: 'error',
        text:
          err?.message ||
          'Gagal memverifikasi QR Presensi. Pastikan kode QR sesuai dan tiket Anda sudah lunas.',
      })
    } finally {
      setVerifyingAttendance(false)
    }
  }

  return (
    <div className="max-w-[1280px] mx-auto py-6 px-4 sm:px-6 pb-20 font-['Montserrat',sans-serif] bg-[#000000] text-white">
      {/* Top Header with circular back button */}
      <div className="flex items-center gap-3.5 mb-6">
        <Link
          to="/events"
          className="w-10 h-10 rounded-full bg-[#1c1c1c] hover:bg-[#252525] flex items-center justify-center text-white hover:text-[#CFFE06] transition-colors no-underline shrink-0"
          title="Kembali ke Event"
        >
          <ArrowLeft size={18} />
        </Link>
        <h1 className="font-bold text-white tracking-tight m-0">Detail Event</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_440px] gap-8 items-start">
        {/* Left Column: Event Overview, Leaflet Map Preview & Google Maps Directions */}
        <div className="space-y-6">
          <div className="bg-[#141414] border border-[#262626] rounded-xl overflow-hidden">
            <div className="h-[280px] sm:h-[360px] relative overflow-hidden bg-[#202020]">
              <img
                src={event.bannerUrl || ''}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-black/30" />
              <div className="absolute top-4 left-4 flex gap-2">
                <Badge variant="accent">{event.category.toUpperCase()}</Badge>
                <Badge variant="dark">{event.company || 'Institut Teknologi Bandung'}</Badge>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-[#9C9C9C]">Diselenggarakan oleh Organisasi:</span>
                <span className="font-bold text-xs text-white">{event.organizationName}</span>
                <CheckCircle size={14} className="text-[#CFFE06]" />
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-4">
                {event.title}
              </h1>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl mb-6">
                <div>
                  <div className="flex items-center gap-1.5 text-[#CFFE06] font-bold text-xs uppercase tracking-wider">
                    <Calendar size={15} /> Waktu & Tanggal
                  </div>
                  <div className="font-semibold text-xs sm:text-sm text-white mt-1">
                    {new Date(event.startDate).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 text-[#CFFE06] font-bold text-xs uppercase tracking-wider">
                    <MapPin size={15} /> Lokasi Acara ({event.location.type.toUpperCase()})
                  </div>
                  <div className="font-semibold text-xs sm:text-sm text-white mt-1">
                    {event.location.venueName || 'Venue Acara'}
                  </div>
                  <div className="text-xs text-[#9C9C9C] mt-0.5">
                    {event.location.address || event.location.city || 'Indonesia'}
                  </div>
                </div>
              </div>

              {/* Task 3: Leaflet Map Preview & Google Maps Direction Button for Offline/Hybrid Events */}
              {event.location.type !== 'online' && (
                <div className="mb-6">
                  <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                    <MapPin size={16} className="text-[#CFFE06]" /> Peta Lokasi & Navigasi (Leaflet Maps)
                  </h3>
                  <LocationPreviewMap
                    latitude={event.latitude ?? event.location.latitude}
                    longitude={event.longitude ?? event.location.longitude}
                    venueName={event.location.venueName}
                    address={event.location.address}
                    city={event.location.city}
                  />
                </div>
              )}

              {/* Event Description */}
              <div className="mb-6">
                <h3 className="text-base font-bold text-white mb-2">Tentang Acara Ini</h3>
                <p className="text-xs sm:text-sm leading-relaxed text-[#9C9C9C] whitespace-pre-line">
                  {event.description}
                </p>
              </div>

              {/* Rundown Schedule */}
              <div>
                <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                  <Clock size={16} className="text-[#CFFE06]" /> Susunan Acara (Rundown)
                </h3>
                <div className="flex flex-col gap-2.5">
                  <div className="flex gap-4 p-3 border border-[#262626] rounded-xl bg-[#181818]">
                    <span className="font-mono font-bold text-[#CFFE06] text-xs min-w-[85px]">
                      08:30 - 09:00
                    </span>
                    <div>
                      <strong className="text-xs text-white">Registrasi Ulang & Scan QR Presensi</strong>
                      <p className="text-[11px] m-0 text-[#9C9C9C] mt-0.5">
                        Peserta memindai QR Presensi resmi dari penyelenggara untuk validasi kehadiran.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 p-3 border border-[#262626] rounded-xl bg-[#181818]">
                    <span className="font-mono font-bold text-[#CFFE06] text-xs min-w-[85px]">
                      09:00 - 12:00
                    </span>
                    <div>
                      <strong className="text-xs text-white">Opening Ceremony & Keynote Session</strong>
                      <p className="text-[11px] m-0 text-[#9C9C9C] mt-0.5">
                        Pemaparan materi inovasi oleh pembicara industri teknologi terkemuka.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Registration, Free/Paid Flow & Attendance Check-in */}
        <div className="space-y-4 sticky top-[80px]">
          {myRegistration ? (
            /* ALREADY REGISTERED STATE + ATTENDANCE QR SCAN/VERIFY */
            <div className="bg-[#141414] border border-[#CFFE06]/50 rounded-xl p-5 space-y-5">
              <div className="flex items-center justify-between">
                <Badge variant="accent">
                  {myRegistration.status === 'checked_in'
                    ? ' SUDAH HADIR (CHECKED-IN)'
                    : ' TIKET TERKONFIRMASI'}
                </Badge>
                <span className="font-mono text-xs font-bold text-[#CFFE06]">
                  {myRegistration.ticketCode}
                </span>
              </div>

              <div>
                <h2 className="text-lg font-extrabold text-white m-0">{event.title}</h2>
                <p className="text-xs text-[#9C9C9C] mt-1 m-0">
                  Tier: <strong className="text-white">{myRegistration.tierName}</strong> •{' '}
                  {myRegistration.price === 0
                    ? 'Tiket Gratis (Free Tier)'
                    : `Lunas Rp ${myRegistration.price.toLocaleString('id-ID')} (${myRegistration.paymentMethod.toUpperCase()})`}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#1C1C1C] border border-[#2E2E2E] text-xs space-y-1">
                <div className="text-[#9C9C9C]">Peserta Terdaftar:</div>
                <div className="font-bold text-white">{myRegistration.attendeeName}</div>
                <div className="text-[#9C9C9C]">{myRegistration.attendeeEmail}</div>
              </div>

              {/* Attending Section: Scan / Input Organizer's Event Attendance QR */}
              <div className="pt-3 border-t border-[#262626] space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#CFFE06]">
                  <ScanLine size={16} />
                  <span>Presensi Kehadiran Acara (Attending QR)</span>
                </div>
                <p className="text-[11px] text-[#9C9C9C] m-0 leading-relaxed">
                  Saat berada di lokasi acara, pindai QR Presensi dari penyelenggara lewat aplikasi Mobile Convena atau masukkan kode QR Presensi penyelenggara di bawah ini:
                </p>

                {attendanceFeedback && (
                  <div
                    className={`p-3 rounded-xl text-xs font-semibold border ${
                      attendanceFeedback.type === 'success'
                        ? 'bg-[#1e240a] border-[#CFFE06] text-[#CFFE06]'
                        : 'bg-[#2A1215] border-[#FF6B6B] text-[#FF8888]'
                    }`}
                  >
                    {attendanceFeedback.text}
                  </div>
                )}

                {myRegistration.status !== 'checked_in' && (
                  <form onSubmit={handleAttendByQr} className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={attendanceQrInput}
                        onChange={(e) => setAttendanceQrInput(e.target.value)}
                        placeholder="CONVENA-ATTEND:... atau Token QR"
                        className="flex-1 px-3 py-2 rounded-xl bg-[#0c0c0c] border border-[#333333] text-xs text-white font-mono outline-none focus:border-[#CFFE06]"
                      />
                      <Button
                        type="submit"
                        variant="accent"
                        size="sm"
                        disabled={verifyingAttendance}
                      >
                        {verifyingAttendance ? 'Memeriksa...' : 'Check-In'}
                      </Button>
                    </div>
                    {event.attendanceQrToken && (
                      <button
                        type="button"
                        onClick={() =>
                          setAttendanceQrInput(
                            `CONVENA-ATTEND:${event.id}:${event.attendanceQrToken}`
                          )
                        }
                        className="text-[11px] text-[#CFFE06] hover:underline bg-transparent border-none p-0 cursor-pointer"
                      >
                        Isi otomatis dengan QR Presensi Event aktif ({event.attendanceQrToken})
                      </button>
                    )}
                  </form>
                )}
              </div>
            </div>
          ) : !isPaymentStep ? (
            /* STEP 1: SELECT TIER + ATTENDEE DETAILS */
            <form
              onSubmit={handleRegistrationSubmit}
              className="bg-[#141414] border border-[#262626] rounded-xl p-5 space-y-4"
            >
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#CFFE06]">
                  {isFreeTier ? 'Tiket Gratis (Register > Done)' : 'Langkah 1 dari 2 • Registrasi'}
                </span>
                <h2 className="text-lg font-bold text-white mt-1 mb-1">Pilih Tiket & Daftar</h2>
                <p className="text-xs text-[#9C9C9C] m-0">
                  {isFreeTier
                    ? 'Kategori tiket gratis: langsung terdaftar tanpa tahapan pembayaran.'
                    : 'Kategori tiket berbayar: lanjut ke pembayaran via Scan QRIS atau Transfer Bank.'}
                </p>
              </div>

              {registrationError && (
                <div
                  role="alert"
                  className="p-3 rounded-xl bg-[#200010] border border-[#DF00D0] text-xs text-[#FF88EC]"
                >
                  {registrationError}
                </div>
              )}

              {/* Ticket Tier Selector */}
              <div>
                <label className="block text-xs font-semibold text-[#9C9C9C] mb-2">
                  Pilih Kategori Tiket <span className="text-[#CFFE06]">*</span>
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {(event.ticketTiers ?? []).map((tier) => {
                    const selected = selectedTier?.id === tier.id
                    return (
                      <button
                        key={tier.id}
                        type="button"
                        onClick={() => setSelectedTier(tier)}
                        className={`p-3 rounded-xl text-left text-xs transition-all cursor-pointer border flex items-center justify-between ${
                          selected
                            ? 'border-[#CFFE06] bg-[#1e240a] text-white shadow-[0_0_12px_rgba(207,254,6,0.15)]'
                            : 'border-[#262626] bg-[#0c0c0c] text-[#9C9C9C] hover:text-white'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-white">{tier.name}</div>
                          <div className="text-[11px] text-[#9C9C9C] mt-0.5">
                            Sisa kuota: {Math.max(0, tier.quota - tier.sold)} dari {tier.quota}
                          </div>
                        </div>
                        <Badge variant={tier.price === 0 ? 'accent' : 'dark'}>
                          {tier.price === 0
                            ? 'GRATIS'
                            : `Rp ${tier.price.toLocaleString('id-ID')}`}
                        </Badge>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label
                  htmlFor="attendee-name"
                  className="block text-xs font-semibold text-[#9C9C9C] mb-1.5"
                >
                  Nama Lengkap <span className="text-[#CFFE06]">*</span>
                </label>
                <input
                  id="attendee-name"
                  type="text"
                  autoComplete="name"
                  placeholder="Nama sesuai identitas"
                  value={attendeeName}
                  onChange={(e) => setAttendeeName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="attendee-email"
                  className="block text-xs font-semibold text-[#9C9C9C] mb-1.5"
                >
                  Email <span className="text-[#CFFE06]">*</span>
                </label>
                <input
                  id="attendee-email"
                  type="email"
                  autoComplete="email"
                  placeholder="nama@email.com"
                  value={attendeeEmail}
                  onChange={(e) => setAttendeeEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="attendee-student-id"
                  className="block text-xs font-semibold text-[#9C9C9C] mb-1.5"
                >
                  Institusi / NIM <span className="font-normal">(opsional)</span>
                </label>
                <input
                  id="attendee-student-id"
                  type="text"
                  autoComplete="off"
                  placeholder="Masukkan kampus / instansi / NIM"
                  value={attendeeStudentId}
                  onChange={(e) => setAttendeeStudentId(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !selectedTier}
                className="w-full py-3.5 px-5 bg-[#CFFE06] hover:bg-[#bde805] text-[#000000] font-bold text-sm rounded-full transition-colors cursor-pointer disabled:opacity-60"
              >
                {isSubmitting
                  ? 'Memproses Pendaftaran...'
                  : isFreeTier
                    ? 'Daftar Sekarang (Gratis — Langsung Selesai)'
                    : 'Lanjut ke Pembayaran Tiket'}
              </button>
            </form>
          ) : (
            /* STEP 2 (PAID TIER ONLY): PAYMENT (SCAN QRIS / PAY VIA BANK) > DONE */
            <>
              <div className="bg-[#141414] border border-[#262626] rounded-xl p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#CFFE06]">
                      Langkah 2 dari 2 • Pembayaran
                    </span>
                    <h2 className="text-lg font-bold text-white mt-1 mb-0">
                      Selesaikan Pembayaran
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPaymentStep(false)}
                    className="text-xs font-semibold text-[#CFFE06] hover:underline cursor-pointer bg-transparent border-none p-0"
                  >
                    Ubah Data / Tier
                  </button>
                </div>

                <div className="border-t border-[#262626] py-3 text-xs space-y-1">
                  <div className="text-[#9C9C9C]">Peserta:</div>
                  <div className="font-bold text-white">{attendeeName}</div>
                  <div className="text-[#9C9C9C]">{attendeeEmail}</div>
                  <div className="pt-1 text-[#CFFE06] font-semibold">
                    Tier: {selectedTier?.name} (Rp{' '}
                    {(selectedTier?.price ?? 0).toLocaleString('id-ID')})
                  </div>
                </div>
              </div>

              {/* Payment Method Selector: SCAN QRIS or Pay via Bank */}
              <div className="bg-[#141414] border border-[#262626] rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">Jumlah Tiket</span>
                  <div className="flex items-center gap-5 bg-[#0a0a0a] border border-[#262626] rounded-full py-1.5 px-4">
                    <button
                      type="button"
                      onClick={() => setTicketQuantity(Math.max(1, ticketQuantity - 1))}
                      className="text-white hover:text-[#CFFE06] cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="font-bold text-xs text-white min-w-[12px] text-center">
                      {ticketQuantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setTicketQuantity(ticketQuantity + 1)}
                      className="text-[#CFFE06] hover:brightness-110 cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">Diskon Mahasiswa (15%)</span>
                  <button
                    type="button"
                    onClick={() => setMemberDiscountActive(!memberDiscountActive)}
                    className={`w-12 h-6.5 rounded-full p-0.5 transition-colors relative cursor-pointer border-none ${
                      memberDiscountActive ? 'bg-[#CFFE06]' : 'bg-[#2a2a2a]'
                    }`}
                  >
                    <span
                      className={`w-5.5 h-5.5 rounded-full bg-white block shadow transition-transform ${
                        memberDiscountActive ? 'translate-x-5.5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="pt-2">
                  <span className="block text-xs font-medium text-[#9C9C9C] mb-2.5">
                    Pilih Metode Pembayaran
                  </span>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('qris')}
                      className={`py-3 px-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        paymentMethod === 'qris'
                          ? 'border-2 border-[#CFFE06] bg-[#1a2205] text-[#CFFE06]'
                          : 'border border-[#262626] bg-[#0c0c0c] text-white hover:border-[#3D3D3D]'
                      }`}
                    >
                      <QrCode
                        size={22}
                        className={paymentMethod === 'qris' ? 'text-[#CFFE06]' : 'text-white'}
                      />
                      <span className="text-xs font-bold text-white">SCAN QRIS</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('bank_transfer')}
                      className={`py-3 px-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        paymentMethod === 'bank_transfer'
                          ? 'border-2 border-[#CFFE06] bg-[#1a2205] text-[#CFFE06]'
                          : 'border border-[#262626] bg-[#0c0c0c] text-white hover:border-[#3D3D3D]'
                      }`}
                    >
                      <Landmark
                        size={22}
                        className={
                          paymentMethod === 'bank_transfer' ? 'text-[#CFFE06]' : 'text-white'
                        }
                      />
                      <span className="text-xs font-bold text-white">Pay via Bank</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-[#141414] border border-[#262626] rounded-xl p-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3.5">
                  RINGKASAN PEMBAYARAN
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-[#9C9C9C]">
                    <span>Harga Tiket ({ticketQuantity}x)</span>
                    <span className="text-white font-medium">
                      Rp {subtotal.toLocaleString('id-ID')}
                    </span>
                  </div>
                  {memberDiscountActive && (
                    <div className="flex justify-between text-[#9C9C9C]">
                      <span>Diskon Mahasiswa (15%)</span>
                      <span className="text-[#CFFE06] font-bold">
                        -Rp {discountAmount.toLocaleString('id-ID')}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#9C9C9C]">
                    <span>Biaya Layanan</span>
                    <span className="text-white font-medium">
                      Rp {gatewayFee.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                <div className="border-t border-[#262626] pt-3.5 mt-3.5 flex items-baseline justify-between">
                  <div>
                    <span className="text-[11px] font-medium text-[#9C9C9C] block mb-0.5">
                      Total Tagihan
                    </span>
                    <span className="text-xl font-black text-white">
                      Rp {totalToPay.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-[#CFFE06]">Instan</span>
                </div>
              </div>

              {/* Payment Instructions: QRIS vs Bank */}
              {paymentMethod === 'qris' ? (
                <div className="bg-[#141414] border border-[#262626] rounded-xl p-5 text-center space-y-3">
                  <div className="text-xs text-white font-semibold">
                    Scan QRIS (GoPay, OVO, Dana, BCA, Mandiri, Livin)
                  </div>
                  <div className="inline-block p-3 bg-white rounded-xl mx-auto">
                    <QRCodeSVG
                      value={`CONVENA-QRIS:${event.id}:${selectedTier?.id}:${totalToPay}`}
                      size={148}
                    />
                  </div>
                  <p className="text-[11px] text-[#9C9C9C] m-0">
                    Pindai kode QRIS di atas melalui aplikasi m-banking atau e-wallet Anda.
                  </p>
                </div>
              ) : (
                <div className="bg-[#141414] border border-[#262626] rounded-xl p-5 space-y-3 text-xs">
                  <div className="font-bold text-white">Transfer Virtual Account Bank</div>
                  <div className="p-3 rounded-xl bg-[#0c0c0c] border border-[#2A2A2A] space-y-1">
                    <div className="text-[#9C9C9C]">Bank Mandiri / BCA Virtual Account</div>
                    <div className="font-mono text-base font-extrabold text-[#CFFE06]">
                      8801 9920 {event.id.replace(/\D/g, '').slice(0, 6).padEnd(6, '8')}
                    </div>
                    <div className="text-[11px] text-[#9C9C9C]">a.n. Convena Escrow — {event.organizationName}</div>
                  </div>
                </div>
              )}

              {registrationError && (
                <p role="alert" className="text-xs text-[#DF00D0] m-0">
                  {registrationError}
                </p>
              )}

              <button
                type="button"
                onClick={handleConfirmPaidTicket}
                disabled={isSubmitting || !selectedTier}
                className="w-full py-4 px-6 bg-[#CFFE06] hover:bg-[#bde805] text-[#000000] font-bold text-sm rounded-full transition-all duration-200 cursor-pointer disabled:opacity-60 shadow-[0_0_20px_rgba(207,254,6,0.3)]"
              >
                {isSubmitting
                  ? 'Memverifikasi Pembayaran...'
                  : `Konfirmasi Pembayaran (${paymentMethod === 'qris' ? 'QRIS' : 'Bank'}) & Selesai`}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Done Modal */}
      <Modal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title={isFreeTier ? 'Pendaftaran Tiket Gratis Berhasil!' : 'Pembayaran & Pendaftaran Berhasil!'}
      >
        <div className="text-center py-2 font-['Montserrat',sans-serif]">
          <div className="inline-block p-4 bg-white rounded-xl mb-4">
            <QRCodeSVG
              value={myRegistration?.ticketCode || `TKT-${event.id.slice(0, 6)}`}
              size={140}
            />
          </div>
          <div className="font-mono font-bold text-xs mb-3 text-[#CFFE06]">
            Kode Tiket: {myRegistration?.ticketCode}
          </div>

          <h3 className="text-lg font-bold text-white mb-1">{attendeeName}</h3>
          <p className="text-[#9C9C9C] text-xs mb-4 leading-relaxed">
            Tiket Anda untuk <strong>{event.title}</strong> sudah aktif. Saat hari pelaksanaan, pindai <strong>QR Presensi</strong> dari penyelenggara untuk mencatat kehadiran Anda.
          </p>

          <div className="p-3.5 bg-[#202020] border border-[#3D3D3D]/50 rounded-xl text-xs text-left space-y-1.5 text-[#9C9C9C]">
            <div>
              <strong className="text-white">Tier:</strong> {myRegistration?.tierName || selectedTier?.name}
            </div>
            <div>
              <strong className="text-white">Status Pembayaran:</strong>{' '}
              {isFreeTier ? 'Gratis (Lunas)' : `Lunas (${paymentMethod.toUpperCase()})`}
            </div>
            <div className="flex items-center gap-1.5 text-[#CFFE06] pt-1">
              <ShieldCheck size={14} />
              <span>Siap Melakukan Scan QR Presensi Kehadiran</span>
            </div>
          </div>

          <div className="mt-5">
            <Button variant="accent" fullWidth onClick={() => setIsSuccessModalOpen(false)}>
              Selesai
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
