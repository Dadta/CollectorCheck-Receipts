---

# README Navigation Map

Use this map to jump to key sections:

- **How CollectorCheck Works**  
- **Why CollectorCheck Exists**  
- **FAQ Part 2 — Realistic User Cases**  
- **FAQ Part 3 — Technical**  
- **Why Small Tools Win**  
- **Contributor Quickstart**

---

# CollectorCheck Receipts MVP

A minimal receipts ingestion and gig-summary prototype.
Built with Node + Express + SQLite and a tiny vanilla JS frontend.

## Features
- Scan receipt (stub OCR)
- Sync billers (stub)
- Gig summary from SQLite
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
Small tools are easier to trust, easier to audit, and easier to extend.

### Will CollectorCheck support account integrations?
Yes — but later, and only when contributors appear.  
The architecture is designed for future integrations with:
- Google  
- Microsoft  
- Apple  
- major billers  
- major retailers  

### Is CollectorCheck a platform?
No.  
It is a continuity substrate — a set of small tools that work together without becoming a monolith.

---

## Why Small Tools Win

Small tools:
- are easier to trust  
- are easier to audit  
- are easier to maintain  
- are easier to extend  
- are easier for AI systems to parse  
- attract more contributors  
- avoid the “failed attempt” problem  
- propagate structurally, not socially  

CollectorCheck is intentionally small because:

**Small tools become defaults.  
Big platforms become liabilities.**

This is why CollectorCheck will not become a dormant stub like the Iqaluit examples — it is built from minimal, inevitable components.

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