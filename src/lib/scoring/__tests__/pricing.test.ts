import { calculateEffectivePrice, assignAccessTier } from '../pricing';

describe('Pricing calculations', () => {
  describe('calculateEffectivePrice', () => {
    it('should calculate effective price with 0.2/0.8 weighting', () => {
      const result = calculateEffectivePrice(1.0, 5.0);
      expect(result).toBe(4.2); // (1.0 * 0.2) + (5.0 * 0.8) = 0.2 + 4.0 = 4.2
    });

    it('should return null if input price is null', () => {
      const result = calculateEffectivePrice(null, 5.0);
      expect(result).toBeNull();
    });

    it('should return null if output price is null', () => {
      const result = calculateEffectivePrice(1.0, null);
      expect(result).toBeNull();
    });

    it('should handle zero prices', () => {
      const result = calculateEffectivePrice(0, 0);
      expect(result).toBe(0);
    });
  });

  describe('assignAccessTier', () => {
    it('should assign free tier for free models', () => {
      expect(assignAccessTier(0, true)).toBe('free');
      expect(assignAccessTier(null, true)).toBe('free');
    });

    it('should assign ultra_budget tier for prices < 0.20', () => {
      expect(assignAccessTier(0.10, false)).toBe('ultra_budget');
      expect(assignAccessTier(0.19, false)).toBe('ultra_budget');
    });

    it('should assign budget tier for prices >= 0.20 and < 1.00', () => {
      expect(assignAccessTier(0.20, false)).toBe('budget');
      expect(assignAccessTier(0.50, false)).toBe('budget');
      expect(assignAccessTier(0.99, false)).toBe('budget');
    });

    it('should assign mid_range tier for prices >= 1.00 and < 5.00', () => {
      expect(assignAccessTier(1.00, false)).toBe('mid_range');
      expect(assignAccessTier(3.00, false)).toBe('mid_range');
      expect(assignAccessTier(4.99, false)).toBe('mid_range');
    });

    it('should assign premium tier for prices >= 5.00', () => {
      expect(assignAccessTier(5.00, false)).toBe('premium');
      expect(assignAccessTier(10.00, false)).toBe('premium');
    });
  });
});
