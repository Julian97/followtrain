# FollowTrain Developer Guide

This guide provides technical documentation for developers who want to contribute to or deploy the FollowTrain project.

## Project Overview

FollowTrain is a full-stack web application built with modern technologies:

- **Frontend**: React with TailwindCSS
- **Backend**: Node.js with Express
- **Database**: PostgreSQL
- **Caching**: Redis
- **Deployment**: Zeabur (cloud platform)

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend       │    │   Services      │
│   (React)       │◄──►│   (Node.js)      │◄──►│  (PostgreSQL    │
│                 │    │                  │    │   & Redis)      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Key Components

1. **Frontend (React)**
   - Responsive UI with mobile support
   - Platform-specific icons and styling
   - Real-time participant display
   - Social media deep linking

2. **Backend (Node.js/Express)**
   - RESTful API endpoints
   - Social media API integrations
   - Database operations with PostgreSQL
   - Redis caching layer
   - Security middleware (CORS, Helmet, Rate Limiting)

3. **Database (PostgreSQL)**
   - Single table for train data
   - JSONB column for participant storage
   - Indexes for performance optimization

4. **Caching (Redis)**
   - Profile data caching (5-minute TTL)
   - Train data caching (1-hour TTL)
   - Statistics caching (10-minute TTL)

## API Endpoints

### Health Check
- `GET /api/health` - System health status

### Profile Data
- `GET /api/profile/:platform/:username` - Fetch social media profile data

### Train Management
- `POST /api/trains` - Create a new train
- `GET /api/trains/:trainId` - Get train by ID
- `PATCH /api/trains/:trainId` - Update train (add participants)
- `GET /api/stats` - Get platform statistics

## Environment Variables

### Backend Required
| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `3001` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:port/db` |
| `DATABASE_SSL_MODE` | SSL requirement | `require` |
| `REDIS_URL` | Redis connection string | `redis://host:port` |

### Backend Optional (Social Media APIs)
| Variable | Description |
|----------|-------------|
| `INSTAGRAM_ACCESS_TOKEN` | Instagram Basic Display API token |
| `TWITTER_BEARER_TOKEN` | Twitter API v2 Bearer token |
| `LINKEDIN_ACCESS_TOKEN` | LinkedIn API token |

### Frontend Required
| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API URL | `https://api.example.com` |

## Local Development Setup

### Prerequisites
- Node.js 18+
- Docker and Docker Compose
- PostgreSQL (via Docker)
- Redis (via Docker)

### Quick Start
```bash
# Clone the repository
git clone https://github.com/Julian97/followtrain.git
cd followtrain

# Start services with Docker Compose
docker-compose up

# The application will be available at:
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001
```

### Manual Setup
```bash
# Backend
cd backend
npm install
cp .env.example .env  # Edit with your values
npm run dev

# Frontend (in a new terminal)
cd frontend
npm install
npm start
```

## Project Structure

```
followtrain/
├── backend/
│   ├── server.js          # Main Express server
│   ├── redisClient.js     # Redis connection management
│   ├── cache.js           # Caching operations
│   ├── package.json       # Backend dependencies
│   └── zeabur.json        # Zeabur deployment config
├── frontend/
│   ├── src/
│   │   ├── App.js         # Main React component
│   │   └── index.js       # Entry point
│   ├── package.json       # Frontend dependencies
│   └── zeabur.json        # Zeabur deployment config
├── docs/
│   ├── USER_GUIDE.md      # User documentation
│   ├── DEVELOPER_GUIDE.md # This file
│   └── ...                # Other technical docs
├── docker-compose.yml     # Local development setup
└── README.md             # Main project README
```

## Database Schema

```sql
CREATE TABLE trains (
  id VARCHAR(10) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  platform VARCHAR(50) NOT NULL,
  participants JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_trains_platform ON trains(platform);
CREATE INDEX idx_trains_created_at ON trains(created_at);
CREATE INDEX idx_trains_expires_at ON trains(expires_at);
```

## Redis Cache Structure

- `profile:{platform}:{username}` - Social media profile data (5 min TTL)
- `train:{trainId}` - Train information (1 hour TTL)
- `stats:all` - Platform statistics (10 min TTL)

## Social Media Integrations

### Supported Platforms
1. Instagram (Basic Display API)
2. Twitter/X (API v2)
3. LinkedIn (Marketing APIs)
4. TikTok, Facebook, Telegram (URL parsing fallback)

### Fallback Mechanism
When API access is not available, the system uses:
- URL parsing to extract usernames
- Generated avatar placeholders
- Mock follower counts
- Generic profile information

## Deployment on Zeabur

### Services Required
1. **PostgreSQL Database**
2. **Redis Cache** (optional but recommended)
3. **Backend API** (Node.js service)
4. **Frontend Web** (Static site)

### Deployment Steps
1. Create a new Zeabur project
2. Add PostgreSQL service
3. Add Redis service (optional)
4. Deploy backend from Git repository
5. Deploy frontend from Git repository
6. Configure environment variables for each service
7. Set up custom domain if needed

### Environment Configuration
See [ZEABUR_DEPLOYMENT.md](ZEABUR_DEPLOYMENT.md) for detailed deployment instructions.

## Contributing

### Code Standards
- Follow RESTful API conventions
- Use camelCase for JSON fields
- Implement proper error handling
- Write clear, commented code
- Maintain consistent formatting

### Pull Request Process
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to your fork
5. Create a pull request with description

### Testing
- Ensure all existing tests pass
- Add new tests for new functionality
- Test across different browsers/devices
- Verify social media integrations work

## Troubleshooting

### Common Development Issues

**Database Connection Failed**
- Check DATABASE_URL in .env file
- Ensure PostgreSQL service is running
- Verify database credentials

**Redis Connection Failed**
- Check REDIS_URL in .env file
- Ensure Redis service is running
- Redis is optional; app works without it

**API Endpoints Not Found**
- Verify backend server is running
- Check PORT configuration
- Confirm CORS settings

**Build Failures**
- Ensure Node.js version is 18+
- Run `npm install` in both frontend and backend
- Check for missing environment variables

## Security Considerations

- Rate limiting to prevent abuse
- CORS configuration for frontend access
- Environment variable security
- Input validation and sanitization
- SSL/TLS for production deployments

## Performance Optimization

- Redis caching for frequently accessed data
- Database indexing for query performance
- Response compression with Helmet
- Efficient JSON serialization
- Connection pooling for database access

## License

This project is licensed under the MIT License - see the LICENSE file for details.