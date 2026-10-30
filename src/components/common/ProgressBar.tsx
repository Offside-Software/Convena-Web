import React from 'react'

export interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  color?: 'yellow' | 'pink' | 'cyan' | 'purple' | 'mint' | 'accent'
  striped?: boolean
  showPercentage?: boolean
  height?: number
  className?: string
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  color = 'accent',
  showPercentage = true,
  height = 8,
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)))

  const isPurple = color === 'pink' || color === 'purple'
  const fillColor = isPurple ? 'bg-[#DF00D0]' : 'bg-[#CFFE06]'

  return (
    <div className={`w-full mb-2 ${className}`}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center text-xs font-['Montserrat',sans-serif] font-semibold mb-1.5 text-[#9C9C9C]">
          {label && <span className="text-white">{label}</span>}
          {showPercentage && <span className={isPurple ? 'text-[#DF00D0]' : 'text-[#CFFE06]'}>{percentage}%</span>}
        </div>
      )}
      <div
        className="w-full bg-[#3D3D3D]/50 rounded-full overflow-hidden"
        style={{ height: `${height}px` }}
      >
        <div
          className={`h-full rounded-full transition-all duration-300 ease-out ${fillColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
