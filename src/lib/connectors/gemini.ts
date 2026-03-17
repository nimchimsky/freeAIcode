import { ProviderConnector, RawOffer } from './types';
import { getProviderManualPricing } from '@/lib/pricing/pricing';

/**
 * Gemini connector using manual pricing configuration
 * Google's Gemini API doesn't expose a public models list endpoint,
 * so we use a known model list + manual pricing
 */
export class GeminiConnector implements ProviderConnector {
  name = 'gemini';

  async fetchOffers(): Promise<RawOffer[]> {
    const fetchedAt = new Date().toISOString();
    const manualPricing = getProviderManualPricing('google');

    return manualPricing.map((pricing) => ({
      providerName: 'Google',
      providerSlug: 'google',
      providerType: 'direct_provider' as const,
      providerModelId: pricing.providerModelId,
      displayModelName: pricing.providerModelId,
      canonicalHints: [pricing.providerModelId],
      inputPricePerMillion: pricing.inputPricePerMillion,
      outputPricePerMillion: pricing.outputPricePerMillion,
      isFree: pricing.isFree,
      freeLimitText: pricing.freeLimitText || null,
      rateLimitText: pricing.rateLimitText || null,
      openAiCompatible: false,
      endpointExposesToolCalling: true,
      streamingSupported: true,
      contextWindow: null,
      sourceUrl: pricing.sourceUrl,
      sourceType: 'manual' as const,
      sourceConfidence: 90,
      fetchedAt,
    }));
  }
}
