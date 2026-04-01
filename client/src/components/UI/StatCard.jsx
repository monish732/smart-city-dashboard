import React from 'react';

export default function StatCard({ title, value, icon: Icon, colorClass, subtitle }) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100/50 flex items-start space-x-5 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 transform hover:-translate-y-1">
      <div className={`p-4 rounded-2xl ${colorClass} shadow-inner`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <div className="flex-1">
        <h3 className="text-slate-500 text-sm font-semibold tracking-wide uppercase">{title}</h3>
        <p className="text-3xl font-extrabold text-slate-800 mt-2 tracking-tight">{value}</p>
        {subtitle && <p className="text-sm font-medium text-slate-400 mt-2">{subtitle}</p>}
      </div>
    </div>
  );
}
