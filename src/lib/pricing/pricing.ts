/**
 * Configuration-as-Code Pricing Layer
 * 
 * This file serves as the manual official-source fallback for providers
 * that do not expose pricing via structured API endpoints.
 * 
 * All pricing records derived from this file must preserve source traceability
 * and mark sourceType = "manual".
 */

export interface ManualPricingEntry {
  providerSlug: string;
  providerModelId: string;
  inputPricePerMillion: number | null;
  outputPricePerMillion: number | null;
  isFree: boolean;
  freeLimitText?: string;
  rateLimitText?: string;
  sourceUrl: string; // Link to official pricing page
  lastVerified: string; // ISO date
  notes?: string;
}

/**
 * Manual pricing definitions
 * Keep this updated with official provider pricing pages
 */
export const MANUAL_PRICING: ManualPricingEntry[] = [
  // Google Gemini
  {
    providerSlug: 'google',
    providerModelId: 'gemini-2.0-flash-exp',
    inputPricePerMillion: null,
    outputPricePerMillion: null,
    isFree: true,
    freeLimitText: '10 RPM, 1500 RPD',
    rateLimitText: '10 RPM',
    sourceUrl: 'https://ai.google.dev/pricing',
    lastVerified: '2024-01-15',
    notes: 'Free tier with rate limits',
  },
  {
    providerSlug: 'google',
    providerModelId: 'gemini-1.5-pro',
    inputPricePerMillion: 1.25,
    outputPricePerMillion: 5.00,
    isFree: false,
    sourceUrl: 'https://ai.google.dev/pricing',
    lastVerified: '2024-01-15',
  },
  {
    providerSlug: 'google',
    providerModelId: 'gemini-1.5-flash',
    inputPricePerMillion: 0.075,
    outputPricePerMillion: 0.30,
    isFree: false,
    sourceUrl: 'https://ai.google.dev/pricing',
    lastVerified: '2024-01-15',
  },
  
  // Anthropic Claude
  {
    providerSlug: 'anthropic',
    providerModelId: 'claude-3-5-sonnet-20241022',
    inputPricePerMillion: 3.00,
    outputPricePerMillion: 15.00,
    isFree: false,
    sourceUrl: 'https://www.anthropic.com/pricing',
    lastVerified: '2024-01-15',
  },
  {
    providerSlug: 'anthropic',
    providerModelId: 'claude-3-5-haiku-20241022',
    inputPricePerMillion: 0.80,
    outputPricePerMillion: 4.00,
    isFree: false,
    sourceUrl: 'https://www.anthropic.com/pricing',
    lastVerified: '2024-01-15',
  },
  
  // OpenAI
  {
    providerSlug: 'openai',
    providerModelId: 'gpt-4o',
    inputPricePerMillion: 2.50,
    outputPricePerMillion: 10.00,
    isFree: false,
    sourceUrl: 'https://openai.com/api/pricing/',
    lastVerified: '2024-01-15',
  },
  {
    providerSlug: 'openai',
    providerModelId: 'gpt-4o-mini',
    inputPricePerMillion: 0.150,
    outputPricePerMillion: 0.600,
    isFree: false,
    sourceUrl: 'https://openai.com/api/pricing/',
    lastVerified: '2024-01-15',
  },
  {
    providerSlug: 'openai',
    providerModelId: 'o1',
    inputPricePerMillion: 15.00,
    outputPricePerMillion: 60.00,
    isFree: false,
    sourceUrl: 'https://openai.com/api/pricing/',
    lastVerified: '2024-01-15',
  },
  {
    providerSlug: 'openai',
    providerModelId: 'o1-mini',
    inputPricePerMillion: 3.00,
    outputPricePerMillion: 12.00,
    isFree: false,
    sourceUrl: 'https://openai.com/api/pricing/',
    lastVerified: '2024-01-15',
  },
];

/**
 * Get manual pricing for a specific provider and model
 */
export function getManualPricing(
  providerSlug: string,
  providerModelId: string
): ManualPricingEntry | undefined {
  return MANUAL_PRICING.find(
    (entry) =>
      entry.providerSlug === providerSlug &&
      entry.providerModelId === providerModelId
  );
}

/**
 * Get all manual pricing entries for a provider
 */
export function getProviderManualPricing(
  providerSlug: string
): ManualPricingEntry[] {
  return MANUAL_PRICING.filter((entry) => entry.providerSlug === providerSlug);
}
