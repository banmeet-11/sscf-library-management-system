import { STATUS } from '../domain/constants'

export default function StatusBadge({ status, overdue }) {
  if (overdue) return <span className="badge overdue">Overdue</span>
  if (status === STATUS.AVAILABLE) return <span className="badge available">Available</span>
  if (status === STATUS.ON_LOAN) return <span className="badge on-loan">On loan</span>
  if (status === STATUS.NON_CIRCULATING)
    return <span className="badge non-circulating">In-library only</span>
  return <span className="badge">{status}</span>
}
