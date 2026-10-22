import React from 'react'

export interface SelectOption {
  label: string
  value: string
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: SelectOption[]
  error?: string
  fullWidth?: boolean
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  error,
  fullWidth = true,
  className = '',
  style = {},
  id,
  ...props
}) => {
  const selectId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined)

  return (
    <div style={{ width: fullWidth ? '100%' : 'auto', marginBottom: '1rem' }} className={className}>
      {label && (
        <label
          htmlFor={selectId}
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
      <select
        id={selectId}
        style={{
          cursor: 'pointer',
          appearance: 'auto',
          ...style,
        }}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
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
      )}
    </div>
  )
}
