import { OracleBase, OracleResult } from "./oracleBase";
import { logInfo } from "../utils/log";

export class DadtaBusOracle extends OracleBase {
  constructor() {
    super("dadtabus");
  }

  async query(bundle: any): Promise<OracleResult> {
    const identities = bundle.collectibles.map((c: any) => c.provenance?.createdBy);
    const valid = identities.every((id: any) => typeof id === "string" && id.length > 0);

    const result: OracleResult = {
      oracleId: this.oracleId,
      timestamp: Date.now(),
      status: valid ? "verified" : "unverified",
      details: { identities }
    };

    logInfo("DadtaBus oracle responded.");
    return result;
  }
}