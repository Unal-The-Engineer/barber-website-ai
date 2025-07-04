from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class Reservation(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    email: str
    phone: str
    service: str
    date: datetime
    time: str
    status: str = Field(default="active")  # active, cancelled

class WorkingHours(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    date: datetime
    start_time: str
    end_time: str
    is_available: bool = Field(default=True)  # False means unavailable

class AdminUser(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(unique=True)
    password: str
    created_at: datetime = Field(default_factory=datetime.now) 