import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import useAuthStore from './store/authStore';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Public pages
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import PGDetailPage from './pages/PGDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';

// Student pages
import StudentDashboard from './pages/student/StudentDashboard';
import FavoritesPage from './pages/student/FavoritesPage';
import MyInquiriesPage from './pages/student/MyInquiriesPage';

// Owner pages
import OwnerDashboard from './pages/owner/OwnerDashboard';
import AddPGPage from './pages/owner/AddPGPage';
import EditPGPage from './pages/owner/EditPGPage';
import ReceivedInquiriesPage from './pages/owner/ReceivedInquiriesPage';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPGsPage from './pages/admin/AdminPGsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';

const ProtectedRoute = ({ children, roles }) => {
  const { user, token } = useAuthStore();
  if (!token || !user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const PublicOnlyRoute = ({ children }) => {
  const { token, user } = useAuthStore();
  if (token && user) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'owner') return <Navigate to="/owner" replace />;
    return <Navigate to="/student" replace />;
  }
  return children;
};

export default function App() {
  const { initAuth } = useAuthStore();
  useEffect(() => { initAuth(); }, []);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#12121a',
            color: '#f8fafc',
            border: '1px solid rgba(249,115,22,0.2)',
            borderRadius: '12px',
            fontFamily: 'Cabinet Grotesk, sans-serif',
          },
          success: { iconTheme: { primary: '#f97316', secondary: '#fff' } },
        }}
      />

      <Routes>
        {/* Public routes with Navbar/Footer */}
        <Route path="/" element={<><Navbar /><HomePage /><Footer /></>} />
        <Route path="/search" element={<><Navbar /><SearchPage /><Footer /></>} />
        <Route path="/pg/:id" element={<><Navbar /><PGDetailPage /><Footer /></>} />

        {/* Auth routes */}
        <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />

        {/* Student routes */}
        <Route path="/student" element={<ProtectedRoute roles={['student']}><><Navbar /><StudentDashboard /><Footer /></></ProtectedRoute>} />
        <Route path="/student/favorites" element={<ProtectedRoute roles={['student']}><><Navbar /><FavoritesPage /><Footer /></></ProtectedRoute>} />
        <Route path="/student/inquiries" element={<ProtectedRoute roles={['student']}><><Navbar /><MyInquiriesPage /><Footer /></></ProtectedRoute>} />

        {/* Owner routes */}
        <Route path="/owner" element={<ProtectedRoute roles={['owner']}><><Navbar /><OwnerDashboard /><Footer /></></ProtectedRoute>} />
        <Route path="/owner/add-pg" element={<ProtectedRoute roles={['owner']}><><Navbar /><AddPGPage /><Footer /></></ProtectedRoute>} />
        <Route path="/owner/edit-pg/:id" element={<ProtectedRoute roles={['owner']}><><Navbar /><EditPGPage /><Footer /></></ProtectedRoute>} />
        <Route path="/owner/inquiries" element={<ProtectedRoute roles={['owner']}><><Navbar /><ReceivedInquiriesPage /><Footer /></></ProtectedRoute>} />

        {/* Admin routes */}
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><><Navbar /><AdminDashboard /><Footer /></></ProtectedRoute>} />
        <Route path="/admin/pgs" element={<ProtectedRoute roles={['admin']}><><Navbar /><AdminPGsPage /><Footer /></></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><><Navbar /><AdminUsersPage /><Footer /></></ProtectedRoute>} />

        <Route path="*" element={<><Navbar /><NotFoundPage /><Footer /></>} />
      </Routes>
    </BrowserRouter>
  );
}
