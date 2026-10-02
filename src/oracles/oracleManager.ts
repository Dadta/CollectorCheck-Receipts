import { OracleBase, OracleResult } from "./oracleBase";
import { SyncRegistry } from "../sync/syncRegistry";
import { logInfo } from "../utils/log";

export class OracleManager {
  private oracles: OracleBase[] = [];
  private registry: SyncRegistry;
  private results: OracleResult[] = [];

  constructor(registry: SyncRegistry) {
    this.registry = registry;
  }

  addOracle(oracle: OracleBase) {
    this.oracles.push(oracle);
    logInfo(`Oracle registered: ${oracle.oracleId}`);
  }

  async runAll() {
    const bundle = this.registry.buildBundle();

    for (const oracle of this.oracles) {
      const result = await oracle.query(bundle);
      this.results.push(result);
    }

    logInfo("All oracles executed.");
  }

  getResults() {
    return this.results;
  }
}