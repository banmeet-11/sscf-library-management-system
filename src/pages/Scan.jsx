import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Html5Qrcode } from 'html5-qrcode'

// Camera-based QR scanning (planning doc §5). Runs entirely in the phone
// browser — no app install. A scanned QR encodes a /copy/:id URL; we extract
// the copy id and open that copy. A manual entry fallback is provided for
// desktops / cameras that can't be used.
export default function Scan() {
  const nav = useNavigate()
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState('')
  const [manual, setManual] = useState('')
  const scannerRef = useRef(null)
  const regionId = 'qr-scan-region'

  useEffect(() => {
    return () => {
      // Ensure the camera is released when leaving the page.
      stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function extractCopyId(text) {
    // Accept a full URL (…/copy/1234), a "/copy/1234" path, or a bare id.
    const m = String(text).match(/copy\/(\w+)/i)
    if (m) return m[1]
    const bare = String(text).trim()
    return /^\w+$/.test(bare) ? bare : null
  }

  async function start() {
    setError('')
    setScanning(true)
    try {
      const scanner = new Html5Qrcode(regionId)
      scannerRef.current = scanner
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText) => {
          const id = extractCopyId(decodedText)
          if (id) {
            stop().then(() => nav(`/copy/${id}`))
          }
        },
        () => {} // per-frame decode failures are normal; ignore
      )
    } catch (err) {
      setScanning(false)
      setError(
        'Could not start the camera. Grant camera permission, or use manual entry below. ' +
          (err?.message || '')
      )
    }
  }

  async function stop() {
    const scanner = scannerRef.current
    if (scanner) {
      try {
        await scanner.stop()
        await scanner.clear()
      } catch {
        // already stopped
      }
      scannerRef.current = null
    }
    setScanning(false)
  }

  function goManual(e) {
    e.preventDefault()
    const id = extractCopyId(manual)
    if (id) nav(`/copy/${id}`)
    else setError('Enter a valid copy ID or /copy/ link.')
  }

  return (
    <div>
      <h1>Scan a book</h1>
      <p className="subtitle">
        Point the camera at the QR label inside a book to open that copy — check it out, return it,
        or see its status.
      </p>

      {error && <div className="notice error">{error}</div>}

      <div className="card" style={{ maxWidth: 480 }}>
        <div
          id={regionId}
          style={{
            width: '100%',
            minHeight: scanning ? 300 : 0,
            borderRadius: 8,
            overflow: 'hidden',
          }}
        />
        <div className="btn-row" style={{ marginTop: scanning ? '1rem' : 0 }}>
          {!scanning ? (
            <button className="btn primary" onClick={start}>
              Start camera
            </button>
          ) : (
            <button className="btn" onClick={stop}>
              Stop camera
            </button>
          )}
        </div>

        <div className="divider" />

        <form onSubmit={goManual}>
          <div className="field">
            <label>Or enter a copy ID</label>
            <input
              value={manual}
              onChange={(e) => setManual(e.target.value)}
              placeholder="e.g. 1004 or /copy/1004"
            />
          </div>
          <button className="btn" type="submit">
            Open copy
          </button>
        </form>
      </div>
    </div>
  )
}
