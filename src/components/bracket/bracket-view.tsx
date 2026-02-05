'use client'

import { useState, useEffect, useCallback } from 'react'
import { computeVirtualEntrants, REGIONS } from '@/lib/bracket-progression'
import type { MatchInfo, EntrantInfo, RoundName } from '@/lib/bracket-progression'

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

const REGION_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  IADVISORS: { bg: 'bg-blue-600', border: 'border-l-blue-500', text: 'text-blue-600' },
  XADVISORS: { bg: 'bg-emerald-600', border: 'border-l-emerald-500', text: 'text-emerald-600' },
  FINANCIAL_SPECIALISTS: { bg: 'bg-purple-600', border: 'border-l-purple-500', text: 'text-purple-600' },
  WADVISORS: { bg: 'bg-rose-600', border: 'border-l-rose-500', text: 'text-rose-600' },
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
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-xl text-navy-500 dark:text-navy-400">Loading bracket...</div>
      </div>
    )
  }

  const canPick = !isLocked || isAdmin

  return (
    <div className="space-y-6">
      {/* Lock Banner */}
      {isLocked && (
        <div className="card p-4 text-center border-l-4 border-l-rose-500">
          <span className="text-rose-700 dark:text-rose-300 font-semibold">
            🔒 Bracket Locked — No more changes allowed
            {isAdmin && ' (Admin override active)'}
          </span>
        </div>
      )}

      {/* Saving indicator */}
      {saving && (
        <div className="fixed top-20 right-4 bg-navy-400 text-navy-900 px-4 py-2 rounded-lg shadow-lg z-50 font-semibold">
          Saving...
        </div>
      )}

      {/* Regional Brackets */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {REGIONS.map(region => (
          <RegionBracket
            key={region}
            region={region}
            allMatches={matches}
            onPick={handlePick}
            canPick={canPick}
          />
        ))}
      </div>

      {/* Final Four & Championship */}
      <FinalRounds matches={matches} onPick={handlePick} canPick={canPick} />
    </div>
  )
}

function RegionBracket({
  region,
  allMatches,
  onPick,
  canPick,
}: {
  region: string
  allMatches: MatchInfo[]
  onPick: (matchId: string, entrantId: string) => void
  canPick: boolean
}) {
  const regionalRounds = ['R64', 'R32', 'S16', 'E8'] as const
  const colors = REGION_COLORS[region]

  return (
    <div className="card overflow-hidden">
      {/* Region Header */}
      <div className={`${colors.bg} text-white p-4`}>
        <h3 className="text-xl font-bold text-center">{REGION_LABELS[region]}</h3>
      </div>
      
      {/* Bracket Grid */}
      <div className="p-4 overflow-x-auto">
        <div className="flex gap-3 min-w-[720px]">
          {regionalRounds.map(round => {
            const roundMatches = allMatches
              .filter(m => m.round === round && m.region === region)
              .sort((a, b) => a.matchNumber - b.matchNumber)

            return (
              <div key={round} className="flex-1 min-w-[170px]">
                <div className="text-xs font-bold text-navy-500 dark:text-navy-400 text-center mb-3 uppercase tracking-wide">
                  {ROUND_LABELS[round]}
                </div>
                <div className="space-y-2 flex flex-col justify-around">
                  {roundMatches.map(match => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      allMatches={allMatches}
                      onPick={onPick}
                      canPick={canPick}
                      regionColor={colors.border}
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
    <div className="card p-6">
      <div className="text-center mb-6">
        <span className="inline-flex items-center bg-navy-400 text-navy-900 px-6 py-2 rounded-full font-bold text-lg">
          🏆 Final Four & Championship 🏆
        </span>
      </div>
      
      <div className="flex flex-col items-center gap-8">
        {/* Final Four */}
        <div className="flex flex-wrap justify-center gap-8">
          {f4Matches.map((match, i) => (
            <div key={match.id} className="w-72">
              <div className="text-sm font-semibold text-navy-500 dark:text-navy-400 text-center mb-2">
                {i === 0 ? 'iAdvisors vs xAdvisors' : 'Fin. Specialists vs wAdvisors'}
              </div>
              <MatchCard
                match={match}
                allMatches={matches}
                onPick={onPick}
                canPick={canPick}
                regionColor="border-l-navy-500"
              />
            </div>
          ))}
        </div>

        {/* Championship */}
        {champMatch && (
          <div className="w-80">
            <div className="text-center mb-2">
              <span className="text-lg font-bold text-navy-500 dark:text-navy-400">👑 Championship 👑</span>
            </div>
            <MatchCard
              match={champMatch}
              allMatches={matches}
              onPick={onPick}
              canPick={canPick}
              regionColor="border-l-navy-500"
              isChamp
            />
          </div>
        )}
      </div>
    </div>
  )
}

function MatchCard({
  match,
  allMatches,
  onPick,
  canPick,
  regionColor,
  isChamp,
}: {
  match: MatchInfo
  allMatches: MatchInfo[]
  onPick: (matchId: string, entrantId: string) => void
  canPick: boolean
  regionColor: string
  isChamp?: boolean
}) {
  const { left, right } = computeVirtualEntrants(allMatches, match)
  const pickId = match.userPick?.pickedWinnerEntrantId
  const bothReady = !!left && !!right

  const renderEntrant = (entrant: EntrantInfo | null) => {
    if (!entrant) {
      return (
        <div className="flex items-center p-2 border-2 border-dashed border-navy-200 dark:border-navy-600 rounded-lg text-navy-400 dark:text-navy-500 text-sm">
          <span className="italic">TBD</span>
        </div>
      )
    }

    const isPicked = pickId === entrant.id
    const isActualWinner = match.winnerEntrant?.id === entrant.id
    const isActualLoser = match.winnerEntrant && match.winnerEntrant.id !== entrant.id
    const clickable = canPick && bothReady && !match.winnerEntrant

    let classes = 'flex items-center justify-between p-2 border-2 rounded-lg text-sm transition-all '
    
    if (isActualWinner) {
      classes += 'bg-emerald-100 dark:bg-emerald-900/40 border-emerald-500 text-emerald-800 dark:text-emerald-200 font-bold '
    } else if (isActualLoser) {
      classes += 'bg-navy-100 dark:bg-navy-800 border-navy-200 dark:border-navy-700 text-navy-400 dark:text-navy-500 line-through opacity-60 '
    } else if (isPicked) {
      classes += 'bg-navy-200 dark:bg-navy-800/30 border-navy-400 text-navy-800 dark:text-navy-300 font-semibold '
    } else {
      classes += 'bg-white dark:bg-navy-800 border-navy-200 dark:border-navy-600 text-navy-700 dark:text-navy-200 '
      if (clickable) classes += 'hover:border-navy-400 hover:bg-navy-100 dark:hover:bg-navy-800/20 cursor-pointer '
    }

    return (
      <div
        className={classes}
        onClick={() => clickable && onPick(match.id, entrant.id)}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="bg-navy-800 dark:bg-navy-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
            {entrant.seed}
          </span>
          <span className="truncate">{entrant.displayName}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {isPicked && <span className="text-navy-500">✓</span>}
          {isActualWinner && <span>🏆</span>}
        </div>
      </div>
    )
  }

  return (
    <div className={`rounded-xl border-l-4 ${regionColor} ${isChamp ? 'bg-navy-100 dark:bg-navy-800/20 border border-navy-300 dark:border-gold-800' : 'bg-navy-50 dark:bg-navy-800/50 border border-navy-200 dark:border-navy-700'} p-2 space-y-1.5`}>
      {renderEntrant(left)}
      <div className="text-center text-xs text-navy-400 dark:text-navy-500 font-semibold">VS</div>
      {renderEntrant(right)}
    </div>
  )
}
