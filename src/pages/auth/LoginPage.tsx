import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Lock, Mail, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react'
import { MemphisShape } from '../../components/shapes/MemphisShape.tsx'
import { authService } from '../../services/auth.service.ts'

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!identifier.trim() || !password.trim()) {
      setErrorMessage('Harap isi username/email dan kata sandi')
      return
    }

    try {
      setIsLoading(true)
      await authService.login({ identifier, password })
      navigate('/dashboard')
    } catch (err: unknown) {
      const error = err as { message?: string }
      setErrorMessage(error?.message || 'Gagal masuk. Periksa kembali kredensial Anda.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-mem-bg memphis-pattern-dots">
      {/* Decorative Memphis Background Elements */}
      <div className="absolute top-[12%] left-[8%] pointer-events-none hidden md:block">
        <MemphisShape type="zigzag" size={80} color="var(--mem-pink)" />
      </div>
      <div className="absolute bottom-[10%] right-[8%] pointer-events-none hidden md:block">
        <MemphisShape type="circle-dots" size={70} color="var(--mem-cyan)" />
      </div>
      <div className="absolute top-[20%] right-[12%] pointer-events-none hidden lg:block">
        <MemphisShape type="starburst" size={50} color="var(--mem-yellow)" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header Badge */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-1.5 bg-mem-yellow border-2 border-mem-dark rounded-full px-3.5 py-1 font-display font-extrabold text-xs shadow-mem-sm mb-3 text-mem-dark">
            <ShieldCheck size={15} />
            <span>PORTAL AUTENTIKASI RESMI</span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-mem-dark tracking-tight mb-1">
            Masuk ke Convena
          </h1>
          <p className="text-xs sm:text-sm text-gray-600">
            Kelola event kampus & organisasi mahasiswa secara terintegrasi
          </p>
        </div>

        {/* Card Box */}
        <div className="bg-white border-[3px] border-mem-dark rounded-xl shadow-mem-md overflow-hidden">
          <div className="bg-mem-pink border-b-[3px] border-mem-dark px-5 py-3.5 flex items-center justify-between text-white font-display font-black text-sm tracking-wider uppercase">
            <span>LOGIN AKUN</span>
            <span className="text-[11px] bg-white text-mem-dark px-2 py-0.5 rounded border border-mem-dark font-mono font-bold">
              RUST API
            </span>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="bg-pink-50 border-2 border-mem-pink text-mem-pink rounded-lg p-3 text-xs sm:text-sm font-bold shadow-[2px_2px_0px_#FF4B91]">
                  {errorMessage}
                </div>
              )}

              <div>
                <label
                  htmlFor="identifier"
                  className="block font-display font-bold text-xs uppercase tracking-wider text-mem-dark mb-1.5"
                >
                  Username atau Email
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-gray-400 pointer-events-none">
                    <Mail size={18} />
                  </span>
                  <input
                    id="identifier"
                    type="text"
                    required
                    placeholder="nama@kampus.ac.id atau username"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border-2 border-mem-dark rounded-lg text-sm text-mem-dark font-body shadow-[2px_2px_0px_#121215] focus:outline-none focus:border-mem-pink focus:shadow-[3px_3px_0px_#FF4B91] transition-all"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block font-display font-bold text-xs uppercase tracking-wider text-mem-dark mb-1.5"
                >
                  Kata Sandi
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-gray-400 pointer-events-none">
                    <Lock size={18} />
                  </span>
                  <input
                    id="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border-2 border-mem-dark rounded-lg text-sm text-mem-dark font-body shadow-[2px_2px_0px_#121215] focus:outline-none focus:border-mem-pink focus:shadow-[3px_3px_0px_#FF4B91] transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 bg-mem-yellow hover:bg-mem-yellow-light text-mem-dark font-display font-black text-sm uppercase tracking-wider border-2 border-mem-dark rounded-lg shadow-mem-sm hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Sparkles size={18} className="animate-spin" />
                    <span>Memverifikasi Akun...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk Sekarang</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t-2 border-dashed border-gray-200 text-center text-xs sm:text-sm text-gray-600">
              <span>Belum memiliki akun Convena? </span>
              <Link
                to="/register"
                className="text-mem-pink font-display font-extrabold hover:underline ml-1"
              >
                Daftar di sini
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
