import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Lock, Mail, ArrowRight, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'
import { authService } from '../../services/auth.service.ts'
import { Button } from '../../components/common/Button.tsx'

export const LoginPage: React.FC = () => {
    const navigate = useNavigate()
    const [identifier, setIdentifier] = useState('arya@student.itb.ac.id')
    const [password, setPassword] = useState('convena2026')
    const [showPassword, setShowPassword] = useState(false)
    const [rememberMe, setRememberMe] = useState(true)
    const [isLoading, setIsLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrorMessage(null)

        try {
            setIsLoading(true)
            await authService.login({ identifier, password })
            navigate('/dashboard')
        } catch (err: unknown) {
            const error = err as { message?: string }
            setErrorMessage(error?.message || 'Gagal masuk. Silakan coba kembali.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-[calc(100vh-140px)] w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#FAF9F6] bg-[radial-gradient(#FFE600_1.5px,transparent_1.5px)] [background-size:24px_24px] relative overflow-hidden">
            {/* Decorative Neo-Brutalist SVGs */}
            <div className="absolute top-12 left-10 pointer-events-none hidden md:block -rotate-12 opacity-80">
                <svg className="w-24 h-12 text-[#FF4B91]" viewBox="0 0 120 40" fill="none" stroke="currentColor">
                    <path d="M5 20 L25 5 L45 35 L65 5 L85 35 L105 20" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>

            <div className="absolute bottom-16 right-12 pointer-events-none hidden md:block rotate-12 opacity-80">
                <svg className="w-16 h-16 text-[#01CDFE]" viewBox="0 0 100 100" fill="currentColor">
                    <circle cx="20" cy="20" r="8" />
                    <circle cx="50" cy="20" r="8" />
                    <circle cx="80" cy="20" r="8" />
                    <circle cx="20" cy="50" r="8" />
                    <circle cx="50" cy="50" r="8" />
                    <circle cx="80" cy="50" r="8" />
                    <circle cx="20" cy="80" r="8" />
                    <circle cx="50" cy="80" r="8" />
                    <circle cx="80" cy="80" r="8" />
                </svg>
            </div>

            <div className="grid lg:grid-cols-2 sm:grid-cols-1 items-center space-between lg:gap-12 max-w-[1280px] relative z-10">
                {/* Header Badge & Title */}
                <div className="text-center m-3 items-center">
                    <div className="inline-flex items-center gap-2 bg-[#FFE600] border-2 border-[#121215] rounded-full px-4 py-1 font-['Space_Grotesk',sans-serif] font-black text-xs uppercase tracking-wider text-[#121215] rotate-2 shadow-[2px_2px_0px_0px_#121215] mb-3">
                        <span>Mode Uji Coba Terbuka</span>
                    </div>
                    <h1 className="font-['Space_Grotesk',sans-serif] font-black text-3xl sm:text-4xl text-[#121215] tracking-tight mb-2">
                        Masuk ke Convena
                    </h1>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">
                        Kelola event kampus & organisasi mahasiswa secara terintegrasi
                    </p>
                </div>

                {/* Card Box */}
                <div className="bg-white border-[3px] border-[#121215] m-3 rounded-2xl shadow-[6px_6px_0px_0px_#121215] overflow-hidden">
                    {/* Card Window Bar */}
                    <div className="bg-[#FF4B91] border-b-[3px] border-[#121215] px-6 py-3.5 flex items-center justify-between text-white font-['Space_Grotesk',sans-serif] font-black text-sm tracking-wider uppercase">
                        <span className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 bg-white rounded-full inline-block" />
                            DEMO TEST ACCESS
                        </span>
                        <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full bg-[#FFE600] border border-[#121215]" />
                            <span className="w-3 h-3 rounded-full bg-[#01CDFE] border border-[#121215]" />
                            <span className="w-3 h-3 rounded-full bg-white border border-[#121215]" />
                        </div>
                    </div>

                    <div className="p-6 sm:p-7">
                        {/* Notice for Lecturer Test */}
                        <div className="p-4 bg-[#FFF585] border-2 border-[#121215] rounded-xl shadow-[3px_3px_0px_0px_#121215] mb-5">
                            <div className="flex items-center gap-2 font-['Space_Grotesk',sans-serif] font-black text-xs text-[#121215] mb-1">
                                <CheckCircle size={16} className="text-[#008775]" />
                                AKUN ADMIN TERHUBUNG (OFFLINE MODE)
                            </div>
                            <p className="text-xs text-gray-700 m-0 leading-relaxed mb-3">
                                Autentikasi API dilewati untuk kemudahan uji coba. Anda dapat langsung membuka dashboard dengan data panitia dummy.
                            </p>
                            <Button
                                variant="pink"
                                size="sm"
                                fullWidth
                                icon={<ArrowRight size={16} />}
                                onClick={() => navigate('/dashboard')}
                            >
                                Langsung Masuk ke Dashboard Panitia
                            </Button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {errorMessage && (
                                <div className="bg-pink-50 border-2 border-[#FF4B91] text-[#FF4B91] rounded-xl p-3.5 text-xs sm:text-sm font-bold shadow-[3px_3px_0px_0px_#FF4B91] flex items-center gap-2.5">
                                    <AlertCircle size={18} className="shrink-0" />
                                    <span>{errorMessage}</span>
                                </div>
                            )}

                            <div>
                                <label
                                    htmlFor="identifier"
                                    className="block font-['Space_Grotesk',sans-serif] font-bold text-xs uppercase tracking-wider text-[#121215] mb-2"
                                >
                                    Username atau Email
                                </label>
                                <div className="flex items-center w-full bg-white border-2 border-[#121215] rounded-xl shadow-[3px_3px_0px_0px_#121215] focus-within:border-[#FF4B91] focus-within:shadow-[4px_4px_0px_0px_#FF4B91] transition-all">
                                    <span className="pl-3.5 pr-2.5 text-gray-400 shrink-0 select-none">
                                        <Mail size={18} />
                                    </span>
                                    <input
                                        id="identifier"
                                        type="text"
                                        required
                                        placeholder="nama@kampus.ac.id atau username"
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                        className="!border-none !shadow-none !bg-transparent w-full py-3 pr-4 text-sm font-medium text-[#121215] placeholder:text-gray-400 !outline-none focus:!ring-0"
                                    />
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="password"
                                    className="block font-['Space_Grotesk',sans-serif] font-bold text-xs uppercase tracking-wider text-[#121215] mb-2"
                                >
                                    Kata Sandi
                                </label>
                                <div className="flex items-center w-full bg-white border-2 border-[#121215] rounded-xl shadow-[3px_3px_0px_0px_#121215] focus-within:border-[#FF4B91] focus-within:shadow-[4px_4px_0px_0px_#FF4B91] transition-all">
                                    <span className="pl-3.5 pr-2.5 text-gray-400 shrink-0 select-none">
                                        <Lock size={18} />
                                    </span>
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        placeholder="••••••••"
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

                            <div className="flex items-center justify-between text-xs pt-1">
                                <label className="flex items-center gap-2.5 cursor-pointer font-medium text-gray-700 select-none">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="!w-4 !h-4 rounded border-2 border-[#121215] accent-[#FF4B91] cursor-pointer shrink-0 !shadow-none"
                                    />
                                    <span>Ingat saya di perangkat ini</span>
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-2.5 bg-[#FFE600] hover:bg-[#FFE600]/90 text-[#121215] font-['Space_Grotesk',sans-serif] font-black text-sm py-3 px-6 rounded-xl border-2 border-[#121215] shadow-[4px_4px_0px_0px_#121215] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0px_0px_#121215] transition-all cursor-pointer disabled:opacity-50"
                            >
                                <span>{isLoading ? 'Memproses...' : 'Masuk Sekarang'}</span>
                                <ArrowRight size={18} />
                            </button>
                        </form>

                        <div className="text-center mt-6 pt-5 border-t-2 border-dashed border-gray-200">
                            <span className="text-xs text-gray-500 font-medium">Belum memiliki akun ormawa? </span>
                            <Link to="/register" className="text-xs font-bold text-[#FF4B91] hover:underline">
                                Daftar Baru
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
