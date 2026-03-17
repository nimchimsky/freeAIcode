import { z } from 'zod';

// ============================================================================
// RAW OFFER SCHEMA
// ============================================================================

export const rawOfferSchema = z.object({
  providerName: z.string(),
  providerSlug: z.string(),
  providerType: z.enum(['direct_provider', 'gateway', 'router']),
  providerModelId: z.string(),
  displayModelName: z.string(),
  canonicalHints: z.array(z.string()).optional(),
  
  // Pricing
  inputPricePerMillion: z.number().nullable().optional(),
  outputPricePerMillion: z.number().nullable().optional(),
  freeLimitText: z.string().nullable().optional(),
  rateLimitText: z.string().nullable().optional(),
  isFree: z.boolean().nullable().optional(),
  
  // Features
  openAiCompatible: z.boolean().nullable().optional(),
  byokSupported: z.boolean().nullable().optional(),
  endpointExposesToolCalling: z.boolean().nullable().optional(),
  streamingSupported: z.boolean().nullable().optional(),
  contextWindow: z.number().nullable().optional(),
  
  // Source traceability
  sourceUrl: z.string(),
  sourceType: z.enum(['api', 'docs', 'manual']),
  sourceConfidence: z.number().min(0).max(100),
  fetchedAt: z.string(),
  rawPayload: z.unknown().optional(),
});

export type RawOffer = z.infer<typeof rawOfferSchema>;

// ============================================================================
// RAW BENCHMARK SCHEMA
// ============================================================================

export const rawBenchmarkSchema = z.object({
  modelName: z.string(),
  canonicalHints: z.array(z.string()).optional(),
  sourceName: z.string(), // "swe_bench" | "livecode_bench" | "aider" | "speed"
  metricName: z.string(),
  rawValue: z.number(),
  sourceUrl: z.string(),
  sourceConfidence: z.number().min(0).max(100),
  measuredAt: z.string(),
  rawPayload: z.unknown().optional(),
});

export type RawBenchmark = z.infer<typeof rawBenchmarkSchema>;

// ============================================================================
// CONNECTOR INTERFACE
// ============================================================================

export interface ProviderConnector {
  name: string;
  fetchOffers(): Promise<RawOffer[]>;
}

export interface BenchmarkConnector {
  name: string;
  fetchBenchmarks(): Promise<RawBenchmark[]>;
}

// ============================================================================
// CONNECTOR RESULT
// ============================================================================

export type ConnectorResult<T> = {
  success: true;
  data: T[];
  cached: boolean;
} | {
  success: false;
  error: string;
  cached: boolean;
};
