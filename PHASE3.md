# Phase 3: Backend Skeleton + Data Persistence

**Status**: In Progress  
**Weeks**: 5-6

---

## Deliverables

### ✅ Database Models (SQLAlchemy Async)
- **File**: `backend/app/db/models.py`
- Tables: `Strategy`, `Trade`, `Position`, `OptimizerRun`, `NewsEvent`
- JSON columns for flexible parameters & metrics
- Proper Enum types for status, side, risk level
- Relationships defined (`Strategy.trades`, `Strategy.positions`)

### ✅ Database Connection
- **File**: `backend/app/db/database.py`
- Async SQLAlchemy engine with `create_async_engine`
- Session factory with `async_sessionmaker`
- FastAPI `get_db()` dependency generator
- Connection pool settings (size=5, overflow=10, pre_ping)

### ✅ Alembic Migrations
- **Files**: `backend/alembic.ini`, `backend/alembic/env.py`
- Auto-generated migration script at `0001_initial.py`
- Offline and online migration support
- Drops tables in reverse order on downgrade

### ✅ Dual-Mode API Routes
- **File**: `backend/app/api/routes.py`
- `USE_MOCK` environment variable toggles mode
- **Mock** (default): Returns `generate_mock_*()` data
- **Database**: Attempts `async with async_session()` fetch, falls back to mock on error
- All endpoints: `/strategies`, `/positions/current`, `/news/upcoming`, `/dashboard/summary`, `/optimizer/start`

### ✅ Frontend API Client
- **File**: `frontend/app/lib/api.ts`
- `fetchJSON<T>()` helper with fallbacks
- `getStrategies()`, `getCurrentPositions()`, `getRecentTrades()`, etc.
- Falls back to mock data when API is unavailable
- `generateMock*` re-exported for sync fallback

### ✅ API Context (React)
- **File**: `frontend/app/hooks/useApi.ts`
- `ApiProvider` loads all data in parallel
- `useApi()` hook returns typed data + loading/error states
- `refreshData()` for manual refetching

### ✅ Backend Health + Version
- Root `/` shows version, mode (mock/db)
- Health check `/health` shows DB status

---

## Files Created / Modified

| File | Description |
|------|-------------|
| `backend/app/db/database.py` | Async DB engine, session factory, `get_db()` |
| `backend/app/db/models.py` | SQLAlchemy declarative models for all tables |
| `backend/alembic.ini` | Alembic configuration |
| `backend/alembic/env.py` | Migration environment |
| `backend/alembic/versions/0001_initial.py` | Initial schema migration |
| `backend/app/api/routes.py` | Dual-mode REST routes (mock DB) |
| `backend/main.py` | Updated to v2.0.0, shows mode |
| `frontend/app/lib/api.ts` | API client with fallback to mock |
| `frontend/app/hooks/useApi.ts` | React context for API data |
| `frontend/app/dashboard/page.tsx` | Cleaned up (removed dead News/Optimizer rows) |

---

## Build Status

```
✓ FastAPI backend starts successfully (port 8000)
✓ All 12 frontend pages compile (no errors)
✓ Dual-mode API: mock data default, real DB when available
✓ Frontend API client with graceful fallback
```

---

## Next: Complete Phase 3

To switch from mock data to real database:

1. **Start PostgreSQL** (via Docker Compose):
   ```bash
   docker-compose up -d db
   ```

2. **Run migrations**:
   ```bash
   cd backend && alembic upgrade head
   ```

3. **Start backend in DB mode**:
   ```bash
   USE_MOCK=false python -m uvicorn main:app --reload
   ```

4. **Frontend fetches from real API** — no code changes needed (fallback to mock if API unavailable)

---

## Remaining for Full Phase 3

| # | Feature | Status |
|---|---------|--------|
| 17 | WebSocket handlers (positions/trades stream) | Pending |
| 18 | Seed script to populate DB with mock data | Pending |
| 19 | Integration tests (pytest + httpx) | Pending |
| 20 | Update docker-compose for TimescaleDB | Existing |
| 21 | Swagger UI docs already auto-generated | Complete |

