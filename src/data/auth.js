// Minimal volunteer auth for the prototype.
//
// This is NOT real security — it's a stand-in for Supabase Auth so the demo can
// show "public browse is open, volunteer actions require login." A shared
// passcode gates the volunteer area; swap for real auth before production.

import { useSyncExternalStore } from 'react'

const KEY = 'gurdwara-library:volunteer'
const DEMO_PASSCODE = 'sewa' // shared volunteer passcode for the prototype

const listeners = new Set()
function emit() {
  for (const l of listeners) l()
}

export function login(passcode) {
  if (passcode.trim().toLowerCase() !== DEMO_PASSCODE) {
    return { ok: false, error: 'Incorrect passcode.' }
  }
  localStorage.setItem(KEY, '1')
  emit()
  return { ok: true }
}

export function logout() {
  localStorage.removeItem(KEY)
  emit()
}

function isLoggedIn() {
  return localStorage.getItem(KEY) === '1'
}

export function useAuth() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    isLoggedIn
  )
}

export { DEMO_PASSCODE }
