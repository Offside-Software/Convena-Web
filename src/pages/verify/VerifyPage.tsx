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
    <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>
      {/* Title Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{ display: 'inline-flex', marginBottom: '0.75rem' }}>
          <Badge variant="cyan" tilt="left" icon={<ShieldCheck size={16} />}>
            PORTAL OTENTIKASI RESMI
          </Badge>
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', margin: '0 0 0.5rem' }}>
          Verifikasi Keaslian E-Sertifikat
        </h1>
        <p style={{ color: 'var(--mem-gray-500)', maxWidth: '640px', margin: '0 auto' }}>
          Validasi keabsahan dokumen penghargaan, kepanitiaan, atau kehadiran peserta acara mahasiswa melalui basis data Convena.
        </p>
      </div>

      {/* Search Input Box */}
      <div
        className="memphis-box"
        style={{
          maxWidth: '680px',
          margin: '0 auto 2.5rem',
          padding: '1.25rem',
          backgroundColor: '#FFFFFF',
          boxShadow: '6px 6px 0px var(--mem-dark)',
        }}
      >
        <form onSubmit={handleVerify} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 300px' }}>
            <Input
              placeholder="Masukkan ID Sertifikat (Contoh: CNV-2026-ITB-8821)"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              icon={<Search size={18} />}
              style={{ margin: 0 }}
              required
            />
          </div>
          <Button variant="pink" size="md" type="submit" disabled={loading}>
            {loading ? 'Memvalidasi...' : 'Verifikasi Sekarang'}
          </Button>
        </form>

        {/* Quick sample fillers */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.85rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--mem-gray-500)' }}>Contoh Cepat:</span>
          <button
            type="button"
            onClick={() => handleQuickFill('CNV-2026-ITB-8821')}
            style={{
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              padding: '2px 8px',
              borderRadius: '4px',
              border: '1px solid var(--mem-dark)',
              backgroundColor: 'var(--mem-yellow)',
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            CNV-2026-ITB-8821 (ITB)
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill('CNV-2026-UI-1042')}
            style={{
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              padding: '2px 8px',
              borderRadius: '4px',
              border: '1px solid var(--mem-dark)',
              backgroundColor: 'var(--mem-cyan)',
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            CNV-2026-UI-1042 (UI)
          </button>
        </div>
      </div>

      {/* Result Display */}
      {hasSearched && (
        <div>
          {certificate ? (
            <div
              className="memphis-box"
              style={{
                backgroundColor: '#FFFFFF',
                border: 'var(--mem-border-thick)',
                boxShadow: '10px 10px 0px var(--mem-dark)',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              {/* Memphis Top Certificate Ribbon */}
              <div
                style={{
                  backgroundColor: 'var(--mem-yellow)',
                  borderBottom: 'var(--mem-border)',
                  padding: '0.75rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={20} style={{ color: '#008775', fill: '#00F5D4' }} />
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.95rem' }}>
                    SERTIFIKAT RESMI TERVERIFIKASI
                  </span>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.85rem' }}>
                  ID: {certificate.certificateNumber}
                </div>
              </div>

              {/* Certificate Inner Canvas */}
              <div
                style={{
                  padding: '3rem 2.5rem',
                  textAlign: 'center',
                  position: 'relative',
                  backgroundImage:
                    'radial-gradient(var(--mem-yellow-light) 1.5px, transparent 1.5px)',
                  backgroundSize: '20px 20px',
                }}
              >
                <div style={{ position: 'absolute', top: '20px', left: '20px' }}>
                  <MemphisShape type="cross" size={28} color="var(--mem-pink)" />
                </div>
                <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
                  <MemphisShape type="starburst" size={32} color="var(--mem-cyan)" />
                </div>

                {/* Institution Heading */}
                <div style={{ fontSize: '1rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--mem-gray-500)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
                  {certificate.organizationName} • {certificate.university}
                </div>

                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 900,
                    fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
                    color: 'var(--mem-dark)',
                    marginBottom: '1rem',
                  }}
                >
                  SERTIFIKAT PENGHARGAAN
                </div>

                <p style={{ fontSize: '1rem', color: '#4B5563', margin: '0 0 1.25rem' }}>
                  Diberikan dengan bangga kepada:
                </p>

                {/* Recipient Name Box */}
                <div
                  style={{
                    display: 'inline-block',
                    padding: '0.75rem 2.5rem',
                    backgroundColor: 'var(--mem-yellow)',
                    border: 'var(--mem-border)',
                    boxShadow: '4px 4px 0px var(--mem-dark)',
                    borderRadius: '8px',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 900,
                    fontSize: 'clamp(1.4rem, 2.5vw, 2rem)',
                    color: 'var(--mem-dark)',
                    marginBottom: '1.25rem',
                  }}
                >
                  {certificate.recipientName}
                </div>

                {certificate.studentId && (
                  <div style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--mem-gray-500)', marginBottom: '1.5rem' }}>
                    NIM: {certificate.studentId}
                  </div>
                )}

                <p style={{ fontSize: '1.05rem', maxWidth: '640px', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
                  Atas partisipasi dan kontribusi aktifnya sebagai <strong>{certificate.role.toUpperCase()}</strong> dalam kegiatan{' '}
                  <strong>{certificate.eventTitle}</strong> yang diselenggarakan pada tanggal {certificate.issueDate}.
                </p>

                {/* Signatories Row & QR Watermark */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-around',
                    flexWrap: 'wrap',
                    gap: '2rem',
                    borderTop: '2px dashed var(--mem-dark)',
                    paddingTop: '2rem',
                  }}
                >
                  {certificate.signatories.map((sig, idx) => (
                    <div key={idx} style={{ textAlign: 'center', minWidth: '180px' }}>
                      <div
                        style={{
                          height: '40px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.75rem',
                          color: 'var(--mem-gray-500)',
                          marginBottom: '4px',
                        }}
                      >
                        [Signed Digitally with Key]
                      </div>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem', borderTop: '1.5px solid var(--mem-dark)', paddingTop: '4px' }}>
                        {sig.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--mem-gray-500)' }}>{sig.title}</div>
                    </div>
                  ))}

                  <div style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        padding: '6px',
                        backgroundColor: '#FFFFFF',
                        border: '2px solid var(--mem-dark)',
                        borderRadius: '6px',
                        display: 'inline-block',
                      }}
                    >
                      <QrCode size={64} />
                    </div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, marginTop: '2px' }}>Otentikasi Convena</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="memphis-box"
              style={{
                maxWidth: '680px',
                margin: '0 auto',
                padding: '3rem 2rem',
                backgroundColor: '#FFFFFF',
                textAlign: 'center',
              }}
            >
              <XCircle size={48} style={{ color: 'var(--mem-pink)', margin: '0 auto 1rem' }} />
              <h3 style={{ margin: '0 0 0.5rem' }}>Sertifikat Tidak Ditemukan</h3>
              <p style={{ color: 'var(--mem-gray-500)', margin: '0 0 1.5rem' }}>
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
