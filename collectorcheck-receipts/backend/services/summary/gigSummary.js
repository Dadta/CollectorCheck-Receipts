export async function getGigSummary() {
  // TODO: integrate real gig data later
  // For now, return a static summary structure
  return {
    totalReceipts: 3,
    totalSpent: 125.50,
    categories: [
      { name: "Fuel", amount: 45.00 },
      { name: "Food", amount: 30.50 },
      { name: "Supplies", amount: 50.00 }
    ],
    lastUpdated: new Date().toISOString(),
    source: "stub"
  };
}