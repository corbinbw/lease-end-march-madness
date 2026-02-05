import { Region, RoundType } from '@prisma/client'

export function getRegionDisplayName(region: Region): string {
  switch (region) {
    case 'IADVISORS':
      return 'iAdvisors'
    case 'XADVISORS':
      return 'xAdvisors'
    case 'FINANCIAL_SPECIALISTS':
      return 'Financial Specialists'
    case 'WADVISORS':
      return 'wAdvisors'
    default:
      return region
  }
}

export function getRoundDisplayName(round: RoundType): string {
  switch (round) {
    case 'R64':
      return 'Round of 64'
    case 'R32':
      return 'Round of 32'
    case 'S16':
      return 'Sweet 16'
    case 'E8':
      return 'Elite 8'
    case 'F4':
      return 'Final 4'
    case 'CHAMP':
      return 'Championship'
    default:
      return round
  }
}

export function getNextRound(currentRound: RoundType): RoundType | null {
  switch (currentRound) {
    case 'R64':
      return 'R32'
    case 'R32':
      return 'S16'
    case 'S16':
      return 'E8'
    case 'E8':
      return 'F4'
    case 'F4':
      return 'CHAMP'
    case 'CHAMP':
      return null
    default:
      return null
  }
}

export function getCurrentTournamentRound(): RoundType {
  const now = new Date()
  const mountain = new Intl.DateTimeFormat('en', {
    timeZone: 'America/Denver',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(now)
  
  const [month, day, year] = mountain.split('/')
  const currentDate = new Date(`${year}-${month}-${day}`)
  
  // Tournament schedule for 2026
  const schedules = [
    { start: new Date('2026-03-01'), end: new Date('2026-03-07'), round: 'R64' as RoundType }, // Play-in
    { start: new Date('2026-03-09'), end: new Date('2026-03-11'), round: 'R64' as RoundType },
    { start: new Date('2026-03-12'), end: new Date('2026-03-16'), round: 'R32' as RoundType },
    { start: new Date('2026-03-17'), end: new Date('2026-03-19'), round: 'S16' as RoundType },
    { start: new Date('2026-03-20'), end: new Date('2026-03-24'), round: 'E8' as RoundType },
    { start: new Date('2026-03-25'), end: new Date('2026-03-28'), round: 'F4' as RoundType },
    { start: new Date('2026-03-30'), end: new Date('2026-04-04'), round: 'CHAMP' as RoundType }
  ]
  
  for (const schedule of schedules) {
    if (currentDate >= schedule.start && currentDate <= schedule.end) {
      return schedule.round
    }
  }
  
  // Default to first round if before tournament
  return 'R64'
}

export function isLocked(lockDatetime?: Date | null): boolean {
  if (!lockDatetime) return false
  return new Date() > lockDatetime
}

export function formatLockTime(lockDatetime?: Date | null): string {
  if (!lockDatetime) return 'No lock time set'
  
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Denver',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short'
  }).format(lockDatetime)
}

export function getLockCountdown(lockDatetime?: Date | null): string {
  if (!lockDatetime) return 'No lock time set'
  
  const now = new Date()
  const diff = lockDatetime.getTime() - now.getTime()
  
  if (diff <= 0) return 'Locked'
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (days > 0) return `${days}d ${hours}h ${minutes}m`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}