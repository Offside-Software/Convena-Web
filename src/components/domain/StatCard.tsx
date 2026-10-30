import React from 'react'

export interface StatCardProps {
  title: string
  value: string | number
  change?: string
  isPositive?: boolean
  icon?: React.ReactNode
  accentColor?: 'yellow' | 'pink' | 'cyan' | 'purple' | 'mint' | 'accent'
  subtitle?: string
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  isPositive = true,
  icon,
  subtitle,
}) => {
  return (
    <div className="p-5 bg-[#202020] border border-[#3D3D3D]/60 rounded-xl relative overflow-hidden flex flex-col transition-all hover:border-[#CFFE06]/40 hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
      <div className="flex items-start justify-between mb-3">
        <span className="font-['Montserrat',sans-serif] font-semibold text-xs text-[#9C9C9C] tracking-wide uppercase">
          {title}
        </span>
        {icon && (
          <div className="w-9 h-9 rounded-full bg-[#151515] border border-[#3D3D3D] text-[#CFFE06] flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}
      </div>

      <div className="font-['Montserrat',sans-serif] font-extrabold text-3xl text-white tracking-tight leading-tight mb-2">
        {value}
      </div>

      <div className="flex items-center gap-2 mt-auto text-xs">
        {change && (
          <span
            className={`font-bold py-0.5 px-2 rounded-full text-[11px] ${
              isPositive
                ? 'bg-[#CFFE06]/15 text-[#CFFE06]'
                : 'bg-[#DF00D0]/15 text-[#DF00D0]'
            }`}
          >
            {change}
          </span>
        )}
        {subtitle && <span className="text-[#9C9C9C] text-xs">{subtitle}</span>}
      </div>
    </div>
  )
}
