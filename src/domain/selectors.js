import { STATUS } from './constants'

// Copies belonging to a title.
export function copiesForTitle(copies, titleId) {
  return copies.filter((c) => c.titleId === titleId)
}

// Availability summary for a title, used on catalog cards and detail pages.
export function availability(copies, titleId) {
  const mine = copiesForTitle(copies, titleId)
  const total = mine.length
  const available = mine.filter((c) => c.status === STATUS.AVAILABLE).length
  const onLoan = mine.filter((c) => c.status === STATUS.ON_LOAN).length
  const nonCirculating = mine.filter((c) => c.status === STATUS.NON_CIRCULATING).length
  const borrowable = mine.some((c) => c.status !== STATUS.NON_CIRCULATING)
  return { total, available, onLoan, nonCirculating, borrowable }
}
