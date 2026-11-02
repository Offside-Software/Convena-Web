import React, { useEffect, useRef, useState } from 'react'
import type { Html5Qrcode } from 'html5-qrcode'
import { Camera, MapPin, QrCode } from 'lucide-react'
import { Badge } from '../../components/common/Badge.tsx'
import { eventsService } from '../../services/events.service.ts'
import { operationsService } from '../../services/operations.service.ts'
import type { Event } from '../../types/event.ts'
import type { CheckInResult } from '../../types/operations.ts'

function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) return String(error.message)
  return 'Terjadi kesalahan saat check-in.'
}

interface QrCameraProps {
  onDecode: (value: string) => void
  onError: (message: string) => void
}

const QrCamera: React.FC<QrCameraProps> = ({ onDecode, onError }) => {
  const readerId = 'convena-qr-reader'
  const decodeHandler = useRef(onDecode)
  const errorHandler = useRef(onError)

  useEffect(() => {
    decodeHandler.current = onDecode
    errorHandler.current = onError
  }, [onDecode, onError])

  useEffect(() => {
    let active = true
    let scanner: Html5Qrcode | undefined
    void import('html5-qrcode').then(({ Html5Qrcode: QrScanner }) => {
      if (!active) return
      scanner = new QrScanner(readerId)
      return scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 }, aspectRatio: 1 },
        (decodedText) => decodeHandler.current(decodedText),
        () => undefined,
      )
    }).then(() => {
      const currentScanner = scanner
      if (!active && currentScanner?.isScanning) {
        return currentScanner.stop().then(() => currentScanner.clear())
      }
    }).catch((cause: unknown) => {
      if (active) errorHandler.current(getErrorMessage(cause))
    })

    return () => {
      active = false
      const currentScanner = scanner
      if (currentScanner?.isScanning) {
        void currentScanner.stop().then(() => currentScanner.clear()).catch((cause: unknown) => {
          console.error('Gagal menghentikan scanner QR:', cause)
        })
      } else if (currentScanner) {
        currentScanner.clear()
      }
    }
  }, [])

  return <div id={readerId} className="overflow-hidden rounded-xl [&_button]:rounded-full [&_button]:border [&_button]:border-[#3D3D3D] [&_button]:bg-[#202020] [&_button]:px-3 [&_button]:py-2 [&_button]:text-xs [&_button]:text-white [&_select]:rounded-lg [&_select]:bg-[#202020] [&_select]:p-2 [&_select]:text-white" />
}

function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Browser ini tidak mendukung akses lokasi GPS.'))
      return
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    })
  })
}

export const CheckInPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEventId, setSelectedEventId] = useState('')
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [cameraEnabled, setCameraEnabled] = useState(false)
  const [manualCode, setManualCode] = useState('')
  const [checkingIn, setCheckingIn] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<CheckInResult | null>(null)

  useEffect(() => {
    let active = true
    eventsService.getMyEvents()
      .then((myEvents) => {
        if (active) {
          setEvents(myEvents)
          setSelectedEventId(myEvents[0]?.id || '')
        }
      })
      .catch((cause: unknown) => { if (active) setError(getErrorMessage(cause)) })
      .finally(() => { if (active) setLoadingEvents(false) })
    return () => { active = false }
  }, [])

  const handleCheckIn = async (qrCode: string) => {
    const code = qrCode.trim()
    if (!selectedEventId || !code || checkingIn) return
    setCheckingIn(true)
    setError('')
    setResult(null)
    try {
      const position = await getCurrentPosition()
      const checkInResult = await operationsService.checkIn(selectedEventId, {
        qrCode: code,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      })
      setResult(checkInResult)
      setManualCode('')
    } catch (cause: unknown) {
      setError(getErrorMessage(cause))
    } finally {
      setCheckingIn(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl font-['Montserrat',sans-serif] text-white">
      <header className="mb-7">
        <Badge variant="accent">PRESENSI ACARA</Badge>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">QR Check-in</h1>
        <p className="mt-1 text-sm text-[#9C9C9C]">Pindai e-tiket peserta. Lokasi GPS akan dicatat bersama setiap check-in.</p>
      </header>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(300px,0.7fr)]">
        <div className="rounded-xl border border-[#262626] bg-[#151515] p-4 sm:p-6">
          <label className="mb-4 block text-xs font-semibold text-[#9C9C9C]">Pilih acara
            <select
              value={selectedEventId}
              onChange={(event) => {
                setCameraEnabled(false)
                setResult(null)
                setError('')
                setSelectedEventId(event.target.value)
              }}
              disabled={loadingEvents}
              className="mt-2 w-full rounded-lg border border-[#3D3D3D] bg-[#0A0A0A] px-3 py-3 text-sm text-white outline-none focus:border-[#CFFE06]"
            >
              <option value="">Pilih acara yang dikelola</option>
              {events.map((event) => <option key={event.id} value={event.id}>{event.title}</option>)}
            </select>
          </label>

          {cameraEnabled && selectedEventId ? (
            <div className="rounded-xl bg-black p-3">
              <QrCamera
                onDecode={(code) => { void handleCheckIn(code) }}
                onError={(message) => setError(`Kamera tidak dapat dibuka: ${message}`)}
              />
            </div>
          ) : (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-[#3D3D3D] bg-[#0A0A0A] p-6 text-center">
              <Camera size={35} className="mb-3 text-[#CFFE06]" />
              <p className="mb-4 text-sm text-[#9C9C9C]">Gunakan kamera belakang perangkat untuk memindai QR tiket.</p>
              <button
                type="button"
                disabled={!selectedEventId}
                onClick={() => { setError(''); setCameraEnabled(true) }}
                className="rounded-full bg-[#CFFE06] px-5 py-3 text-xs font-bold text-black disabled:cursor-not-allowed disabled:opacity-40"
              >
                Aktifkan Kamera
              </button>
            </div>
          )}

          <div className="mt-4 border-t border-[#262626] pt-4">
            <label className="block text-xs font-semibold text-[#9C9C9C]">Atau masukkan kode tiket secara manual
              <div className="mt-2 flex gap-2">
                <input
                  value={manualCode}
                  onChange={(event) => setManualCode(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      void handleCheckIn(manualCode)
                    }
                  }}
                  placeholder="Kode dari QR tiket"
                  className="min-w-0 flex-1 rounded-lg border border-[#3D3D3D] bg-[#0A0A0A] px-3 py-3 text-xs text-white outline-none placeholder:text-[#777] focus:border-[#CFFE06]"
                />
                <button
                  type="button"
                  disabled={!selectedEventId || checkingIn || !manualCode.trim()}
                  onClick={() => { void handleCheckIn(manualCode) }}
                  className="rounded-lg bg-[#CFFE06] px-4 text-xs font-bold text-black disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {checkingIn ? 'Memeriksa...' : 'Check-in'}
                </button>
              </div>
            </label>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-[#262626] bg-[#151515] p-5">
            <h2 className="m-0 flex items-center gap-2 text-sm font-bold"><MapPin size={16} className="text-[#CFFE06]" /> Check-in dengan GPS</h2>
            <p className="mb-0 mt-3 text-xs leading-relaxed text-[#9C9C9C]">
              Browser akan meminta izin lokasi setelah QR dipindai. Check-in dikirim dengan koordinat dan akurasi GPS; pastikan izin lokasi aktif.
            </p>
          </div>
          {checkingIn && (
            <div role="status" className="rounded-xl border border-[#3D3D3D] bg-[#151515] p-4 text-xs text-[#CFFE06]">
              Memverifikasi tiket dan mendapatkan lokasi GPS...
            </div>
          )}
          {error && (
            <div role="alert" className="rounded-xl border border-red-900 bg-red-950/40 p-4 text-xs leading-relaxed text-red-300">
              {error}
            </div>
          )}
          {result && (
            <div role="status" className="rounded-xl border border-[#CFFE06]/40 bg-[#CFFE06]/10 p-5">
              <div className="flex items-center gap-2 text-sm font-bold text-[#CFFE06]"><QrCode size={17} /> Check-in berhasil</div>
              <div className="mt-4 text-sm font-bold text-white">{result.attendeeName}</div>
              <div className="mt-1 text-xs text-[#9C9C9C]">ID registrasi: {result.registrationId}</div>
              <div className="mt-2 text-xs text-[#9C9C9C]">
                {new Date(result.checkedInAt).toLocaleString('id-ID')}
              </div>
            </div>
          )}
        </aside>
      </section>
    </div>
  )
}
