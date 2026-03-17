/**
 * Best Value Score calculation
 */

/**
 * Calculate best value score
 * Formula: codingUtilityScore / max(effectivePricePerMillion, 1.00)
 * 
 * The 1.00 floor prevents free models from dominating through tiny divisor
 */
export function calculateBestValueScore(
  codingUtilityScore: number | null,
  effectivePricePerMillion: number | null
): number | null {
  if (codingUtilityScore === null) return null;
  
  // Use 1.00 floor for the divisor
  const divisor = Math.max(effectivePricePerMillion ?? 1.00, 1.00);
  
  return Math.round((codingUtilityScore / divisor) * 100) / 100;
}
