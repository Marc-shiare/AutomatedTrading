# Self-Optimizing Algorithmic Trading Platform
## Complete Architecture & Execution Roadmap

**Version:** 1.0  
**Date:** 2026-05-12  
**Status:** Final — Ready for Development  

---

## EXECUTIVE ONE-PAGER

| | |
|:---|:---|
| **Project** | Self-Optimizing Algorithmic Trading Platform + NinjaTrader 8 Integration |
| **Tech Stack** | Next.js 15, FastAPI, PostgreSQL + TimescaleDB, Optuna, Celery, Redis, Docker |
| **Timeline** | 30 weeks (solo developer), 8 phases |
| **MVP (Week 4)** | Cinematic dashboard with mock data, responsive, 60fps animations |
| **Full System (Week 16)** | Optimizer engine, NT8 integration, risk engine, Discord reporting |
| **Critical Path** | Optimizer engine (Phase 4) is the bottleneck; reduce parameter space aggressively if runtime exceeds 24 hours |
| **Highest Risk** | NinjaTrader integration brittleness and optimizer runtime |
| **First Move** | Spin up monorepo, deploy landing page, build dashboard layout by Week 2 |

---

## 1. MOCK DATA SCHEMA (Build UI First Non-Negotiable)

These JSON structures are the foundation of the entire frontend. Define them before writing any UI code.

### 1.1 Strategy Optimization Result
```json
{
  "id": "strategy_momentum_001",
  "name": "Momentum Breakout (10min)",
  "symbol": "EURUSD",
  "optimization_date": "2024-01-07T18:00:00Z",
  "parameters": {
    "fast_ma": 12,
    "slow_ma": 26,
    "rsi_threshold": 65,
    "stop_loss_pips": 25,
    "risk_per_trade": 2.0
  },
  "backtest_metrics": {
    "total_trades": 145,
    "win_rate": 0.62,
    "profit_factor": 2.15,
    "max_drawdown": 0.18,
    "sharpe_ratio": 1.84,
    "return_percent": 34.5
  },
  "composite_score": 1.76,
  "status": "ready_for_deployment",
  "previous_scores": [1.62, 1.58, 1.71]
}
```

### 1.2 Live Trade Object
```json
{
  "id": "trade_20240114_001",
  "strategy_id": "strategy_momentum_001",
  "symbol": "EURUSD",
  "side": "BUY",
  "entry_time": "2024-01-14T09:30:15Z",
  "entry_price": 1.0856,
  "exit_time": "2024-01-14T10:45:22Z",
  "exit_price": 1.0871,
  "position_size": 0.5,
  "pnl": 75.50,
  "pnl_percent": 0.138,
  "risk_reward_ratio": 2.1,
  "slippage_pips": 0.5,
  "status": "closed"
}
```

### 1.3 Real-Time Position Update
```json
{
  "symbol": "EURUSD",
  "strategy_id": "strategy_momentum_001",
  "side": "BUY",
  "current_size": 0.5,
  "entry_price": 1.0856,
  "current_price": 1.0865,
  "unrealized_pnl": 45.50,
  "risk_level": "normal",
  "max_daily_drawdown_used": 0.065,
  "max_daily_drawdown_limit": 0.10,
  "timestamp": "2024-01-14T10:15:33Z"
}
```

---

## 2. API CONTRACT

### REST Endpoints
| Method | Endpoint | Response |
|:---|:---|:---|
| GET | /api/strategies | [Strategy optimization result] |
| GET | /api/strategies/{id}/optimization-history | [{results}] |
| GET | /api/positions/current | [Position update] |
| GET | /api/news/upcoming | [News event] |
| GET | /api/dashboard/summary | {pnl, win_rate, sharpe, etc} |
| POST | /api/optimizer/start | {optimizer_state} |
| POST | /api/strategy/{id}/enable | {status} |

### WebSocket Endpoints
| Endpoint | Use |
|:---|:---|
| WS /api/positions/stream | Live P&L updates every 5s |
| WS /api/trades/stream | Trade execution notifications |
| WS /api/optimizer/progress | Optimizer progress bar |
| WS /api/news/alerts | Risk alert banner |

---

## 3. TECH STACK

| Layer | Frontend | Backend | Infrastructure |
|:---|:---|:---|:---|
| Framework | Next.js 15 + React 19 | FastAPI (Python) | Docker + Docker Compose |
| Styling | TailwindCSS + shadcn/ui | Pydantic + SQLAlchemy | Kubernetes (prod) |
| Animation | Framer Motion + GSAP | Optuna + NumPy/Polars | Redis + Celery |
| Charts | Recharts + D3.js | WebSocket (FastAPI native) | PostgreSQL + TimescaleDB |
| State | Zustand | discord.py | GitHub Actions |
| Secrets | .env (dev) | python-dotenv | AWS Secrets Manager |

---

## 4. DEVELOPMENT PHASES

### Phase 1: Environment + UI Foundation (Weeks 1-2)
**Objective:** Ship landing page + dashboard layout with mock data.

**Deliverables:**
- Monorepo initialized (Next.js + FastAPI skeleton)
- Docker Compose dev stack running locally
- Landing page (logo, value prop, CTA)
- Dashboard layout (sidebar, header, main content area)
- Mock data generator
- KPI cards + equity curve chart
- Strategy performance grid
- TypeScript types finalized

**Time:** 5-7 days
**Success:** Dashboard loads instantly, animations smooth (60fps)

---

### Phase 2: Dashboard Subsystems (Weeks 3-4)
**Objective:** Add live position panel, trade feed, news ticker, optimizer progress widget.

**Deliverables:**
- Live positions panel (mock stream every 5s)
- Trade execution log
- News ticker widget
- Optimizer progress widget
- Risk alert banner
- Skeleton loaders + error boundaries

**Time:** 5-7 days
**Success:** Dashboard feels responsive, no console errors

---

### Phase 3: Backend Skeleton + Data Persistence (Weeks 5-6)
**Objective:** Replace mock data with real APIs.

**Deliverables:**
- FastAPI app scaffolding
- PostgreSQL + TimescaleDB in Docker
- SQLAlchemy ORM models
- Pydantic schemas
- API endpoints all REST routes
- WebSocket handlers (positions/stream, trades/stream)
- Swagger UI auto-generated
- Integration tests

**Time:** 5-7 days
**Success:** GET /api/strategies returns JSON, frontend displays real API data

---

### Phase 4: Optimizer Backend (Weeks 7-10)
**Objective:** Build optimization engine. Run weekly, persist results to DB.

**Deliverables:**
- Strategy base class + 3 reference strategies (momentum, RSI, MACD)
- Vectorized backtest engine (NumPy/Polars)
- OHLC data fetcher
- Optuna optimization (500K combos, multiprocessing)
- Walk-forward validation (80/20)
- Celery worker for background tasks
- Composite scoring (Profit Factor x (1 - Max Drawdown))
- Results persistence to PostgreSQL

**Time:** 10-14 days
**Success:** Optimization completes in less than 24 hours

---

### Phase 5: NinjaTrader Integration (Weeks 11-12)
**Objective:** Auto-generate C# strategies and sync parameters to NT8.

**Deliverables:**
- Jinja2 NinjaScript C# template
- Parameter file generator (JSON to NT8)
- C# strategy reads params at session startup
- Trade logging to CSV
- Execution vs backtest reconciliation

**Time:** 7-10 days
**Success:** C# strategy reads parameters from JSON file, NT8 matches Python backtest

---

### Phase 6: Risk Engine (Weeks 13-14)
**Objective:** News monitoring and dynamic position sizing.

**Deliverables:**
- News API integration (FinancialModelingPrep)
- High-impact event detector
- Drawdown monitor (alert at 80%, trigger at 100%)
- Dynamic position size reducer (reduce 50% on high-impact news)
- Manual kill switch (emergency close all positions)

**Time:** 5-7 days
**Success:** Risk alerts appear within 2 minutes

---

### Phase 7: Monitoring & Reporting (Weeks 15-16)
**Objective:** Discord/Telegram bots, daily reports, audit trail.

**Deliverables:**
- Discord bot (daily reports at 5 PM UTC)
- Weekly strategy ranking
- Trade audit routine (compare backtest to NT8 CSV)
- PnL dashboard widget
- Weekly digest email

**Time:** 3-5 days
**Success:** Bot sends daily report without errors

---

### Phase 8: Production Hardening (Weeks 17+)
**Objective:** Scale, monitor, harden for 24/7 operation.

**Deliverables:**
- Kubernetes orchestration (optional)
- Prometheus + Grafana monitoring
- ELK Stack logging
- Backup strategy (daily DB dumps to S3)
- Disaster recovery plan
- Load testing (100 concurrent trades)
- Security hardening

**Time:** 5-10 days (ongoing)
**Success:** System stays up 24/7 without manual intervention

---

## 5. FIRST 30 DAYS EXECUTION

| Week | Focus | Deliverables |
|:---|:---|:---|
| 1 | Environment + Landing Page | Monorepo, Docker, TypeScript types, design system |
| 2 | Dashboard Skeleton + Mock Data | Layout, KPI cards, equity curve, strategy grid |
| 3 | Backend API + WebSocket | FastAPI app, REST endpoints, WebSocket stream |
| 4 | Dashboard Subsystems + Polish | Live positions, trade feed, news ticker, mobile UX |
| 5-6 | Backend + Database | ORM models, data persistence, API integration |
| 7-10 | Optimizer Engine | Optuna, backtesting, multiprocessing |
| 11-12 | NT8 Integration | C# template generation, parameter sync |
| 13-14 | Risk Engine | News monitoring, drawdown protection |
| 15-16 | Reporting | Discord bot, audit trail |
| 17-30 | Production | Monitoring, hardening, scaling |

---

## 6. RISK MITIGATION

| # | Risk | Severity | Mitigation |
|:---|:---|:---|:---|
| 1 | Optimizer Runtime > 24h | CRITICAL | Start with 50K combos, scale up. Use Ray/AWS Batch |
| 2 | NT8 API Brittleness | HIGH | Parameter JSON file, validate schema, minimal C# template |
| 3 | Data Quality | HIGH | Validate OHLC, compare yfinance vs broker, handle splits/dividends |
| 4 | WebSocket Scaling | MEDIUM | Redis pub/sub, throttle to 1/sec |
| 5 | Overfitting | MEDIUM | Walk-forward validation, hold-out test set (30 days) |

---

## 7. SUCCESS CRITERIA & MILESTONES

| Milestone | Week | Criteria |
|:---|:---|:---|
| MVP Frontend | 4 | Dashboard loads, charts render, responsive |
| Backend Connected | 6 | API returns real data, WebSocket streams |
| Optimizer Functional | 10 | 10 strategies optimized, results in DB |
| NT8 Integration Live | 12 | C# runs in NT8, reads params, logs trades |
| Risk Engine Active | 14 | News alerts trigger, position sizes adjust |
| Discord Bot Reporting | 16 | Daily/weekly reports sent |
| Production Ready | 30 | 24/7 uptime, monitored, scalable |

---

## 8. FINAL RECOMMENDATION

### Tech Stack
- **Frontend:** Next.js 15, TypeScript, Tailwind, Framer Motion
- **Backend:** FastAPI, Pydantic, SQLAlchemy
- **Database:** PostgreSQL + TimescaleDB
- **Optimization:** Optuna + NumPy/Polars
- **Task Queue:** Celery + Redis
- **Deployment:** Docker Compose (dev), Kubernetes (prod)

### Avoid These Traps
- Over-design the UI early (ship ugly, iterate!)
- Start with NT8 integration (do frontend first)
- Optimize prematurely (500K combos is your constraint, not your first target)
- Overengineer Kubernetes at start
- Build "nice to have" features before core works

### Go/No-Go Checkpoints
- **Week 2:** Dashboard looks institutional? Ship it.
- **Week 6:** Optimizer runtime < 8 hours? If not, reduce combos.
- **Week 12:** NT8 integration works? If not, pivot to broker API.
- **Week 16:** Discord bot accurate? If not, debug reconciliation.

---

*End of Document. Ready for Phase 1 execution.*