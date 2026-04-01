import { useCityData } from '../../contexts/CityDataContext';
import { AlertTriangle, Info, Zap, Droplet, Bell } from 'lucide-react';

export default function AlertPanel() {
  const { alerts } = useCityData();

  if(alerts.length === 0) {
      return (
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 text-center text-slate-500 flex flex-col items-center justify-center min-h-[300px]">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                 <Bell className="w-8 h-8 text-slate-300" />
              </div>
              <p className="font-medium text-lg">No Active Alerts</p>
              <p className="text-sm text-slate-400 mt-1">The city is running smoothly.</p>
          </div>
      )
  }

  const getIcon = (type) => {
      switch(type) {
          case 'electricity': return <Zap className="text-amber-500 w-5 h-5" />;
          case 'water': return <Droplet className="text-blue-500 w-5 h-5" />;
          case 'traffic': return <AlertTriangle className="text-red-500 w-5 h-5" />;
          default: return <Info className="text-indigo-500 w-5 h-5" />;
      }
  }

  const getAlertStyle = (type) => {
      switch(type) {
          case 'electricity': return 'bg-amber-50 border-amber-100';
          case 'water': return 'bg-blue-50 border-blue-100';
          case 'traffic': return 'bg-red-50 border-red-100';
          default: return 'bg-indigo-50 border-indigo-100';
      }
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full max-h-[500px]">
      <div className="p-5 border-b border-slate-100 bg-slate-50/50 backdrop-blur-sm sticky top-0 z-10">
        <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg tracking-tight">
            <Bell className="w-5 h-5 text-indigo-500"/> Live City Alerts
        </h3>
      </div>
      <div className="overflow-y-auto p-4 space-y-3">
        {alerts.map(alert => (
          <div key={alert.id} className={`p-4 rounded-2xl border transition-all duration-300 hover:shadow-md ${getAlertStyle(alert.type)} flex items-start gap-4`}>
            <div className="mt-0.5 bg-white p-2 rounded-xl shadow-sm">{getIcon(alert.type)}</div>
            <div className="flex-1">
              <p className="text-[15px] font-semibold text-slate-800 leading-snug">{alert.message}</p>
              <div className="flex items-center gap-3 mt-3">
                <span className="text-xs font-bold text-slate-600 bg-white/60 backdrop-blur outline outline-1 outline-slate-200/50 px-2.5 py-1 rounded-lg uppercase tracking-wider">{alert.area}</span>
                <span className="text-xs font-medium text-slate-500 bg-white/40 px-2 py-1 rounded-lg">{new Date(alert.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
