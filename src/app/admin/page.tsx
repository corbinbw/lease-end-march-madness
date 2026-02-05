import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { Navbar } from '@/components/layout/navbar'

export default async function AdminPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100">
      <Navbar user={session.user} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            👑 Admin Dashboard
          </h1>
          <p className="text-xl text-gray-600">
            Manage the tournament, entrants, and results
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Entrant Management */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-semibold mb-2">Manage Entrants</h3>
              <p className="text-gray-600 mb-4">
                Add, edit, or import tournament participants
              </p>
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
                Manage Entrants
              </button>
            </div>
          </div>

          {/* Match Results */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center">
              <div className="text-4xl mb-4">🏀</div>
              <h3 className="text-xl font-semibold mb-2">Enter Results</h3>
              <p className="text-gray-600 mb-4">
                Set winners for matches and advance the bracket
              </p>
              <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700">
                Enter Results
              </button>
            </div>
          </div>

          {/* Settings */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center">
              <div className="text-4xl mb-4">⚙️</div>
              <h3 className="text-xl font-semibold mb-2">Tournament Settings</h3>
              <p className="text-gray-600 mb-4">
                Configure lock time, scoring, and other settings
              </p>
              <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700">
                Settings
              </button>
            </div>
          </div>

          {/* User Brackets */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-xl font-semibold mb-2">User Brackets</h3>
              <p className="text-gray-600 mb-4">
                View and override user bracket picks
              </p>
              <button className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700">
                View Brackets
              </button>
            </div>
          </div>

          {/* Audit Log */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center">
              <div className="text-4xl mb-4">📜</div>
              <h3 className="text-xl font-semibold mb-2">Audit Log</h3>
              <p className="text-gray-600 mb-4">
                Review all admin actions and changes
              </p>
              <button className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700">
                View Logs
              </button>
            </div>
          </div>

          {/* TV Display */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center">
              <div className="text-4xl mb-4">📺</div>
              <h3 className="text-xl font-semibold mb-2">TV Display</h3>
              <p className="text-gray-600 mb-4">
                View the live TV display for office
              </p>
              <a 
                href="/tv"
                className="block w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 text-center"
              >
                Open TV Display
              </a>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-2xl font-semibold mb-4">Quick Stats</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">64</div>
              <div className="text-sm text-gray-600">Total Entrants</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-sm text-gray-600">Matches Complete</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">0</div>
              <div className="text-sm text-gray-600">User Brackets</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">0</div>
              <div className="text-sm text-gray-600">Perfect Brackets</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}