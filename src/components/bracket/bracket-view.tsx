'use client'

import { useState, useEffect } from 'react'
import { BracketMatch } from './bracket-match'
import { BracketRegion } from './bracket-region'

interface BracketViewProps {
  bracketId: string
  isLocked: boolean
  isAdmin: boolean
}

interface MatchData {
  id: string
  round: string
  region?: string
  matchNumber: number
  leftEntrant?: { id: string; displayName: string; seed: number }
  rightEntrant?: { id: string; displayName: string; seed: number }
  winnerEntrant?: { id: string; displayName: string; seed: number }
  userPick?: { id: string; pickedWinnerEntrantId: string }
}

interface RegionData {
  region: string
  matches: MatchData[]
}

export function BracketView({ bracketId, isLocked, isAdmin }: BracketViewProps) {
  const [bracketData, setBracketData] = useState<RegionData[]>([])
  const [finalFourMatches, setFinalFourMatches] = useState<MatchData[]>([])
  const [championshipMatch, setChampionshipMatch] = useState<MatchData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchBracketData()
  }, [bracketId])

  const fetchBracketData = async () => {
    try {
      const response = await fetch(`/api/bracket/${bracketId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch bracket data')
      }
      
      const data = await response.json()
      
      // Organize data by regions
      const regions = ['IADVISORS', 'XADVISORS', 'FINANCIAL_SPECIALISTS', 'WADVISORS']
      const regionData: RegionData[] = []
      
      regions.forEach(region => {
        const regionMatches = data.matches.filter((match: MatchData) => match.region === region)
        regionData.push({
          region,
          matches: regionMatches
        })
      })
      
      setBracketData(regionData)
      
      // Set Final Four and Championship matches
      const finalFour = data.matches.filter((match: MatchData) => match.round === 'F4')
      const championship = data.matches.find((match: MatchData) => match.round === 'CHAMP')
      
      setFinalFourMatches(finalFour)
      setChampionshipMatch(championship)
      
    } catch (err) {
      setError('Failed to load bracket data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handlePickUpdate = async (matchId: string, entrantId: string) => {
    if (isLocked && !isAdmin) {
      alert('Bracket is locked! Cannot make changes.')
      return
    }

    try {
      const response = await fetch('/api/picks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bracketId,
          matchId,
          pickedWinnerEntrantId: entrantId
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save pick')
      }

      // Refresh bracket data
      await fetchBracketData()
      
    } catch (err) {
      alert('Failed to save pick. Please try again.')
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-600">Loading bracket...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Lock Status Banner */}
      {isLocked && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <div className="text-red-800 font-semibold">
            🔒 Bracket Locked - No more changes allowed
            {isAdmin && <span className="ml-2">(Admin override available)</span>}
          </div>
        </div>
      )}

      {/* Regions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {bracketData.map((region) => (
          <BracketRegion
            key={region.region}
            region={region.region}
            matches={region.matches}
            onPickUpdate={handlePickUpdate}
            isLocked={isLocked && !isAdmin}
          />
        ))}
      </div>

      {/* Final Four */}
      {finalFourMatches.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-2xl font-bold text-center mb-6 text-indigo-600">
            🏆 Final Four
          </h3>
          <div className="flex justify-center space-x-8">
            {finalFourMatches.map((match) => (
              <BracketMatch
                key={match.id}
                match={match}
                onPickUpdate={handlePickUpdate}
                isLocked={isLocked && !isAdmin}
                size="large"
              />
            ))}
          </div>
        </div>
      )}

      {/* Championship */}
      {championshipMatch && (
        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg shadow-lg p-8">
          <h3 className="text-3xl font-bold text-center mb-6 text-yellow-600">
            👑 Championship
          </h3>
          <div className="flex justify-center">
            <BracketMatch
              match={championshipMatch}
              onPickUpdate={handlePickUpdate}
              isLocked={isLocked && !isAdmin}
              size="xlarge"
            />
          </div>
        </div>
      )}
    </div>
  )
}