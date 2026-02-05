'use client'

import Image from 'next/image'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showMadness?: boolean
  className?: string
}

const sizes = {
  sm: { width: 100, height: 24 },
  md: { width: 140, height: 32 },
  lg: { width: 200, height: 46 },
  xl: { width: 280, height: 64 },
}

export function Logo({ size = 'md', showMadness = false, className = '' }: LogoProps) {
  const { width, height } = sizes[size]

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Image 
        src="/leaseend-logo.webp" 
        alt="Lease End" 
        width={width} 
        height={height}
        className="h-auto"
        style={{ width: 'auto', height: size === 'sm' ? '24px' : size === 'md' ? '32px' : size === 'lg' ? '46px' : '64px' }}
      />
      {showMadness && (
        <span className={`bg-navy-400 text-white font-bold rounded ${
          size === 'xl' ? 'text-xl px-4 py-2' : 
          size === 'lg' ? 'text-lg px-3 py-1.5' : 
          size === 'md' ? 'text-sm px-2.5 py-1' : 
          'text-xs px-2 py-0.5'
        }`}>
          🏀 MADNESS
        </span>
      )}
    </div>
  )
}
