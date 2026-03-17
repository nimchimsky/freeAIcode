import { normalizeModelName, generateCanonicalSlug } from '../normalize';

describe('Model normalization', () => {
  describe('normalizeModelName', () => {
    it('should lowercase and trim', () => {
      expect(normalizeModelName('  GPT-4  ')).toBe('gpt-4');
    });

    it('should replace spaces with hyphens', () => {
      expect(normalizeModelName('Claude 3 Opus')).toBe('claude-3-opus');
    });

    it('should remove special characters', () => {
      expect(normalizeModelName('model@v1.0!')).toBe('modelv1.0');
    });

    it('should collapse multiple hyphens', () => {
      expect(normalizeModelName('model---name')).toBe('model-name');
    });

    it('should preserve dots and underscores', () => {
      expect(normalizeModelName('gemini-1.5_pro')).toBe('gemini-1.5_pro');
    });
  });

  describe('generateCanonicalSlug', () => {
    it('should combine organization and model name', () => {
      expect(generateCanonicalSlug('OpenAI', 'GPT-4')).toBe('openai/gpt-4');
    });

    it('should normalize both parts', () => {
      expect(generateCanonicalSlug('Anthropic', 'Claude 3.5 Sonnet')).toBe(
        'anthropic/claude-3.5-sonnet'
      );
    });
  });
});
