import React from 'react'

export interface CardProps {
  children: React.ReactNode
  headerColor?: 'yellow' | 'pink' | 'cyan' | 'purple' | 'mint' | 'none'
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
  const headerClasses: Record<string, string> = {
    yellow: 'bg-[#FFE600] text-[#121215]',
    pink: 'bg-[#FF4B91] text-white',
    cyan: 'bg-[#01CDFE] text-[#121215]',
    purple: 'bg-[#845EC2] text-white',
    mint: 'bg-[#00F5D4] text-[#121215]',
    none: 'hidden',
  }

  return (
    <div
      onClick={onClick}
      style={style}
      className={`bg-white border-2 border-[#121215] rounded-xl shadow-[4px_4px_0px_0px_#121215] overflow-hidden ${
        onClick ? 'cursor-pointer' : 'cursor-default'
      } ${
        hoverable ? 'hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#121215] transition-all' : ''
      } ${className}`.trim()}
    >
      {headerColor !== 'none' && (
        <div
          className={`border-b-2 border-[#121215] py-2.5 px-4 flex items-center justify-between font-['Space_Grotesk',sans-serif] ${headerClasses[headerColor]}`}
        >
          {headerTitle && (
            <h4 className="m-0 text-sm font-black tracking-wider uppercase">
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
