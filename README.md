# FollowTrain

FollowTrain enables group social media following through coordinated 'trains'.

## 🤔 What is FollowTrain?

FollowTrain is a tool that helps groups of people follow the same social media accounts together. Whether you're a marketing team wanting to follow industry leaders, a book club tracking authors, or friends sharing interesting creators, FollowTrain makes coordinated following simple and organized.

## 👥 User Guide

If you're here to **use** FollowTrain:
- [📖 User Guide](docs/USER_GUIDE.md) - Learn how to create and join trains
- [🌐 Live Application](https://followtrain.zeabur.app) - Try it right now!

## 👨‍💻 Developer Guide

If you're here to **develop** or **deploy** FollowTrain:
- [🔧 Developer Guide](docs/DEVELOPER_GUIDE.md) - Technical documentation
- [🚀 Deployment Guide](docs/ZEABUR_DEPLOYMENT.md) - How to deploy on Zeabur
- [💾 Database Configuration](docs/DATABASE_ZEABUR.md) - Database setup instructions
- [キャッシング Redis Implementation](docs/REDIS_IMPLEMENTATION.md) - Caching with Redis

## 🚀 Quick Start (Developers)

### Local Development
```bash
# Clone the repository
git clone https://github.com/Julian97/followtrain.git
cd followtrain

# Start services with Docker Compose
docker-compose up
```

Visit `http://localhost:3000` to access the application.

### Tech Stack
- **Frontend**: React with TailwindCSS
- **Backend**: Node.js with Express
- **Database**: PostgreSQL
- **Caching**: Redis
- **Deployment**: Zeabur

## 📚 Documentation

All documentation is available in the [docs](docs/) directory:
- [User Guide](docs/USER_GUIDE.md)
- [Developer Guide](docs/DEVELOPER_GUIDE.md)
- [Zeabur Deployment Guide](docs/ZEABUR_DEPLOYMENT.md)
- [Database Configuration](docs/DATABASE_ZEABUR.md)
- [Redis Implementation](docs/REDIS_IMPLEMENTATION.md)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

- For user questions: Check the [User Guide](docs/USER_GUIDE.md)
- For technical issues: Check the [Developer Guide](docs/DEVELOPER_GUIDE.md)
- For bugs: Open an issue on GitHub
- For contributions: See the [Contributing Guidelines](docs/DEVELOPER_GUIDE.md#contributing)