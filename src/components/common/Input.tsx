import React from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  icon?: React.ReactNode
  fullWidth?: boolean
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  icon,
  fullWidth = true,
  className = '',
  style = {},
  id,
  ...props
}) => {
  const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined)

  return (
    <div style={{ width: fullWidth ? '100%' : 'auto', marginBottom: '1rem' }} className={className}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            display: 'block',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '0.875rem',
            marginBottom: '0.35rem',
            color: 'var(--mem-dark)',
          }}
        >
          {label}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {icon && (
          <span
            style={{
              position: 'absolute',
              left: '0.75rem',
              color: 'var(--mem-gray-500)',
              pointerEvents: 'none',
              display: 'inline-flex',
            }}
          >
            {icon}
          </span>
        )}
        <input
          id={inputId}
          style={{
            paddingLeft: icon ? '2.5rem' : '0.85rem',
            borderColor: error ? 'var(--mem-pink)' : undefined,
            boxShadow: error ? '2px 2px 0px var(--mem-pink)' : undefined,
            ...style,
          }}
          {...props}
        />
      </div>
      {error ? (
        <span
          style={{
            display: 'block',
            color: 'var(--mem-pink)',
            fontSize: '0.8rem',
            fontWeight: 700,
            marginTop: '0.25rem',
          }}
        >
          {error}
        </span>
      ) : helperText ? (
        <span
          style={{
            display: 'block',
            color: 'var(--mem-gray-500)',
            fontSize: '0.8rem',
            marginTop: '0.25rem',
          }}
        >
          {helperText}
        </span>
      ) : null}
    </div>
  )
}
