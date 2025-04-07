import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface CallVolumeProps {
  data: {
    day: string;
    calls: number;
  }[];
}

export const CallVolume: React.FC<CallVolumeProps> = ({ data }) => {
  const chartData = {
    labels: data.map(item => item.day),
    datasets: [
      {
        label: 'Calls',
        data: data.map(item => item.calls),
        backgroundColor: '#1a1a1a',
        borderRadius: 4,
        barThickness: 20,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: false,
        },
        ticks: {
          stepSize: 15,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'white',
        titleColor: 'black',
        bodyColor: 'black',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context: any) => `Calls: ${context.parsed.y}`,
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Call Volume</h2>
        <p className="text-gray-600 text-sm">Number of calls throughout the past week</p>
      </div>
      <div className="h-64">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}; 