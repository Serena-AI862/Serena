import React, { useEffect, useState } from 'react';
import { StatsCard } from '../components/StatsCard';
import { CallVolume } from '../components/CallVolume';
import { RecentCalls } from '../components/RecentCalls';
import { callsApi, type CallStats, type Call } from '../services/api';
import { PhoneIcon, CalendarIcon, ClockIcon, StarIcon } from '@heroicons/react/24/outline';

export default function Dashboard() {
  const [stats, setStats] = useState<CallStats | null>(null);
  const [calls, setCalls] = useState<Call[]>([]);
  const userId = 1; // This should come from authentication

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, callsData] = await Promise.all([
          callsApi.getCallStats(userId),
          callsApi.getCalls(userId),
        ]);
        setStats(statsData);
        setCalls(callsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchData();
  }, [userId]);

  if (!stats) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold">Serena AI Agent Dashboard</h1>
          <div className="mt-4 flex space-x-4">
            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md shadow-sm hover:bg-gray-50">
              Day
            </button>
            <button className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md shadow-sm">
              Week
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md shadow-sm hover:bg-gray-50">
              Month
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Calls"
            value={stats.total_calls}
            change={{ value: 14, timeframe: 'last week' }}
            icon={<PhoneIcon className="w-6 h-6 text-gray-400" />}
          />
          <StatsCard
            title="Appointments Booked"
            value={stats.appointments_booked}
            change={{ value: 7.5, timeframe: 'last week' }}
            icon={<CalendarIcon className="w-6 h-6 text-gray-400" />}
          />
          <StatsCard
            title="Avg. Call Duration"
            value={stats.avg_duration}
            change={{ value: -2, timeframe: 'last week' }}
            icon={<ClockIcon className="w-6 h-6 text-gray-400" />}
          />
          <StatsCard
            title="Average Rating"
            value={stats.avg_rating}
            change={{ value: 0.2, timeframe: 'last week' }}
            icon={<StarIcon className="w-6 h-6 text-gray-400" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-8">
          <CallVolume data={stats.weekly_call_volume} />
        </div>

        <div className="grid grid-cols-1 gap-6">
          <RecentCalls calls={calls} />
        </div>
      </div>
    </div>
  );
} 