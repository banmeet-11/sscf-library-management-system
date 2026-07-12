import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../data/useStore'
import { openLoans, returnCopy, resetToSeed } from '../data/store'
import { STATUS } from '../domain/constants'

// Volunteer dashboard (planning doc §7.6): who has what and what's overdue,
// plus a snapshot of the collection.
export default function Dashboard() {
  // Subscribe to the slices the derived views depend on.
  useStore((s) => s.loans)
  useStore((s) => s.copies)
  useStore((s) => s.members)
  const titles = useStore((s) => s.titles)

  const [tab, setTab] = useState('loans') // 'loans' | 'overdue'

  const loans = openLoans()
  const overdue = loans.filter((l) => l.overdue)
  const shown = tab === 'overdue' ? overdue : loans

  const stats = useStats()

  return (
    <div>
      <div className="row-between">
        <div>
          <h1>Volunteer dashboard</h1>
          <p className="subtitle">Who has what, and what's overdue.</p>
        </div>
        <button
          className="btn ghost small"
          onClick={() => {
            if (confirm('Reset all demo data back to the seeded library?')) resetToSeed()
          }}
        >
          Reset demo data
        </button>
      </div>

      <div className="grid-3">
        <Stat label="Titles" value={titles.length} />
        <Stat label="Copies" value={stats.copies} />
        <Stat label="On loan" value={stats.onLoan} />
        <Stat label="Available" value={stats.available} />
        <Stat label="In-library only" value={stats.nonCirculating} />
        <Stat label="Overdue" value={overdue.length} warn={overdue.length > 0} />
      </div>

      <div className="pill-tabs" style={{ marginTop: '1.5rem' }}>
        <button
          className={`btn small ${tab === 'loans' ? 'primary' : ''}`}
          onClick={() => setTab('loans')}
        >
          On loan ({loans.length})
        </button>
        <button
          className={`btn small ${tab === 'overdue' ? 'primary' : ''}`}
          onClick={() => setTab('overdue')}
        >
          Overdue ({overdue.length})
        </button>
      </div>

      <div className="panel">
        {shown.length === 0 ? (
          <div className="empty">
            {tab === 'overdue' ? 'Nothing overdue. 🎉' : 'No books are out right now.'}
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Book</th>
                <th>Copy</th>
                <th>Borrower</th>
                <th>Phone</th>
                <th>Due</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {shown.map(({ loan, copy, title, member, overdue: isOver }) => (
                <tr key={loan.id} className={isOver ? 'overdue-row' : ''}>
                  <td>
                    {title ? <Link to={`/title/${title.id}`}>{title.name}</Link> : '—'}
                  </td>
                  <td className="mono">
                    <Link to={`/copy/${copy.id}`}>#{copy.id}</Link>
                  </td>
                  <td>{member ? member.name : '—'}</td>
                  <td>{member ? member.phone : '—'}</td>
                  <td>
                    {new Date(loan.dueDate).toLocaleDateString()}
                    {isOver && <span className="badge overdue" style={{ marginLeft: 6 }}>Overdue</span>}
                  </td>
                  <td>
                    <button
                      className="btn small"
                      onClick={() => returnCopy(copy.id)}
                    >
                      Check in
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function useStats() {
  const copies = useStore((s) => s.copies)
  return useMemo(
    () => ({
      copies: copies.length,
      available: copies.filter((c) => c.status === STATUS.AVAILABLE).length,
      onLoan: copies.filter((c) => c.status === STATUS.ON_LOAN).length,
      nonCirculating: copies.filter((c) => c.status === STATUS.NON_CIRCULATING).length,
    }),
    [copies]
  )
}

function Stat({ label, value, warn }) {
  return (
    <div className="card" style={{ padding: '0.9rem 1rem' }}>
      <div style={{ fontSize: '1.8rem', fontWeight: 700, color: warn ? 'var(--warn)' : 'var(--ink)' }}>
        {value}
      </div>
      <div className="hint" style={{ marginTop: 0 }}>
        {label}
      </div>
    </div>
  )
}
