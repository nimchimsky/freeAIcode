import Link from 'next/link';
import { CatalogView } from '@/components/catalog/CatalogView';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">FreeAIcode</h1>
              <p className="text-sm text-gray-600">Find the best coding models by quality, cost, and availability</p>
            </div>
            <nav className="flex gap-4">
              <Link href="/" className="text-blue-600 hover:text-blue-800">
                Catalog
              </Link>
              <Link href="/offers" className="text-gray-600 hover:text-gray-800">
                All Offers
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CatalogView />
      </main>
    </div>
  );
}
