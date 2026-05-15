# Self-Optimizing Algorithmic Trading Platform

## Overview

QuantumTrade is a self-optimizing algorithmic trading platform with NinjaTrader 8 integration, built with Next.js 15, FastAPI, PostgreSQL + TimescaleDB, Optuna, Celery, Redis, and Docker.

## Phase 1 Deliverables (Complete)

- ✅ Monorepo structure (frontend/ and backend/)
- ✅ Docker Compose dev stack (PostgreSQL, TimescaleDB, Redis, FastAPI, Next.js, Celery)
- ✅ Landing page with cinematic animations and value proposition
- ✅ Dashboard layout with sidebar, header, and main content area
- ✅ TypeScript types and mock data generators
- ✅ KPI cards with real-time-like stats
- ✅ Equity curve chart with 90 days of mock data
- ✅ Strategy performance grid with sortable table
- ✅ Live positions panel with mock real-time updates
- ✅ FastAPI backend skeleton with CORS and health endpoints
- ✅ Placeholder pages for all dashboard sub-routes

## Architecture

```
AutomatedTrading/
├── docker-compose.yml        # Docker dev stack
├── package.json              # Root package.json
├── frontend/                 # Next.js 15 + React 19 + Tailwind CSS
│   ├── app/
│   │   ├── components/       # Reusable components
│   │   ├── types/            # TypeScript type definitions
│   │   ├── lib/              # Mock data generators
│   │   ├── dashboard/        # Dashboard pages
│   │   └── page.tsx          # Landing page
│   └── Dockerfile
└── backend/                  # FastAPI Python backend
    ├── main.py               # Main FastAPI app
    ├── app/
    │   ├── api/              # API routes
    │   ├── models/           # Pydantic schemas
    │   └── utils/            # Utilities & mock data
    ├── requirements.txt
    └── Dockerfile
```

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 20+ (for local frontend dev)
- Python 3.11+ (for local backend dev)

### 1. Clone & Navigate

```bash
cd AutomatedTrading
```

### 2. Start Docker Stack

```bash
docker-compose up --build
```

Services will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Database**: localhost:5432
- **Redis**: localhost:6379

### 3. Run Frontend Locally

```bash
cd frontend
npm install
npm run dev
```

### 4. Run Backend Locally

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Root - API info |
| GET | `/health` | Health check |
| GET | `/api/strategies` | List all strategies |
| GET | `/api/positions/current` | Current open positions |
| GET | `/api/news/upcoming` | Upcoming news events |
| GET | `/api/dashboard/summary` | Dashboard summary |
| POST | `/api/optimizer/start` | Start optimizer |

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS, Recharts, Framer Motion |
| Backend | FastAPI, Python 3.11, Pydantic |
| Database | PostgreSQL 15 + TimescaleDB |
| Cache | Redis 7 |
| Task Queue | Celery |
| DevOps | Docker, Docker Compose |

## Phase 2+ Roadmap

- **Phase 2**: Dashboard subsystems (live positions, trade feed, news ticker, optimizer progress)
- **Phase 3**: Backend skeleton + real data persistence
- **Phase 4**: Optimizer engine (Optuna, backtesting, walk-forward)
- **Phase 5**: NinjaTrader 8 integration
- **Phase 6**: Risk engine (news monitoring, drawdown protection)
- **Phase 7**: Monitoring & reporting (Discord bot)
- **Phase 8**: Production hardening

## License

Private - For personal trading use only.
