import React from 'react'
import { Link } from 'react-router-dom'
import { MemphisShape } from '../shapes/MemphisShape.tsx'
import { Badge } from '../common/Badge.tsx'

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        backgroundColor: '#FFFFFF',
        borderTop: 'var(--mem-border-thick)',
        marginTop: 'auto',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative Memphis top colored stripes */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          height: '10px',
          borderBottom: 'var(--mem-border-sm)',
        }}
      >
        <div style={{ backgroundColor: 'var(--mem-yellow)' }} />
        <div style={{ backgroundColor: 'var(--mem-pink)' }} />
        <div style={{ backgroundColor: 'var(--mem-cyan)' }} />
        <div style={{ backgroundColor: 'var(--mem-purple)' }} />
        <div style={{ backgroundColor: 'var(--mem-mint)' }} />
      </div>

      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '3rem 1.5rem 2rem',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '2.5rem',
            marginBottom: '2.5rem',
          }}
        >
          {/* Brand info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: 'var(--mem-pink)',
                  border: '2px solid var(--mem-dark)',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  color: '#fff',
                }}
              >
                C
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.4rem' }}>
                CONVENA
              </span>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--mem-gray-500)', marginBottom: '1rem' }}>
              Operating system terintegrasi untuk organisasi mahasiswa Indonesia: manajemen acara, proposal, LPJ/SPJ, sponsorship CRM, dan sertifikat digital tervalidasi.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <Badge variant="pink">TEL-U</Badge>
              <Badge variant="yellow">ITB</Badge>
              <Badge variant="cyan">UI</Badge>
              <Badge variant="pink">UGM</Badge>
              <Badge variant="mint">ITS</Badge>
              <Badge variant="purple">UNAIR</Badge>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '1rem',
                textTransform: 'uppercase',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <MemphisShape type="triangle" size={14} color="var(--mem-yellow)" />
              Fitur Utama
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <li>
                <Link to="/events" style={{ fontSize: '0.9rem', color: 'var(--mem-dark)', fontWeight: 600 }}>
                  Katalog Event Kampus
                </Link>
              </li>
              <li>
                <Link to="/dashboard/sponsorship" style={{ fontSize: '0.9rem', color: 'var(--mem-dark)', fontWeight: 600 }}>
                  Sponsorship Pipeline CRM
                </Link>
              </li>
              <li>
                <Link to="/dashboard/finances" style={{ fontSize: '0.9rem', color: 'var(--mem-dark)', fontWeight: 600 }}>
                  Manajemen Anggaran & SPJ
                </Link>
              </li>
              <li>
                <Link to="/verify" style={{ fontSize: '0.9rem', color: 'var(--mem-dark)', fontWeight: 600 }}>
                  Verifikasi E-Certificate
                </Link>
              </li>
            </ul>
          </div>

          {/* Guidelines & LPJ */}
          <div>
            <h4
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '1rem',
                textTransform: 'uppercase',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <MemphisShape type="cross" size={14} color="var(--mem-cyan)" />
              Operasional Ormawa
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <li>
                <a href="#lpj" style={{ fontSize: '0.9rem', color: 'var(--mem-dark)', fontWeight: 600 }}>
                  Format Template LPJ Resmi
                </a>
              </li>
              <li>
                <a href="#spj" style={{ fontSize: '0.9rem', color: 'var(--mem-dark)', fontWeight: 600 }}>
                  Standar Audit Kuitansi & SPJ
                </a>
              </li>
              <li>
                <a href="#payment" style={{ fontSize: '0.9rem', color: 'var(--mem-dark)', fontWeight: 600 }}>
                  Integrasi QRIS & Virtual Account
                </a>
              </li>
              <li>
                <a href="#security" style={{ fontSize: '0.9rem', color: 'var(--mem-dark)', fontWeight: 600 }}>
                  Keamanan & Hak Akses Panitia
                </a>
              </li>
            </ul>
          </div>

          {/* Memphis Decorative Badge Box */}
          <div
            className="memphis-box"
            style={{
              padding: '1.25rem',
              backgroundColor: 'var(--mem-yellow-light)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <div style={{ position: 'absolute', top: '-10px', right: '10px' }}>
              <MemphisShape type="starburst" size={28} color="var(--mem-pink)" animate="slow" />
            </div>
            <h5 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, marginBottom: '0.35rem' }}>
              Siap Mengangkat Ormawa Anda?
            </h5>
            <p style={{ fontSize: '0.85rem', marginBottom: '0.75rem' }}>
              Bergabung bersama ratusan BEM dan Himpunan yang mengotomatisasi ticketing dan LPJ tanpa pusing.
            </p>
            <Link to="/events" style={{ textDecoration: 'none' }}>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  textDecoration: 'underline',
                  color: 'var(--mem-dark)',
                }}
              >
                Jelajahi Demo Convena →
              </span>
            </Link>
          </div>
        </div>

        {/* Bottom copyright */}
        <div
          style={{
            borderTop: '2px dashed var(--mem-dark)',
            paddingTop: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--mem-gray-500)' }}>
            © 2026 Convena.
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>v1.0.0-rc</span>
            <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>Axum</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
