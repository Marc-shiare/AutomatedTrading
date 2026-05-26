"""Initial schema migration for trading platform."""

from alembic import op
import sqlalchemy as sa

revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ── Strategies ───────────────────────────────────────────────────────
    op.create_table(
        "strategies",
        sa.Column("id", sa.String(64), primary_key=True, index=True),
        sa.Column("name", sa.String(256), nullable=False),
        sa.Column("symbol", sa.String(16), nullable=False, index=True),
        sa.Column("pair", sa.String(16), nullable=False),
        sa.Column("base_currency", sa.String(8), nullable=False),
        sa.Column("quote_currency", sa.String(8), nullable=False),
        sa.Column("optimization_date", sa.DateTime, default=sa.func.now(), index=True),
        sa.Column("composite_score", sa.Float, nullable=False),
        sa.Column("status", sa.String(32), default="ready_for_deployment"),
        sa.Column("previous_scores", sa.JSON, default=list),
        sa.Column("parameters", sa.JSON, nullable=False),
        sa.Column("backtest_metrics", sa.JSON, nullable=False),
        sa.Column("created_at", sa.DateTime, default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime, default=sa.func.now(), onupdate=sa.func.now()),
    )

    # ── Trades ──────────────────────────────────────────────────────────
    op.create_table(
        "trades",
        sa.Column("id", sa.String(64), primary_key=True, index=True),
        sa.Column("strategy_id", sa.String(64), sa.ForeignKey("strategies.id"), nullable=False, index=True),
        sa.Column("symbol", sa.String(16), nullable=False, index=True),
        sa.Column("pair", sa.String(16), nullable=False),
        sa.Column("side", sa.String(8), nullable=False),
        sa.Column("entry_time", sa.DateTime, nullable=False),
        sa.Column("entry_price", sa.Float, nullable=False),
        sa.Column("exit_time", sa.DateTime, nullable=True),
        sa.Column("exit_price", sa.Float, nullable=True),
        sa.Column("lot_size", sa.Float, nullable=False, default=0.5),
        sa.Column("position_size", sa.Float, nullable=False, default=0.5),
        sa.Column("pnl", sa.Float, nullable=False, default=0.0),
        sa.Column("pnl_pips", sa.Float, nullable=False, default=0.0),
        sa.Column("pnl_percent", sa.Float, nullable=False, default=0.0),
        sa.Column("risk_reward_ratio", sa.Float, nullable=False, default=2.0),
        sa.Column("spread_pips", sa.Float, nullable=False, default=0.5),
        sa.Column("commission", sa.Float, nullable=False, default=7.0),
        sa.Column("status", sa.String(16), default="open"),
        sa.Column("created_at", sa.DateTime, default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime, default=sa.func.now(), onupdate=sa.func.now()),
    )

    # ── Positions ───────────────────────────────────────────────────────
    op.create_table(
        "positions",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("symbol", sa.String(16), nullable=False, index=True),
        sa.Column("pair", sa.String(16), nullable=False),
        sa.Column("strategy_id", sa.String(64), sa.ForeignKey("strategies.id"), nullable=False, index=True),
        sa.Column("side", sa.String(8), nullable=False),
        sa.Column("current_lot_size", sa.Float, nullable=False),
        sa.Column("entry_price", sa.Float, nullable=False),
        sa.Column("current_price", sa.Float, nullable=False),
        sa.Column("unrealized_pnl", sa.Float, nullable=False, default=0.0),
        sa.Column("unrealized_pips", sa.Float, nullable=False, default=0.0),
        sa.Column("risk_level", sa.String(16), default="normal"),
        sa.Column("max_daily_drawdown_used", sa.Float, nullable=False, default=0.0),
        sa.Column("max_daily_drawdown_limit", sa.Float, nullable=False, default=0.1),
        sa.Column("timestamp", sa.DateTime, default=sa.func.now()),
        sa.Column("created_at", sa.DateTime, default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime, default=sa.func.now(), onupdate=sa.func.now()),
    )

    # ── OptimizerRuns ─────────────────────────────────────────────────
    op.create_table(
        "optimizer_runs",
        sa.Column("id", sa.String(64), primary_key=True, index=True),
        sa.Column("status", sa.String(16), default="idle"),
        sa.Column("progress", sa.Float, default=0.0),
        sa.Column("current_iteration", sa.Integer, default=0),
        sa.Column("total_iterations", sa.Integer, default=500000),
        sa.Column("best_score", sa.Float, default=0.0),
        sa.Column("eta_seconds", sa.Integer, default=0),
        sa.Column("parameters", sa.JSON, nullable=True),
        sa.Column("started_at", sa.DateTime, default=sa.func.now()),
        sa.Column("completed_at", sa.DateTime, nullable=True),
        sa.Column("created_at", sa.DateTime, default=sa.func.now()),
    )

    # ── News Events ────────────────────────────────────────────────────
    op.create_table(
        "news_events",
        sa.Column("id", sa.String(64), primary_key=True, index=True),
        sa.Column("title", sa.Text, nullable=False),
        sa.Column("impact", sa.String(16), nullable=False),
        sa.Column("scheduled_time", sa.DateTime, nullable=False, index=True),
        sa.Column("currency", sa.String(8), nullable=False),
        sa.Column("created_at", sa.DateTime, default=sa.func.now()),
    )


def downgrade():
    op.drop_table("news_events")
    op.drop_table("optimizer_runs")
    op.drop_table("positions")
    op.drop_table("trades")
    op.drop_table("strategies")
