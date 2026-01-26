# Quick Railway Deployment Guide

## Prerequisites

- Railway account (https://railway.app)
- GitHub repository with your code
- Railway CLI installed: `npm install -g @railway/cli`

## Step 1: Setup Railway Project

```bash
# Login to Railway
railway login

# Create new project
railway init bia-minimax

# Link to existing project (if created via web)
railway link
```

## Step 2: Add Database

```bash
# Add PostgreSQL database
railway add postgres
```

## Step 3: Set Environment Variables

```bash
# Set production environment
railway variables set NODE_ENV=production
railway variables set PORT=3001

# Generate secure session secret
railway variables set SESSION_SECRET=$(openssl rand -base64 32)
```

## Step 4: Deploy

1. **Connect GitHub**: Go to Railway dashboard → Connect GitHub
2. **Select Repository**: Choose your BIA MiniMax repository
3. **Auto-deploy**: Railway will automatically build and deploy on pushes

## Step 5: Configure CORS

After deployment, set the CORS origin:

```bash
# Replace YOUR_FRONTEND_URL with your Railway frontend URL
railway variables set CORS_ORIGIN=https://bia-minimax-production.up.railway.app
```

## Step 6: Run Database Migrations

```bash
# Connect to Railway shell
railway shell

# Run Prisma migrations
npx prisma migrate deploy
npx prisma generate
```

## Step 7: Verify Deployment

- Check Railway dashboard for service status
- Visit your application URL
- Check `/api/health` endpoint for backend status

## Troubleshooting

### Common Issues

1. **Build Failures**: Check Railway logs with `railway logs`
2. **Database Connection**: Verify `DATABASE_URL` is set correctly
3. **CORS Issues**: Ensure `CORS_ORIGIN` matches your frontend URL
4. **Migrations**: Run migrations manually if auto-deploy fails

### Useful Commands

```bash
# View logs
railway logs

# Access shell
railway shell

# View environment variables
railway variables

# View domains
railway domains
```

## Architecture Notes

- **Backend**: Node.js/Express on port 3001
- **Database**: PostgreSQL (Railway managed)
- **Frontend**: Static site served by Railway
- **Health Check**: Available at `/api/health`

## Cost Estimate

- Database: ~$10/month
- Backend: ~$10/month
- Frontend: ~$5/month
- **Total**: ~$25/month

## Next Steps

1. Test all features in production
2. Set up monitoring and alerts
3. Configure backup policies
4. Document any custom configurations
