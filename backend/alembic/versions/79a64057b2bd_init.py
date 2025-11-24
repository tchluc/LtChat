"""init

Revision ID: 79a64057b2bd
Revises: 
Create Date: 2025-11-20 23:12:27.876354

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '79a64057b2bd'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.create_table(
        "user",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("username", sa.String(), nullable=False),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("hashed_password", sa.String(), nullable=False),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_user_username", "user", ["username"], unique=True)
    op.create_index("ix_user_email", "user", ["email"], unique=True)

    op.create_table("guild", sa.Column("id", sa.Integer(), nullable=False), sa.Column("name", sa.String(), nullable=False), sa.Column("owner_id", sa.Integer(), nullable=False), sa.Column("icon", sa.String(), nullable=True), sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False), sa.ForeignKeyConstraint(["owner_id"], ["user.id"], ondelete="CASCADE"), sa.PrimaryKeyConstraint("id"))

    op.create_table("channel", sa.Column("id", sa.Integer(), nullable=False), sa.Column("name", sa.String(), nullable=False), sa.Column("guild_id", sa.Integer(), nullable=False), sa.Column("type", sa.String(), server_default="text"), sa.Column("position", sa.Integer(), default=0), sa.ForeignKeyConstraint(["guild_id"], ["guild.id"], ondelete="CASCADE"), sa.PrimaryKeyConstraint("id"))

    op.create_table("guildmember", sa.Column("guild_id", sa.Integer(), nullable=False), sa.Column("user_id", sa.Integer(), nullable=False), sa.Column("role", sa.String(), server_default="member"), sa.ForeignKeyConstraint(["guild_id"], ["guild.id"], ondelete="CASCADE"), sa.ForeignKeyConstraint(["user_id"], ["user.id"], ondelete="CASCADE"), sa.PrimaryKeyConstraint("guild_id", "user_id"))

    op.create_table("message", sa.Column("id", sa.Integer(), nullable=False), sa.Column("content", sa.Text(), nullable=False), sa.Column("user_id", sa.Integer(), nullable=False), sa.Column("channel_id", sa.Integer(), nullable=False), sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False), sa.Column("edited_at", sa.TIMESTAMP(timezone=True), nullable=True), sa.ForeignKeyConstraint(["user_id"], ["user.id"], ondelete="CASCADE"), sa.ForeignKeyConstraint(["channel_id"], ["channel.id"], ondelete="CASCADE"), sa.PrimaryKeyConstraint("id"))

def downgrade():
    op.drop_table("message")
    op.drop_table("guildmember")
    op.drop_table("channel")
    op.drop_table("guild")
    op.drop_table("user")
