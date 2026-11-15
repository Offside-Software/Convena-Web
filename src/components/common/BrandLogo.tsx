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
      <svg
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className={`${iconSizes[size]} shrink-0 transition-transform hover:scale-105`}
      >
        <circle cx="18" cy="18" r="17" fill="#151515" stroke="#3D3D3D" strokeWidth="1.5" />
        <path
          d="M 22.95 13.72 A 6.4 6.4 0 1 0 22.95 22.28 L 20.95 20.48 A 3.7 3.7 0 1 1 20.95 15.52 Z"
          fill="#CFFE06"
        />
        <circle cx="28.5" cy="28.5" r="3" fill="#CFFE06" />
      </svg>
      <div className="flex items-baseline">
        <span className={`font-['Montserrat',sans-serif] font-black tracking-tight text-white ${textSizes[size]}`}>
          Convena
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-[#CFFE06] ml-0.5 inline-block" />
      </div>
    </div>
  )
}
