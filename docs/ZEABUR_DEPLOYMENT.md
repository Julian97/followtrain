# FollowTrain Deployment Guide for Zeabur

This guide explains how to deploy the FollowTrain application on Zeabur, a modern cloud deployment platform.

## 🚀 Deployment Architecture

FollowTrain consists of four main components that need to be deployed:
1. **Frontend** - React application (Port 3000)
2. **Backend** - Node.js API server (Port 3001)
3. **Database** - PostgreSQL database
4. **Cache** - Redis cache (Optional but recommended)

## 📋 Prerequisites

1. A Zeabur account (sign up at [zeabur.com](https://zeabur.com))
2. Social media API keys (optional but recommended)
3. A GitHub repository with the FollowTrain code

## 🔧 Step-by-Step Deployment

### Phase 1: Database Setup

1. Log in to your Zeabur dashboard
2. Create a new project or select an existing one
3. Click "Add Service" and select "PostgreSQL"
4. Configure the database:
   - Name: `followtrain-db`
   - Version: 15
   - Plan: Free or Paid based on your needs
5. Once deployed, note the `DATABASE_URL` from the service environment variables

### Phase 2: Redis Cache Setup (Optional but Recommended)

1. In your Zeabur project, click "Add Service"
2. Select "Redis" from the service templates
3. Configure the Redis service:
   - Name: `followtrain-redis`
   - Version: 6.2 or later
   - Plan: Free or Paid based on your needs
4. Once deployed, Zeabur will automatically inject the `REDIS_CONNECTION_STRING` environment variable to services that reference it

### Phase 3: Backend Deployment

1. In your Zeabur project, click "Add Service"
2. Select "Git Repository" and connect your GitHub account
3. Choose the FollowTrain repository
4. Select the branch to deploy (usually `main` or `master`)
5. Zeabur will auto-detect this as a Node.js project
6. Set these environment variables in the service settings:
   ```
   NODE_ENV=production
   PORT=3001
   DATABASE_URL=<your_database_url_from_step_1>
   DATABASE_SSL_MODE=require
   INSTAGRAM_ACCESS_TOKEN=<your_token>
   TWITTER_BEARER_TOKEN=<your_token>
   LINKEDIN_ACCESS_TOKEN=<your_token>
   ALLOWED_ORIGINS=https://<your-frontend-service>.zeabur.app
   ```
7. Click "Deploy" and wait for the build to complete

### Phase 4: Frontend Deployment

1. In your Zeabur project, click "Add Service"
2. Select "Git Repository" and connect your GitHub account
3. Choose the FollowTrain repository
4. Select the branch to deploy (usually `main` or `master`)
5. Zeabur will auto-detect this as a Node.js project
6. In the build settings, specify:
   - Build command: `npm ci && npm run build`
   - Output directory: `build`
7. Set these environment variables in the service settings:
   ```
   NODE_ENV=production
   REACT_APP_API_URL=https://<your-backend-service>.zeabur.app
   ```
8. Click "Deploy" and wait for the build to complete

## ⚙️ Environment Variables

### Backend Required Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `3001` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:port/db` |
| `DATABASE_SSL_MODE` | SSL requirement | `require` |
| `REDIS_URL` | Redis connection string | `${REDIS_CONNECTION_STRING}` |

### Backend Optional Variables (Social Media APIs)
| Variable | Description |
|----------|-------------|
| `INSTAGRAM_ACCESS_TOKEN` | Instagram Basic Display API token |
| `TWITTER_BEARER_TOKEN` | Twitter API v2 Bearer token |
| `LINKEDIN_ACCESS_TOKEN` | LinkedIn API token |

### Frontend Required Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API URL | `https://your-backend.zeabur.app` |

## Redis Caching

Redis caching is enabled automatically when the `REDIS_URL` environment variable is set. This provides significant performance improvements by caching:

- Social media profile data (5-minute TTL)
- Train data (1-hour TTL)
- Statistics data (10-minute TTL)

For more details about the Redis implementation, see [Redis Implementation](REDIS_IMPLEMENTATION.md).

## 🔁 CI/CD with Zeabur

Zeabur automatically redeploys your services when you push to your connected GitHub repository. To set up:

1. Ensure your GitHub repository is connected to Zeabur
2. Push changes to your main branch
3. Zeabur will automatically detect changes and redeploy

## 💰 Zeabur Pricing

Zeabur uses a pay-as-you-go model:
- **Free Tier**: Limited resources but good for testing
- **Paid Plans**: Based on actual resource usage

Typical costs for a production FollowTrain deployment:
- Frontend: $0-5/month
- Backend: $5-10/month
- Database: $0-15/month
- Total: $5-30/month depending on usage

## 🔧 Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure `ALLOWED_ORIGINS` is set correctly in backend
2. **Database Connection**: Verify `DATABASE_URL` and `DATABASE_SSL_MODE` are correct
3. **API Not Found**: Check that `REACT_APP_API_URL` points to the correct backend service
4. **Build Failures**: Check build logs in Zeabur dashboard

### Support Resources

- [Zeabur Documentation](https://zeabur.com/docs)
- [Zeabur Community](https://discord.gg/zeabur)
- FollowTrain GitHub Issues

## 🔄 Migration from Other Platforms

### From Railway
1. Export your Railway PostgreSQL database
2. Follow the deployment steps above
3. Import your database dump to the new Zeabur PostgreSQL service

### From Vercel + Other Backend
1. Redeploy both frontend and backend using the steps above
2. Update any custom domains to point to your new Zeabur services

## 🎉 You're Ready!

With this setup, you'll have:
- ✅ Production-ready deployment on Zeabur
- ✅ Automatic SSL certificates
- ✅ Scalable architecture
- ✅ Pay-as-you-go pricing
- ✅ Integrated CI/CD
- ✅ Social media integrations

Estimated time to deploy: 15-30 minutes for first-time setup