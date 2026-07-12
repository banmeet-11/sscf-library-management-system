import { useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useStore } from '../data/useStore'
import QrCode, { copyUrl } from '../components/QrCode'

// Batch QR label generation + printable sheet (planning doc §5, §6).
// Volunteers select copies (or arrive here pre-filled from intake) and print a
// sheet of QR labels — one per physical copy — via the browser print dialog.
export default function Labels() {
  const titles = useStore((s) => s.titles)
  const copies = useStore((s) => s.copies)
  const [params] = useSearchParams()

  const titleById = useMemo(() => {
    const m = {}
    for (const t of titles) m[t.id] = t
    return m
  }, [titles])

  // Preselect copies passed from intake (?copies=1001,1002).
  const preselected = useMemo(() => {
    const raw = params.get('copies')
    return raw ? raw.split(',').filter(Boolean) : []
  }, [params])

  const [selected, setSelected] = useState(() => new Set(preselected))
  useEffect(() => {
    if (preselected.length) setSelected(new Set(preselected))
  }, [preselected])

  const [filter, setFilter] = useState('')

  const rows = useMemo(() => {
    const needle = filter.trim().toLowerCase()
    return copies
      .map((c) => ({ copy: c, title: titleById[c.titleId] }))
      .filter(({ title, copy }) => {
        if (!title) return false
        if (!needle) return true
        return (
          title.name.toLowerCase().includes(needle) ||
          String(copy.id).includes(needle)
        )
      })
      .sort((a, b) => Number(b.copy.id) - Number(a.copy.id))
  }, [copies, titleById, filter])

  const selectedRows = useMemo(
    () =>
      copies
        .filter((c) => selected.has(c.id))
        .map((c) => ({ copy: c, title: titleById[c.titleId] }))
        .filter((r) => r.title)
        .sort((a, b) => Number(a.copy.id) - Number(b.copy.id)),
    [copies, titleById, selected]
  )

  function toggle(id) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div>
      <div className="row-between no-print">
        <div>
          <h1>QR labels</h1>
          <p className="subtitle">
            Select copies and print a sheet of QR labels — one per physical book. Stick each label
            inside its book.
          </p>
        </div>
        <div className="btn-row">
          <button
            className="btn"
            onClick={() => setSelected(new Set(rows.map((r) => r.copy.id)))}
          >
            Select all shown
          </button>
          <button className="btn ghost" onClick={() => setSelected(new Set())}>
            Clear
          </button>
          <button
            className="btn primary"
            disabled={selected.size === 0}
            onClick={() => window.print()}
          >
            Print {selected.size > 0 ? `${selected.size} ` : ''}labels
          </button>
        </div>
      </div>

      <div className="notice info no-print">
        <strong>Prototype note:</strong> printing uses the browser print dialog (QR + copy ID +
        short title as a label sheet). On the real setup this drives a Brother QL-800 thermal
        printer; no printer hardware is required to preview or test here.
      </div>

      <div className="grid-2">
        <div className="no-print">
          <div className="field">
            <label>Find copies</label>
            <input
              type="search"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Title or copy ID…"
            />
          </div>
          <div className="panel" style={{ maxHeight: 460, overflow: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th style={{ width: 32 }}></th>
                  <th>Copy</th>
                  <th>Title</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ copy, title }) => (
                  <tr key={copy.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selected.has(copy.id)}
                        onChange={() => toggle(copy.id)}
                        style={{ width: 'auto' }}
                      />
                    </td>
                    <td className="mono">#{copy.id}</td>
                    <td>{title.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="no-print">Preview ({selectedRows.length})</h2>
          {selectedRows.length === 0 ? (
            <div className="empty no-print">Select copies on the left to build a label sheet.</div>
          ) : (
            <div className="label-sheet">
              {selectedRows.map(({ copy, title }) => (
                <div className="qr-label" key={copy.id}>
                  <QrCode value={copyUrl(copy.id)} size={84} alt={`QR ${copy.id}`} />
                  <div className="label-text">
                    <div className="cid">#{copy.id}</div>
                    <div>{shortTitle(title.name)}</div>
                    <div>{title.section.split(' ')[0]}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function shortTitle(name) {
  return name.length > 40 ? name.slice(0, 38) + '…' : name
}
