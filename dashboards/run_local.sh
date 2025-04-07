#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Setting up Python backend...${NC}"

# Setup backend
cd backend
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate # On Windows, use: venv\Scripts\activate

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Run backend in background
echo "Starting backend server..."
uvicorn app.main:app --reload --port 8000 &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

echo -e "${BLUE}Setting up Frontend...${NC}"

# Setup frontend
cd ../frontend

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
npm install

# Start frontend development server
echo "Starting frontend server..."
npm run dev &
FRONTEND_PID=$!

echo -e "${GREEN}Application is running!${NC}"
echo "Backend is running on http://localhost:8000"
echo "Frontend is running on http://localhost:3000"
echo "API documentation is available at http://localhost:8000/docs"
echo -e "${BLUE}Press Ctrl+C to stop both servers${NC}"

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" SIGINT
wait 