#!/bin/bash
# MathAI Quick Start Script for macOS/Linux

echo ""
echo "============================================"
echo "  MathAI - Quick Start"
echo "============================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed"
    echo "Download from https://nodejs.org/"
    exit 1
fi

echo "Node.js detected:"
node --version

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "ERROR: npm is not installed"
    exit 1
fi

echo "npm version:"
npm --version

echo ""
echo "Installing dependencies..."
echo ""

# Install root dependencies
echo "Installing root dependencies..."
npm install

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend || exit
npm install
cd ..

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend || exit
npm install
cd ..

echo ""
echo "============================================"
echo "  Setup Complete!"
echo "============================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Configure environment variables:"
echo "   - Copy backend/.env.example to backend/.env"
echo "   - Add your API keys"
echo ""
echo "2. Start services:"
echo "   - Run: npm run dev"
echo ""
echo "3. Open browser:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend: http://localhost:5000"
echo ""
echo "4. Try the solver:"
echo "   - Click 'Launch Solver'"
echo "   - Enter an equation"
echo ""
echo "For more info, see SETUP.md"
echo ""
