import { Link, useParams } from 'react-router-dom'
import { useStore } from '../data/useStore'
import { useAuth } from '../data/auth'
import { STATUS } from '../domain/constants'
import { activeLoanForCopy } from '../data/store'
import QrCode, { copyUrl } from '../components/QrCode'
import StatusBadge from '../components/StatusBadge'
import CopyActions from '../components/CopyActions'

// The page a QR code opens: one physical copy. Public visitors see status;
// volunteers get checkout / return controls inline (planning doc §5, §7).
export default function CopyDetail() {
  const { copyId } = useParams()
  const isVolunteer = useAuth()
  const copy = useStore((s) => s.copies.find((c) => c.id === copyId) || null)
  const title = useStore((s) =>
    copy ? s.titles.find((t) => t.id === copy.titleId) || null : null
  )
  // Re-read loan reactively so the member name updates after checkout.
  useStore((s) => s.loans)
  const loan = copy ? activeLoanForCopy(copy.id) : null
  const member = useStore((s) =>
    loan ? s.members.find((m) => m.id === loan.memberId) || null : null
  )

  if (!copy || !title) {
    return (
      <div className="empty">
        <h1>Copy not found</h1>
        <p>No copy with this ID exists. Check the QR label or scan again.</p>
        <Link to="/">Back to the catalogue</Link>
      </div>
    )
  }

  return (
    <div>
      <p>
        <Link to={`/title/${title.id}`}>← {title.name}</Link>
      </p>

      <div className="row-between">
        <div>
          <h1>{title.name}</h1>
          {title.author && <p className="subtitle">{title.author}</p>}
        </div>
        <StatusBadge status={copy.status} />
      </div>

      <div className="grid-2">
        <div className="card">
          <dl className="kv">
            <dt>Copy ID</dt>
            <dd className="mono">#{copy.id}</dd>
            <dt>Section</dt>
            <dd>{title.section}</dd>
            <dt>Tags</dt>
            <dd>
              {title.language} · {title.audience} · {title.format}
            </dd>
            <dt>Condition</dt>
            <dd>{copy.condition}</dd>
            <dt>Acquired</dt>
            <dd>{copy.acquisitionDate}</dd>
            {isVolunteer && (
              <>
                <dt>Donor</dt>
                <dd>{copy.donor || '—'}</dd>
              </>
            )}
          </dl>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <QrCode value={copyUrl(copy.id)} size={140} alt={`QR for copy ${copy.id}`} />
          <div className="hint mono">/copy/{copy.id}</div>
        </div>
      </div>

      {loan && (
        <div className="notice info">
          On loan to <strong>{member ? member.name : 'a member'}</strong>
          {member && ` (${member.phone})`} · due {new Date(loan.dueDate).toLocaleDateString()}
          {new Date(loan.dueDate) < new Date() && (
            <>
              {' '}
              — <strong>overdue</strong>
            </>
          )}
        </div>
      )}

      {isVolunteer ? (
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Volunteer</h2>
          <CopyActions copy={copy} />
        </div>
      ) : (
        <PublicNote copy={copy} />
      )}
    </div>
  )
}

function PublicNote({ copy }) {
  if (copy.status === STATUS.NON_CIRCULATING) {
    return (
      <div className="notice info">
        This item stays in the library and is not for borrowing.
      </div>
    )
  }
  if (copy.status === STATUS.AVAILABLE) {
    return (
      <div className="notice info">
        Available. Bring it to a volunteer at the desk to borrow it.
      </div>
    )
  }
  return null
}
