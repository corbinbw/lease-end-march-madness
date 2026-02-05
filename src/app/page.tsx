import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { BracketView } from '@/components/bracket/bracket-view'
import { Navbar } from '@/components/layout/navbar'
import { isLocked } from '@/lib/bracket-utils'

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  // Get settings to check lock status
  const settings = await prisma.settings.findFirst()
  const locked = isLocked(settings?.lockDatetime)

  // Get or create user's bracket
  let bracket = await prisma.bracket.findFirst({
    where: { userId: session.user.id }
  })

  if (!bracket) {
    bracket = await prisma.bracket.create({
      data: {
        userId: session.user.id
      }
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar user={session.user} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            🏀 Lease End Madness
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Own Your Picks • $1,000,000 Perfect Bracket Prize
          </p>
          {settings?.lockDatetime && (
            <div className={`inline-flex items-center px-4 py-2 rounded-lg ${
              locked 
                ? 'bg-red-100 text-red-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {locked ? '🔒 Bracket Locked' : '⏰ Lock Countdown Active'}
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