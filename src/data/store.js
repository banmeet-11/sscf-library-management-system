// Local-first data store.
//
// This is the single source of truth for the prototype. It keeps four
// collections in memory, mirrors the planning doc's data model (§4), and
// persists to localStorage so a reviewer's data survives a page reload.
//
// The public API (listTitles, addTitle, checkout, ...) is intentionally shaped
// like an async repository so that swapping in Supabase later is a drop-in:
// each method can become a table query without the UI changing.

import { STATUS, defaultStatusFor, DEFAULT_LOAN_DAYS } from '../domain/constants'
import { seed } from './seed'

const STORAGE_KEY = 'gurdwara-library:v1'

// ---- persistence ---------------------------------------------------------

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // ignore corrupt storage; fall back to seed
  }
  return seed()
}

let state = load()
const listeners = new Set()

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // storage full / unavailable — keep working from memory
  }
}

function emit() {
  persist()
  for (const l of listeners) l()
}

export function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getState() {
  return state
}

export function resetToSeed() {
  state = seed()
  emit()
}

// ---- id helpers ----------------------------------------------------------

function uid(prefix) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

// ---- titles + copies -----------------------------------------------------

// Adds one title and `quantity` copies. Returns the created title and its new
// copies so the caller can send them straight to the label page.
export function addTitleWithCopies(input) {
  const title = {
    id: uid('t'),
    name: input.name.trim(),
    author: (input.author || '').trim(),
    section: input.section,
    language: input.language,
    audience: input.audience,
    format: input.format,
    description: (input.description || '').trim(),
    isbn: (input.isbn || '').trim(),
    coverUrl: input.coverUrl || '',
    createdAt: new Date().toISOString(),
  }

  const quantity = Math.max(1, Number(input.quantity) || 1)
  const status = defaultStatusFor(title)
  const newCopies = []
  for (let i = 0; i < quantity; i++) {
    newCopies.push({
      id: nextCopyIdSeq(newCopies),
      titleId: title.id,
      acquisitionDate: input.acquisitionDate || new Date().toISOString().slice(0, 10),
      donor: (input.donor || '').trim(),
      condition: input.condition || 'good',
      status,
      createdAt: new Date().toISOString(),
    })
  }

  state = { ...state, titles: [title, ...state.titles], copies: [...newCopies, ...state.copies] }
  emit()
  return { title, copies: newCopies }
}

// Generates sequential copy ids while accounting for copies created earlier in
// the same batch (which aren't in `state` yet).
function nextCopyIdSeq(pending) {
  const existing = state.copies.map((c) => Number(c.id)).filter((n) => !Number.isNaN(n))
  const inBatch = pending.map((c) => Number(c.id))
  const all = existing.concat(inBatch)
  return String((all.length ? Math.max(...all) : 1000) + 1)
}

export function addCopies(titleId, quantity) {
  const title = state.titles.find((t) => t.id === titleId)
  if (!title) return []
  const status = defaultStatusFor(title)
  const newCopies = []
  for (let i = 0; i < Math.max(1, quantity); i++) {
    newCopies.push({
      id: nextCopyIdSeq(newCopies),
      titleId,
      acquisitionDate: new Date().toISOString().slice(0, 10),
      donor: '',
      condition: 'good',
      status,
      createdAt: new Date().toISOString(),
    })
  }
  state = { ...state, copies: [...newCopies, ...state.copies] }
  emit()
  return newCopies
}

export function updateCopy(copyId, patch) {
  state = {
    ...state,
    copies: state.copies.map((c) => (c.id === copyId ? { ...c, ...patch } : c)),
  }
  emit()
}

export function getCopy(copyId) {
  return state.copies.find((c) => c.id === copyId) || null
}

export function getTitle(titleId) {
  return state.titles.find((t) => t.id === titleId) || null
}

// ---- members -------------------------------------------------------------

export function findMemberByPhone(phone) {
  const norm = normalizePhone(phone)
  return state.members.find((m) => normalizePhone(m.phone) === norm) || null
}

export function addMember({ name, phone }) {
  const member = {
    id: uid('m'),
    name: name.trim(),
    phone: phone.trim(),
    createdAt: new Date().toISOString(),
  }
  state = { ...state, members: [member, ...state.members] }
  emit()
  return member
}

export function findOrCreateMember({ name, phone }) {
  const existing = findMemberByPhone(phone)
  if (existing) return existing
  return addMember({ name, phone })
}

function normalizePhone(p) {
  return (p || '').replace(/\D/g, '')
}

// ---- loans / borrowing ---------------------------------------------------

// Checks a copy out to a member. Returns { ok, error }.
export function checkout({ copyId, name, phone, loanDays = DEFAULT_LOAN_DAYS }) {
  const copy = getCopy(copyId)
  if (!copy) return { ok: false, error: 'Copy not found.' }
  if (copy.status === STATUS.NON_CIRCULATING)
    return { ok: false, error: 'This copy is non-circulating and cannot be borrowed.' }
  if (copy.status === STATUS.ON_LOAN)
    return { ok: false, error: 'This copy is already on loan.' }

  const member = findOrCreateMember({ name, phone })
  const checkoutDate = new Date()
  const dueDate = new Date(checkoutDate)
  dueDate.setDate(dueDate.getDate() + loanDays)

  const loan = {
    id: uid('l'),
    copyId,
    memberId: member.id,
    checkoutDate: checkoutDate.toISOString(),
    dueDate: dueDate.toISOString(),
    returnDate: null,
  }
  state = {
    ...state,
    loans: [loan, ...state.loans],
    copies: state.copies.map((c) => (c.id === copyId ? { ...c, status: STATUS.ON_LOAN } : c)),
  }
  emit()
  return { ok: true, loan, member }
}

export function returnCopy(copyId) {
  const copy = getCopy(copyId)
  if (!copy) return { ok: false, error: 'Copy not found.' }
  const loan = state.loans.find((l) => l.copyId === copyId && !l.returnDate)
  if (!loan) return { ok: false, error: 'This copy is not currently on loan.' }

  state = {
    ...state,
    loans: state.loans.map((l) =>
      l.id === loan.id ? { ...l, returnDate: new Date().toISOString() } : l
    ),
    copies: state.copies.map((c) => (c.id === copyId ? { ...c, status: STATUS.AVAILABLE } : c)),
  }
  emit()
  return { ok: true }
}

export function activeLoanForCopy(copyId) {
  return state.loans.find((l) => l.copyId === copyId && !l.returnDate) || null
}

// All open loans, joined with copy/title/member, sorted by due date.
export function openLoans() {
  return state.loans
    .filter((l) => !l.returnDate)
    .map((l) => {
      const copy = getCopy(l.copyId)
      const title = copy ? getTitle(copy.titleId) : null
      const member = state.members.find((m) => m.id === l.memberId) || null
      return { loan: l, copy, title, member, overdue: new Date(l.dueDate) < new Date() }
    })
    .sort((a, b) => new Date(a.loan.dueDate) - new Date(b.loan.dueDate))
}
