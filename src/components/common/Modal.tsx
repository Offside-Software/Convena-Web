import React, { useEffect } from 'react'
import { X } from 'lucide-react'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  headerColor?: 'yellow' | 'pink' | 'cyan' | 'purple' | 'mint'
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
  maxWidth = '540px',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const getHeaderBg = (): string => {
    switch (headerColor) {
      case 'pink':
        return 'var(--mem-pink)'
      case 'cyan':
        return 'var(--mem-cyan)'
      case 'purple':
        return 'var(--mem-purple)'
      case 'mint':
        return 'var(--mem-mint)'
      case 'yellow':
      default:
        return 'var(--mem-yellow)'
    }
  }

  const isLight = headerColor === 'yellow' || headerColor === 'cyan' || headerColor === 'mint'

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        backgroundColor: 'rgba(18, 18, 21, 0.65)',
        backdropFilter: 'blur(3px)',
      }}
      onClick={onClose}
    >
      <div
        className="memphis-box"
        style={{
          width: '100%',
          maxWidth,
          backgroundColor: '#FFFFFF',
          border: 'var(--mem-border-thick)',
          boxShadow: '8px 8px 0px var(--mem-dark)',
          overflow: 'hidden',
          animation: 'memphis-pulse-scale 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            backgroundColor: getHeaderBg(),
            borderBottom: 'var(--mem-border)',
            padding: '0.85rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: isLight ? 'var(--mem-dark)' : '#FFFFFF',
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: '1.25rem',
              fontWeight: 800,
              color: isLight ? 'var(--mem-dark)' : '#FFFFFF',
            }}
          >
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background: '#FFFFFF',
              border: '2px solid var(--mem-dark)',
              boxShadow: '2px 2px 0px var(--mem-dark)',
              cursor: 'pointer',
              display: 'inline-flex',
              padding: '4px',
              borderRadius: '4px',
              color: 'var(--mem-dark)',
            }}
          >
            <X size={18} strokeWidth={3} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', maxHeight: '70vh', overflowY: 'auto' }}>{children}</div>

        {/* Modal Footer */}
        {footer && (
          <div
            style={{
              padding: '1rem 1.5rem',
              borderTop: '2px dashed var(--mem-dark)',
              backgroundColor: 'var(--mem-bg)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem',
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
