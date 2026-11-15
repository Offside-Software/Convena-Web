import React from 'react'

export interface StatCardProps {
  title: string
  value: string | number
  change?: string
  isPositive?: boolean
  icon?: React.ReactNode
  accentColor?: 'yellow' | 'pink' | 'cyan' | 'purple' | 'mint' | 'accent'
  subtitle?: string
  compact?: boolean
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  isPositive = true,
  icon,
  subtitle,
  compact = false,
}) => {
  return (
    <div
      className={`${
        compact ? 'p-3.5' : 'p-5'
      } bg-[#202020] border border-[#3D3D3D]/60 rounded-xl relative overflow-hidden flex flex-col transition-all hover:border-[#CFFE06]/40 hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)]`}
    >
      <div className={`flex items-start justify-between ${compact ? 'mb-1.5' : 'mb-3'}`}>
        <span
          className={`font-['Montserrat',sans-serif] font-semibold text-[#9C9C9C] tracking-wide uppercase ${
            compact ? 'text-[11px]' : 'text-xs'
          }`}
        >
          {title}
        </span>
        {icon && (
          <div
            className={`${
              compact ? 'w-7 h-7' : 'w-9 h-9'
            } rounded-full bg-[#151515] border border-[#3D3D3D] text-[#CFFE06] flex items-center justify-center shrink-0`}
          >
            {icon}
          </div>
        )}
      </div>

      <div
        className={`font-['Montserrat',sans-serif] font-extrabold text-white tracking-tight leading-tight ${
          compact ? 'text-xl sm:text-2xl mb-1.5' : 'text-3xl mb-2'
        }`}
      >
        {value}
      </div>

      <div className={`flex items-center gap-1.5 mt-auto ${compact ? 'text-[11px]' : 'text-xs gap-2'}`}>
        {change && (
          <span
            className={`font-bold rounded-full shrink-0 ${
              compact ? 'py-0 px-1.5 text-[10px]' : 'py-0.5 px-2 text-[11px]'
            } ${
              isPositive
                ? 'bg-[#CFFE06]/15 text-[#CFFE06]'
                : 'bg-[#DF00D0]/15 text-[#DF00D0]'
            }`}
          >
            {change}
          </span>
        )}
        {subtitle && (
          <span className={`text-[#9C9C9C] truncate ${compact ? 'text-[11px]' : 'text-xs'}`}>
            {subtitle}
          </span>
        )}
      </div>
    </div>
  )
}
