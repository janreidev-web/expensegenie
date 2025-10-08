import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const CategoryChart = ({ data }) => {
  const chartData = {
    labels: Object.keys(data),
    datasets: [
      {
        label: 'Expenses',
        data: Object.values(data),
        backgroundColor: [
          '#4f46e5', '#10b981', '#ef4444', '#f59e0b', '#3b82f6', 
          '#8b5cf6', '#ec4899', '#6b7280',
        ],
        borderColor: '#fff',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  return <Doughnut data={chartData} options={options} />;
};

export default CategoryChart;