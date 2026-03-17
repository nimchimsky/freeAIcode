import { ProviderConnector, RawOffer } from './types';
import { withRetry, getCachedData, setCachedData, fetchWithTimeout } from './base';

interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
  context_length?: number;
  pricing?: {
    prompt?: string;
    completion?: string;
  };
  top_provider?: {
    is_moderated?: boolean;
    max_completion_tokens?: number;
  };
  architecture?: {
    modality?: string;
    tokenizer?: string;
    instruct_type?: string;
  };
}

interface OpenRouterResponse {
  data: OpenRouterModel[];
}

export class OpenRouterConnector implements ProviderConnector {
  name = 'openrouter';
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENROUTER_API_KEY || '';
  }

  async fetchOffers(): Promise<RawOffer[]> {
    return withRetry(async () => {
      // Check cache first
      const cached = await getCachedData<RawOffer[]>(this.name, 'models');
      if (cached) {
        return cached;
      }

      const response = await fetchWithTimeout(
        'https://openrouter.ai/api/v1/models',
        {
          headers: this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {},
        }
      );

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const json: OpenRouterResponse = await response.json();
      const offers = this.transformModels(json.data);

      // Cache for 6 hours
      await setCachedData(this.name, 'models', offers, 6);

      return offers;
    }, this.name);
  }

  private transformModels(models: OpenRouterModel[]): RawOffer[] {
    const fetchedAt = new Date().toISOString();

    return models.map((model) => {
      const inputPrice = model.pricing?.prompt
        ? parseFloat(model.pricing.prompt) * 1_000_000
        : null;
      const outputPrice = model.pricing?.completion
        ? parseFloat(model.pricing.completion) * 1_000_000
        : null;

      const isFree = inputPrice === 0 && outputPrice === 0;

      return {
        providerName: 'OpenRouter',
        providerSlug: 'openrouter',
        providerType: 'router' as const,
        providerModelId: model.id,
        displayModelName: model.name || model.id,
        canonicalHints: [model.id, model.name].filter(Boolean),
        inputPricePerMillion: inputPrice,
        outputPricePerMillion: outputPrice,
        isFree,
        freeLimitText: isFree ? 'Rate limits apply' : null,
        openAiCompatible: true,
        endpointExposesToolCalling: true,
        streamingSupported: true,
        contextWindow: model.context_length || null,
        sourceUrl: 'https://openrouter.ai/api/v1/models',
        sourceType: 'api' as const,
        sourceConfidence: 95,
        fetchedAt,
        rawPayload: model,
      };
    });
  }
}
