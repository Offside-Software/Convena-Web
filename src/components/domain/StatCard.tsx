import React from 'react'

export interface StatCardProps {
  title: string
  value: string | number
  change?: string
  isPositive?: boolean
  icon?: React.ReactNode
  accentColor?: 'yellow' | 'pink' | 'cyan' | 'purple' | 'mint'
  subtitle?: string
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  isPositive = true,
  icon,
  accentColor = 'yellow',
  subtitle,
}) => {
  const getAccentBg = (): string => {
    switch (accentColor) {
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

  const isLight = accentColor === 'yellow' || accentColor === 'cyan' || accentColor === 'mint'

  return (
    <div
      className="memphis-box"
      style={{
        padding: '1.25rem',
        backgroundColor: '#FFFFFF',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top right corner decorative accent bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '60px',
          height: '6px',
          backgroundColor: getAccentBg(),
        }}
      />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '0.875rem',
            color: 'var(--mem-gray-500)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          {title}
        </span>
        {icon && (
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: getAccentBg(),
              border: '2px solid var(--mem-dark)',
              boxShadow: '2px 2px 0px var(--mem-dark)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isLight ? 'var(--mem-dark)' : '#FFFFFF',
            }}
          >
            {icon}
          </div>
        )}
      </div>

      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 900,
          fontSize: '1.85rem',
          color: 'var(--mem-dark)',
          lineHeight: 1.1,
          marginBottom: '0.5rem',
        }}
      >
        {value}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 'auto', fontSize: '0.8rem' }}>
        {change && (
          <span
            style={{
              fontWeight: 800,
              padding: '2px 6px',
              borderRadius: '4px',
              backgroundColor: isPositive ? 'rgba(0, 245, 212, 0.2)' : 'rgba(255, 75, 145, 0.2)',
              color: isPositive ? '#008775' : '#D0145A',
              border: `1.5px solid ${isPositive ? '#00C4AA' : '#FF4B91'}`,
            }}
          >
            {change}
          </span>
        )}
        {subtitle && <span style={{ color: 'var(--mem-gray-500)' }}>{subtitle}</span>}
      </div>
    </div>
  )
}
