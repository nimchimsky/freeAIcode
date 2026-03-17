'use client';

import { useState } from 'react';

interface Offer {
  id: number;
  providerName: string;
  providerSlug: string;
  providerModelId: string;
  accessType: string;
  isFree: boolean;
  inputPrice: number | null;
  outputPrice: number | null;
  effectivePrice: number | null;
  freeLimitText: string | null;
  openAiCompatible: boolean | null;
  endpointExposesToolCalling: boolean | null;
  deprecated: boolean | null;
  lastCheckedAt: Date;
}

interface Model {
  id: number;
  slug: string;
  name: string;
  organization: string | null;
  contextWindow: number | null;
  codingUtilityScore: number | null;
  bestValueScore: number | null;
  benchmarkDisplayStatus: string | null;
  architectureSupportsTools: boolean | null;
  supportsFim: boolean | null;
  supportsReasoning: boolean | null;
  openWeights: boolean | null;
  offers: Offer[];
  providerCount: number;
  hasFree: boolean;
  cheapestPrice: number | null;
  cheapestProvider: string | null;
}

export function CatalogTable({ models }: { models: Model[] }) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (models.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No models found. Run the seed script to populate data.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Model</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Providers</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Free</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cheapest</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quality</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Context</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Features</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {models.map((model) => (
              <>
                <tr
                  key={model.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === model.id ? null : model.id)}
                >
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{model.name}</div>
                    {model.organization && (
                      <div className="text-sm text-gray-500">{model.organization}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{model.providerCount}</td>
                  <td className="px-6 py-4">
                    {model.hasFree ? (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Yes
                      </span>
                    ) : (
                      <span className="text-sm text-gray-500">No</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {model.cheapestPrice !== null ? (
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          ${model.cheapestPrice.toFixed(2)}/M
                        </div>
                        <div className="text-xs text-gray-500">{model.cheapestProvider}</div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {model.codingUtilityScore !== null ? (
                      <span className="text-sm font-medium text-gray-900">
                        {model.codingUtilityScore.toFixed(1)}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-500">No data</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {model.bestValueScore !== null ? (
                      <span className="text-sm font-medium text-blue-600">
                        {model.bestValueScore.toFixed(1)}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {model.contextWindow ? `${(model.contextWindow / 1000).toFixed(0)}K` : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      {model.architectureSupportsTools && (
                        <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">Tools</span>
                      )}
                      {model.supportsFim && (
                        <span className="px-2 py-1 text-xs rounded bg-purple-100 text-purple-800">FIM</span>
                      )}
                      {model.supportsReasoning && (
                        <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800">Reasoning</span>
                      )}
                    </div>
                  </td>
                </tr>
                {expandedId === model.id && (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 bg-gray-50">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm text-gray-900">Provider Offers:</h4>
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-sm">
                            <thead>
                              <tr className="text-left text-xs text-gray-500">
                                <th className="pr-4">Provider</th>
                                <th className="pr-4">Model ID</th>
                                <th className="pr-4">Tier</th>
                                <th className="pr-4">Input</th>
                                <th className="pr-4">Output</th>
                                <th className="pr-4">Effective</th>
                                <th className="pr-4">Limits</th>
                                <th className="pr-4">Compatible</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {model.offers.map((offer) => (
                                <tr key={offer.id}>
                                  <td className="pr-4 py-2">{offer.providerName}</td>
                                  <td className="pr-4 py-2 text-xs text-gray-600">{offer.providerModelId}</td>
                                  <td className="pr-4 py-2">
                                    <span className="px-2 py-1 text-xs rounded bg-gray-100">
                                      {offer.accessType}
                                    </span>
                                  </td>
                                  <td className="pr-4 py-2">
                                    {offer.inputPrice !== null ? `$${offer.inputPrice.toFixed(3)}` : '-'}
                                  </td>
                                  <td className="pr-4 py-2">
                                    {offer.outputPrice !== null ? `$${offer.outputPrice.toFixed(3)}` : '-'}
                                  </td>
                                  <td className="pr-4 py-2 font-medium">
                                    {offer.effectivePrice !== null ? `$${offer.effectivePrice.toFixed(3)}` : '-'}
                                  </td>
                                  <td className="pr-4 py-2 text-xs text-gray-600">
                                    {offer.freeLimitText || '-'}
                                  </td>
                                  <td className="pr-4 py-2">
                                    {offer.openAiCompatible && (
                                      <span className="text-xs text-green-600">✓ OpenAI</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
