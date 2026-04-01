import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CityDataProvider } from './contexts/CityDataContext';
import Login from './pages/Auth/Login';
import UserDashboard from './pages/Dashboard/UserDashboard';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import BookTicket from './pages/Dashboard/BookTicket';
import CityMap from './components/Map/CityMap';
import Layout from './components/Layout';
import Payment from './pages/Services/Payment';
import Confirmation from './pages/Services/Confirmation';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, role, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center font-semibold text-lg animate-pulse text-indigo-600">Initializing Smart City...</div>;
  if (!user) return <Navigate to="/login" />;
  if (requiredRole && role !== requiredRole) return <Navigate to={role === 'admin' ? '/admin' : '/dashboard'} />;
  return children;
};

const RoleBasedRedirect = () => {
    const { role, loading } = useAuth();
    if (loading) return null;
    return role === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/dashboard" />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CityDataProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={<ProtectedRoute><RoleBasedRedirect /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute requiredRole="user"><UserDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/book" element={<ProtectedRoute requiredRole="user"><Layout><BookTicket /></Layout></ProtectedRoute>} />
            <Route path="/dashboard/map" element={<ProtectedRoute requiredRole="user"><Layout><div className="h-full pt-4 pb-12"><div className="font-extrabold text-3xl mb-4 text-slate-800">Live Infrastructure Map</div><CityMap /></div></Layout></ProtectedRoute>} />
            <Route path="/payment" element={<ProtectedRoute requiredRole="user"><Payment /></ProtectedRoute>} />
            <Route path="/confirmation" element={<ProtectedRoute requiredRole="user"><Confirmation /></ProtectedRoute>} />

            <Route path="admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
          </Routes>
        </CityDataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
