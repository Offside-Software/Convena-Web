import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, CheckCircle2, DollarSign, FileText, Search, ShieldCheck, Sparkles, Trophy, Users, ArrowRight } from 'lucide-react'
import { Button } from '../../components/common/Button.tsx'
import { Badge } from '../../components/common/Badge.tsx'
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
    <div className="relative overflow-hidden bg-[#000000] text-white font-['Montserrat',sans-serif]">
      {/* HERO SECTION */}
      <section className="py-20 px-4 sm:px-6 relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] opacity-40 blur-[100px]"
          style={{
            background: 'radial-gradient(ellipse at top, #CFFE06 0%, #DF00D0 40%, transparent 75%)',
          }}
        />

        <div className="max-w-[1080px] mx-auto text-center relative z-10">
          <div className="inline-flex mb-4">
            <Badge variant="accent" icon={<Sparkles size={14} />}>
              #1 PLATFORM EVENT & ORMAWA MAHASISWA
            </Badge>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-[1.15] mb-5 text-white tracking-tight">
            Kelola Acara Kampus & Ormawa{' '}
            <span className="text-[#CFFE06] inline-block">
              Lebih Sederhana
            </span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-[#9C9C9C] max-w-[700px] mx-auto mb-8 leading-relaxed font-normal">
            Platform modern untuk mahasiswa dan pengurus organisasi: katalog event terintegrasi, QRIS ticketing, validasi sertifikat digital, pipeline sponsorship, dan transparansi anggaran SPJ.
          </p>

          {/* Hero Action Buttons - Non logged in can explore events & verify */}
          <div className="flex gap-3 justify-center flex-wrap mb-10">
            <Link to="/events" className="no-underline">
              <Button variant="accent" size="lg" icon={<Calendar size={18} />}>
                Explore Events
              </Button>
            </Link>
            <Link to="/verify" className="no-underline">
              <Button variant="outline" size="lg" icon={<ShieldCheck size={18} />}>
                Verify Certificate
              </Button>
            </Link>
          </div>

          {/* Clean Dark Search Box */}
          <div className="max-w-[640px] mx-auto p-2 bg-[#151515] border border-[#3D3D3D] rounded-full flex gap-2 items-center shadow-2xl focus-within:border-[#CFFE06] transition-colors">
            <Search size={20} className="ml-3 text-[#9C9C9C] shrink-0" />
            <input
              type="text"
              placeholder="Cari hackathon, seminar, workshop, kampus (Tel-U, ITB, UI)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none outline-none py-1.5 text-sm font-medium text-white placeholder:text-[#9C9C9C]/60"
            />
            <Link to={`/events?search=${encodeURIComponent(searchQuery)}`} className="no-underline">
              <Button variant="accent" size="sm">
                Cari
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* STATS TICKER STRIP */}
      <section className="bg-[#151515] border-y border-[#202020] py-6 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="font-extrabold text-2xl sm:text-3xl text-[#CFFE06] tracking-tight">
              150+ Kampus
            </div>
            <div className="text-xs font-medium text-[#9C9C9C] mt-1">Jaringan Ormawa Indonesia</div>
          </div>
          <div>
            <div className="font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
              35.000+
            </div>
            <div className="text-xs font-medium text-[#9C9C9C] mt-1">Tiket & QR Check-in</div>
          </div>
          <div>
            <div className="font-extrabold text-2xl sm:text-3xl text-[#CFFE06] tracking-tight">
              Rp 1,8 Miliar
            </div>
            <div className="text-xs font-medium text-[#9C9C9C] mt-1">Sponsorship & Anggaran Terkelola</div>
          </div>
          <div>
            <div className="font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
              100% Valid
            </div>
            <div className="text-xs font-medium text-[#9C9C9C] mt-1">Digital Certificate Anti-Pemalsuan</div>
          </div>
        </div>
      </section>

      {/* FEATURED EVENTS SECTION */}
      <section className="max-w-7xl mx-auto py-16 px-4 sm:px-6">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
          <div>
            <div className="inline-flex mb-2">
              <Badge variant="accent">
                AGENDA PILIHAN
              </Badge>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight m-0">
              Event Mahasiswa Terpopuler
            </h2>
            <p className="text-xs sm:text-sm text-[#9C9C9C] mt-1">
              Daftar sekarang sebelum kuota peserta dan tiket presale habis.
            </p>
          </div>

          <Link to="/events" className="no-underline">
            <Button variant="outline" size="sm" icon={<ArrowRight size={15} />} iconPosition="right">
              Lihat Semua Event ({featuredEvents.length})
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredEvents.slice(0, 3).map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>

      {/* CONVENA PILLARS */}
      <section className="bg-[#151515] border-y border-[#202020] py-18 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-[650px] mx-auto mb-12">
            <div className="inline-flex mb-2">
              <Badge variant="accent">
                INTEGRATED ECOSYSTEM
              </Badge>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight my-2">
              Solusi Terpadu untuk Kebutuhan Ormawa Kampus
            </h2>
            <p className="text-xs sm:text-sm text-[#9C9C9C]">
              Bukan sekadar platform tiket biasa. Convena menyatukan seluruh siklus kepanitiaan mahasiswa dari publikasi hingga LPJ akhir.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pillar 1: Ticketing & QR */}
            <div className="p-6 bg-[#202020] border border-[#3D3D3D]/50 rounded-xl hover:border-[#CFFE06]/40 transition-colors">
              <div className="w-10 h-10 rounded-full bg-[#151515] border border-[#3D3D3D] text-[#CFFE06] flex items-center justify-center mb-4">
                <Users size={20} />
              </div>
              <h4 className="text-sm font-bold text-white mb-2">01. Tiket & Presensi QR</h4>
              <p className="text-xs text-[#9C9C9C] m-0 leading-relaxed">
                Peserta mendapatkan e-tiket dengan kode QR unik. Panitia dapat memindai kehadiran secara cepat di pintu masuk hari-H.
              </p>
            </div>

            {/* Pillar 2: Sponsorship CRM */}
            <div className="p-6 bg-[#202020] border border-[#3D3D3D]/50 rounded-xl hover:border-[#CFFE06]/40 transition-colors">
              <div className="w-10 h-10 rounded-full bg-[#151515] border border-[#3D3D3D] text-[#CFFE06] flex items-center justify-center mb-4">
                <Trophy size={20} />
              </div>
              <h4 className="text-sm font-bold text-white mb-2">02. Sponsorship Pipeline</h4>
              <p className="text-xs text-[#9C9C9C] m-0 leading-relaxed">
                Pantau proses pitching mitra dan proposal sponsor dalam format visual pipeline Kanban terintegrasi.
              </p>
            </div>

            {/* Pillar 3: Budgeting & SPJ */}
            <div className="p-6 bg-[#202020] border border-[#3D3D3D]/50 rounded-xl hover:border-[#CFFE06]/40 transition-colors">
              <div className="w-10 h-10 rounded-full bg-[#151515] border border-[#3D3D3D] text-[#CFFE06] flex items-center justify-center mb-4">
                <DollarSign size={20} />
              </div>
              <h4 className="text-sm font-bold text-white mb-2">03. Anggaran & Kuitansi SPJ</h4>
              <p className="text-xs text-[#9C9C9C] m-0 leading-relaxed">
                Pencatatan pengeluaran divisi dengan unggah bukti kuitansi yang siap dikompilasi ke laporan pertanggungjawaban.
              </p>
            </div>

            {/* Pillar 4: Verifiable E-Certificate */}
            <div className="p-6 bg-[#202020] border border-[#3D3D3D]/50 rounded-xl hover:border-[#CFFE06]/40 transition-colors">
              <div className="w-10 h-10 rounded-full bg-[#151515] border border-[#3D3D3D] text-[#CFFE06] flex items-center justify-center mb-4">
                <ShieldCheck size={20} />
              </div>
              <h4 className="text-sm font-bold text-white mb-2">04. E-Sertifikat Tervalidasi</h4>
              <p className="text-xs text-[#9C9C9C] m-0 leading-relaxed">
                Sertifikat digital dengan ID unik yang dapat dicek keasliannya secara langsung oleh rekruter atau kampus.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION BANNER */}
      <section className="py-20 px-4 sm:px-6 max-w-5xl mx-auto text-center">
        <div className="p-8 sm:p-12 bg-[#151515] border border-[#3D3D3D]/60 rounded-2xl relative overflow-hidden">
          <div
            className="pointer-events-none absolute -bottom-20 left-1/2 -translate-x-1/2 w-[500px] h-[200px] opacity-35 blur-[80px]"
            style={{
              background: 'radial-gradient(ellipse, #CFFE06 0%, #DF00D0 50%, transparent 80%)',
            }}
          />

          <div className="inline-flex mb-3 relative z-10">
            <Badge variant="accent">
              MULAI SEKARANG
            </Badge>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-3 tracking-tight relative z-10">
            Kelola Kegiatan Kampus Tanpa Kekacauan Dokumen
          </h2>
          <p className="max-w-[550px] mx-auto mb-8 text-[#9C9C9C] text-xs sm:text-sm relative z-10">
            Bergabung bersama ribuan mahasiswa dan organisasi kampus yang telah mengandalkan Convena.
          </p>

          <div className="flex gap-3 justify-center flex-wrap relative z-10">
            <Link to="/events" className="no-underline">
              <Button variant="accent" size="lg" icon={<CheckCircle2 size={18} />}>
                Jelajahi Event
              </Button>
            </Link>
            <Link to="/verify" className="no-underline">
              <Button variant="outline" size="lg" icon={<FileText size={18} />}>
                Cek Sertifikat
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
