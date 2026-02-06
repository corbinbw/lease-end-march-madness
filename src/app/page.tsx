import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { BracketView } from '@/components/bracket/bracket-view'
import { Navbar } from '@/components/layout/navbar'
import { isLocked, getLockCountdown } from '@/lib/bracket-utils'
import Image from 'next/image'

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  const settings = await prisma.settings.findFirst()
  const locked = isLocked(settings?.lockDatetime)

  let bracket = await prisma.bracket.findFirst({
    where: { userId: session.user.id }
  })

  if (!bracket) {
    bracket = await prisma.bracket.create({
      data: { userId: session.user.id }
    })
  }

  return (
    <div className="min-h-screen bg-navy-50 dark:bg-navy-950">
      <Navbar user={session.user} />
      
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-navy-900 relative overflow-hidden">
        <div className="container mx-auto px-4 py-4 sm:py-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-navy-400 text-white px-3 sm:px-5 py-1.5 sm:py-2 rounded-xl font-bold text-base sm:text-xl shadow-lg">
                🏀 MADNESS 2026
              </div>
            </div>
            
            <div className="flex items-center gap-3 sm:gap-6">
              {settings?.lockDatetime && (
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold text-xs sm:text-sm ${
                  locked 
                    ? 'bg-rose-500/20 text-rose-200 border border-rose-400/30' 
                    : 'bg-navy-700 text-navy-200 border border-navy-600'
                }`}>
                  {locked ? '🔒 Locked' : `⏰ ${getLockCountdown(settings.lockDatetime)}`}
                </div>
              )}
              <div className="text-right text-white">
                <div className="text-xs text-navy-300">Prize</div>
                <div className="text-lg sm:text-2xl font-bold text-navy-400">$1M</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6">
        <BracketView 
          bracketId={bracket.id} 
          isLocked={locked}
          isAdmin={session.user.role === 'ADMIN'}
        />
      </main>
    </div>
  )
}
