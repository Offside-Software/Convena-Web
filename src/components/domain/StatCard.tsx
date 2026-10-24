import React from 'react'

export interface StatCardProps {
  title: string
  value: string | number
  change?: string
  isPositive?: boolean
  icon?: React.ReactNode
  accentColor?: 'yellow' | 'pink' | 'cyan' | 'purple' | 'mint'
  subtitle?: string
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  isPositive = true,
  icon,
  accentColor = 'yellow',
  subtitle,
}) => {
  const accentClasses: Record<string, { bar: string; iconBg: string; text: string }> = {
    pink: { bar: 'bg-[#FF4B91]', iconBg: 'bg-[#FF4B91]', text: 'text-white' },
    cyan: { bar: 'bg-[#01CDFE]', iconBg: 'bg-[#01CDFE]', text: 'text-[#121215]' },
    purple: { bar: 'bg-[#845EC2]', iconBg: 'bg-[#845EC2]', text: 'text-white' },
    mint: { bar: 'bg-[#00F5D4]', iconBg: 'bg-[#00F5D4]', text: 'text-[#121215]' },
    yellow: { bar: 'bg-[#FFE600]', iconBg: 'bg-[#FFE600]', text: 'text-[#121215]' },
  }

  const currentAccent = accentClasses[accentColor] || accentClasses.yellow

  return (
    <div className="p-5 bg-white border-2 border-[#121215] rounded-xl shadow-[4px_4px_0px_0px_#121215] relative overflow-hidden flex flex-col">
      {/* Top right corner decorative accent bar */}
      <div className={`absolute top-0 right-0 w-[60px] h-1.5 ${currentAccent.bar}`} />

      <div className="flex items-start justify-between mb-3">
        <span className="font-['Space_Grotesk',sans-serif] font-bold text-xs text-gray-500 uppercase tracking-wider">
          {title}
        </span>
        {icon && (
          <div
            className={`w-9 h-9 rounded-lg border-2 border-[#121215] shadow-[2px_2px_0px_0px_#121215] flex items-center justify-center shrink-0 ${currentAccent.iconBg} ${currentAccent.text}`}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="font-['Space_Grotesk',sans-serif] font-black text-3xl text-[#121215] leading-tight mb-2">
        {value}
      </div>

      <div className="flex items-center gap-2 mt-auto text-xs">
        {change && (
          <span
            className={`font-black py-0.5 px-1.5 rounded text-[11px] border ${
              isPositive
                ? 'bg-[#00F5D4]/20 text-[#008775] border-[#00C4AA]'
                : 'bg-[#FF4B91]/20 text-[#D0145A] border-[#FF4B91]'
            }`}
          >
            {change}
          </span>
        )}
        {subtitle && <span className="text-gray-500">{subtitle}</span>}
      </div>
    </div>
  )
}
