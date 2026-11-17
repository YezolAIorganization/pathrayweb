export type Tier = 'A' | 'B' | 'C' | 'D';
export type ScholarshipNeed = 'yes' | 'partly' | 'no';
export type BudgetBand = 0 | 1 | 2 | 3;

// Rule from the design document: rows are the scholarship need, columns are bands 0 to 3.
// The band amounts themselves live in src/config/markets.ts, one set per market.
const TIERS: Record<ScholarshipNeed, [Tier, Tier, Tier, Tier]> = {
  yes: ['A', 'A', 'B', 'B'],
  partly: ['B', 'C', 'C', 'C'],
  no: ['C', 'C', 'C', 'D'],
};

// For display on the result screen only. The server will compute the real tier later.
export function getFundingTier(need: ScholarshipNeed, band: BudgetBand): Tier {
  return TIERS[need][band];
}