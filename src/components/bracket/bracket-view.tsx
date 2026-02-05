'use client'

import { useState, useEffect, useCallback } from 'react'
import { computeVirtualEntrants, getDownstreamMatchIds, REGIONS, ROUND_ORDER } from '@/lib/bracket-progression'
import type { MatchInfo, EntrantInfo } from '@/lib/bracket-progression'

interface BracketViewProps {
  bracketId: string
  isLocked: boolean
  isAdmin: boolean
}

const ROUND_LABELS: Record<string, string> = {
  R64: 'Round of 64',
  R32: 'Round of 32',
  S16: 'Sweet 16',
  E8: 'Elite 8',
  F4: 'Final Four',
  CHAMP: 'Championship',
}

const REGION_LABELS: Record<string, string> = {
  IADVISORS: 'iAdvisors',
  XADVISORS: 'xAdvisors',
  FINANCIAL_SPECIALISTS: 'Financial Specialists',
  WADVISORS: 'wAdvisors',
}

const REGION_COLORS: Record<string, string> = {
  IADVISORS: 'from-blue-500 to-blue-600',
  XADVISORS: 'from-green-500 to-green-600',
  FINANCIAL_SPECIALISTS: 'from-purple-500 to-purple-600',
  WADVISORS: 'from-red-500 to-red-600',
}

export function BracketView({ bracketId, isLocked, isAdmin }: BracketViewProps) {
  const [matches, setMatches] = useState<MatchInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchBracketData = useCallback(async () => {
    try {
      const res = await fetch(`/api/bracket/${bracketId}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setMatches(data.matches)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [bracketId])

  useEffect(() => { fetchBracketData() }, [fetchBracketData])

  const handlePick = async (matchId: string, entrantId: string) => {
    if (isLocked && !isAdmin) return
    setSaving(true)

    try {
      const res = await fetch('/api/picks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bracketId, matchId, pickedWinnerEntrantId: entrantId }),
      })
      if (!res.ok) throw new Error('Failed to save')
      await fetchBracketData()
    } catch (err) {
      alert('Failed to save pick')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-center py-16 text-xl text-gray-500">Loading bracket...</div>
  }

  // Separate regional and cross-regional matches
  const regionalRounds = ['R64', 'R32', 'S16', 'E8']
  const canPick = !isLocked || isAdmin

  return (
    <div className="space-y-8">
      {isLocked && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <span className="text-red-800 font-semibold">
            🔒 Bracket Locked — No more changes allowed
            {isAdmin && ' (Admin override active)'}
          </span>
        </div>
      )}

      {saving && (
        <div className="fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          Saving...
        </div>
      )}

      {/* Regional Brackets */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {REGIONS.map(region => (
          <RegionBracket
            key={region}
            region={region}
            matches={matches}
            allMatches={matches}
            onPick={handlePick}
            canPick={canPick}
          />
        ))}
      </div>

      {/* Final Four */}
      <FinalRounds matches={matches} onPick={handlePick} canPick={canPick} />
    </div>
  )
}

// --- Region Bracket ---
function RegionBracket({
  region,
  matches,
  allMatches,
  onPick,
  canPick,
}: {
  region: string
  matches: MatchInfo[]
  allMatches: MatchInfo[]
  onPick: (matchId: string, entrantId: string) => void
  canPick: boolean
}) {
  const regionalRounds = ['R64', 'R32', 'S16', 'E8'] as const

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className={`bg-gradient-to-r ${REGION_COLORS[region]} text-white p-3`}>
        <h3 className="text-lg font-bold text-center">{REGION_LABELS[region]}</h3>
      </div>
      <div className="p-3 overflow-x-auto">
        <div className="flex gap-3 min-w-[700px]">
          {regionalRounds.map(round => {
            const roundMatches = allMatches
              .filter(m => m.round === round && m.region === region)
              .sort((a, b) => a.matchNumber - b.matchNumber)

            return (
              <div key={round} className="flex-1 min-w-[160px]">
                <div className="text-xs font-semibold text-gray-500 text-center mb-2">
                  {ROUND_LABELS[round]}
                </div>
                <div className="space-y-2 flex flex-col justify-around h-full">
                  {roundMatches.map(match => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      allMatches={allMatches}
                      onPick={onPick}
                      canPick={canPick}
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

// --- Final Rounds (F4 + Championship) ---
function FinalRounds({
  matches,
  onPick,
  canPick,
}: {
  matches: MatchInfo[]
  onPick: (matchId: string, entrantId: string) => void
  canPick: boolean
}) {
  const f4Matches = matches.filter(m => m.round === 'F4').sort((a, b) => a.matchNumber - b.matchNumber)
  const champMatch = matches.find(m => m.round === 'CHAMP')

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-2xl font-bold text-center mb-6 text-indigo-600">🏆 Final Four & Championship</h3>
      <div className="flex flex-col items-center gap-6">
        <div className="flex gap-8 justify-center">
          {f4Matches.map(match => (
            <div key={match.id} className="w-64">
              <div className="text-xs font-semibold text-gray-500 text-center mb-2">
                {match.matchNumber === 1 ? 'iAdvisors vs xAdvisors' : 'Fin. Specialists vs wAdvisors'}
              </div>
              <MatchCard match={match} allMatches={matches} onPick={onPick} canPick={canPick} />
            </div>
          ))}
        </div>
        {champMatch && (
          <div className="w-72">
            <div className="text-sm font-bold text-yellow-600 text-center mb-2">👑 Championship</div>
            <MatchCard match={champMatch} allMatches={matches} onPick={onPick} canPick={canPick} isChamp />
          </div>
        )}
      </div>
    </div>
  )
}

// --- Individual Match Card ---
function MatchCard({
  match,
  allMatches,
  onPick,
  canPick,
  isChamp,
}: {
  match: MatchInfo
  allMatches: MatchInfo[]
  onPick: (matchId: string, entrantId: string) => void
  canPick: boolean
  isChamp?: boolean
}) {
  // Compute virtual entrants (from cascading picks for R32+)
  const { left, right } = computeVirtualEntrants(allMatches, match)
  const pickId = match.userPick?.pickedWinnerEntrantId
  const bothReady = !!left && !!right

  const renderEntrant = (entrant: EntrantInfo | null, side: 'left' | 'right') => {
    if (!entrant) {
      return (
        <div className="flex items-center p-1.5 border-2 border-dashed border-gray-200 rounded text-gray-400 text-xs">
          <span className="italic">TBD</span>
        </div>
      )
    }

    const isPicked = pickId === entrant.id
    const isActualWinner = match.winnerEntrant?.id === entrant.id
    const isActualLoser = match.winnerEntrant && match.winnerEntrant.id !== entrant.id
    const clickable = canPick && bothReady && !match.winnerEntrant

    let classes = 'flex items-center justify-between p-1.5 border-2 rounded text-xs transition-all '
    if (isActualWinner) {
      classes += 'bg-green-100 border-green-500 text-green-800 font-bold '
    } else if (isActualLoser) {
      classes += 'bg-gray-100 border-gray-300 text-gray-400 line-through '
    } else if (isPicked) {
      classes += 'bg-blue-100 border-blue-500 text-blue-800 font-semibold '
    } else {
      classes += 'bg-white border-gray-200 '
      if (clickable) classes += 'hover:border-blue-400 hover:bg-blue-50 cursor-pointer '
    }

    return (
      <div
        className={classes}
        onClick={() => clickable && onPick(match.id, entrant.id)}
      >
        <div className="flex items-center gap-1 overflow-hidden">
          <span className="bg-gray-200 text-gray-600 px-1 rounded text-[10px] font-bold shrink-0">
            {entrant.seed}
          </span>
          <span className="truncate">{entrant.displayName}</span>
        </div>
        {isPicked && <span className="text-blue-500 shrink-0">✓</span>}
        {isActualWinner && <span className="shrink-0">🏆</span>}
      </div>
    )
  }

  return (
    <div className={`rounded border ${isChamp ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200 bg-gray-50'} p-1.5 space-y-1`}>
      {renderEntrant(left, 'left')}
      <div className="text-center text-[10px] text-gray-400">vs</div>
      {renderEntrant(right, 'right')}
    </div>
  )
}
