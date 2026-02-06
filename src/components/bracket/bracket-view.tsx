'use client'

import { useState, useEffect, useCallback } from 'react'
import { computeVirtualEntrants, REGIONS } from '@/lib/bracket-progression'
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

const REGION_COLORS: Record<string, { bg: string; border: string; light: string }> = {
  IADVISORS: { bg: 'bg-blue-600', border: 'border-l-blue-500', light: 'bg-blue-500/10' },
  XADVISORS: { bg: 'bg-emerald-600', border: 'border-l-emerald-500', light: 'bg-emerald-500/10' },
  FINANCIAL_SPECIALISTS: { bg: 'bg-violet-600', border: 'border-l-violet-500', light: 'bg-violet-500/10' },
  WADVISORS: { bg: 'bg-rose-600', border: 'border-l-rose-500', light: 'bg-rose-500/10' },
}

export function BracketView({ bracketId, isLocked, isAdmin }: BracketViewProps) {
  const [matches, setMatches] = useState<MatchInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const fetchBracketData = useCallback(async () => {
    try {
      const res = await fetch(`/api/bracket/${bracketId}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setMatches(data.matches)
      setIsSubmitted(data.isSubmitted || false)
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

  const handleSubmitBracket = async () => {
    if (isLocked && !isAdmin) return
    setSubmitting(true)

    try {
      const res = await fetch(`/api/bracket/${bracketId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to submit')
      }
      setIsSubmitted(true)
      alert('🎉 Bracket submitted successfully!')
    } catch (err: any) {
      alert(err.message || 'Failed to submit bracket')
    } finally {
      setSubmitting(false)
    }
  }

  // Calculate completion
  const totalMatches = matches.length
  const pickedMatches = matches.filter(m => m.userPick).length
  const completionPercent = totalMatches > 0 ? Math.round((pickedMatches / totalMatches) * 100) : 0
  const isComplete = pickedMatches === totalMatches && totalMatches > 0

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-navy-300 border-t-navy-600 rounded-full animate-spin mx-auto mb-4" />
          <div className="text-navy-500 dark:text-navy-400">Loading bracket...</div>
        </div>
      </div>
    )
  }

  const canPick = !isLocked || isAdmin

  return (
    <div className="space-y-6">
      {saving && (
        <div className="fixed top-4 right-4 bg-navy-800 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Saving...
        </div>
      )}

      {/* Progress & Submit Bar */}
      {canPick && !isSubmitted && (
        <div className="card p-4 border-0 shadow-md bg-gradient-to-r from-navy-800 to-navy-700 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Bracket Progress</span>
                <span className="text-sm font-bold">{pickedMatches}/{totalMatches} picks ({completionPercent}%)</span>
              </div>
              <div className="w-full bg-navy-600 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full transition-all duration-500 ${isComplete ? 'bg-emerald-400' : 'bg-gold-400'}`}
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
            </div>
            <button
              onClick={handleSubmitBracket}
              disabled={!isComplete || submitting}
              className={`px-6 py-3 rounded-xl font-bold text-lg transition-all ${
                isComplete 
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/30 hover:scale-105' 
                  : 'bg-navy-600 text-navy-400 cursor-not-allowed'
              }`}
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </span>
              ) : isComplete ? (
                '🏀 Submit Bracket'
              ) : (
                `Complete all picks to submit`
              )}
            </button>
          </div>
        </div>
      )}

      {/* Submitted Banner */}
      {isSubmitted && (
        <div className="card p-4 border-0 shadow-md bg-gradient-to-r from-emerald-600 to-emerald-500 text-white">
          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl">🎉</span>
            <span className="font-bold text-lg">Bracket Submitted!</span>
            <span className="text-emerald-200">Good luck!</span>
          </div>
        </div>
      )}

      {/* Regional Brackets */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {REGIONS.map(region => (
          <RegionBracket
            key={region}
            region={region}
            allMatches={matches}
            onPick={handlePick}
            canPick={canPick && !isSubmitted}
          />
        ))}
      </div>

      {/* Final Four & Championship */}
      <FinalRounds matches={matches} onPick={handlePick} canPick={canPick && !isSubmitted} />
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
    <div className="card overflow-hidden border-0 shadow-md">
      {/* Region Header */}
      <div className={`${colors.bg} text-white px-4 py-3`}>
        <h3 className="font-bold text-center">{REGION_LABELS[region]}</h3>
      </div>
      
      {/* Bracket Grid */}
      <div className="p-3 overflow-x-auto bg-white dark:bg-navy-900">
        <div className="flex gap-2 min-w-[680px]">
          {regionalRounds.map((round, roundIdx) => {
            const roundMatches = allMatches
              .filter(m => m.round === round && m.region === region)
              .sort((a, b) => a.matchNumber - b.matchNumber)

            return (
              <div key={round} className="flex-1">
                <div className="text-[10px] font-bold text-navy-400 dark:text-navy-500 text-center mb-2 uppercase tracking-wider">
                  {round === 'R64' ? 'R64' : round === 'R32' ? 'R32' : round === 'S16' ? 'S16' : 'E8'}
                </div>
                <div className={`space-y-1 flex flex-col ${roundIdx === 0 ? '' : 'justify-around h-full'}`}>
                  {roundMatches.map(match => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      allMatches={allMatches}
                      onPick={onPick}
                      canPick={canPick}
                      regionColor={colors.border}
                      compact={roundIdx === 0}
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
    <div className="card p-6 border-0 shadow-md bg-gradient-to-br from-white to-navy-50 dark:from-navy-900 dark:to-navy-800">
      <div className="text-center mb-6">
        <span className="inline-flex items-center bg-navy-800 dark:bg-navy-700 text-white px-6 py-2 rounded-xl font-bold text-lg">
          🏆 Final Four & Championship
        </span>
      </div>
      
      <div className="flex flex-col items-center gap-6">
        {/* Final Four */}
        <div className="flex flex-wrap justify-center gap-6">
          {f4Matches.map((match, i) => (
            <div key={match.id} className="w-64">
              <div className="text-xs font-semibold text-navy-500 dark:text-navy-400 text-center mb-2">
                {i === 0 ? 'iAdvisors vs xAdvisors' : 'Fin. Specialists vs wAdvisors'}
              </div>
              <MatchCard
                match={match}
                allMatches={matches}
                onPick={onPick}
                canPick={canPick}
                regionColor="border-l-navy-400"
              />
            </div>
          ))}
        </div>

        {/* Championship */}
        {champMatch && (
          <div className="w-72">
            <div className="text-center mb-2">
              <span className="text-sm font-bold text-navy-600 dark:text-navy-300">👑 Championship</span>
            </div>
            <MatchCard
              match={champMatch}
              allMatches={matches}
              onPick={onPick}
              canPick={canPick}
              regionColor="border-l-navy-400"
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
  compact,
}: {
  match: MatchInfo
  allMatches: MatchInfo[]
  onPick: (matchId: string, entrantId: string) => void
  canPick: boolean
  regionColor: string
  isChamp?: boolean
  compact?: boolean
}) {
  const { left, right } = computeVirtualEntrants(allMatches, match)
  const pickId = match.userPick?.pickedWinnerEntrantId
  const bothReady = !!left && !!right

  const renderEntrant = (entrant: EntrantInfo | null) => {
    if (!entrant) {
      return (
        <div className="flex items-center px-2 py-1.5 border border-dashed border-navy-200 dark:border-navy-600 rounded text-navy-400 dark:text-navy-500 text-xs">
          <span className="italic">TBD</span>
        </div>
      )
    }

    const isPicked = pickId === entrant.id
    const isActualWinner = match.winnerEntrant?.id === entrant.id
    const isActualLoser = match.winnerEntrant && match.winnerEntrant.id !== entrant.id
    const clickable = canPick && bothReady && !match.winnerEntrant

    let classes = 'flex items-center justify-between px-2 py-1.5 border rounded text-xs transition-all '
    
    if (isActualWinner) {
      classes += 'bg-emerald-100 dark:bg-emerald-900/40 border-emerald-400 text-emerald-800 dark:text-emerald-200 font-bold '
    } else if (isActualLoser) {
      classes += 'bg-navy-100 dark:bg-navy-800 border-navy-200 dark:border-navy-700 text-navy-400 line-through opacity-50 '
    } else if (isPicked) {
      classes += 'bg-navy-100 dark:bg-navy-700 border-navy-400 text-navy-800 dark:text-white font-semibold '
    } else {
      classes += 'bg-white dark:bg-navy-800 border-navy-200 dark:border-navy-600 text-navy-700 dark:text-navy-200 '
      if (clickable) classes += 'hover:border-navy-400 hover:bg-navy-50 dark:hover:bg-navy-700 cursor-pointer '
    }

    return (
      <div className={classes} onClick={() => clickable && onPick(match.id, entrant.id)}>
        <div className="flex items-center gap-1.5 overflow-hidden">
          <span className="bg-navy-700 dark:bg-navy-600 text-white w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold shrink-0">
            {entrant.seed}
          </span>
          <span className="truncate">{entrant.displayName}</span>
        </div>
        <div className="flex items-center gap-0.5 shrink-0 ml-1">
          {isPicked && <span className="text-navy-500 dark:text-navy-300">✓</span>}
          {isActualWinner && <span className="text-xs">🏆</span>}
        </div>
      </div>
    )
  }

  return (
    <div className={`rounded-lg border-l-4 ${regionColor} ${isChamp ? 'bg-navy-100 dark:bg-navy-800 border border-navy-200 dark:border-navy-600' : 'bg-navy-50 dark:bg-navy-800/50'} p-1.5 space-y-1`}>
      {renderEntrant(left)}
      {!compact && <div className="text-center text-[9px] text-navy-400 dark:text-navy-500 font-semibold">VS</div>}
      {renderEntrant(right)}
    </div>
  )
}
