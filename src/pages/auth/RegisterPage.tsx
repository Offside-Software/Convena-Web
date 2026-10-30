import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, AlertCircle, Sparkles } from 'lucide-react'
import { authService } from '../../services/auth.service.ts'

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [company, setCompany] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!name.trim() || !username.trim() || !email.trim() || !password.trim()) {
      setErrorMessage('Harap lengkapi semua kolom yang wajib diisi')
      return
    }

    if (password.length < 6) {
      setErrorMessage('Kata sandi minimal 6 karakter')
      return
    }

    if (!agreeTerms) {
      setErrorMessage('Harap menyetujui syarat & ketentuan layanan')
      return
    }

    try {
      setIsLoading(true)
      await authService.register({
        name,
        username,
        email,
        password,
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

  return (
    <div className="min-h-[calc(100vh-70px)] w-full flex flex-col justify-between items-center px-4 py-10 relative overflow-hidden bg-[#000000] font-['Montserrat',sans-serif]">
      {/* Centered Register Container */}
      <div className="w-full max-w-[420px] z-10 my-auto">
        {/* Header Title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-0.5">
            Create Account
          </h2>
          <h1 className="text-3xl sm:text-4xl font-black text-[#CFFE06] tracking-tight leading-tight">
            Convena
          </h1>
          <p className="text-xs text-[#9C9C9C] mt-1">
            Bergabung ke ekosistem manajemen kegiatan & ormawa
          </p>
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {errorMessage && (
            <div className="bg-[#202020] border border-[#DF00D0] text-[#DF00D0] rounded-xl p-3 text-xs font-semibold flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Full Name */}
          <div>
            <label htmlFor="name" className="block font-medium text-xs text-[#9C9C9C] mb-1.5">
              Nama Lengkap
            </label>
            <input
              id="name"
              type="text"
              required
              placeholder="e.g. Arya Pratama"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#1c1c1c] border border-[#333333] rounded-xl py-2.5 px-4 text-sm font-medium text-white placeholder:text-[#9C9C9C]/40 outline-none focus:border-[#CFFE06] transition-colors"
            />
          </div>

          {/* Username & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="reg-username" className="block font-medium text-xs text-[#9C9C9C] mb-1.5">
                Username
              </label>
              <input
                id="reg-username"
                type="text"
                required
                placeholder="aryapratama"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#1c1c1c] border border-[#333333] rounded-xl py-2.5 px-4 text-sm font-medium text-white placeholder:text-[#9C9C9C]/40 outline-none focus:border-[#CFFE06] transition-colors"
              />
            </div>
            <div>
              <label htmlFor="reg-email" className="block font-medium text-xs text-[#9C9C9C] mb-1.5">
                Email Kampus
              </label>
              <input
                id="reg-email"
                type="email"
                required
                placeholder="nama@kampus.ac.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#1c1c1c] border border-[#333333] rounded-xl py-2.5 px-4 text-sm font-medium text-white placeholder:text-[#9C9C9C]/40 outline-none focus:border-[#CFFE06] transition-colors"
              />
            </div>
          </div>

          {/* Organisasi / Kampus */}
          <div>
            <label htmlFor="company" className="block font-medium text-xs text-[#9C9C9C] mb-1.5">
              Himpunan / BEM / Kampus
            </label>
            <input
              id="company"
              type="text"
              placeholder="e.g. HMIF Telkom University / ITB"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full bg-[#1c1c1c] border border-[#333333] rounded-xl py-2.5 px-4 text-sm font-medium text-white placeholder:text-[#9C9C9C]/40 outline-none focus:border-[#CFFE06] transition-colors"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="reg-password" className="block font-medium text-xs text-[#9C9C9C] mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#1c1c1c] border border-[#333333] rounded-xl py-2.5 pl-4 pr-11 text-sm font-medium text-white placeholder:text-[#9C9C9C]/40 outline-none focus:border-[#CFFE06] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9C9C9C] hover:text-white transition-colors cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Terms checkbox */}
          <div className="flex items-center gap-2 pt-1 text-xs text-[#9C9C9C]">
            <input
              type="checkbox"
              id="terms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="accent-[#CFFE06] w-4 h-4 rounded cursor-pointer"
            />
            <label htmlFor="terms" className="cursor-pointer">
              Saya menyetujui syarat & kebijakan privasi Convena
            </label>
          </div>

          {/* Rounded Pill Button: Register */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 bg-[#CFFE06] hover:bg-[#bde805] text-[#000000] font-bold text-sm rounded-full transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(207,254,6,0.25)] hover:shadow-[0_0_25px_rgba(207,254,6,0.4)] active:scale-[0.99] flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Sparkles size={16} className="animate-spin text-black" />
                  <span>Mendaftarkan Akun...</span>
                </>
              ) : (
                <span>Register</span>
              )}
            </button>
          </div>

          {/* Back to Login */}
          <div className="text-center pt-3 text-xs font-medium">
            <span className="text-[#9C9C9C]">Sudah memiliki akun? </span>
            <Link to="/login" className="text-[#CFFE06] font-semibold hover:underline">
              Login di sini
            </Link>
          </div>
        </form>
      </div>

      {/* Subtle Purple to Neon-Green Gradient Ambient Glow at Bottom */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-[220px] opacity-75 blur-[70px]"
        style={{
          background: 'radial-gradient(ellipse at bottom, #CFFE06 0%, #DF00D0 50%, transparent 80%)',
        }}
      />
    </div>
  )
}
