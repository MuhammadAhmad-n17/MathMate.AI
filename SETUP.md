# MathAI Complete Setup Guide

## 📋 Prerequisites

Before starting, ensure you have:

- **Node.js** 16+ ([download](https://nodejs.org/))
- **MongoDB** ([local setup](https://docs.mongodb.com/manual/installation/) or [Atlas cloud](https://www.mongodb.com/cloud/atlas))
- **Redis** ([download](https://redis.io/download) or [cloud](https://redis.com/))
- **Python** 3.8+ ([download](https://www.python.org/))
- **Git** ([download](https://git-scm.com/))

## 🚀 Installation Steps

### Step 1: Clone & Navigate to Project

```bash
git clone https://github.com/yourusername/mathAI.git
cd mathAI
```

### Step 2: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

Edit `.env` with your configuration:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mathai
NODE_ENV=development
JWT_SECRET=your_super_secret_key_here
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=sk-...your_key...
MATHPIX_API_KEY=your_key...
CORS_ORIGIN=http://localhost:3000
```

Start the backend:

```bash
npm run dev
```

You should see: `MathAI Server running on port 5000`

### Step 3: Frontend Setup

Open a new terminal and:

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env.local

# Start development server
npm start
```

The app will open at `http://localhost:3000`

### Step 4: Verify Installation

1. **Backend Health**: Open [http://localhost:5000/api/health](http://localhost:5000/api/health)
   - Should see: `{"status":"MathAI Backend is running"}`

2. **Frontend**: [http://localhost:3000](http://localhost:3000)
   - Should load with 3D animations

3. **Try Solving**: Click "Launch Solver" and enter an equation

## 🐳 Docker Setup (Alternative)

If you have Docker installed:

```bash
# Build and run everything
docker-compose up

# Backend: http://localhost:5000
# Frontend: http://localhost:3000
# MongoDB: localhost:27017
# Redis: localhost:6379
```

## 📚 Database Setup

### MongoDB

**Local Setup:**

```bash
# Start MongoDB service
mongod
```

**Cloud Setup (MongoDB Atlas):**

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Create cluster
4. Get connection string
5. Add to `.env`: `MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mathai`

### Redis

**Local Setup:**

```bash
# On Windows (with chocolatey)
choco install redis

# On macOS
brew install redis
redis-server

# On Linux
sudo apt-get install redis-server
redis-server
```

**Cloud Setup:**

1. Go to [redis.com](https://redis.com/)
2. Create free tier database
3. Get connection URL
4. Add to `.env`

## 🔑 API Keys Setup

### OpenAI (for explanations)

1. Visit [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Create API key
3. Add to `.env`: `OPENAI_API_KEY=sk-...`

### Mathpix (for image OCR)

1. Visit [mathpix.com](https://mathpix.com/)
2. Sign up for free tier
3. Get API key
4. Add to `.env`: `MATHPIX_API_KEY=...`

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 🔧 Common Issues & Solutions

### Issue: MongoDB connection error

**Solution**: Ensure MongoDB is running

```bash
# Check status
mongod --version

# Start MongoDB (if not running)
mongod
```

### Issue: Redis connection refused

**Solution**: Start Redis server

```bash
redis-server
```

### Issue: Port 5000 already in use

**Solution**: Change port in `.env` and client code

```env
PORT=5001
```

### Issue: CORS errors

**Solution**: Ensure `CORS_ORIGIN` matches frontend URL

```env
CORS_ORIGIN=http://localhost:3000
```

### Issue: Cannot find module errors

**Solution**: Reinstall dependencies

```bash
rm -rf node_modules package-lock.json
npm install
```

## 📖 Project Structure

```
MathAI/
├── backend/
│   ├── config/           # Configuration
│   ├── controllers/       # Route handlers
│   ├── middleware/        # Custom middleware
│   ├── models/           # Database schemas
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── utils/            # Utilities
│   ├── server.js         # Entry point
│   └── package.json
│
├── frontend/
│   ├── public/           # Static files
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   ├── hooks/        # Custom hooks
│   │   ├── styles/       # Styles
│   │   ├── utils/        # Utilities
│   │   ├── App.jsx
│   │   └── index.jsx
│   └── package.json
│
├── docker-compose.yml    # Docker setup
├── .gitignore
└── README.md
```

## 🌐 Environment Variables Reference

### Backend (.env)

| Variable        | Description        | Example                          |
| --------------- | ------------------ | -------------------------------- |
| PORT            | Server port        | 5000                             |
| MONGODB_URI     | MongoDB connection | mongodb://localhost:27017/mathai |
| NODE_ENV        | Environment        | development                      |
| JWT_SECRET      | JWT signing key    | your_secret_key                  |
| REDIS_URL       | Redis connection   | redis://localhost:6379           |
| OPENAI_API_KEY  | OpenAI API key     | sk-...                           |
| MATHPIX_API_KEY | Mathpix API key    | ...                              |
| CORS_ORIGIN     | Allowed origin     | http://localhost:3000            |

### Frontend (.env.local)

| Variable          | Description     | Example                   |
| ----------------- | --------------- | ------------------------- |
| REACT_APP_API_URL | Backend API URL | http://localhost:5000/api |

## 📋 Useful Commands

```bash
# Start both frontend and backend
cd backend && npm run dev &
cd frontend && npm start

# View logs
npm run dev -- --inspect

# Clean install
rm -rf node_modules package-lock.json && npm install

# Production build (frontend)
npm run build

# Production build (backend)
npm install --production
NODE_ENV=production node server.js
```

## 🚀 Deployment

See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for:

- Deploying to Render.com
- Deploying to Vercel
- Docker deployment
- AWS/Azure deployment

## 📞 Support

- **Discord**: [Join Community](#)
- **Email**: support@mathai.dev
- **GitHub Issues**: [Report Bug](#)
- **Documentation**: Check `/docs` folder

## 🎓 Next Steps

1. **Explore the code** - Understand the architecture
2. **Try the solver** - Test different math problems
3. **Customize** - Add your own features
4. **Deploy** - Share with the world
5. **Contribute** - Submit improvements

Happy solving! 🧮✨
