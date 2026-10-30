import React from 'react'

export interface MemphisShapeProps {
  type?: string
  color?: string
  size?: number
  className?: string
  style?: React.CSSProperties
  animate?: string
}

export const MemphisShape: React.FC<MemphisShapeProps> = () => {
  // Gracefully render nothing for the clean, simplified dark theme
  return null
}
