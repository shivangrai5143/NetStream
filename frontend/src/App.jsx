import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfileSelectPage from './pages/ProfileSelectPage';
import HomePage from './pages/HomePage';
import MovieDetailPage from './pages/MovieDetailPage';
import WatchPage from './pages/WatchPage';
import SearchPage from './pages/SearchPage';
import MyListPage from './pages/MyListPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';

// Layout
import Navbar from './components/layout/Navbar';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const ProfileRequired = ({ children }) => {
  const { user, activeProfile, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (!activeProfile) return <Navigate to="/profiles" replace />;
  return children;
};

const GuestOnly = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (user) return <Navigate to="/profiles" replace />;
  return children;
};

const FullScreenLoader = () => (
  <div className="min-h-screen bg-netflix-black flex items-center justify-center">
    <img src="/netflix-logo.svg" alt="Netflix" className="w-32 animate-pulse" />
  </div>
);

const AppLayout = ({ children }) => (
  <>
    <Navbar />
    {children}
  </>
);

// Admin Route wrapper
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <FullScreenLoader />; // Or null, depending on desired behavior
  if (!user || user.role !== 'admin') return <Navigate to="/" replace />;
  
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Guest routes */}
      <Route path="/login" element={<GuestOnly><LoginPage /></GuestOnly>} />
      <Route path="/signup" element={<GuestOnly><SignupPage /></GuestOnly>} />

      {/* Auth required, no profile needed */}
      <Route path="/profiles" element={<ProtectedRoute><ProfileSelectPage /></ProtectedRoute>} />
      <Route path="/profile/manage" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      
      {/* Admin route */}
      <Route path="/admin" element={
        <AdminRoute>
          <div className="flex flex-col min-h-screen relative">
            <Navbar />
            <AdminPage />
          </div>
        </AdminRoute>
      } />

      {/* Auth + profile required */}
      <Route path="/" element={<ProfileRequired><AppLayout><HomePage /></AppLayout></ProfileRequired>} />
      <Route path="/movie/:id" element={<ProfileRequired><AppLayout><MovieDetailPage type="movie" /></AppLayout></ProfileRequired>} />
      <Route path="/tv/:id" element={<ProfileRequired><AppLayout><MovieDetailPage type="tv" /></AppLayout></ProfileRequired>} />
      <Route path="/watch/:type/:id" element={<ProfileRequired><WatchPage /></ProfileRequired>} />
      <Route path="/search" element={<ProfileRequired><AppLayout><SearchPage /></AppLayout></ProfileRequired>} />
      <Route path="/my-list" element={<ProfileRequired><AppLayout><MyListPage /></AppLayout></ProfileRequired>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: { background: '#333', color: '#fff', borderRadius: '4px' },
            duration: 3000,
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
