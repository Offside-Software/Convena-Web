import React from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'yellow' | 'pink' | 'cyan' | 'purple' | 'mint' | 'dark' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'yellow',
  size = 'md',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  style = {},
  disabled,
  ...props
}) => {
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'yellow':
        return {
          backgroundColor: 'var(--mem-yellow)',
          color: 'var(--mem-dark)',
        }
      case 'pink':
        return {
          backgroundColor: 'var(--mem-pink)',
          color: '#FFFFFF',
        }
      case 'cyan':
        return {
          backgroundColor: 'var(--mem-cyan)',
          color: 'var(--mem-dark)',
        }
      case 'purple':
        return {
          backgroundColor: 'var(--mem-purple)',
          color: '#FFFFFF',
        }
      case 'mint':
        return {
          backgroundColor: 'var(--mem-mint)',
          color: 'var(--mem-dark)',
        }
      case 'dark':
        return {
          backgroundColor: 'var(--mem-dark)',
          color: '#FFFFFF',
          boxShadow: '4px 4px 0px var(--mem-yellow)',
        }
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: 'var(--mem-dark)',
          border: 'var(--mem-border)',
        }
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: 'var(--mem-dark)',
          border: '2px dashed var(--mem-dark)',
          boxShadow: 'none',
        }
    }
  }

  const getSizeStyles = (): React.CSSProperties => {
    switch (size) {
      case 'sm':
        return {
          padding: '0.35rem 0.75rem',
          fontSize: '0.825rem',
        }
      case 'lg':
        return {
          padding: '0.9rem 1.75rem',
          fontSize: '1.1rem',
        }
      case 'md':
      default:
        return {
          padding: '0.6rem 1.25rem',
          fontSize: '0.95rem',
        }
    }
  }

  return (
    <button
      className={`memphis-btn ${className}`}
      disabled={disabled}
      style={{
        ...getVariantStyles(),
        ...getSizeStyles(),
        width: fullWidth ? '100%' : 'auto',
        ...style,
      }}
      {...props}
    >
      {icon && iconPosition === 'left' && <span style={{ display: 'inline-flex' }}>{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === 'right' && <span style={{ display: 'inline-flex' }}>{icon}</span>}
    </button>
  )
}
