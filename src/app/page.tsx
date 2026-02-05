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
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Header */}
        <div className="hero-card text-center mb-8 flex flex-col items-center">
          <div className="flex items-center gap-4 mb-4">
            <Image 
              src="/leaseend-logo.webp" 
              alt="Lease End" 
              width={240} 
              height={55}
              className="h-14 w-auto"
            />
            <span className="bg-navy-400 text-white px-4 py-2 rounded-lg font-bold text-xl">
              🏀 MADNESS
            </span>
          </div>
          <p className="text-navy-200 text-lg mb-4">
            Own Your Picks • $1,000,000 Perfect Bracket Prize
          </p>
          
          {/* Lock Status */}
          {settings?.lockDatetime && (
            <div className={`inline-flex items-center px-5 py-2 rounded-xl font-semibold text-sm ${
              locked 
                ? 'bg-rose-500/20 text-rose-200 border border-rose-400/30' 
                : 'bg-navy-400/20 text-navy-200 border border-navy-400/30'
            }`}>
              {locked ? (
                <span>🔒 Brackets Locked</span>
              ) : (
                <span>⏰ Locks in: {getLockCountdown(settings.lockDatetime)}</span>
              )}
            </div>
          )}
        </div>

        <BracketView 
          bracketId={bracket.id} 
          isLocked={locked}
          isAdmin={session.user.role === 'ADMIN'}
        />
      </main>
    </div>
  )
}
