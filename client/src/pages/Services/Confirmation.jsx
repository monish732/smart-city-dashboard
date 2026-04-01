import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, Home, Receipt, MapPin, Share2, Download, ShieldCheck } from 'lucide-react';

const Confirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { parkingSession } = location.state || {};
  const [downloading, setDownloading] = useState(false);

  const handleDownloadReceipt = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      // Mock download success
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Radiance */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(37,99,235,0.1)_0%,_transparent_70%)]"></div>
      
      <div className="w-full max-w-2xl bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[60px] p-12 text-center relative z-10 shadow-2xl animate-fade-in translate-y-0">
        <div className="relative mb-12 inline-block">
           <div className="absolute inset-0 bg-blue-600 blur-[80px] opacity-30 animate-pulse rounded-full"></div>
           <div className="w-40 h-40 bg-blue-600 rounded-[50px] flex items-center justify-center relative translate-y-0 hover:-translate-y-2 transition-transform shadow-[0_25px_50px_rgba(37,99,235,0.5)] border-4 border-white/20">
              <CheckCircle2 className="w-20 h-20 text-white stroke-[3px]" />
           </div>
        </div>

        <h1 className="text-5xl font-black italic uppercase tracking-tighter mb-4 translate-y-0">Payment Success</h1>
        <p className="text-slate-400 font-bold uppercase tracking-[0.4em] text-[10px] mb-12 opacity-70">
           Digital Handshake Verified SC-{Math.random().toString(36).substr(2, 9).toUpperCase()}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
           <div className="bg-white/5 rounded-[40px] p-8 border border-white/5 text-left group">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 italic mb-4">
                 <MapPin className="w-4 h-4 text-blue-400" /> Location Node
              </span>
              <p className="font-black uppercase tracking-tighter italic text-2xl group-hover:text-blue-400 transition-colors">{parkingSession?.location || 'Unknown Hub'}</p>
           </div>
           <div className="bg-white/5 rounded-[40px] p-8 border border-white/5 text-left group">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 italic mb-4">
                 <Receipt className="w-4 h-4 text-emerald-400" /> Amount Cleared
              </span>
              <p className="font-black italic text-2xl text-blue-400 group-hover:text-emerald-400 transition-colors">$ {parkingSession?.fee || '0.00'}</p>
           </div>
        </div>

        <div className="bg-black/40 rounded-[40px] p-10 border border-white/5 mb-12 space-y-8">
           <div className="flex items-center gap-4 p-5 bg-white/5 rounded-3xl border border-white/5 opacity-80 group">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              <p className="text-[10px] font-bold uppercase text-slate-400 tracking-tighter text-left leading-relaxed">
                 Transaction logged on the City Neural Grid. Slot updated to <span className="text-emerald-400">VACANT</span> at {new Date().toLocaleTimeString()}.
              </p>
           </div>

           <div className="flex gap-4">
              <button 
                 onClick={handleDownloadReceipt}
                 disabled={downloading}
                 className="flex-1 py-5 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 group disabled:opacity-50"
              >
                 {downloading ? 'Generating...' : (
                    <><Download className="w-5 h-5 group-hover:scale-110 transition-transform" /> Download Receipt</>
                 )}
              </button>
              <button className="flex-1 py-5 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 group">
                 <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" /> Share Proof
              </button>
           </div>
        </div>

        <div className="flex flex-col gap-4">
           <button 
              onClick={() => navigate('/dashboard')}
              className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-[32px] font-black uppercase tracking-[0.3em] shadow-xl hover:shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-3"
           >
              <Home className="w-6 h-6" /> Back to Dashboard
           </button>
           <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.5em] mt-4">Safe Travels • Citizen #001</p>
        </div>
      </div>
    </div>
  );
};

export default Confirmation;
