import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../src/db/schema';

async function checkDatabase() {
  const dbUrl = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;
  console.log(`Connecting to: ${dbUrl?.replace(/:[^:@]+@/, ':****@')}\n`);
  
  const pool = new Pool({
    connectionString: dbUrl,
  });

  const db = drizzle(pool, { schema });

  try {
    console.log('🔍 Checking database status...\n');

    // Check canonical models
    const models = await db.select().from(schema.canonicalModel);
    console.log(`📊 Canonical Models: ${models.length}`);
    if (models.length > 0) {
      console.log(`   First 3: ${models.slice(0, 3).map(m => m.displayName).join(', ')}`);
    }

    // Check providers
    const providers = await db.select().from(schema.provider);
    console.log(`\n🏢 Providers: ${providers.length}`);
    if (providers.length > 0) {
      console.log(`   List: ${providers.map(p => p.name).join(', ')}`);
    }

    // Check provider offers
    const offers = await db.select().from(schema.providerOffer);
    console.log(`\n💰 Provider Offers: ${offers.length}`);
    
    // Check free offers
    const freeOffers = offers.filter(o => o.isFree);
    console.log(`   Free offers: ${freeOffers.length}`);

    // Check model aliases
    const aliases = await db.select().from(schema.modelAlias);
    console.log(`\n🏷️  Model Aliases: ${aliases.length}`);

    // Check benchmark scores
    const benchmarks = await db.select().from(schema.benchmarkScore);
    console.log(`\n📈 Benchmark Scores: ${benchmarks.length}`);

    // Check refresh logs
    const logs = await db.select().from(schema.refreshLog).orderBy(schema.refreshLog.startedAt);
    console.log(`\n📝 Refresh Logs: ${logs.length}`);
    if (logs.length > 0) {
      const lastLog = logs[logs.length - 1];
      console.log(`   Last refresh: ${lastLog.connectorName} - ${lastLog.status}`);
      console.log(`   Started: ${lastLog.startedAt}`);
      if (lastLog.summary) {
        console.log(`   Summary: ${lastLog.summary}`);
      }
    }

    console.log('\n✅ Database check complete!');
  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await pool.end();
  }
}

checkDatabase();
