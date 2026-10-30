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
  style,
  id,
  ...props
}) => {
  const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined)

  return (
    <div className={`mb-4 ${fullWidth ? 'w-full' : 'w-auto'} ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block font-['Montserrat',sans-serif] font-semibold text-xs tracking-wide text-[#9C9C9C] mb-1.5"
        >
          {label}
        </label>
      )}
      <div
        className={`flex items-center w-full bg-[#202020] border rounded-xl transition-all duration-200 ${
          error
            ? 'border-[#DF00D0] focus-within:border-[#DF00D0] focus-within:ring-1 focus-within:ring-[#DF00D0]'
            : 'border-[#3D3D3D] focus-within:border-[#CFFE06] focus-within:ring-1 focus-within:ring-[#CFFE06]/40'
        }`}
      >
        {icon && (
          <span className="pl-3.5 pr-2 text-[#9C9C9C] select-none shrink-0 flex items-center justify-center">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          style={style}
          className={`w-full py-2.5 pr-3.5 bg-transparent border-none outline-none text-sm font-medium text-white placeholder:text-[#9C9C9C]/60 ${
            !icon ? 'pl-3.5' : ''
          }`}
          {...props}
        />
      </div>
      {error ? (
        <span className="block text-[#DF00D0] text-xs font-medium mt-1.5">
          {error}
        </span>
      ) : helperText ? (
        <span className="block text-[#9C9C9C] text-xs mt-1.5">
          {helperText}
        </span>
      ) : null}
    </div>
  )
}
