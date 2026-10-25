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
    <div className="relative overflow-hidden">
      {/* HERO SECTION */}
      <section className="memphis-pattern-dots border-b-4 border-[#121215] py-16 px-6 sm:py-20 relative">
        {/* Floating Decorative Memphis Shapes */}
        <div className="absolute top-[25px] left-[5%]">
          <MemphisShape type="zigzag" size={80} color="#FF4B91" animate="slow" />
        </div>
        <div className="absolute top-[40px] right-[6%]">
          <MemphisShape type="starburst" size={60} color="#FFE600" animate="fast" />
        </div>
        <div className="absolute bottom-[30px] left-[8%]">
          <MemphisShape type="cross" size={40} color="#01CDFE" />
        </div>
        <div className="absolute bottom-[25px] right-[10%]">
          <MemphisShape type="arch" size={60} color="#845EC2" animate="slow" />
        </div>

        <div className="max-w-[1080px] mx-auto text-center relative z-2">
          <div className="inline-flex mb-5">
            <Badge variant="yellow" tilt="left" icon={<Sparkles size={14} />}>
              #1 PLATFORM ORMAWA INDONESIA
            </Badge>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] font-['Space_Grotesk',sans-serif] font-black leading-[1.1] mb-5 text-[#121215]">
            Kelola Acara Kampus & Ormawa{' '}
            <span className="bg-[#FFE600] border-2 border-[#121215] px-2 shadow-[4px_4px_0px_0px_#121215] inline-block -rotate-1">
              Tanpa Ribet
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-gray-700 max-w-[750px] mx-auto mb-8 font-medium leading-relaxed">
            Dari registrasi tiket ber-QR, pelacakan proposal sponsorship CRM, transparansi anggaran & kuitansi SPJ,
            hingga penerbitan sertifikat tervalidasi publik.
          </p>

          {/* Hero Action Buttons */}
          <div className="flex gap-4 justify-center flex-wrap mb-10">
            <Link to="/events" className="no-underline">
              <Button variant="pink" size="lg" icon={<Calendar size={20} />}>
                Jelajahi Event Kampus
              </Button>
            </Link>
            <Link to="/dashboard" className="no-underline">
              <Button variant="cyan" size="lg" icon={<ArrowRight size={20} />}>
                Buka Dashboard Panitia
              </Button>
            </Link>
          </div>

          {/* Quick Search Box in Memphis Style */}
          <div className="memphis-box max-w-[680px] mx-auto p-2.5 bg-white border-2 border-[#121215] shadow-[6px_6px_0px_0px_#121215] rounded-xl flex gap-2 items-center">
            <Search size={22} className="ml-2 text-gray-500 shrink-0" />
            <input
              type="text"
              placeholder="Cari hackathon, seminar BEM, workshop AI, kampus (ITB, UI)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="!border-none !shadow-none p-2 text-base flex-1 outline-hidden bg-transparent focus:ring-0"
            />
            <Link to={`/events?search=${encodeURIComponent(searchQuery)}`} className="no-underline">
              <Button variant="yellow" size="md">
                Cari
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* STATS TICKER STRIP */}
      <section className="bg-[#121215] border-b-4 border-[#121215] py-5 px-4 text-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="font-['Space_Grotesk',sans-serif] font-black text-3xl text-[#FFE600]">
              150+ Kampus
            </div>
            <div className="text-sm font-semibold text-gray-400">Seluruh Indonesia</div>
          </div>
          <div>
            <div className="font-['Space_Grotesk',sans-serif] font-black text-3xl text-[#01CDFE]">
              35.000+ Peserta
            </div>
            <div className="text-sm font-semibold text-gray-400">Tiket & QR Check-in</div>
          </div>
          <div>
            <div className="font-['Space_Grotesk',sans-serif] font-black text-3xl text-[#FF4B91]">
              Rp 1,8 Miliar
            </div>
            <div className="text-sm font-semibold text-gray-400">Sponsorship & Tiket Terkelola</div>
          </div>
          <div>
            <div className="font-['Space_Grotesk',sans-serif] font-black text-3xl text-[#00F5D4]">
              100% Valid
            </div>
            <div className="text-sm font-semibold text-gray-400">E-Certificate Anti-Pemalsuan</div>
          </div>
        </div>
      </section>

      {/* FEATURED EVENTS SECTION */}
      <section className="max-w-7xl mx-auto py-16 px-6">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <div className="inline-flex mb-2">
              <Badge variant="cyan" tilt="left">
                AGENDA PILIHAN
              </Badge>
            </div>
            <h2 className="text-3xl sm:text-4xl font-['Space_Grotesk',sans-serif] font-black text-[#121215] mb-2">
              Event Mahasiswa Terpopuler
            </h2>
            <p className="text-gray-500 m-0">
              Daftar sekarang sebelum kuota peserta dan tiket presale habis!
            </p>
          </div>

          <Link to="/events" className="no-underline">
            <Button variant="yellow" size="md">
              Lihat Semua Event ({featuredEvents.length}) →
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {featuredEvents.slice(0, 3).map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>

      {/* CONVENA FEATURES - MEMPHIS PILLARS */}
      <section className="bg-white border-t-4 border-b-4 border-[#121215] py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-[700px] mx-auto mb-14">
            <div className="inline-flex mb-2">
              <Badge variant="pink" tilt="right">
                ALL-IN-ONE SOLUTION
              </Badge>
            </div>
            <h2 className="text-3xl sm:text-4xl font-['Space_Grotesk',sans-serif] font-black text-[#121215] my-3">
              Dirancang Khusus untuk Kebutuhan Ormawa Kampus
            </h2>
            <p className="text-gray-500">
              Bukan sekadar platform tiket biasa. Convena mengintegrasikan seluruh siklus kerja panitia mahasiswa dari
              awal pembentukan hingga LPJ akhir.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
            {/* Pillar 1: Ticketing & QR */}
            <Card headerColor="yellow" headerTitle="01. Tiket & Presensi QR">
              <div className="flex gap-3 mb-3 items-center">
                <Users size={32} className="text-[#121215] shrink-0" />
                <h4 className="text-lg font-['Space_Grotesk',sans-serif] font-bold text-[#121215] m-0">Pendaftaran & Scan QR Cepat</h4>
              </div>
              <p className="text-sm text-gray-600 m-0 leading-relaxed">
                Peserta mendapatkan e-tiket ber-QR anti duplikasi. Panitia tinggal memindai saat hari-H di pintu masuk
                dalam hitungan detik.
              </p>
            </Card>

            {/* Pillar 2: Sponsorship CRM */}
            <Card headerColor="pink" headerTitle="02. Sponsorship CRM">
              <div className="flex gap-3 mb-3 items-center">
                <Trophy size={32} className="text-[#FF4B91] shrink-0" />
                <h4 className="text-lg font-['Space_Grotesk',sans-serif] font-bold text-[#121215] m-0">Pipeline Mitra & Draf AI</h4>
              </div>
              <p className="text-sm text-gray-600 m-0 leading-relaxed">
                Pantau progres penawaran sponsor (prospek, negosiasi, transfer), plus bantuan draf surat penawaran
                formal berbahasa Indonesia dengan AI.
              </p>
            </Card>

            {/* Pillar 3: Budgeting & SPJ */}
            <Card headerColor="cyan" headerTitle="03. Anggaran & Kuitansi SPJ">
              <div className="flex gap-3 mb-3 items-center">
                <DollarSign size={32} className="text-[#01CDFE] shrink-0" />
                <h4 className="text-lg font-['Space_Grotesk',sans-serif] font-bold text-[#121215] m-0">Audit Keuangan Transparan</h4>
              </div>
              <p className="text-sm text-gray-600 m-0 leading-relaxed">
                Catat pengeluaran tiap divisi beserta unggah bukti kuitansi. Bendahara dapat menyetujui kuitansi dan
                langsung mengekspor draf LPJ.
              </p>
            </Card>

            {/* Pillar 4: Verifiable E-Certificate */}
            <Card headerColor="purple" headerTitle="04. E-Sertifikat Tervalidasi">
              <div className="flex gap-3 mb-3 items-center">
                <ShieldCheck size={32} className="text-[#845EC2] shrink-0" />
                <h4 className="text-lg font-['Space_Grotesk',sans-serif] font-bold text-[#121215] m-0">Verifikasi Publik Otentik</h4>
              </div>
              <p className="text-sm text-gray-600 m-0 leading-relaxed">
                Sertifikat dilengkapi nomor seri unik dan tautan verifikasi publik, memudahkan peserta membuktikan
                keaslian untuk portofolio dan beasiswa.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION BANNER */}
      <section className="py-18 px-6 max-w-7xl mx-auto">
        <div className="memphis-box memphis-pattern-dots-colored p-8 sm:p-12 text-center bg-white relative overflow-hidden rounded-2xl border-4 border-[#121215] shadow-[8px_8px_0px_0px_#121215]">
          <div className="absolute top-4 left-5">
            <MemphisShape type="squiggle" size={70} color="#FF4B91" />
          </div>
          <div className="absolute bottom-4 right-5">
            <MemphisShape type="triangle" size={50} color="#01CDFE" />
          </div>

          <div className="inline-flex mb-4">
            <Badge variant="mint" tilt="left">
              MULAI SEKARANG
            </Badge>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-['Space_Grotesk',sans-serif] font-black text-[#121215] mb-4">
            Waktunya Mengelola Event Tanpa Kekacauan Dokumen
          </h2>
          <p className="max-w-[600px] mx-auto mb-8 text-gray-600 text-base sm:text-lg">
            Gabung bersama BEM, Himpunan Mahasiswa, dan Unit Kegiatan Mahasiswa yang telah menggunakan Convena.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/events" className="no-underline">
              <Button variant="yellow" size="lg" icon={<CheckCircle2 size={20} />}>
                Daftar Event Pertama Anda
              </Button>
            </Link>
            <Link to="/verify" className="no-underline">
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
