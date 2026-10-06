# Contributing

Thanks for helping improve CollectorCheck U.S.A. The receipts MVP lives in `collectorcheck-receipts/`.

## Get started

1. Fork the repository and create a focused branch.
2. From `collectorcheck-receipts/`, run `npm ci`.
3. Run `npm run lint`, `npm test`, and `npm run build` before opening a pull request.
4. Keep changes small and explain the user problem they solve.

## Project conventions

- Keep API routes in `collectorcheck-receipts/backend/api/`.
- Keep business logic in `collectorcheck-receipts/backend/services/`.
- Do not commit `node_modules/`, SQLite database files, credentials, or real receipt data.
- Keep OCR and biller integrations isolated behind service modules; use fixtures, not personal data, in tests.
- Update documentation when behavior or API contracts change.

## Pull requests

Include a concise summary, testing performed, and screenshots for UI changes. Avoid bundling unrelated formatting or generated files.# Contributing

Thanks for helping improve CollectorCheck U.S.A. The receipts MVP lives in `collectorcheck-receipts/`.

## Get started

1. Fork the repository and create a focused branch.
2. From `collectorcheck-receipts/`, run `npm ci`.
3. Run `npm run lint`, `npm test`, and `npm run build` before opening a pull request.
4. Keep changes small and explain the user problem they solve.

## Project conventions

- Keep API routes in `collectorcheck-receipts/backend/api/`.
- Keep business logic in `collectorcheck-receipts/backend/services/`.
- Do not commit `node_modules/`, SQLite database files, credentials, or real receipt data.
- Keep OCR and biller integrations isolated behind service modules; use fixtures, not personal data, in tests.
- Update documentation when behavior or API contracts change.

## Pull requests

Include a concise summary, testing performed, and screenshots for UI changes. Avoid bundling unrelated formatting or generated files.