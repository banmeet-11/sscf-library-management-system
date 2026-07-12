import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../data/useStore'
import { SECTIONS, LANGUAGES, AUDIENCES } from '../domain/constants'
import { availability } from '../domain/selectors'

const AVAIL_OPTIONS = [
  { value: 'all', label: 'Any availability' },
  { value: 'available', label: 'Available now' },
  { value: 'borrowable', label: 'Borrowable' },
]

export default function Catalog() {
  const titles = useStore((s) => s.titles)
  const copies = useStore((s) => s.copies)

  const [q, setQ] = useState('')
  const [section, setSection] = useState('')
  const [language, setLanguage] = useState('')
  const [audience, setAudience] = useState('')
  const [avail, setAvail] = useState('all')

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return titles
      .map((t) => ({ title: t, av: availability(copies, t.id) }))
      .filter(({ title, av }) => {
        if (needle) {
          const hay = `${title.name} ${title.author}`.toLowerCase()
          if (!hay.includes(needle)) return false
        }
        if (section && title.section !== section) return false
        if (language && title.language !== language) return false
        if (audience && title.audience !== audience) return false
        if (avail === 'available' && av.available === 0) return false
        if (avail === 'borrowable' && !av.borrowable) return false
        return true
      })
      .sort((a, b) => a.title.name.localeCompare(b.title.name))
  }, [titles, copies, q, section, language, audience, avail])

  const hasFilters = q || section || language || audience || avail !== 'all'

  return (
    <div>
      <div className="row-between">
        <div>
          <h1>Library catalogue</h1>
          <p className="subtitle">
            Browse the sangat's collection. Find a book, then borrow it through a volunteer.
          </p>
        </div>
      </div>

      <div className="filters">
        <div className="field search">
          <label>Search</label>
          <input
            type="search"
            placeholder="Title or author…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="field">
          <label>Section</label>
          <select value={section} onChange={(e) => setSection(e.target.value)}>
            <option value="">All sections</option>
            {SECTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Language</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="">All languages</option>
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Audience</label>
          <select value={audience} onChange={(e) => setAudience(e.target.value)}>
            <option value="">All</option>
            {AUDIENCES.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Availability</label>
          <select value={avail} onChange={(e) => setAvail(e.target.value)}>
            {AVAIL_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        {hasFilters && (
          <button
            className="btn ghost small"
            onClick={() => {
              setQ('')
              setSection('')
              setLanguage('')
              setAudience('')
              setAvail('all')
            }}
          >
            Clear
          </button>
        )}
      </div>

      <div className="result-count">
        {results.length} {results.length === 1 ? 'title' : 'titles'}
      </div>

      {results.length === 0 ? (
        <div className="empty">No titles match your filters.</div>
      ) : (
        <div className="catalog">
          {results.map(({ title, av }) => (
            <BookCard key={title.id} title={title} av={av} />
          ))}
        </div>
      )}
    </div>
  )
}

function BookCard({ title, av }) {
  return (
    <Link to={`/title/${title.id}`} className="card book-card" style={{ color: 'inherit' }}>
      <h3>{title.name}</h3>
      {title.author && <div className="author">{title.author}</div>}
      <div>
        <span className="chip">{title.section}</span>
      </div>
      <div>
        <span className="chip">{title.language}</span>
        <span className="chip">{title.audience}</span>
        <span className="chip">{title.format}</span>
      </div>
      <div className="meta">
        <AvailLine av={av} />
      </div>
    </Link>
  )
}

function AvailLine({ av }) {
  if (!av.borrowable) {
    return <span className="avail-line">In-library only ({av.total} on shelf)</span>
  }
  if (av.available > 0) {
    return (
      <span className="avail-line">
        <strong style={{ color: 'var(--ok)' }}>{av.available}</strong> of {av.total} available
      </span>
    )
  }
  return <span className="avail-line">All {av.total} on loan</span>
}
