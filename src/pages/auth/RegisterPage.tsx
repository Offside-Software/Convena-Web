import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User as UserIcon, Mail, Lock, Building, ArrowRight, Sparkles, UserPlus } from 'lucide-react'
import { MemphisShape } from '../../components/shapes/MemphisShape.tsx'
import { authService } from '../../services/auth.service.ts'
import type { UserRole } from '../../types/user.ts'

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('attendee')
  const [company, setCompany] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!name.trim() || !username.trim() || !email.trim() || !password.trim()) {
      setErrorMessage('Harap lengkapi semua kolom yang wajib diisi')
      return
    }

    try {
      setIsLoading(true)
      await authService.register({
        name,
        username,
        email,
        password,
        role,
        company: company.trim() || undefined,
      })
      navigate('/dashboard')
    } catch (err: unknown) {
      const error = err as { message?: string }
      setErrorMessage(error?.message || 'Registrasi gagal. Silakan coba kembali.')
    } finally {
      setIsLoading(false)
    }
  }

  const roleOptions: { value: UserRole; label: string }[] = [
    { value: 'attendee', label: 'Peserta Event (Attendee)' },
    { value: 'committee', label: 'Panitia Event (Committee)' },
    { value: 'treasurer', label: 'Bendahara / Keuangan' },
    { value: 'sponsor', label: 'Mitra Industri / Sponsor' },
    { value: 'admin', label: 'Administrator Himpunan' },
  ]

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-mem-bg memphis-pattern-dots">
      {/* Decorative Memphis Background Elements */}
      <div className="absolute top-[8%] right-[8%] pointer-events-none hidden md:block">
        <MemphisShape type="squiggle" size={75} color="var(--mem-pink)" />
      </div>
      <div className="absolute bottom-[10%] left-[6%] pointer-events-none hidden md:block">
        <MemphisShape type="ring" size={65} color="var(--mem-yellow)" />
      </div>
      <div className="absolute top-[40%] left-[4%] pointer-events-none hidden lg:block">
        <MemphisShape type="cross" size={40} color="var(--mem-dark)" />
      </div>

      <div className="w-full max-w-xl relative z-10">
        {/* Header Badge */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-1.5 bg-mem-cyan border-2 border-mem-dark rounded-full px-3.5 py-1 font-display font-extrabold text-xs shadow-mem-sm mb-3 text-mem-dark">
            <UserPlus size={15} />
            <span>PENDAFTARAN PENGGUNA BARU</span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-mem-dark tracking-tight mb-1">
            Bergabung dengan Convena
          </h1>
          <p className="text-xs sm:text-sm text-gray-600">
            Satu akun untuk seluruh kegiatan organisasi, panitia, & peserta
          </p>
        </div>

        {/* Card Box */}
        <div className="bg-white border-[3px] border-mem-dark rounded-xl shadow-mem-md overflow-hidden">
          <div className="bg-mem-cyan border-b-[3px] border-mem-dark px-5 py-3.5 flex items-center justify-between text-mem-dark font-display font-black text-sm tracking-wider uppercase">
            <span>FORMULIR REGISTRASI</span>
            <span className="text-[11px] bg-white text-mem-dark px-2 py-0.5 rounded border border-mem-dark font-mono font-bold">
              ARGON2 + JWT
            </span>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="bg-pink-50 border-2 border-mem-pink text-mem-pink rounded-lg p-3 text-xs sm:text-sm font-bold shadow-[2px_2px_0px_#FF4B91]">
                  {errorMessage}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block font-display font-bold text-xs uppercase tracking-wider text-mem-dark mb-1.5"
                  >
                    Nama Lengkap
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-gray-400 pointer-events-none">
                      <UserIcon size={18} />
                    </span>
                    <input
                      id="name"
                      type="text"
                      required
                      placeholder="Arya Pratama"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white border-2 border-mem-dark rounded-lg text-sm text-mem-dark font-body shadow-[2px_2px_0px_#121215] focus:outline-none focus:border-mem-pink focus:shadow-[3px_3px_0px_#FF4B91] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="username"
                    className="block font-display font-bold text-xs uppercase tracking-wider text-mem-dark mb-1.5"
                  >
                    Username
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-gray-400 pointer-events-none">
                      <UserIcon size={18} />
                    </span>
                    <input
                      id="username"
                      type="text"
                      required
                      placeholder="aryapratama"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white border-2 border-mem-dark rounded-lg text-sm text-mem-dark font-body shadow-[2px_2px_0px_#121215] focus:outline-none focus:border-mem-pink focus:shadow-[3px_3px_0px_#FF4B91] transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block font-display font-bold text-xs uppercase tracking-wider text-mem-dark mb-1.5"
                >
                  Email Kampus / Organisasi
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-gray-400 pointer-events-none">
                    <Mail size={18} />
                  </span>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="arya@student.itb.ac.id"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border-2 border-mem-dark rounded-lg text-sm text-mem-dark font-body shadow-[2px_2px_0px_#121215] focus:outline-none focus:border-mem-pink focus:shadow-[3px_3px_0px_#FF4B91] transition-all"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="reg-password"
                  className="block font-display font-bold text-xs uppercase tracking-wider text-mem-dark mb-1.5"
                >
                  Kata Sandi
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-gray-400 pointer-events-none">
                    <Lock size={18} />
                  </span>
                  <input
                    id="reg-password"
                    type="password"
                    required
                    placeholder="Minimal 6 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border-2 border-mem-dark rounded-lg text-sm text-mem-dark font-body shadow-[2px_2px_0px_#121215] focus:outline-none focus:border-mem-pink focus:shadow-[3px_3px_0px_#FF4B91] transition-all"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="role"
                  className="block font-display font-bold text-xs uppercase tracking-wider text-mem-dark mb-1.5"
                >
                  Peran Akun
                </label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3.5 py-2.5 bg-white border-2 border-mem-dark rounded-lg text-sm text-mem-dark font-body shadow-[2px_2px_0px_#121215] focus:outline-none focus:border-mem-pink transition-all cursor-pointer"
                >
                  {roleOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="company"
                  className="block font-display font-bold text-xs uppercase tracking-wider text-mem-dark mb-1.5"
                >
                  Instansi / Organisasi / Kampus (Opsional)
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-gray-400 pointer-events-none">
                    <Building size={18} />
                  </span>
                  <input
                    id="company"
                    type="text"
                    placeholder="Contoh: HMIF ITB atau Universitas Indonesia"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border-2 border-mem-dark rounded-lg text-sm text-mem-dark font-body shadow-[2px_2px_0px_#121215] focus:outline-none focus:border-mem-pink focus:shadow-[3px_3px_0px_#FF4B91] transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-3 py-3 px-4 bg-mem-pink hover:bg-mem-pink-light text-white font-display font-black text-sm uppercase tracking-wider border-2 border-mem-dark rounded-lg shadow-mem-sm hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Sparkles size={18} className="animate-spin" />
                    <span>Mendaftarkan ke Database Rust...</span>
                  </>
                ) : (
                  <>
                    <span>Daftar Akun Baru</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t-2 border-dashed border-gray-200 text-center text-xs sm:text-sm text-gray-600">
              <span>Sudah memiliki akun? </span>
              <Link
                to="/login"
                className="text-mem-purple font-display font-extrabold hover:underline ml-1"
              >
                Masuk di sini
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
