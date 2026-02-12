#!/bin/bash

echo "🚀 TaskMaster Setup Script"
echo "=========================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
echo ""
echo "Installing backend dependencies..."
npm install

echo ""
echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo ""
echo "✅ All dependencies installed!"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  Warning: .env file not found!"
    echo "Please create .env file with your MongoDB and other settings."
    echo "See .env file created in the root directory for template."
else
    echo "✅ .env file found"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the application:"
echo "  npm run dev-all    - Start both backend and frontend"
echo "  npm run dev        - Start backend only"
echo "  npm run client     - Start frontend only"
echo ""
echo "Backend will run on: http://localhost:5000"
echo "Frontend will run on: http://localhost:3000"
echo ""
echo "Happy coding! 🚀"
