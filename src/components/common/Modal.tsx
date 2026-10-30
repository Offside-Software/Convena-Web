import React, { useEffect } from 'react'
import { X } from 'lucide-react'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  headerColor?: 'pink' | 'cyan' | 'purple' | 'mint' | 'yellow' | 'accent' | 'dark'
  footer?: React.ReactNode
  maxWidth?: string
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    if (isOpen) {
      document.body.classList.add('overflow-hidden')
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.body.classList.remove('overflow-hidden')
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]"
      onClick={onClose}
    >
      <div
        className={`w-full ${maxWidth || 'max-w-[540px]'} bg-[#151515] border border-[#3D3D3D] shadow-2xl rounded-xl overflow-hidden transition-all duration-200`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="border-b border-[#3D3D3D]/70 py-4 px-6 flex items-center justify-between font-['Montserrat',sans-serif] bg-[#202020]">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#CFFE06]" />
            <h3 className="m-0 text-lg font-bold text-white tracking-tight">
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#151515] border border-[#3D3D3D] text-[#9C9C9C] hover:text-[#CFFE06] hover:border-[#CFFE06] transition-colors flex items-center justify-center cursor-pointer"
            aria-label="Tutup Modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto text-white">
          {children}
        </div>

        {/* Optional Footer */}
        {footer && (
          <div className="border-t border-[#3D3D3D]/70 py-4 px-6 flex justify-end gap-3 bg-[#181818]">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
