import React, { useState, useEffect } from 'react';
import { Activity, Zap, Wind, Car, Users, AlertCircle, Droplets, ThermometerSun, MapPin, Bus, Wifi, Camera, TrendingUp, TrendingDown, Search, Filter, X, Bell, Moon, Sun, LogOut, QrCode, CreditCard, Smartphone, CheckCircle2, MessageSquare, Send, Play } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import CityMap from '../../components/Map/CityMap';
import io from 'socket.io-client';

export default function UserDashboard() {
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [time, setTime] = useState(new Date());
  const [darkMode, setDarkMode] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  
  // New Functional States
  const [bookingStep, setBookingStep] = useState(null); // null, 1, 2, 3, 4
  const [selectedTransport, setSelectedTransport] = useState(null);
  const [mapLayer, setMapLayer] = useState('traffic'); // traffic, transport, alerts
  const [alertFilter, setAlertFilter] = useState('all');
  const [utilityHistory, setUtilityHistory] = useState({ water: [], electricity: [], temperature: [] });

  // Booking Data State
  const [bookingData, setBookingData] = useState({
     source: '',
     destination: '',
     selectedSeat: null,
     paymentMethod: 'upi'
  });

  // Chatbot State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { role: 'bot', text: 'I am the City Neural Assistant. I monitor live city data. Ask me things like:\n- "Shall I eat ice cream?"\n- "Can I use my washing machine today?"\n- "Is there going to be a power cut?"\n- "Any water shortages expected?"' }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    const userMsg = chatInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput('');
    setIsTyping(true);

    try {
      const res = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      });
      const data = await res.json();
      setChatMessages(prev => [...prev, { role: 'bot', text: data.reply }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'bot', text: '[System Disconnected] Neural link to city core failed.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    const socket = io('http://localhost:8000');
    
    socket.on('new_notification', (notif) => {
      setNotifications(prev => [notif, ...prev]);
    });

    socket.on('parking_update', () => {
      fetchServicesData();
    });

    return () => socket.disconnect();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/notifications/user/User_X');
      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const [liveData, setLiveData] = useState({
    energyUsage: 1.2,
    airQuality: 45,
    trafficFlow: 68
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveData(prev => ({
        energyUsage: Number((prev.energyUsage + (Math.random() - 0.5) * 0.1).toFixed(2)),
        airQuality: Math.max(0, Math.min(100, prev.airQuality + (Math.random() - 0.5) * 5)),
        trafficFlow: Math.max(0, Math.min(100, prev.trafficFlow + (Math.random() - 0.5) * 10))
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchUtilityHistory = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/utilities/history');
      const data = await res.json();
      setUtilityHistory(data);
    } catch (err) {
      console.error('Failed to fetch utility history:', err);
    }
  };

  useEffect(() => {
    fetchUtilityHistory();
    const interval = setInterval(fetchUtilityHistory, 1000);
    return () => clearInterval(interval);
  }, []);

  const [alertsData, setAlertsData] = useState([]);

  const fetchAlerts = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/alerts');
      const data = await res.json();
      setAlertsData(data);
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 2000);
    return () => clearInterval(interval);
  }, []);

  // SERVICES STATE
  const [servicesData, setServicesData] = useState({
     cctv: [], parking: [], sos: [], wifi: []
  });
  const [activeServiceModal, setActiveServiceModal] = useState(null); // 'cctv', 'parking', 'wifi', 'payment'
  const [selectedHub, setSelectedHub] = useState(null);

  const fetchServicesData = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/services/live');
      const data = await res.json();
      setServicesData(data);
    } catch (err) {
      console.error('Failed to fetch services:', err);
    }
  };

  const handleServiceAction = async (actionData) => {
    try {
      const res = await fetch('http://localhost:8000/api/services/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(actionData)
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.error('Service action failed:', err);
      return { success: false };
    }
  };

  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    fetchServicesData();
    const interval = setInterval(fetchServicesData, 1000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { icon: Zap, label: 'Power Grid', value: 'Stable', change: '98% Load', trend: 'up', color: 'bg-yellow-500', percentage: 98 },
    { icon: Wind, label: 'Air Quality', value: '45 AQI', change: 'Healthy', trend: 'down', color: 'bg-green-500', percentage: 45 },
    { icon: Car, label: 'Traffic Flow', value: 'Moderate', change: '68% Flow', trend: 'up', color: 'bg-orange-500', percentage: 68 },
    { icon: Bell, label: 'Alerts', value: `${alertsData.length} Active`, change: 'Priority', trend: 'down', color: 'bg-red-500', percentage: 10 },
  ];

  const publicTransport = [
    { id: 'bus', type: 'Bus', icon: Bus, availability: '145 Active', crowd: 'Moderate', color: 'bg-blue-500', eta: '4 min', fare: '₹25' },
    { id: 'metro', type: 'Metro', icon: Activity, availability: '32 Trains', crowd: 'High', color: 'bg-purple-500', eta: '2 min', fare: '₹40' },
    { id: 'bike', type: 'Public Bikes', icon: MapPin, availability: '890 Bikes', crowd: 'Low', color: 'bg-green-500', eta: 'Nearby', fare: '₹5/hr' }
  ];

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900' : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'} ${darkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300 font-sans selection:bg-blue-500/30`}>
      


      {/* Header */}
      <header className={`${darkMode ? 'bg-black/30' : 'bg-white/80'} backdrop-blur-md border-b ${darkMode ? 'border-white/10' : 'border-gray-200'} sticky top-0 z-50`}>
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Activity className="w-8 h-8 text-blue-400 animate-pulse" />
            <div>
              <h1 className="text-2xl font-bold">Smart City Control</h1>
              <p className="text-xs text-gray-400 font-medium tracking-wider">Citizen Service Portal</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button onClick={() => setShowNotifications(!showNotifications)} className={`p-2 rounded-lg relative ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'} transition-colors`}>
                <Bell className="w-6 h-6" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center border-2 border-slate-900 animate-bounce">{notifications.length}</span>
                )}
              </button>

              {showNotifications && (
                <div className={`absolute right-0 mt-4 w-96 rounded-[32px] border shadow-2xl z-[100] animate-fade-in overflow-hidden ${darkMode ? 'bg-slate-900/95 backdrop-blur-2xl border-white/10' : 'bg-white/95 backdrop-blur-2xl border-gray-200'}`}>
                  <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <h3 className="font-black uppercase italic tracking-widest text-xs">Neural Inbox</h3>
                    <button onClick={() => setNotifications([])} className="text-[10px] font-bold text-blue-400 hover:text-blue-300 uppercase">Clear All</button>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="p-12 text-center">
                        <Bell className="w-8 h-8 text-slate-700 mx-auto mb-4 opacity-20" />
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Zero Feed Intercepted</p>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className="p-6 border-b border-white/5 hover:bg-white/5 transition-colors group cursor-default">
                          <div className="flex gap-4">
                            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.type === 'critical' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : n.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
                            <div>
                               <p className="text-xs font-semibold leading-relaxed group-hover:text-blue-400 transition-colors">{n.message}</p>
                               <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-2">{n.time}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <button onClick={() => setDarkMode(!darkMode)} className={`p-2 rounded-lg ${darkMode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-700/20 text-slate-700'} hover:scale-110 transition-all`}>
              {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
            </button>
            <button onClick={signOut} className={`p-2 rounded-lg ${darkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600'} hover:scale-110 transition-all`}>
              <LogOut className="w-6 h-6" />
            </button>
            <div className="text-right ml-4 border-l border-white/10 pl-6">
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{time.toLocaleDateString()}</p>
              <p className="text-lg font-semibold">{time.toLocaleTimeString()}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className={`${darkMode ? 'bg-black/20' : 'bg-white/60'} backdrop-blur-sm border-b ${darkMode ? 'border-white/10' : 'border-gray-200'} sticky top-[73px] z-40`}>
        <div className="container mx-auto px-6 flex space-x-8 overflow-x-auto">
          {['overview', 'transport', 'alerts', 'traffic', 'services', 'utilities'].map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setBookingStep(null); }}
              className={`py-4 px-2 border-b-2 transition-all capitalize whitespace-nowrap text-sm font-semibold tracking-wide ${
                activeTab === tab 
                  ? 'border-blue-400 text-blue-400' 
                  : `border-transparent ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, idx) => (
                <div key={idx} className={`${darkMode ? 'bg-white/10' : 'bg-white'} backdrop-blur-md rounded-xl p-6 border ${darkMode ? 'border-white/20' : 'border-gray-200'} hover:scale-105 transition-all shadow-lg`}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-xs font-bold uppercase mb-1`}>{stat.label}</p>
                      <p className="text-3xl font-bold">{stat.value}</p>
                    </div>
                    <div className={`${stat.color} p-3 rounded-lg shadow-inner`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className={`${darkMode ? 'bg-white/10' : 'bg-gray-100'} rounded-full h-1.5 overflow-hidden`}>
                     <div className={`${stat.color} h-full transition-all duration-1000`} style={{ width: `${stat.percentage}%` }}></div>
                  </div>
                  <p className={`text-[10px] font-bold mt-2 ${stat.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>{stat.change}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               <div className={`${darkMode ? 'bg-white/10' : 'bg-white'} backdrop-blur-md rounded-xl p-6 border ${darkMode ? 'border-white/20' : 'border-gray-200'} lg:col-span-2 shadow-lg h-[400px] overflow-hidden flex flex-col`}>
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                     <MapPin className="w-5 h-5 text-blue-400" /> City Snapshot Map
                  </h2>
                  <div className="flex-1 rounded-xl overflow-hidden border border-white/5">
                     <CityMap mode={mapLayer} />
                  </div>
               </div>
               <div className={`${darkMode ? 'bg-white/10' : 'bg-white'} backdrop-blur-md rounded-xl p-6 border ${darkMode ? 'border-white/20' : 'border-gray-200'} shadow-lg flex flex-col`}>
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                     <Bell className="w-5 h-5 text-yellow-400" /> Neural Insight Feed
                  </h2>
                  <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                     {alertsData.map(a => (
                       <div key={a.id} className={`p-4 rounded-xl border border-white/5 ${darkMode ? 'bg-black/20 hover:bg-black/40' : 'bg-slate-50 hover:bg-slate-100'} transition-all`}>
                          <p className="text-[10px] font-black tracking-widest text-blue-400 mb-1 uppercase">{a.category}</p>
                          <p className="text-sm font-semibold">{a.message}</p>
                          <p className="text-[10px] text-gray-500 mt-2">{a.time}</p>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* TRANSPORT TAB (FULL REDESIGN) */}
        {activeTab === 'transport' && (
           <div className="space-y-6 animate-fade-in text-white">
              {!bookingStep ? (
                <>
                  <div className="flex justify-between items-end mb-8">
                     <div>
                        <h2 className="text-4xl font-black uppercase italic tracking-tighter italic italic">City Transit Nodes</h2>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Real-time scheduling and neural booking flow</p>
                     </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {publicTransport.map((t) => (
                      <div key={t.id} className={`${darkMode ? 'bg-white/10' : 'bg-white'} backdrop-blur-md rounded-[32px] p-10 border ${darkMode ? 'border-white/10' : 'border-gray-200'} shadow-2xl hover:bg-white/[0.15] transition-all flex flex-col group border-b-[8px]`} style={{ borderBottomColor: t.id === 'bus' ? '#3b82f6' : t.id === 'metro' ? '#a855f7' : '#10b981' }}>
                        <div className={`${t.color} p-5 rounded-2xl shadow-xl shadow-black/40 mb-8 w-fit group-hover:scale-110 transition-transform`}>
                           <t.icon className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-3xl font-black mb-1 uppercase italic tracking-tighter">{t.type}</h3>
                        <div className="flex justify-between items-center mb-8">
                           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.availability}</span>
                           <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${t.crowd === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>{t.crowd} Crowd</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-10">
                           <div className="bg-black/30 p-4 rounded-2xl border border-white/5 text-center">
                              <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">ETA</p>
                              <p className="text-xl font-black text-blue-400">{t.eta}</p>
                           </div>
                           <div className="bg-black/30 p-4 rounded-2xl border border-white/5 text-center">
                              <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Min Fare</p>
                              <p className="text-xl font-black text-emerald-400">{t.fare}</p>
                           </div>
                        </div>

                        <button 
                          onClick={() => { setSelectedTransport(t); setBookingStep(1); }}
                          className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-500/30 transition-all uppercase tracking-[0.2em] text-xs"
                        >
                          Book Now
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className={`${darkMode ? 'bg-[#0f172a]' : 'bg-white'} rounded-[48px] border ${darkMode ? 'border-white/10' : 'border-gray-200'} shadow-[0_0_80px_rgba(0,0,0,0.5)] overflow-hidden max-w-5xl mx-auto flex flex-col min-h-[600px]`}>
                   {/* Step Navigator */}
                   <div className="p-8 border-b border-white/5 bg-black/40 flex items-center justify-between">
                      <div className="flex items-center gap-6">
                         <button onClick={() => setBookingStep(null)} className="p-3 hover:bg-white/10 rounded-2xl transition-all border border-white/10"><X className="w-6 h-6" /></button>
                         <div>
                            <h3 className="text-2xl font-black uppercase italic tracking-tighter leading-none">{selectedTransport.type} Booking Logic</h3>
                            <div className="flex gap-2 mt-3">
                               {[1,2,3,4].map(s => <div key={s} className={`h-1.5 w-12 rounded-full transition-all duration-500 ${bookingStep >= s ? 'bg-blue-500' : 'bg-white/10'}`}></div>)}
                            </div>
                         </div>
                      </div>
                      <div className="hidden md:flex items-center gap-4 bg-black/20 p-4 rounded-3xl border border-white/5">
                         <div className={`${selectedTransport.color} p-2 rounded-xl`}>
                            <selectedTransport.icon className="w-5 h-5 text-white" />
                         </div>
                         <p className="text-xs font-black uppercase opacity-60">Manifesting Virtual Ticket</p>
                      </div>
                   </div>

                   <div className="flex-1 overflow-y-auto custom-scrollbar">
                      {/* STEP 1: ROUTE SELECTION */}
                      {bookingStep === 1 && (
                         <div className="p-12 space-y-12 animate-slide-up">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                               <div className="space-y-10">
                                  <div>
                                     <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] block mb-4 ml-1">Detecting Node Source</label>
                                     <div className="relative group">
                                        <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform" />
                                        <input 
                                          type="text" 
                                          placeholder="Enter current location..." 
                                          value={bookingData.source}
                                          onChange={(e) => setBookingData({...bookingData, source: e.target.value})}
                                          className="w-full bg-white/5 border border-white/10 rounded-3xl py-6 pl-16 pr-8 font-black uppercase text-sm outline-none focus:border-blue-500 focus:bg-white/10 transition-all" 
                                        />
                                     </div>
                                  </div>
                                  <div>
                                     <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] block mb-4 ml-1">Target Destination Node</label>
                                     <div className="relative group">
                                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform" />
                                        <input 
                                          type="text" 
                                          placeholder="Where to?" 
                                          value={bookingData.destination}
                                          onChange={(e) => setBookingData({...bookingData, destination: e.target.value})}
                                          className="w-full bg-white/5 border border-white/10 rounded-3xl py-6 pl-16 pr-8 font-black uppercase text-sm outline-none focus:border-blue-500 focus:bg-white/10 transition-all" 
                                        />
                                     </div>
                                  </div>
                               </div>
                               <div className="bg-black/60 rounded-[40px] border border-white/5 flex items-center justify-center relative overflow-hidden group min-h-[300px]">
                                  <div className="absolute inset-0 opacity-20 grayscale brightness-50">
                                     <CityMap mode="transport" hidetools />
                                  </div>
                                  <div className="relative z-10 p-8 bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl text-center shadow-2xl">
                                     <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2 italic">Neural Path Engine</p>
                                     <h4 className="text-xl font-black italic uppercase">Chennai Grid Scan</h4>
                                  </div>
                               </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-8 pt-12 border-t border-white/5">
                               <div className="flex gap-12">
                                  <div className="text-center">
                                     <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1 italic">Distance</p>
                                     <p className="text-2xl font-black text-white italic">12.4 KM</p>
                                  </div>
                                  <div className="text-center">
                                     <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1 italic">Scan Time</p>
                                     <p className="text-2xl font-black text-white italic">28 Mins</p>
                                  </div>
                                  <div className="text-center">
                                     <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1 italic">Neural Fare</p>
                                     <p className="text-2xl font-black text-emerald-400 italic">{selectedTransport.fare === '₹5/hr' ? '₹15' : selectedTransport.fare}</p>
                                  </div>
                               </div>
                               <button 
                                 onClick={() => setBookingStep(2)}
                                 className="px-16 py-6 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-3xl shadow-2xl shadow-blue-500/30 transition-all uppercase tracking-[0.3em] text-xs italic"
                               >
                                 Continue
                               </button>
                            </div>
                         </div>
                      )}

                      {/* STEP 2: SELECTION LOGIC */}
                      {bookingStep === 2 && (
                         <div className="p-12 space-y-12 animate-slide-up">
                            {selectedTransport.id === 'bus' && (
                               <div className="space-y-12 text-center">
                                  <h4 className="text-xl font-black uppercase italic tracking-widest">Select Your Reserve Seat</h4>
                                  <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 max-w-3xl mx-auto">
                                     {Array.from({ length: 32 }).map((_, i) => (
                                       <button 
                                          key={i} 
                                          onClick={() => setBookingData({...bookingData, selectedSeat: i+1})}
                                          className={`h-14 rounded-2xl border-2 flex items-center justify-center font-black transition-all ${
                                            bookingData.selectedSeat === i+1 ? 'bg-blue-500 border-blue-400 text-white shadow-lg shadow-blue-500/50 scale-110' :
                                            (i % 5 === 0 || i % 7 === 0) ? 'bg-red-500/20 border-red-500/40 text-red-500/50 cursor-not-allowed opacity-50' : 'bg-white/5 border-white/10 hover:border-blue-400 text-gray-400'
                                          }`}
                                       >
                                          {i+1}
                                       </button>
                                     ))}
                                  </div>
                               </div>
                            )}

                            {selectedTransport.id === 'metro' && (
                               <div className="space-y-12">
                                  <h4 className="text-xl font-black uppercase italic tracking-widest text-center">Real-time Platform Feed</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                     <div className="bg-white/5 border border-white/10 p-8 rounded-[32px] text-center shadow-xl">
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6 italic">Next Train ETA</p>
                                        <p className="text-6xl font-black italic tracking-tighter text-blue-400">03:45</p>
                                        <p className="text-xs font-black text-green-400 mt-4 uppercase tracking-[0.2em] italic">On Time • Central Node</p>
                                     </div>
                                     <div className="bg-white/5 border border-white/10 p-8 rounded-[32px] text-center shadow-xl">
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6 italic">Platform Access</p>
                                        <p className="text-6xl font-black italic tracking-tighter text-purple-400">04 B</p>
                                        <p className="text-xs font-black text-gray-400 mt-4 uppercase tracking-[0.2em] italic">Northward Heading</p>
                                     </div>
                                     <div className="bg-white/5 border border-white/10 p-8 rounded-[32px] text-center shadow-xl">
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6 italic">Coach Occupancy</p>
                                        <div className="flex justify-center gap-1.5 h-16 items-end mb-4">
                                           {[80, 45, 90, 30, 60, 20].map((oc, i) => (
                                              <div key={i} className={`w-3 rounded-full transition-all ${oc > 80 ? 'bg-red-500 h-full' : oc > 50 ? 'bg-amber-500 h-3/4' : 'bg-green-500 h-1/2'}`}></div>
                                           ))}
                                        </div>
                                        <p className="text-xs font-black text-green-400 uppercase tracking-[0.2em] italic">Coach 4 Optimal</p>
                                     </div>
                                  </div>
                               </div>
                            )}

                            {selectedTransport.id === 'bike' && (
                               <div className="text-center space-y-12">
                                  <h4 className="text-xl font-black uppercase italic tracking-widest">Nearby Cycle Hubs</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                     {[
                                       { name: 'Adyar Crossing Hub', dist: '50m', bikes: 12 },
                                       { name: 'Besant Nagar Hub', dist: '400m', bikes: 8 },
                                       { name: 'T-Nagar Metro Hub', dist: '1.2km', bikes: 24 }
                                     ].map((h, i) => (
                                       <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-[32px] text-center shadow-xl hover:bg-white/10 transition-all group">
                                          <div className="bg-green-500/20 text-green-500 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                             <MapPin className="w-6 h-6" />
                                          </div>
                                          <h5 className="text-lg font-black uppercase italic leading-tight">{h.name}</h5>
                                          <p className="text-[10px] font-black text-gray-500 uppercase mt-2 mb-6 italic">{h.dist} • Neural Range</p>
                                          <div className="flex justify-between items-center bg-black/40 p-4 rounded-2xl border border-white/5">
                                             <span className="text-[10px] font-black uppercase text-gray-400 italic">Available</span>
                                             <span className="text-xl font-black text-green-400">{h.bikes}</span>
                                          </div>
                                       </div>
                                     ))}
                                  </div>
                               </div>
                            )}

                            <div className="flex justify-between items-center pt-8 border-t border-white/5">
                               <button onClick={() => setBookingStep(1)} className="text-gray-500 font-black uppercase text-xs hover:text-white transition-colors tracking-widest italic">Return to Route</button>
                               <button onClick={() => setBookingStep(3)} className="px-16 py-6 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-3xl shadow-2xl transition-all uppercase tracking-[0.3em] text-xs italic">Sync Payment</button>
                            </div>
                         </div>
                      )}

                      {/* STEP 3: PAYMENT PAGE */}
                      {bookingStep === 3 && (
                         <div className="p-12 space-y-12 animate-slide-up flex flex-col items-center">
                            <h4 className="text-sm font-black uppercase italic tracking-[0.4em] mb-4">Secured Neural Transaction</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                               <div className="space-y-6">
                                  <button onClick={() => setBookingData({...bookingData, paymentMethod: 'upi'})} className={`w-full p-8 rounded-[32px] border transition-all flex items-center gap-6 group ${bookingData.paymentMethod === 'upi' ? 'bg-blue-500/20 border-blue-500 shadow-lg' : 'bg-white/5 border-white/10 hover:border-blue-400'}`}>
                                     <div className={`p-4 rounded-2xl ${bookingData.paymentMethod === 'upi' ? 'bg-blue-500 text-white' : 'bg-black/40 text-gray-500 group-hover:text-blue-400'} transition-all`}>
                                        <Smartphone className="w-8 h-8" />
                                     </div>
                                     <div className="text-left">
                                        <p className="text-lg font-black uppercase italic italic">UPI Payment</p>
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic italic">Instant Scan & Pay</p>
                                     </div>
                                  </button>
                                  <button onClick={() => setBookingData({...bookingData, paymentMethod: 'card'})} className={`w-full p-8 rounded-[32px] border transition-all flex items-center gap-6 group ${bookingData.paymentMethod === 'card' ? 'bg-purple-500/20 border-purple-500 shadow-lg' : 'bg-white/5 border-white/10 hover:border-purple-400'}`}>
                                     <div className={`p-4 rounded-2xl ${bookingData.paymentMethod === 'card' ? 'bg-purple-500 text-white' : 'bg-black/40 text-gray-500 group-hover:text-purple-400'} transition-all`}>
                                        <CreditCard className="w-8 h-8" />
                                     </div>
                                     <div className="text-left">
                                        <p className="text-lg font-black uppercase italic italic">Credit / Debit</p>
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic italic">Verified Global Ledger</p>
                                     </div>
                                  </button>
                               </div>

                               <div className="bg-black/40 border border-white/10 rounded-[40px] p-10 flex flex-col justify-between shadow-2xl relative overflow-hidden">
                                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500 blur-[80px] opacity-10"></div>
                                  <h5 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-10 italic">Price Breakdown</h5>
                                  <div className="space-y-6">
                                     <div className="flex justify-between items-center text-sm font-black uppercase tracking-widest italic">
                                        <span className="text-gray-500">Route Fare</span>
                                        <span>{selectedTransport.fare === '₹5/hr' ? '₹15.00' : selectedTransport.fare + '.00'}</span>
                                     </div>
                                     <div className="flex justify-between items-center text-sm font-black uppercase tracking-widest italic border-b border-white/5 pb-6">
                                        <span className="text-gray-500">Service Fee</span>
                                        <span>₹2.45</span>
                                     </div>
                                     <div className="flex justify-between items-center pt-2">
                                        <span className="text-xs font-black uppercase tracking-widest italic">Total Final</span>
                                        <span className="text-4xl font-black italic tracking-tighter text-blue-400">₹{selectedTransport.fare === '₹5/hr' ? '17.45' : (parseInt(selectedTransport.fare.replace('₹','')) + 2.45).toFixed(2)}</span>
                                     </div>
                                  </div>
                               </div>
                            </div>
                            <button 
                               onClick={() => setBookingStep(4)}
                               className="w-full max-w-sm py-6 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-3xl shadow-2xl shadow-blue-500/30 transition-all uppercase tracking-[0.4em] text-xs italic mt-8 animate-pulse"
                            >
                               Pay Now & Manifest
                            </button>
                         </div>
                      )}

                      {/* STEP 4: CONFIRMATION PAGE */}
                      {bookingStep === 4 && (
                         <div className="p-16 text-center space-y-12 animate-slide-up flex flex-col items-center">
                            <div className="w-24 h-24 bg-green-500/20 border-2 border-green-500 rounded-full flex items-center justify-center text-green-500 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                               <CheckCircle2 className="w-12 h-12 animate-bounce" />
                            </div>
                            <div>
                               <h2 className="text-6xl font-black italic uppercase tracking-tighter leading-none italic italic">Trip Manifested</h2>
                               <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em] mt-4 italic italic">Safe travels through Chennai Smart City Network</p>
                            </div>

                            <div className="bg-white text-slate-900 rounded-[40px] p-1 shadow-[0_30px_100px_rgba(59,130,246,0.3)] max-w-md w-full group overflow-hidden">
                               <div className="bg-slate-50 p-10 rounded-[38px] border-4 border-dashed border-slate-200 relative">
                                  <div className="flex justify-between items-start mb-10">
                                     <div className="text-left">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Ticket ID</p>
                                        <p className="text-sm font-black tracking-tighter italic">CS-TXN-932-A</p>
                                     </div>
                                     <Activity className="w-8 h-8 text-blue-500" />
                                  </div>

                                  <div className="bg-white p-8 rounded-3xl shadow-inner border border-slate-100 flex items-center justify-center mb-10 group-hover:scale-105 transition-transform duration-700">
                                     <QrCode className="w-32 h-32 text-slate-900" />
                                  </div>

                                  <div className="flex justify-between border-t border-slate-200 pt-8 mt-2">
                                     <div className="text-left">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Departure Node</p>
                                        <p className="text-xs font-black uppercase italic">{bookingData.source || 'Current Node'}</p>
                                     </div>
                                     <div className="text-right">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Vehicle Type</p>
                                        <p className="text-xs font-black uppercase italic">{selectedTransport.type}</p>
                                     </div>
                                  </div>
                               </div>
                            </div>

                            <div className="flex flex-wrap justify-center gap-6 w-full pt-8">
                               <button className="flex items-center gap-3 px-10 py-5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all italic italic italic">Download Artifact</button>
                               <button className="flex items-center gap-3 px-10 py-5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all italic italic italic">Neural Share</button>
                               <button 
                                 onClick={() => { setActiveTab('traffic'); setBookingStep(null); }}
                                 className="flex items-center gap-3 px-10 py-5 bg-blue-600 shadow-xl shadow-blue-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all italic italic italic"
                               >
                                 Track Live Flow
                               </button>
                            </div>
                         </div>
                      )}
                   </div>
                </div>
              )}
           </div>
        )}

        {/* ALERTS TAB (REFINED) */}
        {activeTab === 'alerts' && (
           <div className="space-y-8 animate-fade-in text-white">
              <div className={`${darkMode ? 'bg-white/10' : 'bg-white'} backdrop-blur-md rounded-[40px] p-10 border ${darkMode ? 'border-white/10' : 'border-gray-200'} shadow-2xl flex flex-col md:flex-row justify-between items-center gap-8 border-l-[16px] border-l-blue-500`}>
                 <div>
                    <h2 className="text-5xl font-black uppercase italic tracking-tighter text-blue-400">Alerts Central</h2>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.3em] mt-2 italic italic">Filtering important city-wide safety bulletins</p>
                 </div>
                 <div className="flex bg-black/40 p-2 rounded-3xl border border-white/10">
                    {['all', 'critical', 'warning', 'info'].map(f => (
                       <button 
                         key={f}
                         onClick={() => setAlertFilter(f)}
                         className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            alertFilter === f ? 'bg-blue-500 text-white shadow-xl shadow-blue-500/30' : 'text-gray-500 hover:text-white'
                         }`}
                       >
                          {f}
                       </button>
                    ))}
                 </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 {alertsData
                   .filter(a => alertFilter === 'all' || a.type === alertFilter)
                   .map(a => (
                   <div key={a.id} className={`${darkMode ? 'bg-white/10' : 'bg-white'} backdrop-blur-xl rounded-[40px] p-10 border ${darkMode ? 'border-white/10' : 'border-gray-200'} shadow-2xl flex items-center gap-10 group hover:bg-white/[0.15] transition-all border-l-8 border-l-current ${a.type === 'critical' ? 'text-red-500' : a.type === 'warning' ? 'text-amber-500' : 'text-blue-500'}`}>
                      <div className={`w-20 h-20 rounded-[32px] flex items-center justify-center border-2 border-current bg-current/10 shadow-2xl group-hover:rotate-6 transition-transform`}>
                         <AlertCircle className="w-10 h-10" />
                      </div>
                      <div className="flex-1">
                         <div className="flex justify-between items-center mb-4">
                            <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest italic italic">{a.time} • Local System</span>
                            <span className="text-[9px] font-black px-4 py-1.5 rounded-full border border-current bg-current/5 uppercase tracking-[0.2em]">{a.type} PRIORITY</span>
                         </div>
                         <p className="text-2xl font-black uppercase tracking-tighter leading-tight italic line-clamp-2 text-white">{a.message}</p>
                      </div>
                   </div>
                 ))}
                 {alertsData.filter(a => alertFilter === 'all' || a.type === alertFilter).length === 0 && (
                    <div className="lg:col-span-2 py-20 text-center opacity-20 italic font-black text-2xl uppercase tracking-widest">No Active Alerts In This Domain</div>
                 )}
              </div>
           </div>
        )}

        {/* TRAFFIC TAB (FULL SCREEN) */}
        {activeTab === 'traffic' && (
           <div className="space-y-6 animate-fade-in text-white h-[750px] flex flex-col relative">
              <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20 flex gap-4 bg-black/60 backdrop-blur-3xl p-3 rounded-[32px] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                 {[
                   { label: 'Congestion', color: 'bg-red-500' },
                   { label: 'Accidents', color: 'bg-amber-500' },
                   { label: 'Roadblocks', color: 'bg-blue-500' }
                 ].map(t => (
                    <button key={t.label} className="flex items-center gap-3 px-8 py-3 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all font-black uppercase text-[10px] tracking-widest">
                       <div className={`w-2 h-2 rounded-full ${t.color}`}></div>
                       {t.label}
                    </button>
                 ))}
              </div>

              <div className="flex-1 rounded-[48px] border border-white/10 overflow-hidden relative shadow-2xl">
                 <CityMap mode="traffic" heatmap hidetools />
                 
                 {/* Floating Info Overlay (Simplified) */}
                 <div className="absolute bottom-10 right-10 p-10 bg-[#0f172a]/95 backdrop-blur-2xl border border-white/10 rounded-[40px] max-w-sm shadow-[0_50px_100px_rgba(0,0,0,0.8)] border-b-8 border-b-red-500">
                    <p className="text-[10px] font-black text-red-400 uppercase tracking-[0.3em] mb-4 italic">Neural Congestion Feed</p>
                    <p className="text-lg font-black text-white italic italic leading-relaxed uppercase">Heavy congestion detected at T-Nagar Node. Rerouting 12.5% city traffic to OMR link.</p>
                    <div className="mt-8 flex justify-between items-center bg-black/40 p-4 rounded-2xl border border-white/5">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Flow Rate</span>
                        <span className="text-xl font-black text-blue-400">68%</span>
                    </div>
                 </div>
              </div>
           </div>
        )}

        {/* SERVICES TAB */}
        {activeTab === 'services' && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in relative">
              {/* CCTV CARD */}
              <div 
                 className={`cursor-default ${darkMode ? 'bg-white/10' : 'bg-white'} backdrop-blur-md rounded-2xl p-8 border ${darkMode ? 'border-white/10' : 'border-gray-200'} shadow-lg group`}
              >
                 <div className={`bg-red-500 p-4 rounded-xl mb-4 shadow-lg inline-block`}><Camera className="w-6 h-6 text-white" /></div>
                 <h3 className="font-black uppercase italic text-sm">CCTV Active</h3>
                 <p className="text-3xl font-black tracking-tighter mt-1">{servicesData.cctv?.length || 0} Total Cams</p>
                 <div className="flex gap-4 mt-2">
                    <p className="text-[10px] uppercase font-bold text-emerald-400">{servicesData.cctv?.filter(c => c.status === 'active').length || 0} Active</p>
                    <p className="text-[10px] uppercase font-bold text-rose-400">{servicesData.cctv?.filter(c => c.status !== 'active').length || 0} Inactive</p>
                 </div>
              </div>

              {/* PARKING CARD */}
              <div 
                 onClick={() => setActiveServiceModal('parking')}
                 className={`cursor-pointer ${darkMode ? 'bg-white/10' : 'bg-white'} backdrop-blur-md rounded-2xl p-8 border ${darkMode ? 'border-white/10' : 'border-gray-200'} shadow-lg hover:scale-105 transition-all group`}
              >
                 <div className={`bg-indigo-500 p-4 rounded-xl mb-4 shadow-lg group-hover:scale-110 transition-transform inline-block`}><MapPin className="w-6 h-6 text-white" /></div>
                 <h3 className="font-black uppercase italic text-sm">Smart Parking</h3>
                 <p className="text-3xl font-black tracking-tighter mt-1">{servicesData.parking?.reduce((acc, h) => acc + (h.total_slots - h.occupied_slots), 0) || 0} Slots</p>
                 <p className="text-[10px] uppercase font-bold text-gray-400 mt-2">Tap to Park & Pay</p>
              </div>

              {/* SOS CARD */}
              <div 
                 onClick={() => handleServiceAction({ action: 'sos_trigger', location: 'Citizen Coordinates', user_id: 'User_X' }).then(res => { if(res.success) showToast('SOS Alert Triggered! Neural Link Notified.', 'error')})}
                 className={`cursor-pointer ${darkMode ? 'bg-white/10' : 'bg-white'} backdrop-blur-md rounded-2xl p-8 border ${darkMode ? 'border-white/10' : 'border-gray-200'} shadow-lg hover:scale-105 transition-all group`}
              >
                 <div className={`bg-rose-500 p-4 rounded-xl mb-4 shadow-lg group-hover:scale-110 transition-transform inline-block`}><AlertCircle className="w-6 h-6 text-white" /></div>
                 <h3 className="font-black uppercase italic text-sm">SOS Emergency</h3>
                 <p className="text-3xl font-black tracking-tighter mt-1">{servicesData.sos?.length || 0} Active</p>
                 <p className="text-[10px] uppercase font-bold text-red-500 mt-2">Tap to trigger SOS</p>
              </div>

              {/* WIFI CARD */}
              <div 
                 onClick={() => setActiveServiceModal('wifi')}
                 className={`cursor-pointer ${darkMode ? 'bg-white/10' : 'bg-white'} backdrop-blur-md rounded-2xl p-8 border ${darkMode ? 'border-white/10' : 'border-gray-200'} shadow-lg hover:scale-105 transition-all group`}
              >
                 <div className={`bg-blue-500 p-4 rounded-xl mb-4 shadow-lg group-hover:scale-110 transition-transform inline-block`}><Wifi className="w-6 h-6 text-white" /></div>
                 <h3 className="font-black uppercase italic text-sm">Public WiFi</h3>
                 <p className="text-3xl font-black tracking-tighter mt-1">{servicesData.wifi?.length || 0} Zones</p>
                 <p className="text-[10px] uppercase font-bold text-gray-400 mt-2">Tap to Connect</p>
              </div>
           </div>
        )}

        {/* UTILITIES TAB */}
        {activeTab === 'utilities' && (
           <div className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 {[
                { name: 'Water Flow', key: 'water', unit: 'ML/day', color: '#60a5fa', icon: Droplets },
                { name: 'Grid Consumption', key: 'electricity', unit: 'GWh', color: '#fbbf24', icon: Zap },
                { name: 'Climate Stat', key: 'temperature', unit: '°C', color: '#fb923c', icon: ThermometerSun }
              ].map((util) => (
                <div key={util.key} className="bg-white/10 backdrop-blur-xl rounded-[40px] p-8 border border-white/5 shadow-2xl flex flex-col h-[400px]">
                   <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-4">
                         <div className="bg-black/20 p-3 rounded-xl"><util.icon className="w-8 h-8" style={{ color: util.color }} /></div>
                         <h3 className="text-xl font-black uppercase italic italic">{util.name}</h3>
                      </div>
                      <p className="text-3xl font-black">{utilityHistory[util.key]?.length > 0 ? utilityHistory[util.key][utilityHistory[util.key].length - 1].value : '--'}</p>
                   </div>
                   <div className="flex-1 w-full min-h-0 bg-black/20 rounded-3xl p-4">
                      <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={utilityHistory[util.key]}>
                            <Area type="monotone" dataKey="value" stroke={util.color} strokeWidth={4} fill={util.color} fillOpacity={0.1} />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: 'none', borderRadius: '16px', fontSize: '10px', fontWeight: 'bold' }} />
                         </AreaChart>
                      </ResponsiveContainer>
                   </div>
                </div>
              ))}
           </div>
           
           {/* Embedded Neural AI Assistant for Utilities */}
           <div className={`mt-8 flex flex-col h-[500px] rounded-[40px] overflow-hidden shadow-2xl border ${darkMode ? 'bg-black/40 backdrop-blur-2xl border-white/10' : 'bg-white/95 backdrop-blur-2xl border-gray-200'} transition-all`}>
               <div className="p-6 border-b border-white/10 bg-blue-600 flex items-center gap-4 text-white">
                  <div className="bg-white/20 p-3 rounded-2xl shadow-inner">
                     <Activity className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                     <h3 className="text-lg font-black uppercase tracking-widest italic">Utilities Neural Core</h3>
                     <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Ask me about ice cream, laundry, and weather</p>
                  </div>
               </div>
               
               <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-gradient-to-b from-transparent to-black/20">
                  {chatMessages.map((msg, idx) => (
                     <div key={idx} className={`max-w-[75%] ${msg.role === 'user' ? 'ml-auto' : 'mr-auto'} group`}>
                        <div className={`p-5 rounded-3xl shadow-xl ${
                           msg.role === 'user' 
                           ? 'bg-blue-600 text-white rounded-tr-sm border border-blue-500' 
                           : `${darkMode ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'} border ${darkMode ? 'border-white/10' : 'border-gray-200'} rounded-tl-sm backdrop-blur-md`
                        }`}>
                           <p className="text-sm font-semibold whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                        </div>
                        <p className={`text-[9px] font-black uppercase tracking-widest mt-2 opacity-50 group-hover:opacity-100 transition-opacity ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                           {msg.role === 'user' ? 'Citizen Request' : 'Neural Response'}
                        </p>
                     </div>
                  ))}
                  {isTyping && (
                     <div className="mr-auto w-20 p-5 rounded-3xl bg-white/10 border border-white/10 rounded-tl-sm flex justify-center gap-2 backdrop-blur-md">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                     </div>
                  )}
               </div>

               <div className="p-6 border-t border-white/10 bg-black/40">
                  <form onSubmit={handleSendMessage} className="relative flex items-center max-w-4xl mx-auto">
                     <input 
                        type="text" 
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="E.g. Shall I eat ice cream? Can I use my washing machine?" 
                        className={`w-full py-5 pl-8 pr-16 rounded-3xl outline-none text-sm font-semibold transition-all ${
                           darkMode ? 'bg-white/5 focus:bg-white/10 text-white placeholder-gray-500 border border-white/10 focus:border-blue-500 shadow-inner' : 
                           'bg-gray-100 focus:bg-white text-gray-900 placeholder-gray-400 border border-gray-200 focus:border-blue-500 shadow-inner'
                        }`}
                     />
                     <button 
                        type="submit" 
                        disabled={!chatInput.trim()}
                        className="absolute right-3 p-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all shadow-lg hover:scale-105"
                     >
                        <Send className="w-5 h-5" />
                     </button>
                  </form>
               </div>
           </div>
        </div>
        )}

        {/* SERVICES MODALS */}

        {activeServiceModal === 'parking' && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6" onClick={() => setActiveServiceModal(null)}>
              <div className="w-full max-w-xl bg-slate-900 border border-indigo-500/30 p-8 rounded-[40px] shadow-2xl relative" onClick={e => e.stopPropagation()}>
                 <button onClick={() => setActiveServiceModal(null)} className="absolute top-6 right-6 text-white/50 hover:text-white"><X className="w-6 h-6" /></button>
                 <h2 className="text-2xl font-black uppercase text-white mb-6 flex items-center gap-3"><MapPin className="text-indigo-500" /> Smart Parking Kiosk</h2>
                 <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
                    {servicesData.parking?.map(hub => {
                       const isParkedHere = hub.active_sessions?.['User_X'] !== undefined;
                       return (
                       <div key={hub.id} className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                          <div className="flex justify-between items-center mb-4">
                             <h4 className="text-white font-bold text-lg">{hub.name}</h4>
                             <span className="text-xs font-black uppercase tracking-widest text-indigo-400">{hub.total_slots - hub.occupied_slots} Slots Free</span>
                          </div>
                          <div className="w-full h-2 bg-black rounded-full overflow-hidden mb-4">
                             <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${(hub.occupied_slots / hub.total_slots)*100}%` }}></div>
                          </div>
                          {isParkedHere ? (
                             <button onClick={async () => {
                                const res = await handleServiceAction({ action: 'park_exit', hub_id: hub.id, user_id: 'User_X' });
                                if(res.success) {
                                   showToast(`Parking Session Ended. Proceeding to payment...`);
                                   fetchServicesData();
                                   setActiveServiceModal(null);
                                   setTimeout(() => {
                                      navigate('/payment', { state: { parkingSession: res } });
                                   }, 1500);
                                }
                             }} className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-lg hover:scale-[1.02]">
                                Exit & Pay Fee
                             </button>
                          ) : (
                             <button onClick={async () => {
                                const res = await handleServiceAction({ action: 'park_start', hub_id: hub.id, user_id: 'User_X' });
                                if(res.success) {
                                   showToast('Parking timer officially started!');
                                   fetchServicesData();
                                }
                             }} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-lg hover:scale-[1.02]">
                                Park Here
                             </button>
                          )}
                       </div>
                    )})}
                 </div>
              </div>
           </div>
        )}

        {activeServiceModal === 'wifi' && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6" onClick={() => setActiveServiceModal(null)}>
              <div className="w-full max-w-sm bg-blue-950 border border-blue-500/30 p-8 rounded-[40px] shadow-2xl relative text-center" onClick={e => e.stopPropagation()}>
                 <button onClick={() => setActiveServiceModal(null)} className="absolute top-6 right-6 text-white/50 hover:text-white"><X className="w-6 h-6" /></button>
                 <div className="mx-auto w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.5)] mb-6">
                    <Wifi className="w-8 h-8 text-white animate-pulse" />
                 </div>
                 <h2 className="text-2xl font-black uppercase text-white mb-2">CityLink WiFi</h2>
                 <p className="text-blue-300 text-sm mb-8 font-semibold">Select a zone to connect securely.</p>
                 <div className="space-y-4 text-left">
                    {servicesData.wifi?.map(zone => (
                       <div key={zone.id} className="p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-blue-500/50 transition-all flex justify-between items-center group cursor-pointer" onClick={async () => {
                          const res = await handleServiceAction({action:'wifi_connect', zone_id: zone.id});
                          if(res.success) { showToast(`Connected to ${zone.location} Neural Network!`); fetchServicesData(); }
                          else showToast(res.message, 'error');
                       }}>
                          <div>
                             <h4 className="text-white text-sm font-bold">{zone.location}</h4>
                             <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Users: {zone.active_users}/{zone.total_capacity}</p>
                          </div>
                          <div className="text-[10px] font-black uppercase tracking-widest text-emerald-400 group-hover:scale-110 transition-transform">
                             {zone.signal} Signal
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        )}

        {/* FLOATING SOS BUTTON */}
        <button 
           onClick={() => handleServiceAction({ action: 'sos_trigger', location: 'Citizen Mobile Base', user_id: 'User_X' }).then(res => { if(res.success) { showToast('CRITICAL: SOS Triggered. Location Sent to Control Center.', 'error'); fetchServicesData(); }})}
           className="fixed bottom-6 left-6 z-50 bg-rose-600 hover:bg-rose-500 text-white p-4 rounded-full shadow-[0_0_40px_rgba(225,29,72,0.6)] hover:scale-110 transition-all block lg:hidden md:hidden"
        >
           <AlertCircle className="w-8 h-8 flex-shrink-0 animate-pulse" />
        </button>
        <button 
           onClick={() => handleServiceAction({ action: 'sos_trigger', location: 'Citizen Mobile Base', user_id: 'User_X' }).then(res => { if(res.success) { showToast('CRITICAL: SOS Triggered. Location Sent to Control Center.', 'error'); fetchServicesData(); }})}
           className="fixed bottom-6 left-6 z-50 bg-rose-600 hover:bg-rose-500 text-white p-4 rounded-full shadow-[0_0_40px_rgba(225,29,72,0.6)] hover:scale-110 transition-all lg:flex md:flex hidden items-center gap-0 hover:gap-3 overflow-hidden group"
        >
           <AlertCircle className="w-8 h-8 flex-shrink-0 animate-pulse" />
           <span className="max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100 transition-all duration-300 font-black uppercase tracking-widest whitespace-nowrap text-sm pr-4">Emergency Dispatch</span>
        </button>

        {/* Neural Toast UI */}
        {toastMessage && (
           <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-[100] animate-fade-in pointer-events-none">
              <div className={`${toastMessage.type === 'error' ? 'bg-rose-600' : 'bg-emerald-500'} text-white px-8 py-4 rounded-full shadow-[0_0_40px_rgba(0,0,0,0.5)] font-black uppercase tracking-widest text-sm flex items-center gap-3 whitespace-nowrap`}>
                 {toastMessage.type === 'error' ? <AlertCircle className="w-5 h-5 animate-pulse" /> : <CheckCircle2 className="w-5 h-5" />}
                 {toastMessage.msg}
              </div>
           </div>
        )}

      </main>



    </div>
  );
}
