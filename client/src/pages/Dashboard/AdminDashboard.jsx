import React, { useState, useEffect } from 'react';
import { Activity, Zap, Wind, Car, Users, AlertCircle, Droplets, ThermometerSun, MapPin, Bus, Wifi, Camera, TrendingUp, TrendingDown, Search, Filter, X, Bell, Moon, Sun, LogOut, CheckCircle2, Play } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import CityMap from '../../components/Map/CityMap';
import io from 'socket.io-client';

export default function AdminDashboard() {
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [time, setTime] = useState(new Date());
  const [darkMode, setDarkMode] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState(null);
  const [notifications, setNotifications] = useState(3);
  const [showNotifications, setShowNotifications] = useState(false);
   const [filterStatus, setFilterStatus] = useState('all');
   const [selectedStart, setSelectedStart] = useState('central');
   const [selectedEnd, setSelectedEnd] = useState('adyar');
   const [optimizedRoute, setOptimizedRoute] = useState([]);
   const [calculatingRoute, setCalculatingRoute] = useState(false);
   const [transportSummary, setTransportSummary] = useState({ totalTickets: 0, totalRevenue: 0 });
   const [busStats, setBusStats] = useState({ tickets: 0, revenue: 0, activeBuses: 0, occupancy: 0 });
   const [metroStats, setMetroStats] = useState({ tickets: 0, revenue: 0, activeTrains: 0, peakLoad: 0 });
   const [bikeStats, setBikeStats] = useState({ totalRides: 0, revenue: 0, bikesInUse: 0, availableBikes: 0 });

   const chennaiNodes = [
     { id: 'central', name: 'Central Station' },
     { id: 't-nagar', name: 'T. Nagar Signal' },
     { id: 'guindy', name: 'Guindy Kathipara' },
     { id: 'adyar', name: 'Adyar Signal' },
     { id: 'omr', name: 'OMR Tidel Park' },
     { id: 'anna-nagar', name: 'Anna Nagar Arch' },
     { id: 'marina', name: 'Marina Beach' }
   ];

   const handleOptimizeRoute = async () => {
     if (!selectedStart || !selectedEnd) return;
     setCalculatingRoute(true);
     try {
       const res = await fetch('http://localhost:8000/api/traffic/optimize', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ startId: selectedStart, endId: selectedEnd })
       });
       const data = await res.json();
       setOptimizedRoute(data.route || []);
     } catch (err) {
       console.error('Optimization failed:', err);
     } finally {
       setCalculatingRoute(false);
     }
   };

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const [liveData, setLiveData] = useState({
    energyUsage: 1.2,
    airQuality: 45,
    trafficFlow: 68
  });



  const stats = [
    { icon: Users, label: 'Population', value: '2.5M', change: '+2.3%', trend: 'up', color: 'bg-blue-500', percentage: 85 },
    { icon: Zap, label: 'Energy Usage', value: `${liveData.energyUsage} GW`, change: '-5.1%', trend: 'down', color: 'bg-yellow-500', percentage: 72 },
    { icon: Wind, label: 'Air Quality', value: 'Good', change: `AQI ${Math.round(liveData.airQuality)}`, trend: 'up', color: 'bg-green-500', percentage: Math.round(liveData.airQuality) },
    { icon: Car, label: 'Traffic Flow', value: 'Moderate', change: `${Math.round(liveData.trafficFlow)}%`, trend: 'down', color: 'bg-orange-500', percentage: Math.round(liveData.trafficFlow) },
  ];

   const [liveTrafficData, setLiveTrafficData] = useState([]);

   const fetchTrafficData = async () => {
     try {
       const res = await fetch('http://localhost:8000/api/traffic/live');
       const data = await res.json();
       const mapped = data.nodes.map(node => ({
         id: node.id,
         zone: node.name,
         ...data.status[node.id]
       }));
       setLiveTrafficData(mapped);
     } catch (err) {
       console.error('Failed to fetch traffic cards:', err);
     }
   };

   useEffect(() => {
     fetchTrafficData();
     const interval = setInterval(fetchTrafficData, 1000);
     return () => clearInterval(interval);
   }, []);

    const [utilityHistory, setUtilityHistory] = useState({ water: [], electricity: [], temperature: [] });

    const fetchUtilityHistory = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/utilities/history');
        const data = await res.json();
        setUtilityHistory(data);
      } catch (err) {
        console.error('Failed to fetch utility history:', err);
      }
    };

    const [utilityInsights, setUtilityInsights] = useState([]);

    const fetchUtilityInsights = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/utilities/insights');
        const data = await res.json();
        setUtilityInsights(data);
      } catch (err) {
        console.error('Failed to fetch utility insights:', err);
      }
    };



  const [alerts, setAlerts] = useState([]);
  
  const fetchAlerts = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/alerts');
      const data = await res.json();
      setAlerts(data);
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    }
  };

  const fetchTransportStats = async () => {
    try {
      const role = 'admin'; // Hardcoded for admin panel
      const [sum, bus, metro, bike] = await Promise.all([
        fetch(`http://localhost:8000/api/admin/transport/summary?role=${role}`).then(r => r.json()),
        fetch(`http://localhost:8000/api/admin/transport/bus?role=${role}`).then(r => r.json()),
        fetch(`http://localhost:8000/api/admin/transport/metro?role=${role}`).then(r => r.json()),
        fetch(`http://localhost:8000/api/admin/transport/bikes?role=${role}`).then(r => r.json())
      ]);
      if (sum.totalTickets !== undefined) setTransportSummary(sum);
      if (bus.tickets !== undefined) setBusStats(bus);
      if (metro.tickets !== undefined) setMetroStats(metro);
      if (bike.totalRides !== undefined) setBikeStats(bike);
    } catch (err) {
      console.error('Failed to fetch transport analytics:', err);
    }
  };

  const [servicesData, setServicesData] = useState({
     cctv: [], parking: [], sos: [], wifi: []
  });
  const [activeServiceModal, setActiveServiceModal] = useState(null);

  const fetchServicesData = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/services/live');
      const data = await res.json();
      setServicesData(data);
    } catch (err) {
      console.error('Failed to fetch services:', err);
    }
  };

  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleServiceAction = async (actionData) => {
    try {
      const res = await fetch('http://localhost:8000/api/services/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(actionData)
      });
      const data = await res.json();
      if(data.success) fetchServicesData();
      return data;
    } catch (err) {
      console.error('Service action failed:', err);
      return { success: false };
    }
  };

  useEffect(() => {
    const socket = io('http://localhost:8000');

    socket.on('parking_update', () => {
      fetchServicesData();
    });

    socket.on('new_notification', (notif) => {
      showToast(`${notif.message}`);
    });

    socket.on('ticket_booked', (summary) => {
      setTransportSummary(summary);
      fetchTransportStats(); // Full refresh on booking
    });

    return () => socket.disconnect();
  }, []);

  const fetchHeartbeat = () => {
    fetchTrafficData();
    fetchUtilityHistory();
    fetchUtilityInsights();
    fetchAlerts();
    fetchServicesData();
    fetchTransportStats();
    
    // Also update local mock live data
    setLiveData(prev => ({
        energyUsage: Number((prev.energyUsage + (Math.random() - 0.5) * 0.1).toFixed(2)),
        airQuality: Math.max(10, Math.min(95, prev.airQuality + (Math.random() - 0.5) * 5)),
        trafficFlow: Math.max(10, Math.min(95, prev.trafficFlow + (Math.random() - 0.5) * 10))
    }));
  };

  useEffect(() => {
    fetchHeartbeat();
    const interval = setInterval(fetchHeartbeat, 2000);
    return () => clearInterval(interval);
  }, []);

  const [newAlert, setNewAlert] = useState({
     category: 'Traffic Dept',
     priority: 'high',
     type: 'warning',
     message: ''
  });

  const handleBroadcastAlert = async (e) => {
     e.preventDefault();
     if(!newAlert.message) return;
     
     try {
        await fetch('http://localhost:8000/api/alerts', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify(newAlert)
        });
        setNewAlert({ ...newAlert, message: '' });
        fetchAlerts(); // Refresh immediately
     } catch (err) {
        console.error('Failed to broadcast alert:', err);
     }
  };

  const utilities = [
  { name: 'Water', usage: 75, progress: 75, unit: 'ML/day', icon: Droplets, color: 'bg-blue-400', trend: 'down', change: '-3%' },
  { name: 'Electricity', usage: 82, progress: 82, unit: 'GWh', icon: Zap, color: 'bg-yellow-400', trend: 'up', change: '+2%' },
  { name: 'Temperature', usage: 24, progress: 60, unit: '°C', icon: ThermometerSun, color: 'bg-orange-400', trend: 'up', change: '+1°C' },
];

  const publicTransport = [
  { type: 'Bus', active: 145, capacity: 78, icon: Bus, color: 'bg-blue-500' },
  { type: 'Metro', active: 32, capacity: 92, icon: Activity, color: 'bg-purple-500' },
  { type: 'Bikes', active: 890, capacity: 45, icon: Activity, color: 'bg-green-500' },
];

  const smartServices = [
    { name: 'CCTV Cameras', count: 127, status: 'Active', icon: Camera, color: 'bg-red-500' },
    { name: 'Parking Spots', count: 1240, status: '68% Full', icon: MapPin, color: 'bg-indigo-500' },
  ];

  const filteredTraffic = liveTrafficData.filter(zone => {
    const matchesSearch = zone.zone.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || zone.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const filteredAlerts = alerts.filter(alert => 
    alert.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900' : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'} ${darkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>
      <header className={`${darkMode ? 'bg-black/30' : 'bg-white/80'} backdrop-blur-md border-b ${darkMode ? 'border-white/10' : 'border-gray-200'} sticky top-0 z-50`}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Activity className="w-8 h-8 text-blue-400 animate-pulse" />
              <div>
                <h1 className="text-2xl font-bold">Smart City Control</h1>
                <p className="text-xs text-gray-400">Real-time Monitoring System</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`relative p-2 rounded-lg ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'} transition-colors`}
                >
                  <Bell className="w-6 h-6" />
                  {notifications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {notifications}
                    </span>
                  )}
                </button>
                
                {showNotifications && (
                  <div className={`absolute right-0 mt-2 w-80 ${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl shadow-2xl border ${darkMode ? 'border-white/10' : 'border-gray-200'} p-4`}>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold">Notifications</h3>
                      <button onClick={() => setShowNotifications(false)}>
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    {alerts.slice(0, 3).map(alert => (
                      <div key={alert.id} className={`p-3 mb-2 rounded-lg ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                        <p className="text-sm">{alert.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{alert.time}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg ${darkMode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-700/20 text-slate-700'} hover:scale-110 transition-all`}
              >
                {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
              </button>
              
              <button 
                onClick={signOut}
                className={`p-2 rounded-lg ${darkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600'} hover:scale-110 transition-all`} title="Log Out"
              >
                <LogOut className="w-6 h-6" />
              </button>

              <div className="text-right">
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{time.toLocaleDateString()}</p>
                <p className="text-lg font-semibold">{time.toLocaleTimeString()}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <nav className={`${darkMode ? 'bg-black/20' : 'bg-white/60'} backdrop-blur-sm border-b ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
        <div className="container mx-auto px-6">
          <div className="flex space-x-8 overflow-x-auto">
            {['overview', 'traffic', 'traffic_control', 'utilities', 'transport', 'services', 'alerts', 'sos'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 border-b-2 transition-all capitalize whitespace-nowrap ${
                  activeTab === tab
                    ? 'border-blue-400 text-blue-400 font-semibold'
                    : `border-transparent ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, idx) => (
                <div key={idx} className={`${darkMode ? 'bg-white/10' : 'bg-white'} backdrop-blur-md rounded-xl p-6 border ${darkMode ? 'border-white/20' : 'border-gray-200'} hover:scale-105 transition-all cursor-pointer shadow-lg`}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-sm mb-1`}>{stat.label}</p>
                      <p className="text-3xl font-bold mb-1">{stat.value}</p>
                      <div className="flex items-center space-x-2">
                        {stat.trend === 'up' ? <TrendingUp className="w-4 h-4 text-green-400" /> : <TrendingDown className="w-4 h-4 text-red-400" />}
                        <p className={`text-sm ${stat.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>{stat.change}</p>
                      </div>
                    </div>
                    <div className={`${stat.color} p-3 rounded-lg`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                  </div>
                  <div className={`${darkMode ? 'bg-white/10' : 'bg-gray-200'} rounded-full h-2`}>
                    <div
                      className={`${stat.color} h-2 rounded-full transition-all duration-1000`}
                      style={{ width: `${stat.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className={`${darkMode ? 'bg-white/10' : 'bg-white'} backdrop-blur-md rounded-xl p-6 border ${darkMode ? 'border-white/20' : 'border-gray-200'} shadow-lg`}>
                <h3 className="text-xl font-semibold mb-4">Energy Consumption (24h)</h3>
                <div className="space-y-3">
                  {[80, 65, 90, 75, 85, 70].map((value, idx) => (
                    <div key={idx} className="flex items-center space-x-3">
                      <span className="text-sm w-12">{idx * 4}:00</span>
                      <div className={`flex-1 ${darkMode ? 'bg-white/10' : 'bg-gray-200'} rounded-full h-6`}>
                        <div
                          className="bg-gradient-to-r from-yellow-400 to-orange-500 h-6 rounded-full transition-all duration-1000 hover:scale-y-110"
                          style={{ width: `${value}%` }}
                        ></div>
                      </div>
                      <span className="text-sm w-12 text-right font-semibold">{value}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`${darkMode ? 'bg-white/10' : 'bg-white'} backdrop-blur-md rounded-xl p-6 border ${darkMode ? 'border-white/20' : 'border-gray-200'} shadow-lg`}>
                <h3 className="text-xl font-semibold mb-4">Public Services Status</h3>
                <div className="space-y-4">
                  {utilities.map((util, idx) => (
                    <div key={idx} className={`flex items-center justify-between p-4 ${darkMode ? 'bg-white/5' : 'bg-gray-50'} rounded-lg hover:scale-105 transition-all`}>
                      <div className="flex items-center space-x-3">
                        <div className={`${util.color} p-2 rounded-lg`}>
                          <util.icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold">{util.name}</p>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{util.unit}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{util.usage}</p>
                        <p className={`text-xs ${util.trend === 'up' ? 'text-red-400' : 'text-green-400'}`}>{util.change}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {smartServices.map((service, idx) => (
                <div key={idx} className={`${darkMode ? 'bg-white/10' : 'bg-white'} backdrop-blur-md rounded-xl p-6 border ${darkMode ? 'border-white/20' : 'border-gray-200'} shadow-lg hover:scale-105 transition-all`}>
                  <div className={`${service.color} p-3 rounded-lg inline-block mb-3`}>
                    <service.icon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold mb-1">{service.name}</h4>
                  <p className="text-2xl font-bold">{service.count}</p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{service.status}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'traffic' && (
           <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h2 className="text-2xl font-bold">Traffic Management</h2>
              
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search zones..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`pl-10 pr-4 py-2 rounded-lg ${darkMode ? 'bg-white/10 border-white/20' : 'bg-white border-gray-300'} border focus:outline-none focus:ring-2 focus:ring-blue-400`}
                  />
                </div>
                
                <div className="flex gap-2">
                  {['all', 'heavy', 'moderate', 'light'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setFilterStatus(filter)}
                      className={`px-4 py-2 rounded-lg capitalize transition-all ${
                        filterStatus === filter
                          ? 'bg-blue-500 text-white'
                          : `${darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-200 hover:bg-gray-300'}`
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {filteredTraffic.map((zone, idx) => (
                <div 
                  key={idx} 
                  className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl hover:bg-white/15 transition-all cursor-pointer group relative overflow-hidden"
                >
                   {/* Background Glow */}
                  <div className={`absolute -top-10 -right-10 w-24 h-24 rounded-full ${zone.color} blur-[60px] opacity-20`}></div>

                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black tracking-tighter uppercase">{zone.zone}</h3>
                    <span className={`${zone.color} px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg`}>
                      {zone.status}
                    </span>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5">
                      <div className="flex items-center space-x-3">
                        <Car className="w-5 h-5 text-blue-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Flow/Hr</span>
                      </div>
                      <p className="text-2xl font-black text-white">{zone.vehicles}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Avg Speed</span>
                            <p className="text-lg font-black text-white">{zone.avgSpeed}</p>
                        </div>
                        <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Incidents</span>
                            <p className="text-lg font-black text-rose-400">{zone.incidents}</p>
                        </div>
                    </div>

                     <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2">
                            <Camera className="w-4 h-4 text-slate-500" />
                            <span className="text-[10px] font-black text-slate-500 uppercase">{zone.cameras} Active Cams</span>
                        </div>
                        <div className="animate-pulse w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
           </div>
        )}

        {activeTab === 'utilities' && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20">
               <div>
                  <h2 className="text-2xl font-black uppercase tracking-widest text-yellow-400">Utilities Telemetry</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">Real-time Resource Consumption & Environment Monitoring</p>
               </div>
               <div className="flex gap-4">
                  <div className="px-5 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
                     <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Sensors Active</span>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {[
                { name: 'Water Supply', key: 'water', unit: 'ML/day', color: '#60a5fa', icon: Droplets, grad: 'blue' },
                { name: 'Power Grid', key: 'electricity', unit: 'GWh', color: '#fbbf24', icon: Zap, grad: 'yellow' },
                { name: 'Average Temp', key: 'temperature', unit: '°C', color: '#fb923c', icon: ThermometerSun, grad: 'orange' }
              ].map((util) => (
                <div key={util.key} className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl flex flex-col h-[450px]">
                   <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-4">
                         <div className={`p-3 rounded-2xl bg-white/5 border border-white/10`}>
                            <util.icon className="w-6 h-6" style={{ color: util.color }} />
                         </div>
                         <div>
                            <h3 className="text-lg font-black uppercase tracking-tighter">{util.name}</h3>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Live Telemetry</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-2xl font-black text-white">{utilityHistory[util.key]?.length > 0 ? utilityHistory[util.key][utilityHistory[util.key].length - 1].value : '--'}</p>
                         <p className="text-[10px] font-black text-slate-400 uppercase">{util.unit}</p>
                      </div>
                   </div>

                   <div className="flex-1 w-full min-h-0">
                      <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={utilityHistory[util.key]}>
                            <defs>
                               <linearGradient id={`color-${util.key}`} x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor={util.color} stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor={util.color} stopOpacity={0}/>
                               </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis 
                              dataKey="time" 
                              stroke="#64748b" 
                              fontSize={10} 
                              tickLine={false} 
                              axisLine={false}
                              interval={4}
                            />
                            <YAxis 
                              domain={['auto', 'auto']} 
                              stroke="#64748b" 
                              fontSize={10} 
                              tickLine={false} 
                              axisLine={false} 
                              hide
                            />
                            <Tooltip 
                               contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px' }}
                               itemStyle={{ fontWeight: '900', textTransform: 'uppercase' }}
                            />
                            <Area 
                               type="monotone" 
                               dataKey="value" 
                               stroke={util.color} 
                               strokeWidth={3}
                               fillOpacity={1} 
                               fill={`url(#color-${util.key})`} 
                               animationDuration={1500}
                            />
                         </AreaChart>
                      </ResponsiveContainer>
                   </div>

                   <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Normal Range</span>
                      </div>
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                   </div>
                </div>
              ))}
            </div>

            {/* AI Predictive Insights Banner */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
               {utilityInsights.map((insight, idx) => (
                  <div key={idx} className={`p-6 rounded-3xl bg-white/10 backdrop-blur-md shadow-2xl border flex flex-col md:flex-row items-start md:items-center gap-5 hover:bg-white/20 transition-all ${
                     insight.type === 'critical' ? 'border-red-500/30 border-l-[8px] border-l-red-500' : 
                     insight.type === 'warning' ? 'border-orange-500/30 border-l-[8px] border-l-orange-500' : 
                     'border-emerald-500/30 border-l-[8px] border-l-emerald-500'
                  }`}>
                     <div className={`p-3 rounded-2xl bg-black/40 border border-white/5`}>
                        <AlertCircle className={`w-6 h-6 ${insight.color}`} />
                     </div>
                     <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{insight.category} Telemetry Predictor</p>
                        <p className={`text-xs font-black italic tracking-wide uppercase ${insight.color}`}>{insight.message}</p>
                     </div>
                  </div>
               ))}
            </div>
          </div>
        )}

        {activeTab === 'transport' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20">
               <div>
                  <h2 className="text-2xl font-black uppercase tracking-widest text-blue-400">Transport Analytics</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">Real-time Ticket Volume & Revenue Optimization</p>
               </div>
               <div className="grid grid-cols-2 gap-8">
                  <div className="text-right">
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Bookings Today</p>
                     <p className="text-xl font-black text-white">{transportSummary.totalTickets?.toLocaleString()}</p>
                  </div>
                  <div className="text-right border-l border-white/10 pl-8">
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Revenue Today</p>
                     <p className="text-xl font-black text-emerald-400">₹{transportSummary.totalRevenue?.toLocaleString()}</p>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                  { type: 'Bus', active: busStats.activeBuses, capacity: busStats.occupancy, icon: Bus, color: 'bg-blue-500', tix: busStats.tickets, rev: busStats.revenue },
                  { type: 'Metro', active: metroStats.activeTrains, capacity: metroStats.peakLoad, icon: Activity, color: 'bg-purple-500', tix: metroStats.tickets, rev: metroStats.revenue },
                  { type: 'Bikes', active: bikeStats.bikesInUse, capacity: 45, icon: Activity, color: 'bg-green-500', tix: bikeStats.totalRides, rev: bikeStats.revenue }
              ].map((transport, idx) => (
                <div key={idx} className={`${darkMode ? 'bg-white/10' : 'bg-white'} backdrop-blur-md rounded-[32px] p-8 border ${darkMode ? 'border-white/20' : 'border-gray-200'} shadow-lg hover:bg-white/15 transition-all group relative overflow-hidden`}>
                  <div className={`absolute -top-10 -right-10 w-24 h-24 rounded-full ${transport.color} blur-[60px] opacity-20`}></div>
                  
                  <div className="flex items-center justify-between mb-8">
                     <div className={`${transport.color} p-4 rounded-2xl shadow-lg shadow-white/5`}><transport.icon className="w-6 h-6 text-white" /></div>
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{transport.type} Network</span>
                  </div>

                  <div className="space-y-6">
                     <div>
                        <p className="text-4xl font-black text-white mb-1">{transport.active}</p>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Units</p>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                           <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Bookings</span>
                           <p className="text-lg font-black text-white">{transport.tix}</p>
                        </div>
                        <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                           <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Revenue</span>
                           <p className="text-lg font-black text-emerald-400">₹{transport.rev}</p>
                        </div>
                     </div>

                     <div>
                        <div className="flex justify-between mb-2">
                           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{transport.type === 'Bikes' ? 'Utilization' : 'Occupancy'}</span>
                           <span className="text-[10px] font-black text-white">{transport.capacity}%</span>
                        </div>
                        <div className={`${darkMode ? 'bg-white/10' : 'bg-gray-200'} rounded-full h-1.5 overflow-hidden`}>
                           <div
                              className={`${transport.color} h-full transition-all duration-1000`}
                              style={{ width: `${transport.capacity}%` }}
                           ></div>
                        </div>
                     </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="space-y-6 animate-fade-in h-[700px] flex flex-col">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-widest text-emerald-400">Services Health Monitor</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">Real-time Infrastructure Connectivity & Utility Status</p>
              </div>
              
              <div className="flex gap-4">
                 <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Network Online</span>
                 </div>
                 <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Grid Stable</span>
                 </div>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
               <div className="lg:col-span-3 h-full">
                  <CityMap mode="services" />
               </div>
               <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                   {/* CCTV LIVE DATA */}
                   <div onClick={() => setActiveServiceModal('cctv')} className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 hover:bg-white/10 transition-all group cursor-pointer shadow-lg hover:shadow-red-500/20">
                      <div className="flex items-center gap-4 mb-4">
                         <div className={`bg-red-500 p-3 rounded-xl shadow-lg shadow-white/5 group-hover:scale-110 transition-all`}><Camera className="w-5 h-5 text-white" /></div>
                         <div>
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">CCTV Network</h4>
                            <p className="text-xl font-black text-white">{servicesData.cctv?.length || 0} Cams</p>
                         </div>
                      </div>
                      <div className="space-y-2">
                         <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                            <span>{servicesData.cctv?.filter(c => c.status === 'active').length || 0} Active Nodes</span>
                            <span className="text-emerald-400">Recording</span>
                         </div>
                         <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full bg-red-400 opacity-80`} style={{ width: `${((servicesData.cctv?.filter(c => c.status === 'active').length || 0) / (servicesData.cctv?.length || 1)) * 100}%` }}></div>
                         </div>
                      </div>
                   </div>

                   {/* PARKING LIVE DATA */}
                   <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 hover:bg-white/10 transition-all group cursor-pointer">
                      <div className="flex items-center gap-4 mb-4">
                         <div className={`bg-indigo-500 p-3 rounded-xl shadow-lg shadow-white/5 group-hover:scale-110 transition-all`}><MapPin className="w-5 h-5 text-white" /></div>
                         <div>
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">City Parking</h4>
                            <p className="text-xl font-black text-white">{servicesData.parking?.reduce((a,b)=>a+b.occupied_slots,0)}/{servicesData.parking?.reduce((a,b)=>a+b.total_slots,0)}</p>
                         </div>
                      </div>
                      <div className="space-y-2">
                         <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                            <span>Overall Occupancy</span>
                            <span className="text-indigo-400">Live</span>
                         </div>
                         <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full bg-indigo-400 opacity-80`} style={{ width: `${(servicesData.parking?.reduce((a,b)=>a+b.occupied_slots,0) / servicesData.parking?.reduce((a,b)=>a+b.total_slots,1)) * 100}%` }}></div>
                         </div>
                      </div>
                   </div>

                   {/* PUBLIC WIFI LIVE DATA */}
                   <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 hover:bg-white/10 transition-all group cursor-pointer">
                      <div className="flex items-center gap-4 mb-4">
                         <div className={`bg-blue-500 p-3 rounded-xl shadow-lg shadow-white/5 group-hover:scale-110 transition-all`}><Wifi className="w-5 h-5 text-white" /></div>
                         <div>
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Public WiFi</h4>
                            <p className="text-xl font-black text-white">{servicesData.wifi?.reduce((a,b)=>a+b.active_users,0)} Users</p>
                         </div>
                      </div>
                      <div className="space-y-2">
                         <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                            <span>Network Load</span>
                            <span className="text-blue-400">Stable</span>
                         </div>
                         <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full bg-blue-400 opacity-80`} style={{ width: `${(servicesData.wifi?.reduce((a,b)=>a+b.active_users,0) / servicesData.wifi?.reduce((a,b)=>a+b.total_capacity,1)) * 100}%` }}></div>
                         </div>
                      </div>
                   </div>

               </div>
            </div>
          </div>
        )}

        {activeTab === 'sos' && (
          <div className="space-y-6 animate-fade-in">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                 <h2 className="text-2xl font-black uppercase tracking-widest text-red-500">SOS Emergency Control</h2>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-tight mb-6">Real-time Emergency Pings from Citizens</p>
              </div>
            </div>

            <div className="space-y-4">
               {servicesData.sos?.filter(s => s.status === 'active').length === 0 ? (
                  <div className="p-8 text-center text-gray-500 font-black uppercase tracking-widest border border-dashed border-white/20 rounded-[40px] bg-white/5">No Active Emergencies</div>
               ) : (
                  servicesData.sos?.filter(s => s.status === 'active').map(sus => (
                     <div key={sus.id} className="relative bg-rose-500/10 border border-rose-500/40 p-6 rounded-[32px] overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500 blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
                        <div className="flex items-center justify-between z-10 relative">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center animate-pulse shadow-[0_0_20px_rgba(225,29,72,0.4)]">
                                 <AlertCircle className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                 <h3 className="text-xl font-black text-rose-500 uppercase tracking-widest">SOS Ping: {sus.location}</h3>
                                 <p className="text-xs font-bold text-rose-300 uppercase tracking-[0.2em]">{sus.timestamp} | Sender: {sus.user_id}</p>
                              </div>
                           </div>
                           <button 
                              onClick={async () => {
                                 const res = await handleServiceAction({action: 'sos_resolve', sos_id: sus.id});
                                 if(res.success) showToast(`Emergency ${sus.id} flagged as RESOLVED.`);
                              }}
                              className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-black uppercase tracking-widest shadow-xl transition-all hover:scale-105"
                           >
                              Mark Resolved
                           </button>
                        </div>
                     </div>
                  ))
               )}
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="space-y-6 animate-fade-in">
             <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                 <h2 className="text-2xl font-black uppercase tracking-widest text-blue-400">Broadcast Neural Alert</h2>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-tight mb-6">Push live data & warnings to Citizen Portal</p>
              </div>
            </div>

            <form onSubmit={handleBroadcastAlert} className={`${darkMode ? 'bg-white/10' : 'bg-white'} backdrop-blur-md rounded-3xl p-8 border ${darkMode ? 'border-white/20' : 'border-gray-200'} shadow-2xl mb-8`}>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                     <label className="text-[10px] font-black uppercase text-slate-500 block mb-2">Domain Authorization</label>
                     <select 
                       value={newAlert.category}
                       onChange={e => setNewAlert({...newAlert, category: e.target.value})}
                       className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                     >
                        <option value="Traffic Dept">Traffic Control Dept</option>
                        <option value="Water Board">Metro Water Board</option>
                        <option value="Grid Admin">Power Grid Authority</option>
                        <option value="Metro Command">Metro Trans. Command</option>
                        <option value="City Council">Gen. City Council</option>
                     </select>
                  </div>
                  <div>
                     <label className="text-[10px] font-black uppercase text-slate-500 block mb-2">Alert Priority</label>
                     <select 
                       value={newAlert.priority}
                       onChange={e => setNewAlert({...newAlert, priority: e.target.value})}
                       className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                     >
                        <option value="high">High - Urgent Action</option>
                        <option value="medium">Medium - Advisory</option>
                        <option value="low">Low - Information</option>
                     </select>
                  </div>
                  <div>
                     <label className="text-[10px] font-black uppercase text-slate-500 block mb-2">Visual Classification</label>
                     <select 
                       value={newAlert.type}
                       onChange={e => setNewAlert({...newAlert, type: e.target.value})}
                       className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                     >
                        <option value="critical">Critical (Red)</option>
                        <option value="warning">Warning (Yellow)</option>
                        <option value="info">Info (Blue)</option>
                     </select>
                  </div>
               </div>
               <div className="mb-6">
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-2">Message Payload</label>
                  <textarea 
                    value={newAlert.message}
                    onChange={e => setNewAlert({...newAlert, message: e.target.value})}
                    placeholder="Enter the alert context to be pushed to citizens..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
                  ></textarea>
               </div>
               <button type="submit" className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-blue-500/20 transition-all">
                  Broadcast to Citizens
               </button>
            </form>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-12 mb-6 border-t border-white/10 pt-8">
              <h2 className="text-xl font-bold uppercase tracking-widest text-slate-300">Active Broadcasts</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Filter local log..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`pl-10 pr-4 py-2 rounded-lg ${darkMode ? 'bg-white/10 border-white/20' : 'bg-white border-gray-300'} border focus:outline-none focus:ring-2 focus:ring-blue-400`}
                />
              </div>
            </div>

            <div className="space-y-4">
              {filteredAlerts.length === 0 ? (
                 <div className="text-center py-10 opacity-50 font-black tracking-widest uppercase">No broadcast history</div>
              ) : filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`${darkMode ? 'bg-white/10' : 'bg-white'} backdrop-blur-md rounded-xl p-6 border ${darkMode ? 'border-white/20' : 'border-gray-200'} shadow-lg flex items-start space-x-4`}
                >
                  <AlertCircle
                    className={`w-6 h-6 mt-1 flex-shrink-0 ${
                      alert.type === 'warning'
                        ? 'text-yellow-400'
                        : alert.type === 'critical'
                        ? 'text-red-400'
                        : 'text-blue-400'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="font-bold text-sm tracking-wide break-words">{alert.message}</p>
                      <div className="flex gap-2 ml-4 flex-shrink-0">
                         <span className="text-[9px] font-black uppercase text-slate-500 border border-slate-500/50 px-2 py-1 rounded-md">{alert.category}</span>
                         <span
                           className={`text-[9px] font-black uppercase px-2 py-1 rounded-md ${
                             alert.priority === 'high'
                               ? 'bg-red-500/20 text-red-400'
                               : alert.priority === 'medium'
                               ? 'bg-yellow-500/20 text-yellow-400'
                               : 'bg-green-500/20 text-green-400'
                           }`}
                         >
                           {alert.priority}
                         </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2 font-semibold">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
         )}
        {activeTab === 'traffic_control' && (
          <div className="space-y-6 animate-fade-in h-[700px] flex flex-col">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-widest text-blue-400">AI Route Optimizer</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">Chennai Traffic Real-time Pathfinding</p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black text-slate-500 uppercase ml-1">From</span>
                  <select 
                    value={selectedStart} 
                    onChange={(e) => setSelectedStart(e.target.value)}
                    className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {chennaiNodes.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black text-slate-500 uppercase ml-1">To</span>
                  <select 
                    value={selectedEnd} 
                    onChange={(e) => setSelectedEnd(e.target.value)}
                    className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {chennaiNodes.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                  </select>
                </div>
                <button 
                  onClick={handleOptimizeRoute}
                  disabled={calculatingRoute}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-xs tracking-widest px-8 py-3.5 rounded-xl shadow-lg shadow-blue-500/20 mt-5 transition-all disabled:opacity-50"
                >
                  {calculatingRoute ? 'Calculating...' : 'Find Best Route'}
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-0">
               <CityMap optimizedRoute={optimizedRoute} />
            </div>
          </div>
        )}

        {/* Neural Toast UI */}
        {toastMessage && (
           <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-[100] animate-fade-in pointer-events-none">
              <div className={`${toastMessage.type === 'error' ? 'bg-rose-600' : 'bg-emerald-500'} text-white px-8 py-4 rounded-full shadow-[0_0_40px_rgba(0,0,0,0.5)] font-black uppercase tracking-widest text-sm flex items-center gap-3 whitespace-nowrap`}>
                 {toastMessage.type === 'error' ? <AlertCircle className="w-5 h-5 animate-pulse" /> : <CheckCircle2 className="w-5 h-5" />}
                 {toastMessage.msg}
              </div>
           </div>
        )}

        {/* ADMIN CCTV MODAL */}
        {activeServiceModal === 'cctv' && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6" onClick={() => setActiveServiceModal(null)}>
              <div className="w-full max-w-4xl bg-[#0f172a] border border-white/10 p-8 rounded-[40px] shadow-2xl relative" onClick={e => e.stopPropagation()}>
                 <button onClick={() => setActiveServiceModal(null)} className="absolute top-6 right-6 text-white/50 hover:text-white"><X className="w-8 h-8" /></button>
                 <h2 className="text-2xl font-black uppercase text-white mb-6 flex items-center gap-3"><Camera className="text-red-500" /> Active Public CCTV Feeds</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
                    {servicesData.cctv?.filter(c => c.status === 'active').map(cam => (
                       <div key={cam.id} className="relative rounded-2xl overflow-hidden bg-black aspect-video border border-white/10 group">
                          {/* Mock video static */}
                          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
                          <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 px-3 py-1 rounded-full border border-white/10">
                             <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                             <span className="text-[10px] font-black text-white uppercase tracking-wider">{cam.location}</span>
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                             <Play className="w-12 h-12 text-white/50" />
                          </div>
                          <p className="absolute bottom-4 right-4 text-[10px] font-mono text-white/50">LIVE // {new Date().toLocaleTimeString()}</p>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        )}

      </main>
    </div>
  );
}
