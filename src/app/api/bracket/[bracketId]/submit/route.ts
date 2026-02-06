import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { bracketId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { bracketId } = params

    // Get the bracket and verify ownership
    const bracket = await prisma.bracket.findUnique({
      where: { id: bracketId },
      include: {
        picks: true
      }
    })

    if (!bracket) {
      return NextResponse.json({ error: 'Bracket not found' }, { status: 404 })
    }

    if (bracket.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not your bracket' }, { status: 403 })
    }

    // Check if already submitted
    if (bracket.lockedAt) {
      return NextResponse.json({ error: 'Bracket already submitted' }, { status: 400 })
    }

    // Count total matches needed
    const totalMatches = await prisma.match.count()
    const userPicks = bracket.picks.length

    if (userPicks < totalMatches) {
      return NextResponse.json({ 
        error: `Incomplete bracket: ${userPicks}/${totalMatches} picks made` 
      }, { status: 400 })
    }

    // Submit the bracket by setting lockedAt
    await prisma.bracket.update({
      where: { id: bracketId },
      data: { lockedAt: new Date() }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Bracket submitted successfully!' 
    })

  } catch (error) {
    console.error('Error submitting bracket:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
