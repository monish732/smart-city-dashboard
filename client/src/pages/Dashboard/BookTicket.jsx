import React, { useState } from 'react';
import { useCityData } from '../../contexts/CityDataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Ticket, CreditCard, CheckCircle } from 'lucide-react';

export default function BookTicket() {
  const { transport } = useCityData();
  const { user } = useAuth();
  const [selectedTransport, setSelectedTransport] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleBook = async (e) => {
    e.preventDefault();
    if(!selectedTransport) return;
    setLoading(true);
    try {
        const res = await fetch('http://localhost:5000/api/bookings', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ user_id: user.id, transport_id: selectedTransport })
        });
        if(res.ok) setSuccess(true);
    } catch(err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  return (
      <div className="max-w-2xl mx-auto space-y-6 mt-8 fade-in">
          <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 rounded-3xl p-10 text-white shadow-xl">
              <h2 className="text-4xl font-extrabold flex items-center gap-4 tracking-tight"><Ticket className="w-10 h-10 text-white/90"/> Book City Transit</h2>
              <p className="text-white/80 mt-3 font-medium text-lg">Purchase digital tickets for public transportation across the city.</p>
          </div>

          <div className="bg-white rounded-3xl p-10 shadow-sm border border-slate-100">
              {success ? (
                  <div className="text-center py-12 fade-in">
                      <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-12 h-12 text-emerald-500" />
                      </div>
                      <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight">Booking Confirmed!</h3>
                      <p className="text-slate-500 mt-3 text-lg">Your digital ticket has been issued successfully.</p>
                      <button onClick={() => setSuccess(false)} className="mt-10 px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors">Book Another Route</button>
                  </div>
              ) : (
                  <form onSubmit={handleBook} className="space-y-8">
                      <div>
                          <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Select Transit Route</label>
                          <select 
                             className="w-full px-5 py-4 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-slate-50 focus:bg-white transition-all appearance-none cursor-pointer font-medium text-slate-700"
                             value={selectedTransport}
                             onChange={(e) => setSelectedTransport(e.target.value)}
                             required
                          >
                              <option value="">Choose your destination...</option>
                              {transport.map(t => (
                                  <option key={t.id} value={t.id}>{t.type.toUpperCase()} • Route: {t.route} ({t.availability})</option>
                              ))}
                          </select>
                      </div>
                      
                      <div className="bg-slate-50/50 p-6 rounded-2xl flex items-center justify-between border border-slate-200/60">
                          <div className="flex items-center gap-4">
                              <div className="p-3 bg-white rounded-xl shadow-sm">
                                  <CreditCard className="w-6 h-6 text-slate-500" />
                              </div>
                              <div>
                                  <span className="font-bold text-slate-700 block">Digital Payment Required</span>
                                  <span className="text-sm font-medium text-slate-400 block mt-0.5">Secure fixed fare checkout</span>
                              </div>
                          </div>
                          <span className="text-2xl font-black text-slate-900">$2.50</span>
                      </div>

                      <button type="submit" disabled={!selectedTransport || loading} className="w-full py-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-lg disabled:opacity-50 transition-all shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] transform hover:-translate-y-0.5 mt-4">
                          {loading ? 'Processing Transaction...' : 'Confirm Ticket Booking'}
                      </button>
                  </form>
              )}
          </div>
      </div>
  )
}
