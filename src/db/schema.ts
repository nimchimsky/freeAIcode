import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  real,
  jsonb,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================================================
// CANONICAL MODEL
// ============================================================================

export const canonicalModel = pgTable(
  'canonical_model',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    canonicalSlug: text('canonical_slug').notNull().unique(),
    displayName: text('display_name').notNull(),
    organization: text('organization'),
    family: text('family'),
    releaseStatus: text('release_status'), // e.g., "stable", "preview", "deprecated"
    description: text('description'),
    contextWindow: integer('context_window'),
    
    // Capabilities
    architectureSupportsTools: boolean('architecture_supports_tools').default(false),
    supportsVision: boolean('supports_vision').default(false),
    supportsReasoning: boolean('supports_reasoning').default(false),
    supportsStructuredOutputs: boolean('supports_structured_outputs').default(false),
    supportsFim: boolean('supports_fim').default(false),
    openWeights: boolean('open_weights').default(false),
    
    // Scores
    codingUtilityScore: real('coding_utility_score'), // 0-100
    bestValueScore: real('best_value_score'), // quality per dollar
    benchmarkConfidence: real('benchmark_confidence'), // 0-100
    benchmarkDisplayStatus: text('benchmark_display_status'), // "sufficient_data" | "partial_data" | "insufficient_data"
    
    lastBenchmarkRefreshAt: timestamp('last_benchmark_refresh_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    slugIdx: uniqueIndex('canonical_model_slug_idx').on(table.canonicalSlug),
    orgIdx: index('canonical_model_org_idx').on(table.organization),
    scoreIdx: index('canonical_model_score_idx').on(table.codingUtilityScore),
    valueIdx: index('canonical_model_value_idx').on(table.bestValueScore),
  })
);

// ============================================================================
// PROVIDER
// ============================================================================

export const provider = pgTable(
  'provider',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    type: text('type').notNull(), // "direct_provider" | "gateway" | "router"
    websiteUrl: text('website_url'),
    docsUrl: text('docs_url'),
    apiBaseUrl: text('api_base_url'),
    openAiCompatible: boolean('open_ai_compatible').default(false),
    notes: text('notes'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    slugIdx: uniqueIndex('provider_slug_idx').on(table.slug),
    typeIdx: index('provider_type_idx').on(table.type),
  })
);

// ============================================================================
// PROVIDER OFFER
// ============================================================================

export const providerOffer = pgTable(
  'provider_offer',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    canonicalModelId: integer('canonical_model_id')
      .notNull()
      .references(() => canonicalModel.id, { onDelete: 'cascade' }),
    providerId: integer('provider_id')
      .notNull()
      .references(() => provider.id, { onDelete: 'cascade' }),
    providerModelId: text('provider_model_id').notNull(),
    
    // Pricing
    accessType: text('access_type').notNull(), // "free" | "ultra_budget" | "budget" | "mid_range" | "premium"
    isFree: boolean('is_free').notNull().default(false),
    inputPricePerMillion: real('input_price_per_million'),
    outputPricePerMillion: real('output_price_per_million'),
    effectivePricePerMillion: real('effective_price_per_million'),
    
    // Limits
    freeLimitText: text('free_limit_text'),
    rateLimitText: text('rate_limit_text'),
    
    // Features
    byokSupported: boolean('byok_supported').default(false),
    openAiCompatible: boolean('open_ai_compatible').default(false),
    endpointExposesToolCalling: boolean('endpoint_exposes_tool_calling').default(false),
    streamingSupported: boolean('streaming_supported').default(true),
    contextWindowOverride: integer('context_window_override'),
    
    // Provider-specific scores
    providerSpeedScore: real('provider_speed_score'), // 0-100
    providerLatencyScore: real('provider_latency_score'), // 0-100
    providerReliabilityScore: real('provider_reliability_score'), // 0-100
    regionNotes: text('region_notes'),
    
    // Status
    deprecated: boolean('deprecated').default(false),
    deprecationReason: text('deprecation_reason'),
    
    // Source traceability
    lastCheckedAt: timestamp('last_checked_at').notNull().defaultNow(),
    sourceUrl: text('source_url').notNull(),
    sourceType: text('source_type').notNull(), // "api" | "docs" | "manual"
    sourceConfidence: real('source_confidence').notNull(), // 0-100
    
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    modelProviderIdx: index('provider_offer_model_provider_idx').on(
      table.canonicalModelId,
      table.providerId
    ),
    providerIdx: index('provider_offer_provider_idx').on(table.providerId),
    freeIdx: index('provider_offer_free_idx').on(table.isFree),
    priceIdx: index('provider_offer_price_idx').on(table.effectivePricePerMillion),
    deprecatedIdx: index('provider_offer_deprecated_idx').on(table.deprecated),
  })
);

// ============================================================================
// MODEL ALIAS
// ============================================================================

export const modelAlias = pgTable(
  'model_alias',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    canonicalModelId: integer('canonical_model_id')
      .notNull()
      .references(() => canonicalModel.id, { onDelete: 'cascade' }),
    alias: text('alias').notNull(),
    aliasNormalized: text('alias_normalized').notNull(),
    source: text('source').notNull(), // connector name or "admin"
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    aliasIdx: index('model_alias_alias_idx').on(table.aliasNormalized),
    canonicalIdx: index('model_alias_canonical_idx').on(table.canonicalModelId),
  })
);

// ============================================================================
// BENCHMARK SCORE
// ============================================================================

export const benchmarkScore = pgTable(
  'benchmark_score',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    canonicalModelId: integer('canonical_model_id')
      .notNull()
      .references(() => canonicalModel.id, { onDelete: 'cascade' }),
    sourceName: text('source_name').notNull(), // "swe_bench" | "livecode_bench" | "aider" | "speed"
    metricName: text('metric_name').notNull(),
    rawValue: real('raw_value').notNull(),
    normalizedValue: real('normalized_value').notNull(), // 0-100
    sourceUrl: text('source_url').notNull(),
    sourceConfidence: real('source_confidence').notNull(), // 0-100
    measuredAt: timestamp('measured_at').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    modelSourceIdx: index('benchmark_score_model_source_idx').on(
      table.canonicalModelId,
      table.sourceName
    ),
  })
);

// ============================================================================
// REFRESH LOG
// ============================================================================

export const refreshLog = pgTable(
  'refresh_log',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    connectorName: text('connector_name').notNull(),
    startedAt: timestamp('started_at').notNull(),
    finishedAt: timestamp('finished_at'),
    status: text('status').notNull(), // "running" | "success" | "failed" | "partial"
    summary: text('summary'),
    errorMessage: text('error_message'),
    recordsCreated: integer('records_created').default(0),
    recordsUpdated: integer('records_updated').default(0),
    recordsFlagged: integer('records_flagged').default(0),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    connectorIdx: index('refresh_log_connector_idx').on(table.connectorName),
    statusIdx: index('refresh_log_status_idx').on(table.status),
    startedIdx: index('refresh_log_started_idx').on(table.startedAt),
  })
);

// ============================================================================
// CHANGE LOG
// ============================================================================

export const changeLog = pgTable(
  'change_log',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    entityType: text('entity_type').notNull(), // "canonical_model" | "provider_offer" | etc
    entityId: integer('entity_id').notNull(),
    fieldName: text('field_name').notNull(),
    oldValue: text('old_value'),
    newValue: text('new_value'),
    source: text('source').notNull(), // connector name or "admin"
    reason: text('reason'),
    changedAt: timestamp('changed_at').notNull().defaultNow(),
  },
  (table) => ({
    entityIdx: index('change_log_entity_idx').on(table.entityType, table.entityId),
    changedIdx: index('change_log_changed_idx').on(table.changedAt),
  })
);

// ============================================================================
// PRICE HISTORY
// ============================================================================

export const priceHistory = pgTable(
  'price_history',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    providerOfferId: integer('provider_offer_id')
      .notNull()
      .references(() => providerOffer.id, { onDelete: 'cascade' }),
    inputPricePerMillion: real('input_price_per_million'),
    outputPricePerMillion: real('output_price_per_million'),
    effectivePricePerMillion: real('effective_price_per_million'),
    capturedAt: timestamp('captured_at').notNull().defaultNow(),
  },
  (table) => ({
    offerIdx: index('price_history_offer_idx').on(table.providerOfferId),
    capturedIdx: index('price_history_captured_idx').on(table.capturedAt),
  })
);

// ============================================================================
// SOURCE REVIEW QUEUE
// ============================================================================

export const sourceReviewQueue = pgTable(
  'source_review_queue',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    sourceName: text('source_name').notNull(),
    entityType: text('entity_type').notNull(),
    rawPayload: jsonb('raw_payload').notNull(),
    issueType: text('issue_type').notNull(), // "ambiguous_alias" | "conflict" | "validation_error"
    resolutionStatus: text('resolution_status').notNull().default('pending'), // "pending" | "resolved" | "ignored"
    adminNotes: text('admin_notes'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    statusIdx: index('source_review_queue_status_idx').on(table.resolutionStatus),
    createdIdx: index('source_review_queue_created_idx').on(table.createdAt),
  })
);

// ============================================================================
// MANUAL OVERRIDE
// ============================================================================

export const manualOverride = pgTable(
  'manual_override',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    entityType: text('entity_type').notNull(),
    entityId: integer('entity_id').notNull(),
    fieldName: text('field_name').notNull(),
    overrideValue: text('override_value').notNull(),
    reason: text('reason').notNull(),
    expiresAt: timestamp('expires_at'),
    createdBy: text('created_by').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    entityIdx: index('manual_override_entity_idx').on(table.entityType, table.entityId),
    expiresIdx: index('manual_override_expires_idx').on(table.expiresAt),
  })
);

// ============================================================================
// CONNECTOR CACHE
// ============================================================================

export const connectorCache = pgTable(
  'connector_cache',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    connectorName: text('connector_name').notNull(),
    cacheKey: text('cache_key').notNull(),
    payload: jsonb('payload').notNull(),
    fetchedAt: timestamp('fetched_at').notNull().defaultNow(),
    expiresAt: timestamp('expires_at').notNull(),
  },
  (table) => ({
    connectorKeyIdx: uniqueIndex('connector_cache_connector_key_idx').on(
      table.connectorName,
      table.cacheKey
    ),
    expiresIdx: index('connector_cache_expires_idx').on(table.expiresAt),
  })
);

// ============================================================================
// RELATIONS
// ============================================================================

export const canonicalModelRelations = relations(canonicalModel, ({ many }) => ({
  providerOffers: many(providerOffer),
  aliases: many(modelAlias),
  benchmarkScores: many(benchmarkScore),
}));

export const providerRelations = relations(provider, ({ many }) => ({
  offers: many(providerOffer),
}));

export const providerOfferRelations = relations(providerOffer, ({ one, many }) => ({
  canonicalModel: one(canonicalModel, {
    fields: [providerOffer.canonicalModelId],
    references: [canonicalModel.id],
  }),
  provider: one(provider, {
    fields: [providerOffer.providerId],
    references: [provider.id],
  }),
  priceHistory: many(priceHistory),
}));

export const modelAliasRelations = relations(modelAlias, ({ one }) => ({
  canonicalModel: one(canonicalModel, {
    fields: [modelAlias.canonicalModelId],
    references: [canonicalModel.id],
  }),
}));

export const benchmarkScoreRelations = relations(benchmarkScore, ({ one }) => ({
  canonicalModel: one(canonicalModel, {
    fields: [benchmarkScore.canonicalModelId],
    references: [canonicalModel.id],
  }),
}));

export const priceHistoryRelations = relations(priceHistory, ({ one }) => ({
  providerOffer: one(providerOffer, {
    fields: [priceHistory.providerOfferId],
    references: [providerOffer.id],
  }),
}));
