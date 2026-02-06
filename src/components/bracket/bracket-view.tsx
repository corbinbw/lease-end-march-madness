'use client'

import { useState, useEffect, useCallback } from 'react'
import { computeVirtualEntrants, REGIONS } from '@/lib/bracket-progression'
import type { MatchInfo, EntrantInfo } from '@/lib/bracket-progression'

interface BracketViewProps {
  bracketId: string
  isLocked: boolean
  isAdmin: boolean
}

const ROUND_ORDER = ['R64', 'R32', 'S16', 'E8', 'F4', 'CHAMP'] as const

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
  FINANCIAL_SPECIALISTS: 'Fin. Specialists',
  WADVISORS: 'wAdvisors',
}

const REGION_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  IADVISORS: { bg: 'bg-blue-600', border: 'border-blue-500', text: 'text-blue-400' },
  XADVISORS: { bg: 'bg-emerald-600', border: 'border-emerald-500', text: 'text-emerald-400' },
  FINANCIAL_SPECIALISTS: { bg: 'bg-violet-600', border: 'border-violet-500', text: 'text-violet-400' },
  WADVISORS: { bg: 'bg-rose-600', border: 'border-rose-500', text: 'text-rose-400' },
}

export function BracketView({ bracketId, isLocked, isAdmin }: BracketViewProps) {
  const [matches, setMatches] = useState<MatchInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [activeRegion, setActiveRegion] = useState<string>(REGIONS[0])
  const [activeRound, setActiveRound] = useState<string>('R64')

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
    if ((isLocked && !isAdmin) || isSubmitted) return
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
    if ((isLocked && !isAdmin) || isSubmitted) return
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

  // Calculate region completion
  const getRegionCompletion = (region: string) => {
    const regionMatches = matches.filter(m => m.region === region)
    const picked = regionMatches.filter(m => m.userPick).length
    return { picked, total: regionMatches.length }
  }

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

  const canPick = (!isLocked || isAdmin) && !isSubmitted

  // Get matches for mobile view
  const getMobileMatches = () => {
    if (activeRound === 'F4' || activeRound === 'CHAMP') {
      return matches.filter(m => m.round === activeRound)
    }
    return matches.filter(m => m.round === activeRound && m.region === activeRegion)
  }

  return (
    <div className="space-y-4">
      {saving && (
        <div className="fixed top-4 right-4 bg-navy-800 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Saving...
        </div>
      )}

      {/* Progress & Submit Bar */}
      {!isSubmitted && (
        <div className="card p-3 sm:p-4 border-0 shadow-md bg-gradient-to-r from-navy-800 to-navy-700 text-white">
          <div className="flex flex-col gap-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs sm:text-sm font-medium">Bracket Progress</span>
                <span className="text-xs sm:text-sm font-bold">{pickedMatches}/{totalMatches} ({completionPercent}%)</span>
              </div>
              <div className="w-full bg-navy-600 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${isComplete ? 'bg-emerald-400' : 'bg-amber-400'}`}
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
            </div>
            {canPick && (
              <button
                onClick={handleSubmitBracket}
                disabled={!isComplete || submitting}
                className={`w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold text-sm sm:text-base transition-all ${
                  isComplete 
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/30' 
                    : 'bg-navy-600 text-navy-400 cursor-not-allowed'
                }`}
              >
                {submitting ? 'Submitting...' : isComplete ? '🏀 Submit Bracket' : 'Complete all picks to submit'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Submitted Banner */}
      {isSubmitted && (
        <div className="card p-3 sm:p-4 border-0 shadow-md bg-gradient-to-r from-emerald-600 to-emerald-500 text-white">
          <div className="flex items-center justify-center gap-2">
            <span className="text-xl">🎉</span>
            <span className="font-bold">Bracket Submitted!</span>
            <span className="text-emerald-200 text-sm">Good luck!</span>
          </div>
        </div>
      )}

      {/* MOBILE VIEW */}
      <div className="lg:hidden space-y-3">
        {/* Round Selector */}
        <div className="flex overflow-x-auto gap-1 pb-2 -mx-2 px-2">
          {ROUND_ORDER.map(round => {
            const roundMatches = matches.filter(m => m.round === round)
            const picked = roundMatches.filter(m => m.userPick).length
            const complete = picked === roundMatches.length
            return (
              <button
                key={round}
                onClick={() => setActiveRound(round)}
                className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeRound === round
                    ? 'bg-navy-700 text-white'
                    : complete
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                    : 'bg-navy-100 dark:bg-navy-800 text-navy-600 dark:text-navy-300'
                }`}
              >
                {round === 'R64' ? 'R64' : round === 'R32' ? 'R32' : round === 'S16' ? 'S16' : round === 'E8' ? 'E8' : round === 'F4' ? 'F4' : '🏆'}
                {complete && <span className="ml-1">✓</span>}
              </button>
            )
          })}
        </div>

        {/* Region Selector (only for regional rounds) */}
        {!['F4', 'CHAMP'].includes(activeRound) && (
          <div className="grid grid-cols-4 gap-1">
            {REGIONS.map(region => {
              const { picked, total } = getRegionCompletion(region)
              const colors = REGION_COLORS[region]
              const isActive = activeRegion === region
              return (
                <button
                  key={region}
                  onClick={() => setActiveRegion(region)}
                  className={`px-2 py-2 rounded-lg text-[10px] font-bold transition-all border-2 ${
                    isActive 
                      ? `${colors.bg} text-white border-transparent`
                      : `bg-white dark:bg-navy-800 ${colors.text} ${colors.border}`
                  }`}
                >
                  <div className="truncate">{REGION_LABELS[region].split(' ')[0]}</div>
                  <div className="text-[9px] opacity-70">{picked}/{total}</div>
                </button>
              )
            })}
          </div>
        )}

        {/* Mobile Match List */}
        <div className="space-y-2">
          {getMobileMatches().map(match => (
            <MobileMatchCard
              key={match.id}
              match={match}
              allMatches={matches}
              onPick={handlePick}
              canPick={canPick}
            />
          ))}
        </div>
      </div>

      {/* DESKTOP VIEW */}
      <div className="hidden lg:block space-y-4">
        {/* Regional Brackets */}
        <div className="grid grid-cols-2 gap-4">
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
    </div>
  )
}

function MobileMatchCard({
  match,
  allMatches,
  onPick,
  canPick,
}: {
  match: MatchInfo
  allMatches: MatchInfo[]
  onPick: (matchId: string, entrantId: string) => void
  canPick: boolean
}) {
  const { left, right } = computeVirtualEntrants(allMatches, match)
  const pickId = match.userPick?.pickedWinnerEntrantId
  const bothReady = !!left && !!right

  const renderEntrant = (entrant: EntrantInfo | null, position: 'top' | 'bottom') => {
    if (!entrant) {
      return (
        <div className="flex items-center justify-between px-3 py-3 bg-navy-100 dark:bg-navy-800 rounded-lg border border-dashed border-navy-300 dark:border-navy-600">
          <span className="text-navy-400 text-sm italic">Waiting for winner...</span>
        </div>
      )
    }

    const isPicked = pickId === entrant.id
    const isActualWinner = match.winnerEntrant?.id === entrant.id
    const isActualLoser = match.winnerEntrant && match.winnerEntrant.id !== entrant.id
    const clickable = canPick && bothReady && !match.winnerEntrant

    return (
      <button
        onClick={() => clickable && onPick(match.id, entrant.id)}
        disabled={!clickable}
        className={`w-full flex items-center justify-between px-3 py-3 rounded-lg border-2 transition-all text-left ${
          isActualWinner
            ? 'bg-emerald-100 dark:bg-emerald-900/40 border-emerald-400 text-emerald-800 dark:text-emerald-200'
            : isActualLoser
            ? 'bg-navy-100 dark:bg-navy-800 border-navy-200 dark:border-navy-700 text-navy-400 opacity-50'
            : isPicked
            ? 'bg-navy-200 dark:bg-navy-700 border-navy-500 text-navy-900 dark:text-white'
            : clickable
            ? 'bg-white dark:bg-navy-800 border-navy-200 dark:border-navy-600 hover:border-navy-400 hover:bg-navy-50 dark:hover:bg-navy-700'
            : 'bg-white dark:bg-navy-800 border-navy-200 dark:border-navy-600'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="bg-navy-700 dark:bg-navy-600 text-white w-6 h-6 rounded flex items-center justify-center text-xs font-bold">
            {entrant.seed}
          </span>
          <span className={`font-medium ${isActualLoser ? 'line-through' : ''}`}>
            {entrant.displayName}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {isPicked && !isActualWinner && <span className="text-navy-500">✓</span>}
          {isActualWinner && <span>🏆</span>}
        </div>
      </button>
    )
  }

  return (
    <div className="card p-3 space-y-2">
      <div className="text-xs text-navy-500 dark:text-navy-400 font-medium text-center">
        Match {match.matchNumber}
      </div>
      {renderEntrant(left, 'top')}
      <div className="text-center text-xs text-navy-400 font-bold">VS</div>
      {renderEntrant(right, 'bottom')}
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
      <div className={`${colors.bg} text-white px-4 py-2`}>
        <h3 className="font-bold text-center text-sm">{REGION_LABELS[region]}</h3>
      </div>
      
      <div className="p-2 overflow-x-auto bg-white dark:bg-navy-900">
        <div className="flex gap-1 min-w-[600px]">
          {regionalRounds.map((round, roundIdx) => {
            const roundMatches = allMatches
              .filter(m => m.round === round && m.region === region)
              .sort((a, b) => a.matchNumber - b.matchNumber)

            return (
              <div key={round} className="flex-1">
                <div className="text-[9px] font-bold text-navy-400 dark:text-navy-500 text-center mb-1 uppercase">
                  {round}
                </div>
                <div className={`space-y-0.5 flex flex-col ${roundIdx === 0 ? '' : 'justify-around h-full'}`}>
                  {roundMatches.map(match => (
                    <CompactMatchCard
                      key={match.id}
                      match={match}
                      allMatches={allMatches}
                      onPick={onPick}
                      canPick={canPick}
                      regionBorder={colors.border}
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
    <div className="card p-4 border-0 shadow-md bg-gradient-to-br from-white to-navy-50 dark:from-navy-900 dark:to-navy-800">
      <div className="text-center mb-4">
        <span className="inline-flex items-center bg-navy-800 dark:bg-navy-700 text-white px-4 py-1.5 rounded-xl font-bold">
          🏆 Final Four & Championship
        </span>
      </div>
      
      <div className="flex flex-col items-center gap-4">
        <div className="flex flex-wrap justify-center gap-4">
          {f4Matches.map((match, i) => (
            <div key={match.id} className="w-56">
              <div className="text-xs font-medium text-navy-500 dark:text-navy-400 text-center mb-1">
                Semifinal {i + 1}
              </div>
              <CompactMatchCard
                match={match}
                allMatches={matches}
                onPick={onPick}
                canPick={canPick}
                regionBorder="border-navy-400"
              />
            </div>
          ))}
        </div>

        {champMatch && (
          <div className="w-64">
            <div className="text-center mb-1">
              <span className="text-sm font-bold text-navy-600 dark:text-navy-300">👑 Championship</span>
            </div>
            <CompactMatchCard
              match={champMatch}
              allMatches={matches}
              onPick={onPick}
              canPick={canPick}
              regionBorder="border-amber-500"
              isChamp
            />
          </div>
        )}
      </div>
    </div>
  )
}

function CompactMatchCard({
  match,
  allMatches,
  onPick,
  canPick,
  regionBorder,
  isChamp,
}: {
  match: MatchInfo
  allMatches: MatchInfo[]
  onPick: (matchId: string, entrantId: string) => void
  canPick: boolean
  regionBorder: string
  isChamp?: boolean
}) {
  const { left, right } = computeVirtualEntrants(allMatches, match)
  const pickId = match.userPick?.pickedWinnerEntrantId
  const bothReady = !!left && !!right

  const renderEntrant = (entrant: EntrantInfo | null) => {
    if (!entrant) {
      return (
        <div className="flex items-center px-1.5 py-1 border border-dashed border-navy-200 dark:border-navy-600 rounded text-navy-400 text-[10px]">
          <span className="italic">TBD</span>
        </div>
      )
    }

    const isPicked = pickId === entrant.id
    const isActualWinner = match.winnerEntrant?.id === entrant.id
    const isActualLoser = match.winnerEntrant && match.winnerEntrant.id !== entrant.id
    const clickable = canPick && bothReady && !match.winnerEntrant

    return (
      <div 
        onClick={() => clickable && onPick(match.id, entrant.id)}
        className={`flex items-center justify-between px-1.5 py-1 border rounded text-[10px] transition-all ${
          isActualWinner
            ? 'bg-emerald-100 dark:bg-emerald-900/40 border-emerald-400 text-emerald-800 dark:text-emerald-200 font-bold'
            : isActualLoser
            ? 'bg-navy-100 dark:bg-navy-800 border-navy-200 dark:border-navy-700 text-navy-400 line-through opacity-50'
            : isPicked
            ? 'bg-navy-100 dark:bg-navy-700 border-navy-400 text-navy-800 dark:text-white font-semibold'
            : clickable
            ? 'bg-white dark:bg-navy-800 border-navy-200 dark:border-navy-600 hover:border-navy-400 cursor-pointer'
            : 'bg-white dark:bg-navy-800 border-navy-200 dark:border-navy-600'
        }`}
      >
        <div className="flex items-center gap-1 overflow-hidden">
          <span className="bg-navy-700 dark:bg-navy-600 text-white w-4 h-4 rounded flex items-center justify-center text-[8px] font-bold shrink-0">
            {entrant.seed}
          </span>
          <span className="truncate">{entrant.displayName}</span>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          {isPicked && !isActualWinner && <span className="text-navy-500">✓</span>}
          {isActualWinner && <span className="text-[8px]">🏆</span>}
        </div>
      </div>
    )
  }

  return (
    <div className={`rounded border-l-2 ${regionBorder} ${isChamp ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800' : 'bg-navy-50 dark:bg-navy-800/50'} p-1 space-y-0.5`}>
      {renderEntrant(left)}
      {renderEntrant(right)}
    </div>
  )
}
