import React from 'react'

export interface CardProps {
  children: React.ReactNode
  headerColor?: 'yellow' | 'pink' | 'cyan' | 'purple' | 'mint' | 'none' | 'dark'
  headerTitle?: string
  headerAction?: React.ReactNode
  hoverable?: boolean
  compact?: boolean
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
}

export const Card: React.FC<CardProps> = ({
  children,
  headerColor = 'none',
  headerTitle,
  headerAction,
  hoverable = true,
  compact = false,
  className = '',
  style,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      style={style}
      className={`bg-[#202020] border border-[#3D3D3D]/60 rounded-xl overflow-hidden transition-all duration-200 ${
        onClick ? 'cursor-pointer' : 'cursor-default'
      } ${
        hoverable ? 'hover:border-[#CFFE06]/40 hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)]' : ''
      } ${className}`.trim()}
    >
      {headerColor !== 'none' && (
        <div
          className={`border-b border-[#3D3D3D]/60 bg-[#151515] flex items-center justify-between font-['Montserrat',sans-serif] ${
            compact ? 'py-2.5 px-4' : 'py-3 px-5'
          }`}
        >
          {headerTitle && (
            <h4 className={`m-0 font-bold tracking-tight text-white flex items-center gap-2 ${compact ? '!text-xs sm:!text-sm' : 'text-sm'}`}>
              <span className={`${compact ? 'w-1.5 h-1.5' : 'w-2 h-2'} rounded-full bg-[#CFFE06]`} />
              {headerTitle}
            </h4>
          )}
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className={compact ? 'p-3.5' : 'p-5'}>{children}</div>
    </div>
  )
}
