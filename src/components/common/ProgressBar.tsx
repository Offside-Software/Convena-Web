import React from 'react'

export interface ProgressBarProps {
  value: number // current value
  max?: number // max value, default 100
  label?: string
  color?: 'yellow' | 'pink' | 'cyan' | 'purple' | 'mint'
  striped?: boolean
  showPercentage?: boolean
  height?: number
  className?: string
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  color = 'yellow',
  striped = false,
  showPercentage = true,
  height = 18,
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)))

  const getColor = (): string => {
    switch (color) {
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

  return (
    <div style={{ width: '100%', marginBottom: '0.5rem' }} className={className}>
      {(label || showPercentage) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.825rem',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            marginBottom: '0.25rem',
          }}
        >
          {label && <span>{label}</span>}
          {showPercentage && <span>{percentage}%</span>}
        </div>
      )}
      <div
        style={{
          width: '100%',
          height: `${height}px`,
          backgroundColor: '#FFFFFF',
          border: 'var(--mem-border-sm)',
          borderRadius: 'var(--mem-radius-sm)',
          overflow: 'hidden',
          boxShadow: '2px 2px 0px var(--mem-dark)',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: '100%',
            backgroundColor: getColor(),
            backgroundImage: striped
              ? `repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(18, 18, 21, 0.15) 8px, rgba(18, 18, 21, 0.15) 16px)`
              : undefined,
            transition: 'width 0.4s ease-out',
            borderRight: percentage > 0 && percentage < 100 ? '2px solid var(--mem-dark)' : undefined,
          }}
        />
      </div>
    </div>
  )
}
