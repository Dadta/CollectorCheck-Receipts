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