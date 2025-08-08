# Serena AI 

A modern dashboard for monitoring and analyzing AI agent call performance.

## Project Structure

```
dashboard/
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── api/         # API endpoints
│   │   ├── core/        # Core configurations
│   │   ├── schemas/     # Data models
│   │   └── services/    # Business logic
│   └── requirements.txt
├── backend_v1/          # Legacy TypeScript backend
├── frontend/            # Next.js frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/      # Next.js pages
│   │   ├── services/   # API services
│   │   └── styles/     # CSS styles
│   └── package.json
└── README.md
```

## Features

- Real-time call statistics
- Call volume visualization
- Detailed call history
- Performance metrics
- Appointment tracking
- Rating system

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a .env file:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_key
   ```

5. Run the server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a .env.local file:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## API Documentation

The API documentation is available at `http://localhost:8000/docs` when the backend server is running.

## Technologies Used

Backend:
- FastAPI
- Supabase
- Pydantic
- Python 3.9+

Frontend:
- Next.js
- React
- TypeScript
- Tailwind CSS
- Chart.js
- Heroicons

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 