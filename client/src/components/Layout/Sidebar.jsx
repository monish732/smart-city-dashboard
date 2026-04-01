import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutDashboard, LogOut, Map, Bell, Ticket } from 'lucide-react';

export default function Sidebar() {
    const { role, signOut } = useAuth();

    const links = [
        { name: 'Dashboard', path: role === 'admin' ? '/admin' : '/dashboard', icon: LayoutDashboard },
        // Common map view
        { name: 'Live Map', path: role === 'admin' ? '/admin/map' : '/dashboard/map', icon: Map },
    ];

    if (role === 'user') {
        links.push({ name: 'Book Tickets', path: '/dashboard/book', icon: Ticket });
    }

    if (role === 'admin') {
        links.push({ name: 'Send Alerts', path: '/admin/alerts', icon: Bell });
    }

    return (
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm z-10 transition-all duration-300">
            <div className="h-16 flex items-center px-6 border-b border-slate-100">
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                    SmartCity
                </span>
            </div>
            
            <nav className="flex-1 px-4 py-6 space-y-2">
                {links.map(link => (
                    <NavLink
                        key={link.name}
                        to={link.path}
                        className={({ isActive }) => 
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                                isActive 
                                ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }`
                        }
                        end
                    >
                        <link.icon className="w-5 h-5" />
                        {link.name}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-100">
                <button 
                    onClick={signOut}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors font-medium"
                >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
