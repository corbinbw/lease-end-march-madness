'use client'

import { useState, useEffect } from 'react'
import { getCurrentTournamentRound, getRoundDisplayName, formatLockTime } from '@/lib/bracket-utils'

interface LeaderboardEntry {
  id: string
  name: string
  totalPoints: number
  possibleRemainingPoints: number
  isPerfect: boolean
  rank: number
}

interface RecentResult {
  id: string
  matchDescription: string
  winner: string
  timestamp: Date
}

export default function TVDisplayPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [recentResults, setRecentResults] = useState<RecentResult[]>([])
  const [perfectBrackets, setPerfectBrackets] = useState(0)
  const [currentView, setCurrentView] = useState('leaderboard')
  const [currentRound, setCurrentRound] = useState('')
  const [lockInfo, setLockInfo] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTVData()
    
    // Auto refresh every 30 seconds
    const interval = setInterval(() => {
      fetchTVData()
    }, 30000)

    // Rotate views every 15 seconds
    const viewRotation = setInterval(() => {
      setCurrentView(prev => {
        switch (prev) {
          case 'leaderboard': return 'regions'
          case 'regions': return 'perfect'
          case 'perfect': return 'results'
          case 'results': return 'leaderboard'
          default: return 'leaderboard'
        }
      })
    }, 15000)

    return () => {
      clearInterval(interval)
      clearInterval(viewRotation)
    }
  }, [])

  const fetchTVData = async () => {
    try {
      const response = await fetch('/api/tv-data')
      if (response.ok) {
        const data = await response.json()
        setLeaderboard(data.leaderboard || [])
        setRecentResults(data.recentResults || [])
        setPerfectBrackets(data.perfectBrackets || 0)
        setLockInfo(data.lockInfo || '')
      }
    } catch (error) {
      console.error('Error fetching TV data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setCurrentRound(getRoundDisplayName(getCurrentTournamentRound()))
  }, [])

  if (loading) {
    return (
      <div className="h-screen bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-4xl">Loading Lease End Madness...</div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gradient-to-br from-indigo-900 to-purple-900 text-white overflow-hidden">
      {/* Header */}
      <div className="bg-black bg-opacity-20 p-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="text-4xl">🏀</div>
            <div>
              <h1 className="text-4xl font-bold">Lease End Madness</h1>
              <p className="text-xl text-blue-200">Live Tournament Results</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold">{currentRound}</div>
            <div className="text-lg text-blue-200">
              🎯 Perfect Brackets: {perfectBrackets}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="h-[calc(100vh-120px)] p-6">
        {currentView === 'leaderboard' && (
          <LeaderboardView leaderboard={leaderboard} />
        )}
        
        {currentView === 'regions' && (
          <RegionsView />
        )}
        
        {currentView === 'perfect' && (
          <PerfectBracketsView leaderboard={leaderboard} />
        )}
        
        {currentView === 'results' && (
          <ResultsView results={recentResults} />
        )}
      </div>

      {/* Footer */}
      <div className="bg-black bg-opacity-20 p-4">
        <div className="flex justify-between items-center text-lg">
          <div className="flex items-center space-x-8">
            <div>💰 Perfect Bracket Prize: $1,000,000</div>
            <div>📊 {lockInfo}</div>
          </div>
          <div className="text-blue-200">
            Auto-refreshing • {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  )
}

function LeaderboardView({ leaderboard }: { leaderboard: LeaderboardEntry[] }) {
  return (
    <div className="h-full">
      <h2 className="text-3xl font-bold mb-6 text-center">🏆 TOP 10 LEADERBOARD</h2>
      <div className="bg-white bg-opacity-10 rounded-lg p-6 h-[calc(100%-80px)]">
        <div className="grid grid-cols-5 gap-4 text-xl font-semibold mb-4 pb-4 border-b border-white border-opacity-20">
          <div>Rank</div>
          <div>Player</div>
          <div>Points</div>
          <div>Remaining</div>
          <div>Status</div>
        </div>
        
        <div className="space-y-3 overflow-auto h-full">
          {leaderboard.slice(0, 10).map((entry) => (
            <div key={entry.id} className="grid grid-cols-5 gap-4 text-lg py-2 hover:bg-white hover:bg-opacity-5 rounded">
              <div className="font-bold text-yellow-400">#{entry.rank}</div>
              <div className="truncate">{entry.name}</div>
              <div className="font-semibold">{entry.totalPoints}</div>
              <div className="text-blue-200">+{entry.possibleRemainingPoints}</div>
              <div>
                {entry.isPerfect ? (
                  <span className="text-green-400 font-bold">🔥 PERFECT</span>
                ) : (
                  <span className="text-gray-300">Active</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function RegionsView() {
  const regions = [
    { name: 'iAdvisors', color: 'from-blue-500 to-blue-700' },
    { name: 'xAdvisors', color: 'from-green-500 to-green-700' },
    { name: 'Financial Specialists', color: 'from-purple-500 to-purple-700' },
    { name: 'wAdvisors', color: 'from-red-500 to-red-700' }
  ]

  return (
    <div className="h-full">
      <h2 className="text-3xl font-bold mb-6 text-center">🎯 REGION STATUS</h2>
      <div className="grid grid-cols-2 gap-6 h-[calc(100%-80px)]">
        {regions.map((region) => (
          <div key={region.name} className={`bg-gradient-to-br ${region.color} rounded-lg p-6 text-center`}>
            <h3 className="text-2xl font-bold mb-4">{region.name}</h3>
            <div className="text-lg">
              <div className="mb-2">🏀 Teams Remaining: TBD</div>
              <div className="mb-2">🔥 Upsets: TBD</div>
              <div>⭐ Cinderella: TBD</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PerfectBracketsView({ leaderboard }: { leaderboard: LeaderboardEntry[] }) {
  const perfectEntries = leaderboard.filter(entry => entry.isPerfect)

  return (
    <div className="h-full">
      <h2 className="text-3xl font-bold mb-6 text-center">🔥 PERFECT BRACKET WATCH</h2>
      <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-lg p-6 text-center h-[calc(100%-80px)]">
        <div className="text-6xl font-bold mb-6">{perfectEntries.length}</div>
        <div className="text-2xl mb-8">Perfect Brackets Remaining</div>
        
        {perfectEntries.length > 0 ? (
          <div className="space-y-4">
            <div className="text-xl font-semibold mb-4">Still in the Hunt:</div>
            <div className="grid grid-cols-2 gap-4">
              {perfectEntries.map((entry) => (
                <div key={entry.id} className="bg-white bg-opacity-20 rounded-lg p-4">
                  <div className="font-bold text-lg">{entry.name}</div>
                  <div className="text-sm">Points: {entry.totalPoints}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-xl text-green-200">
            No perfect brackets remaining.<br/>
            The hunt for $1,000,000 continues next year!
          </div>
        )}
      </div>
    </div>
  )
}

function ResultsView({ results }: { results: RecentResult[] }) {
  return (
    <div className="h-full">
      <h2 className="text-3xl font-bold mb-6 text-center">🚨 RECENT RESULTS</h2>
      <div className="bg-white bg-opacity-10 rounded-lg p-6 h-[calc(100%-80px)]">
        {results.length > 0 ? (
          <div className="space-y-4 overflow-auto h-full">
            {results.slice(0, 8).map((result) => (
              <div key={result.id} className="bg-white bg-opacity-10 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-lg">{result.matchDescription}</div>
                    <div className="text-green-400 font-bold">Winner: {result.winner}</div>
                  </div>
                  <div className="text-sm text-blue-200">
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-xl text-gray-300 flex items-center justify-center h-full">
            No recent results available
          </div>
        )}
      </div>
    </div>
  )
}