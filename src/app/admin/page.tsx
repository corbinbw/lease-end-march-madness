import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { Navbar } from '@/components/layout/navbar'
import { AdminPanel } from '@/components/admin/admin-panel'

export default async function AdminPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/auth/signin')
  if (session.user.role !== 'ADMIN') redirect('/')

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100">
      <Navbar user={session.user} />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">👑 Admin Dashboard</h1>
          <p className="text-gray-600">Manage entrants, enter results, and configure the tournament</p>
        </div>
        <AdminPanel />
      </main>
    </div>
  )
}
