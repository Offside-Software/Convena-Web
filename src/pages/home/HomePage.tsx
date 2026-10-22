import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Calendar, CheckCircle2, DollarSign, FileText, Search, ShieldCheck, Sparkles, Trophy, Users } from 'lucide-react'
import { Button } from '../../components/common/Button.tsx'
import { Badge } from '../../components/common/Badge.tsx'
import { Card } from '../../components/common/Card.tsx'
import { MemphisShape } from '../../components/shapes/MemphisShape.tsx'
import { EventCard } from '../../components/domain/EventCard.tsx'
import { eventsService } from '../../services/events.service.ts'
import type { Event } from '../../types/event.ts'

export const HomePage: React.FC = () => {
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    eventsService.getEvents().then(setFeaturedEvents)
  }, [])

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      {/* HERO SECTION */}
      <section
        className="memphis-pattern-dots"
        style={{
          borderBottom: 'var(--mem-border-thick)',
          padding: '4rem 1.5rem 5rem',
          position: 'relative',
        }}
      >
        {/* Floating Decorative Memphis Shapes */}
        <div style={{ position: 'absolute', top: '25px', left: '5%' }}>
          <MemphisShape type="zigzag" size={80} color="var(--mem-pink)" animate="slow" />
        </div>
        <div style={{ position: 'absolute', top: '40px', right: '6%' }}>
          <MemphisShape type="starburst" size={60} color="var(--mem-yellow)" animate="fast" />
        </div>
        <div style={{ position: 'absolute', bottom: '30px', left: '8%' }}>
          <MemphisShape type="cross" size={40} color="var(--mem-cyan)" />
        </div>
        <div style={{ position: 'absolute', bottom: '25px', right: '10%' }}>
          <MemphisShape type="arch" size={60} color="var(--mem-purple)" animate="slow" />
        </div>

        <div style={{ maxWidth: '1080px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', marginBottom: '1.25rem' }}>
            <Badge variant="yellow" tilt="left" icon={<Sparkles size={14} />}>
              #1 PLATFORM ORMAWA INDONESIA
            </Badge>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.5rem, 5.5vw + 0.5rem, 4.25rem)',
              fontWeight: 900,
              lineHeight: 1.1,
              marginBottom: '1.25rem',
              color: 'var(--mem-dark)',
            }}
          >
            Kelola Acara Kampus & Ormawa{' '}
            <span
              style={{
                backgroundColor: 'var(--mem-yellow)',
                border: 'var(--mem-border)',
                padding: '0 0.4rem',
                boxShadow: '4px 4px 0px var(--mem-dark)',
                display: 'inline-block',
                transform: 'rotate(-1deg)',
              }}
            >
              Tanpa Ribet
            </span>
          </h1>

          <p
            style={{
              fontSize: 'clamp(1.05rem, 1.5vw, 1.25rem)',
              color: '#374151',
              maxWidth: '750px',
              margin: '0 auto 2rem',
              fontWeight: 500,
              lineHeight: 1.6,
            }}
          >
            Dari registrasi tiket ber-QR, pelacakan proposal sponsorship CRM, transparansi anggaran & kuitansi SPJ,
            hingga penerbitan sertifikat tervalidasi publik.
          </p>

          {/* Hero Action Buttons */}
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: '2.5rem',
            }}
          >
            <Link to="/events" style={{ textDecoration: 'none' }}>
              <Button variant="pink" size="lg" icon={<Calendar size={20} />}>
                Jelajahi Event Kampus
              </Button>
            </Link>
            <Link to="/dashboard" style={{ textDecoration: 'none' }}>
              <Button variant="cyan" size="lg" icon={<ArrowRight size={20} />}>
                Buka Dashboard Panitia
              </Button>
            </Link>
          </div>

          {/* Quick Search Box in Memphis Style */}
          <div
            className="memphis-box"
            style={{
              maxWidth: '680px',
              margin: '0 auto',
              padding: '0.65rem',
              backgroundColor: '#FFFFFF',
              boxShadow: '6px 6px 0px var(--mem-dark)',
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center',
            }}
          >
            <Search size={22} style={{ marginLeft: '0.5rem', color: 'var(--mem-gray-500)', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Cari hackathon, seminar BEM, workshop AI, kampus (ITB, UI)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                boxShadow: 'none',
                padding: '0.5rem',
                fontSize: '1rem',
              }}
            />
            <Link to={`/events?search=${encodeURIComponent(searchQuery)}`} style={{ textDecoration: 'none' }}>
              <Button variant="yellow" size="md">
                Cari
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* STATS TICKER STRIP */}
      <section
        style={{
          backgroundColor: 'var(--mem-dark)',
          borderBottom: 'var(--mem-border-thick)',
          padding: '1.25rem 1rem',
          color: '#FFFFFF',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            textAlign: 'center',
          }}
        >
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.85rem', color: 'var(--mem-yellow)' }}>
              150+ Kampus
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#9CA3AF' }}>Seluruh Indonesia</div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.85rem', color: 'var(--mem-cyan)' }}>
              35.000+ Peserta
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#9CA3AF' }}>Tiket & QR Check-in</div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.85rem', color: 'var(--mem-pink)' }}>
              Rp 1,8 Miliar
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#9CA3AF' }}>Sponsorship & Tiket Terkelola</div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.85rem', color: 'var(--mem-mint)' }}>
              100% Valid
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#9CA3AF' }}>E-Certificate Anti-Pemalsuan</div>
          </div>
        </div>
      </section>

      {/* FEATURED EVENTS SECTION */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '4rem 1.5rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginBottom: '2.5rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'inline-flex', marginBottom: '0.5rem' }}>
              <Badge variant="cyan" tilt="left">
                AGENDA PILIHAN
              </Badge>
            </div>
            <h2 style={{ fontSize: '2.2rem' }}>Event Mahasiswa Terpopuler</h2>
            <p style={{ color: 'var(--mem-gray-500)', margin: 0 }}>
              Daftar sekarang sebelum kuota peserta dan tiket presale habis!
            </p>
          </div>

          <Link to="/events" style={{ textDecoration: 'none' }}>
            <Button variant="yellow" size="md">
              Lihat Semua Event ({featuredEvents.length}) →
            </Button>
          </Link>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.75rem',
          }}
        >
          {featuredEvents.slice(0, 3).map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>

      {/* CONVENA FEATURES - MEMPHIS PILLARS */}
      <section
        style={{
          backgroundColor: '#FFFFFF',
          borderTop: 'var(--mem-border-thick)',
          borderBottom: 'var(--mem-border-thick)',
          padding: '5rem 1.5rem',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 3.5rem' }}>
            <Badge variant="pink" tilt="right">
              ALL-IN-ONE SOLUTION
            </Badge>
            <h2 style={{ fontSize: '2.4rem', margin: '0.75rem 0' }}>
              Dirancang Khusus untuk Kebutuhan Ormawa Kampus
            </h2>
            <p style={{ color: 'var(--mem-gray-500)' }}>
              Bukan sekadar platform tiket biasa. Convena mengintegrasikan seluruh siklus kerja panitia mahasiswa dari
              awal pembentukan hingga LPJ akhir.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.75rem',
            }}
          >
            {/* Pillar 1: Ticketing & QR */}
            <Card headerColor="yellow" headerTitle="01. Tiket & Presensi QR">
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <Users size={32} style={{ color: 'var(--mem-dark)', flexShrink: 0 }} />
                <h4 style={{ fontSize: '1.15rem' }}>Pendaftaran & Scan QR Cepat</h4>
              </div>
              <p style={{ fontSize: '0.9rem', color: '#4B5563' }}>
                Peserta mendapatkan e-tiket ber-QR anti duplikasi. Panitia tinggal memindai saat hari-H di pintu masuk
                dalam hitungan detik.
              </p>
            </Card>

            {/* Pillar 2: Sponsorship CRM */}
            <Card headerColor="pink" headerTitle="02. Sponsorship CRM">
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <Trophy size={32} style={{ color: 'var(--mem-pink)', flexShrink: 0 }} />
                <h4 style={{ fontSize: '1.15rem' }}>Pipeline Mitra & Draf AI</h4>
              </div>
              <p style={{ fontSize: '0.9rem', color: '#4B5563' }}>
                Pantau progres penawaran sponsor (prospek, negosiasi, transfer), plus bantuan draf surat penawaran
                formal berbahasa Indonesia dengan AI.
              </p>
            </Card>

            {/* Pillar 3: Budgeting & SPJ */}
            <Card headerColor="cyan" headerTitle="03. Anggaran & Kuitansi SPJ">
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <DollarSign size={32} style={{ color: 'var(--mem-cyan)', flexShrink: 0 }} />
                <h4 style={{ fontSize: '1.15rem' }}>Audit Keuangan Transparan</h4>
              </div>
              <p style={{ fontSize: '0.9rem', color: '#4B5563' }}>
                Catat pengeluaran tiap divisi beserta unggah bukti kuitansi. Bendahara dapat menyetujui kuitansi dan
                langsung mengekspor draf LPJ.
              </p>
            </Card>

            {/* Pillar 4: Verifiable E-Certificate */}
            <Card headerColor="purple" headerTitle="04. E-Sertifikat Tervalidasi">
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <ShieldCheck size={32} style={{ color: 'var(--mem-purple)', flexShrink: 0 }} />
                <h4 style={{ fontSize: '1.15rem' }}>Verifikasi Publik Otentik</h4>
              </div>
              <p style={{ fontSize: '0.9rem', color: '#4B5563' }}>
                Sertifikat dilengkapi nomor seri unik dan tautan verifikasi publik, memudahkan peserta membuktikan
                keaslian untuk portofolio dan beasiswa.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION BANNER */}
      <section
        style={{
          padding: '4.5rem 1.5rem',
          maxWidth: '1280px',
          margin: '0 auto',
        }}
      >
        <div
          className="memphis-box memphis-pattern-dots-colored"
          style={{
            padding: '3rem 2rem',
            textAlign: 'center',
            backgroundColor: '#FFFFFF',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', top: '15px', left: '20px' }}>
            <MemphisShape type="squiggle" size={70} color="var(--mem-pink)" />
          </div>
          <div style={{ position: 'absolute', bottom: '15px', right: '20px' }}>
            <MemphisShape type="triangle" size={50} color="var(--mem-cyan)" />
          </div>

          <Badge variant="mint" tilt="left" style={{ marginBottom: '1rem' }}>
            MULAI SEKARANG
          </Badge>
          <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', marginBottom: '1rem' }}>
            Waktunya Mengelola Event Tanpa Kekacauan Dokumen
          </h2>
          <p style={{ maxWidth: '600px', margin: '0 auto 2rem', color: '#4B5563', fontSize: '1.05rem' }}>
            Gabung bersama BEM, Himpunan Mahasiswa, dan Unit Kegiatan Mahasiswa yang telah menggunakan Convena.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/events" style={{ textDecoration: 'none' }}>
              <Button variant="yellow" size="lg" icon={<CheckCircle2 size={20} />}>
                Daftar Event Pertama Anda
              </Button>
            </Link>
            <Link to="/verify" style={{ textDecoration: 'none' }}>
              <Button variant="outline" size="lg" icon={<FileText size={20} />}>
                Cek Keaslian Sertifikat
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
