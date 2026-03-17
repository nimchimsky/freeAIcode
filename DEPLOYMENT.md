# Railway Deployment Guide

This guide walks through deploying FreeAIcode to Railway with the multi-service architecture.

## Prerequisites

1. Railway account (https://railway.app)
2. GitHub repository with this code
3. API keys for connectors (OpenRouter, Gemini, etc.)

## Step 1: Create Railway Project

1. Log in to Railway
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect your GitHub account and select the FreeAIcode repository

## Step 2: Add PostgreSQL Database

1. In your Railway project, click "New"
2. Select "Database" → "PostgreSQL"
3. Railway will provision a PostgreSQL instance
4. The `DATABASE_URL` will be automatically available to your services

## Step 3: Create Web Service

1. Click "New" → "GitHub Repo"
2. Select your FreeAIcode repository
3. Railway will detect the repository and create a service
4. Configure the service:
   - Name: `web`
   - Start Command: Leave empty (uses Procfile)
   - Root Directory: Leave empty
5. Add environment variables (see below)
6. Deploy

## Step 4: Create Worker Service

1. Click "New" → "GitHub Repo"
2. Select the same FreeAIcode repository
3. Configure the service:
   - Name: `worker`
   - Start Command: `npm run worker`
   - Root Directory: Leave empty
4. Add the same environment variables as web service
5. Deploy

## Step 5: Configure Environment Variables

Add these variables to BOTH services (web and worker):

### Required Variables

```
DATABASE_URL=${{Postgres.DATABASE_URL}}
APP_URL=https://your-app.up.railway.app
NODE_ENV=production
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password-here
```

### API Keys (add the ones you have)

```
OPENROUTER_API_KEY=sk-or-v1-...
GEMINI_API_KEY=...
KILO_API_KEY=...
```

### Optional Variables

```
LOG_LEVEL=info
CRON_SECRET=random-secret-string
BENCHMARK_IMPORT_TOKEN=token-for-uploads
```

Note: `DATABASE_URL` uses Railway's variable reference syntax to automatically use the PostgreSQL connection string.

## Step 6: Configure Custom Domain (Optional)

1. Go to the web service settings
2. Click "Settings" → "Domains"
3. Click "Generate Domain" for a Railway subdomain
4. Or add your custom domain
5. Update `APP_URL` environment variable with your domain

## Step 7: Initial Data Seed

After both services are deployed and running:

1. Go to the web service
2. Click on "Deployments" tab
3. Find the latest successful deployment
4. Click the three dots → "View Logs"
5. In a separate terminal, connect to your Railway project:

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Run seed command
railway run npm run db:seed
```

Alternatively, you can add a one-time job:

1. Create a new service from the same repo
2. Set start command to: `npm run db:seed`
3. Let it run once
4. Delete the service after completion

## Step 8: Verify Deployment

1. Visit your web service URL
2. You should see the catalog (may be empty until seed runs)
3. Visit `/admin/login` and log in with your admin credentials
4. Check the admin dashboard for statistics
5. Verify the worker is running by checking worker service logs

## Monitoring

### Web Service Logs

- View HTTP requests
- Next.js build output
- Application errors

### Worker Service Logs

- pg-boss startup
- Scheduled job execution
- Connector refresh logs

### Database

- Use Railway's PostgreSQL dashboard
- Or connect with a database client using the connection string

## Troubleshooting

### Services won't start

- Check environment variables are set correctly
- Verify `DATABASE_URL` is accessible
- Check build logs for errors

### Database migrations fail

- Ensure PostgreSQL service is running
- Check `DATABASE_URL` format
- Verify network connectivity between services

### Worker not executing jobs

- Check worker service logs
- Verify pg-boss tables were created
- Ensure `DATABASE_URL` is correct

### Seed script fails

- Check API keys are valid
- Verify network access to external APIs
- Check connector logs for specific errors

## Updating the Application

Railway automatically deploys when you push to your connected branch:

1. Push changes to GitHub
2. Railway detects the push
3. Both services rebuild and redeploy automatically
4. Database migrations run automatically (via Procfile)

## Scaling

### Web Service

- Railway automatically scales based on traffic
- Configure in Settings → Resources

### Worker Service

- Typically runs as a single instance
- pg-boss handles job distribution
- Can scale horizontally if needed

### Database

- Upgrade PostgreSQL plan in Railway dashboard
- Monitor connection pool usage
- Consider read replicas for high traffic

## Cost Optimization

1. Use Railway's free tier for development
2. Monitor resource usage in dashboard
3. Optimize database queries
4. Cache connector responses (already implemented)
5. Adjust worker schedule frequency if needed

## Security Checklist

- [ ] Strong `ADMIN_PASSWORD` set
- [ ] API keys stored as environment variables
- [ ] `NODE_ENV=production` set
- [ ] HTTPS enabled (automatic with Railway)
- [ ] Database not publicly accessible
- [ ] Admin routes protected by middleware

## Backup Strategy

Railway provides automatic PostgreSQL backups:

1. Go to PostgreSQL service
2. Click "Backups" tab
3. Configure backup retention
4. Test restore procedure

## Support

- Railway Documentation: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Project Issues: GitHub repository issues

## Next Steps

After successful deployment:

1. Run the seed script to populate initial data
2. Test the catalog view
3. Verify admin panel access
4. Monitor worker job execution
5. Set up alerts for errors (Railway provides this)
6. Consider adding custom domain
7. Plan Phase 2 features
