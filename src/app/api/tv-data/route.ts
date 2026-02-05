import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateBracketScore } from '@/lib/scoring'
import { formatLockTime } from '@/lib/bracket-utils'

export async function GET() {
  try {
    // Get all brackets and calculate scores
    const brackets = await prisma.bracket.findMany({
      include: {
        user: true,
        picks: {
          include: {
            match: {
              include: {
                winnerEntrant: true
              }
            },
            pickedWinnerEntrant: true
          }
        }
      }
    })

    const leaderboardData = []
    let perfectBrackets = 0

    for (const bracket of brackets) {
      try {
        const score = await calculateBracketScore(bracket.id)
        
        leaderboardData.push({
          id: bracket.id,
          name: bracket.user.name,
          totalPoints: score.totalPoints,
          possibleRemainingPoints: score.possibleRemainingPoints,
          isPerfect: score.isPerfect,
          rank: 0 // Will be calculated after sorting
        })

        if (score.isPerfect) {
          perfectBrackets++
        }
      } catch (error) {
        console.error(`Error calculating score for bracket ${bracket.id}:`, error)
      }
    }

    // Sort by total points (desc), then by possible remaining points (desc)
    leaderboardData.sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) {
        return b.totalPoints - a.totalPoints
      }
      return b.possibleRemainingPoints - a.possibleRemainingPoints
    })

    // Assign ranks
    leaderboardData.forEach((entry, index) => {
      entry.rank = index + 1
    })

    // Get recent match results
    const recentMatches = await prisma.match.findMany({
      where: {
        winnerEntrant: { isNot: null }
      },
      include: {
        leftEntrant: true,
        rightEntrant: true,
        winnerEntrant: true
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 10
    })

    const recentResults = recentMatches.map(match => ({
      id: match.id,
      matchDescription: `${match.leftEntrant?.displayName} vs ${match.rightEntrant?.displayName}`,
      winner: match.winnerEntrant?.displayName || 'Unknown',
      timestamp: match.updatedAt
    }))

    // Get lock info
    const settings = await prisma.settings.findFirst()
    const lockInfo = settings?.lockDatetime 
      ? `Locked: ${formatLockTime(settings.lockDatetime)}`
      : 'No lock time set'

    return NextResponse.json({
      leaderboard: leaderboardData,
      recentResults,
      perfectBrackets,
      lockInfo,
      totalParticipants: brackets.length,
      lastUpdated: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error fetching TV data:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        leaderboard: [],
        recentResults: [],
        perfectBrackets: 0,
        lockInfo: 'Error loading data'
      },
      { status: 500 }
    )
  }
}