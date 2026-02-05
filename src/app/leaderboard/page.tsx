import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { Navbar } from '@/components/layout/navbar'

export default async function LeaderboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <Navbar user={session.user} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <span className="text-3xl font-light text-navy-900 dark:text-white tracking-tight">LEASE</span>
            <span className="text-3xl font-bold text-navy-500 tracking-tight">END</span>
          </div>
          <div className="inline-flex items-center bg-navy-400 text-navy-900 px-4 py-1.5 rounded-full font-bold text-sm mb-2">
            🏆 LEADERBOARD
          </div>
          <p className="text-navy-600 dark:text-navy-400">
            See how you rank against all participants
          </p>
        </div>

        <div className="card p-8 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-2xl font-bold text-navy-900 dark:text-white mb-2">Leaderboard Coming Soon</h3>
          <p className="text-navy-600 dark:text-navy-400 text-lg mb-6">
            Real-time rankings will appear here once the tournament begins and results are entered.
          </p>
          <a 
            href="/tv" 
            className="btn-primary inline-flex items-center"
          >
            View Live TV Display →
          </a>
        </div>
      </main>
    </div>
  )
}
