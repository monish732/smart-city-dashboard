import { MapContainer, TileLayer, Popup, Circle, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useState, useEffect } from 'react';
import { Wifi, Zap, Droplets, Camera } from 'lucide-react';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const CHENNAI_CENTER = [13.0475, 80.2458]; 

export default function CityMap({ mode = 'traffic', optimizedRoute = [] }) {
    const [cityData, setCityData] = useState({ nodes: [], status: {} });

    const fetchData = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/traffic/live');
            const data = await res.json();
            setCityData(data);
        } catch (err) {
            console.error('Failed to fetch live data:', err);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 1000); 
        return () => clearInterval(interval);
    }, []);

    const getTrafficColor = (level) => {
        if (level === 'red') return '#ef4444';
        if (level === 'yellow') return '#eab308';
        return '#22c55e';
    };

    const getServiceColor = (health) => {
        if (health < 30) return '#f43f5e'; // Deep Red
        if (health < 70) return '#f59e0b'; // Amber
        return '#10b981'; // Emerald
    };

    return (
        <div className="h-full w-full overflow-hidden relative z-0 rounded-2xl bg-slate-200 border border-white/10 shadow-2xl">
            <MapContainer center={CHENNAI_CENTER} zoom={13} className="h-full w-full">
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                
                {cityData.nodes.map(node => {
                    const status = cityData.status[node.id] || { congestion: 'green', services: { wifi: 100, power: 100, water: 100, cctv: 100 } };
                    
                    if (mode === 'traffic') {
                        const color = getTrafficColor(status.congestion);
                        return (
                            <Circle 
                                key={`traffic-${node.id}`} 
                                center={node.coords} 
                                radius={800} 
                                pathOptions={{ color, fillColor: color, fillOpacity: 0.4, weight: 2 }}
                            >
                                <Popup>
                                    <div className="font-sans p-2">
                                        <h4 className="font-black text-slate-800 uppercase text-xs mb-1 tracking-widest">{node.name}</h4>
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></span>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase">{status.congestion} CONGESTION</span>
                                        </div>
                                    </div>
                                </Popup>
                            </Circle>
                        );
                    } else {
                        // Services Mode
                        const sv = status.services;
                        const avgHealth = (sv.power + sv.water + (sv.cctv ? 100 : 0)) / 3;
                        const isOutage = sv.power < 30 || sv.water < 30 || sv.cctv === 0;
                        const mainColor = getServiceColor(avgHealth);

                        return (
                            <Circle 
                                key={`service-${node.id}`} 
                                center={node.coords} 
                                radius={isOutage ? 1200 : 800} 
                                pathOptions={{ 
                                    color: isOutage ? '#f43f5e' : mainColor, 
                                    fillColor: mainColor, 
                                    fillOpacity: isOutage ? 0.3 : 0.1, 
                                    weight: isOutage ? 4 : 2,
                                    dashArray: isOutage ? '10, 20' : '0'
                                }}
                                className={isOutage ? 'animate-pulse' : ''}
                            >
                                <Popup className="custom-popup">
                                    <div className="font-sans p-3 min-w-[180px]">
                                        <h4 className="font-black text-slate-800 uppercase text-[10px] mb-3 tracking-widest border-b pb-2">{node.name} SERVICES</h4>
                                        <div className="space-y-3">
                                            {[
                                                { label: 'Power Grid', val: sv.power, icon: Zap },
                                                { label: 'Water Supply', val: sv.water, icon: Droplets },
                                                { label: 'CCTV Feed', val: sv.cctv, icon: Camera }
                                            ].map(s => (
                                                <div key={s.label} className="space-y-1">
                                                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-600">
                                                        <div className="flex items-center gap-2">
                                                            <s.icon className="w-3 h-3 text-slate-400" />
                                                            <span>{s.label}</span>
                                                        </div>
                                                        <span style={{ color: getServiceColor(s.val) }}>{s.val}%</span>
                                                    </div>
                                                    <div className="bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                                        <div 
                                                            className="h-full rounded-full transition-all duration-1000"
                                                            style={{ width: `${s.val}%`, backgroundColor: getServiceColor(s.val) }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        {isOutage && (
                                            <div className="mt-4 pt-3 border-t border-rose-100 flex items-center justify-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></div>
                                                <span className="text-[10px] font-black text-rose-500 uppercase">Service Outage Detected</span>
                                            </div>
                                        )}
                                    </div>
                                </Popup>
                            </Circle>
                        );
                    }
                })}

                {mode === 'traffic' && optimizedRoute.length > 0 && (
                    <Polyline 
                        positions={optimizedRoute.map(n => n.coords)} 
                        pathOptions={{ color: '#3b82f6', weight: 8, opacity: 0.8, dashArray: '10, 15', className: 'animate-pulse' }} 
                    />
                )}
            </MapContainer>
        </div>
    );
}
