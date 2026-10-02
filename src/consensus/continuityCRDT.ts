export class ContinuityCRDT {
  // Merge collectibles by highest continuity score
  mergeCollectibles(local: any[], remote: any[]) {
    const map = new Map();

    [...local, ...remote].forEach((c) => {
      const existing = map.get(c.id);
      if (!existing || c.continuityScore > existing.continuityScore) {
        map.set(c.id, c);
      }
    });

    return Array.from(map.values());
  }

  // Merge ledger by timestamp (latest wins)
  mergeLedger(local: any[], remote: any[]) {
    const map = new Map();

    [...local, ...remote].forEach((entry) => {
      const existing = map.get(entry.collectibleId);
      if (!existing || entry.timestamp > existing.timestamp) {
        map.set(entry.collectibleId, entry);
      }
    });

    return Array.from(map.values());
  }

  // Merge meta progression by union of legacy bonuses
  mergeMeta(local: any[], remote: any[]) {
    const set = new Set();

    local.forEach((b) => set.add(JSON.stringify(b)));
    remote.forEach((b) => set.add(JSON.stringify(b)));

    return Array.from(set).map((s) => JSON.parse(s));
  }
}