import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User as UserIcon, Mail, Lock, Building, ArrowRight, Eye, EyeOff, Sparkles, Check } from 'lucide-react'
import { authService } from '../../services/auth.service.ts'
import { MemphisShape } from '../../components/shapes/MemphisShape.tsx'

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [company, setCompany] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)
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
      setErrorMessage('Harap menyetujui syarat & ketentuan layanan Convena')
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
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-12 px-4 bg-[#FFE600]/10 relative overflow-hidden">
      {/* Decorative Floating Memphis Shapes */}
      <div className="absolute top-12 left-8 md:left-24 pointer-events-none select-none">
        <MemphisShape type="zigzag" size={80} color="#FF4B91" animate="slow" />
      </div>
      <div className="absolute bottom-16 right-8 md:right-28 pointer-events-none select-none">
        <MemphisShape type="starburst" size={64} color="#00F5D4" animate="fast" />
      </div>
      <div className="absolute top-1/3 right-12 hidden lg:block pointer-events-none select-none">
        <MemphisShape type="ring" size={48} color="#01CDFE" />
      </div>
      <div className="absolute bottom-1/4 left-14 hidden lg:block pointer-events-none select-none">
        <MemphisShape type="cross" size={36} color="#845EC2" />
      </div>

      <div className="grid grid-cols-2 items-center space-between gap-12  max-w-[1280px] relative z-10 relative z-10">

        <div className="col-span-1 mb-6 text-center">
          <div className="inline-flex items-center gap-2 bg-[#FFE600] border-2 border-[#121215] rounded-full px-4 py-1 font-['Space_Grotesk',sans-serif] font-black text-xs uppercase tracking-wider text-[#121215] -rotate-2 shadow-[2px_2px_0px_0px_#121215] mb-3">
            <span>Selamat Datang di Convena</span>
          </div>

          <h1 className="font-['Space_Grotesk',sans-serif] font-black text-3xl sm:text-4xl text-[#121215] mb-2 tracking-tight">
            Mulai Kelola & Ikuti Event
          </h1>
          <p className="text-sm text-gray-600 font-medium">
            Buat satu akun untuk mengatur event, menjadi panitia, atau membeli tiket di seluruh kampus
          </p>
        </div>

        {/* Registration Card */}
        <div className="col-span-1 bg-white border-4 border-[#121215] rounded-2xl shadow-[8px_8px_0px_0px_#121215] overflow-hidden">
          {/* Card Header Bar */}
          <div className="bg-[#00F5D4] border-b-4 border-[#121215] px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-[#FF4B91] border-2 border-[#121215]" />
              <span className="w-3.5 h-3.5 rounded-full bg-[#FFE600] border-2 border-[#121215]" />
              <span className="w-3.5 h-3.5 rounded-full bg-[#01CDFE] border-2 border-[#121215]" />
              <span className="font-['Space_Grotesk',sans-serif] font-bold text-xs uppercase tracking-wider text-[#121215] ml-2">
                Daftar Akun Baru
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/70 px-2.5 py-1 rounded-full border-2 border-[#121215] text-[11px] font-bold text-[#121215]">
              <Sparkles size={12} className="text-[#FF4B91]" />
              Multi-Event Ready
            </div>
          </div>

          <div className="p-6 md:p-8">
            {errorMessage && (
              <div className="mb-6 p-3.5 bg-[#FF4B91]/15 border-2 border-[#FF4B91] rounded-xl text-xs font-bold text-[#121215] flex items-center gap-2 shadow-[2px_2px_0px_0px_#FF4B91]">
                <span className="w-2 h-2 rounded-full bg-[#FF4B91] shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block font-['Space_Grotesk',sans-serif] font-bold text-xs uppercase tracking-wider text-[#121215] mb-2"
                  >
                    Nama Lengkap <span className="text-[#FF4B91]">*</span>
                  </label>
                  <div className="flex items-center w-full bg-white border-2 border-[#121215] rounded-xl shadow-[3px_3px_0px_0px_#121215] focus-within:border-[#01CDFE] focus-within:shadow-[4px_4px_0px_0px_#01CDFE] transition-all">
                    <span className="pl-3.5 text-gray-400 shrink-0 select-none">
                      <UserIcon size={18} />
                    </span>
                    <input
                      id="name"
                      type="text"
                      required
                      placeholder="e.g. Arya Pratama"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="!border-none !shadow-none !bg-transparent w-full py-3 pr-4 text-sm font-medium text-[#121215] placeholder:text-gray-400 !outline-none focus:!ring-0"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="username"
                    className="block font-['Space_Grotesk',sans-serif] font-bold text-xs uppercase tracking-wider text-[#121215] mb-2"
                  >
                    Username <span className="text-[#FF4B91]">*</span>
                  </label>
                  <div className="flex items-center w-full bg-white border-2 border-[#121215] rounded-xl shadow-[3px_3px_0px_0px_#121215] focus-within:border-[#01CDFE] focus-within:shadow-[4px_4px_0px_0px_#01CDFE] transition-all">
                    <span className="pl-3.5 text-gray-400 shrink-0 select-none">
                      <UserIcon size={18} />
                    </span>
                    <input
                      id="username"
                      type="text"
                      required
                      placeholder="aryapratama"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      className="!border-none !shadow-none !bg-transparent w-full py-3 pr-4 text-sm font-medium text-[#121215] placeholder:text-gray-400 !outline-none focus:!ring-0"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block font-['Space_Grotesk',sans-serif] font-bold text-xs uppercase tracking-wider text-[#121215] mb-2"
                >
                  Alamat Email <span className="text-[#FF4B91]">*</span>
                </label>
                <div className="flex items-center w-full bg-white border-2 border-[#121215] rounded-xl shadow-[3px_3px_0px_0px_#121215] focus-within:border-[#01CDFE] focus-within:shadow-[4px_4px_0px_0px_#01CDFE] transition-all">
                  <span className="pl-3.5 text-gray-400 shrink-0 select-none">
                    <Mail size={18} />
                  </span>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="nama@kampus.ac.id"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="!border-none !shadow-none !bg-transparent w-full py-3 pr-4 text-sm font-medium text-[#121215] placeholder:text-gray-400 !outline-none focus:!ring-0"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block font-['Space_Grotesk',sans-serif] font-bold text-xs uppercase tracking-wider text-[#121215] mb-2"
                >
                  Kata Sandi <span className="text-[#FF4B91]">*</span>
                </label>
                <div className="flex items-center w-full bg-white border-2 border-[#121215] rounded-xl shadow-[3px_3px_0px_0px_#121215] focus-within:border-[#01CDFE] focus-within:shadow-[4px_4px_0px_0px_#01CDFE] transition-all">
                  <span className="pl-3.5 text-gray-400 shrink-0 select-none">
                    <Lock size={18} />
                  </span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Minimal 6 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="!border-none !shadow-none !bg-transparent w-full py-3 pr-2 text-sm font-medium text-[#121215] placeholder:text-gray-400 !outline-none focus:!ring-0"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="pr-3.5 pl-2 text-gray-400 hover:text-[#121215] shrink-0 cursor-pointer focus:outline-none"
                    aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="company"
                  className="block font-['Space_Grotesk',sans-serif] font-bold text-xs uppercase tracking-wider text-[#121215] mb-2"
                >
                  Instansi / Organisasi / Kampus (Opsional)
                </label>
                <div className="flex items-center w-full bg-white border-2 border-[#121215] rounded-xl shadow-[3px_3px_0px_0px_#121215] focus-within:border-[#01CDFE] focus-within:shadow-[4px_4px_0px_0px_#01CDFE] transition-all">
                  <span className="pl-3.5 text-gray-400 shrink-0 select-none">
                    <Building size={18} />
                  </span>
                  <input
                    id="company"
                    type="text"
                    placeholder="e.g. Institut Teknologi Bandung / BEM FT"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="!border-none !bg-transparent w-full py-3 pr-3.5 text-sm font-medium text-[#121215] placeholder-gray-400 bg-transparent border-none outline-none"
                  />
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <div className="relative flex items-center justify-center mt-0.5">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-5 h-5 bg-white border-2 border-[#121215] rounded-md shadow-[2px_2px_0px_0px_#121215] peer-checked:bg-[#00F5D4] transition-all flex items-center justify-center">
                      {agreeTerms && <Check size={14} className="text-[#121215] stroke-[3]" />}
                    </div>
                  </div>
                  <span className="text-xs text-gray-600 leading-snug">
                    Saya menyetujui{' '}
                    <span className="font-bold text-[#121215] underline">Ketentuan Layanan</span> dan{' '}
                    <span className="font-bold text-[#121215] underline">Kebijakan Privasi</span> Convena.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-4 py-3.5 px-6 bg-[#00F5D4] hover:bg-[#00F5D4]/90 text-[#121215] font-['Space_Grotesk',sans-serif] font-bold text-base border-2 border-[#121215] rounded-xl shadow-[4px_4px_0px_0px_#121215] hover:shadow-[2px_2px_0px_0px_#121215] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span>Mendaftarkan akun...</span>
                ) : (
                  <>
                    <span>Daftar Akun Convena</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t-2 border-gray-100 text-center">
              <p className="text-xs text-gray-600">
                Sudah memiliki akun?{' '}
                <Link
                  to="/login"
                  className="font-['Space_Grotesk',sans-serif] font-bold text-[#121215] hover:text-[#01CDFE] underline decoration-2 transition-colors"
                >
                  Masuk di sini
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
