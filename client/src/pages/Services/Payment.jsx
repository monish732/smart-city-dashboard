import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, ArrowRight, ShieldCheck, Clock, MapPin, CheckCircle2, QrCode, Smartphone, Receipt } from 'lucide-react';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { parkingSession } = location.state || {};
  const [isProcessing, setIsProcessing] = useState(false);

  if (!parkingSession) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
        <div className="bg-white/5 backdrop-blur-2xl p-12 rounded-[40px] border border-white/10 text-center shadow-2xl max-w-lg">
          <h2 className="text-3xl font-black text-rose-500 uppercase tracking-widest mb-4">No Session Found</h2>
          <p className="text-slate-400 font-bold mb-8 uppercase text-xs">A valid parking session is required to access this portal.</p>
          <button onClick={() => navigate('/dashboard')} className="px-8 py-4 bg-blue-600 text-white rounded-full font-black uppercase tracking-widest shadow-xl hover:bg-blue-500 transition-all">Back to Dashboard</button>
        </div>
      </div>
    );
  }

  const handlePay = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch('http://localhost:8000/api/parking/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hub_id: parkingSession.hub_id })
      });
      const data = await res.json();
      if (data.success) {
        setTimeout(() => {
           navigate('/confirmation', { state: { parkingSession } });
        }, 1500); // Simulate network latency
      }
    } catch (err) {
      console.error('Payment failed:', err);
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-blue-500/30 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2"></div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10 animate-fade-in translate-y-0">
        
        {/* Bill Breakdown Card */}
        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[40px] p-10 shadow-[0_50px_100px_rgba(0,0,0,0.5)]">
           <div className="flex items-center gap-4 mb-10">
              <div className="bg-blue-600 p-4 rounded-2xl shadow-[0_10px_20px_rgba(37,99,235,0.3)]">
                 <Receipt className="w-8 h-8 text-white" />
              </div>
              <div>
                 <h2 className="text-3xl font-black uppercase tracking-tighter italic">Parking Invoice</h2>
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Digital Service Hub • Smart City Control</p>
              </div>
           </div>

           <div className="space-y-6 mb-12">
              <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
                 <div className="flex items-center gap-4 mb-2">
                    <MapPin className="w-4 h-4 text-blue-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Node Location</span>
                 </div>
                 <p className="text-xl font-bold uppercase tracking-tight italic">{parkingSession.location}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-4 mb-2">
                       <Clock className="w-4 h-4 text-indigo-400" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Duration</span>
                    </div>
                    <p className="text-xl font-bold uppercase tracking-tight italic">{parkingSession.duration}s</p>
                 </div>
                 <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-4 mb-2">
                       <ShieldCheck className="w-4 h-4 text-emerald-400" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</span>
                    </div>
                    <p className="text-xl font-bold uppercase tracking-tight italic text-emerald-400">Verified</p>
                 </div>
              </div>

              <div className="pt-8 border-t border-white/10 space-y-4">
                 <div className="flex justify-between items-center text-slate-400">
                    <span className="text-xs font-bold uppercase tracking-widest">Base Parking Fee</span>
                    <span className="text-sm font-black">$ 1.00</span>
                 </div>
                 <div className="flex justify-between items-center text-slate-400">
                    <span className="text-xs font-bold uppercase tracking-widest">Usage Multiplier ($0.05/s)</span>
                    <span className="text-sm font-black">$ {(parkingSession.fee - 1).toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between items-center pt-6">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] italic">Total Due</p>
                    <p className="text-5xl font-black leading-none tracking-tighter">$ {parkingSession.fee}</p>
                 </div>
              </div>
           </div>

           <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5 opacity-80">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <p className="text-[10px] font-bold uppercase text-slate-400 tracking-tighter">Your payment is secured by Neural Grid Encryption Standard</p>
           </div>
        </div>

        {/* Payment Methods Card */}
        <div className="space-y-6">
           <div className="bg-white/5 backdrop-blur-3xl border border-blue-500/20 rounded-[40px] p-10 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 blur-[80px] opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity"></div>
              
              <h3 className="text-lg font-black uppercase tracking-widest mb-8 flex items-center gap-3 italic">
                 <CreditCard className="w-6 h-6 text-blue-400" /> Choose Interface
              </h3>

              <div className="space-y-4">
                 {[
                    { name: 'UPI / GPay Neural Link', icon: Smartphone, color: 'text-emerald-400' },
                    { name: 'Dynamic City QR', icon: QrCode, color: 'text-indigo-400' },
                    { name: 'Neural Pay Express', icon: CreditCard, color: 'text-blue-400' }
                 ].map((method, idx) => (
                    <button key={method.name} className={`w-full p-6 text-left rounded-3xl border transition-all flex items-center justify-between group/item ${idx === 0 ? 'bg-blue-600/10 border-blue-500/40' : 'bg-black/20 border-white/5 hover:bg-white/5'}`}>
                       <div className="flex items-center gap-4">
                          <method.icon className={`w-5 h-5 ${method.color}`} />
                          <span className="font-black uppercase tracking-widest text-xs italic">{method.name}</span>
                       </div>
                       <div className={`w-3 h-3 rounded-full ${idx === 0 ? 'bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,1)]' : 'bg-slate-700'}`}></div>
                    </button>
                 ))}
              </div>

              <button 
                 onClick={handlePay}
                 disabled={isProcessing}
                 className="w-full mt-12 group/btn relative overflow-hidden bg-blue-600 hover:bg-blue-500 text-white py-6 rounded-[32px] font-black uppercase tracking-[0.3em] shadow-[0_20px_40px_rgba(37,99,235,0.3)] transition-all active:scale-95 disabled:opacity-50"
              >
                 <span className="relative z-10 flex items-center justify-center gap-3 transition-transform">
                    {isProcessing ? 'Processing...' : (
                       <>Pay Now <ArrowRight className="w-6 h-6 opacity-0 group-hover/btn:opacity-100 -translate-x-4 group-hover/btn:translate-x-0 transition-all" /></>
                    )}
                 </span>
              </button>
           </div>

           <div className="p-8 bg-black/40 rounded-[32px] border border-white/5 text-center">
              <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-widest">Transaction processed by Smart City Neural Node 04X. UPI mandates a 128-bit neural handshake.</p>
           </div>
        </div>

      </div>
    </div>
  );
};

export default Payment;
