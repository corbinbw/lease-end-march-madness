import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isLocked } from '@/lib/bracket-utils'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { bracketId, matchId, pickedWinnerEntrantId } = await request.json()

    // Verify bracket belongs to user (or user is admin)
    const bracket = await prisma.bracket.findUnique({
      where: { id: bracketId },
      include: { user: true }
    })

    if (!bracket) {
      return NextResponse.json({ error: 'Bracket not found' }, { status: 404 })
    }

    if (bracket.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Check if bracket is locked (unless admin override)
    const settings = await prisma.settings.findFirst()
    const locked = isLocked(settings?.lockDatetime)
    
    if (locked && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Bracket is locked' }, { status: 403 })
    }

    // Verify match exists and entrant is valid
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { leftEntrant: true, rightEntrant: true }
    })

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 })
    }

    if (!match.leftEntrant || !match.rightEntrant) {
      return NextResponse.json({ error: 'Match entrants not set' }, { status: 400 })
    }

    const validEntrantIds = [match.leftEntrant.id, match.rightEntrant.id]
    if (!validEntrantIds.includes(pickedWinnerEntrantId)) {
      return NextResponse.json({ error: 'Invalid entrant selection' }, { status: 400 })
    }

    // Upsert the pick
    const pick = await prisma.pick.upsert({
      where: {
        bracketId_matchId: {
          bracketId,
          matchId
        }
      },
      update: {
        pickedWinnerEntrantId
      },
      create: {
        bracketId,
        matchId,
        pickedWinnerEntrantId
      }
    })

    // Log action if admin override
    if (session.user.role === 'ADMIN' && bracket.userId !== session.user.id) {
      await prisma.adminActionLog.create({
        data: {
          adminUserId: session.user.id,
          actionType: 'OVERRIDE_PICK',
          payloadJson: JSON.stringify({
            bracketId,
            matchId,
            pickedWinnerEntrantId,
            targetUserId: bracket.userId
          })
        }
      })
    }

    return NextResponse.json({ success: true, pick })

  } catch (error) {
    console.error('Error saving pick:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}