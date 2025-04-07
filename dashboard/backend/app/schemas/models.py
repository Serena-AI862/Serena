from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field

class CallBase(BaseModel):
    user_id: int
    timestamp: datetime
    duration_seconds: Optional[int] = None
    rating: Optional[float] = Field(None, ge=0, le=5)
    appointment_booked: bool = False
    notes: Optional[str] = None
    call_type: str = "inquiry"  # inquiry, complaint, etc.

class CallCreate(CallBase):
    pass

class Call(CallBase):
    id: int
    
    class Config:
        from_attributes = True

class CallStats(BaseModel):
    total_calls: int
    appointments_booked: int
    avg_duration: str
    avg_rating: float
    call_to_appointment_rate: float
    missed_calls_percentage: float
    weekly_call_volume: List[dict]
    top_performing_day: str
    peak_call_hours: str

class WeeklyCallVolume(BaseModel):
    day: str
    calls: int 