import React from 'react';
import { format } from 'date-fns';

interface Call {
  id: number;
  phone_number: string;
  duration_seconds: number;
  call_type: string;
  appointment_booked: boolean;
  rating: number;
  timestamp: string;
}

interface RecentCallsProps {
  calls: Call[];
}

export const RecentCalls: React.FC<RecentCallsProps> = ({ calls }) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Recent Calls</h2>
        <p className="text-gray-600 text-sm">Detailed information about recent calls</p>
      </div>
      
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by phone number..."
          className="w-full p-2 border border-gray-200 rounded-lg"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-gray-600 text-sm">
              <th className="pb-4">Phone Number</th>
              <th className="pb-4">Duration</th>
              <th className="pb-4">Call Type</th>
              <th className="pb-4">Appointment</th>
              <th className="pb-4">Rating</th>
              <th className="pb-4">Call Time</th>
            </tr>
          </thead>
          <tbody>
            {calls.map((call) => (
              <tr key={call.id} className="border-t border-gray-100">
                <td className="py-4">{call.phone_number}</td>
                <td className="py-4">
                  {Math.floor(call.duration_seconds / 60)}:
                  {String(call.duration_seconds % 60).padStart(2, '0')}
                </td>
                <td className="py-4">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    call.call_type === 'inquiry' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {call.call_type}
                  </span>
                </td>
                <td className="py-4">
                  <span className={`text-sm ${call.appointment_booked ? 'text-green-600' : 'text-red-600'}`}>
                    {call.appointment_booked ? 'Booked' : 'Not Booked'}
                  </span>
                </td>
                <td className="py-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${i < call.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </td>
                <td className="py-4 text-gray-600">
                  {format(new Date(call.timestamp), 'MMM d, h:mm a')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}; 