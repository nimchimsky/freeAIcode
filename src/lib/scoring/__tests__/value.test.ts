import { calculateBestValueScore } from '../value';

describe('Best Value Score', () => {
  it('should calculate value score with 1.00 floor', () => {
    // Quality 80, Price 2.00 -> 80 / 2.00 = 40
    expect(calculateBestValueScore(80, 2.00)).toBe(40);
  });

  it('should use 1.00 floor for free models', () => {
    // Quality 80, Price 0 -> 80 / 1.00 = 80
    expect(calculateBestValueScore(80, 0)).toBe(80);
  });

  it('should use 1.00 floor for ultra-budget models below floor', () => {
    // Quality 60, Price 0.50 -> 60 / 1.00 = 60
    expect(calculateBestValueScore(60, 0.50)).toBe(60);
  });

  it('should not apply floor for models above 1.00', () => {
    // Quality 90, Price 3.00 -> 90 / 3.00 = 30
    expect(calculateBestValueScore(90, 3.00)).toBe(30);
  });

  it('should return null if quality score is null', () => {
    expect(calculateBestValueScore(null, 2.00)).toBeNull();
  });

  it('should handle null price as 1.00 floor', () => {
    // Quality 70, Price null -> 70 / 1.00 = 70
    expect(calculateBestValueScore(70, null)).toBe(70);
  });
});
