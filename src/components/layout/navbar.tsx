'use client'

import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { UserRole } from '@prisma/client'

interface User {
  id: string
  name: string
  email: string
  role: UserRole
}

interface NavbarProps {
  user: User
}

export function Navbar({ user }: NavbarProps) {
  return (
    <nav className="bg-white shadow-lg border-b-2 border-indigo-600">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-2xl font-bold text-indigo-600">
              🏀 Lease End Madness
            </Link>
            
            <div className="hidden md:flex space-x-6">
              <Link 
                href="/leaderboard" 
                className="text-gray-700 hover:text-indigo-600 font-medium"
              >
                Leaderboard
              </Link>
              <Link 
                href="/tv" 
                className="text-gray-700 hover:text-indigo-600 font-medium"
              >
                TV Display
              </Link>
              {user.role === 'ADMIN' && (
                <Link 
                  href="/admin" 
                  className="text-red-600 hover:text-red-700 font-medium"
                >
                  Admin
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                {user.name}
              </div>
              <div className="text-xs text-gray-500">
                {user.role === 'ADMIN' ? '👑 Admin' : '🏀 Player'}
              </div>
            </div>
            
            <button
              onClick={() => signOut()}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}