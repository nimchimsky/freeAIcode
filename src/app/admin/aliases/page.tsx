import Link from 'next/link';
import { db } from '@/db';
import { modelAlias, canonicalModel } from '@/db/schema';
import { eq } from 'drizzle-orm';

export default async function AliasesPage() {
  const aliases = await db
    .select({
      id: modelAlias.id,
      alias: modelAlias.alias,
      aliasNormalized: modelAlias.aliasNormalized,
      source: modelAlias.source,
      createdAt: modelAlias.createdAt,
      modelName: canonicalModel.displayName,
      modelSlug: canonicalModel.canonicalSlug,
    })
    .from(modelAlias)
    .innerJoin(canonicalModel, eq(modelAlias.canonicalModelId, canonicalModel.id))
    .limit(100);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Model Aliases</h1>
            <Link href="/admin" className="text-blue-600 hover:text-blue-800">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            Phase 1: Basic alias viewing. Merge and review tools coming in Phase 2.
          </p>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alias</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Normalized</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Canonical Model</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {aliases.map((alias) => (
                  <tr key={alias.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{alias.alias}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{alias.aliasNormalized}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{alias.modelName}</div>
                      <div className="text-xs text-gray-500">{alias.modelSlug}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{alias.source}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {alias.createdAt.toLocaleDateString()}
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
