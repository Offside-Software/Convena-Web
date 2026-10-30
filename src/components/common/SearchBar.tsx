import React from 'react'
import { Search, X } from 'lucide-react'
import { Button, type ButtonProps } from './Button.tsx'

export interface SearchBarProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onSubmit' | 'size'> {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSubmit?: (e?: React.FormEvent) => void
  showSubmitButton?: boolean
  submitLabel?: string
  submitLoading?: boolean
  submitDisabled?: boolean
  submitVariant?: ButtonProps['variant']
  submitSize?: ButtonProps['size']
  submitIcon?: React.ReactNode
  submitButtonClassName?: string
  icon?: React.ReactNode
  clearable?: boolean
  onClear?: () => void
  containerClassName?: string
  inputContainerClassName?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'dark' | 'grey' | 'surface'
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onSubmit,
  showSubmitButton = false,
  submitLabel = 'Cari',
  submitLoading = false,
  submitDisabled = false,
  submitVariant = 'accent',
  submitSize,
  submitIcon,
  submitButtonClassName = '',
  icon,
  clearable = false,
  onClear,
  containerClassName = '',
  inputContainerClassName = '',
  size = 'md',
  variant = 'dark',
  placeholder = 'Cari...',
  disabled,
  style,
  ...inputProps
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onSubmit) {
      onSubmit(e)
    }
  }

  const handleClear = () => {
    if (onClear) {
      onClear()
    } else {
      // Simulate synthetic change event with empty string
      const syntheticEvent = {
        target: { value: '' },
      } as React.ChangeEvent<HTMLInputElement>
      onChange(syntheticEvent)
    }
  }

  const variantClasses = {
    dark: 'bg-[#202020] border-[#3D3D3D]',
    grey: 'bg-[#3D3D3D] border-[#3D3D3D]',
    surface: 'bg-[#151515] border-[#3D3D3D]',
  }

  const sizeClasses = {
    sm: 'py-1.5 px-3.5 text-xs',
    md: 'py-2 px-4 text-sm',
    lg: 'py-3 px-5 text-base',
  }

  const iconSizes = {
    sm: 15,
    md: 18,
    lg: 20,
  }

  return (
    <form onSubmit={handleSubmit} className={`w-full ${containerClassName}`.trim()}>
      <div className="flex flex-col sm:flex-row items-stretch gap-2.5 w-full">
        {/* Search Input Container */}
        <div
          className={`grow flex items-center gap-3 border rounded-xl transition-all duration-200 focus-within:border-[#CFFE06] focus-within:ring-1 focus-within:ring-[#CFFE06]/30 ${
            variantClasses[variant]
          } ${sizeClasses[size]} ${inputContainerClassName}`.trim()}
        >
          {icon || <Search size={iconSizes[size]} className="text-[#9C9C9C] shrink-0" />}
          <input
            type="text"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            data-search-input="true"
            className="search-bar-input w-full bg-transparent !border-0 !border-none !outline-none !shadow-none !rounded-none !ring-0 text-white placeholder:text-[#9C9C9C]/60 focus:!outline-none focus:!ring-0 focus:!shadow-none focus:!border-none"
            style={{
              border: 'none',
              outline: 'none',
              boxShadow: 'none',
              backgroundColor: 'transparent',
              paddingLeft: 0,
              paddingRight: 0,
              ...style,
            }}
            {...inputProps}
          />
          {clearable && value && (
            <button
              type="button"
              onClick={handleClear}
              className="text-[#9C9C9C] hover:text-white p-1 rounded-full cursor-pointer bg-transparent border-none transition-colors shrink-0"
              aria-label="Bersihkan pencarian"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Optional Right Submit Button */}
        {showSubmitButton && (
          <div className={`shrink-0 ${submitButtonClassName || 'min-w-[140px] sm:min-w-[160px]'}`.trim()}>
            <Button
              type="submit"
              variant={submitVariant}
              size={submitSize || size}
              fullWidth
              disabled={submitDisabled || submitLoading || disabled}
              icon={submitIcon}
            >
              {submitLabel}
            </Button>
          </div>
        )}
      </div>
    </form>
  )
}

