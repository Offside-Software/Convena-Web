import React from 'react'

export interface CardProps {
  children: React.ReactNode
  headerColor?: 'yellow' | 'pink' | 'cyan' | 'purple' | 'mint' | 'none' | 'dark'
  headerTitle?: string
  headerAction?: React.ReactNode
  hoverable?: boolean
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
          className="border-b border-[#3D3D3D]/60 bg-[#151515] py-3 px-5 flex items-center justify-between font-['Montserrat',sans-serif]"
        >
          {headerTitle && (
            <h4 className="m-0 text-sm font-bold tracking-tight text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#CFFE06]" />
              {headerTitle}
            </h4>
          )}
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  )
}
