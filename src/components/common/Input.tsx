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
          className="block font-['Space_Grotesk',sans-serif] font-bold text-xs uppercase tracking-wider text-[#121215] mb-1.5"
        >
          {label}
        </label>
      )}
      <div
        className={`flex items-center w-full bg-white border-2 rounded-xl transition-all ${
          error
            ? 'border-[#FF4B91] shadow-[2px_2px_0px_0px_#FF4B91]'
            : 'border-[#121215] shadow-[2px_2px_0px_0px_#121215] focus-within:border-[#FF4B91] focus-within:shadow-[3px_3px_0px_0px_#FF4B91]'
        }`}
      >
        {icon && (
          <span className="pl-3.5 pr-2.5 text-gray-400 select-none shrink-0 flex items-center justify-center">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          style={style}
          className={`w-full py-2.5 pr-3.5 bg-transparent !border-none !shadow-none !outline-none text-sm font-medium text-[#121215] placeholder:text-gray-400 ${
            !icon ? 'pl-3.5' : ''
          }`}
          {...props}
        />
      </div>
      {error ? (
        <span className="block text-[#FF4B91] text-xs font-bold mt-1">
          {error}
        </span>
      ) : helperText ? (
        <span className="block text-gray-500 text-xs mt-1">
          {helperText}
        </span>
      ) : null}
    </div>
  )
}
