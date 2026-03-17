import { NextRequest, NextResponse } from 'next/server';
import { getAllConnectors } from '@/lib/connectors';
import { ingestOffers } from '@/lib/ingestion/ingest';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes

export async function POST(request: NextRequest) {
  try {
    // Simple auth check
    const authHeader = request.headers.get('authorization');
    const expectedAuth = `Bearer ${process.env.ADMIN_PASSWORD}`;
    
    if (authHeader !== expectedAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const results = [];
    const connectors = getAllConnectors();

    for (const connector of connectors) {
      try {
        console.log(`[${connector.name}] Fetching offers...`);
        const offers = await connector.fetchOffers();
        console.log(`[${connector.name}] Fetched ${offers.length} offers`);

        console.log(`[${connector.name}] Ingesting...`);
        const result = await ingestOffers(offers, connector.name);

        results.push({
          connector: connector.name,
          success: true,
          providersCreated: result.providersCreated,
          modelsCreated: result.modelsCreated,
          offersCreated: result.offersCreated,
          offersUpdated: result.offersUpdated,
          aliasesCreated: result.aliasesCreated,
          errors: result.errors.length,
        });

        // Small delay to avoid rate limits
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`[${connector.name}] Failed:`, error);
        results.push({
          connector: connector.name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Seed completed',
      results,
    });
  } catch (error) {
    console.error('Seed failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
