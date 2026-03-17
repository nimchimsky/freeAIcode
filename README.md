# FreeAIcode

Model-first catalog for API-accessible coding models. Helps developers find the best models by quality, cost, and availability.

## Overview

FreeAIcode is a production-ready web application that helps developers answer:
- What is the best free coding model right now?
- What is the cheapest model that is still good enough for coding?
- Which model has the best coding quality per dollar?
- Which free or low-cost models can I use from coding environments like Antigravity, Kilo, or other OpenAI-compatible tools?

## Core Principle

MODEL-FIRST, not provider-first. If the same underlying model is available from multiple providers, the main catalog shows that model only once. All provider offers are attached to the canonical model.

## Architecture

### Multi-Service Railway Deployment

The application consists of two services deployed from a single monorepo:

1. **web** - Next.js application serving public and admin UI
2. **worker** - Standalone pg-boss worker for scheduled jobs

### Tech Stack

- Next.js 15 with App Router and React Server Components
- TypeScript
- Tailwind CSS
- PostgreSQL (Railway)
- Drizzle ORM
- Zod for validation
- pg-boss for background jobs
- Node.js 22 runtime

### Data Flow

```
External Sources → Connectors → RawOffer[] → Normalization → CanonicalModel + ProviderOffer
                                                    ↓
                                            Alias Resolution
                                                    ↓
                                            Scoring Engine
                                                    ↓
                                            UI Views
```

## Railway Deployment

### Prerequisites

1. Railway account
2. PostgreSQL database provisioned in Railway
3. Environment variables configured

### Deployment Steps

1. Create a new Railway project
2. Add PostgreSQL database service
3. Create two services from this repository:
   - Service 1: Set start command to `web` (uses Procfile)
   - Service 2: Set start command to `worker` (uses Procfile)
4. Configure environment variables (see below)
5. Deploy both services
6. Run seed script manually first time (see below)

### Service Configuration

The `Procfile` defines both services:

```
web: npm run db:migrate && npm run build && npm start
worker: npm run db:migrate && npm run worker
```

Railway will automatically detect and use these commands based on the service configuration.

## Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# Database (provided by Railway PostgreSQL)
DATABASE_URL=postgresql://user:password@host:5432/freeaicode

# Application
APP_URL=https://your-app.up.railway.app
NODE_ENV=production
LOG_LEVEL=info

# Admin Authentication
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password

# API Keys for Connectors
OPENROUTER_API_KEY=sk-or-v1-...
GEMINI_API_KEY=...
KILO_API_KEY=...

# Optional
CRON_SECRET=random-secret
BENCHMARK_IMPORT_TOKEN=token-for-uploads
```

## Local Development

### Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your values

# Generate database migrations
npm run db:generate

# Run migrations
npm run db:migrate

# Seed initial data
npm run db:seed
```

### Running Locally

```bash
# Terminal 1: Start Next.js dev server
npm run dev

# Terminal 2: Start worker (optional for local dev)
npm run worker
```

Visit `http://localhost:3000` to see the catalog.

## Database Migrations

Migrations are managed by Drizzle ORM:

```bash
# Generate new migration after schema changes
npm run db:generate

# Apply migrations
npm run db:migrate

# Open Drizzle Studio to inspect database
npm run db:studio
```

## Running the Worker

The worker service runs pg-boss and registers scheduled jobs on boot:

```bash
npm run worker
```

The worker automatically schedules:
- `refresh-connectors` - Runs every 6 hours to fetch latest data

## Bootstrap / Seed Script

The seed script performs initial data ingestion:

```bash
npm run db:seed
```

This script:
- Fetches data from all configured connectors
- Ingests offers sequentially with delays to avoid rate limits
- Creates canonical models, providers, and offers
- Is safe to rerun (updates existing records)

Run this after first deployment to populate the database.

## Connector Overview

Connectors fetch data from external sources and transform it into a standardized format.

### Available Connectors

1. **OpenRouter** - Fetches models from OpenRouter API
2. **Gemini** - Uses manual pricing configuration for Google models

### Connector Interface

All connectors implement:

```typescript
interface ProviderConnector {
  name: string;
  fetchOffers(): Promise<RawOffer[]>;
}
```

### Adding a New Connector

1. Create a new file in `src/lib/connectors/`
2. Implement the `ProviderConnector` interface
3. Add to `getAllConnectors()` in `src/lib/connectors/index.ts`
4. Add any required API keys to `.env.example`

Example:

```typescript
import { ProviderConnector, RawOffer } from './types';

export class MyConnector implements ProviderConnector {
  name = 'my-connector';

  async fetchOffers(): Promise<RawOffer[]> {
    // Fetch and transform data
    return [];
  }
}
```

## Pricing Configuration-as-Code

For providers without structured pricing APIs, use the manual pricing layer:

File: `src/lib/pricing/pricing.ts`

```typescript
export const MANUAL_PRICING: ManualPricingEntry[] = [
  {
    providerSlug: 'provider-name',
    providerModelId: 'model-id',
    inputPricePerMillion: 1.25,
    outputPricePerMillion: 5.00,
    isFree: false,
    sourceUrl: 'https://provider.com/pricing',
    lastVerified: '2024-01-15',
  },
];
```

All manual pricing entries preserve source traceability with `sourceType = "manual"`.

## Admin Access

### Login

Visit `/admin/login` and use credentials from environment variables:
- Username: `ADMIN_USERNAME`
- Password: `ADMIN_PASSWORD`

### Admin Features

- Dashboard with statistics
- Refresh log viewer
- Alias management (Phase 1 placeholder)
- Manual override tools (Phase 1 placeholder)

## Scoring Methodology

### Effective Price Formula

```
effectivePricePerMillion = (inputPrice * 0.2) + (outputPrice * 0.8)
```

Rationale: For coding assistants, output tokens matter more than input tokens.

### Price Tiers

Based on effective price per million tokens:
- **free**: $0
- **ultra_budget**: >$0 and <$0.20
- **budget**: ≥$0.20 and <$1.00
- **mid_range**: ≥$1.00 and <$5.00
- **premium**: ≥$5.00

### Coding Utility Score

Composite score (0-100) based on:
- 40% SWE-bench Verified
- 30% LiveCodeBench
- 20% Aider Polyglot
- 10% Speed/Latency

If components are missing, remaining weights are rescaled proportionally.

### Best Value Score

```
bestValueScore = codingUtilityScore / max(effectivePricePerMillion, 1.00)
```

The 1.00 floor prevents free models from dominating through a tiny divisor. Free models also participate in a separate "Best Free Models" ranking.

### Benchmark Display Status

- **sufficient_data**: ≥2 benchmark sources, including ≥1 code-quality benchmark
- **partial_data**: Exactly 1 benchmark source
- **insufficient_data**: No benchmark sources (score not shown)

### Benchmark Confidence

```
benchmarkConfidence = 
  0.5 * coverageScore +
  0.3 * reliabilityScore +
  0.2 * freshnessScore
```

## Known Limitations

### Phase 1 Scope

This implementation includes:
- ✅ Complete database schema
- ✅ Connector architecture
- ✅ OpenRouter and Gemini connectors
- ✅ Normalization and scoring
- ✅ Main Catalog view
- ✅ Basic admin panel
- ✅ Refresh jobs
- ✅ Change logging
- ✅ Price history
- ✅ Admin authentication

### Not Included (Phase 2)

- ❌ Decision View
- ❌ Watchlist
- ❌ Alerts and notifications
- ❌ Historical charts
- ❌ Compare-up-to-4 UI
- ❌ Recommendation wizard
- ❌ Advanced filtering UI
- ❌ CSV/JSON export
- ❌ Benchmark connectors (SWE-bench, LiveCodeBench, Aider)

### Current Limitations

1. Benchmark data is not yet ingested (requires benchmark connectors)
2. Scoring calculations work but will show null until benchmarks are added
3. Admin tools are basic (alias merge, review queue need full implementation)
4. No public API endpoints yet
5. Mobile responsiveness is functional but not optimized

## Phase 2 Roadmap

Future enhancements:
- Full benchmark ingestion pipeline
- Advanced filtering and sorting UI
- Export functionality (CSV/JSON)
- Decision View for guided model selection
- Watchlist and alerts
- Historical price charts
- Model comparison tool
- Recommendation wizard
- Enhanced admin tools
- Public API

## Contributing

This is a production application. Before making changes:

1. Review the architecture documentation
2. Follow the existing patterns
3. Add tests for critical paths
4. Update this README if adding features

## License

Proprietary - All rights reserved

## Support

For issues or questions, contact the development team.
