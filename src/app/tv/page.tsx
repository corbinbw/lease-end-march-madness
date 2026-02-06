'use client'

import { useState, useEffect } from 'react'

interface Entrant {
  id: string
  displayName: string
  region: string
  seed: number
}

interface Match {
  id: string
  round: string
  region: string | null
  matchNumber: number
  leftEntrant: Entrant | null
  rightEntrant: Entrant | null
  winnerEntrant: Entrant | null
}

const REGIONS_LEFT = ['IADVISORS', 'XADVISORS']
const REGIONS_RIGHT = ['FINANCIAL_SPECIALISTS', 'WADVISORS']

const REGION_DISPLAY: Record<string, string> = {
  IADVISORS: 'I-ADVISORS',
  XADVISORS: 'X-ADVISORS', 
  FINANCIAL_SPECIALISTS: 'FINANCIAL',
  WADVISORS: 'W-ADVISORS'
}

export default function TVDisplayPage() {
  const [entrants, setEntrants] = useState<Entrant[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    fetchTVData()
    const dataInterval = setInterval(fetchTVData, 30000)
    const timeInterval = setInterval(() => setTime(new Date()), 1000)
    return () => {
      clearInterval(dataInterval)
      clearInterval(timeInterval)
    }
  }, [])

  const fetchTVData = async () => {
    try {
      const response = await fetch('/api/tv-data')
      if (response.ok) {
        const data = await response.json()
        setEntrants(data.entrants || [])
        setMatches(data.matches || [])
      }
    } catch (error) {
      console.error('Error fetching TV data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getEntrantsByRegion = (region: string) => {
    return entrants.filter(e => e.region === region).sort((a, b) => a.seed - b.seed)
  }

  const getMatchesByRoundAndRegion = (round: string, region: string) => {
    return matches.filter(m => m.round === round && m.region === region).sort((a, b) => a.matchNumber - b.matchNumber)
  }

  const getFinalMatches = (round: string, matchNum?: number) => {
    return matches.filter(m => m.round === round && (matchNum === undefined || m.matchNumber === matchNum))
  }

  if (loading) {
    return (
      <div className="h-screen bg-[#0a0f1a] flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-4">
            LEASE END MM26
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    )
  }

  const champMatch = matches.find(m => m.round === 'CHAMP')
  const champion = champMatch?.winnerEntrant

  return (
    <div className="h-screen overflow-hidden relative bg-[#0a0f1a]">
      {/* Animated background */}
      <div className="absolute inset-0">
        {/* Court gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628] via-[#0d1f35] to-[#0a1628]" />
        
        {/* Stadium lights */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-cyan-400/5 rounded-full blur-[120px]" />
        
        {/* Grid overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(0,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.3) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}
        />
        
        {/* Crowd silhouette */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="text-3xl font-black tracking-tight">
            <span className="text-white">LEASE</span>
            <span className="text-cyan-400">END</span>
          </div>
          <div className="h-8 w-px bg-cyan-400/30" />
          <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-1.5 rounded-lg font-bold text-lg shadow-lg shadow-cyan-500/25">
            🏀 MM26
          </div>
        </div>
        
        <h1 className="absolute left-1/2 -translate-x-1/2 text-4xl md:text-5xl font-black tracking-wider">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-cyan-300 drop-shadow-[0_0_30px_rgba(34,211,238,0.5)]">
            MARCH MADNESS 2026
          </span>
        </h1>

        <div className="text-right">
          <div className="text-cyan-400/60 text-xs font-medium">LIVE</div>
          <div className="text-white font-mono text-lg">{time.toLocaleTimeString()}</div>
        </div>
      </header>

      {/* Main bracket area */}
      <div className="relative z-10 flex h-[calc(100vh-140px)] px-2">
        
        {/* LEFT BRACKET */}
        <div className="flex-1 flex">
          {/* R64 - Left regions */}
          <div className="w-[160px] flex flex-col">
            {REGIONS_LEFT.map((region, ri) => (
              <div key={region} className="flex-1 flex flex-col py-1">
                <div className="text-[10px] font-bold text-cyan-400/70 px-2 mb-1">{REGION_DISPLAY[region]}</div>
                <R64Column entrants={getEntrantsByRegion(region)} side="left" />
              </div>
            ))}
          </div>

          {/* R32 */}
          <div className="w-[130px] flex flex-col">
            {REGIONS_LEFT.map(region => (
              <div key={region} className="flex-1">
                <MatchColumn matches={getMatchesByRoundAndRegion('R32', region)} side="left" round="R32" />
              </div>
            ))}
          </div>

          {/* S16 */}
          <div className="w-[130px] flex flex-col">
            {REGIONS_LEFT.map(region => (
              <div key={region} className="flex-1">
                <MatchColumn matches={getMatchesByRoundAndRegion('S16', region)} side="left" round="S16" />
              </div>
            ))}
          </div>

          {/* E8 */}
          <div className="w-[130px] flex flex-col">
            {REGIONS_LEFT.map(region => (
              <div key={region} className="flex-1">
                <MatchColumn matches={getMatchesByRoundAndRegion('E8', region)} side="left" round="E8" />
              </div>
            ))}
          </div>

          {/* F4 - Left */}
          <div className="w-[130px] flex items-center justify-center">
            <MatchColumn matches={getFinalMatches('F4', 1)} side="left" round="F4" />
          </div>
        </div>

        {/* CENTER - CHAMPIONSHIP */}
        <div className="w-[200px] flex flex-col items-center justify-center px-4">
          {/* Finals matchup */}
          <div className="w-full mb-4">
            <div className="text-center text-cyan-400/60 text-xs font-bold mb-2">CHAMPIONSHIP</div>
            {champMatch && (
              <div className="space-y-2">
                <MatchSlot 
                  entrant={champMatch.leftEntrant} 
                  isWinner={champion?.id === champMatch.leftEntrant?.id}
                  side="center"
                />
                <div className="text-center text-cyan-400/40 text-xs">VS</div>
                <MatchSlot 
                  entrant={champMatch.rightEntrant}
                  isWinner={champion?.id === champMatch.rightEntrant?.id}
                  side="center"
                />
              </div>
            )}
          </div>

          {/* Champion display */}
          <div className="relative w-full">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 via-yellow-400/30 to-amber-500/20 rounded-xl blur-xl" />
            <div className="relative bg-gradient-to-b from-[#1a2744] to-[#0d1a2d] border-2 border-amber-400/50 rounded-xl p-4 shadow-2xl">
              <div className="text-center">
                <div className="text-amber-400 text-xs font-bold tracking-widest mb-1">👑 CHAMPION 👑</div>
                {champion ? (
                  <div className="text-2xl font-black text-white drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]">
                    {champion.displayName}
                  </div>
                ) : (
                  <div className="text-xl text-cyan-400/30 font-bold">TBD</div>
                )}
              </div>
            </div>
          </div>

          {/* Logo */}
          <div className="mt-4 text-center">
            <div className="inline-block bg-[#0d1a2d] border border-cyan-400/20 rounded-lg px-4 py-2">
              <div className="text-lg font-black">
                <span className="text-white">LEASE</span>
                <span className="text-cyan-400">END</span>
              </div>
              <div className="text-amber-400 text-sm font-black tracking-wider">MADNESS</div>
            </div>
          </div>
        </div>

        {/* RIGHT BRACKET */}
        <div className="flex-1 flex flex-row-reverse">
          {/* R64 - Right regions */}
          <div className="w-[160px] flex flex-col">
            {REGIONS_RIGHT.map((region, ri) => (
              <div key={region} className="flex-1 flex flex-col py-1">
                <div className="text-[10px] font-bold text-cyan-400/70 px-2 mb-1 text-right">{REGION_DISPLAY[region]}</div>
                <R64Column entrants={getEntrantsByRegion(region)} side="right" />
              </div>
            ))}
          </div>

          {/* R32 */}
          <div className="w-[130px] flex flex-col">
            {REGIONS_RIGHT.map(region => (
              <div key={region} className="flex-1">
                <MatchColumn matches={getMatchesByRoundAndRegion('R32', region)} side="right" round="R32" />
              </div>
            ))}
          </div>

          {/* S16 */}
          <div className="w-[130px] flex flex-col">
            {REGIONS_RIGHT.map(region => (
              <div key={region} className="flex-1">
                <MatchColumn matches={getMatchesByRoundAndRegion('S16', region)} side="right" round="S16" />
              </div>
            ))}
          </div>

          {/* E8 */}
          <div className="w-[130px] flex flex-col">
            {REGIONS_RIGHT.map(region => (
              <div key={region} className="flex-1">
                <MatchColumn matches={getMatchesByRoundAndRegion('E8', region)} side="right" round="E8" />
              </div>
            ))}
          </div>

          {/* F4 - Right */}
          <div className="w-[130px] flex items-center justify-center">
            <MatchColumn matches={getFinalMatches('F4', 2)} side="right" round="F4" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 z-10 px-6 py-2 flex justify-between items-center text-xs">
        <div className="flex gap-8 text-cyan-400/50 font-medium">
          <span>R64: Mar 4-6</span>
          <span>R32: Mar 7-11</span>
          <span>S16: Mar 12-14</span>
          <span>E8: Mar 15-19</span>
          <span>F4: Mar 20-22</span>
          <span>FINAL: Mar 25-29</span>
        </div>
        <div className="text-cyan-400/30">
          Auto-refresh: 30s • {entrants.length} competitors
        </div>
      </footer>
    </div>
  )
}

function R64Column({ entrants, side }: { entrants: Entrant[]; side: 'left' | 'right' }) {
  const matchupOrder = [[1,16],[8,9],[5,12],[4,13],[6,11],[3,14],[7,10],[2,15]]
  
  return (
    <div className="flex flex-col justify-around h-full gap-[2px]">
      {matchupOrder.map(([s1, s2], i) => {
        const e1 = entrants.find(e => e.seed === s1)
        const e2 = entrants.find(e => e.seed === s2)
        return (
          <div key={i} className="flex flex-col gap-[1px]">
            <MatchSlot entrant={e1} seed={e1?.seed} side={side} small />
            <MatchSlot entrant={e2} seed={e2?.seed} side={side} small />
          </div>
        )
      })}
    </div>
  )
}

function MatchColumn({ matches, side, round }: { matches: Match[]; side: 'left' | 'right'; round: string }) {
  return (
    <div className="flex flex-col justify-around h-full py-2">
      {matches.map(match => (
        <div key={match.id} className="flex flex-col gap-[2px]">
          <MatchSlot 
            entrant={match.leftEntrant}
            isWinner={match.winnerEntrant?.id === match.leftEntrant?.id}
            side={side}
          />
          <MatchSlot 
            entrant={match.rightEntrant}
            isWinner={match.winnerEntrant?.id === match.rightEntrant?.id}
            side={side}
          />
        </div>
      ))}
    </div>
  )
}

function MatchSlot({ 
  entrant, 
  seed, 
  isWinner = false, 
  side,
  small = false
}: { 
  entrant?: Entrant | null
  seed?: number
  isWinner?: boolean
  side: 'left' | 'right' | 'center'
  small?: boolean
}) {
  const displayName = entrant?.displayName || ''
  const shortName = displayName.length > 14 ? displayName.slice(0, 13) + '…' : displayName
  const showSeed = seed !== undefined
  
  return (
    <div 
      className={`
        relative flex items-center gap-1 rounded transition-all duration-300
        ${small ? 'px-1.5 py-[2px] text-[9px]' : 'px-2 py-1 text-[11px]'}
        ${side === 'right' ? 'flex-row-reverse text-right' : ''}
        ${side === 'center' ? 'justify-center' : ''}
        ${isWinner 
          ? 'bg-gradient-to-r from-emerald-600/80 to-emerald-500/60 text-white shadow-lg shadow-emerald-500/20 border border-emerald-400/50' 
          : entrant 
            ? 'bg-[#12243d] text-cyan-100 border border-cyan-400/10 hover:border-cyan-400/30' 
            : 'bg-[#0a1525] text-cyan-400/20 border border-transparent'
        }
      `}
    >
      {showSeed && (
        <span className={`
          font-bold min-w-[16px] text-center
          ${isWinner ? 'text-emerald-200' : 'text-cyan-500'}
        `}>
          {seed}
        </span>
      )}
      <span className={`truncate font-semibold ${side === 'center' ? 'text-center' : 'flex-1'}`}>
        {shortName || (entrant === null ? '—' : '')}
      </span>
      {isWinner && (
        <span className="text-emerald-300 ml-1">✓</span>
      )}
    </div>
  )
}
