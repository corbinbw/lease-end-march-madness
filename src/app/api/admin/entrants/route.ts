import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') return null
  return session
}

// GET - list all entrants
export async function GET() {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const entrants = await prisma.entrant.findMany({
    orderBy: [{ region: 'asc' }, { seed: 'asc' }]
  })
  return NextResponse.json({ entrants })
}

// PUT - update an entrant
export async function PUT(request: NextRequest) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, displayName, seed, department, title } = await request.json()

  const entrant = await prisma.entrant.update({
    where: { id },
    data: {
      ...(displayName && { displayName }),
      ...(seed !== undefined && { seed }),
      ...(department !== undefined && { department }),
      ...(title !== undefined && { title }),
    }
  })

  await prisma.adminActionLog.create({
    data: {
      adminUserId: session.user.id,
      actionType: 'UPDATE_ENTRANT',
      payloadJson: JSON.stringify({ id, displayName, seed })
    }
  })

  return NextResponse.json({ entrant })
}
