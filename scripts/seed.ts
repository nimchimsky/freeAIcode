import { getAllConnectors } from '../src/lib/connectors';
import { ingestOffers } from '../src/lib/ingestion/ingest';

async function seed() {
  console.log('=== FreeAIcode Bootstrap Seed ===\n');

  const connectors = getAllConnectors();

  for (const connector of connectors) {
    try {
      console.log(`\n[${connector.name}] Fetching offers...`);
      const offers = await connector.fetchOffers();
      console.log(`[${connector.name}] Fetched ${offers.length} offers`);

      console.log(`[${connector.name}] Ingesting...`);
      const result = await ingestOffers(offers, connector.name);

      console.log(`[${connector.name}] Complete:`);
      console.log(`  - Providers created: ${result.providersCreated}`);
      console.log(`  - Models created: ${result.modelsCreated}`);
      console.log(`  - Offers created: ${result.offersCreated}`);
      console.log(`  - Offers updated: ${result.offersUpdated}`);
      console.log(`  - Aliases created: ${result.aliasesCreated}`);
      console.log(`  - Errors: ${result.errors.length}`);

      if (result.errors.length > 0) {
        console.log(`  - Error details:`, result.errors.slice(0, 5));
      }

      // Small delay to avoid rate limits
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`[${connector.name}] Failed:`, error);
    }
  }

  console.log('\n=== Seed Complete ===');
  process.exit(0);
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
