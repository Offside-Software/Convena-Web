import React from 'react'

export interface BadgeProps {
  children: React.ReactNode
  variant?: 'yellow' | 'pink' | 'cyan' | 'purple' | 'mint' | 'dark' | 'outline' | 'coral'
  tilt?: 'none' | 'left' | 'right'
  icon?: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'yellow',
  tilt = 'none',
  icon,
  className = '',
  style = {},
}) => {
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'yellow':
        return { backgroundColor: 'var(--mem-yellow)', color: 'var(--mem-dark)' }
      case 'pink':
        return { backgroundColor: 'var(--mem-pink)', color: '#FFFFFF' }
      case 'cyan':
        return { backgroundColor: 'var(--mem-cyan)', color: 'var(--mem-dark)' }
      case 'purple':
        return { backgroundColor: 'var(--mem-purple)', color: '#FFFFFF' }
      case 'mint':
        return { backgroundColor: 'var(--mem-mint)', color: 'var(--mem-dark)' }
      case 'coral':
        return { backgroundColor: 'var(--mem-coral)', color: '#FFFFFF' }
      case 'dark':
        return { backgroundColor: 'var(--mem-dark)', color: '#FFFFFF' }
      case 'outline':
        return { backgroundColor: '#FFFFFF', color: 'var(--mem-dark)', border: '2px solid var(--mem-dark)' }
    }
  }

  const tiltClass = tilt === 'left' ? 'memphis-tilt-left' : tilt === 'right' ? 'memphis-tilt-right' : ''

  return (
    <span
      className={`memphis-badge ${tiltClass} ${className}`.trim()}
      style={{
        ...getVariantStyles(),
        ...style,
      }}
    >
      {icon && <span>{icon}</span>}
      {children}
    </span>
  )
}
