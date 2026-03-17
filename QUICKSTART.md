# Quick Start Guide

Get FreeAIcode running locally in 5 minutes.

## Prerequisites

- Node.js 22+
- PostgreSQL (local or Railway)
- OpenRouter API key (optional but recommended)

## Step 1: Clone and Install

```bash
git clone <repository-url>
cd freeaicode
npm install
```

## Step 2: Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and set at minimum:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/freeaicode
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-password
OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

## Step 3: Set Up Database

```bash
# Generate Drizzle schema
npm run db:generate

# Run migrations
npm run db:migrate

# Seed initial data
npm run db:seed
```

The seed script will:
- Fetch models from OpenRouter
- Fetch models from Gemini (using manual pricing)
- Create canonical models
- Create provider offers
- Take about 30-60 seconds

## Step 4: Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## Step 5: Access Admin Panel

1. Go to http://localhost:3000/admin/login
2. Log in with credentials from `.env`
3. View dashboard and refresh logs

## What You'll See

### Main Catalog (/)
- List of canonical models
- Provider count per model
- Free availability
- Cheapest provider
- Quality and value scores (will be null until benchmarks added)
- Click any row to expand and see provider offers

### All Offers (/offers)
- Complete list of provider offers
- Pricing details
- Features and compatibility
- Last checked timestamps

### Admin Dashboard (/admin)
- Model and offer counts
- Recent refresh logs
- Quick action links

## Next Steps

### Add More Connectors

Edit `src/lib/connectors/index.ts` to add more providers.

### Add Benchmark Data

Implement benchmark connectors in Phase 2 or manually insert benchmark scores.

### Customize Pricing

Edit `src/lib/pricing/pricing.ts` to add manual pricing for providers without APIs.

### Run Worker Locally

```bash
npm run worker
```

This starts the pg-boss worker for scheduled refreshes.

### Deploy to Railway

See `DEPLOYMENT.md` for complete Railway deployment guide.

## Troubleshooting

### Database connection fails

- Verify PostgreSQL is running
- Check `DATABASE_URL` format
- Ensure database exists

### Seed script fails

- Check API keys are valid
- Verify internet connection
- Check connector logs for specific errors

### No models showing

- Run seed script: `npm run db:seed`
- Check refresh logs in admin panel
- Verify connectors are working

### Admin login fails

- Check `ADMIN_USERNAME` and `ADMIN_PASSWORD` in `.env`
- Clear browser cookies
- Restart dev server

## Common Commands

```bash
# Development
npm run dev              # Start Next.js dev server
npm run worker           # Start pg-boss worker

# Database
npm run db:generate      # Generate migrations
npm run db:migrate       # Run migrations
npm run db:seed          # Seed data
npm run db:studio        # Open Drizzle Studio

# Production
npm run build            # Build for production
npm start                # Start production server

# Quality
npm run lint             # Run ESLint
npm run type-check       # Check TypeScript types
```

## Project Structure Overview

```
src/
├── app/                 # Next.js pages
│   ├── page.tsx        # Main catalog
│   ├── offers/         # All offers view
│   └── admin/          # Admin panel
├── components/          # React components
├── lib/                 # Business logic
│   ├── connectors/     # Data sources
│   ├── ingestion/      # Data pipeline
│   ├── scoring/        # Calculations
│   └── auth/           # Authentication
└── jobs/               # Background worker
```

## Getting Help

- Read `README.md` for full documentation
- Check `ARCHITECTURE.md` for system design
- See `DEPLOYMENT.md` for Railway deployment
- Review `CONTRIBUTING.md` for development guidelines

## What's Next?

You now have a working FreeAIcode installation! 

Explore the code, add connectors, customize the UI, or deploy to Railway.

For Phase 2 features (benchmarks, filtering, exports), see the roadmap in `README.md`.
