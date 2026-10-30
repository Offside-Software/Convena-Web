import React, { useState, useEffect } from 'react'
import { CheckCircle2, QrCode, XCircle } from 'lucide-react'
import { Button } from '../../components/common/Button.tsx'
import { SearchBar } from '../../components/common/SearchBar.tsx'
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
    <div className="max-w-[1080px] mx-auto py-12 px-4 sm:px-6 pb-24 font-['Montserrat',sans-serif] bg-[#000000] text-white">
      {/* Title Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
          Verifikasi Keaslian E-Sertifikat
        </h1>
        <p className="text-[#9C9C9C] max-w-[620px] mx-auto text-xs sm:text-sm leading-relaxed">
          Validasi keabsahan dokumen penghargaan, kepanitiaan, atau sertifikat peserta kegiatan mahasiswa melalui basis data Convena.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="max-w-[680px] mx-auto mb-10 p-5 bg-[#151515] border border-[#3D3D3D]/60 rounded-xl">
        <SearchBar
          placeholder="Masukkan ID Sertifikat (Contoh: CNV-2026-ITB-8821)"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onSubmit={handleVerify}
          showSubmitButton={true}
          submitLabel={loading ? 'Memvalidasi...' : 'Verifikasi'}
          submitLoading={loading}
          submitDisabled={loading}
          variant="grey"
          required
        />

        {/* Quick sample fillers */}
        <div className="flex items-center gap-2 mt-4 flex-wrap text-xs">
          <span className="text-[#9C9C9C]">Contoh Cepat:</span>
          <button
            type="button"
            onClick={() => handleQuickFill('CNV-2026-ITB-8821')}
            className="py-1 px-3 rounded-full border border-[#3D3D3D] bg-[#202020] text-[#CFFE06] cursor-pointer font-bold hover:border-[#CFFE06] transition-colors"
          >
            CNV-2026-ITB-8821 (ITB)
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill('CNV-2026-UI-1042')}
            className="py-1 px-3 rounded-full border border-[#3D3D3D] bg-[#202020] text-white cursor-pointer font-medium hover:border-[#CFFE06] transition-colors"
          >
            CNV-2026-UI-1042 (UI)
          </button>
        </div>
      </div>

      {/* Result Display */}
      {hasSearched && (
        <div>
          {certificate ? (
            <div className="bg-[#151515] border border-[#3D3D3D]/60 rounded-xl overflow-hidden shadow-2xl relative">
              {/* Top Certificate Ribbon */}
              <div className="bg-[#202020] border-b border-[#3D3D3D]/60 py-3.5 px-6 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-[#CFFE06]" />
                  <span className="font-bold text-xs uppercase tracking-wider text-[#CFFE06]">
                    SERTIFIKAT RESMI TERVERIFIKASI
                  </span>
                </div>
                <div className="font-mono text-xs text-[#9C9C9C]">
                  ID: {certificate.certificateNumber}
                </div>
              </div>

              {/* Certificate Inner Canvas */}
              <div className="py-12 px-6 sm:px-12 text-center relative bg-[#121212]">
                {/* Institution Heading */}
                <div className="text-xs font-semibold text-[#9C9C9C] uppercase tracking-widest mb-3">
                  {certificate.organizationName} • {certificate.company}
                </div>

                <div className="font-extrabold text-2xl sm:text-3xl text-white mb-4 tracking-tight">
                  SERTIFIKAT PENGHARGAAN
                </div>

                <p className="text-xs sm:text-sm text-[#9C9C9C] mb-4">
                  Diberikan dengan bangga kepada:
                </p>

                {/* Recipient Name Box */}
                <div className="inline-block py-3 px-8 bg-[#202020] border border-[#CFFE06] rounded-xl font-bold text-xl sm:text-2xl text-[#CFFE06] mb-4 shadow-[0_0_20px_rgba(207,254,6,0.15)]">
                  {certificate.recipientName}
                </div>

                {certificate.studentId && (
                  <div className="text-xs font-mono text-[#9C9C9C] mb-5">
                    NIM: {certificate.studentId}
                  </div>
                )}

                <p className="text-xs sm:text-sm max-w-[580px] mx-auto mb-10 leading-relaxed text-[#9C9C9C]">
                  Atas partisipasi dan kontribusi aktifnya sebagai <strong className="text-white">{certificate.role.toUpperCase()}</strong> dalam kegiatan{' '}
                  <strong className="text-white">{certificate.eventTitle}</strong> yang diselenggarakan pada tanggal {certificate.issueDate}.
                </p>

                {/* Signatories Row & QR Watermark */}
                <div className="flex items-center justify-around flex-wrap gap-8 border-t border-[#3D3D3D]/50 pt-8">
                  {certificate.signatories.map((sig, idx) => (
                    <div key={idx} className="text-center min-w-[160px]">
                      <div className="h-8 flex items-center justify-center font-mono text-[11px] text-[#CFFE06] mb-1">
                        ✓ Signed Digitally
                      </div>
                      <div className="font-bold text-xs text-white border-t border-[#3D3D3D] pt-1.5">
                        {sig.name}
                      </div>
                      <div className="text-[11px] text-[#9C9C9C] mt-0.5">{sig.title}</div>
                    </div>
                  ))}

                  <div className="text-center">
                    <div className="p-2 bg-[#000000] border border-[#3D3D3D] rounded-xl inline-block shadow-md">
                      <QrCode size={56} className="text-[#CFFE06]" />
                    </div>
                    <div className="text-[10px] font-semibold mt-1 text-[#9C9C9C]">Otentikasi Convena</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-[600px] mx-auto py-12 px-6 bg-[#151515] border border-[#3D3D3D]/60 rounded-xl text-center">
              <XCircle size={44} className="text-[#DF00D0] mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-2">
                Sertifikat Tidak Ditemukan
              </h3>
              <p className="text-xs text-[#9C9C9C] mb-6 leading-relaxed">
                Kode <strong>"{code}"</strong> tidak terdaftar dalam catatan sertifikat resmi ormawa Convena. Mohon periksa kembali ejaan kode Anda.
              </p>
              <Button variant="accent" onClick={() => handleQuickFill('CNV-2026-ITB-8821')}>
                Coba Contoh Valid (ITB)
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
