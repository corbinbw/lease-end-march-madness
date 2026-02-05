import { RoundType, Match, Pick, Bracket, Entrant } from '@prisma/client'
import { prisma } from './prisma'

export const DEFAULT_SCORING = {
  R64: 1,
  R32: 2,
  S16: 4,
  E8: 8,
  F4: 16,
  CHAMP: 32
}

export interface BracketScore {
  totalPoints: number
  possibleRemainingPoints: number
  isPerfect: boolean
  roundBreakdown: { [key in RoundType]: { correct: number; total: number; points: number } }
}

export async function calculateBracketScore(
  bracketId: string,
  scoringConfig = DEFAULT_SCORING
): Promise<BracketScore> {
  const bracket = await prisma.bracket.findUnique({
    where: { id: bracketId },
    include: {
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

  if (!bracket) {
    throw new Error('Bracket not found')
  }

  let totalPoints = 0
  let isPerfect = true
  const roundBreakdown: { [key in RoundType]: { correct: number; total: number; points: number } } = {
    R64: { correct: 0, total: 0, points: 0 },
    R32: { correct: 0, total: 0, points: 0 },
    S16: { correct: 0, total: 0, points: 0 },
    E8: { correct: 0, total: 0, points: 0 },
    F4: { correct: 0, total: 0, points: 0 },
    CHAMP: { correct: 0, total: 0, points: 0 }
  }

  // Calculate scores for completed matches
  for (const pick of bracket.picks) {
    const round = pick.match.round as RoundType
    roundBreakdown[round].total++

    if (pick.match.winnerEntrant) {
      // Match has been decided
      const isCorrect = pick.pickedWinnerEntrant.id === pick.match.winnerEntrant.id
      if (isCorrect) {
        roundBreakdown[round].correct++
        const points = scoringConfig[round]
        roundBreakdown[round].points += points
        totalPoints += points
      } else {
        isPerfect = false
      }
    }
  }

  // Calculate remaining possible points
  const allMatches = await prisma.match.findMany({
    where: { winnerEntrantId: null },
    include: {
      picks: {
        where: { bracketId },
        include: { pickedWinnerEntrant: true }
      }
    }
  })

  let possibleRemainingPoints = 0
  for (const match of allMatches) {
    if (match.picks.length > 0) {
      possibleRemainingPoints += scoringConfig[match.round as RoundType]
    }
  }

  return {
    totalPoints,
    possibleRemainingPoints,
    isPerfect,
    roundBreakdown
  }
}

export async function updateAllBracketScores() {
  const brackets = await prisma.bracket.findMany()
  
  for (const bracket of brackets) {
    const score = await calculateBracketScore(bracket.id)
    // You can store these scores in a separate table or cache if needed
    console.log(`Bracket ${bracket.id}: ${score.totalPoints} points, Perfect: ${score.isPerfect}`)
  }
}

export function getStandardMatchups(entrants: Entrant[]): Match[] {
  // Standard bracket matchups for each region
  const seedMatchups = [
    [1, 16], [8, 9], [5, 12], [4, 13],
    [6, 11], [3, 14], [7, 10], [2, 15]
  ]
  
  const matches: Partial<Match>[] = []
  
  // Create first round matches for each region
  const regions = ['IADVISORS', 'XADVISORS', 'FINANCIAL_SPECIALISTS', 'WADVISORS']
  
  regions.forEach((region) => {
    const regionEntrants = entrants.filter(e => e.region === region)
    
    seedMatchups.forEach((matchup, index) => {
      const leftEntrant = regionEntrants.find(e => e.seed === matchup[0])
      const rightEntrant = regionEntrants.find(e => e.seed === matchup[1])
      
      if (leftEntrant && rightEntrant) {
        matches.push({
          round: 'R64',
          region: region as any,
          matchNumber: index + 1,
          leftEntrantId: leftEntrant.id,
          rightEntrantId: rightEntrant.id
        })
      }
    })
  })
  
  return matches as Match[]
}