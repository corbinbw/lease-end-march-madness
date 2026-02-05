'use client'

interface Entrant {
  id: string
  displayName: string
  seed: number
}

interface Match {
  id: string
  round: string
  leftEntrant?: Entrant
  rightEntrant?: Entrant
  winnerEntrant?: Entrant
  userPick?: { pickedWinnerEntrantId: string }
}

interface BracketMatchProps {
  match: Match
  onPickUpdate: (matchId: string, entrantId: string) => void
  isLocked: boolean
  size?: 'small' | 'medium' | 'large' | 'xlarge'
}

export function BracketMatch({ match, onPickUpdate, isLocked, size = 'medium' }: BracketMatchProps) {
  const sizeClasses = {
    small: 'text-xs p-2 min-w-[120px]',
    medium: 'text-sm p-3 min-w-[160px]',
    large: 'text-base p-4 min-w-[200px]',
    xlarge: 'text-lg p-6 min-w-[240px]'
  }

  const getEntrantClasses = (entrant: Entrant) => {
    const isWinner = match.winnerEntrant?.id === entrant.id
    const isUserPick = match.userPick?.pickedWinnerEntrantId === entrant.id
    const canClick = !isLocked && match.leftEntrant && match.rightEntrant

    let classes = 'flex items-center justify-between p-2 border-2 rounded transition-all cursor-pointer '

    if (isWinner) {
      classes += 'bg-green-100 border-green-500 text-green-800 font-bold '
    } else if (match.winnerEntrant && !isWinner) {
      classes += 'bg-gray-100 border-gray-300 text-gray-500 opacity-60 '
    } else if (isUserPick) {
      classes += 'bg-blue-100 border-blue-500 text-blue-800 font-semibold '
    } else {
      classes += 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50 '
    }

    if (!canClick) {
      classes += 'cursor-not-allowed '
    }

    return classes
  }

  const handleEntrantClick = (entrant: Entrant) => {
    if (!isLocked && match.leftEntrant && match.rightEntrant) {
      onPickUpdate(match.id, entrant.id)
    }
  }

  if (!match.leftEntrant && !match.rightEntrant) {
    return (
      <div className={`bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg ${sizeClasses[size]} text-center text-gray-500`}>
        <div>TBD</div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-md border ${sizeClasses[size]}`}>
      <div className="space-y-2">
        {/* Match Header */}
        <div className="text-center font-semibold text-gray-600 border-b pb-2">
          Match #{match.matchNumber}
        </div>

        {/* Entrants */}
        <div className="space-y-1">
          {match.leftEntrant && (
            <div
              className={getEntrantClasses(match.leftEntrant)}
              onClick={() => handleEntrantClick(match.leftEntrant!)}
            >
              <div className="flex items-center space-x-2">
                <span className="bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded text-xs font-bold">
                  {match.leftEntrant.seed}
                </span>
                <span className="truncate">{match.leftEntrant.displayName}</span>
              </div>
              {match.userPick?.pickedWinnerEntrantId === match.leftEntrant.id && (
                <span className="text-blue-500">✓</span>
              )}
              {match.winnerEntrant?.id === match.leftEntrant.id && (
                <span className="text-green-500">🏆</span>
              )}
            </div>
          )}

          {match.rightEntrant && (
            <div
              className={getEntrantClasses(match.rightEntrant)}
              onClick={() => handleEntrantClick(match.rightEntrant!)}
            >
              <div className="flex items-center space-x-2">
                <span className="bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded text-xs font-bold">
                  {match.rightEntrant.seed}
                </span>
                <span className="truncate">{match.rightEntrant.displayName}</span>
              </div>
              {match.userPick?.pickedWinnerEntrantId === match.rightEntrant.id && (
                <span className="text-blue-500">✓</span>
              )}
              {match.winnerEntrant?.id === match.rightEntrant.id && (
                <span className="text-green-500">🏆</span>
              )}
            </div>
          )}
        </div>

        {/* Status */}
        <div className="text-center text-xs text-gray-500 pt-2 border-t">
          {match.winnerEntrant ? (
            <span className="text-green-600 font-semibold">Complete</span>
          ) : match.userPick ? (
            <span className="text-blue-600">Pick Made</span>
          ) : isLocked ? (
            <span className="text-red-600">Locked</span>
          ) : (
            <span className="text-orange-600">Make Pick</span>
          )}
        </div>
      </div>
    </div>
  )
}