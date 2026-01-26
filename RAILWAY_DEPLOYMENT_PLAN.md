# Railway Deployment Plan for BIA MiniMax

## Overview

This plan outlines the deployment of the BIA MiniMax application to Railway, a cloud platform for deploying applications. The application consists of multiple services that need to be deployed and configured properly.

## Architecture Overview

### Current Services

1. **Frontend (React/Vite)** - Main application UI
2. **Node.js API Server** - Express.js server with Prisma ORM
3. **.NET Core API** - C# backend with Dapper ORM
4. **PostgreSQL Database** - Primary data store
5. **BIA Tool** - Additional frontend application

### Railway Services Needed

- **Database Service**: PostgreSQL
- **Backend Service**: Node.js API Server
- **Frontend Service**: React Application
- **.NET Service**: C# API (if needed)
- **BIA Tool Service**: Additional frontend (optional)

## Deployment Steps

### Phase 1: Database Setup

#### 1.1 Create PostgreSQL Database

```bash
# Railway will provide DATABASE_URL automatically
# No manual creation needed - Railway handles this
```

#### 1.2 Database Configuration

- Railway provides `DATABASE_URL` environment variable
- Update connection strings in all services
- Enable Row Level Security (RLS) for multi-tenancy

#### 1.3 Database Migration

```bash
# Run Prisma migrations
npx prisma migrate deploy
npx prisma generate
```

### Phase 2: Backend Services

#### 2.1 Node.js API Server

**Railway Configuration:**

- **Service Type**: Node.js
- **Build Command**: `npm run build`
- **Start Command**: `npm run server`
- **Port**: 3001 (Railway auto-detects)

**Environment Variables:**

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
NODE_ENV=production
PORT=3001
SESSION_SECRET=your-secure-secret
CORS_ORIGIN=${{Frontend.RAILWAY_STATIC_URL}}
```

**Railway.json:**

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run server",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

#### 2.2 .NET Core API (Optional)

**Railway Configuration:**

- **Service Type**: .NET Core
- **Build Command**: `dotnet publish -c Release`
- **Start Command**: `dotnet Nexus.BCMS.Core.dll`
- **Port**: 5000

**Environment Variables:**

```env
ConnectionStrings__DefaultConnection=${{Postgres.DATABASE_URL}}
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://0.0.0.0:5000
```

### Phase 3: Frontend Deployment

#### 3.1 Main React Application

**Railway Configuration:**

- **Service Type**: Static Site
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`
- **Build Environment**: Node.js

**Environment Variables:**

```env
VITE_API_URL=${{Backend.RAILWAY_STATIC_URL}}
VITE_NODE_ENV=production
```

**Railway.json:**

```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run build"
  },
  "deploy": {
    "healthcheckPath": "/",
    "healthcheckTimeout": 300
  }
}
```

#### 3.2 BIA Tool (Optional)

**Railway Configuration:**

- **Service Type**: Static Site
- **Build Command**: `cd bia-tool && npm install && npm run build`
- **Publish Directory**: `bia-tool/dist`

### Phase 4: Service Configuration

#### 4.1 Environment Variables Setup

Create a shared environment group for common variables:

```env
# Database
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Application
NODE_ENV=production
SESSION_SECRET=your-secure-random-string

# CORS
CORS_ORIGIN=${{Frontend.RAILWAY_STATIC_URL}}

# API URLs
VITE_API_URL=${{Backend.RAILWAY_STATIC_URL}}
VITE_DOTNET_API_URL=${{DotnetBackend.RAILWAY_STATIC_URL}}
```

#### 4.2 Service Dependencies

Configure service dependencies in Railway:

- Backend depends on Database
- Frontend depends on Backend
- .NET service depends on Database

#### 4.3 Health Checks

Implement health check endpoints:

- `/api/health` for Node.js backend
- `/health` for .NET backend
- `/` for frontend

### Phase 5: Database Setup & Migration

#### 5.1 Prisma Configuration

Update `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

#### 5.2 Migration Strategy

```bash
# In Railway build process
npx prisma generate
npx prisma migrate deploy
npm run seed  # If needed for initial data
```

#### 5.3 RLS Setup

Ensure Row Level Security is properly configured:

```sql
-- Enable RLS on tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
-- Add policies as needed
```

### Phase 6: Build & Deployment Process

#### 6.1 Build Pipeline

1. **Database**: Auto-provisioned by Railway
2. **Backend**: Build Node.js app, run migrations
3. **Frontend**: Build React app with API URLs
4. **.NET**: Build and publish .NET app

#### 6.2 Deployment Order

1. Deploy Database
2. Deploy Backend services
3. Deploy Frontend
4. Run health checks
5. Enable traffic

#### 6.3 Rollback Strategy

- Keep previous deployment active during new deployment
- Use Railway's rollback feature if issues occur
- Monitor health checks during deployment

### Phase 7: Monitoring & Maintenance

#### 7.1 Logging

- Railway provides built-in logging
- Configure log levels appropriately
- Set up alerts for errors

#### 7.2 Monitoring

- Use Railway's metrics dashboard
- Monitor response times and error rates
- Set up uptime monitoring

#### 7.3 Backups

- Railway handles automated database backups
- Configure backup retention policies
- Test backup restoration

### Phase 8: Security Configuration

#### 8.1 Environment Security

- Use Railway's secret management
- Never commit secrets to code
- Rotate secrets regularly

#### 8.2 Network Security

- Configure proper CORS settings
- Use HTTPS (Railway provides automatically)
- Set up proper firewall rules

#### 8.3 Data Security

- Ensure RLS is properly configured
- Use parameterized queries
- Implement proper authentication

## Migration Checklist

### Pre-Deployment

- [ ] Test application locally with production-like settings
- [ ] Update all API URLs to use environment variables
- [ ] Ensure all services can communicate properly
- [ ] Test database migrations
- [ ] Verify health check endpoints work

### Deployment

- [ ] Create Railway project
- [ ] Set up PostgreSQL database
- [ ] Deploy backend services
- [ ] Deploy frontend
- [ ] Configure environment variables
- [ ] Test all endpoints
- [ ] Verify data flows correctly

### Post-Deployment

- [ ] Monitor application performance
- [ ] Set up monitoring and alerts
- [ ] Configure backup policies
- [ ] Document deployment process
- [ ] Train team on Railway usage

## Cost Estimation

### Railway Pricing (as of 2024)

- **Hobby Plan**: $5/month (1GB RAM, 512MB disk)
- **Pro Plan**: $10/month (4GB RAM, 16GB disk)
- **Database**: $5-15/month depending on size

### Estimated Monthly Cost

- Database: $10/month
- Backend API: $10/month
- Frontend: $5/month
- .NET API (if used): $10/month
- **Total**: ~$35-45/month

## Alternative Architecture Considerations

### Option 1: Monolithic Deployment

- Deploy only Node.js backend + Frontend
- Remove .NET dependency
- Simpler but less flexible

### Option 2: Microservices

- Deploy each service separately
- Better scalability but more complex
- Higher cost

### Option 3: Serverless

- Use Railway's serverless functions
- Lower cost for sporadic usage
- May require code changes

## Next Steps

1. **Choose Architecture**: Decide between monolithic vs microservices
2. **Test Locally**: Ensure all services work with production-like config
3. **Create Railway Account**: Set up billing and project
4. **Deploy Database**: Start with PostgreSQL setup
5. **Deploy Services**: Follow the phased approach
6. **Test Integration**: Verify all services communicate properly
7. **Go Live**: Enable production traffic

## Support & Documentation

- **Railway Docs**: https://docs.railway.app/
- **Prisma Railway Guide**: https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-railway
- **.NET Railway Guide**: https://docs.railway.app/deploy/dotnet

## Risk Mitigation

- **Data Loss**: Regular backups, test restores
- **Downtime**: Blue-green deployments, health checks
- **Performance**: Monitor metrics, scale as needed
- **Security**: Regular updates, proper configuration
