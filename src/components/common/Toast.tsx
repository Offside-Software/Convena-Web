import React, { useEffect, useRef } from 'react'
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X, RefreshCw } from 'lucide-react'

export type ToastType = 'error' | 'warning' | 'success' | 'info'

export interface ToastAction {
  label: string
  onClick: () => void
  loading?: boolean
  icon?: React.ReactNode
}

export interface ToastProps {
  open: boolean
  onClose: () => void
  title?: string
  message: string
  type?: ToastType
  action?: ToastAction
  autoCloseMs?: number | false
  position?: 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center'
  className?: string
}

export const Toast: React.FC<ToastProps> = ({
  open,
  onClose,
  title,
  message,
  type = 'error',
  action,
  autoCloseMs = 6000,
  position = 'bottom-right',
  className = '',
}) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!open || autoCloseMs === false) return

    timerRef.current = setTimeout(() => {
      onClose()
    }, autoCloseMs)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [open, autoCloseMs, onClose])

  const handleMouseEnter = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
  }

  const handleMouseLeave = () => {
    if (!open || autoCloseMs === false) return
    timerRef.current = setTimeout(() => {
      onClose()
    }, autoCloseMs)
  }

  if (!open) return null

  // Position classes
  const positionClasses = {
    'top-right': 'top-5 right-5 sm:right-6',
    'top-center': 'top-5 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-5 right-5 sm:right-6',
    'bottom-center': 'bottom-5 left-1/2 -translate-x-1/2',
  }[position]

  // Type styling
  const typeConfig = {
    error: {
      border: 'border-[#DF00D0]/60 hover:border-[#DF00D0]',
      iconBg: 'bg-[#DF00D0]/15 text-[#DF00D0] border border-[#DF00D0]/30',
      icon: <AlertCircle size={18} />,
      accentBar: 'bg-[#DF00D0]',
      defaultTitle: 'Terjadi Kesalahan',
    },
    warning: {
      border: 'border-amber-500/60 hover:border-amber-500',
      iconBg: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
      icon: <AlertTriangle size={18} />,
      accentBar: 'bg-amber-500',
      defaultTitle: 'Peringatan',
    },
    success: {
      border: 'border-[#CFFE06]/60 hover:border-[#CFFE06]',
      iconBg: 'bg-[#CFFE06]/15 text-[#CFFE06] border border-[#CFFE06]/30',
      icon: <CheckCircle2 size={18} />,
      accentBar: 'bg-[#CFFE06]',
      defaultTitle: 'Berhasil',
    },
    info: {
      border: 'border-cyan-500/60 hover:border-cyan-500',
      iconBg: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30',
      icon: <Info size={18} />,
      accentBar: 'bg-cyan-500',
      defaultTitle: 'Informasi',
    },
  }[type]

  return (
    <div
      role="alert"
      aria-live="assertive"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`fixed z-[70] max-w-[calc(100vw-2rem)] sm:max-w-md w-full animate-in fade-in slide-in-from-bottom-3 duration-200 ${positionClasses} ${className}`}
    >
      <div
        className={`relative overflow-hidden rounded-2xl bg-[#151515]/95 backdrop-blur-md border ${typeConfig.border} p-4 text-white font-['Montserrat',sans-serif] transition-all`}
      >
        {/* Left Accent indicator line */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-1 ${typeConfig.accentBar}`}
        />

        <div className="flex items-start gap-3 pl-1">
          {/* Status Icon */}
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${typeConfig.iconBg}`}
          >
            {typeConfig.icon}
          </div>

          {/* Text Content */}
          <div className="flex-1 min-w-0 pr-2">
            <h5 className="text-sm font-bold text-white tracking-tight m-0">
              {title || typeConfig.defaultTitle}
            </h5>
            <p className="text-xs text-[#9C9C9C] mt-1 mb-0 leading-relaxed break-words font-medium">
              {message}
            </p>

            {/* Optional Inline Action Button (e.g. Try Again) */}
            {action && (
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  disabled={action.loading}
                  onClick={action.onClick}
                  className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-bold bg-[#CFFE06] text-black hover:bg-[#bde805] hover:shadow-[0_0_12px_rgba(207,254,6,0.3)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none"
                >
                  {action.loading ? (
                    <RefreshCw size={12} className="animate-spin" />
                  ) : (
                    action.icon || <RefreshCw size={12} />
                  )}
                  <span>{action.label}</span>
                </button>
              </div>
            )}
          </div>

          {/* Dismiss button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup notifikasi"
            className="p-1.5 rounded-lg text-[#9C9C9C] hover:text-white hover:bg-[#202020] transition-colors shrink-0 cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}
