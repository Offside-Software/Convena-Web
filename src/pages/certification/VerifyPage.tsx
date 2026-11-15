import React, { useCallback, useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { CheckCircle2, Printer, QrCode, XCircle } from 'lucide-react'
import { Button } from '../../components/common/Button.tsx'
import { SearchBar } from '../../components/common/SearchBar.tsx'
import { certificateService } from '../../services/certificate.service.ts'
import type {
  Certificate,
  CertificateCategory,
  CertificateTemplateDesign,
} from '../../types/certificate.ts'
import { CertificateCanvas } from './components/CertificateCanvas.tsx'
import { getPresetTemplateByCategory } from './components/certificatePresets.ts'
import { printCertificateElement } from './components/certificateExport.ts'

function resolveCategoryFromCertificate(cert: Certificate): CertificateCategory {
  if (cert.category) return cert.category
  switch (cert.role) {
    case 'winner':
      return 'winner'
    case 'speaker':
      return 'speaker'
    case 'committee':
      return 'committee'
    case 'group':
      return 'group'
    default:
      return 'attendance'
  }
}

function buildTemplateFromVerifiedCertificate(
  cert: Certificate
): CertificateTemplateDesign {
  const category = resolveCategoryFromCertificate(cert)
  const base = cert.templateSnapshot || getPresetTemplateByCategory(category)

  return {
    ...base,
    signatories:
      Array.isArray(cert.signatories) && cert.signatories.length > 0
        ? cert.signatories.map((s, idx) => ({
            id: `verified-sig-${idx}`,
            name: s.name,
            title: s.title,
            idNumber: s.idNumber,
          }))
        : base.signatories,
  }
}

export const VerifyPage: React.FC = () => {
  const { code: routeCode } = useParams<{ code?: string }>()
  const [searchParams] = useSearchParams()
  const scannedSigner = searchParams.get('signer')
  const scannedRole = searchParams.get('role')

  const [code, setCode] = useState(routeCode || '')
  const [certificate, setCertificate] = useState<Certificate | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [loading, setLoading] = useState(false)

  const performVerification = useCallback(async (certCode: string) => {
    if (!certCode.trim()) return

    setLoading(true)
    setHasSearched(false)
    setCertificate(null)

    try {
      const result = await certificateService.verifyCertificate(certCode)
      setCertificate(result)
      setHasSearched(true)
    } catch (error) {
      console.error('Gagal memverifikasi sertifikat:', error)
      setCertificate(null)
      setHasSearched(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!routeCode || !routeCode.trim()) return
    let active = true
    certificateService
      .verifyCertificate(routeCode)
      .then((result) => {
        if (!active) return
        setCertificate(result)
        setHasSearched(true)
      })
      .catch(() => {
        if (!active) return
        setCertificate(null)
        setHasSearched(true)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [routeCode])

  const handleVerify = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    performVerification(code)
  }

  const handleQuickFill = (sampleCode: string) => {
    setCode(sampleCode)
    setCertificate(null)
    setHasSearched(false)
  }

  const resolvedTemplate = certificate
    ? buildTemplateFromVerifiedCertificate(certificate)
    : null

  return (
    <div className="max-w-[1080px] mx-auto py-4 px-4 sm:px-6 pb-24 font-['Montserrat',sans-serif] bg-[#000000] text-white">
      {/* Title Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
          Verifikasi Keaslian E-Sertifikat
        </h1>
        <p className="text-[#9C9C9C] max-w-[620px] mx-auto text-xs sm:text-sm leading-relaxed">
          Validasi keabsahan dokumen penghargaan, kejuaraan, kelompok/tim, kepanitiaan, atau sertifikat peserta kegiatan mahasiswa melalui basis data Convena.
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
      </div>

      {/* Scanned Signatory QR Banner (When arriving via a signatory QR code) */}
      {scannedSigner && (
        <div className="max-w-[680px] mx-auto mb-6 p-3.5 rounded-xl bg-[#CFFE06]/10 border border-[#CFFE06]/50 flex items-center gap-3">
          <QrCode size={20} className="text-[#CFFE06] shrink-0" />
          <div className="text-xs text-white">
            <strong className="text-[#CFFE06]">
              Pemindaian QR Tanda Tangan Pejabat:
            </strong>{' '}
            {scannedSigner} {scannedRole ? `(${scannedRole})` : ''}
          </div>
        </div>
      )}

      {/* Result Display */}
      {loading ? (
        <div className="bg-[#151515] border border-[#262626] rounded-xl overflow-hidden animate-pulse">
          <div className="bg-[#202020] border-b border-[#262626] py-3.5 px-6 flex items-center justify-between">
            <div className="h-4 w-56 bg-[#2c2c2c] rounded" />
            <div className="h-4 w-36 bg-[#262626] rounded" />
          </div>
          <div className="py-12 px-6 sm:px-12 text-center bg-[#121212] space-y-5 flex flex-col items-center">
            <div className="h-3.5 w-64 bg-[#242424] rounded" />
            <div className="h-8 w-80 bg-[#262626] rounded-lg" />
            <div className="h-3.5 w-44 bg-[#202020] rounded" />
            <div className="h-14 w-72 bg-[#202020] border border-[#2e2e2e] rounded-xl" />
            <div className="h-4 w-96 max-w-full bg-[#202020] rounded" />
            <div className="w-full flex items-center justify-around flex-wrap gap-8 border-t border-[#262626] pt-8 mt-4">
              <div className="space-y-2 w-40">
                <div className="h-4 w-28 bg-[#242424] rounded mx-auto" />
                <div className="h-4 w-36 bg-[#262626] rounded mx-auto" />
              </div>
              <div className="w-16 h-16 bg-[#202020] rounded-xl" />
            </div>
          </div>
        </div>
      ) : (
        hasSearched && (
          <div>
            {certificate && resolvedTemplate ? (
              <div className="space-y-4">
                {/* Verification Status Banner */}
                <div className="bg-[#151515] border border-[#CFFE06]/50 rounded-xl py-3 px-5 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-[#CFFE06]" />
                    <span className="font-bold text-xs uppercase tracking-wider text-[#CFFE06]">
                      SERTIFIKAT RESMI TERVERIFIKASI • EVENT:{' '}
                      {certificate.eventTitle}
                    </span>
                  </div>

                  <Button
                    variant="accent"
                    size="sm"
                    icon={<Printer size={14} />}
                    onClick={() =>
                      printCertificateElement(
                        'verified-certificate-canvas',
                        `Sertifikat - ${certificate.recipientName}`,
                        resolvedTemplate.orientation
                      )
                    }
                  >
                    Cetak / Simpan PDF
                  </Button>
                </div>

                {/* Certificate Canvas with QR Signatures */}
                <CertificateCanvas
                  id="verified-certificate-canvas"
                  template={resolvedTemplate}
                  certificateNumber={certificate.certificateNumber}
                  eventId={certificate.eventId}
                  eventTitle={certificate.eventTitle}
                  organizationName={certificate.organizationName}
                  company={certificate.company}
                  issueDate={certificate.issueDate}
                  recipientName={certificate.recipientName}
                  studentId={certificate.studentId}
                  institution={certificate.company}
                  category={resolveCategoryFromCertificate(certificate)}
                  roleLabel={
                    certificate.roleLabel || certificate.role.toUpperCase()
                  }
                  rank={certificate.rank}
                  groupName={certificate.groupName}
                  groupMembers={certificate.groupMembers}
                  verified={certificate.verified}
                />
              </div>
            ) : (
              <div className="max-w-[600px] mx-auto py-12 px-6 bg-[#151515] border border-[#3D3D3D]/60 rounded-xl text-center">
                <XCircle size={44} className="text-[#DF00D0] mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white mb-2">
                  Maaf, Sertifikat Tidak Ditemukan
                </h3>
                <p className="text-xs text-[#9C9C9C] mb-6 leading-relaxed">
                  Kode <strong>"{code}"</strong> tidak terdaftar dalam catatan
                  sertifikat resmi ormawa Convena. Mohon periksa kembali ejaan
                  kode Anda.
                </p>
                <Button
                  variant="accent"
                  onClick={() => handleQuickFill('CNV-2026-ITB-8821')}
                >
                  Coba Contoh Valid (ITB)
                </Button>
              </div>
            )}
          </div>
        )
      )}
    </div>
  )
}
