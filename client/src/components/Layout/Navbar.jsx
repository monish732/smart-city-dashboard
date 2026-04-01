import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Bell, LogOut, Sun, Activity } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Navbar() {
    const { role, signOut } = useAuth();
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const navLinks = [
        { name: 'Overview', path: role === 'admin' ? '/admin' : '/dashboard' },
        { name: 'Traffic', path: '#traffic' },
        { name: 'Utilities', path: '#utilities' },
        { name: 'Transport', path: '#transport' },
        { name: 'Services', path: '#services' },
        { name: 'Alerts', path: '#alerts' },
    ];

    return (
        <header className="bg-[#111827] border-b border-slate-800/80 flex flex-col shadow-xl z-20 w-full px-8 pt-5">
            {/* Top Row */}
            <div className="flex justify-between items-center pb-5">
                <div className="flex items-center gap-4">
                    <Activity className="text-blue-500 w-8 h-8" />
                    <div>
                        <h1 className="text-[22px] font-bold tracking-wide text-white leading-tight">Smart City Control</h1>
                        <p className="text-xs text-slate-400 font-medium tracking-wider">Real-time Monitoring System</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-8">
                    <div className="relative cursor-pointer">
                        <Bell className="w-6 h-6 text-slate-400 hover:text-white transition-colors" />
                        <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">3</span>
                    </div>
                    
                    <div className="w-10 h-10 rounded-xl bg-[#1e293b] border border-slate-700/50 flex items-center justify-center cursor-pointer shadow-inner">
                        <Sun className="w-5 h-5 text-amber-400" />
                    </div>

                    <div className="text-right border-l border-slate-700/50 pl-6">
                        <p className="text-[11px] text-slate-400 tracking-wider uppercase">{time.toLocaleDateString()}</p>
                        <p className="text-sm font-bold text-white tracking-widest">{time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}</p>
                    </div>
                    
                    <button onClick={signOut} className="text-slate-400 hover:text-white ml-2">
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>
            
            {/* Bottom Row Nav */}
            <nav className="flex items-center gap-10 mt-2">
                {navLinks.map(link => (
                    <NavLink
                        key={link.name}
                        to={link.path}
                        className={({ isActive }) => 
                            `pb-4 text-sm font-semibold tracking-wide transition-colors relative ${
                                isActive 
                                ? 'text-blue-500 border-b-2 border-blue-500' 
                                : 'text-slate-400 hover:text-slate-200'
                            }`
                        }
                        end={link.name === 'Overview'}
                    >
                        {link.name}
                    </NavLink>
                ))}
            </nav>
        </header>
    );
}
