import React, { useState, useRef, useEffect, useId } from 'react'
import { ChevronDown, Check, Search, X } from 'lucide-react'

export interface SelectOption<T = string> {
  label: string
  value: T
  description?: string
  icon?: React.ReactNode
  badge?: string
  disabled?: boolean
}

export interface SelectProps<T = string> {
  value?: T
  onChange?: (value: T, option?: SelectOption<T>) => void
  options: SelectOption<T>[]
  label?: string
  placeholder?: string
  error?: string
  helperText?: string
  disabled?: boolean
  fullWidth?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'surface' | 'dark'
  icon?: React.ReactNode
  searchable?: boolean
  searchPlaceholder?: string
  className?: string
  triggerClassName?: string
  menuClassName?: string
  id?: string
  name?: string
  'aria-label'?: string
}

export function Select<T extends string = string>({
  value,
  onChange,
  options,
  label,
  placeholder = 'Pilih...',
  error,
  helperText,
  disabled = false,
  fullWidth = true,
  size = 'md',
  variant = 'default',
  icon,
  searchable = false,
  searchPlaceholder = 'Cari pilihan...',
  className = '',
  triggerClassName = '',
  menuClassName = '',
  id,
  name,
  'aria-label': ariaLabel,
}: SelectProps<T>) {
  const generatedId = useId()
  const selectId = id || generatedId
  const containerRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(-1)

  // Find currently selected option
  const selectedOption = options.find((opt) => opt.value === value)

  // Filter options if searchable
  const filteredOptions = searchable && searchQuery
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (opt.description && opt.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : options

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setSearchQuery('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return

    if (e.key === 'Enter' || e.key === ' ') {
      if (!isOpen) {
        e.preventDefault()
        setIsOpen(true)
      } else if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
        e.preventDefault()
        const opt = filteredOptions[highlightedIndex]
        if (!opt.disabled) {
          handleSelect(opt)
        }
      }
    } else if (e.key === 'Escape') {
      if (isOpen) {
        e.preventDefault()
        setIsOpen(false)
        setSearchQuery('')
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!isOpen) {
        setIsOpen(true)
      } else {
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        )
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (!isOpen) {
        setIsOpen(true)
      } else {
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        )
      }
    }
  }

  const handleSelect = (option: SelectOption<T>) => {
    if (option.disabled) return

    if (onChange) {
      // Support both (val) => ... and (e) => e.target.value signature
      const hybrid: any = Object.assign(String(option.value), {
        target: { value: option.value, name: name || '' },
        currentTarget: { value: option.value, name: name || '' },
        value: option.value,
        valueOf: () => option.value,
        toString: () => String(option.value),
      })
      onChange(hybrid, option)
    }
    setIsOpen(false)
    setSearchQuery('')
  }

  // Variant styling
  const variantStyles = {
    default: 'bg-[#202020] border-[#3D3D3D] hover:border-[#505050]',
    surface: 'bg-[#151515] border-[#2A2A2A] hover:border-[#3D3D3D]',
    dark: 'bg-[#111111] border-[#222222] hover:border-[#333333]',
  }

  // Size styling
  const sizeStyles = {
    sm: 'py-1.5 px-3 text-xs rounded-lg min-h-[34px]',
    md: 'py-2.5 px-3.5 text-sm rounded-xl min-h-[42px]',
    lg: 'py-3.5 px-4 text-base rounded-xl min-h-[50px]',
  }

  return (
    <div
      ref={containerRef}
      className={`relative font-['Montserrat',sans-serif] ${fullWidth ? 'w-full' : 'w-auto'} ${className}`}
      onKeyDown={handleKeyDown}
    >
      {label && (
        <label
          htmlFor={selectId}
          className="block font-semibold text-xs tracking-wide text-[#9C9C9C] mb-1.5 cursor-pointer"
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
        >
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        id={selectId}
        name={name}
        aria-label={ariaLabel || label || placeholder}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-2.5 border transition-all duration-200 outline-none text-left cursor-pointer ${
          variantStyles[variant]
        } ${sizeStyles[size]} ${
          isOpen
            ? '!border-[#CFFE06] shadow-[0_0_12px_rgba(207,254,6,0.2)]'
            : ''
        } ${
          error
            ? '!border-[#DF00D0] focus:ring-1 focus:ring-[#DF00D0]'
            : 'focus:border-[#CFFE06] focus:ring-1 focus:ring-[#CFFE06]/30'
        } ${
          disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
        } ${triggerClassName}`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {icon && (
            <span className="text-[#9C9C9C] shrink-0 flex items-center justify-center">
              {icon}
            </span>
          )}
          {selectedOption?.icon && (
            <span className="shrink-0 flex items-center justify-center text-[#CFFE06]">
              {selectedOption.icon}
            </span>
          )}
          <span
            className={`truncate font-medium ${
              selectedOption ? 'text-white' : 'text-[#9C9C9C]/70'
            }`}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.badge && (
            <span className="text-[10px] bg-[#CFFE06]/15 text-[#CFFE06] px-1.5 py-0.5 rounded font-bold shrink-0">
              {selectedOption.badge}
            </span>
          )}
        </div>

        <ChevronDown
          size={16}
          className={`text-[#9C9C9C] shrink-0 transition-transform duration-200 ease-in-out ${
            isOpen ? 'rotate-180 text-[#CFFE06]' : ''
          }`}
        />
      </button>

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          tabIndex={-1}
          className={`absolute left-0 right-0 top-full mt-1.5 z-50 bg-[#161616] border border-[#333333] rounded-xl shadow-[0_12px_36px_rgba(0,0,0,0.85)] p-1.5 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100 ${menuClassName}`}
        >
          {searchable && (
            <div className="p-1 mb-1 border-b border-[#262626]">
              <div className="flex items-center gap-2 px-2.5 py-1.5 bg-[#1F1F1F] rounded-lg border border-[#333333] focus-within:border-[#CFFE06]">
                <Search size={14} className="text-[#9C9C9C] shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setHighlightedIndex(0)
                  }}
                  placeholder={searchPlaceholder}
                  className="w-full bg-transparent border-none outline-none text-xs text-white placeholder:text-[#9C9C9C]/60"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-[#9C9C9C] hover:text-white"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="max-h-56 overflow-y-auto space-y-0.5 pr-0.5 custom-scrollbar">
            {filteredOptions.length === 0 ? (
              <div className="py-6 px-3 text-center text-xs text-[#9C9C9C]">
                Tidak ada pilihan yang cocok
              </div>
            ) : (
              filteredOptions.map((opt, idx) => {
                const isSelected = opt.value === value
                const isHighlighted = idx === highlightedIndex

                return (
                  <div
                    key={String(opt.value)}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(opt)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`flex items-center justify-between gap-2.5 px-3 py-2 rounded-lg text-xs cursor-pointer transition-colors ${
                      opt.disabled
                        ? 'opacity-40 cursor-not-allowed pointer-events-none'
                        : isSelected
                        ? 'bg-[#CFFE06]/15 text-[#CFFE06] font-semibold'
                        : isHighlighted
                        ? 'bg-[#222222] text-white'
                        : 'text-[#CCCCCC] hover:bg-[#1E1E1E] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {opt.icon && (
                        <span className="shrink-0 text-[#9C9C9C]">
                          {opt.icon}
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium">{opt.label}</div>
                        {opt.description && (
                          <div className="text-[10px] text-[#888888] truncate mt-0.5">
                            {opt.description}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {opt.badge && (
                        <span className="text-[10px] bg-[#222222] text-[#9C9C9C] px-1.5 py-0.5 rounded font-mono">
                          {opt.badge}
                        </span>
                      )}
                      {isSelected && (
                        <Check size={14} className="text-[#CFFE06] stroke-[2.5]" />
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {error ? (
        <span className="block text-[#DF00D0] text-xs font-medium mt-1.5">
          {error}
        </span>
      ) : helperText ? (
        <span className="block text-[#9C9C9C] text-xs mt-1">
          {helperText}
        </span>
      ) : null}
    </div>
  )
}

// Export Dropdown as an alias for Select
export const Dropdown = Select
