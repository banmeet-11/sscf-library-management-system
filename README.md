# Gurdwara Library — Prototype (v1)

A standalone website to catalogue the gurdwara library, track each physical copy
via a QR code, and let the sangat browse and borrow books. Built to the
`Planning_doc.pdf` spec.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:5173.

- **Public** (no login): browse, search, and filter the catalogue; scan a QR to
  open a copy.
- **Volunteer** actions (add books, print labels, checkout/return, dashboard):
  click **Volunteer login** and enter the passcode **`sewa`**.

## What's included (v1 feature list from the plan)

1. **Add a title with tags, then N copies** — `Add / Donation`. Each copy gets a
   unique ID + QR. "Save & add another" keeps the form open for fast entry.
2. **Batch-generate & print QR labels** — `Labels`. Select copies (or arrive
   pre-filled from intake) and print a label sheet via the browser print dialog.
3. **Public browse / search / filter** — by section, language, audience, and
   availability. No login.
4. **Scan a QR to open that copy** — `Scan` (phone camera) or manual copy-ID entry.
5. **Volunteer checkout & return via scan** — look up / add a borrower by phone,
   flip the copy between available / on loan.
6. **"Who has what / what's overdue"** — `Dashboard`, with collection stats.
7. **Volunteer login; public browse stays open.**

Sacred-item handling from the plan is supported: **gutkas** are a normal
browsable category with the `gutka` format tag; **pothis** and **Reference**
items default to **non-circulating (in-library only)** and cannot be checked out.

## How it's built

- **Vite + React + React Router** — a light client-side app.
- **Local-first data** — all data lives in the browser (`localStorage`) and is
  seeded with a believable sample library on first load. Use **Reset demo data**
  on the dashboard to restore the seed.
- The data layer (`src/data/store.js`) is written as an async-style repository so
  it can be swapped for **Supabase** (Postgres + Auth + Storage) later — per the
  plan's recommended stack — without changing the UI.

### Data model (`titles` → `copies`, plus `members` and `loans`)

Separating a **title** (the work) from a **copy** (a physical object) is what
makes duplicate gutkas manageable: one title, many copies, one QR per copy.
Search/filter happen on the title's tags; borrowing happens at the copy level.

## Notes for reviewers

- **Label printing** uses the browser print dialog to produce a QR label sheet
  (QR + copy ID + short title). On the real setup this drives a Brother QL-800
  thermal printer; **no printer hardware is needed** to preview or test here.
- The volunteer passcode (`sewa`) is a stand-in for real accounts. It is **not**
  security — Supabase Auth replaces it before production.

## Project structure

```
src/
  data/        store (repository + persistence), seed data, auth, React hook
  domain/      constants (sections, tags, statuses), selectors
  components/  QrCode, StatusBadge, CopyActions, RequireVolunteer
  pages/       Catalog, TitleDetail, CopyDetail, Scan, Intake, Labels,
               Checkout, Dashboard, Login
```
