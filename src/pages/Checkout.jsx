import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../data/useStore'
import { getCopy } from '../data/store'
import CopyActions from '../components/CopyActions'
import StatusBadge from '../components/StatusBadge'

// Volunteer checkout / return console (planning doc §7.5). Scan or type a copy
// ID, then check the book out or back in. This is the desk workflow when a
// volunteer has the book in hand.
export default function Checkout() {
  // Subscribe so the loaded copy reflects the latest status.
  useStore((s) => s.copies)
  const titles = useStore((s) => s.titles)
  const [input, setInput] = useState('')
  const [copyId, setCopyId] = useState(null)
  const [error, setError] = useState('')

  const copy = copyId ? getCopy(copyId) : null
  const title = copy ? titles.find((t) => t.id === copy.titleId) : null

  function load(e) {
    e.preventDefault()
    const m = String(input).match(/copy\/(\w+)/i)
    const id = m ? m[1] : input.trim()
    if (!id) return
    const found = getCopy(id)
    if (!found) {
      setError(`No copy #${id} found.`)
      setCopyId(null)
      return
    }
    setError('')
    setCopyId(id)
  }

  return (
    <div>
      <h1>Checkout &amp; return</h1>
      <p className="subtitle">
        Scan a book's QR (or type its copy ID) to check it out or back in.{' '}
        <Link to="/scan">Use the camera scanner →</Link>
      </p>

      <div className="card" style={{ maxWidth: 560 }}>
        <form onSubmit={load}>
          <div className="field">
            <label>Copy ID or scanned link</label>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. 1004 or /copy/1004"
              autoFocus
            />
          </div>
          <button className="btn" type="submit">
            Load copy
          </button>
        </form>

        {error && (
          <div className="notice error" style={{ marginTop: '1rem', marginBottom: 0 }}>
            {error}
          </div>
        )}

        {copy && title && (
          <>
            <div className="divider" />
            <div className="row-between">
              <div>
                <strong>{title.name}</strong>
                <div className="hint mono">#{copy.id}</div>
              </div>
              <StatusBadge status={copy.status} />
            </div>
            <div style={{ marginTop: '1rem' }}>
              <CopyActions
                copy={copy}
                onDone={() => {
                  // Clear the field for the next book after an action.
                  setInput('')
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
