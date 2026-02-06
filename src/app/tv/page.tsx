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

const REGIONS = {
  left: ['IADVISORS', 'XADVISORS'],
  right: ['FINANCIAL_SPECIALISTS', 'WADVISORS']
}

const REGION_NAMES: Record<string, string> = {
  IADVISORS: 'I-Advisors',
  XADVISORS: 'X-Advisors',
  FINANCIAL_SPECIALISTS: 'Financial Specialists',
  WADVISORS: 'W-Advisors'
}

const ROUND_ORDER = ['R64', 'R32', 'S16', 'E8', 'F4', 'CHAMP']

export default function TVDisplayPage() {
  const [entrants, setEntrants] = useState<Entrant[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTVData()
    const interval = setInterval(fetchTVData, 30000)
    return () => clearInterval(interval)
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
    return entrants
      .filter(e => e.region === region)
      .sort((a, b) => a.seed - b.seed)
  }

  const getMatchesByRoundAndRegion = (round: string, region: string | null) => {
    return matches
      .filter(m => m.round === round && m.region === region)
      .sort((a, b) => a.matchNumber - b.matchNumber)
  }

  const getMatchByRoundNumber = (round: string, matchNumber: number, region: string | null = null) => {
    return matches.find(m => m.round === round && m.matchNumber === matchNumber && m.region === region)
  }

  if (loading) {
    return (
      <div className="h-screen bg-[#0a1628] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl font-bold text-white mb-4">LEASE END MM26</div>
          <div className="w-8 h-8 border-4 border-[#3d8eff] border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen text-white relative overflow-auto"
      style={{
        background: 'linear-gradient(180deg, #0a1628 0%, #1a3a5c 50%, #0a1628 100%)',
      }}
    >
      {/* Arena lighting effect */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, rgba(61, 142, 255, 0.15) 0%, transparent 50%)',
        }}
      />
      
      {/* Court lines overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(90deg, transparent 49.5%, #3d8eff 49.5%, #3d8eff 50.5%, transparent 50.5%),
            radial-gradient(circle at 50% 60%, transparent 15%, #3d8eff 15%, #3d8eff 15.5%, transparent 15.5%)
          `,
        }}
      />

      {/* Header */}
      <div className="relative z-10 text-center py-6">
        <h1 className="text-5xl md:text-7xl font-black tracking-wider text-white" style={{ textShadow: '0 0 30px rgba(61, 142, 255, 0.5)' }}>
          LEASE END MM26
        </h1>
      </div>

      {/* Round Labels - Top */}
      <div className="relative z-10 flex justify-between items-center px-4 text-xs md:text-sm font-bold text-[#7eb8ff] mb-2">
        <div className="flex-1 flex justify-around">
          <span>Round of 64</span>
          <span>Round of 32</span>
          <span>Sweet 16</span>
          <span>Elite 8</span>
        </div>
        <div className="w-32 md:w-48 text-center">Final 4</div>
        <div className="flex-1 flex justify-around">
          <span>Elite 8</span>
          <span>Sweet 16</span>
          <span>Round of 32</span>
          <span>Round of 64</span>
        </div>
      </div>

      {/* Main Bracket */}
      <div className="relative z-10 flex items-stretch min-h-[80vh] px-2">
        
        {/* Left Side Bracket */}
        <div className="flex-1 flex">
          {/* Left Regions - R64 */}
          <div className="flex flex-col justify-around py-2 w-[140px] md:w-[180px]">
            {REGIONS.left.map(region => (
              <RegionColumn 
                key={region} 
                region={region}
                entrants={getEntrantsByRegion(region)}
                side="left"
              />
            ))}
          </div>
          
          {/* R32 */}
          <RoundColumn 
            matches={[...getMatchesByRoundAndRegion('R32', REGIONS.left[0]), ...getMatchesByRoundAndRegion('R32', REGIONS.left[1])]}
            side="left"
          />
          
          {/* S16 */}
          <RoundColumn 
            matches={[...getMatchesByRoundAndRegion('S16', REGIONS.left[0]), ...getMatchesByRoundAndRegion('S16', REGIONS.left[1])]}
            side="left"
          />
          
          {/* E8 */}
          <RoundColumn 
            matches={[...getMatchesByRoundAndRegion('E8', REGIONS.left[0]), ...getMatchesByRoundAndRegion('E8', REGIONS.left[1])]}
            side="left"
          />

          {/* F4 Left */}
          <RoundColumn 
            matches={matches.filter(m => m.round === 'F4' && m.matchNumber === 1)}
            side="left"
            isFinal
          />
        </div>

        {/* Center - Champion */}
        <div className="w-32 md:w-48 flex flex-col items-center justify-center">
          <div className="text-center mb-4">
            <div className="text-[#7eb8ff] text-sm font-bold mb-1">Mar 25-29</div>
          </div>
          
          <div className="bg-[#0d2847] border-2 border-[#3d8eff] rounded-lg p-4 mb-4">
            <div className="text-[#ffd700] text-lg font-bold text-center mb-2">Champion</div>
            {(() => {
              const champMatch = matches.find(m => m.round === 'CHAMP')
              return champMatch?.winnerEntrant ? (
                <div className="text-white text-center font-bold text-lg">
                  {champMatch.winnerEntrant.displayName}
                </div>
              ) : (
                <div className="text-[#5a7a9a] text-center text-sm">TBD</div>
              )
            })()}
          </div>

          <div className="text-center">
            <div className="bg-[#0d2847] border border-[#3d8eff] rounded px-3 py-2">
              <div className="text-[#3d8eff] text-xs font-bold">LEASE</div>
              <div className="text-white text-xs font-bold">END</div>
              <div className="text-[#ffd700] text-lg font-black">MARCH</div>
              <div className="text-[#ffd700] text-lg font-black">MADNESS</div>
            </div>
          </div>
        </div>

        {/* Right Side Bracket */}
        <div className="flex-1 flex flex-row-reverse">
          {/* Right Regions - R64 */}
          <div className="flex flex-col justify-around py-2 w-[140px] md:w-[180px]">
            {REGIONS.right.map(region => (
              <RegionColumn 
                key={region} 
                region={region}
                entrants={getEntrantsByRegion(region)}
                side="right"
              />
            ))}
          </div>
          
          {/* R32 */}
          <RoundColumn 
            matches={[...getMatchesByRoundAndRegion('R32', REGIONS.right[0]), ...getMatchesByRoundAndRegion('R32', REGIONS.right[1])]}
            side="right"
          />
          
          {/* S16 */}
          <RoundColumn 
            matches={[...getMatchesByRoundAndRegion('S16', REGIONS.right[0]), ...getMatchesByRoundAndRegion('S16', REGIONS.right[1])]}
            side="right"
          />
          
          {/* E8 */}
          <RoundColumn 
            matches={[...getMatchesByRoundAndRegion('E8', REGIONS.right[0]), ...getMatchesByRoundAndRegion('E8', REGIONS.right[1])]}
            side="right"
          />

          {/* F4 Right */}
          <RoundColumn 
            matches={matches.filter(m => m.round === 'F4' && m.matchNumber === 2)}
            side="right"
            isFinal
          />
        </div>
      </div>

      {/* Date Labels - Bottom */}
      <div className="relative z-10 flex justify-between items-center px-4 text-xs md:text-sm font-bold text-[#7eb8ff] mt-2 pb-4">
        <div className="flex-1 flex justify-around">
          <span>Mar 4-6</span>
          <span>Mar 7-11</span>
          <span>Mar 12-14</span>
          <span>Mar 15-19</span>
          <span>Mar 20-22</span>
        </div>
        <div className="w-32 md:w-48 text-center">
          <span className="text-lg font-black text-white">LEASE</span>
          <span className="text-lg font-black text-[#3d8eff]">END</span>
        </div>
        <div className="flex-1 flex justify-around">
          <span>Mar 20-22</span>
          <span>Mar 15-19</span>
          <span>Mar 12-14</span>
          <span>Mar 7-11</span>
          <span>Mar 4-6</span>
        </div>
      </div>
    </div>
  )
}

function RegionColumn({ region, entrants, side }: { region: string; entrants: Entrant[]; side: 'left' | 'right' }) {
  // Create matchups (1v16, 8v9, 5v12, 4v13, 6v11, 3v14, 7v10, 2v15)
  const matchupOrder = [
    [1, 16], [8, 9], [5, 12], [4, 13], [6, 11], [3, 14], [7, 10], [2, 15]
  ]

  return (
    <div className="flex-1 flex flex-col justify-around">
      {matchupOrder.map(([topSeed, bottomSeed], i) => {
        const topEntrant = entrants.find(e => e.seed === topSeed)
        const bottomEntrant = entrants.find(e => e.seed === bottomSeed)
        
        return (
          <div key={i} className="flex flex-col gap-[2px]">
            <EntrantRow entrant={topEntrant} side={side} showSeed />
            <EntrantRow entrant={bottomEntrant} side={side} showSeed />
          </div>
        )
      })}
    </div>
  )
}

function RoundColumn({ matches, side, isFinal = false }: { matches: Match[]; side: 'left' | 'right'; isFinal?: boolean }) {
  return (
    <div className={`flex flex-col justify-around py-2 ${isFinal ? 'w-[100px] md:w-[130px]' : 'w-[100px] md:w-[140px]'}`}>
      {matches.map((match, i) => (
        <div key={match.id} className="flex flex-col gap-[2px]">
          <EntrantRow 
            entrant={match.leftEntrant || (match.winnerEntrant ? null : undefined)} 
            side={side}
            isWinner={match.winnerEntrant?.id === match.leftEntrant?.id}
            showTBD={!match.leftEntrant}
          />
          <EntrantRow 
            entrant={match.rightEntrant || (match.winnerEntrant ? null : undefined)} 
            side={side}
            isWinner={match.winnerEntrant?.id === match.rightEntrant?.id}
            showTBD={!match.rightEntrant}
          />
        </div>
      ))}
    </div>
  )
}

function EntrantRow({ 
  entrant, 
  side, 
  showSeed = false, 
  isWinner = false,
  showTBD = false 
}: { 
  entrant?: Entrant | null
  side: 'left' | 'right'
  showSeed?: boolean
  isWinner?: boolean
  showTBD?: boolean
}) {
  const name = entrant?.displayName || (showTBD ? '' : '—')
  const shortName = name.length > 12 ? name.slice(0, 11) + '.' : name
  
  return (
    <div 
      className={`
        flex items-center gap-1 px-1 py-[2px] text-[10px] md:text-xs
        ${side === 'right' ? 'flex-row-reverse text-right' : ''}
        ${isWinner ? 'bg-[#1a5a3a] text-white' : 'bg-[#0d2847]/80 text-[#a0c4e8]'}
        ${!entrant && !showTBD ? 'opacity-50' : ''}
        rounded-sm border border-[#1a3a5c]
      `}
    >
      {showSeed && entrant && (
        <span className={`font-bold ${side === 'right' ? 'ml-1' : 'mr-1'} text-[#5a9fff] min-w-[14px]`}>
          {entrant.seed}
        </span>
      )}
      <span className="truncate flex-1 font-medium">
        {shortName}
      </span>
    </div>
  )
}
