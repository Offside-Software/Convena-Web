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
          className="block font-['Montserrat',sans-serif] font-semibold text-xs tracking-wide text-[#9C9C9C] mb-1.5"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        style={style}
        className={`w-full py-2.5 px-3.5 bg-[#202020] border rounded-xl text-sm font-medium text-white cursor-pointer transition-all duration-200 focus:outline-none ${
          error
            ? 'border-[#DF00D0] focus:border-[#DF00D0]'
            : 'border-[#3D3D3D] focus:border-[#CFFE06] focus:ring-1 focus:ring-[#CFFE06]/40'
        }`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[#151515] text-white">
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <span className="block text-[#DF00D0] text-xs font-medium mt-1.5">
          {error}
        </span>
      )}
    </div>
  )
}
