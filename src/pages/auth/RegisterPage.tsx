import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User as UserIcon, Mail, Lock, Building, ArrowRight, Sparkles, UserPlus, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { authService } from '../../services/auth.service.ts'
import type { UserRole } from '../../types/user.ts'

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState<UserRole>('attendee')
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

  const roleOptions: { value: UserRole; label: string; desc: string }[] = [
    { value: 'attendee', label: 'Peserta Event (Attendee)', desc: 'Daftar dan ikuti berbagai event kampus' },
    { value: 'committee', label: 'Panitia Event (Committee)', desc: 'Atur kepanitiaan, tiket, dan presensi' },
    { value: 'treasurer', label: 'Bendahara / Keuangan', desc: 'Manajemen anggaran, pengeluaran & SPJ' },
    { value: 'sponsor', label: 'Mitra Industri / Sponsor', desc: 'Dukung pendanaan & kolaborasi kegiatan' },
    { value: 'admin', label: 'Administrator Himpunan', desc: 'Kelola seluruh divisi & anggota ormawa' },
  ]

  return (
    <div className="w-full flex justify-center p-4 sm:p-6 lg:p-8 bg-[#FAF9F6] bg-[radial-gradient(#01CDFE_1.5px,transparent_1.5px)] [background-size:24px_24px] relative overflow-hidden">
      
      {/* Decorative Neo-Brutalist SVGs with pure Tailwind */}
      <div className="absolute top-10 right-10 pointer-events-none hidden md:block rotate-6 opacity-80">
        <svg className="w-24 h-12 text-[#FF4B91]" viewBox="0 0 100 40" fill="none" stroke="currentColor">
          <path d="M5 20 Q 25 0, 50 20 T 95 20" strokeWidth="6" strokeLinecap="round" />
        </svg>
      </div>

      <div className="absolute bottom-12 left-10 pointer-events-none hidden md:block -rotate-6 opacity-80">
        <svg className="w-16 h-16 text-[#FFE600]" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="12">
          <circle cx="50" cy="50" r="35" strokeDasharray="10 6" />
        </svg>
      </div>

      <div className="absolute top-1/2 left-8 pointer-events-none hidden lg:block -translate-y-1/2 opacity-75">
        <svg className="w-10 h-10 text-[#121215]" viewBox="0 0 100 100" fill="currentColor">
          <polygon points="50,10 60,40 90,50 60,60 50,90 40,60 10,50 40,40" />
        </svg>
      </div>

      <div className="grid grid-cols-2 items-center space-between gap-12  max-w-[1280px] relative z-10">
        {/* Header Badge & Title */}
        <div className="row-span-1 text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-[#01CDFE] border-2 border-[#121215] rounded-full px-4 py-1 font-['Space_Grotesk',sans-serif] font-black text-xs uppercase tracking-wider text-[#121215] shadow-[2px_2px_0px_0px_#121215] mb-3">
            <UserPlus size={15} />
            <span>PENDAFTARAN PENGGUNA BARU</span>
          </div>
          <h1 className="font-['Space_Grotesk',sans-serif] font-black text-3xl sm:text-4xl text-[#121215] tracking-tight mb-2">
            Bergabung dengan Convena
          </h1>
          <p className="text-xs sm:text-sm font-medium text-gray-600">
            Satu akun untuk seluruh kegiatan organisasi, panitia, sponsor, & peserta
          </p>
        </div>

        {/* Card Box */}
        <div className="row-span-1 bg-white border-[3px] border-[#121215] rounded-2xl shadow-[6px_6px_0px_0px_#121215] overflow-hidden">
          {/* Card Window Bar */}
          <div className="bg-[#01CDFE] border-b-[3px] border-[#121215] px-6 py-3.5 flex items-center justify-between text-[#121215] font-['Space_Grotesk',sans-serif] font-black text-sm tracking-wider uppercase">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#121215] rounded-full inline-block" />
              FORMULIR REGISTRASI
            </span>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#FFE600] border border-[#121215]" />
              <span className="w-3 h-3 rounded-full bg-[#FF4B91] border border-[#121215]" />
              <span className="w-3 h-3 rounded-full bg-white border border-[#121215]" />
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMessage && (
                <div className="bg-pink-50 border-2 border-[#FF4B91] text-[#FF4B91] rounded-xl p-3.5 text-xs sm:text-sm font-bold shadow-[3px_3px_0px_0px_#FF4B91] flex items-center gap-2.5">
                  <AlertCircle size={18} className="shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label
                    htmlFor="name"
                    className="block font-['Space_Grotesk',sans-serif] font-bold text-xs uppercase tracking-wider text-[#121215] mb-2"
                  >
                    Nama Lengkap <span className="text-[#FF4B91]">*</span>
                  </label>
                  <div className="flex items-center w-full bg-white border-2 border-[#121215] rounded-xl shadow-[3px_3px_0px_0px_#121215] focus-within:border-[#01CDFE] focus-within:shadow-[4px_4px_0px_0px_#01CDFE] transition-all">
                    <span className="pl-3.5 pr-2.5 text-gray-400 shrink-0 select-none">
                      <UserIcon size={18} />
                    </span>
                    <input
                      id="name"
                      type="text"
                      required
                      placeholder="Arya Pratama"
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
                    <span className="pl-3.5 pr-2.5 text-gray-400 shrink-0 select-none">
                      <UserIcon size={18} />
                    </span>
                    <input
                      id="username"
                      type="text"
                      required
                      placeholder="aryapratama"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
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
                  Email Kampus / Organisasi <span className="text-[#FF4B91]">*</span>
                </label>
                <div className="flex items-center w-full bg-white border-2 border-[#121215] rounded-xl shadow-[3px_3px_0px_0px_#121215] focus-within:border-[#01CDFE] focus-within:shadow-[4px_4px_0px_0px_#01CDFE] transition-all">
                  <span className="pl-3.5 pr-2.5 text-gray-400 shrink-0 select-none">
                    <Mail size={18} />
                  </span>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="arya@student.itb.ac.id"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="!border-none !shadow-none !bg-transparent w-full py-3 pr-4 text-sm font-medium text-[#121215] placeholder:text-gray-400 !outline-none focus:!ring-0"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="reg-password"
                  className="block font-['Space_Grotesk',sans-serif] font-bold text-xs uppercase tracking-wider text-[#121215] mb-2"
                >
                  Kata Sandi <span className="text-[#FF4B91]">*</span>
                </label>
                <div className="flex items-center w-full bg-white border-2 border-[#121215] rounded-xl shadow-[3px_3px_0px_0px_#121215] focus-within:border-[#01CDFE] focus-within:shadow-[4px_4px_0px_0px_#01CDFE] transition-all">
                  <span className="pl-3.5 pr-2.5 text-gray-400 shrink-0 select-none">
                    <Lock size={18} />
                  </span>
                  <input
                    id="reg-password"
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
                  htmlFor="role"
                  className="block font-['Space_Grotesk',sans-serif] font-bold text-xs uppercase tracking-wider text-[#121215] mb-2"
                >
                  Peran Akun
                </label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-4 py-3 bg-white border-2 border-[#121215] rounded-xl text-sm font-medium text-[#121215] shadow-[3px_3px_0px_0px_#121215] focus:outline-none focus:border-[#01CDFE] focus:shadow-[4px_4px_0px_0px_#01CDFE] transition-all cursor-pointer"
                >
                  {roleOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label} — {opt.desc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="company"
                  className="block font-['Space_Grotesk',sans-serif] font-bold text-xs uppercase tracking-wider text-[#121215] mb-2"
                >
                  Instansi / Organisasi / Kampus (Opsional)
                </label>
                <div className="flex items-center w-full bg-white border-2 border-[#121215] rounded-xl shadow-[3px_3px_0px_0px_#121215] focus-within:border-[#01CDFE] focus-within:shadow-[4px_4px_0px_0px_#01CDFE] transition-all">
                  <span className="pl-3.5 pr-2.5 text-gray-400 shrink-0 select-none">
                    <Building size={18} />
                  </span>
                  <input
                    id="company"
                    type="text"
                    placeholder="Contoh: HMIF ITB atau Universitas Indonesia"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="!border-none !shadow-none !bg-transparent w-full py-3 pr-4 text-sm font-medium text-[#121215] placeholder:text-gray-400 !outline-none focus:!ring-0"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="!w-4 !h-4 mt-1 rounded border-2 border-[#121215] accent-[#FF4B91] cursor-pointer shrink-0 !shadow-none"
                  />
                  <span className="text-xs font-medium text-gray-700 leading-relaxed">
                    Saya menyetujui <a href="#terms" className="text-[#FF4B91] font-bold hover:underline">Ketentuan Layanan</a> dan <a href="#privacy" className="text-[#FF4B91] font-bold hover:underline">Kebijakan Privasi</a> Convena untuk kegiatan kemahasiswaan.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-3 py-3.5 px-6 bg-[#FF4B91] hover:bg-[#FF94BE] text-white font-['Space_Grotesk',sans-serif] font-black text-sm sm:text-base uppercase tracking-wider border-2 border-[#121215] rounded-xl shadow-[4px_4px_0px_0px_#121215] hover:shadow-[6px_6px_0px_0px_#121215] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 active:shadow-[2px_2px_0px_0px_#121215] transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
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

            <div className="mt-6 pt-5 border-t-2 border-dashed border-gray-200 text-center text-xs sm:text-sm text-gray-600 font-medium">
              <span>Sudah memiliki akun? </span>
              <Link
                to="/login"
                className="text-[#845EC2] font-['Space_Grotesk',sans-serif] font-black hover:underline ml-1"
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
