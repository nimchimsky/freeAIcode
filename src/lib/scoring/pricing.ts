/**
 * Pricing calculations and tier assignment
 */

export type AccessType = 'free' | 'ultra_budget' | 'budget' | 'mid_range' | 'premium';

/**
 * Calculate effective price per million tokens
 * Formula: (input * 0.2) + (output * 0.8)
 * Rationale: For coding assistants, output cost matters more
 */
export function calculateEffectivePrice(
  inputPricePerMillion: number | null,
  outputPricePerMillion: number | null
): number | null {
  if (inputPricePerMillion === null || outputPricePerMillion === null) {
    return null;
  }
  return inputPricePerMillion * 0.2 + outputPricePerMillion * 0.8;
}

/**
 * Assign access tier based on effective price
 */
export function assignAccessTier(effectivePrice: number | null, isFree: boolean): AccessType {
  if (isFree || effectivePrice === null || effectivePrice === 0) {
    return 'free';
  }
  
  if (effectivePrice < 0.20) return 'ultra_budget';
  if (effectivePrice < 1.00) return 'budget';
  if (effectivePrice < 5.00) return 'mid_range';
  return 'premium';
}
