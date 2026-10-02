import { FederationNode } from "./federationNode";
import { FederationPacket } from "./federationProtocol";
import { SyncRegistry } from "../sync/syncRegistry";
import { ConsensusEngine } from "../consensus/consensusEngine";
import { AnchorRegistry } from "../anchors/anchorRegistry";
import { SealRegistry } from "../seals/sealRegistry";
import { OracleManager } from "../oracles/oracleManager";
import { OracleWeightRegistry } from "../weights/oracleWeightRegistry";
import { ContinuityMarketRegistry } from "../markets/continuityMarketRegistry";
import { ContinuityExchangeRegistry } from "../exchange/continuityExchangeRegistry";
import { ContinuityDerivativesRegistry } from "../derivatives/derivativesRegistry";
import { IndexRegistry } from "../indices/indexRegistry";
import { ContinuityFundRegistry } from "../funds/fundRegistry";
import { ContinuityRatingRegistry } from "../ratings/ratingRegistry";
import { ContinuityInsuranceRegistry } from "../insurance/insuranceRegistry";
import { ContinuityReinsuranceRegistry } from "../reinsurance/reinsuranceRegistry";
import { ContinuityClearinghouseRegistry } from "../clearing/clearinghouseRegistry";
import { CollectorCheckOracle } from "../oracles/collectorCheckOracle";
import { DadtaBusOracle } from "../oracles/dadtaBusOracle";
import { InsuranceOracle } from "../oracles/insuranceOracle";
import { logInfo } from "../utils/log";

export class FederationMesh {
  private nodes: FederationNode[] = [];
  private registry: SyncRegistry;
  private consensus: ConsensusEngine;
  private anchors: AnchorRegistry;
  private seals: SealRegistry;
  private oracles: OracleManager;
  private weights: OracleWeightRegistry;
  private market: ContinuityMarketRegistry;
  private exchange: ContinuityExchangeRegistry;
  private derivatives: ContinuityDerivativesRegistry;
  private indices: IndexRegistry;
  private funds: ContinuityFundRegistry;
  private ratings: ContinuityRatingRegistry;
  private insurance: ContinuityInsuranceRegistry;
  private reinsurance: ContinuityReinsuranceRegistry;
  private clearinghouse: ContinuityClearinghouseRegistry;

  constructor(registry: SyncRegistry) {
    this.registry = registry;
    this.consensus = new ConsensusEngine(this.registry);
    this.anchors = new AnchorRegistry(this.registry);
    this.seals = new SealRegistry(this.registry);
    this.seals.addAuthority("collectorcheck");
    this.seals.addAuthority("dadtabus");
    this.oracles = new OracleManager(this.registry);
    this.weights = new OracleWeightRegistry(this.oracles);
    this.market = new ContinuityMarketRegistry(this.registry, this.weights);
    this.exchange = new ContinuityExchangeRegistry(this.registry, this.market);
    this.derivatives = new ContinuityDerivativesRegistry(this.registry, this.market);
    this.indices = new IndexRegistry(this.registry, this.market);
    this.funds = new ContinuityFundRegistry(this.registry, this.market, this.indices);
    this.ratings = new ContinuityRatingRegistry(this.registry, this.market, this.indices);
    this.insurance = new ContinuityInsuranceRegistry(this.registry, this.market, this.ratings);
    this.reinsurance = new ContinuityReinsuranceRegistry(this.registry, this.insurance, this.indices);
    this.clearinghouse = new ContinuityClearinghouseRegistry(this.registry, this.market, this.ratings, this.exchange);

    // Register oracles
    this.oracles.addOracle(new CollectorCheckOracle());
    this.oracles.addOracle(new DadtaBusOracle());
    this.oracles.addOracle(new InsuranceOracle());
  }

  // --------------------------------------------
  // Add node to federation mesh
  // --------------------------------------------
  addNode(node: FederationNode) {
    this.nodes.push(node);
    logInfo(`Federation node added: ${node.id} (${node.region})`);
  }

  // --------------------------------------------
  // Broadcast continuity state to all nodes
  // --------------------------------------------
  async broadcast(senderId: string, senderRegion: string) {
    const bundle = this.registry.buildBundle();

    const packet: FederationPacket = {
      sender: senderId,
      region: senderRegion,
      timestamp: Date.now(),
      payload: bundle
    };

    for (const node of this.nodes) {
      await node.send(packet);
    }

    logInfo("Federation broadcast complete.");
  }

  // --------------------------------------------
  // Receive packet from another node
  // --------------------------------------------
  async receive(packet: FederationPacket) {
    this.consensus.resolve(packet.payload);
    this.anchors.anchorState();

    // Multi-authority sealing
    this.seals.seal("collectorcheck");
    this.seals.seal("dadtabus");

    // Run external truth oracles
    await this.weights.updateWeights();

    // Recalculate market prices
    this.market.recalc();

    // Exchange simulation
    this.exchange.seed();
    this.exchange.matchAll();

    // Derivatives recalculation
    this.derivatives.recalc();

    // Index recalculation
    this.indices.recalc();

    // Fund recalculation
    this.funds.recalc();

    // Rating recalculation
    this.ratings.recalc();

    // Insurance recalculation
    this.insurance.recalc();

    // Reinsurance recalculation
    this.reinsurance.recalc();

    // Clearinghouse recalculation
    this.clearinghouse.recalc();

    logInfo(`Federation packet resolved from ${packet.sender}`);
  }
}