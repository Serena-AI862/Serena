from datetime import datetime, timedelta
from typing import List
from app.core.database import supabase, CALLS_TABLE
from app.schemas.models import Call, CallCreate, CallStats, WeeklyCallVolume

class CallService:
    @staticmethod
    async def create_call(call: CallCreate) -> Call:
        response = supabase.table(CALLS_TABLE).insert(call.model_dump()).execute()
        return Call(**response.data[0])

    @staticmethod
    async def get_calls(user_id: int) -> List[Call]:
        response = supabase.table(CALLS_TABLE)\
            .select("*")\
            .eq("user_id", user_id)\
            .order("timestamp", desc=True)\
            .execute()
        return [Call(**call) for call in response.data]

    @staticmethod
    async def get_call_stats(user_id: int) -> CallStats:
        now = datetime.utcnow()
        week_start = now - timedelta(days=7)
        
        response = supabase.table(CALLS_TABLE)\
            .select("*")\
            .eq("user_id", user_id)\
            .gte("timestamp", week_start.isoformat())\
            .execute()
        
        calls = response.data
        total_calls = len(calls)
        appointments_booked = sum(1 for call in calls if call["appointment_booked"])
        
        # Calculate average duration
        total_duration = sum(call["duration_seconds"] or 0 for call in calls)
        avg_duration_seconds = round(total_duration / total_calls) if total_calls > 0 else 0
        avg_duration = f"{avg_duration_seconds // 60}:{str(avg_duration_seconds % 60).zfill(2)}"
        
        # Calculate average rating
        total_rating = sum(call["rating"] or 0 for call in calls)
        avg_rating = round(total_rating / total_calls, 1) if total_calls > 0 else 0
        
        # Calculate appointment booking rate
        call_to_appointment_rate = round((appointments_booked / total_calls * 100), 1) if total_calls > 0 else 0
        
        # Calculate weekly call volume
        weekly_volume = []
        days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        for i in range(7):
            date = now - timedelta(days=i)
            day_name = date.strftime("%a")
            day_calls = sum(1 for call in calls 
                          if datetime.fromisoformat(call["timestamp"]).date() == date.date())
            weekly_volume.append({"day": day_name, "calls": day_calls})
        weekly_volume.reverse()
        
        # Find top performing day
        top_day = max(weekly_volume, key=lambda x: x["calls"])["day"]
        
        # Calculate peak hours
        hour_counts = [0] * 24
        for call in calls:
            hour = datetime.fromisoformat(call["timestamp"]).hour
            hour_counts[hour] += 1
        peak_hour = hour_counts.index(max(hour_counts))
        
        return CallStats(
            total_calls=total_calls,
            appointments_booked=appointments_booked,
            avg_duration=avg_duration,
            avg_rating=avg_rating,
            call_to_appointment_rate=call_to_appointment_rate,
            missed_calls_percentage=8.2,  # Placeholder as in original
            weekly_call_volume=weekly_volume,
            top_performing_day=top_day,
            peak_call_hours=f"{peak_hour}:00"
        ) 