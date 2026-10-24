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
  style,
  disabled,
  ...props
}) => {
  const variantClasses: Record<string, string> = {
    yellow: 'bg-[#FFE600] text-[#121215] hover:bg-[#FFF585]',
    pink: 'bg-[#FF4B91] text-white hover:bg-[#FF94BE]',
    cyan: 'bg-[#01CDFE] text-[#121215] hover:bg-[#70E7FF]',
    purple: 'bg-[#845EC2] text-white hover:bg-[#BD93F9]',
    mint: 'bg-[#00F5D4] text-[#121215] hover:bg-[#70E7FF]',
    dark: 'bg-[#121215] text-white shadow-[4px_4px_0px_0px_#FFE600]',
    outline: 'bg-transparent text-[#121215] border-2 border-[#121215]',
    ghost: 'bg-transparent text-[#121215] border-2 border-dashed border-[#121215] shadow-none',
  }

  const sizeClasses: Record<string, string> = {
    sm: 'py-1.5 px-3 text-xs',
    md: 'py-2.5 px-5 text-sm',
    lg: 'py-3.5 px-7 text-base',
  }

  return (
    <button
      disabled={disabled}
      style={style}
      className={`inline-flex items-center justify-center gap-2 font-['Space_Grotesk',sans-serif] font-black uppercase tracking-wider rounded-lg border-2 border-[#121215] shadow-[3px_3px_0px_0px_#121215] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0px_0px_#121215] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed select-none ${
        fullWidth ? 'w-full' : 'w-auto'
      } ${variantClasses[variant] || variantClasses.yellow} ${sizeClasses[size] || sizeClasses.md} ${className}`.trim()}
      {...props}
    >
      {icon && iconPosition === 'left' && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === 'right' && <span className="inline-flex shrink-0">{icon}</span>}
    </button>
  )
}
