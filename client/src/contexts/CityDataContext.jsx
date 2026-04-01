import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const CityDataContext = createContext({});

export const CityDataProvider = ({ children }) => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [traffic, setTraffic] = useState([]);
  const [parking, setParking] = useState([]);
  const [transport, setTransport] = useState([]);
  const [electricity, setElectricity] = useState([]);
  const [water, setWater] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    fetchInitialData();

    // Set up Realtime Subscriptions
    const alertsSub = supabase.channel('public:alerts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts' }, payload => {
        if (payload.eventType === 'INSERT') setAlerts(prev => [payload.new, ...prev]);
        else if (payload.eventType === 'DELETE') setAlerts(prev => prev.filter(al => al.id !== payload.old.id));
      }).subscribe();

    const trafficSub = supabase.channel('public:traffic')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'traffic' }, payload => {
        setTraffic(prev => prev.map(t => t.id === payload.new.id ? payload.new : t));
      }).subscribe();

    const parkingSub = supabase.channel('public:parking')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'parking' }, payload => {
        setParking(prev => prev.map(p => p.id === payload.new.id ? payload.new : p));
      }).subscribe();

    const electricitySub = supabase.channel('public:electricity')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'electricity' }, payload => {
        setElectricity(prev => prev.map(e => e.id === payload.new.id ? payload.new : e));
      }).subscribe();

    const waterSub = supabase.channel('public:water_supply')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'water_supply' }, payload => {
        setWater(prev => prev.map(w => w.id === payload.new.id ? payload.new : w));
      }).subscribe();

    const transportSub = supabase.channel('public:transport')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'transport' }, payload => {
        setTransport(prev => prev.map(t => t.id === payload.new.id ? payload.new : t));
      }).subscribe();

    return () => {
      supabase.removeChannel(alertsSub);
      supabase.removeChannel(trafficSub);
      supabase.removeChannel(parkingSub);
      supabase.removeChannel(electricitySub);
      supabase.removeChannel(waterSub);
      supabase.removeChannel(transportSub);
    };
  }, [user]);

  const fetchInitialData = async () => {
    setLoading(true);
    const [alertsRes, trafficRes, parkingRes, transportRes, elecRes, waterRes] = await Promise.all([
      supabase.from('alerts').select('*').order('created_at', { ascending: false }).limit(20),
      supabase.from('traffic').select('*'),
      supabase.from('parking').select('*'),
      supabase.from('transport').select('*'),
      supabase.from('electricity').select('*'),
      supabase.from('water_supply').select('*')
    ]);

    if(alertsRes.data) setAlerts(alertsRes.data);
    if(trafficRes.data) setTraffic(trafficRes.data);
    if(parkingRes.data) setParking(parkingRes.data);
    if(transportRes.data) setTransport(transportRes.data);
    if(elecRes.data) setElectricity(elecRes.data);
    if(waterRes.data) setWater(waterRes.data);

    setLoading(false);
  };

  return (
    <CityDataContext.Provider value={{ alerts, traffic, parking, transport, electricity, water, loading }}>
        {children}
    </CityDataContext.Provider>
  );
};

export const useCityData = () => useContext(CityDataContext);
