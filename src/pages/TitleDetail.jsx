import { Link, useParams } from 'react-router-dom'
import { useStore } from '../data/useStore'
import { useAuth } from '../data/auth'
import { availability, copiesForTitle } from '../domain/selectors'
import StatusBadge from '../components/StatusBadge'

export default function TitleDetail() {
  const { titleId } = useParams()
  const isVolunteer = useAuth()
  const title = useStore((s) => s.titles.find((t) => t.id === titleId) || null)
  const copies = useStore((s) => s.copies)

  if (!title) {
    return (
      <div className="empty">
        <h1>Title not found</h1>
        <Link to="/">Back to the catalogue</Link>
      </div>
    )
  }

  const av = availability(copies, title.id)
  const mine = copiesForTitle(copies, title.id)

  return (
    <div>
      <p>
        <Link to="/">← Catalogue</Link>
      </p>
      <div className="row-between">
        <div>
          <h1>{title.name}</h1>
          {title.author && <p className="subtitle">{title.author}</p>}
        </div>
      </div>

      <div className="card stack">
        <div>
          <span className="chip">{title.section}</span>
          <span className="chip">{title.language}</span>
          <span className="chip">{title.audience}</span>
          <span className="chip">{title.format}</span>
        </div>
        {title.description && <p style={{ margin: 0 }}>{title.description}</p>}
        <div className="avail-line">
          {av.borrowable ? (
            <>
              <strong style={{ color: av.available ? 'var(--ok)' : 'var(--muted)' }}>
                {av.available}
              </strong>{' '}
              of {av.total} available · {av.onLoan} on loan
            </>
          ) : (
            <>In-library only — not for borrowing ({av.total} on shelf)</>
          )}
        </div>
        {av.available > 0 && (
          <div className="notice info" style={{ marginBottom: 0 }}>
            To borrow this book, bring it to a volunteer at the library desk.
          </div>
        )}
      </div>

      <h2>Copies</h2>
      <div className="panel">
        <table>
          <thead>
            <tr>
              <th>Copy ID</th>
              <th>Status</th>
              <th>Condition</th>
              {isVolunteer && <th>Donor</th>}
              <th></th>
            </tr>
          </thead>
          <tbody>
            {mine.map((c) => (
              <tr key={c.id}>
                <td className="mono">#{c.id}</td>
                <td>
                  <StatusBadge status={c.status} />
                </td>
                <td>{c.condition}</td>
                {isVolunteer && <td>{c.donor || '—'}</td>}
                <td>
                  <Link className="btn small" to={`/copy/${c.id}`}>
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
