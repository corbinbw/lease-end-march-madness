'use client'

import { BracketMatch } from './bracket-match'
import { getRegionDisplayName } from '@/lib/bracket-utils'

interface MatchData {
  id: string
  round: string
  region?: string
  matchNumber: number
  leftEntrant?: { id: string; displayName: string; seed: number }
  rightEntrant?: { id: string; displayName: string; seed: number }
  winnerEntrant?: { id: string; displayName: string; seed: number }
  userPick?: { pickedWinnerEntrantId: string }
}

interface BracketRegionProps {
  region: string
  matches: MatchData[]
  onPickUpdate: (matchId: string, entrantId: string) => void
  isLocked: boolean
}

export function BracketRegion({ region, matches, onPickUpdate, isLocked }: BracketRegionProps) {
  // Group matches by round
  const matchesByRound = matches.reduce((acc, match) => {
    if (!acc[match.round]) {
      acc[match.round] = []
    }
    acc[match.round].push(match)
    return acc
  }, {} as Record<string, MatchData[]>)

  // Round order
  const rounds = ['R64', 'R32', 'S16', 'E8']
  
  const getRegionColor = (regionName: string) => {
    switch (regionName) {
      case 'IADVISORS':
        return 'from-blue-500 to-blue-600'
      case 'XADVISORS':
        return 'from-green-500 to-green-600'
      case 'FINANCIAL_SPECIALISTS':
        return 'from-purple-500 to-purple-600'
      case 'WADVISORS':
        return 'from-red-500 to-red-600'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Region Header */}
      <div className={`bg-gradient-to-r ${getRegionColor(region)} text-white p-4`}>
        <h3 className="text-xl font-bold text-center">
          {getRegionDisplayName(region as any)}
        </h3>
      </div>

      {/* Bracket Grid */}
      <div className="p-4">
        <div className="grid grid-cols-4 gap-4">
          {rounds.map((roundName, roundIndex) => {
            const roundMatches = matchesByRound[roundName] || []
            
            return (
              <div key={roundName} className="space-y-4">
                {/* Round Header */}
                <div className="text-center">
                  <h4 className="text-sm font-semibold text-gray-600 mb-2">
                    {getRoundDisplayName(roundName)}
                  </h4>
                </div>
                
                {/* Matches */}
                <div className="space-y-3">
                  {roundMatches
                    .sort((a, b) => a.matchNumber - b.matchNumber)
                    .map((match) => (
                      <BracketMatch
                        key={match.id}
                        match={match}
                        onPickUpdate={onPickUpdate}
                        isLocked={isLocked}
                        size={roundIndex === 0 ? 'medium' : 'small'}
                      />
                    ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function getRoundDisplayName(round: string): string {
  switch (round) {
    case 'R64':
      return 'Round of 64'
    case 'R32':
      return 'Round of 32'
    case 'S16':
      return 'Sweet 16'
    case 'E8':
      return 'Elite 8'
    case 'F4':
      return 'Final 4'
    case 'CHAMP':
      return 'Championship'
    default:
      return round
  }
}