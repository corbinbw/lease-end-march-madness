import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { bracketId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { bracketId } = params

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

    // Get all matches with entrants and user's picks
    const matches = await prisma.match.findMany({
      include: {
        leftEntrant: true,
        rightEntrant: true,
        winnerEntrant: true,
        picks: {
          where: { bracketId },
          include: { pickedWinnerEntrant: true }
        }
      },
      orderBy: [
        { round: 'asc' },
        { region: 'asc' },
        { matchNumber: 'asc' }
      ]
    })

    // Transform data for frontend
    const transformedMatches = matches.map(match => ({
      id: match.id,
      round: match.round,
      region: match.region,
      matchNumber: match.matchNumber,
      leftEntrant: match.leftEntrant ? {
        id: match.leftEntrant.id,
        displayName: match.leftEntrant.displayName,
        seed: match.leftEntrant.seed
      } : null,
      rightEntrant: match.rightEntrant ? {
        id: match.rightEntrant.id,
        displayName: match.rightEntrant.displayName,
        seed: match.rightEntrant.seed
      } : null,
      winnerEntrant: match.winnerEntrant ? {
        id: match.winnerEntrant.id,
        displayName: match.winnerEntrant.displayName,
        seed: match.winnerEntrant.seed
      } : null,
      userPick: match.picks[0] ? {
        id: match.picks[0].id,
        pickedWinnerEntrantId: match.picks[0].pickedWinnerEntrantId
      } : null
    }))

    return NextResponse.json({
      bracket: {
        id: bracket.id,
        userId: bracket.userId,
        lockedAt: bracket.lockedAt,
        isAdminOverride: bracket.isAdminOverride
      },
      matches: transformedMatches,
      isSubmitted: !!bracket.lockedAt
    })

  } catch (error) {
    console.error('Error fetching bracket:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}