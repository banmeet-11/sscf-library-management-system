// Subject sections (a book belongs to exactly one) — from planning doc §2.
export const SECTIONS = [
  'Gurbani & Scripture Study',
  'Sikh History',
  'Biographies & Life Stories',
  'Philosophy, Theology & Way of Life',
  'Learn Punjabi / Gurmukhi',
  'Kirtan, Raag & Music',
  'Children & Youth',
  'Punjabi Literature (secular)',
  'Reference',
  'Periodicals & Magazines',
]

// Tags applied to every title — from planning doc §2.
export const LANGUAGES = ['Punjabi', 'English', 'Hindi', 'Other']
export const AUDIENCES = ['adult', 'children']
export const FORMATS = ['book', 'gutka', 'pothi', 'magazine']

// Copy status — from planning doc §4.
export const STATUS = {
  AVAILABLE: 'available',
  ON_LOAN: 'on loan',
  NON_CIRCULATING: 'non-circulating',
}

// Reference and Periodicals are non-borrowable by default; pothi format is
// handled with maryada and defaults to non-circulating (§3).
export const NON_CIRCULATING_SECTIONS = ['Reference']

export function defaultStatusFor({ section, format }) {
  if (format === 'pothi') return STATUS.NON_CIRCULATING
  if (NON_CIRCULATING_SECTIONS.includes(section)) return STATUS.NON_CIRCULATING
  return STATUS.AVAILABLE
}

// Default loan period in days (open committee decision — kept configurable).
export const DEFAULT_LOAN_DAYS = 21
