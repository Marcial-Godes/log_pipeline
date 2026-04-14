"""add user_agent to raw_logs

Revision ID: 7904eb293603
Revises: 9e745339ac7e
Create Date: 2026-04-14

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers
revision: str = '7904eb293603'
down_revision: Union[str, Sequence[str], None] = '9e745339ac7e'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        'raw_logs',
        sa.Column('user_agent', sa.String(), nullable=True)
    )


def downgrade() -> None:
    op.drop_column('raw_logs', 'user_agent')