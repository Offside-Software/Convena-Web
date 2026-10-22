import React from 'react'

export interface CardProps {
  children: React.ReactNode
  headerColor?: 'yellow' | 'pink' | 'cyan' | 'purple' | 'mint' | 'none'
  headerTitle?: string
  headerAction?: React.ReactNode
  hoverable?: boolean
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
}

export const Card: React.FC<CardProps> = ({
  children,
  headerColor = 'none',
  headerTitle,
  headerAction,
  hoverable = true,
  className = '',
  style = {},
  onClick,
}) => {
  const getHeaderColor = (): string => {
    switch (headerColor) {
      case 'yellow':
        return 'var(--mem-yellow)'
      case 'pink':
        return 'var(--mem-pink)'
      case 'cyan':
        return 'var(--mem-cyan)'
      case 'purple':
        return 'var(--mem-purple)'
      case 'mint':
        return 'var(--mem-mint)'
      default:
        return 'transparent'
    }
  }

  const isLightHeader = headerColor === 'yellow' || headerColor === 'cyan' || headerColor === 'mint'

  return (
    <div
      className={`${hoverable ? 'memphis-card' : 'memphis-box'} ${className}`.trim()}
      onClick={onClick}
      style={{
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      {headerColor !== 'none' && (
        <div
          style={{
            backgroundColor: getHeaderColor(),
            borderBottom: 'var(--mem-border)',
            padding: '0.65rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: isLightHeader ? 'var(--mem-dark)' : '#FFFFFF',
          }}
        >
          {headerTitle && (
            <h4
              style={{
                margin: 0,
                fontSize: '0.95rem',
                fontWeight: 800,
                color: isLightHeader ? 'var(--mem-dark)' : '#FFFFFF',
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
              }}
            >
              {headerTitle}
            </h4>
          )}
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div style={{ padding: '1.25rem' }}>{children}</div>
    </div>
  )
}
