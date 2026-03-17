import { db } from '@/db';
import { 
  provider, 
  providerOffer, 
  canonicalModel, 
  modelAlias,
  refreshLog,
  changeLog,
  priceHistory,
} from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { RawOffer } from '@/lib/connectors/types';
import { 
  normalizeModelName, 
  extractCanonicalHints, 
  parseModelIdentity,
  generateCanonicalSlug,
} from '@/lib/normalization/normalize';
import { calculateEffectivePrice, assignAccessTier } from '@/lib/scoring/pricing';

export interface IngestionResult {
  providersCreated: number;
  providersUpdated: number;
  offersCreated: number;
  offersUpdated: number;
  modelsCreated: number;
  aliasesCreated: number;
  errors: string[];
}

export async function ingestOffers(
  offers: RawOffer[],
  connectorName: string
): Promise<IngestionResult> {
  const result: IngestionResult = {
    providersCreated: 0,
    providersUpdated: 0,
    offersCreated: 0,
    offersUpdated: 0,
    modelsCreated: 0,
    aliasesCreated: 0,
    errors: [],
  };

  const logId = await createRefreshLog(connectorName);

  try {
    for (const offer of offers) {
      try {
        await ingestSingleOffer(offer, result);
      } catch (error) {
        const errorMsg = `Failed to ingest ${offer.providerModelId}: ${error}`;
        result.errors.push(errorMsg);
        console.error(errorMsg);
      }
    }

    await updateRefreshLog(logId, 'success', result);
  } catch (error) {
    await updateRefreshLog(logId, 'failed', result, String(error));
    throw error;
  }

  return result;
}

async function ingestSingleOffer(
  offer: RawOffer,
  result: IngestionResult
): Promise<void> {
  // 1. Ensure provider exists
  const providerId = await ensureProvider(offer, result);

  // 2. Resolve or create canonical model
  const canonicalModelId = await resolveCanonicalModel(offer, result);

  // 3. Calculate pricing
  const effectivePrice = calculateEffectivePrice(
    offer.inputPricePerMillion ?? null,
    offer.outputPricePerMillion ?? null
  );
  const accessType = assignAccessTier(effectivePrice, offer.isFree ?? false);

  // 4. Upsert provider offer
  const existing = await db
    .select()
    .from(providerOffer)
    .where(
      and(
        eq(providerOffer.canonicalModelId, canonicalModelId),
        eq(providerOffer.providerId, providerId),
        eq(providerOffer.providerModelId, offer.providerModelId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    // Update existing offer
    const old = existing[0];
    
    // Track price changes
    if (
      old.inputPricePerMillion !== offer.inputPricePerMillion ||
      old.outputPricePerMillion !== offer.outputPricePerMillion
    ) {
      await db.insert(priceHistory).values({
        providerOfferId: old.id,
        inputPricePerMillion: old.inputPricePerMillion,
        outputPricePerMillion: old.outputPricePerMillion,
        effectivePricePerMillion: old.effectivePricePerMillion,
        capturedAt: new Date(),
      });

      await db.insert(changeLog).values({
        entityType: 'provider_offer',
        entityId: old.id,
        fieldName: 'pricing',
        oldValue: JSON.stringify({
          input: old.inputPricePerMillion,
          output: old.outputPricePerMillion,
        }),
        newValue: JSON.stringify({
          input: offer.inputPricePerMillion,
          output: offer.outputPricePerMillion,
        }),
        source: offer.sourceType,
        changedAt: new Date(),
      });
    }

    await db
      .update(providerOffer)
      .set({
        inputPricePerMillion: offer.inputPricePerMillion ?? null,
        outputPricePerMillion: offer.outputPricePerMillion ?? null,
        effectivePricePerMillion: effectivePrice,
        accessType,
        isFree: offer.isFree ?? false,
        freeLimitText: offer.freeLimitText ?? null,
        rateLimitText: offer.rateLimitText ?? null,
        openAiCompatible: offer.openAiCompatible ?? false,
        byokSupported: offer.byokSupported ?? false,
        endpointExposesToolCalling: offer.endpointExposesToolCalling ?? false,
        streamingSupported: offer.streamingSupported ?? true,
        contextWindowOverride: offer.contextWindow ?? null,
        lastCheckedAt: new Date(offer.fetchedAt),
        sourceUrl: offer.sourceUrl,
        sourceType: offer.sourceType,
        sourceConfidence: offer.sourceConfidence,
        updatedAt: new Date(),
      })
      .where(eq(providerOffer.id, old.id));

    result.offersUpdated++;
  } else {
    // Create new offer
    await db.insert(providerOffer).values({
      canonicalModelId,
      providerId,
      providerModelId: offer.providerModelId,
      accessType,
      isFree: offer.isFree ?? false,
      inputPricePerMillion: offer.inputPricePerMillion ?? null,
      outputPricePerMillion: offer.outputPricePerMillion ?? null,
      effectivePricePerMillion: effectivePrice,
      freeLimitText: offer.freeLimitText ?? null,
      rateLimitText: offer.rateLimitText ?? null,
      byokSupported: offer.byokSupported ?? false,
      openAiCompatible: offer.openAiCompatible ?? false,
      endpointExposesToolCalling: offer.endpointExposesToolCalling ?? false,
      streamingSupported: offer.streamingSupported ?? true,
      contextWindowOverride: offer.contextWindow ?? null,
      lastCheckedAt: new Date(offer.fetchedAt),
      sourceUrl: offer.sourceUrl,
      sourceType: offer.sourceType,
      sourceConfidence: offer.sourceConfidence,
    });

    result.offersCreated++;
  }
}

async function ensureProvider(
  offer: RawOffer,
  result: IngestionResult
): Promise<number> {
  const existing = await db
    .select()
    .from(provider)
    .where(eq(provider.slug, offer.providerSlug))
    .limit(1);

  if (existing.length > 0) {
    return existing[0].id;
  }

  const [newProvider] = await db
    .insert(provider)
    .values({
      slug: offer.providerSlug,
      name: offer.providerName,
      type: offer.providerType,
      openAiCompatible: offer.openAiCompatible ?? false,
    })
    .returning();

  result.providersCreated++;
  return newProvider.id;
}

async function resolveCanonicalModel(
  offer: RawOffer,
  result: IngestionResult
): Promise<number> {
  // Try to find existing model by alias
  const hints = offer.canonicalHints || extractCanonicalHints(
    offer.displayModelName,
    offer.providerSlug
  );

  for (const hint of hints) {
    const normalized = normalizeModelName(hint);
    const existing = await db
      .select({ canonicalModelId: modelAlias.canonicalModelId })
      .from(modelAlias)
      .where(eq(modelAlias.aliasNormalized, normalized))
      .limit(1);

    if (existing.length > 0) {
      return existing[0].canonicalModelId;
    }
  }

  // Create new canonical model
  const identity = parseModelIdentity(offer.displayModelName);
  const slug = generateCanonicalSlug(
    identity.organization || 'unknown',
    offer.displayModelName
  );

  const [newModel] = await db
    .insert(canonicalModel)
    .values({
      canonicalSlug: slug,
      displayName: offer.displayModelName,
      organization: identity.organization,
      family: identity.family,
      contextWindow: offer.contextWindow,
      benchmarkDisplayStatus: 'insufficient_data',
    })
    .returning();

  result.modelsCreated++;

  // Create aliases
  for (const hint of hints) {
    await db.insert(modelAlias).values({
      canonicalModelId: newModel.id,
      alias: hint,
      aliasNormalized: normalizeModelName(hint),
      source: offer.sourceType,
    });
    result.aliasesCreated++;
  }

  return newModel.id;
}

async function createRefreshLog(connectorName: string): Promise<number> {
  const [log] = await db
    .insert(refreshLog)
    .values({
      connectorName,
      startedAt: new Date(),
      status: 'running',
    })
    .returning();

  return log.id;
}

async function updateRefreshLog(
  logId: number,
  status: 'success' | 'failed',
  result: IngestionResult,
  errorMessage?: string
): Promise<void> {
  await db
    .update(refreshLog)
    .set({
      finishedAt: new Date(),
      status,
      summary: `Created: ${result.offersCreated}, Updated: ${result.offersUpdated}, Errors: ${result.errors.length}`,
      errorMessage: errorMessage || (result.errors.length > 0 ? result.errors.join('; ') : null),
      recordsCreated: result.offersCreated,
      recordsUpdated: result.offersUpdated,
      recordsFlagged: result.errors.length,
    })
    .where(eq(refreshLog.id, logId));
}
