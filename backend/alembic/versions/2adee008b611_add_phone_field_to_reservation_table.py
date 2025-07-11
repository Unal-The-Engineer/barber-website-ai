"""add phone field to reservation table

Revision ID: 2adee008b611
Revises: bf18b5f36b53
Create Date: 2025-06-25 17:51:42.988388

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = '2adee008b611'
down_revision: Union[str, Sequence[str], None] = 'bf18b5f36b53'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    # Add phone column as nullable first
    op.add_column('reservation', sa.Column('phone', sqlmodel.sql.sqltypes.AutoString(), nullable=True))
    
    # Update existing records with a default phone number
    op.execute("UPDATE reservation SET phone = '(000) 000 00 00' WHERE phone IS NULL")
    
    # Now make it not nullable
    op.alter_column('reservation', 'phone', nullable=False)
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('reservation', 'phone')
    # ### end Alembic commands ###
