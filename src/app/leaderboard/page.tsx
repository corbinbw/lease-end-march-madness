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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar user={session.user} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🏆 Leaderboard
          </h1>
          <p className="text-xl text-gray-600">
            See how you rank against all participants
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center text-gray-500">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-2xl font-semibold mb-2">Leaderboard Coming Soon</h3>
            <p className="text-lg">
              Real-time rankings will appear here once the tournament begins and results are entered.
            </p>
            <div className="mt-6">
              <a 
                href="/tv" 
                className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                View Live TV Display →
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}