import Link from 'next/link';
import { db } from '@/db';
import { refreshLog, canonicalModel, providerOffer } from '@/db/schema';
import { desc, count } from 'drizzle-orm';

export default async function AdminDashboard() {
  const [modelCount] = await db.select({ count: count() }).from(canonicalModel);
  const [offerCount] = await db.select({ count: count() }).from(providerOffer);
  
  const recentLogs = await db
    .select()
    .from(refreshLog)
    .orderBy(desc(refreshLog.startedAt))
    .limit(10);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Canonical Models</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">{modelCount.count}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Provider Offers</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">{offerCount.count}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Recent Refreshes</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">{recentLogs.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/admin/aliases"
              className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <h3 className="font-medium text-gray-900">Manage Aliases</h3>
              <p className="text-sm text-gray-500">Review and merge model aliases</p>
            </Link>
            
            <Link
              href="/admin/refresh-logs"
              className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <h3 className="font-medium text-gray-900">Refresh Logs</h3>
              <p className="text-sm text-gray-500">View connector execution history</p>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Refresh Logs</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Connector</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Started</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Summary</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{log.connectorName}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          log.status === 'success'
                            ? 'bg-green-100 text-green-800'
                            : log.status === 'failed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {log.startedAt.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{log.summary}</td>
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
