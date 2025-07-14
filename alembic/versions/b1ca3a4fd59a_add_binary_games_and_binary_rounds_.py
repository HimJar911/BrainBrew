from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'b1ca3a4fd59a'
down_revision: Union[str, Sequence[str], None] = '38592f72dbaf'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.create_table(
        "binary_games",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("difficulty", sa.String(), nullable=False, default="normal"),
        sa.Column("range_min", sa.Integer(), nullable=False, default=1),
        sa.Column("range_max", sa.Integer(), nullable=False, default=100),
        sa.Column("target", sa.Integer(), nullable=False),
        sa.Column("winner", sa.String(), nullable=True),  # "user", "ai", or None
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
    )

    op.create_table(
        "binary_rounds",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("game_id", sa.Integer(), sa.ForeignKey("binary_games.id"), nullable=False),
        sa.Column("turn", sa.Integer(), nullable=False),
        sa.Column("guesser", sa.String(), nullable=False),  # "user" or "ai"
        sa.Column("guess", sa.Integer(), nullable=False),
        sa.Column("feedback", sa.String(), nullable=False),  # "too_low", "too_high", "correct"
        sa.Column("response_time", sa.Integer(), nullable=True),
        sa.Column("timestamp", sa.DateTime(), server_default=sa.func.now()),
    )

def downgrade() -> None:
    op.drop_table("binary_rounds")
    op.drop_table("binary_games")
