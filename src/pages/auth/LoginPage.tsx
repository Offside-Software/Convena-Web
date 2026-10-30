import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, AlertCircle, Sparkles } from 'lucide-react'
import { authService } from '../../services/auth.service.ts'

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!identifier.trim() || !password.trim()) {
      setErrorMessage('Harap isi username/email dan password')
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

  // Quick Demo Admin auto-fill helper
  const handleQuickDemo = () => {
    setIdentifier('arya@student.itb.ac.id')
    setPassword('admin123')
  }

  return (
    <div className="min-h-[calc(100vh-70px)] w-full flex flex-col justify-between items-center px-4 py-12 relative overflow-hidden bg-[#000000] font-['Montserrat',sans-serif]">
      {/* Centered Login Container */}
      <div className="w-full max-w-[380px] z-10 my-auto">
        {/* Header Title as seen in Image 5 */}
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-0.5">
            Welcome to
          </h2>
          <h1 className="text-4xl sm:text-5xl font-black text-[#CFFE06] tracking-tight leading-tight">
            Convena
          </h1>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className="bg-[#202020] border border-[#DF00D0] text-[#DF00D0] rounded-xl p-3 text-xs font-semibold flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Username / email */}
          <div>
            <label
              htmlFor="identifier"
              className="block font-medium text-xs text-[#9C9C9C] mb-2"
            >
              Username / email
            </label>
            <input
              id="identifier"
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full bg-[#1c1c1c] border border-[#333333] rounded-xl py-3 px-4 text-sm font-medium text-white placeholder:text-[#9C9C9C]/40 outline-none focus:border-[#CFFE06] transition-colors"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block font-medium text-xs text-[#9C9C9C] mb-2"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#1c1c1c] border border-[#333333] rounded-xl py-3 pl-4 pr-11 text-sm font-medium text-white placeholder:text-[#9C9C9C]/40 outline-none focus:border-[#CFFE06] transition-colors"
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

          {/* Forgot password? */}
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={() => alert('Fitur reset password: Hubungi administrator ormawa untuk bantuan verifikasi.')}
              className="text-xs font-semibold text-[#CFFE06] hover:underline bg-transparent border-none p-0 cursor-pointer"
            >
              Forgot password?
            </button>
          </div>

          {/* Rounded Pill Button: Login */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 bg-[#CFFE06] hover:bg-[#bde805] text-[#000000] font-bold text-sm rounded-full transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(207,254,6,0.25)] hover:shadow-[0_0_25px_rgba(207,254,6,0.4)] active:scale-[0.99] flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Sparkles size={16} className="animate-spin text-black" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Login</span>
              )}
            </button>
          </div>

          {/* Register Link */}
          <div className="text-center pt-3 text-xs font-medium">
            <span className="text-[#9C9C9C]">don't have an account yet? </span>
            <Link to="/register" className="text-[#CFFE06] font-semibold hover:underline">
              register here
            </Link>
          </div>

          {/* Demo Auto-fill Helper */}
          <div className="pt-4 text-center">
            <button
              type="button"
              onClick={handleQuickDemo}
              className="text-[11px] text-[#9C9C9C] hover:text-[#CFFE06] bg-[#151515] border border-[#3D3D3D] rounded-full py-1.5 px-3 transition-colors cursor-pointer"
            >
              Demo Admin Auto-Fill (Arya Pratama)
            </button>
          </div>
        </form>
      </div>

      {/* Subtle Purple to Neon-Green Gradient Ambient Glow at Bottom (matching Image 5) */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-[220px] opacity-75 blur-[70px]"
        style={{
          background: 'radial-gradient(ellipse at bottom, #CFFE06 0%, #DF00D0 50%, transparent 80%)',
        }}
      />
    </div>
  )
}
