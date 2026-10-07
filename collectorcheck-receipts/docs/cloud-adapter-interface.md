<!-- Cloud Adapter Interface source: canonical interface for cloud sync modules in CollectorCheck‑Receipts. -->

# CollectorCheck‑Receipts — Cloud Adapter Interface

Cloud sync in CollectorCheck‑Receipts is optional, modular, and deterministic.  
Adapters provide a stable interface for uploading normalized receipts and metadata to cloud storage providers.

This document defines the canonical interface, invariants, and extension rules for all cloud adapters.

---

## Core Principles

1. **Optional by design**  
   CollectorCheck works fully offline; cloud sync is an add‑on.

2. **Deterministic behavior**  
   Identical input must always produce identical cloud paths and results.

3. **Stable interface**  
   All adapters must implement the same interface.

4. **Non-destructive sync**  
   Cloud sync must never modify or delete local files.

5. **Predictable failure modes**  
   Adapters must return structured errors, never nondeterministic exceptions.

---

## Adapter Directory Structure
```
/src/cloud
/onedrive-adapter.js
/dropbox-adapter.js
/google-drive-adapter.js
/local-sync-adapter.js
/interface.js
```
Each adapter implements the canonical interface defined in `interface.js`.

---

## Canonical Adapter Interface

All cloud adapters must implement the following methods:

```ts
interface CloudAdapter {
  initialize(config: CloudConfig): Promise<InitResult>;
  uploadFile(localPath: string, remotePath: string): Promise<UploadResult>;
  uploadMetadata(metadata: ReceiptMetadata): Promise<UploadResult>;
  resolveRemotePath(normalizedFilename: string): string;
  verifyConnection(): Promise<ConnectionStatus>;
}
```

### Method Definitions

#### `initialize(config)`
Initializes the adapter with provider-specific configuration.

- Must be deterministic.
- Must not perform network calls unless required.
- Must return:

```json
{
  "success": true,
  "adapter": "onedrive"
}
```

#### `uploadFile(localPath, remotePath)`
Uploads a normalized file to cloud storage.

- Must not modify the local file.
- Must not rename the file nondeterministically.
- Must return:

```json
{
  "success": true,
  "remotePath": "string"
}
```

#### `uploadMetadata(metadata)`
Uploads the metadata object as JSON.

- Must serialize deterministically.
- Must store metadata alongside the file.
- Must return:

```json
{
  "success": true,
  "remotePath": "string"
}
```

#### `resolveRemotePath(normalizedFilename)`
Computes the deterministic cloud path for a file.

Rules:

- Must use normalized filename.
- Must use stable folder structure.
- Must not include timestamps.
- Must not include random identifiers.

Example:

```
/receipts/2024/2024-03-14_Costco_89.23.json
```

#### `verifyConnection()`
Checks whether the adapter can reach the cloud provider.

- Must return deterministic status codes.
- Must not throw exceptions.

Example:

```json
{
  "connected": true,
  "adapter": "dropbox"
}
```

## Deterministic Path Rules
Cloud paths must follow:

```
/receipts/YYYY/YYYY-MM-DD_vendor_total.ext
```

Metadata paths must follow:

```
/receipts/YYYY/YYYY-MM-DD_vendor_total.json
```

Rules:

- Use normalized date.
- Use normalized vendor.
- Use normalized total.
- Use lowercase extensions.
- Never include timestamps or random values.

## Error Handling
Adapters must return structured errors:

```json
{
  "code": "UPLOAD_FAILED",
  "message": "Network error",
  "adapter": "onedrive"
}
```

Rules:

- Never throw nondeterministic exceptions.
- Never swallow errors silently.
- Never return partial success.

## Adapter Configuration
Adapters must accept a deterministic configuration object:

```json
{
  "rootFolder": "/receipts",
  "authToken": "string",
  "region": "string"
}
```

Rules:

- Must not mutate configuration.
- Must not store configuration outside the adapter.
- Must not rely on OS locale or environment variables.

## Supported Providers
CollectorCheck supports:

- OneDrive
- Dropbox
- Google Drive
- Local sync (for testing)

Future adapters must follow this interface exactly.

## Extension Rules
Any new cloud adapter must:

- implement the canonical interface
- be deterministic
- be documented here
- be backward-compatible
- not break existing adapters

## Summary
The cloud adapter interface ensures CollectorCheck‑Receipts can sync normalized receipts and metadata to cloud storage in a deterministic, stable, contributor-friendly way.

All adapters must follow this interface exactly.