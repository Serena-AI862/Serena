import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface CallStats {
  total_calls: number;
  appointments_booked: number;
  avg_duration: string;
  avg_rating: number;
  call_to_appointment_rate: number;
  missed_calls_percentage: number;
  weekly_call_volume: Array<{
    day: string;
    calls: number;
  }>;
  top_performing_day: string;
  peak_call_hours: string;
}

export interface Call {
  id: number;
  phone_number: string;
  duration_seconds: number;
  call_type: string;
  appointment_booked: boolean;
  rating: number;
  timestamp: string;
  notes?: string;
}

export const callsApi = {
  getCallStats: async (userId: number): Promise<CallStats> => {
    const response = await api.get(`/call-stats?user_id=${userId}`);
    return response.data;
  },

  getCalls: async (userId: number): Promise<Call[]> => {
    const response = await api.get(`/calls?user_id=${userId}`);
    return response.data;
  },

  createCall: async (call: Omit<Call, 'id'>): Promise<Call> => {
    const response = await api.post('/calls', call);
    return response.data;
  },
}; 