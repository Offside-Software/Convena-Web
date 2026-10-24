import React from 'react'

export interface BadgeProps {
  children: React.ReactNode
  variant?: 'yellow' | 'pink' | 'cyan' | 'purple' | 'mint' | 'dark' | 'outline' | 'coral'
  tilt?: 'none' | 'left' | 'right'
  icon?: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'yellow',
  tilt = 'none',
  icon,
  className = '',
  style,
}) => {
  const variantClasses: Record<string, string> = {
    yellow: 'bg-[#FFE600] text-[#121215]',
    pink: 'bg-[#FF4B91] text-white',
    cyan: 'bg-[#01CDFE] text-[#121215]',
    purple: 'bg-[#845EC2] text-white',
    mint: 'bg-[#00F5D4] text-[#121215]',
    coral: 'bg-[#FF6F59] text-white',
    dark: 'bg-[#121215] text-white',
    outline: 'bg-white text-[#121215] border-2 border-[#121215]',
  }

  const tiltClasses: Record<string, string> = {
    none: '',
    left: '-rotate-2',
    right: 'rotate-2',
  }

  return (
    <span
      style={style}
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-[#121215] font-['Space_Grotesk',sans-serif] font-bold text-xs uppercase tracking-wider shadow-[1.5px_1.5px_0px_0px_#121215] select-none transition-transform ${variantClasses[variant] || variantClasses.yellow} ${tiltClasses[tilt]} ${className}`.trim()}
    >
      {icon && <span>{icon}</span>}
      {children}
    </span>
  )
}
