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

const ROUNDS = ['R64', 'R32', 'S16', 'E8', 'F4', 'CHAMP']
const ROUND_LABELS: Record<string, string> = {
  R64: 'Round of 64', R32: 'Round of 32', S16: 'Sweet 16',
  E8: 'Elite 8', F4: 'Final Four', CHAMP: 'Championship',
}

export function AdminPanel() {
  const [tab, setTab] = useState<Tab>('entrants')

  return (
    <div>
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('entrants')}
          className={`px-6 py-2 rounded-lg font-semibold ${tab === 'entrants' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
        >
          👥 Manage Entrants
        </button>
        <button
          onClick={() => setTab('results')}
          className={`px-6 py-2 rounded-lg font-semibold ${tab === 'results' ? 'bg-green-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
        >
          🏀 Enter Results
        </button>
      </div>

      {tab === 'entrants' && <EntrantsManager />}
      {tab === 'results' && <ResultsManager />}
    </div>
  )
}

// --- Entrants Manager ---
function EntrantsManager() {
  const [entrants, setEntrants] = useState<Entrant[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editSeed, setEditSeed] = useState(0)
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
    setEditSeed(e.seed)
  }

  const saveEdit = async (id: string) => {
    const res = await fetch('/api/admin/entrants', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, displayName: editName, seed: editSeed }),
    })
    if (res.ok) {
      const data = await res.json()
      setEntrants(prev => prev.map(e => e.id === id ? { ...e, ...data.entrant } : e))
      setEditingId(null)
    }
  }

  if (loading) return <div className="text-center py-8 text-gray-500">Loading entrants...</div>

  const filtered = filterRegion === 'all' ? entrants : entrants.filter(e => e.region === filterRegion)
  const grouped = filtered.reduce((acc, e) => {
    if (!acc[e.region]) acc[e.region] = []
    acc[e.region].push(e)
    return acc
  }, {} as Record<string, Entrant[]>)

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <button onClick={() => setFilterRegion('all')} className={`px-3 py-1 rounded text-sm ${filterRegion === 'all' ? 'bg-gray-800 text-white' : 'bg-white'}`}>All</button>
        {Object.entries(REGION_LABELS).map(([k, v]) => (
          <button key={k} onClick={() => setFilterRegion(k)} className={`px-3 py-1 rounded text-sm ${filterRegion === k ? 'bg-gray-800 text-white' : 'bg-white'}`}>{v}</button>
        ))}
      </div>

      {Object.entries(grouped).map(([region, regionEntrants]) => (
        <div key={region} className="mb-6">
          <h4 className="font-bold text-lg mb-2">{REGION_LABELS[region] || region}</h4>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Seed</th>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Title</th>
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {regionEntrants.sort((a, b) => a.seed - b.seed).map(entrant => (
                  <tr key={entrant.id} className="border-t">
                    {editingId === entrant.id ? (
                      <>
                        <td className="px-4 py-2">
                          <input type="number" value={editSeed} onChange={e => setEditSeed(+e.target.value)} className="w-16 border rounded px-2 py-1 text-gray-900" />
                        </td>
                        <td className="px-4 py-2">
                          <input value={editName} onChange={e => setEditName(e.target.value)} className="border rounded px-2 py-1 w-full text-gray-900" />
                        </td>
                        <td className="px-4 py-2 text-gray-500">{entrant.title || '-'}</td>
                        <td className="px-4 py-2 text-right space-x-2">
                          <button onClick={() => saveEdit(entrant.id)} className="bg-green-600 text-white px-3 py-1 rounded text-xs">Save</button>
                          <button onClick={() => setEditingId(null)} className="bg-gray-400 text-white px-3 py-1 rounded text-xs">Cancel</button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-2 font-bold">{entrant.seed}</td>
                        <td className="px-4 py-2">{entrant.displayName}</td>
                        <td className="px-4 py-2 text-gray-500">{entrant.title || '-'}</td>
                        <td className="px-4 py-2 text-right">
                          <button onClick={() => startEdit(entrant)} className="bg-blue-600 text-white px-3 py-1 rounded text-xs">Edit</button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  )
}

// --- Results Manager ---
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
      // Refresh
      const data = await fetch(`/api/admin/results?round=${selectedRound}`).then(r => r.json())
      setMatches(data.matches)
    }
  }

  return (
    <div>
      <div className="mb-4 flex gap-2 flex-wrap">
        {ROUNDS.map(r => (
          <button
            key={r}
            onClick={() => setSelectedRound(r)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold ${selectedRound === r ? 'bg-green-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
          >
            {ROUND_LABELS[r]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading matches...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {matches.map(match => (
            <div key={match.id} className="bg-white rounded-lg shadow p-4">
              <div className="text-xs text-gray-500 mb-2">
                {match.region ? REGION_LABELS[match.region] : 'Cross-Region'} • Match #{match.matchNumber}
                {match.winnerEntrant && <span className="ml-2 text-green-600 font-semibold">✅ Complete</span>}
              </div>

              {!match.leftEntrant && !match.rightEntrant ? (
                <div className="text-gray-400 italic text-sm">Waiting for previous round results</div>
              ) : (
                <div className="space-y-2">
                  {match.leftEntrant && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="bg-gray-200 px-2 py-0.5 rounded text-xs font-bold">{match.leftEntrant.seed}</span>
                        <span className={match.winnerEntrant?.id === match.leftEntrant.id ? 'font-bold text-green-700' : ''}>{match.leftEntrant.displayName}</span>
                        {match.winnerEntrant?.id === match.leftEntrant.id && <span>🏆</span>}
                      </div>
                      {!match.winnerEntrant && (
                        <button onClick={() => setWinner(match.id, match.leftEntrant!.id)} className="bg-green-600 text-white px-3 py-1 rounded text-xs">Winner</button>
                      )}
                    </div>
                  )}
                  <div className="text-center text-xs text-gray-400">vs</div>
                  {match.rightEntrant && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="bg-gray-200 px-2 py-0.5 rounded text-xs font-bold">{match.rightEntrant.seed}</span>
                        <span className={match.winnerEntrant?.id === match.rightEntrant.id ? 'font-bold text-green-700' : ''}>{match.rightEntrant.displayName}</span>
                        {match.winnerEntrant?.id === match.rightEntrant.id && <span>🏆</span>}
                      </div>
                      {!match.winnerEntrant && (
                        <button onClick={() => setWinner(match.id, match.rightEntrant!.id)} className="bg-green-600 text-white px-3 py-1 rounded text-xs">Winner</button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
