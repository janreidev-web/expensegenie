import React from 'react';

const KpiCard = ({ title, value, subValue, format }) => {
  const formatValue = (val) => {
    if (format === 'currency') {
      return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(val || 0);
    }
    return val;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h4 className="text-sm font-medium text-gray-500 mb-1">{title}</h4>
      <p className="text-3xl font-bold text-slate-800">{formatValue(value)}</p>
      {subValue && (
        <p className="text-sm text-gray-500">
            {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(subValue || 0)}
        </p>
      )}
    </div>
  );
};

export default KpiCard;