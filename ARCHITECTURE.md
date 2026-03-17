# FreeAIcode Architecture

## Overview
Model-first catalog for API-accessible coding models. Helps developers find the best models by quality, cost, and availability.

## Core Principle
MODEL-FIRST, not provider-first. Same canonical model shown once, with multiple provider offers attached.

## Tech Stack
- Next.js 15 (App Router, RSC)
- TypeScript
- Tailwind CSS
- PostgreSQL (Railway)
- Drizzle ORM
- Zod validation
- pg-boss (job queue using PostgreSQL)
- Node.js 22

## Railway Multi-Service Architecture

### Service 1: web
- Next.js production server
- Public catalog UI
- Admin UI
- Internal API routes
- Port: 3000

### Service 2: worker
- Standalone pg-boss worker process
- Registers scheduled jobs on boot using pg-boss native cron
- Executes ingestion, refresh, normalization jobs
- No HTTP server

## Data Flow

```
External Sources → Connectors → RawOffer[] → Normalization → CanonicalModel + ProviderOffer
                                                    ↓
                                            Alias Resolution
                                                    ↓
                                            Conflict Detection
                                                    ↓
                                            Scoring Engine
                                                    ↓
                                            UI Views
```

## Key Components

### 1. Connector Layer
- Standardized interface for all data sources
- Returns RawOffer[] with source traceability
- Implements caching, retry, validation
- Sources: OpenRouter API, Gemini API, Kilo Gateway, Benchmarks

### 2. Normalization Engine
- Resolves model aliases to canonical models
- Detects ambiguous collisions → admin review
- Preserves source URLs and timestamps
- Deterministic, auditable

### 3. Scoring Engine
- Coding Utility Score (composite of benchmarks + speed)
- Best Value Score (quality per dollar with 1.00 floor)
- Benchmark confidence calculation
- Price tier assignment

### 4. Pricing Configuration Layer
- Centralized typed file: src/lib/pricing/pricing.ts
- Manual official-source fallback for providers without pricing APIs
- Preserves source traceability (sourceType = "manual")
- Single source of truth for manual pricing

### 5. Job System (pg-boss)
- Worker service registers cron jobs on boot
- Refresh jobs: fetch latest data from connectors
- Normalization jobs: resolve aliases, detect conflicts
- Maintenance jobs: cleanup, cache expiry
- Change detection: log price changes, deprecations

### 6. Admin Panel
- Protected by middleware + auth cookie
- Alias merge/review tool
- Source review queue
- Manual override editor
- Refresh job log viewer
- Deprecation management

### 7. Public UI
- Main Catalog: one row per canonical model, expandable to show provider offers
- Provider Offers View: one row per offer
- URL-persisted filters and sorting
- CSV/JSON export
- Mobile-responsive

## Database Schema Highlights

### Core Entities
- CanonicalModel: the model itself (benchmarks, scores)
- Provider: API provider or gateway
- ProviderOffer: specific offering (pricing, limits, availability)
- ModelAlias: alternative names for resolution
- BenchmarkScore: individual benchmark results

### Traceability
- RefreshLog: connector execution history
- ChangeLog: field-level change tracking
- PriceHistory: pricing over time
- SourceReviewQueue: unresolved conflicts

### Admin Tools
- ManualOverride: admin corrections
- ConnectorCache: response caching

## Scoring Formulas

### Effective Price
```
effectivePricePerMillion = (inputPrice * 0.2) + (outputPrice * 0.8)
```

### Coding Utility Score
```
Base weights:
- SWE-bench Verified: 40%
- LiveCodeBench: 30%
- Aider Polyglot: 20%
- Speed/Latency: 10%

If components missing, rescale proportionally.
```

### Best Value Score
```
bestValueScore = codingUtilityScore / max(effectivePricePerMillion, 1.00)
```

### Benchmark Confidence
```
benchmarkConfidence = 
  0.5 * coverageScore +
  0.3 * reliabilityScore +
  0.2 * freshnessScore
```

## Security
- Admin routes protected by Next.js middleware
- Signed auth cookie on login
- Environment-based credentials
- Zod validation on all external data
- No secrets in client code

## Deployment Flow

1. Push to Railway
2. Railway builds both services from same repo
3. Database migrations run automatically
4. Web service starts Next.js server
5. Worker service starts pg-boss worker
6. Run seed script manually first time: `npm run db:seed`
7. Worker executes scheduled refresh jobs

## Phase 1 Scope (This Implementation)
✅ Complete database schema
✅ Connector architecture
✅ Initial connectors (OpenRouter, Gemini, Kilo, Benchmarks)
✅ Normalization and scoring
✅ Main Catalog view
✅ Provider Offers view
✅ Admin panel with auth
✅ Refresh jobs
✅ Change logging
✅ Price history
✅ CSV/JSON export
✅ Bootstrap/seed script

## Phase 2 (Future)
❌ Decision View
❌ Watchlist
❌ Alerts
❌ Email notifications
❌ Historical charts
❌ Compare UI
❌ Recommendation wizard
