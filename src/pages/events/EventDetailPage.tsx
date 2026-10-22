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
      <div style={{ textAlign: 'center', padding: '6rem 1rem' }}>
        <MemphisShape type="starburst" size={60} color="var(--mem-pink)" animate="fast" />
        <p style={{ marginTop: '1rem', fontWeight: 700 }}>Memuat informasi acara...</p>
      </div>
    )
  }

  if (!event) {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center', padding: '2rem' }}>
        <h2>Event Tidak Ditemukan</h2>
        <p style={{ margin: '1rem 0 2rem' }}>Acara yang Anda cari mungkin telah ditutup atau tautan salah.</p>
        <Link to="/events" style={{ textDecoration: 'none' }}>
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
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
      {/* Back button */}
      <Link
        to="/events"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontWeight: 700,
          fontFamily: 'var(--font-display)',
          fontSize: '0.9rem',
          marginBottom: '1.5rem',
          color: 'var(--mem-dark)',
          textDecoration: 'none',
        }}
      >
        <ArrowLeft size={16} /> Kembali ke Semua Event
      </Link>

      {/* Main Grid */}
      <div
        className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-10 items-start"
      >
        {/* Left Column: Details */}
        <div>
          {/* Banner container */}
          <div
            className="memphis-box"
            style={{
              overflow: 'hidden',
              marginBottom: '2rem',
              backgroundColor: '#FFFFFF',
            }}
          >
            <div style={{ height: '360px', position: 'relative', overflow: 'hidden' }}>
              <img
                src={event.bannerUrl}
                alt={event.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', top: '15px', left: '15px' }}>
                <Badge variant="pink" tilt="left">
                  {event.category.toUpperCase()}
                </Badge>
              </div>
              <div style={{ position: 'absolute', top: '15px', right: '15px' }}>
                <Badge variant="yellow">{event.university}</Badge>
              </div>
            </div>

            <div style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--mem-gray-500)' }}>
                  Diselenggarakan oleh:
                </span>
                <span style={{ fontWeight: 800, color: 'var(--mem-dark)' }}>{event.organizationName}</span>
                <CheckCircle size={16} style={{ color: 'var(--mem-cyan)', fill: 'var(--mem-dark)' }} />
              </div>

              <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.75rem)', lineHeight: 1.15, marginBottom: '1.25rem' }}>
                {event.title}
              </h1>

              {/* Tag pills */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                {event.tags.map((t) => (
                  <Badge key={t} variant="outline">
                    #{t}
                  </Badge>
                ))}
              </div>

              {/* Quick Info Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                  padding: '1.25rem',
                  backgroundColor: 'var(--mem-bg)',
                  border: '2px solid var(--mem-dark)',
                  borderRadius: '8px',
                  marginBottom: '2rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--mem-pink)', fontWeight: 700, fontSize: '0.85rem' }}>
                    <Calendar size={16} /> Waktu & Tanggal
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', marginTop: '2px' }}>
                    {new Date(event.startDate).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--mem-cyan)', fontWeight: 700, fontSize: '0.85rem' }}>
                    <MapPin size={16} /> Lokasi Acara
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', marginTop: '2px' }}>
                    {event.location.venueName || 'Online'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--mem-gray-500)' }}>
                    {event.location.address || 'Link dikirim via email'}
                  </div>
                </div>
              </div>

              {/* Event Description */}
              <div style={{ marginBottom: '2.5rem' }}>
                <h3 style={{ fontSize: '1.35rem', marginBottom: '0.75rem' }}>Tentang Acara Ini</h3>
                <p style={{ fontSize: '1.05rem', lineHeight: 1.7, color: '#374151', whiteSpace: 'pre-line' }}>
                  {event.description}
                </p>
              </div>

              {/* Rundown Schedule Preview */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.35rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={20} style={{ color: 'var(--mem-pink)' }} /> Susunan Acara (Rundown)
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', padding: '0.75rem', border: '1.5px solid var(--mem-dark)', borderRadius: '6px', background: '#FFFFFF' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--mem-pink)', minWidth: '90px' }}>08:30 - 09:00</span>
                    <div>
                      <strong>Registrasi Ulang & Check-in QR</strong>
                      <p style={{ fontSize: '0.85rem', margin: 0, color: 'var(--mem-gray-500)' }}>Pemeriksaan e-tiket dan pembagian welcome kit peserta.</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', padding: '0.75rem', border: '1.5px solid var(--mem-dark)', borderRadius: '6px', background: '#FFFFFF' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--mem-cyan)', minWidth: '90px' }}>09:00 - 12:00</span>
                    <div>
                      <strong>Opening Ceremony & Sesi Utama</strong>
                      <p style={{ fontSize: '0.85rem', margin: 0, color: 'var(--mem-gray-500)' }}>Sambutan Rektorat & Pemaparan materi praktis oleh pembicara industri.</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', padding: '0.75rem', border: '1.5px solid var(--mem-dark)', borderRadius: '6px', background: '#FFFFFF' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--mem-yellow)', minWidth: '90px' }}>13:00 - 16:30</span>
                    <div>
                      <strong>Hands-on Workshop & Networking Session</strong>
                      <p style={{ fontSize: '0.85rem', margin: 0, color: 'var(--mem-gray-500)' }}>Simulasi studi kasus interaktif dan jejaring kemitraan karir.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Ticket Booking Card */}
        <div style={{ position: 'sticky', top: '90px' }}>
          <Card headerColor="yellow" headerTitle="Pilihan Kategori Tiket">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {event.ticketTiers.map((tier) => {
                const isSelected = selectedTier?.id === tier.id
                return (
                  <div
                    key={tier.id}
                    onClick={() => tier.isAvailable && setSelectedTier(tier)}
                    style={{
                      padding: '1rem',
                      border: isSelected ? '3px solid var(--mem-dark)' : '2px solid var(--mem-gray-200)',
                      backgroundColor: isSelected ? 'var(--mem-yellow-light)' : '#FFFFFF',
                      borderRadius: '8px',
                      cursor: tier.isAvailable ? 'pointer' : 'not-allowed',
                      opacity: tier.isAvailable ? 1 : 0.6,
                      boxShadow: isSelected ? '4px 4px 0px var(--mem-dark)' : 'none',
                      transition: 'all 0.15s ease',
                      position: 'relative',
                    }}
                  >
                    {!tier.isAvailable && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          backgroundColor: '#EF4444',
                          color: '#fff',
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        HABIS
                      </span>
                    )}

                    <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '0.25rem' }}>
                      {tier.name}
                    </div>

                    <div
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 900,
                        fontSize: '1.35rem',
                        color: 'var(--mem-dark)',
                        marginBottom: '0.65rem',
                      }}
                    >
                      {tier.price === 0 ? 'GRATIS' : `Rp ${tier.price.toLocaleString('id-ID')}`}
                    </div>

                    <ul style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.8rem', color: '#4B5563' }}>
                      {tier.benefits.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  </div>
                )
              })}

              {/* Registration Form when a tier is selected */}
              {selectedTier ? (
                <div style={{ borderTop: '2px dashed var(--mem-dark)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                  <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem' }}>Data Pendaftar:</h4>
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
                    style={{ marginTop: '0.5rem' }}
                  >
                    Konfirmasi Pendaftaran Tiket
                  </Button>
                </div>
              ) : (
                <div
                  style={{
                    padding: '0.75rem',
                    backgroundColor: 'var(--mem-bg)',
                    borderRadius: '6px',
                    textAlign: 'center',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                  }}
                >
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
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <div
            className="memphis-box"
            style={{
              display: 'inline-block',
              padding: '1.25rem',
              backgroundColor: '#FFFFFF',
              boxShadow: '6px 6px 0px var(--mem-dark)',
              marginBottom: '1rem',
            }}
          >
            <QrCode size={180} strokeWidth={2.5} style={{ margin: '0 auto', display: 'block' }} />
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontWeight: 900,
                fontSize: '0.85rem',
                marginTop: '0.75rem',
                backgroundColor: 'var(--mem-yellow)',
                padding: '4px',
                border: '1.5px solid var(--mem-dark)',
              }}
            >
              {registrationResult?.registrationId || 'REG-SUCCESS'}
            </div>
          </div>

          <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>{attendeeName}</h3>
          <p style={{ color: 'var(--mem-gray-500)', fontSize: '0.9rem', marginBottom: '1rem' }}>
            Tiket untuk <strong>{event.title}</strong> telah dikonfirmasi dan QR code siap dipindai saat hari-H di pintu masuk.
          </p>

          <div
            style={{
              padding: '0.75rem',
              backgroundColor: 'var(--mem-yellow-light)',
              border: '2px solid var(--mem-dark)',
              borderRadius: '8px',
              fontSize: '0.85rem',
              textAlign: 'left',
            }}
          >
            <div><strong>Kategori Tiket:</strong> {selectedTier?.name}</div>
            <div><strong>Email Konfirmasi:</strong> {attendeeEmail}</div>
            <div><strong>Status E-Certificate:</strong> Berhak klaim setelah presensi QR</div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
