'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { getCurrentTournamentRound, getRoundDisplayName } from '@/lib/bracket-utils'

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
    const interval = setInterval(fetchTVData, 30000)
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
      <div className="h-screen bg-navy-950 flex items-center justify-center">
        <div className="text-center">
          <Image 
            src="/leaseend-logo.webp" 
            alt="Lease End" 
            width={280} 
            height={64}
            className="h-16 w-auto mx-auto mb-4"
          />
          <div className="text-navy-400 text-2xl">Loading Madness...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-navy-950 text-white overflow-hidden">
      {/* Header */}
      <div className="bg-navy-900 border-b border-navy-800 p-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Image 
              src="/leaseend-logo.webp" 
              alt="Lease End" 
              width={180} 
              height={42}
              className="h-10 w-auto"
            />
            <div className="bg-navy-400 text-navy-900 px-4 py-1.5 rounded-full font-bold text-lg">
              🏀 MADNESS 2026
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-navy-400">{currentRound}</div>
            <div className="text-lg text-navy-300">
              🎯 Perfect Brackets: <span className="text-navy-400 font-bold">{perfectBrackets}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="h-[calc(100vh-180px)] p-6">
        {currentView === 'leaderboard' && <LeaderboardView leaderboard={leaderboard} />}
        {currentView === 'regions' && <RegionsView />}
        {currentView === 'perfect' && <PerfectBracketsView leaderboard={leaderboard} />}
        {currentView === 'results' && <ResultsView results={recentResults} />}
      </div>

      {/* Footer */}
      <div className="bg-navy-900 border-t border-navy-800 p-4">
        <div className="flex justify-between items-center text-lg">
          <div className="flex items-center space-x-8">
            <div className="text-navy-400 font-semibold">💰 $1,000,000 Perfect Bracket Prize</div>
            <div className="text-navy-400">📊 {lockInfo}</div>
          </div>
          <div className="text-navy-400">
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
      <h2 className="text-3xl font-bold mb-6 text-center">
        <span className="bg-navy-400 text-navy-900 px-6 py-2 rounded-full">🏆 TOP 10 LEADERBOARD</span>
      </h2>
      <div className="bg-navy-900 rounded-xl border border-navy-800 p-6 h-[calc(100%-80px)]">
        <div className="grid grid-cols-5 gap-4 text-xl font-semibold mb-4 pb-4 border-b border-navy-700 text-navy-400">
          <div>Rank</div>
          <div>Player</div>
          <div>Points</div>
          <div>Remaining</div>
          <div>Status</div>
        </div>
        
        <div className="space-y-3 overflow-auto h-[calc(100%-60px)]">
          {leaderboard.length > 0 ? leaderboard.slice(0, 10).map((entry) => (
            <div key={entry.id} className="grid grid-cols-5 gap-4 text-lg py-3 px-2 hover:bg-navy-800 rounded-lg transition-colors">
              <div className="font-bold text-navy-400">#{entry.rank}</div>
              <div className="truncate text-white">{entry.name}</div>
              <div className="font-semibold text-white">{entry.totalPoints}</div>
              <div className="text-teal-400">+{entry.possibleRemainingPoints}</div>
              <div>
                {entry.isPerfect ? (
                  <span className="badge badge-success">🔥 PERFECT</span>
                ) : (
                  <span className="text-navy-400">Active</span>
                )}
              </div>
            </div>
          )) : (
            <div className="text-center text-navy-500 py-8 text-xl">
              No brackets submitted yet. The madness begins soon!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function RegionsView() {
  const regions = [
    { name: 'iAdvisors', color: 'from-blue-600 to-blue-800', border: 'border-l-blue-500' },
    { name: 'xAdvisors', color: 'from-emerald-600 to-emerald-800', border: 'border-l-emerald-500' },
    { name: 'Financial Specialists', color: 'from-purple-600 to-purple-800', border: 'border-l-purple-500' },
    { name: 'wAdvisors', color: 'from-rose-600 to-rose-800', border: 'border-l-rose-500' }
  ]

  return (
    <div className="h-full">
      <h2 className="text-3xl font-bold mb-6 text-center">
        <span className="bg-navy-400 text-navy-900 px-6 py-2 rounded-full">🎯 REGION STATUS</span>
      </h2>
      <div className="grid grid-cols-2 gap-6 h-[calc(100%-80px)]">
        {regions.map((region) => (
          <div key={region.name} className={`bg-gradient-to-br ${region.color} rounded-xl p-6 text-center border-l-4 ${region.border}`}>
            <h3 className="text-2xl font-bold mb-4">{region.name}</h3>
            <div className="text-lg space-y-2">
              <div>🏀 Teams Remaining: TBD</div>
              <div>🔥 Upsets: TBD</div>
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
      <h2 className="text-3xl font-bold mb-6 text-center">
        <span className="bg-navy-400 text-navy-900 px-6 py-2 rounded-full">🔥 PERFECT BRACKET WATCH</span>
      </h2>
      <div className="bg-gradient-to-br from-emerald-700 to-emerald-900 rounded-xl p-8 text-center h-[calc(100%-80px)] border border-emerald-600">
        <div className="text-7xl font-bold mb-4 text-navy-400">{perfectEntries.length}</div>
        <div className="text-2xl mb-8 text-emerald-100">Perfect Brackets Remaining</div>
        
        {perfectEntries.length > 0 ? (
          <div className="space-y-4">
            <div className="text-xl font-semibold mb-4 text-emerald-200">Still in the Hunt:</div>
            <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
              {perfectEntries.map((entry) => (
                <div key={entry.id} className="bg-black bg-opacity-30 rounded-xl p-4 border border-emerald-500">
                  <div className="font-bold text-lg text-white">{entry.name}</div>
                  <div className="text-sm text-emerald-300">Points: {entry.totalPoints}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-xl text-emerald-200">
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
      <h2 className="text-3xl font-bold mb-6 text-center">
        <span className="bg-navy-400 text-navy-900 px-6 py-2 rounded-full">🚨 RECENT RESULTS</span>
      </h2>
      <div className="bg-navy-900 rounded-xl border border-navy-800 p-6 h-[calc(100%-80px)]">
        {results.length > 0 ? (
          <div className="space-y-4 overflow-auto h-full">
            {results.slice(0, 8).map((result) => (
              <div key={result.id} className="bg-navy-800 rounded-xl p-4 border-l-4 border-l-navy-400">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-lg text-white">{result.matchDescription}</div>
                    <div className="text-emerald-400 font-bold">Winner: {result.winner}</div>
                  </div>
                  <div className="text-sm text-navy-400">
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-xl text-navy-500 flex items-center justify-center h-full">
            No recent results available
          </div>
        )}
      </div>
    </div>
  )
}
