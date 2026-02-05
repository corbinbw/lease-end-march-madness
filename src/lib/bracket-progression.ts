// Defines how matches feed into subsequent rounds
// Within a region: R64 M1+M2 → R32 M1, R64 M3+M4 → R32 M2, etc.
// Cross-regional: E8 winners → F4, F4 winners → CHAMP

export type RoundName = 'R64' | 'R32' | 'S16' | 'E8' | 'F4' | 'CHAMP'

export const ROUND_ORDER: RoundName[] = ['R64', 'R32', 'S16', 'E8', 'F4', 'CHAMP']

export const REGIONS = ['IADVISORS', 'XADVISORS', 'FINANCIAL_SPECIALISTS', 'WADVISORS'] as const

export function getPreviousRound(round: RoundName): RoundName | null {
  const idx = ROUND_ORDER.indexOf(round)
  return idx > 0 ? ROUND_ORDER[idx - 1] : null
}

// For regional rounds (R32, S16, E8), returns the two feeder matches from the previous round
// that feed into this match. Returns [leftFeeder, rightFeeder] as {round, region, matchNumber}
export function getFeederMatches(
  round: RoundName,
  region: string | null,
  matchNumber: number
): { round: RoundName; region: string | null; matchNumber: number }[] {
  if (round === 'R64') return [] // No feeders for first round

  if (round === 'CHAMP') {
    // Championship: fed by F4 M1 and F4 M2
    return [
      { round: 'F4', region: null, matchNumber: 1 },
      { round: 'F4', region: null, matchNumber: 2 },
    ]
  }

  if (round === 'F4') {
    // Final Four: fed by E8 winners from specific regions
    // F4 M1: IADVISORS E8 winner vs XADVISORS E8 winner
    // F4 M2: FINANCIAL_SPECIALISTS E8 winner vs WADVISORS E8 winner
    if (matchNumber === 1) {
      return [
        { round: 'E8', region: 'IADVISORS', matchNumber: 1 },
        { round: 'E8', region: 'XADVISORS', matchNumber: 1 },
      ]
    } else {
      return [
        { round: 'E8', region: 'FINANCIAL_SPECIALISTS', matchNumber: 1 },
        { round: 'E8', region: 'WADVISORS', matchNumber: 1 },
      ]
    }
  }

  // Regional rounds (R32, S16, E8)
  const prevRound = getPreviousRound(round)!
  const feederMatch1 = (matchNumber - 1) * 2 + 1
  const feederMatch2 = (matchNumber - 1) * 2 + 2

  return [
    { round: prevRound, region, matchNumber: feederMatch1 },
    { round: prevRound, region, matchNumber: feederMatch2 },
  ]
}

export interface MatchInfo {
  id: string
  round: string
  region: string | null
  matchNumber: number
  leftEntrant: EntrantInfo | null
  rightEntrant: EntrantInfo | null
  winnerEntrant: EntrantInfo | null // actual winner (set by admin)
  userPick: { id: string; pickedWinnerEntrantId: string } | null
}

export interface EntrantInfo {
  id: string
  displayName: string
  seed: number
}

// Given all matches and user picks, compute the virtual entrants for any match
// based on the user's cascading picks
export function computeVirtualEntrants(
  matches: MatchInfo[],
  targetMatch: MatchInfo
): { left: EntrantInfo | null; right: EntrantInfo | null } {
  if (targetMatch.round === 'R64') {
    return { left: targetMatch.leftEntrant, right: targetMatch.rightEntrant }
  }

  const feeders = getFeederMatches(
    targetMatch.round as RoundName,
    targetMatch.region,
    targetMatch.matchNumber
  )

  if (feeders.length !== 2) return { left: null, right: null }

  const getPickedWinner = (feederRound: RoundName, feederRegion: string | null, feederMatchNum: number): EntrantInfo | null => {
    const feederMatch = matches.find(
      m => m.round === feederRound && m.region === feederRegion && m.matchNumber === feederMatchNum
    )
    if (!feederMatch || !feederMatch.userPick) return null

    // The picked winner could be a real entrant from R64 or a cascaded pick
    // We need to find who they picked
    const pickedId = feederMatch.userPick.pickedWinnerEntrantId

    // Check both entrants of the feeder match (could be virtual)
    const virtualEntrants = computeVirtualEntrants(matches, feederMatch)
    if (virtualEntrants.left?.id === pickedId) return virtualEntrants.left
    if (virtualEntrants.right?.id === pickedId) return virtualEntrants.right

    // Fallback: search all entrants in all R64 matches
    for (const m of matches) {
      if (m.leftEntrant?.id === pickedId) return m.leftEntrant
      if (m.rightEntrant?.id === pickedId) return m.rightEntrant
    }

    return null
  }

  const left = getPickedWinner(feeders[0].round, feeders[0].region, feeders[0].matchNumber)
  const right = getPickedWinner(feeders[1].round, feeders[1].region, feeders[1].matchNumber)

  return { left, right }
}

// Get all match IDs that are downstream of a given match (for cascade invalidation)
export function getDownstreamMatchIds(
  matches: MatchInfo[],
  changedMatch: MatchInfo
): string[] {
  const downstream: string[] = []

  // Find the match in the next round that this match feeds into
  const nextRound = ROUND_ORDER[ROUND_ORDER.indexOf(changedMatch.round as RoundName) + 1]
  if (!nextRound) return downstream

  // Find which next-round match this feeds
  for (const m of matches) {
    if (m.round !== nextRound) continue

    const feeders = getFeederMatches(m.round as RoundName, m.region, m.matchNumber)
    const isFeeder = feeders.some(
      f => f.round === changedMatch.round && f.region === changedMatch.region && f.matchNumber === changedMatch.matchNumber
    )

    if (isFeeder) {
      downstream.push(m.id)
      // Recursively get downstream of this match too
      downstream.push(...getDownstreamMatchIds(matches, m))
    }
  }

  return downstream
}
