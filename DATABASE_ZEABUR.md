# Database Configuration for Zeabur Deployment

## PostgreSQL Database Setup on Zeabur

When deploying FollowTrain on Zeabur, you have two options for database setup:

### Option 1: Use Zeabur's Built-in PostgreSQL Service (Recommended)

1. In your Zeabur project, add a new service
2. Select "PostgreSQL" from the service templates
3. Configure the database with these settings:
   - Database name: `followtrain`
   - Username: `followtrain`
   - Password: (generate a secure password)
4. Once created, Zeabur will provide you with a `DATABASE_URL` environment variable

### Option 2: Use External PostgreSQL Provider

You can use any external PostgreSQL provider like:
- Supabase
- PlanetScale
- AWS RDS
- DigitalOcean PostgreSQL

## Environment Variables Required

Set these environment variables in your Zeabur backend service:

```
DATABASE_URL=postgresql://username:password@host:port/database
DATABASE_SSL_MODE=require  # For production databases
ALLOWED_ORIGINS=https://your-frontend-service.zeabur.app
```

## Database Schema

The application will automatically create the required tables on first startup. The schema includes:

```sql
CREATE TABLE IF NOT EXISTS trains (
  id VARCHAR(10) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  platform VARCHAR(50) NOT NULL,
  participants JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_trains_platform ON trains(platform);
CREATE INDEX IF NOT EXISTS idx_trains_created_at ON trains(created_at);
CREATE INDEX IF NOT EXISTS idx_trains_expires_at ON trains(expires_at);
```

## Connection Security

The application automatically handles SSL connections for production environments when:
- `DATABASE_SSL_MODE=require` is set, OR
- `NODE_ENV=production` and the DATABASE_URL doesn't contain localhost

For local development, SSL is disabled by default.