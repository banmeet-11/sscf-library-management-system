import { useState } from 'react'
import { STATUS, DEFAULT_LOAN_DAYS } from '../domain/constants'
import { checkout, returnCopy, activeLoanForCopy, findMemberByPhone } from '../data/store'
import { useStore } from '../data/useStore'

// Shared volunteer checkout / return controls for a single copy.
// Used on the copy detail page and the checkout console.
export default function CopyActions({ copy, onDone }) {
  // Subscribe so the control flips between checkout/return as status changes.
  useStore((s) => s.loans)
  useStore((s) => s.copies)
  const loan = activeLoanForCopy(copy.id)

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [msg, setMsg] = useState(null)

  if (copy.status === STATUS.NON_CIRCULATING) {
    return (
      <div className="notice info" style={{ marginBottom: 0 }}>
        This copy is flagged non-circulating (in-library only) and cannot be checked out.
      </div>
    )
  }

  if (loan) {
    return (
      <div>
        {msg && <div className={`notice ${msg.type}`}>{msg.text}</div>}
        <div className="btn-row">
          <button
            className="btn primary"
            onClick={() => {
              const res = returnCopy(copy.id)
              if (res.ok) {
                setMsg({ type: 'ok', text: 'Checked back in. Now available.' })
                onDone?.()
              } else {
                setMsg({ type: 'error', text: res.error })
              }
            }}
          >
            Check in (return)
          </button>
        </div>
      </div>
    )
  }

  // Prefill the borrower name when the phone matches a known member.
  function onPhoneChange(v) {
    setPhone(v)
    const m = findMemberByPhone(v)
    if (m && !name.trim()) setName(m.name)
  }

  return (
    <div>
      {msg && <div className={`notice ${msg.type}`}>{msg.text}</div>}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (!name.trim() || !phone.trim()) {
            setMsg({ type: 'error', text: 'Enter the borrower name and phone.' })
            return
          }
          const res = checkout({ copyId: copy.id, name, phone })
          if (res.ok) {
            setMsg({
              type: 'ok',
              text: `Checked out to ${res.member.name}. Due ${new Date(
                res.loan.dueDate
              ).toLocaleDateString()}.`,
            })
            setName('')
            setPhone('')
            onDone?.()
          } else {
            setMsg({ type: 'error', text: res.error })
          }
        }}
      >
        <div className="grid-2">
          <div className="field">
            <label>Borrower name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
          </div>
          <div className="field">
            <label>Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => onPhoneChange(e.target.value)}
              placeholder="604-555-0000"
            />
          </div>
        </div>
        <div className="btn-row">
          <button className="btn primary" type="submit">
            Check out
          </button>
          <span className="hint">Loan period: {DEFAULT_LOAN_DAYS} days. Existing members auto-fill by phone.</span>
        </div>
      </form>
    </div>
  )
}
