
# README Navigation Map

Use this map to jump to key sections:

- [How CollectorCheck Works](docs/how-it-works.md)
- [Why CollectorCheck Exists](docs/why-it-exists.md)
- [FAQ Part 2 — Realistic User Cases](docs/faq-realistic-cases.md)
- [FAQ Part 3 — Technical](#faq-part-3--technical)
- [Why Small Tools Win](#why-small-tools-win)
- [Contributor Quickstart](#contributor-quickstart)


# CollectorCheck Receipts MVP

A minimal receipts ingestion and gig-summary prototype.
Built with Node + Express + SQLite and a tiny vanilla JS frontend.

## Features
- Scan receipt (stub OCR)
- Sync billers (stub)
- Expenses and spending ledger from SQLite
- Minimal dependencies: Express, serve-static, and SQLite

## Run
From `collectorcheck-receipts/`:

```sh
npm install
npm start
```

Open http://localhost:3001/.

---

## Contributor FAQ — Part 3: Technical

### What stack does CollectorCheck use?
- Node  
- Express  
- SQLite  
- Minimal HTML/JS frontend  

### Why SQLite?
- portable  
- auditable  
- zero-config  
- perfect for small tools  
- easy for contributors to understand

### Why no heavy frameworks?
CollectorCheck is intentionally minimal.  
Small tools are easier to use.

### Will CollectorCheck support account integrations?
Yes — but later, and only when contributors appear.  
The architecture is designed for future integrations with:
- Google  
- Microsoft  
- Apple  
- major billers  
- major retailers 

---

## Why Small Tools Win

Small tools:
- are easier to maintain and extend . They are easier for AI systems to parse. They attract more contributors.

CollectorCheck is designed to stay focused, and free of unnecessary complexity. To Capture receipts and generate clean expense records.

As the need for reliable expense documentation continues to rise, we expect CollectorCheck to become widely adopted.

---

## CollectorCheck Ecosystem Diagram (ASCII)

```
+----------------------+
|   Everyday Apps      |
|----------------------|
| McDonald's, Walmart  |
| Amazon, Gas Apps     |
| Grocery, Pharmacy    |
+----------+-----------+
|
v
+----------------------+
|   CollectorCheck     |
|----------------------|
| Receipts Module      |
| Bills Module         |
| Artifacts Module     |
| Identity Continuity  |
+----------+-----------+
|
v
+----------------------+
|   Editable Ledger    |
|----------------------|
| Local, Portable      |
| Auditable, Trusted   |
+----------------------+
```

---

## Repo Folder Map

```text
collectorcheck-receipts/
│
├── backend/
│   ├── server.js          # Express server
│   ├── routes/            # API endpoints
│   └── db/                # SQLite database + schema
│
├── frontend/
│   ├── index.html         # Main UI
│   ├── css/               # Styles
│   └── js/                # Client logic
│
├── public/                # Static assets
│
├── README.md              # Contributor Guide
├── DEVELOPER_ONBOARDING.md
├── LANDING_PAGE_PART3.md
│
└── package.json           # Scripts + dependencies
```

---

## Contributor Quickstart

### 1. Clone the repo
```sh
git clone https://github.com/dadta/continuity-engine.git
cd continuity-engine/collectorcheck-receipts
```

### 2. Install dependencies
```sh
npm install
```

### 3. Start the server
```sh
npm start
```

### 4. Open the app
http://localhost:3001/

### 5. Explore the code
- `backend/server.js` (Express server)
- `backend/api/receipts/scan.js` (receipt scan endpoint)
- `backend/api/billers/sync.js` (biller sync endpoint)
- `backend/api/summary/gig.js` (gig summary endpoint)
- `backend/db/init.js` (SQLite schema initialization)
- `frontend/index.html` and `frontend/main.js` (frontend)

### 6. Pick a small issue
- OCR support
- receipt upload UI
- biller sync
- gig summary charts
- export options
- schema improvements

### 7. Submit a PR
Small PRs are welcome. CollectorCheck is built to be easy to contribute to.
