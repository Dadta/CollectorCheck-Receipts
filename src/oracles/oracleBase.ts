export interface OracleResult {
  oracleId: string;
  timestamp: number;
  status: "verified" | "unverified" | "error";
  details: any;
}

export abstract class OracleBase {
  oracleId: string;

  constructor(oracleId: string) {
    this.oracleId = oracleId;
  }

  abstract query(bundle: any): Promise<OracleResult>;
}