'use client'

import { useState, useEffect } from 'react'

type Tab = 'entrants' | 'results'

interface Entrant {
  id: string
  displayName: string
  region: string
  seed: number
  department?: string
  title?: string
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

const REGION_LABELS: Record<string, string> = {
  IADVISORS: 'iAdvisors',
  XADVISORS: 'xAdvisors',
  FINANCIAL_SPECIALISTS: 'Financial Specialists',
  WADVISORS: 'wAdvisors',
}

const REGION_COLORS: Record<string, string> = {
  IADVISORS: 'border-l-blue-500',
  XADVISORS: 'border-l-emerald-500',
  FINANCIAL_SPECIALISTS: 'border-l-purple-500',
  WADVISORS: 'border-l-rose-500',
}

const ROUNDS = ['R64', 'R32', 'S16', 'E8', 'F4', 'CHAMP']
const ROUND_LABELS: Record<string, string> = {
  R64: 'Round of 64', R32: 'Round of 32', S16: 'Sweet 16',
  E8: 'Elite 8', F4: 'Final Four', CHAMP: 'Championship',
}

export function AdminPanel() {
  const [tab, setTab] = useState<Tab>('entrants')

  return (
    <div>
      {/* Tab buttons */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('entrants')}
          className={`px-6 py-3 rounded-xl font-semibold transition-all ${
            tab === 'entrants' 
              ? 'bg-navy-400 text-navy-900 shadow-md' 
              : 'bg-white dark:bg-navy-800 text-navy-700 dark:text-navy-200 hover:bg-navy-100 dark:hover:bg-navy-700 border border-navy-200 dark:border-navy-700'
          }`}
        >
          👥 Manage Entrants
        </button>
        <button
          onClick={() => setTab('results')}
          className={`px-6 py-3 rounded-xl font-semibold transition-all ${
            tab === 'results' 
              ? 'bg-emerald-500 text-white shadow-md' 
              : 'bg-white dark:bg-navy-800 text-navy-700 dark:text-navy-200 hover:bg-navy-100 dark:hover:bg-navy-700 border border-navy-200 dark:border-navy-700'
          }`}
        >
          🏀 Enter Results
        </button>
      </div>

      {tab === 'entrants' && <EntrantsManager />}
      {tab === 'results' && <ResultsManager />}
    </div>
  )
}

function EntrantsManager() {
  const [entrants, setEntrants] = useState<Entrant[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [filterRegion, setFilterRegion] = useState<string>('all')

  useEffect(() => {
    fetch('/api/admin/entrants')
      .then(r => r.json())
      .then(d => { setEntrants(d.entrants); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const startEdit = (e: Entrant) => {
    setEditingId(e.id)
    setEditName(e.displayName)
  }

  const saveEdit = async (id: string) => {
    const res = await fetch('/api/admin/entrants', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, displayName: editName }),
    })
    if (res.ok) {
      const data = await res.json()
      setEntrants(prev => prev.map(e => e.id === id ? { ...e, ...data.entrant } : e))
      setEditingId(null)
    }
  }

  const handleReorder = async (region: string, draggedId: string, targetSeed: number) => {
    setSaving(true)
    const regionEntrants = entrants.filter(e => e.region === region).sort((a, b) => a.seed - b.seed)
    const draggedIdx = regionEntrants.findIndex(e => e.id === draggedId)
    if (draggedIdx === -1) { setSaving(false); return }

    const dragged = regionEntrants[draggedIdx]
    const targetIdx = targetSeed - 1
    if (draggedIdx === targetIdx) { setSaving(false); return }

    const reordered = [...regionEntrants]
    reordered.splice(draggedIdx, 1)
    reordered.splice(targetIdx, 0, dragged)
    const updates = reordered.map((e, i) => ({ id: e.id, seed: i + 1 }))

    setEntrants(prev => {
      const updated = [...prev]
      for (const u of updates) {
        const idx = updated.findIndex(e => e.id === u.id)
        if (idx >= 0) updated[idx] = { ...updated[idx], seed: u.seed }
      }
      return updated
    })

    try {
      const res = await fetch('/api/admin/entrants', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reorder: updates }),
      })
      if (!res.ok) throw new Error('Save failed')
    } catch {
      const data = await fetch('/api/admin/entrants').then(r => r.json())
      setEntrants(data.entrants)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-center py-8 text-navy-500 dark:text-navy-400">Loading entrants...</div>

  const regions = filterRegion === 'all' ? Object.keys(REGION_LABELS) : [filterRegion]

  return (
    <div>
      {saving && (
        <div className="fixed top-20 right-4 bg-navy-400 text-navy-900 px-4 py-2 rounded-lg shadow-lg z-50 font-semibold">
          Saving...
        </div>
      )}

      {/* Region filter */}
      <div className="mb-4 flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterRegion('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filterRegion === 'all' 
              ? 'bg-navy-800 dark:bg-navy-600 text-white' 
              : 'bg-white dark:bg-navy-800 text-navy-700 dark:text-navy-200 border border-navy-200 dark:border-navy-700'
          }`}
        >
          All Regions
        </button>
        {Object.entries(REGION_LABELS).map(([k, v]) => (
          <button
            key={k}
            onClick={() => setFilterRegion(k)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filterRegion === k 
                ? 'bg-navy-800 dark:bg-navy-600 text-white' 
                : 'bg-white dark:bg-navy-800 text-navy-700 dark:text-navy-200 border border-navy-200 dark:border-navy-700'
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      <p className="text-sm text-navy-500 dark:text-navy-400 mb-4 card p-3 border-l-4 border-l-navy-400">
        💡 <strong>Tip:</strong> Drag and drop entrants to reorder their seed. Click the ✏️ to edit names.
      </p>

      {regions.map(region => {
        const regionEntrants = entrants.filter(e => e.region === region).sort((a, b) => a.seed - b.seed)

        return (
          <div key={region} className="mb-6">
            <h4 className="font-bold text-lg mb-3 text-navy-900 dark:text-white">{REGION_LABELS[region]}</h4>
            <DraggableList
              entrants={regionEntrants}
              region={region}
              editingId={editingId}
              editName={editName}
              setEditName={setEditName}
              onStartEdit={startEdit}
              onSaveEdit={saveEdit}
              onCancelEdit={() => setEditingId(null)}
              onReorder={handleReorder}
            />
          </div>
        )
      })}
    </div>
  )
}

function DraggableList({
  entrants, region, editingId, editName, setEditName, onStartEdit, onSaveEdit, onCancelEdit, onReorder,
}: {
  entrants: Entrant[]
  region: string
  editingId: string | null
  editName: string
  setEditName: (n: string) => void
  onStartEdit: (e: Entrant) => void
  onSaveEdit: (id: string) => void
  onCancelEdit: () => void
  onReorder: (region: string, draggedId: string, targetSeed: number) => void
}) {
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverSeed, setDragOverSeed] = useState<number | null>(null)

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', id)
  }

  const handleDragOver = (e: React.DragEvent, seed: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverSeed(seed)
  }

  const handleDrop = (e: React.DragEvent, targetSeed: number) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('text/plain')
    if (id) onReorder(region, id, targetSeed)
    setDraggedId(null)
    setDragOverSeed(null)
  }

  const handleDragEnd = () => {
    setDraggedId(null)
    setDragOverSeed(null)
  }

  const borderColor = REGION_COLORS[region] || 'border-l-navy-400'

  return (
    <div className={`card overflow-hidden border-l-4 ${borderColor}`}>
      {entrants.map(entrant => {
        const isDragging = draggedId === entrant.id
        const isDragOver = dragOverSeed === entrant.seed
        const isEditing = editingId === entrant.id

        return (
          <div
            key={entrant.id}
            draggable={!isEditing}
            onDragStart={(e) => handleDragStart(e, entrant.id)}
            onDragOver={(e) => handleDragOver(e, entrant.seed)}
            onDragLeave={() => setDragOverSeed(null)}
            onDrop={(e) => handleDrop(e, entrant.seed)}
            onDragEnd={handleDragEnd}
            className={`
              flex items-center gap-3 px-4 py-3 border-b border-navy-100 dark:border-navy-700 last:border-b-0 transition-all
              ${isDragging ? 'opacity-40 bg-navy-100 dark:bg-navy-700' : ''}
              ${isDragOver && !isDragging ? 'border-t-2 border-t-navy-400 bg-navy-100 dark:bg-navy-800/20' : ''}
              ${!isEditing ? 'cursor-grab active:cursor-grabbing' : ''}
            `}
          >
            <div className="text-navy-300 dark:text-navy-600 select-none shrink-0 text-lg">⠿</div>

            <div className="bg-navy-800 dark:bg-navy-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
              {entrant.seed}
            </div>

            {isEditing ? (
              <div className="flex-1 flex items-center gap-2">
                <input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && onSaveEdit(entrant.id)}
                  className="input flex-1"
                  autoFocus
                />
                <button onClick={() => onSaveEdit(entrant.id)} className="btn-primary text-sm px-3 py-1.5">Save</button>
                <button onClick={onCancelEdit} className="bg-navy-200 dark:bg-navy-700 text-navy-700 dark:text-navy-200 px-3 py-1.5 rounded-lg text-sm font-medium">Cancel</button>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-between">
                <span className="font-medium text-navy-900 dark:text-white">{entrant.displayName}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); onStartEdit(entrant) }}
                  className="text-navy-500 dark:text-navy-400 hover:text-navy-500 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-navy-100 dark:hover:bg-navy-800/20 transition-colors"
                >
                  ✏️ Edit
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function ResultsManager() {
  const [selectedRound, setSelectedRound] = useState('R64')
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/admin/results?round=${selectedRound}`)
      .then(r => r.json())
      .then(d => { setMatches(d.matches); setLoading(false) })
      .catch(() => setLoading(false))
  }, [selectedRound])

  const setWinner = async (matchId: string, winnerEntrantId: string) => {
    if (!confirm('Set this entrant as the winner? This will advance them to the next round.')) return

    const res = await fetch('/api/admin/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchId, winnerEntrantId }),
    })

    if (res.ok) {
      const data = await fetch(`/api/admin/results?round=${selectedRound}`).then(r => r.json())
      setMatches(data.matches)
    }
  }

  return (
    <div>
      {/* Round selector */}
      <div className="mb-4 flex gap-2 flex-wrap">
        {ROUNDS.map(r => (
          <button
            key={r}
            onClick={() => setSelectedRound(r)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              selectedRound === r 
                ? 'bg-emerald-500 text-white shadow-md' 
                : 'bg-white dark:bg-navy-800 text-navy-700 dark:text-navy-200 border border-navy-200 dark:border-navy-700 hover:bg-navy-100 dark:hover:bg-navy-700'
            }`}
          >
            {ROUND_LABELS[r]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-8 text-navy-500 dark:text-navy-400">Loading matches...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {matches.map(match => {
            const borderColor = match.region ? REGION_COLORS[match.region] : 'border-l-navy-500'
            
            return (
              <div key={match.id} className={`card p-4 border-l-4 ${borderColor}`}>
                <div className="text-xs text-navy-500 dark:text-navy-400 mb-3 flex items-center justify-between">
                  <span>{match.region ? REGION_LABELS[match.region] : 'Cross-Region'} • Match #{match.matchNumber}</span>
                  {match.winnerEntrant && <span className="badge badge-success">✅ Complete</span>}
                </div>

                {!match.leftEntrant && !match.rightEntrant ? (
                  <div className="text-navy-400 dark:text-navy-500 italic text-sm py-4 text-center">
                    Waiting for previous round results
                  </div>
                ) : (
                  <div className="space-y-2">
                    {match.leftEntrant && (
                      <div className="flex items-center justify-between p-2 rounded-lg bg-navy-50 dark:bg-navy-800">
                        <div className="flex items-center gap-2">
                          <span className="bg-navy-800 dark:bg-navy-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold">
                            {match.leftEntrant.seed}
                          </span>
                          <span className={match.winnerEntrant?.id === match.leftEntrant.id ? 'font-bold text-emerald-600 dark:text-emerald-400' : 'text-navy-700 dark:text-navy-200'}>
                            {match.leftEntrant.displayName}
                          </span>
                          {match.winnerEntrant?.id === match.leftEntrant.id && <span>🏆</span>}
                        </div>
                        {!match.winnerEntrant && (
                          <button onClick={() => setWinner(match.id, match.leftEntrant!.id)} className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors">
                            Winner
                          </button>
                        )}
                      </div>
                    )}
                    <div className="text-center text-xs text-navy-400 dark:text-navy-500 font-semibold">VS</div>
                    {match.rightEntrant && (
                      <div className="flex items-center justify-between p-2 rounded-lg bg-navy-50 dark:bg-navy-800">
                        <div className="flex items-center gap-2">
                          <span className="bg-navy-800 dark:bg-navy-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold">
                            {match.rightEntrant.seed}
                          </span>
                          <span className={match.winnerEntrant?.id === match.rightEntrant.id ? 'font-bold text-emerald-600 dark:text-emerald-400' : 'text-navy-700 dark:text-navy-200'}>
                            {match.rightEntrant.displayName}
                          </span>
                          {match.winnerEntrant?.id === match.rightEntrant.id && <span>🏆</span>}
                        </div>
                        {!match.winnerEntrant && (
                          <button onClick={() => setWinner(match.id, match.rightEntrant!.id)} className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors">
                            Winner
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
