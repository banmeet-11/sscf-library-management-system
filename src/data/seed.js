// Seed data so a reviewer opens the app to a populated, believable library.
// Returns a fresh object each call (used on first load and on "reset demo").

import { STATUS, defaultStatusFor } from '../domain/constants'

let copyCounter = 1000
function makeCopies(title, specs) {
  return specs.map((s) => {
    copyCounter += 1
    return {
      id: String(copyCounter),
      titleId: title.id,
      acquisitionDate: s.acquisitionDate || '2024-01-15',
      donor: s.donor || '',
      condition: s.condition || 'good',
      status: s.status || defaultStatusFor(title),
      createdAt: '2024-01-15T00:00:00.000Z',
    }
  })
}

export function seed() {
  copyCounter = 1000
  const titles = []
  const copies = []
  const members = [
    { id: 'm1', name: 'Harjit Kaur', phone: '604-555-0142', createdAt: '2024-02-01T00:00:00.000Z' },
    { id: 'm2', name: 'Gurpreet Singh', phone: '604-555-0198', createdAt: '2024-02-03T00:00:00.000Z' },
    { id: 'm3', name: 'Simran Kaur', phone: '778-555-0111', createdAt: '2024-03-10T00:00:00.000Z' },
  ]

  function add(title, copySpecs) {
    titles.push(title)
    copies.push(...makeCopies(title, copySpecs))
  }

  add(
    {
      id: 't1',
      name: 'Nitnem Gutka',
      author: '',
      section: 'Gurbani & Scripture Study',
      language: 'Punjabi',
      audience: 'adult',
      format: 'gutka',
      description: 'Daily banis — Japji Sahib, Jaap Sahib, Rehras Sahib, Kirtan Sohila.',
      isbn: '',
      coverUrl: '',
      createdAt: '2024-01-15T00:00:00.000Z',
    },
    [{}, {}, {}, {}, {}, {}] // 6 copies, freely used
  )

  add(
    {
      id: 't2',
      name: 'Sri Guru Granth Sahib — English Translation',
      author: 'Sant Singh Khalsa (tr.)',
      section: 'Gurbani & Scripture Study',
      language: 'English',
      audience: 'adult',
      format: 'book',
      description: 'Full English translation with transliteration.',
      isbn: '',
      coverUrl: '',
      createdAt: '2024-01-15T00:00:00.000Z',
    },
    [{}, {}]
  )

  add(
    {
      id: 't3',
      name: 'A History of the Sikhs, Vol. 1',
      author: 'Khushwant Singh',
      section: 'Sikh History',
      language: 'English',
      audience: 'adult',
      format: 'book',
      description: '1469–1839. Standard scholarly history.',
      isbn: '9780195673081',
      coverUrl: '',
      createdAt: '2024-01-15T00:00:00.000Z',
    },
    [{}, { status: STATUS.ON_LOAN }]
  )

  add(
    {
      id: 't4',
      name: 'ਸਿੱਖ ਇਤਿਹਾਸ (Sikh Itihaas)',
      author: 'Principal Satbir Singh',
      section: 'Sikh History',
      language: 'Punjabi',
      audience: 'adult',
      format: 'book',
      description: 'Punjabi-language history of the Guru period and the Khalsa.',
      isbn: '',
      coverUrl: '',
      createdAt: '2024-01-15T00:00:00.000Z',
    },
    [{}]
  )

  add(
    {
      id: 't5',
      name: 'Banda Singh Bahadur',
      author: 'Sohan Singh Seetal',
      section: 'Biographies & Life Stories',
      language: 'Punjabi',
      audience: 'adult',
      format: 'book',
      description: 'Life of the great general and first Sikh sovereign.',
      isbn: '',
      coverUrl: '',
      createdAt: '2024-01-15T00:00:00.000Z',
    },
    [{}, { status: STATUS.ON_LOAN }]
  )

  add(
    {
      id: 't6',
      name: 'Sikh Rehat Maryada',
      author: 'SGPC',
      section: 'Philosophy, Theology & Way of Life',
      language: 'English',
      audience: 'adult',
      format: 'book',
      description: 'The official code of conduct and conventions.',
      isbn: '',
      coverUrl: '',
      createdAt: '2024-01-15T00:00:00.000Z',
    },
    [{}, {}, {}]
  )

  add(
    {
      id: 't7',
      name: 'Learn Gurmukhi — A Primer',
      author: '',
      section: 'Learn Punjabi / Gurmukhi',
      language: 'Punjabi',
      audience: 'adult',
      format: 'book',
      description: 'Alphabet, matras, and reading practice for beginners.',
      isbn: '',
      coverUrl: '',
      createdAt: '2024-01-15T00:00:00.000Z',
    },
    [{}, {}]
  )

  add(
    {
      id: 't8',
      name: 'Illustrated Stories of the Ten Gurus',
      author: '',
      section: 'Children & Youth',
      language: 'English',
      audience: 'children',
      format: 'book',
      description: 'Colourful stories for young readers.',
      isbn: '',
      coverUrl: '',
      createdAt: '2024-01-15T00:00:00.000Z',
    },
    [{}, {}, {}, {}]
  )

  add(
    {
      id: 't9',
      name: 'Shabad Kirtan Sangreh',
      author: '',
      section: 'Kirtan, Raag & Music',
      language: 'Punjabi',
      audience: 'adult',
      format: 'book',
      description: 'Collection of shabads with raag notation for kirtan.',
      isbn: '',
      coverUrl: '',
      createdAt: '2024-01-15T00:00:00.000Z',
    },
    [{}]
  )

  add(
    {
      id: 't10',
      name: 'Mahan Kosh',
      author: 'Bhai Kahn Singh Nabha',
      section: 'Reference',
      language: 'Punjabi',
      audience: 'adult',
      format: 'book',
      description: 'The encyclopaedia of Sikh literature. Reference only.',
      isbn: '',
      coverUrl: '',
      createdAt: '2024-01-15T00:00:00.000Z',
    },
    [{}] // Reference → non-circulating by default
  )

  add(
    {
      id: 't11',
      name: 'Pothi Sahib',
      author: '',
      section: 'Gurbani & Scripture Study',
      language: 'Punjabi',
      audience: 'adult',
      format: 'pothi',
      description: 'Contains Gurbani — handled with maryada. In-library only.',
      isbn: '',
      coverUrl: '',
      createdAt: '2024-01-15T00:00:00.000Z',
    },
    [{}, {}] // pothi → non-circulating by default
  )

  add(
    {
      id: 't12',
      name: 'Gurmat Parkash (Monthly)',
      author: 'SGPC',
      section: 'Periodicals & Magazines',
      language: 'Punjabi',
      audience: 'adult',
      format: 'magazine',
      description: 'Monthly magazine on Gurmat and community affairs.',
      isbn: '',
      coverUrl: '',
      createdAt: '2024-01-15T00:00:00.000Z',
    },
    [{}]
  )

  // Build the two open loans referenced above (copies flagged ON_LOAN).
  const onLoanCopies = copies.filter((c) => c.status === STATUS.ON_LOAN)
  const loans = []
  const today = new Date()
  onLoanCopies.forEach((c, i) => {
    const checkout = new Date(today)
    // First loan is overdue (checked out 30 days ago, 21-day period);
    // second is current (checked out 5 days ago).
    checkout.setDate(checkout.getDate() - (i === 0 ? 30 : 5))
    const due = new Date(checkout)
    due.setDate(due.getDate() + 21)
    loans.push({
      id: `l${i + 1}`,
      copyId: c.id,
      memberId: members[i % members.length].id,
      checkoutDate: checkout.toISOString(),
      dueDate: due.toISOString(),
      returnDate: null,
    })
  })

  return { titles, copies, members, loans }
}
