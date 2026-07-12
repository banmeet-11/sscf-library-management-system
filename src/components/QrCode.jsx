import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

// Renders a QR code (as a PNG data URL) that encodes the given text.
// For a copy this encodes the full URL, e.g. https://host/copy/1234.
export default function QrCode({ value, size = 120, alt = 'QR code' }) {
  const [src, setSrc] = useState('')
  useEffect(() => {
    let live = true
    QRCode.toDataURL(value, { margin: 1, width: size * 2 })
      .then((url) => live && setSrc(url))
      .catch(() => live && setSrc(''))
    return () => {
      live = false
    }
  }, [value, size])
  if (!src) return <div style={{ width: size, height: size }} aria-hidden />
  return <img src={src} width={size} height={size} alt={alt} />
}

// The URL a copy's QR should point at. Uses the current origin so a phone on
// the same network opens the right copy page when scanned.
export function copyUrl(copyId) {
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  return `${origin}/copy/${copyId}`
}
