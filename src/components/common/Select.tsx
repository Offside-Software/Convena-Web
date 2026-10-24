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
  style,
  id,
  ...props
}) => {
  const selectId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined)

  return (
    <div className={`mb-4 ${fullWidth ? 'w-full' : 'w-auto'} ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="block font-['Space_Grotesk',sans-serif] font-bold text-xs uppercase tracking-wider text-[#121215] mb-1.5"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        style={style}
        className={`w-full py-2.5 px-3.5 bg-white border-2 rounded-xl text-sm font-medium text-[#121215] cursor-pointer shadow-[2px_2px_0px_0px_#121215] focus:outline-none focus:border-[#01CDFE] focus:shadow-[3px_3px_0px_0px_#01CDFE] transition-all ${
          error ? 'border-[#FF4B91] shadow-[2px_2px_0px_0px_#FF4B91]' : 'border-[#121215]'
        }`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <span className="block text-[#FF4B91] text-xs font-bold mt-1">
          {error}
        </span>
      )}
    </div>
  )
}
