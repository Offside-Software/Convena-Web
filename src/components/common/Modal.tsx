import React, { useEffect } from 'react'
import { X } from 'lucide-react'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  headerColor?: 'pink' | 'cyan' | 'purple' | 'mint' | 'yellow'
  footer?: React.ReactNode
  maxWidth?: string
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  headerColor = 'yellow',
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

  const headerBgClasses: Record<string, string> = {
    pink: 'bg-[#FF4B91] text-white',
    cyan: 'bg-[#01CDFE] text-[#121215]',
    purple: 'bg-[#845EC2] text-white',
    mint: 'bg-[#00F5D4] text-[#121215]',
    yellow: 'bg-[#FFE600] text-[#121215]',
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#121215]/65 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className={`w-full ${maxWidth || 'max-w-[540px]'} bg-white border-4 border-[#121215] shadow-[8px_8px_0px_0px_#121215] rounded-2xl overflow-hidden animate-[memphis-pulse-scale_0.2s_cubic-bezier(0.16,1,0.3,1)]`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          className={`border-b-2 border-[#121215] py-3.5 px-5 flex items-center justify-between font-['Space_Grotesk',sans-serif] ${
            headerBgClasses[headerColor] || headerBgClasses.yellow
          }`}
        >
          <h3 className="m-0 text-xl font-black">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="bg-transparent border-none cursor-pointer flex items-center justify-center p-1 rounded-md text-inherit hover:opacity-75 transition-opacity"
            aria-label="Tutup Modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {children}
        </div>

        {/* Optional Footer */}
        {footer && (
          <div className="border-t-2 border-[#121215] py-3.5 px-5 flex justify-end gap-3 bg-gray-50">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
