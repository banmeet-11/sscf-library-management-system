import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { addTitleWithCopies } from '../data/store'
import {
  SECTIONS,
  LANGUAGES,
  AUDIENCES,
  FORMATS,
  defaultStatusFor,
  STATUS,
} from '../domain/constants'

const BLANK = {
  name: '',
  author: '',
  section: SECTIONS[0],
  language: LANGUAGES[0],
  audience: AUDIENCES[0],
  format: FORMATS[0],
  description: '',
  donor: '',
  quantity: 1,
}

// Intake / donation flow (planning doc §6). Captures a title + tags + quantity
// on one screen, creates 1 title and N copies, then stays open for fast repeat
// entry ("Save & add another").
export default function Intake() {
  const nav = useNavigate()
  const [form, setForm] = useState(BLANK)
  const [lastBatch, setLastBatch] = useState(null)
  const nameRef = useRef(null)

  const willBeNonCirculating =
    defaultStatusFor({ section: form.section, format: form.format }) === STATUS.NON_CIRCULATING

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function submit(e, keepOpen) {
    e.preventDefault()
    if (!form.name.trim()) {
      nameRef.current?.focus()
      return
    }
    const { title, copies } = addTitleWithCopies(form)
    const batch = { title, copies }
    setLastBatch(batch)
    if (keepOpen) {
      // Reset for the next book but keep section/language/audience so a stack of
      // similar donations is fast to enter.
      setForm((f) => ({
        ...BLANK,
        section: f.section,
        language: f.language,
        audience: f.audience,
        format: f.format,
        donor: f.donor,
      }))
      nameRef.current?.focus()
    } else {
      const ids = copies.map((c) => c.id).join(',')
      nav(`/labels?copies=${ids}`)
    }
  }

  return (
    <div>
      <h1>Add / Donation</h1>
      <p className="subtitle">
        Add a title and how many physical copies came in. Each copy gets its own ID and QR label.
      </p>

      {lastBatch && (
        <div className="notice ok">
          Added <strong>{lastBatch.title.name}</strong> — {lastBatch.copies.length}{' '}
          {lastBatch.copies.length === 1 ? 'copy' : 'copies'} (#
          {lastBatch.copies.map((c) => c.id).join(', #')}).{' '}
          <Link to={`/labels?copies=${lastBatch.copies.map((c) => c.id).join(',')}`}>
            Print labels →
          </Link>
        </div>
      )}

      <form className="card" onSubmit={(e) => submit(e, true)}>
        <div className="field">
          <label>Title *</label>
          <input
            ref={nameRef}
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="e.g. Nitnem Gutka"
            autoFocus
          />
        </div>

        <div className="grid-2">
          <div className="field">
            <label>Author (optional)</label>
            <input
              value={form.author}
              onChange={(e) => set('author', e.target.value)}
              placeholder="Author or compiler"
            />
          </div>
          <div className="field">
            <label>Section</label>
            <select value={form.section} onChange={(e) => set('section', e.target.value)}>
              {SECTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid-3">
          <div className="field">
            <label>Language</label>
            <select value={form.language} onChange={(e) => set('language', e.target.value)}>
              {LANGUAGES.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Audience</label>
            <select value={form.audience} onChange={(e) => set('audience', e.target.value)}>
              {AUDIENCES.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Format</label>
            <select value={form.format} onChange={(e) => set('format', e.target.value)}>
              {FORMATS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid-3">
          <div className="field">
            <label>Quantity</label>
            <input
              type="number"
              min="1"
              value={form.quantity}
              onChange={(e) => set('quantity', e.target.value)}
            />
            <div className="hint">How many identical copies came in.</div>
          </div>
          <div className="field">
            <label>Donor (optional)</label>
            <input
              value={form.donor}
              onChange={(e) => set('donor', e.target.value)}
              placeholder="Donor name"
            />
          </div>
        </div>

        <div className="field">
          <label>Description (optional)</label>
          <textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Short note about the book"
          />
        </div>

        {willBeNonCirculating && (
          <div className="notice info">
            This {form.format === 'pothi' ? 'pothi' : 'section'} will be marked{' '}
            <strong>non-circulating</strong> (in-library only) and handled with maryada.
          </div>
        )}

        <div className="btn-row">
          <button className="btn" type="submit">
            Save &amp; add another
          </button>
          <button className="btn primary" type="button" onClick={(e) => submit(e, false)}>
            Save &amp; print labels
          </button>
        </div>
      </form>
    </div>
  )
}
