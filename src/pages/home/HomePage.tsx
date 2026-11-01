import React, { useEffect, useState, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Calendar,
  CheckCircle2,
  DollarSign,
  FileText,
  ShieldCheck,
  Trophy,
  Users,
  ArrowRight,
  WifiOff,
  RefreshCw,
} from 'lucide-react'
import { Button } from '../../components/common/Button.tsx'
import { Badge } from '../../components/common/Badge.tsx'
import { Toast } from '../../components/common/Toast.tsx'
import { EventCard } from '../../components/domain/EventCard.tsx'
import { eventsService } from '../../services/events.service.ts'
import type { Event } from '../../types/event.ts'

export const HomePage: React.FC = () => {
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toastOpen, setToastOpen] = useState(false)
  const isMountedRef = useRef(true)

  const loadFeaturedEvents = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const events = await eventsService.getEvents()
      if (!isMountedRef.current) return
      setFeaturedEvents(events)
      setToastOpen(false)
    } catch (err: unknown) {
      if (!isMountedRef.current) return
      const message =
        err && typeof err === 'object' && 'message' in err && typeof (err as any).message === 'string'
          ? (err as any).message
          : 'Tidak dapat terhubung ke server API. Pastikan server aktif.'
      setError(message)
      setToastOpen(true)
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    isMountedRef.current = true
    let active = true

    eventsService
      .getEvents()
      .then((events) => {
        if (!active) return
        setFeaturedEvents(events)
        setToastOpen(false)
        setError(null)
      })
      .catch((err: unknown) => {
        if (!active) return
        const message =
          err && typeof err === 'object' && 'message' in err && typeof (err as any).message === 'string'
            ? (err as any).message
            : 'Tidak dapat terhubung ke server API. Pastikan server aktif.'
        setError(message)
        setToastOpen(true)
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })

    return () => {
      active = false
      isMountedRef.current = false
    }
  }, [])

  return (
    <div className="relative overflow-hidden bg-[#000000] text-white font-['Montserrat',sans-serif]">
      {/* ERROR TOAST NOTIFICATION */}
      <Toast
        open={toastOpen}
        onClose={() => setToastOpen(false)}
        type="error"
        title="Gagal Memuat Event"
        message={error || 'Tidak dapat terhubung ke server API.'}
        action={{
          label: 'Coba Lagi',
          onClick: loadFeaturedEvents,
          loading: loading,
          icon: <RefreshCw size={12} />,
        }}
        autoCloseMs={7000}
        position="bottom-right"
      />

      {/* HERO SECTION */}
      <section className="py-24 px-4 sm:px-6 relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] opacity-40 blur-[100px]"
          style={{
            background: 'radial-gradient(ellipse at top, #CFFE06 0%, #DF00D0 40%, transparent 75%)',
          }}
        />

        <div className="max-w-[1080px] mx-auto text-center relative z-10">
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

          {!loading && !error && (
            <Link to="/events" className="no-underline">
              <Button variant="outline" size="sm" icon={<ArrowRight size={15} />} iconPosition="right">
                Lihat Semua Event ({featuredEvents.length})
              </Button>
            </Link>
          )}
        </div>

        {/* LOADING SKELETON STATE */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-[#151515] border border-[#202020] rounded-2xl overflow-hidden p-4 animate-pulse flex flex-col gap-4"
              >
                <div className="w-full h-44 bg-[#202020] rounded-xl" />
                <div className="h-4 bg-[#202020] rounded w-1/3" />
                <div className="h-6 bg-[#202020] rounded w-3/4" />
                <div className="h-4 bg-[#202020] rounded w-full" />
                <div className="mt-4 pt-4 border-t border-[#202020] flex justify-between">
                  <div className="h-4 bg-[#202020] rounded w-1/4" />
                  <div className="h-4 bg-[#202020] rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ERROR STATE WITH TRY AGAIN BUTTON */}
        {!loading && error && (
          <div className="bg-[#151515] border border-[#DF00D0]/40 rounded-2xl p-8 sm:p-12 text-center max-w-xl mx-auto">
            <div className="w-14 h-14 rounded-full bg-[#DF00D0]/10 border border-[#DF00D0]/30 text-[#DF00D0] flex items-center justify-center mx-auto mb-4">
              <WifiOff size={28} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Koneksi ke Server Terputus
            </h3>
            <p className="text-sm text-[#9C9C9C] mb-6 leading-relaxed max-w-md mx-auto">
              {error}
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="accent"
                size="md"
                icon={<RefreshCw size={16} />}
                onClick={loadFeaturedEvents}
              >
                Coba Lagi
              </Button>
            </div>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && featuredEvents.length === 0 && (
          <div className="bg-[#151515] border border-[#3D3D3D] rounded-2xl p-10 text-center max-w-md mx-auto">
            <Calendar size={32} className="text-[#9C9C9C] mx-auto mb-3" />
            <p className="text-sm text-[#9C9C9C] m-0">Belum ada event tersedia saat ini.</p>
          </div>
        )}

        {/* EVENT CARDS */}
        {!loading && !error && featuredEvents.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEvents.slice(0, 3).map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
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
