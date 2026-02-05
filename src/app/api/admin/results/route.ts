import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') return null
  return session
}

// GET - list matches for a round (with entrants)
export async function GET(request: NextRequest) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const round = request.nextUrl.searchParams.get('round') || 'R64'

  const matches = await prisma.match.findMany({
    where: { round: round as any },
    include: {
      leftEntrant: true,
      rightEntrant: true,
      winnerEntrant: true,
    },
    orderBy: [{ region: 'asc' }, { matchNumber: 'asc' }]
  })

  return NextResponse.json({ matches })
}

// POST - set match winner and advance to next round
export async function POST(request: NextRequest) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { matchId, winnerEntrantId } = await request.json()

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { leftEntrant: true, rightEntrant: true }
  })

  if (!match) {
    return NextResponse.json({ error: 'Match not found' }, { status: 404 })
  }

  // Set the winner
  await prisma.match.update({
    where: { id: matchId },
    data: { winnerEntrantId }
  })

  // Advance winner to the next round match
  await advanceWinner(match, winnerEntrantId)

  await prisma.adminActionLog.create({
    data: {
      adminUserId: session.user.id,
      actionType: 'SET_MATCH_WINNER',
      payloadJson: JSON.stringify({ matchId, winnerEntrantId, round: match.round, region: match.region, matchNumber: match.matchNumber })
    }
  })

  return NextResponse.json({ success: true })
}

async function advanceWinner(match: any, winnerEntrantId: string) {
  const roundOrder = ['R64', 'R32', 'S16', 'E8', 'F4', 'CHAMP']
  const currentRoundIdx = roundOrder.indexOf(match.round)
  if (currentRoundIdx >= roundOrder.length - 1) return // Championship has no next round

  const nextRound = roundOrder[currentRoundIdx + 1]

  if (nextRound === 'F4') {
    // Cross-regional advancement
    // E8 IADVISORS → F4 M1 left, E8 XADVISORS → F4 M1 right
    // E8 FINANCIAL_SPECIALISTS → F4 M2 left, E8 WADVISORS → F4 M2 right
    const regionToF4: Record<string, { matchNumber: number; side: 'left' | 'right' }> = {
      IADVISORS: { matchNumber: 1, side: 'left' },
      XADVISORS: { matchNumber: 1, side: 'right' },
      FINANCIAL_SPECIALISTS: { matchNumber: 2, side: 'left' },
      WADVISORS: { matchNumber: 2, side: 'right' },
    }

    const mapping = regionToF4[match.region]
    if (mapping) {
      const f4Match = await prisma.match.findFirst({
        where: { round: 'F4', matchNumber: mapping.matchNumber }
      })
      if (f4Match) {
        await prisma.match.update({
          where: { id: f4Match.id },
          data: mapping.side === 'left'
            ? { leftEntrantId: winnerEntrantId }
            : { rightEntrantId: winnerEntrantId }
        })
      }
    }
  } else if (nextRound === 'CHAMP') {
    // F4 M1 winner → CHAMP left, F4 M2 winner → CHAMP right
    const champMatch = await prisma.match.findFirst({ where: { round: 'CHAMP' } })
    if (champMatch) {
      await prisma.match.update({
        where: { id: champMatch.id },
        data: match.matchNumber === 1
          ? { leftEntrantId: winnerEntrantId }
          : { rightEntrantId: winnerEntrantId }
      })
    }
  } else {
    // Regional advancement: match feeds into next round
    // Matches 1,2 → next M1; 3,4 → next M2; 5,6 → next M3; 7,8 → next M4
    const nextMatchNumber = Math.ceil(match.matchNumber / 2)
    const isLeft = match.matchNumber % 2 === 1

    const nextMatch = await prisma.match.findFirst({
      where: { round: nextRound as any, region: match.region, matchNumber: nextMatchNumber }
    })

    if (nextMatch) {
      await prisma.match.update({
        where: { id: nextMatch.id },
        data: isLeft
          ? { leftEntrantId: winnerEntrantId }
          : { rightEntrantId: winnerEntrantId }
      })
    }
  }
}
