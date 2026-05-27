"""FastAPI application — QuantumTrade API v2.0 (Phase 3)"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os

from app.api.routes import router as api_router

# ── App ─────────────────────────────────────────────────────────────────

app = FastAPI(
    title="QuantumTrade API",
    description="Self-Optimizing Algorithmic Trading Platform API — Phase 4",
    version="3.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://frontend:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix="/api")


@app.get("/")
async def root():
    return {
        "message": "QuantumTrade API",
        "version": "3.0.0",
        "status": "operational",
        "mode": "mock" if os.getenv("USE_MOCK", "true").lower() == "true" else "database",
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "version": "3.0.0",
        "database": "connected" if not os.getenv("USE_MOCK", "true").lower() == "true" else "mock",
    }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
