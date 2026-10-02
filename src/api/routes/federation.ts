import { Router } from "express";

import { requireIdentity } from "../middleware/auth";
import { SyncRegistry } from "../../sync/syncRegistry";
import { EpochCollectibleStore } from "../../epoch/epochCollectible";
import { ContinuityLedger } from "../../epoch/continuityLedger";
import { MetaProgression } from "../../runtime/metaProgression";
import { EventEngine } from "../../runtime/eventEngine";
import { WorldBuffs } from "../../runtime/worldBuffs";
import { FederationMesh } from "../../federation/federationMesh";
import { PackRegistry } from "../../runtime/packRegistry";
import { PackSelector } from "../../runtime/packSelector";

const router = Router();

// Minimal engine wiring for federation context
const registry = new PackRegistry();
const selector = new PackSelector(registry);
const engine = new EventEngine(selector);
const buffs = new WorldBuffs();

const store = new EpochCollectibleStore();
const ledger = new ContinuityLedger(store);
const meta = new MetaProgression(engine, buffs);

const syncRegistry = new SyncRegistry(store, ledger, meta);
const mesh = new FederationMesh(syncRegistry);

// --------------------------------------------
// POST /federation/receive
// --------------------------------------------
router.post("/receive", requireIdentity, async (req, res) => {
  await mesh.receive(req.body);
  res.json({ status: "ok" });
});

export default router;