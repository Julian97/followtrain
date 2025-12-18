# FollowTrain

FollowTrain enables group social media following through coordinated 'trains'.

## Core Features
- Cross-platform social integration (Instagram, Twitter, LinkedIn, TikTok, Facebook, Telegram)
- Fallback mechanism using URL parsing when APIs are unavailable
- Real-time participant tracking
- Mobile-responsive React frontend
- Scalable Node.js API backend

## Quick Start

### Local Development
```bash
# Clone the repository
git clone https://github.com/Julian97/followtrain.git
cd followtrain

# Start services with Docker Compose
docker-compose up
```

Visit `http://localhost:3000` to access the application.

## Deployment

### Zeabur Deployment
For deployment instructions on Zeabur, see [ZEABUR_DEPLOYMENT.md](docs/ZEABUR_DEPLOYMENT.md).

### Environment Variables
See [.env.example](backend/.env.example) files in backend and frontend directories.

## Documentation
- [Zeabur Deployment Guide](docs/ZEABUR_DEPLOYMENT.md)
- [Database Configuration for Zeabur](docs/DATABASE_ZEABUR.md)
- [Original README](docs/README.md)

## Architecture
Decoupled frontend/backend with PostgreSQL persistence