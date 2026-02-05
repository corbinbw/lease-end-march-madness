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

    // Check lock
    const settings = await prisma.settings.findFirst()
    const locked = isLocked(settings?.lockDatetime)
    if (locked && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Bracket is locked' }, { status: 403 })
    }

    // Verify match exists
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { leftEntrant: true, rightEntrant: true }
    })

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 })
    }

    // Verify entrant exists
    const entrant = await prisma.entrant.findUnique({
      where: { id: pickedWinnerEntrantId }
    })

    if (!entrant) {
      return NextResponse.json({ error: 'Entrant not found' }, { status: 400 })
    }

    // For R64 matches, validate the entrant is actually in this match
    if (match.round === 'R64') {
      const validIds = [match.leftEntrantId, match.rightEntrantId].filter(Boolean)
      if (!validIds.includes(pickedWinnerEntrantId)) {
        return NextResponse.json({ error: 'Invalid entrant for this match' }, { status: 400 })
      }
    }

    // Check if pick is changing — if so, we need to cascade-invalidate downstream
    const existingPick = await prisma.pick.findUnique({
      where: { bracketId_matchId: { bracketId, matchId } }
    })

    const pickChanged = existingPick && existingPick.pickedWinnerEntrantId !== pickedWinnerEntrantId

    // Upsert the pick
    const pick = await prisma.pick.upsert({
      where: { bracketId_matchId: { bracketId, matchId } },
      update: { pickedWinnerEntrantId },
      create: { bracketId, matchId, pickedWinnerEntrantId }
    })

    // If pick changed, cascade-invalidate downstream picks
    if (pickChanged && existingPick) {
      await cascadeInvalidate(bracketId, match, existingPick.pickedWinnerEntrantId)
    }

    return NextResponse.json({ success: true, pick })

  } catch (error) {
    console.error('Error saving pick:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Remove downstream picks that reference an entrant who was un-picked
async function cascadeInvalidate(bracketId: string, changedMatch: any, oldEntrantId: string) {
  const roundOrder = ['R64', 'R32', 'S16', 'E8', 'F4', 'CHAMP']
  const currentRoundIdx = roundOrder.indexOf(changedMatch.round)

  // Get all downstream matches (later rounds)
  const allMatches = await prisma.match.findMany({
    where: {
      round: { in: roundOrder.slice(currentRoundIdx + 1) as any }
    }
  })

  // Get all user picks for downstream matches
  const downstreamPicks = await prisma.pick.findMany({
    where: {
      bracketId,
      matchId: { in: allMatches.map(m => m.id) },
      pickedWinnerEntrantId: oldEntrantId
    }
  })

  // Delete picks that reference the old entrant (they're now invalid)
  if (downstreamPicks.length > 0) {
    await prisma.pick.deleteMany({
      where: {
        id: { in: downstreamPicks.map(p => p.id) }
      }
    })
  }
}
