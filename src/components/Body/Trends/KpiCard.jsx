import React from 'react';

const KpiCard = ({ title, value, colorClass = 'text-slate-800' }) => (
  <div className="bg-slate-50 p-4 rounded-lg text-center flex-1 min-w-[180px]">
    <h4 className="text-sm font-medium text-gray-500 truncate">{title}</h4>
    <p className={`text-2xl font-bold mt-1 ${colorClass}`}>
      {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value)}
    </p>
  </div>
);

export default KpiCard;