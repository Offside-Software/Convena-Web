import React from 'react'

export interface ProgressBarProps {
  value: number // current value
  max?: number // max value, default 100
  label?: string
  color?: 'yellow' | 'pink' | 'cyan' | 'purple' | 'mint'
  striped?: boolean
  showPercentage?: boolean
  height?: number
  className?: string
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  color = 'yellow',
  striped = false,
  showPercentage = true,
  height = 18,
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)))

  const colorClasses: Record<string, string> = {
    yellow: 'bg-[#FFE600]',
    pink: 'bg-[#FF4B91]',
    cyan: 'bg-[#01CDFE]',
    purple: 'bg-[#845EC2]',
    mint: 'bg-[#00F5D4]',
  }

  return (
    <div className={`w-full mb-2 ${className}`}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center text-xs font-['Space_Grotesk',sans-serif] font-bold mb-1 text-[#121215]">
          {label && <span>{label}</span>}
          {showPercentage && <span>{percentage}%</span>}
        </div>
      )}
      <div
        className="w-full h-[18px] bg-white border-2 border-[#121215] rounded-md overflow-hidden shadow-[2px_2px_0px_0px_#121215] relative"
        style={height !== 18 ? { height: `${height}px` } : undefined}
      >
        <div
          className={`h-full transition-all duration-400 ease-out ${colorClasses[color] || colorClasses.yellow} ${
            striped ? 'bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,rgba(18,18,21,0.15)_8px,rgba(18,18,21,0.15)_16px)]' : ''
          } ${percentage > 0 && percentage < 100 ? 'border-r-2 border-[#121215]' : ''}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
