import React from 'react'
import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'
import { Button } from '../../components/common/Button.tsx'
import { MemphisShape } from '../../components/shapes/MemphisShape.tsx'

export const NotFoundPage: React.FC = () => {
  return (
    <div
      className="memphis-pattern-dots"
      style={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
        textAlign: 'center',
        position: 'relative',
      }}
    >
      <div style={{ position: 'absolute', top: '10%', left: '15%' }}>
        <MemphisShape type="zigzag" size={60} color="var(--mem-pink)" animate="slow" />
      </div>
      <div style={{ position: 'absolute', bottom: '15%', right: '15%' }}>
        <MemphisShape type="triangle" size={50} color="var(--mem-yellow)" animate="fast" />
      </div>

      <div
        className="memphis-box"
        style={{
          maxWidth: '540px',
          padding: '3.5rem 2.5rem',
          backgroundColor: '#FFFFFF',
          boxShadow: '10px 10px 0px var(--mem-dark)',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 900,
            fontSize: '6rem',
            lineHeight: 1,
            color: 'var(--mem-pink)',
            textShadow: '4px 4px 0px var(--mem-dark)',
            marginBottom: '1rem',
          }}
        >
          404
        </div>

        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>Halaman Tidak Ditemukan!</h2>
        <p style={{ color: 'var(--mem-gray-500)', marginBottom: '2rem' }}>
          Ups! Sepertinya panitia lupa memasang petunjuk arah untuk halaman ini. Mari kembali ke beranda Convena.
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Button variant="yellow" size="md" icon={<Home size={18} />}>
              Kembali ke Beranda
            </Button>
          </Link>
          <Link to="/events" style={{ textDecoration: 'none' }}>
            <Button variant="outline" size="md" icon={<ArrowLeft size={18} />}>
              Lihat Event
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
