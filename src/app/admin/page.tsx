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
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <Navbar user={session.user} />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <span className="text-3xl font-light text-navy-900 dark:text-white tracking-tight">LEASE</span>
            <span className="text-3xl font-bold text-navy-500 tracking-tight">END</span>
          </div>
          <div className="inline-flex items-center bg-navy-800 dark:bg-navy-700 text-white px-4 py-1.5 rounded-full font-bold text-sm mb-2">
            ⚙️ ADMIN DASHBOARD
          </div>
          <p className="text-navy-600 dark:text-navy-400">Manage entrants, enter results, and configure the tournament</p>
        </div>
        <AdminPanel />
      </main>
    </div>
  )
}
