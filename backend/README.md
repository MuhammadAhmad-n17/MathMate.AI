// README for Backend

# MathAI Backend

Modern mathematical problem solver backend built with Express.js, MongoDB, and SymPy.

## Project Structure

```
backend/
├── config/           # Configuration files
├── controllers/      # Route controllers
├── middleware/       # Custom middleware
├── models/          # MongoDB schemas
├── routes/          # API routes
├── services/        # Business logic
├── utils/           # Helper utilities
└── server.js        # Entry point
```

## Installation

```bash
cd backend
npm install
```

## Environment Setup

Create a `.env` file:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mathai
JWT_SECRET=your_secret_key
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=your_openai_key
MATHPIX_API_KEY=your_mathpix_key
CORS_ORIGIN=http://localhost:3000
```

## Running the Server

Development:

```bash
npm run dev
```

Production:

```bash
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout

### Solver

- `POST /api/solve/equation` - Solve math equation
- `GET /api/solve/:id` - Get solution by ID

### OCR

- `POST /api/ocr/upload` - Upload image
- `POST /api/ocr/extract` - Extract math from image

### Graphs

- `POST /api/graph/generate` - Generate graph
- `GET /api/graph/export/:id` - Export graph

### User

- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile

## Features

- Mathematical problem solving (algebra, calculus, linear algebra)
- Step-by-step solution generation
- Graph visualization (2D & 3D)
- Image recognition (OCR)
- LaTeX rendering and export
- PDF generation
- User authentication with JWT
- Rate limiting with Redis
- Real-time caching

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Cache**: Redis
- **Math Engine**: SymPy (Python)
- **Authentication**: JWT
- **OCR**: Tesseract.js

## Security

- Rate limiting on all endpoints
- Input validation and sanitization
- JWT-based authentication
- CORS protection
- Sandboxed solver execution

## Development

### Adding a new endpoint

1. Create controller in `controllers/`
2. Create route in `routes/`
3. Add service logic in `services/` if needed
4. Import route in `server.js`

### Database operations

Use Mongoose models in `models/` directory with proper schema validation.

## Deployment

### Render.com (Free)

1. Create account on Render
2. Connect GitHub repository
3. Set environment variables
4. Deploy

### Docker

```bash
docker build -t mathai-backend .
docker run -p 5000:5000 mathai-backend
```

## Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## License

MIT
