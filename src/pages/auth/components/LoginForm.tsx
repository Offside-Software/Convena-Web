import React from 'react'
import { Mail, Lock, LogIn } from 'lucide-react'
import { Button } from '../../../components/common/Button.tsx'
import { Input } from '../../../components/common/Input.tsx'
import { Select } from '../../../components/common/Select.tsx'
import type { UserRole } from '../../../types/user.ts'

export interface LoginFormProps {
  email: string
  password: string
  role: UserRole
  loading: boolean
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onRoleChange: (role: UserRole) => void
  onSubmit: (e: React.FormEvent) => void
}

export const LoginForm: React.FC<LoginFormProps> = ({
  email,
  password,
  role,
  loading,
  onEmailChange,
  onPasswordChange,
  onRoleChange,
  onSubmit,
}) => {
  return (
    <form onSubmit={onSubmit}>
      <Input
        label="Email Mahasiswa / Pengurus"
        type="email"
        placeholder="raissa@student.telkomuniversity.ac.id"
        value={email}
        onChange={(e) => onEmailChange(e.target.value)}
        icon={<Mail size={18} />}
        required
      />

      <Input
        label="Kata Sandi"
        type="password"
        placeholder="Masukkan kata sandi"
        value={password}
        onChange={(e) => onPasswordChange(e.target.value)}
        icon={<Lock size={18} />}
        required
      />

      <Select
        label="Masuk Sebagai Peran (Role)"
        value={role}
        onChange={(e) => onRoleChange(e.target.value as UserRole)}
        options={[
          { label: 'Bendahara / Keuangan (SPJ)', value: 'treasurer' },
          { label: 'Admin Organisasi', value: 'admin' },
          { label: 'Panitia Acara', value: 'committee' },
          { label: 'Peserta / Mahasiswa', value: 'attendee' },
        ]}
      />

      <div style={{ marginTop: '1.25rem' }}>
        <Button
          type="submit"
          variant="pink"
          size="lg"
          fullWidth
          disabled={loading}
          icon={<LogIn size={18} />}
        >
          {loading ? 'Memproses...' : 'Masuk ke Convena'}
        </Button>
      </div>
    </form>
  )
}
