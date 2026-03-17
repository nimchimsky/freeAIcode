/**
 * Benchmark scoring and composite calculations
 */

export interface BenchmarkComponent {
  sourceName: string;
  normalizedValue: number; // 0-100
  weight: number; // original weight
}

export type BenchmarkDisplayStatus = 'sufficient_data' | 'partial_data' | 'insufficient_data';

/**
 * Base weights for coding utility score
 */
const BASE_WEIGHTS = {
  swe_bench: 0.40,
  livecode_bench: 0.30,
  aider: 0.20,
  speed: 0.10,
};

/**
 * Calculate coding utility score with proportional rescaling
 */
export function calculateCodingUtilityScore(
  components: BenchmarkComponent[]
): number | null {
  if (components.length === 0) return null;
  
  // Calculate total weight of available components
  const totalAvailableWeight = components.reduce((sum, c) => sum + c.weight, 0);
  
  if (totalAvailableWeight === 0) return null;
  
  // Rescale weights proportionally
  let score = 0;
  for (const component of components) {
    const rescaledWeight = component.weight / totalAvailableWeight;
    score += component.normalizedValue * rescaledWeight;
  }
  
  return Math.round(score * 100) / 100;
}
