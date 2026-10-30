import React from 'react'

export interface BadgeProps {
  children: React.ReactNode
  variant?: 'accent' | 'verified' | 'yellow' | 'pink' | 'cyan' | 'purple' | 'mint' | 'dark' | 'outline' | 'coral' | 'grey'
  tilt?: 'none' | 'left' | 'right'
  icon?: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'accent',
  icon,
  className = '',
  style,
}) => {
  const variantClasses: Record<string, string> = {
    accent: 'bg-[#CFFE06]/15 text-[#CFFE06] border border-[#CFFE06]/30',
    verified: 'bg-[#CFFE06]/15 text-[#CFFE06] border border-[#CFFE06]/30',
    yellow: 'bg-[#CFFE06]/15 text-[#CFFE06] border border-[#CFFE06]/30',
    cyan: 'bg-[#CFFE06]/15 text-[#CFFE06] border border-[#CFFE06]/30',
    mint: 'bg-[#CFFE06]/15 text-[#CFFE06] border border-[#CFFE06]/30',
    pink: 'bg-[#DF00D0]/15 text-[#DF00D0] border border-[#DF00D0]/30',
    purple: 'bg-[#DF00D0]/15 text-[#DF00D0] border border-[#DF00D0]/30',
    coral: 'bg-[#DF00D0]/15 text-[#DF00D0] border border-[#DF00D0]/30',
    dark: 'bg-[#151515] text-[#9C9C9C] border border-[#3D3D3D]',
    grey: 'bg-[#3D3D3D]/40 text-[#9C9C9C] border border-[#3D3D3D]',
    outline: 'bg-transparent text-white border border-[#3D3D3D]',
  }

  return (
    <span
      style={style}
      className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full font-['Montserrat',sans-serif] font-bold text-xs select-none ${
        variantClasses[variant] || variantClasses.accent
      } ${className}`.trim()}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  )
}
