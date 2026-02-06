'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface NavbarProps {
  user: User
}

export function Navbar({ user }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="bg-navy-900 shadow-lg sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-14">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <Image 
                src="/leaseend-logo.webp" 
                alt="Lease End" 
                width={100} 
                height={23}
                className="h-6 w-auto"
              />
            </Link>
            
            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              <Link 
                href="/" 
                className="text-navy-300 hover:text-white hover:bg-navy-800 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              >
                Bracket
              </Link>
              <Link 
                href="/leaderboard" 
                className="text-navy-300 hover:text-white hover:bg-navy-800 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              >
                Leaderboard
              </Link>
              <Link 
                href="/tv" 
                className="text-navy-300 hover:text-white hover:bg-navy-800 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              >
                TV
              </Link>
              {user.role === 'ADMIN' && (
                <Link 
                  href="/admin" 
                  className="text-navy-300 hover:text-white hover:bg-navy-800 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                >
                  Admin
                </Link>
              )}
            </div>
          </div>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-medium text-white leading-tight">{user.name}</div>
              <div className="text-xs text-navy-400">
                {user.role === 'ADMIN' ? 'Admin' : 'Player'}
              </div>
            </div>
            
            <button
              onClick={() => signOut()}
              className="bg-navy-800 hover:bg-navy-700 text-navy-300 hover:text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            >
              Sign Out
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-navy-300 hover:text-white p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-navy-800">
            <div className="flex flex-col gap-1">
              <Link 
                href="/" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-navy-300 hover:text-white hover:bg-navy-800 px-3 py-2 rounded-lg text-sm font-medium"
              >
                🏀 Bracket
              </Link>
              <Link 
                href="/leaderboard" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-navy-300 hover:text-white hover:bg-navy-800 px-3 py-2 rounded-lg text-sm font-medium"
              >
                🏆 Leaderboard
              </Link>
              <Link 
                href="/tv" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-navy-300 hover:text-white hover:bg-navy-800 px-3 py-2 rounded-lg text-sm font-medium"
              >
                📺 TV Display
              </Link>
              {user.role === 'ADMIN' && (
                <Link 
                  href="/admin" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-navy-300 hover:text-white hover:bg-navy-800 px-3 py-2 rounded-lg text-sm font-medium"
                >
                  ⚙️ Admin
                </Link>
              )}
              <div className="border-t border-navy-800 mt-2 pt-2">
                <div className="px-3 py-2 text-sm">
                  <span className="text-white font-medium">{user.name}</span>
                  <span className="text-navy-400 ml-2">({user.role === 'ADMIN' ? 'Admin' : 'Player'})</span>
                </div>
                <button
                  onClick={() => signOut()}
                  className="w-full text-left text-rose-400 hover:text-rose-300 hover:bg-navy-800 px-3 py-2 rounded-lg text-sm font-medium"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
