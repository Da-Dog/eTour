from ninja import Schema
from typing import Optional
from pydantic import EmailStr, Field
from datetime import datetime


class TournamentSchema(Schema):
    name: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., min_length=1, max_length=500)
    start_date: datetime
    end_date: datetime
    address_1: str = Field(..., min_length=1, max_length=200)
    address_2: Optional[str] = Field(None, min_length=1, max_length=200)
    city: str = Field(..., min_length=1, max_length=100)
    state: str = Field(..., min_length=1, max_length=100)
    zip_code: str = Field(..., min_length=1, max_length=20)
    contact_name: str = Field(..., min_length=1, max_length=100)
    contact_email: EmailStr
    contact_phone: str = Field(..., min_length=1, max_length=20)


class ParticipantSchema(Schema):
    first_name: str = Field(..., min_length=1, max_length=100)
    middle_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    email: Optional[EmailStr] = Field(None)
    phone: Optional[str] = Field(None, min_length=1, max_length=20)
    date_of_birth: Optional[datetime] = Field(None)
    gender: str = Field(..., min_length=1, max_length=1)
    notes: Optional[str] = Field(None)


class EventSchema(Schema):
    id: Optional[int] = Field(None)
    name: str = Field(..., min_length=1, max_length=100)
    type: str = Field(..., min_length=1, max_length=100)
    gender: str = Field(..., min_length=1, max_length=1)
    fee: float = Field(...)
    max_entry: int = Field(...)
    scoring_format: str = Field(..., min_length=1, max_length=1)
    arrangement: str = Field(..., min_length=1, max_length=2)
    playoff: bool = Field(...)
    consolation: str = Field(..., min_length=1, max_length=2)
    full_feed_last_round: Optional[str] = Field(None, min_length=1, max_length=2)


class EntrySchema(Schema):
    participant: str
    partner: Optional[str] = Field(None)
    seed: Optional[int] = Field(None)
