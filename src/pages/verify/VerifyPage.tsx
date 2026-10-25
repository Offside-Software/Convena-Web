import React, { useState, useEffect } from 'react'
import { ShieldCheck, Search, CheckCircle2, QrCode, XCircle } from 'lucide-react'
import { Button } from '../../components/common/Button.tsx'
import { Badge } from '../../components/common/Badge.tsx'
import { Input } from '../../components/common/Input.tsx'
import { MemphisShape } from '../../components/shapes/MemphisShape.tsx'
import { certificateService } from '../../services/certificate.service.ts'
import type { Certificate } from '../../types/certificate.ts'

export const VerifyPage: React.FC = () => {
  const [code, setCode] = useState('CNV-2026-ITB-8821')
  const [certificate, setCertificate] = useState<Certificate | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [loading, setLoading] = useState(false)

  const performVerification = (certCode: string) => {
    if (!certCode.trim()) return
    setLoading(true)
    setHasSearched(true)
    certificateService.verifyCertificate(certCode).then((result) => {
      setCertificate(result)
      setLoading(false)
    })
  }

  useEffect(() => {
    let isMounted = true
    certificateService.verifyCertificate(code).then((result) => {
      if (isMounted) {
        setCertificate(result)
        setHasSearched(true)
      }
    })
    return () => {
      isMounted = false
    }
  }, [code])

  const handleVerify = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    performVerification(code)
  }

  const handleQuickFill = (sampleCode: string) => {
    setCode(sampleCode)
    performVerification(sampleCode)
  }

  return (
    <div className="max-w-[1080px] mx-auto py-12 px-4 sm:px-6 pb-20">
      {/* Title Header */}
      <div className="text-center mb-10">
        <div className="inline-flex mb-3">
          <Badge variant="cyan" tilt="left" icon={<ShieldCheck size={16} />}>
            PORTAL OTENTIKASI RESMI
          </Badge>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-['Space_Grotesk',sans-serif] font-black text-[#121215] mb-2">
          Verifikasi Keaslian E-Sertifikat
        </h1>
        <p className="text-gray-500 max-w-[640px] mx-auto text-sm sm:text-base leading-relaxed">
          Validasi keabsahan dokumen penghargaan, kepanitiaan, atau kehadiran peserta acara mahasiswa melalui basis data Convena.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="max-w-[680px] mx-auto mb-10 p-5 border-2 border-[#121215] rounded-2xl shadow-[6px_6px_0px_0px_#121215]">
        <form onSubmit={handleVerify} className="flex gap-2 flex-wrap">
          <div className="grow basis-[300px] ">
            <Input
              placeholder="Masukkan ID Sertifikat (Contoh: CNV-2026-ITB-8821)"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              icon={<Search size={18} />}
              className="!mb-0"
              required
            />
          </div>
          <Button variant="pink" size="md" type="submit" disabled={loading}>
            {loading ? 'Memvalidasi...' : 'Verifikasi Sekarang'}
          </Button>
        </form>

        {/* Quick sample fillers */}
        <div className="flex items-center gap-2 mt-3.5 flex-wrap text-xs">
          <span className="font-bold text-gray-500">Contoh Cepat:</span>
          <button
            type="button"
            onClick={() => handleQuickFill('CNV-2026-ITB-8821')}
            className="font-mono py-0.5 px-2 rounded border border-[#121215] bg-[#FFE600] cursor-pointer font-bold hover:brightness-105"
          >
            CNV-2026-ITB-8821 (ITB)
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill('CNV-2026-UI-1042')}
            className="font-mono py-0.5 px-2 rounded border border-[#121215] bg-[#01CDFE] cursor-pointer font-bold hover:brightness-105"
          >
            CNV-2026-UI-1042 (UI)
          </button>
        </div>
      </div>

      {/* Result Display */}
      {hasSearched && (
        <div>
          {certificate ? (
            <div className="bg-white border-4 border-[#121215] rounded-2xl shadow-[10px_10px_0px_0px_#121215] overflow-hidden relative">
              {/* Memphis Top Certificate Ribbon */}
              <div className="bg-[#FFE600] border-b-2 border-[#121215] py-3 px-6 flex items-center justify-between flex-wrap gap-2 text-[#121215]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={20} className="text-[#008775] fill-[#00F5D4]" />
                  <span className="font-['Space_Grotesk',sans-serif] font-black text-sm uppercase tracking-wider">
                    SERTIFIKAT RESMI TERVERIFIKASI
                  </span>
                </div>
                <div className="font-mono font-bold text-xs sm:text-sm">
                  ID: {certificate.certificateNumber}
                </div>
              </div>

              {/* Certificate Inner Canvas */}
              <div className="py-12 px-6 sm:px-10 text-center relative bg-[radial-gradient(#FFF585_1.5px,transparent_1.5px)] [background-size:20px_20px]">
                <div className="absolute top-5 left-5 pointer-events-none hidden sm:block">
                  <MemphisShape type="cross" size={28} color="#FF4B91" />
                </div>
                <div className="absolute top-5 right-5 pointer-events-none hidden sm:block">
                  <MemphisShape type="starburst" size={32} color="#01CDFE" />
                </div>

                {/* Institution Heading */}
                <div className="text-sm font-['Space_Grotesk',sans-serif] font-bold text-gray-500 uppercase tracking-widest mb-2">
                  {certificate.organizationName} • {certificate.university}
                </div>

                <div className="font-['Space_Grotesk',sans-serif] font-black text-3xl sm:text-4xl text-[#121215] mb-4">
                  SERTIFIKAT PENGHARGAAN
                </div>

                <p className="text-sm sm:text-base text-gray-600 mb-5">
                  Diberikan dengan bangga kepada:
                </p>

                {/* Recipient Name Box */}
                <div className="inline-block py-3 px-8 sm:px-10 bg-[#FFE600] border-2 border-[#121215] shadow-[4px_4px_0px_0px_#121215] rounded-xl font-['Space_Grotesk',sans-serif] font-black text-2xl sm:text-3xl text-[#121215] mb-5">
                  {certificate.recipientName}
                </div>

                {certificate.studentId && (
                  <div className="text-xs font-mono font-bold text-gray-500 mb-6">
                    NIM: {certificate.studentId}
                  </div>
                )}

                <p className="text-base sm:text-lg max-w-[640px] mx-auto mb-10 leading-relaxed text-gray-700">
                  Atas partisipasi dan kontribusi aktifnya sebagai <strong>{certificate.role.toUpperCase()}</strong> dalam kegiatan{' '}
                  <strong>{certificate.eventTitle}</strong> yang diselenggarakan pada tanggal {certificate.issueDate}.
                </p>

                {/* Signatories Row & QR Watermark */}
                <div className="flex items-center justify-around flex-wrap gap-8 border-t-2 border-dashed border-[#121215] pt-8">
                  {certificate.signatories.map((sig, idx) => (
                    <div key={idx} className="text-center min-w-[180px]">
                      <div className="h-10 flex items-center justify-center font-mono text-xs text-gray-500 mb-1">
                        [Signed Digitally with Key]
                      </div>
                      <div className="font-black text-sm text-[#121215] border-t-2 border-[#121215] pt-1">
                        {sig.name}
                      </div>
                      <div className="text-xs text-gray-500">{sig.title}</div>
                    </div>
                  ))}

                  <div className="text-center">
                    <div className="p-1.5 bg-white border-2 border-[#121215] rounded-lg inline-block shadow-[2px_2px_0px_0px_#121215]">
                      <QrCode size={64} />
                    </div>
                    <div className="text-[11px] font-bold mt-1 text-gray-600">Otentikasi Convena</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-[680px] mx-auto py-12 px-8 bg-white border-2 border-[#121215] rounded-2xl shadow-[6px_6px_0px_0px_#121215] text-center">
              <XCircle size={48} className="text-[#FF4B91] mx-auto mb-4" />
              <h3 className="text-xl font-['Space_Grotesk',sans-serif] font-black text-[#121215] mb-2">
                Sertifikat Tidak Ditemukan
              </h3>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                Kode <strong>"{code}"</strong> tidak terdaftar dalam catatan sertifikat resmi ormawa Convena. Mohon periksa kembali ejaan kode Anda.
              </p>
              <Button variant="yellow" onClick={() => handleQuickFill('CNV-2026-ITB-8821')}>
                Coba Contoh Valid (ITB)
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
