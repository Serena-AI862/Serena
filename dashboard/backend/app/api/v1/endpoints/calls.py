from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.services.calls import CallService
from app.schemas.models import Call, CallCreate, CallStats

router = APIRouter()

@router.post("/calls", response_model=Call)
async def create_call(call: CallCreate):
    return await CallService.create_call(call)

@router.get("/calls", response_model=List[Call])
async def get_calls(user_id: int):
    return await CallService.get_calls(user_id)

@router.get("/call-stats", response_model=CallStats)
async def get_call_stats(user_id: int):
    return await CallService.get_call_stats(user_id) 