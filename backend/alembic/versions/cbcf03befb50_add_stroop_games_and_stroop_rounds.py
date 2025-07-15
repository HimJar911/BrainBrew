"""add stroop_games and stroop_rounds

Revision ID: cbcf03befb50
Revises: b1ca3a4fd59a
Create Date: 2025-07-11 23:04:03.070270

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'cbcf03befb50'
down_revision: Union[str, Sequence[str], None] = 'b1ca3a4fd59a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "stroop_games",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id")),
        sa.Column("difficulty", sa.String(), nullable=False, default="medium"),
        sa.Column("total_rounds", sa.Integer()),
        sa.Column("correct", sa.Integer()),
        sa.Column("score", sa.Integer()),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
    )

    op.create_table(
        "stroop_rounds",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("game_id", sa.Integer(), sa.ForeignKey("stroop_games.id")),
        sa.Column("round_number", sa.Integer()),
        sa.Column("word_shown", sa.String()),
        sa.Column("font_color", sa.String()),
        sa.Column("user_response", sa.String()),
        sa.Column("correct", sa.Boolean()),
        sa.Column("conflict", sa.Boolean()),
        sa.Column("response_time", sa.Integer()),
        sa.Column("timestamp", sa.DateTime(), server_default=sa.func.now()),
    )



def downgrade() -> None:
    """Downgrade schema."""
    pass
