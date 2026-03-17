# Contributing to FreeAIcode

Thank you for your interest in contributing to FreeAIcode!

## Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and configure
4. Generate database schema: `npm run db:generate`
5. Run migrations: `npm run db:migrate`
6. Seed initial data: `npm run db:seed`
7. Start development server: `npm run dev`

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (public)/          # Public pages
│   ├── admin/             # Admin panel pages
│   └── api/               # API routes (future)
├── components/            # React components
│   └── catalog/           # Catalog-specific components
├── db/                    # Database configuration
│   ├── schema.ts          # Drizzle schema definitions
│   └── migrate.ts         # Migration runner
├── lib/                   # Core business logic
│   ├── auth/              # Authentication utilities
│   ├── connectors/        # Data source connectors
│   ├── ingestion/         # Data ingestion pipeline
│   ├── normalization/     # Model name normalization
│   ├── pricing/           # Pricing configuration
│   └── scoring/           # Scoring algorithms
├── jobs/                  # Background worker
│   └── worker.ts          # pg-boss worker
└── middleware.ts          # Next.js middleware (auth)

scripts/
└── seed.ts                # Initial data seeding
```

## Code Style

- Use TypeScript for all new code
- Follow existing patterns and conventions
- Use Prettier for formatting (configured in Next.js)
- Run `npm run lint` before committing
- Run `npm run type-check` to verify types

## Adding a New Connector

1. Create a new file in `src/lib/connectors/`
2. Implement the `ProviderConnector` interface
3. Add to `getAllConnectors()` in `src/lib/connectors/index.ts`
4. Add required environment variables to `.env.example`
5. Update README with connector documentation
6. Test with seed script

Example:

```typescript
// src/lib/connectors/my-provider.ts
import { ProviderConnector, RawOffer } from './types';
import { withRetry, getCachedData, setCachedData } from './base';

export class MyProviderConnector implements ProviderConnector {
  name = 'my-provider';

  async fetchOffers(): Promise<RawOffer[]> {
    return withRetry(async () => {
      // Check cache
      const cached = await getCachedData<RawOffer[]>(this.name, 'models');
      if (cached) return cached;

      // Fetch from API
      const response = await fetch('https://api.provider.com/models');
      const data = await response.json();

      // Transform to RawOffer[]
      const offers = this.transform(data);

      // Cache
      await setCachedData(this.name, 'models', offers, 6);

      return offers;
    }, this.name);
  }

  private transform(data: any[]): RawOffer[] {
    return data.map(item => ({
      providerName: 'My Provider',
      providerSlug: 'my-provider',
      providerType: 'direct_provider',
      providerModelId: item.id,
      displayModelName: item.name,
      inputPricePerMillion: item.pricing?.input,
      outputPricePerMillion: item.pricing?.output,
      isFree: item.free,
      sourceUrl: 'https://api.provider.com/models',
      sourceType: 'api',
      sourceConfidence: 95,
      fetchedAt: new Date().toISOString(),
    }));
  }
}
```

## Database Changes

1. Modify `src/db/schema.ts`
2. Generate migration: `npm run db:generate`
3. Review generated migration in `drizzle/` directory
4. Test migration: `npm run db:migrate`
5. Update seed script if needed
6. Document schema changes in commit message

## Testing

We use a pragmatic testing approach focused on critical business logic:

### What to Test

- Scoring calculations (pricing, value, benchmarks)
- Normalization logic
- Conflict resolution
- Admin middleware auth

### What Not to Test

- Database queries (tested via integration)
- UI components (tested manually)
- External API calls (use mocks if needed)

### Running Tests

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Manual testing
npm run dev
# Visit http://localhost:3000
```

### Writing Tests

Place tests in `__tests__` directories next to the code:

```
src/lib/scoring/
├── pricing.ts
├── value.ts
└── __tests__/
    ├── pricing.test.ts
    └── value.test.ts
```

## Commit Guidelines

Use clear, descriptive commit messages:

```
feat: add Anthropic connector
fix: correct effective price calculation
docs: update deployment guide
refactor: simplify normalization logic
test: add value score tests
```

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Run `npm run type-check` and `npm run lint`
4. Test locally with `npm run dev`
5. Update documentation if needed
6. Submit PR with clear description
7. Wait for review

## Phase 1 vs Phase 2

This is a Phase 1 implementation. Focus contributions on:

### Phase 1 (Current)
- Core connector improvements
- Bug fixes
- Performance optimizations
- Documentation improvements
- Admin tool enhancements

### Phase 2 (Future)
- Advanced filtering UI
- Export functionality
- Benchmark connectors
- Historical charts
- Watchlist and alerts
- Recommendation wizard

If you want to work on Phase 2 features, please open an issue first to discuss.

## Code Review Checklist

Before submitting:

- [ ] Code follows existing patterns
- [ ] TypeScript types are correct
- [ ] No console.logs in production code (use proper logging)
- [ ] Environment variables documented in `.env.example`
- [ ] README updated if adding features
- [ ] No sensitive data in code
- [ ] Database migrations tested
- [ ] Works in both dev and production modes

## Getting Help

- Check existing issues on GitHub
- Review architecture documentation in `ARCHITECTURE.md`
- Read deployment guide in `DEPLOYMENT.md`
- Ask questions in GitHub Discussions

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.
