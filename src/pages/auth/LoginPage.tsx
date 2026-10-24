import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../../components/common/Card.tsx'
import { Badge } from '../../components/common/Badge.tsx'
import { authService } from '../../services/auth.service.ts'
import type { UserRole } from '../../types/user.ts'
import { LoginForm } from './components/LoginForm.tsx'

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('raissa@student.telkomuniversity.ac.id')
  const [password, setPassword] = useState('password123')
  const [role, setRole] = useState<UserRole>('treasurer')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return

    setLoading(true)
    await authService.login({ email, password, role })
    setLoading(false)

    // Jika role bendahara, langsung arahkan ke halaman Budget & SPJ
    if (role === 'treasurer') {
      navigate('/dashboard/finances')
    } else if (role === 'attendee') {
      navigate('/events')
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <div
      className="memphis-pattern-dots"
      style={{
        minHeight: 'calc(100vh - 80px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
      }}
    >
      <div style={{ width: '100%', maxWidth: '460px' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <Badge variant="yellow" tilt="left" style={{ marginBottom: '0.5rem' }}>
            PORTAL ORMAWA CONVENA
          </Badge>
          <h1 style={{ fontSize: '2.2rem', margin: '0 0 0.35rem' }}>Masuk Akun</h1>
          <p style={{ color: 'var(--mem-gray-500)', fontSize: '0.9rem', margin: 0 }}>
            Kelola kegiatan, anggaran RAB, dan laporan SPJ organisasi Anda.
          </p>
        </div>

        <Card headerColor="yellow" headerTitle="Autentikasi Pengurus & Mahasiswa" hoverable={false}>
          <LoginForm
            email={email}
            password={password}
            role={role}
            loading={loading}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onRoleChange={setRole}
            onSubmit={handleLogin}
          />
        </Card>
      </div>
    </div>
  )
}
