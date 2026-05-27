"""Database configuration and session management."""

import os
from contextlib import asynccontextmanager
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base

# ── Configuration ──────────────────────────────────────────────────────

DATABASE_URL = os.environ["DATABASE_URL"]

# ── Engine ─────────────────────────────────────────────────────────────

engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    future=True,
    # Pool settings for production
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,
)

# Session factory
async_session = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# Base for declarative models
Base = declarative_base()


# ── Dependency ─────────────────────────────────────────────────────────

async def get_db():
    """FastAPI dependency for DB sessions."""
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()
