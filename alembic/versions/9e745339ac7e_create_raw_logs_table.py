"""create raw_logs table

Revision ID: 9e745339ac7e
Revises: 
Create Date: 2026-04-14 08:23:22.837457

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '9e745339ac7e'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'raw_logs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('timestamp', sa.DateTime(), nullable=True),
        sa.Column('method', sa.String(), nullable=True),
        sa.Column('endpoint', sa.String(), nullable=True),
        sa.Column('status_code', sa.Integer(), nullable=True),
        sa.Column('response_time', sa.Float(), nullable=True),
        sa.Column('ip', sa.String(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_index('idx_raw_timestamp', 'raw_logs', ['timestamp'], unique=False)
    op.create_index('ix_raw_logs_id', 'raw_logs', ['id'], unique=False)
    op.create_index('ix_raw_logs_timestamp', 'raw_logs', ['timestamp'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index('ix_raw_logs_timestamp', table_name='raw_logs')
    op.drop_index('ix_raw_logs_id', table_name='raw_logs')
    op.drop_index('idx_raw_timestamp', table_name='raw_logs')
    op.drop_table('raw_logs')