import React from 'react'

export interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg'
  showTagline?: boolean
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 'md' }) => {
  const iconSizes = {
    sm: 'w-7 h-7 text-sm',
    md: 'w-9 h-9 text-base',
    lg: 'w-11 h-11 text-xl',
  }

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  }

  return (
    <div className="flex items-center gap-2.5 select-none">
      <div
        className={`${iconSizes[size]} rounded-full bg-[#151515] border border-[#3D3D3D] flex items-center justify-center text-[#CFFE06] font-extrabold relative transition-transform hover:scale-105`}
      >
        <span>C</span>
        <span className="w-1.5 h-1.5 rounded-full bg-[#CFFE06] absolute bottom-1 right-1" />
      </div>
      <div className="flex items-baseline">
        <span className={`font-['Montserrat',sans-serif] font-black tracking-tight text-white ${textSizes[size]}`}>
          Convena
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-[#CFFE06] ml-0.5 inline-block" />
      </div>
    </div>
  )
}
