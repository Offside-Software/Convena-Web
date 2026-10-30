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
  Wallet,
  ArrowDown,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '../../components/common/Button.tsx'
import { Badge } from '../../components/common/Badge.tsx'
import { Modal } from '../../components/common/Modal.tsx'
import { eventsService } from '../../services/events.service.ts'
import type { Event, TicketTier } from '../../types/event.ts'

export const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)

  // Ticket checkout state matching Images 2, 3, 4
  const [selectedTier, setSelectedTier] = useState<TicketTier | null>(null)
  const [ticketQuantity, setTicketQuantity] = useState(1)
  const [memberDiscountActive, setMemberDiscountActive] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'bank' | 'ewallet'>('qris')
  const [attendeeName, setAttendeeName] = useState('Arya Pratama')
  const [attendeeEmail, setAttendeeEmail] = useState('arya@student.telkomuniversity.ac.id')
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [registrationResult, setRegistrationResult] = useState<{ registrationId: string; qrCode: string } | null>(null)

  useEffect(() => {
    if (id) {
      eventsService.getEventById(id).then((res) => {
        setEvent(res || null)
        if (res?.ticketTiers?.length) {
          setSelectedTier(res.ticketTiers[0])
        }
        setLoading(false)
      })
    } else {
      // Default to premier event if no id
      eventsService.getEventById('evt-global-tech-summit').then((res) => {
        setEvent(res || null)
        if (res?.ticketTiers?.length) {
          setSelectedTier(res.ticketTiers[0])
        }
        setLoading(false)
      })
    }
  }, [id])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8 bg-[#000000] text-white font-['Montserrat',sans-serif]">
        <div className="w-10 h-10 border-2 border-[#CFFE06] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-semibold text-sm text-[#9C9C9C]">Memuat detail acara...</p>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="max-w-[500px] my-16 mx-auto text-center p-8 bg-[#151515] border border-[#3D3D3D] rounded-xl text-white font-['Montserrat',sans-serif]">
        <h2 className="text-xl font-bold mb-2">Event Tidak Ditemukan</h2>
        <p className="my-4 text-xs text-[#9C9C9C]">Acara yang Anda cari mungkin telah ditutup atau tautan salah.</p>
        <Link to="/events" className="no-underline">
          <Button variant="accent">Kembali ke Katalog Event</Button>
        </Link>
      </div>
    )
  }

  // Price calculations matching Image 4
  const basePricePerTicket = selectedTier ? selectedTier.price : 350000
  const subtotal = basePricePerTicket * ticketQuantity
  const discountAmount = memberDiscountActive ? Math.round(subtotal * 0.15) : 0
  const gatewayFee = subtotal > 0 ? 4500 : 0
  const totalToPay = Math.max(0, subtotal - discountAmount + gatewayFee)

  const handlePay = async () => {
    if (!selectedTier) return
    const res = await eventsService.registerTicket(event.id, selectedTier.id, {
      name: attendeeName,
      email: attendeeEmail,
    })
    setRegistrationResult(res)
    setIsSuccessModalOpen(true)
  }

  return (
    <div className="max-w-[1280px] mx-auto py-6 px-4 sm:px-6 pb-20 font-['Montserrat',sans-serif] bg-[#000000] text-white">
      {/* Top Header with circular back button as seen in Image 1 & Image 4 */}
      <div className="flex items-center gap-3.5 mb-6">
        <Link
          to="/events"
          className="w-10 h-10 rounded-full bg-[#1c1c1c] hover:bg-[#252525] flex items-center justify-center text-white hover:text-[#CFFE06] transition-colors no-underline shrink-0"
          title="Kembali ke Event"
        >
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight m-0">
          Dashboard
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_440px] gap-8 items-start">
        {/* Left Column: Event Overview & Content */}
        <div className="space-y-6">
          {/* Banner container */}
          <div className="bg-[#141414] border border-[#262626] rounded-xl overflow-hidden">
            <div className="h-[280px] sm:h-[360px] relative overflow-hidden bg-[#202020]">
              <img
                src={event.bannerUrl}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-black/30" />
              <div className="absolute top-4 left-4 flex gap-2">
                <Badge variant="accent">
                  {event.category.toUpperCase()}
                </Badge>
                <Badge variant="dark">
                  {event.university}
                </Badge>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-[#9C9C9C]">
                  Diselenggarakan oleh:
                </span>
                <span className="font-bold text-xs text-white">{event.organizationName}</span>
                <CheckCircle size={14} className="text-[#CFFE06]" />
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-4">
                {event.title}
              </h1>

              {/* Tag pills */}
              <div className="flex gap-2 flex-wrap mb-6">
                {event.tags.map((t) => (
                  <Badge key={t} variant="dark">
                    #{t}
                  </Badge>
                ))}
              </div>

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
                    <MapPin size={15} /> Lokasi Acara
                  </div>
                  <div className="font-semibold text-xs sm:text-sm text-white mt-1">
                    {event.location.venueName || 'Telkom University Convention Hall'}
                  </div>
                  <div className="text-xs text-[#9C9C9C] mt-0.5">
                    {event.location.address || 'Bandung, Jawa Barat'}
                  </div>
                </div>
              </div>

              {/* Event Description */}
              <div className="mb-6">
                <h3 className="text-base font-bold text-white mb-2">
                  Tentang Acara Ini
                </h3>
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
                    <span className="font-mono font-bold text-[#CFFE06] text-xs min-w-[85px]">08:30 - 09:00</span>
                    <div>
                      <strong className="text-xs text-white">Registrasi Ulang & Check-in QR</strong>
                      <p className="text-[11px] m-0 text-[#9C9C9C] mt-0.5">Pemeriksaan e-tiket dan pembagian welcome kit peserta.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 p-3 border border-[#262626] rounded-xl bg-[#181818]">
                    <span className="font-mono font-bold text-[#CFFE06] text-xs min-w-[85px]">09:00 - 12:00</span>
                    <div>
                      <strong className="text-xs text-white">Opening Ceremony & Keynote Session</strong>
                      <p className="text-[11px] m-0 text-[#9C9C9C] mt-0.5">Pemaparan materi inovasi oleh pembicara industri teknologi terkemuka.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 p-3 border border-[#262626] rounded-xl bg-[#181818]">
                    <span className="font-mono font-bold text-[#CFFE06] text-xs min-w-[85px]">13:00 - 16:30</span>
                    <div>
                      <strong className="text-xs text-white">Hands-on Workshop & Networking</strong>
                      <p className="text-[11px] m-0 text-[#9C9C9C] mt-0.5">Sesi praktik langsung dan koneksi karir mahasiswa.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Checkout & Ticketing (Images 2, 3, 4 Redesign) */}
        <div className="space-y-4 sticky top-[80px]">
          {/* Card 1: Verified Ticket Card (Image 3) */}
          <div className="bg-[#141414] border border-[#262626] rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              {/* Verified Ticket Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#CFFE06]/15 text-[#CFFE06] font-bold text-xs">
                <span>Verified Ticket</span>
              </div>
              <span className="text-xs font-semibold text-[#9C9C9C]">
                ID: #TS-9482
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-white leading-snug mb-2">
              {event.title}
            </h3>

            <div className="flex items-center gap-2 text-xs text-[#9C9C9C] mb-4">
              <MapPin size={15} className="text-[#CFFE06] shrink-0 fill-[#CFFE06]" />
              <span>{event.location.venueName || 'Telkom University Convention Hall'}</span>
            </div>

            {/* Selected Tier Selector */}
            <div className="border-t border-[#262626] pt-3">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-[#9C9C9C]">Selected Tier:</span>
                <span className="font-bold text-white">{selectedTier?.name || 'VIP All-Access + Workshop'}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {(event.ticketTiers ?? []).map((tier) => (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setSelectedTier(tier)}
                    className={`p-2 rounded-lg text-left text-xs transition-colors cursor-pointer border ${
                      selectedTier?.id === tier.id
                        ? 'border-[#CFFE06] bg-[#202020] text-white'
                        : 'border-[#262626] bg-[#0c0c0c] text-[#9C9C9C] hover:text-white'
                    }`}
                  >
                    <div className="font-bold truncate">{tier.name}</div>
                    <div className="text-[11px] text-[#CFFE06] font-semibold mt-0.5">
                      {tier.price === 0 ? 'GRATIS' : `Rp ${tier.price.toLocaleString('id-ID')}`}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2: Quantity, Discount, Payment Method (Image 2) */}
          <div className="bg-[#141414] border border-[#262626] rounded-xl p-5 space-y-4">
            {/* Ticket Quantity Stepper */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">
                Ticket Quantity
              </span>
              <div className="flex items-center gap-5 bg-[#0a0a0a] border border-[#262626] rounded-full py-1.5 px-4">
                <button
                  type="button"
                  onClick={() => setTicketQuantity(Math.max(1, ticketQuantity - 1))}
                  className="text-white hover:text-[#CFFE06] cursor-pointer transition-colors"
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
                  className="text-[#CFFE06] hover:brightness-110 cursor-pointer transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Member Discount Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">
                Member Discount (15%)
              </span>
              <button
                type="button"
                onClick={() => setMemberDiscountActive(!memberDiscountActive)}
                className={`w-12 h-6.5 rounded-full p-0.5 transition-colors relative cursor-pointer border-none ${
                  memberDiscountActive ? 'bg-[#CFFE06]' : 'bg-[#2a2a2a]'
                }`}
                aria-label="Toggle member discount"
              >
                <span
                  className={`w-5.5 h-5.5 rounded-full bg-white block shadow transition-transform ${
                    memberDiscountActive ? 'translate-x-5.5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Attendee Details */}
            <div className="pt-2 border-t border-[#262626] space-y-2">
              <span className="block text-xs font-semibold text-[#9C9C9C]">
                Data Pemilik Tiket
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Nama Lengkap"
                  value={attendeeName}
                  onChange={(e) => setAttendeeName(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg py-1.5 px-3 text-xs text-white outline-none focus:border-[#CFFE06]"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={attendeeEmail}
                  onChange={(e) => setAttendeeEmail(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg py-1.5 px-3 text-xs text-white outline-none focus:border-[#CFFE06]"
                />
              </div>
            </div>

            {/* Payment Method Selector (Image 2) */}
            <div className="pt-2">
              <span className="block text-xs font-medium text-[#9C9C9C] mb-2.5">
                Payment Method
              </span>
              <div className="grid grid-cols-3 gap-2.5">
                {/* QRIS */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('qris')}
                  className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    paymentMethod === 'qris'
                      ? 'border-2 border-[#CFFE06] bg-[#1a2205] text-[#CFFE06]'
                      : 'border border-[#262626] bg-[#0c0c0c] text-white hover:border-[#3D3D3D]'
                  }`}
                >
                  <QrCode size={22} className={paymentMethod === 'qris' ? 'text-[#CFFE06]' : 'text-white'} />
                  <span className="text-xs font-bold text-white">QRIS</span>
                </button>

                {/* Bank */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('bank')}
                  className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    paymentMethod === 'bank'
                      ? 'border-2 border-[#CFFE06] bg-[#1a2205] text-[#CFFE06]'
                      : 'border border-[#262626] bg-[#0c0c0c] text-white hover:border-[#3D3D3D]'
                  }`}
                >
                  <Landmark size={22} className={paymentMethod === 'bank' ? 'text-[#CFFE06]' : 'text-white'} />
                  <span className="text-xs font-bold text-white">Bank</span>
                </button>

                {/* E-Wallet */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('ewallet')}
                  className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    paymentMethod === 'ewallet'
                      ? 'border-2 border-[#CFFE06] bg-[#1a2205] text-[#CFFE06]'
                      : 'border border-[#262626] bg-[#0c0c0c] text-white hover:border-[#3D3D3D]'
                  }`}
                >
                  <Wallet size={22} className={paymentMethod === 'ewallet' ? 'text-[#CFFE06]' : 'text-white'} />
                  <span className="text-xs font-bold text-white">E-Wallet</span>
                </button>
              </div>
            </div>
          </div>

          {/* Card 3: Order Price Summary (Image 4) */}
          <div className="bg-[#141414] border border-[#262626] rounded-xl p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3.5">
              ORDER PRICE SUMMARY
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-[#9C9C9C]">
                <span>Base Ticket Price ({ticketQuantity}x)</span>
                <span className="text-white font-medium">Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>
              {memberDiscountActive && (
                <div className="flex justify-between text-[#9C9C9C]">
                  <span>Member Discount (15%)</span>
                  <span className="text-[#CFFE06] font-bold">-Rp {discountAmount.toLocaleString('id-ID')}</span>
                </div>
              )}
              <div className="flex justify-between text-[#9C9C9C]">
                <span>Gateway Fee & Service</span>
                <span className="text-white font-medium">Rp {gatewayFee.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="border-t border-[#262626] pt-3.5 mt-3.5 flex items-baseline justify-between">
              <div>
                <span className="text-[11px] text-[#9C9C9C] block mb-0.5">Est. To Be Paid</span>
                <span className="text-xl font-black text-white">
                  Rp {totalToPay.toLocaleString('id-ID')}
                </span>
              </div>
              <span className="text-[11px] text-[#9C9C9C]">Expires in 15:00</span>
            </div>
          </div>

          {/* Card 4: QRIS Scan Card with Stylized Corner Reticle (Image 4) */}
          <div className="bg-[#141414] border border-[#262626] rounded-xl p-5 text-center">
            <div className="flex items-center justify-between text-xs text-white font-semibold mb-3">
              <span>Scan via GoPay, OVO, BCA, QRIS</span>
              <button
                type="button"
                className="flex flex-col items-center gap-0.5 text-[10px] font-semibold text-[#CFFE06] hover:brightness-110 cursor-pointer bg-transparent border-none p-0"
              >
                <div className="w-5 h-5 rounded-full border border-[#CFFE06] flex items-center justify-center">
                  <ArrowDown size={11} className="text-[#CFFE06]" />
                </div>
                <span>Unduh</span>
              </button>
            </div>

            {/* Stylized Reticle matching Image 4 */}
            <div className="my-2 py-2 flex flex-col items-center justify-center">
              <svg width="104" height="104" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Top Left Corner */}
                <path d="M 12 30 V 20 C 12 15.5 15.5 12 20 12 H 30" stroke="#CFFE06" strokeWidth="4.5" strokeLinecap="round" />
                {/* Top Right Corner */}
                <path d="M 70 12 H 80 C 84.5 12 88 15.5 88 20 V 30" stroke="#CFFE06" strokeWidth="4.5" strokeLinecap="round" />
                {/* Bottom Left Corner */}
                <path d="M 12 70 V 80 C 12 84.5 15.5 88 20 88 H 30" stroke="#CFFE06" strokeWidth="4.5" strokeLinecap="round" />
                {/* Bottom Right Corner */}
                <path d="M 70 88 H 80 C 84.5 88 88 84.5 88 80 V 70" stroke="#CFFE06" strokeWidth="4.5" strokeLinecap="round" />
                {/* Center Reticle Square */}
                <rect x="36" y="36" width="28" height="28" rx="7" stroke="#CFFE06" strokeWidth="4.5" />
              </svg>
            </div>

            <p className="text-[11px] text-[#9C9C9C] m-0 max-w-[240px] mx-auto leading-relaxed">
              Point your banking camera app to complete the transaction instantly
            </p>
          </div>

          {/* Pay Button: Big pill button as seen in Image 4 */}
          <button
            type="button"
            onClick={handlePay}
            className="w-full py-4 px-6 bg-[#CFFE06] hover:bg-[#bde805] text-[#000000] font-medium text-sm rounded-full transition-all duration-200 cursor-pointer shadow-[0_0_20px_rgba(207,254,6,0.3)] hover:shadow-[0_0_30px_rgba(207,254,6,0.5)] active:scale-[0.99] flex items-center justify-center gap-2 select-none"
          >
            <span>Pay</span>
          </button>
        </div>
      </div>

      {/* Success QR Ticket Modal */}
      <Modal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="Pembayaran Berhasil!"
      >
        <div className="text-center py-2 font-['Montserrat',sans-serif]">
          <div className="inline-block p-4 bg-[#000000] border border-[#CFFE06] rounded-xl mb-4 shadow-[0_0_20px_rgba(207,254,6,0.2)]">
            <QrCode size={160} className="text-[#CFFE06] mx-auto block" />
            <div className="font-mono font-bold text-xs mt-2 text-white bg-[#202020] py-1 px-3 rounded-full border border-[#3D3D3D]">
              {registrationResult?.registrationId || 'TS-9482-CONFIRMED'}
            </div>
          </div>

          <h3 className="text-lg font-bold text-white mb-1">{attendeeName}</h3>
          <p className="text-[#9C9C9C] text-xs mb-4 leading-relaxed">
            Tiket untuk <strong>{event.title}</strong> telah aktif. Tunjukkan QR code ini saat check-in di lokasi acara.
          </p>

          <div className="p-3.5 bg-[#202020] border border-[#3D3D3D]/50 rounded-xl text-xs text-left space-y-1.5 text-[#9C9C9C]">
            <div><strong className="text-white">Tier:</strong> {selectedTier?.name}</div>
            <div><strong className="text-white">Jumlah:</strong> {ticketQuantity} Tiket</div>
            <div><strong className="text-white">Total Bayar:</strong> Rp {totalToPay.toLocaleString('id-ID')}</div>
            <div className="flex items-center gap-1.5 text-[#CFFE06] pt-1">
              <ShieldCheck size={14} />
              <span>Sertifikat Digital Berhak Diklaim Selesai Acara</span>
            </div>
          </div>

          <div className="mt-5">
            <Button
              variant="accent"
              fullWidth
              onClick={() => setIsSuccessModalOpen(false)}
            >
              Simpan Tiket ke Perangkat
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
