export async function syncBillers() {
  // TODO: integrate real biller APIs later
  // For now, return a static list of billers
  return [
    { id: "biller-001", name: "Stub Utility Co", type: "utility" },
    { id: "biller-002", name: "Stub Mobile Carrier", type: "telecom" },
    { id: "biller-003", name: "Stub Insurance Group", type: "insurance" }
  ];
}