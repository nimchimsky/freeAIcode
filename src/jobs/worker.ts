import PgBoss from 'pg-boss';
import { getAllConnectors } from '@/lib/connectors';
import { ingestOffers } from '@/lib/ingestion/ingest';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}

const boss = new PgBoss({
  connectionString: process.env.DATABASE_URL,
  max: 5,
});

boss.on('error', (error) => {
  console.error('pg-boss error:', error);
});

async function refreshAllConnectors() {
  console.log('[Worker] Starting refresh job...');
  const connectors = getAllConnectors();

  for (const connector of connectors) {
    try {
      console.log(`[Worker] Fetching offers from ${connector.name}...`);
      const offers = await connector.fetchOffers();
      
      console.log(`[Worker] Ingesting ${offers.length} offers from ${connector.name}...`);
      const result = await ingestOffers(offers, connector.name);
      
      console.log(`[Worker] ${connector.name} complete:`, {
        created: result.offersCreated,
        updated: result.offersUpdated,
        errors: result.errors.length,
      });
    } catch (error) {
      console.error(`[Worker] Failed to refresh ${connector.name}:`, error);
    }
  }

  console.log('[Worker] Refresh job complete');
}

async function start() {
  await boss.start();
  console.log('[Worker] pg-boss started');

  // Register job handlers
  await boss.work('refresh-connectors', async () => {
    await refreshAllConnectors();
  });

  // Schedule recurring refresh job (every 6 hours)
  await boss.schedule('refresh-connectors', '0 */6 * * *', {}, {
    tz: 'UTC',
  });

  console.log('[Worker] Scheduled refresh-connectors job (every 6 hours)');
  console.log('[Worker] Worker is ready');
}

start().catch((error) => {
  console.error('[Worker] Failed to start:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[Worker] SIGTERM received, shutting down...');
  await boss.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('[Worker] SIGINT received, shutting down...');
  await boss.stop();
  process.exit(0);
});
