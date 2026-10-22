import React from 'react'

export type MemphisShapeType =
  | 'zigzag'
  | 'squiggle'
  | 'triangle'
  | 'circle-dots'
  | 'cross'
  | 'starburst'
  | 'arch'
  | 'ring'

export interface MemphisShapeProps {
  type: MemphisShapeType
  color?: string
  size?: number
  className?: string
  style?: React.CSSProperties
  animate?: 'slow' | 'fast' | 'pulse' | 'none'
}

export const MemphisShape: React.FC<MemphisShapeProps> = ({
  type,
  color = 'var(--mem-yellow)',
  size = 40,
  className = '',
  style = {},
  animate = 'none',
}) => {
  const animationClass =
    animate === 'slow'
      ? 'animate-float-slow'
      : animate === 'fast'
        ? 'animate-float-fast'
        : animate === 'pulse'
          ? 'animate-pulse-scale'
          : ''

  const baseProps = {
    width: size,
    height: size,
    viewBox: '0 0 100 100',
    className: `${animationClass} ${className}`.trim(),
    style: { display: 'inline-block', flexShrink: 0, ...style },
  }

  switch (type) {
    case 'zigzag':
      return (
        <svg {...baseProps} viewBox="0 0 120 40">
          <path
            d="M5 20 L25 5 L45 20 L65 5 L85 20 L105 5 L115 15"
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )

    case 'squiggle':
      return (
        <svg {...baseProps} viewBox="0 0 120 40">
          <path
            d="M 10,20 Q 30,0 50,20 T 90,20 T 130,20"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
          />
        </svg>
      )

    case 'triangle':
      return (
        <svg {...baseProps}>
          <polygon
            points="50,10 90,85 10,85"
            fill={color}
            stroke="var(--mem-dark)"
            strokeWidth="6"
            strokeLinejoin="round"
          />
        </svg>
      )

    case 'cross':
      return (
        <svg {...baseProps}>
          <line x1="20" y1="50" x2="80" y2="50" stroke={color} strokeWidth="12" strokeLinecap="round" />
          <line x1="50" y1="20" x2="50" y2="80" stroke={color} strokeWidth="12" strokeLinecap="round" />
        </svg>
      )

    case 'starburst':
      return (
        <svg {...baseProps}>
          <path
            d="M50 0 L58 35 L95 20 L70 50 L95 80 L58 65 L50 100 L42 65 L5 80 L30 50 L5 20 L42 35 Z"
            fill={color}
            stroke="var(--mem-dark)"
            strokeWidth="5"
            strokeLinejoin="round"
          />
        </svg>
      )

    case 'ring':
      return (
        <svg {...baseProps}>
          <circle
            cx="50"
            cy="50"
            r="35"
            fill="none"
            stroke={color}
            strokeWidth="12"
          />
        </svg>
      )

    case 'arch':
      return (
        <svg {...baseProps}>
          <path
            d="M 15,85 L 15,50 A 35,35 0 0,1 85,50 L 85,85 Z"
            fill={color}
            stroke="var(--mem-dark)"
            strokeWidth="6"
          />
        </svg>
      )

    case 'circle-dots':
      return (
        <svg {...baseProps}>
          <circle cx="50" cy="50" r="42" fill={color} stroke="var(--mem-dark)" strokeWidth="6" />
          <circle cx="35" cy="40" r="5" fill="var(--mem-dark)" />
          <circle cx="65" cy="40" r="5" fill="var(--mem-dark)" />
          <circle cx="50" cy="65" r="7" fill="var(--mem-dark)" />
        </svg>
      )

    default:
      return null
  }
}
