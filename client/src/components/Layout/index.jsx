import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0b1121] text-slate-200 overflow-hidden font-sans">
      <Navbar />
      <main className="flex-1 overflow-x-hidden overflow-y-auto w-full">
         <Outlet />
      </main>
    </div>
  );
}
