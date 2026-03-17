import { db } from '@/db';
import { canonicalModel, providerOffer, provider } from '@/db/schema';
import { desc, eq, sql } from 'drizzle-orm';
import { CatalogTable } from './CatalogTable';

export async function CatalogView() {
  // Fetch all canonical models with their offers
  const models = await db
    .select({
      id: canonicalModel.id,
      slug: canonicalModel.canonicalSlug,
      name: canonicalModel.displayName,
      organization: canonicalModel.organization,
      family: canonicalModel.family,
      contextWindow: canonicalModel.contextWindow,
      codingUtilityScore: canonicalModel.codingUtilityScore,
      bestValueScore: canonicalModel.bestValueScore,
      benchmarkDisplayStatus: canonicalModel.benchmarkDisplayStatus,
      architectureSupportsTools: canonicalModel.architectureSupportsTools,
      supportsFim: canonicalModel.supportsFim,
      supportsReasoning: canonicalModel.supportsReasoning,
      openWeights: canonicalModel.openWeights,
    })
    .from(canonicalModel)
    .orderBy(desc(canonicalModel.bestValueScore));

  // Fetch offers for each model
  const modelsWithOffers = await Promise.all(
    models.map(async (model) => {
      const offers = await db
        .select({
          id: providerOffer.id,
          providerName: provider.name,
          providerSlug: provider.slug,
          providerModelId: providerOffer.providerModelId,
          accessType: providerOffer.accessType,
          isFree: providerOffer.isFree,
          inputPrice: providerOffer.inputPricePerMillion,
          outputPrice: providerOffer.outputPricePerMillion,
          effectivePrice: providerOffer.effectivePricePerMillion,
          freeLimitText: providerOffer.freeLimitText,
          rateLimitText: providerOffer.rateLimitText,
          openAiCompatible: providerOffer.openAiCompatible,
          endpointExposesToolCalling: providerOffer.endpointExposesToolCalling,
          deprecated: providerOffer.deprecated,
          lastCheckedAt: providerOffer.lastCheckedAt,
        })
        .from(providerOffer)
        .innerJoin(provider, eq(providerOffer.providerId, provider.id))
        .where(eq(providerOffer.canonicalModelId, model.id))
        .orderBy(providerOffer.effectivePricePerMillion);

      const hasFree = offers.some((o) => o.isFree);
      const cheapestPrice = offers[0]?.effectivePrice ?? null;
      const cheapestProvider = offers[0]?.providerName ?? null;

      return {
        ...model,
        offers,
        providerCount: offers.length,
        hasFree,
        cheapestPrice,
        cheapestProvider,
      };
    })
  );

  return <CatalogTable models={modelsWithOffers} />;
}
