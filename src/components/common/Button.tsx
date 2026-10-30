import React from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'accent' | 'yellow' | 'pink' | 'cyan' | 'purple' | 'mint' | 'dark' | 'outline' | 'ghost' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'accent',
  size = 'md',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  style,
  disabled,
  ...props
}) => {
  // Cohesive dark theme with #CFFE06 accent and #DF00D0 purple
  const variantClasses: Record<string, string> = {
    accent: 'bg-[#CFFE06] text-[#000000] hover:bg-[#bde805] hover:shadow-[0_0_15px_rgba(207,254,6,0.35)]',
    yellow: 'bg-[#CFFE06] text-[#000000] hover:bg-[#bde805] hover:shadow-[0_0_15px_rgba(207,254,6,0.35)]', // mapped to accent
    cyan: 'bg-[#CFFE06] text-[#000000] hover:bg-[#bde805]', // mapped to accent
    mint: 'bg-[#CFFE06] text-[#000000] hover:bg-[#bde805]', // mapped to accent
    pink: 'bg-[#DF00D0] text-white hover:bg-[#bf00b2] hover:shadow-[0_0_15px_rgba(223,0,208,0.35)]', // mapped to purple
    purple: 'bg-[#DF00D0] text-white hover:bg-[#bf00b2] hover:shadow-[0_0_15px_rgba(223,0,208,0.35)]',
    dark: 'bg-[#151515] text-white border border-[#3D3D3D] hover:bg-[#202020]',
    secondary: 'bg-[#202020] text-white border border-[#3D3D3D] hover:bg-[#3D3D3D] hover:border-[#9C9C9C]',
    outline: 'bg-transparent text-white border border-[#3D3D3D] hover:border-[#CFFE06] hover:text-[#CFFE06]',
    ghost: 'bg-transparent text-[#9C9C9C] hover:text-white hover:bg-[#202020]',
  }

  const sizeClasses: Record<string, string> = {
    sm: 'py-1.5 px-3.5 text-xs',
    md: 'py-2.5 px-6 text-sm',
    lg: 'py-3.5 px-8 text-base',
  }

  return (
    <button
      disabled={disabled}
      style={style}
      className={`inline-flex items-center justify-center gap-2 font-['Montserrat',sans-serif] font-bold rounded-full transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98] ${
        fullWidth ? 'w-full' : 'w-auto'
      } ${variantClasses[variant] || variantClasses.accent} ${sizeClasses[size] || sizeClasses.md} ${className}`.trim()}
      {...props}
    >
      {icon && iconPosition === 'left' && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === 'right' && <span className="inline-flex shrink-0">{icon}</span>}
    </button>
  )
}
