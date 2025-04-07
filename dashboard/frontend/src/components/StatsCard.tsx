import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change: {
    value: number;
    timeframe: string;
  };
  icon: React.ReactNode;
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, change, icon }) => {
  const isPositive = change.value >= 0;
  
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-gray-600 text-sm">{title}</h3>
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-3xl font-semibold mb-2">{value}</span>
        <div className="flex items-center">
          <span className={`text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? '+' : ''}{change.value}%
          </span>
          <span className="text-gray-500 text-sm ml-1">from {change.timeframe}</span>
        </div>
      </div>
    </div>
  );
}; 