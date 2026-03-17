import Link from 'next/link';
import { db } from '@/db';
import { providerOffer, provider, canonicalModel } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export default async function OffersPage() {
  const offers = await db
    .select({
      id: providerOffer.id,
      modelName: canonicalModel.displayName,
      modelOrg: canonicalModel.organization,
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
    .innerJoin(canonicalModel, eq(providerOffer.canonicalModelId, canonicalModel.id))
    .orderBy(desc(providerOffer.effectivePricePerMillion));

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">All Provider Offers</h1>
              <p className="text-sm text-gray-600">Complete list of model offerings across all providers</p>
            </div>
            <nav className="flex gap-4">
              <Link href="/" className="text-gray-600 hover:text-gray-800">
                Catalog
              </Link>
              <Link href="/offers" className="text-blue-600 hover:text-blue-800">
                All Offers
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Model</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Input</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Output</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Effective</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Limits</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Features</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {offers.map((offer) => (
                  <tr key={offer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{offer.modelName}</div>
                      {offer.modelOrg && (
                        <div className="text-xs text-gray-500">{offer.modelOrg}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{offer.providerName}</div>
                      <div className="text-xs text-gray-500">{offer.providerModelId}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        offer.isFree
                          ? 'bg-green-100 text-green-800'
                          : offer.accessType === 'ultra_budget'
                          ? 'bg-blue-100 text-blue-800'
                          : offer.accessType === 'budget'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {offer.accessType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {offer.inputPrice !== null ? `$${offer.inputPrice.toFixed(3)}` : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {offer.outputPrice !== null ? `$${offer.outputPrice.toFixed(3)}` : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {offer.effectivePrice !== null ? `$${offer.effectivePrice.toFixed(3)}` : '-'}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-600">
                      {offer.freeLimitText || offer.rateLimitText || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {offer.openAiCompatible && (
                          <span className="text-xs text-green-600">✓ OpenAI Compatible</span>
                        )}
                        {offer.endpointExposesToolCalling && (
                          <span className="text-xs text-blue-600">✓ Tool Calling</span>
                        )}
                        {offer.deprecated && (
                          <span className="text-xs text-red-600">⚠ Deprecated</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
