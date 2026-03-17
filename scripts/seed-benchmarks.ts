import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { eq } from 'drizzle-orm';
import * as schema from '../src/db/schema';
import { calculateCodingUtilityScore } from '../src/lib/scoring/benchmarks';
import { calculateBestValueScore } from '../src/lib/scoring/value';

/**
 * Sample benchmark data for popular coding models
 * Based on public benchmarks from SWE-bench, LiveCodeBench, Aider, etc.
 */
const SAMPLE_BENCHMARKS = [
  // Claude models
  {
    modelPattern: /claude.*3\.5.*sonnet/i,
    benchmarks: [
      { source: 'swe_bench', metric: 'resolve_rate', raw: 49.0, normalized: 85 },
      { source: 'livecode_bench', metric: 'pass_rate', raw: 72.0, normalized: 88 },
      { source: 'aider', metric: 'edit_success', raw: 68.5, normalized: 90 },
      { source: 'speed', metric: 'tokens_per_sec', raw: 85.0, normalized: 75 },
    ],
  },
  // GPT-4 models
  {
    modelPattern: /gpt.*4.*turbo|gpt.*4o/i,
    benchmarks: [
      { source: 'swe_bench', metric: 'resolve_rate', raw: 38.0, normalized: 75 },
      { source: 'livecode_bench', metric: 'pass_rate', raw: 65.0, normalized: 82 },
      { source: 'aider', metric: 'edit_success', raw: 62.0, normalized: 85 },
      { source: 'speed', metric: 'tokens_per_sec', raw: 90.0, normalized: 80 },
    ],
  },
  // GPT-3.5
  {
    modelPattern: /gpt.*3\.5/i,
    benchmarks: [
      { source: 'swe_bench', metric: 'resolve_rate', raw: 12.0, normalized: 45 },
      { source: 'livecode_bench', metric: 'pass_rate', raw: 35.0, normalized: 55 },
      { source: 'aider', metric: 'edit_success', raw: 38.0, normalized: 60 },
      { source: 'speed', metric: 'tokens_per_sec', raw: 120.0, normalized: 95 },
    ],
  },
  // Gemini models
  {
    modelPattern: /gemini.*pro|gemini.*1\.5/i,
    benchmarks: [
      { source: 'swe_bench', metric: 'resolve_rate', raw: 32.0, normalized: 70 },
      { source: 'livecode_bench', metric: 'pass_rate', raw: 58.0, normalized: 78 },
      { source: 'aider', metric: 'edit_success', raw: 55.0, normalized: 80 },
      { source: 'speed', metric: 'tokens_per_sec', raw: 95.0, normalized: 82 },
    ],
  },
  // DeepSeek Coder
  {
    modelPattern: /deepseek.*coder/i,
    benchmarks: [
      { source: 'swe_bench', metric: 'resolve_rate', raw: 28.0, normalized: 65 },
      { source: 'livecode_bench', metric: 'pass_rate', raw: 52.0, normalized: 72 },
      { source: 'aider', metric: 'edit_success', raw: 48.0, normalized: 72 },
      { source: 'speed', metric: 'tokens_per_sec', raw: 75.0, normalized: 70 },
    ],
  },
  // Qwen Coder
  {
    modelPattern: /qwen.*coder/i,
    benchmarks: [
      { source: 'swe_bench', metric: 'resolve_rate', raw: 25.0, normalized: 62 },
      { source: 'livecode_bench', metric: 'pass_rate', raw: 48.0, normalized: 68 },
      { source: 'aider', metric: 'edit_success', raw: 45.0, normalized: 70 },
      { source: 'speed', metric: 'tokens_per_sec', raw: 80.0, normalized: 72 },
    ],
  },
  // Mistral models
  {
    modelPattern: /mistral.*large|mistral.*medium/i,
    benchmarks: [
      { source: 'swe_bench', metric: 'resolve_rate', raw: 22.0, normalized: 58 },
      { source: 'livecode_bench', metric: 'pass_rate', raw: 45.0, normalized: 65 },
      { source: 'aider', metric: 'edit_success', raw: 42.0, normalized: 68 },
      { source: 'speed', metric: 'tokens_per_sec', raw: 85.0, normalized: 75 },
    ],
  },
  // Smaller/budget models
  {
    modelPattern: /mistral.*small|gemini.*flash|gpt.*mini/i,
    benchmarks: [
      { source: 'swe_bench', metric: 'resolve_rate', raw: 15.0, normalized: 48 },
      { source: 'livecode_bench', metric: 'pass_rate', raw: 38.0, normalized: 58 },
      { source: 'aider', metric: 'edit_success', raw: 35.0, normalized: 58 },
      { source: 'speed', metric: 'tokens_per_sec', raw: 110.0, normalized: 90 },
    ],
  },
];

const BASE_WEIGHTS = {
  swe_bench: 0.40,
  livecode_bench: 0.30,
  aider: 0.20,
  speed: 0.10,
};

async function seedBenchmarks() {
  const dbUrl = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;
  console.log(`Connecting to: ${dbUrl?.replace(/:[^:@]+@/, ':****@')}\n`);
  
  const pool = new Pool({ connectionString: dbUrl });
  const db = drizzle(pool, { schema });

  try {
    console.log('🎯 Seeding benchmark data...\n');

    // Get all canonical models
    const models = await db.select().from(schema.canonicalModel);
    console.log(`Found ${models.length} models\n`);

    let matchedCount = 0;
    let benchmarksAdded = 0;

    for (const model of models) {
      // Try to match model with benchmark data
      const benchmarkData = SAMPLE_BENCHMARKS.find(b => 
        b.modelPattern.test(model.displayName) || 
        b.modelPattern.test(model.canonicalSlug)
      );

      if (!benchmarkData) continue;

      matchedCount++;
      console.log(`📊 Adding benchmarks for: ${model.displayName}`);

      // Add benchmark scores
      for (const bench of benchmarkData.benchmarks) {
        await db.insert(schema.benchmarkScore).values({
          canonicalModelId: model.id,
          sourceName: bench.source,
          metricName: bench.metric,
          rawValue: bench.raw,
          normalizedValue: bench.normalized,
          sourceUrl: 'https://github.com/various-benchmarks',
          sourceConfidence: 80,
          measuredAt: new Date(),
        });
        benchmarksAdded++;
      }

      // Calculate coding utility score
      const components = benchmarkData.benchmarks.map(b => ({
        sourceName: b.source,
        normalizedValue: b.normalized,
        weight: BASE_WEIGHTS[b.source as keyof typeof BASE_WEIGHTS] || 0,
      }));

      const codingUtilityScore = calculateCodingUtilityScore(components);

      // Get cheapest offer for value calculation
      const offers = await db
        .select()
        .from(schema.providerOffer)
        .where(eq(schema.providerOffer.canonicalModelId, model.id));

      const cheapestPrice = offers
        .filter(o => o.effectivePricePerMillion !== null)
        .map(o => o.effectivePricePerMillion!)
        .sort((a, b) => a - b)[0] || null;

      const bestValueScore = calculateBestValueScore(codingUtilityScore, cheapestPrice);

      // Update model with scores
      await db
        .update(schema.canonicalModel)
        .set({
          codingUtilityScore,
          bestValueScore,
          benchmarkDisplayStatus: 'sufficient_data',
          lastBenchmarkRefreshAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(schema.canonicalModel.id, model.id));

      console.log(`  ✓ Quality: ${codingUtilityScore?.toFixed(1)}, Value: ${bestValueScore?.toFixed(1)}`);
    }

    console.log(`\n✅ Benchmark seeding complete!`);
    console.log(`   Models matched: ${matchedCount}`);
    console.log(`   Benchmarks added: ${benchmarksAdded}`);
  } catch (error) {
    console.error('❌ Error seeding benchmarks:', error);
  } finally {
    await pool.end();
  }
}

seedBenchmarks();
