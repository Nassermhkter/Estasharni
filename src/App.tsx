import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Doctors from './pages/Doctors';
import DoctorRegistration from './pages/DoctorRegistration';
import Contact from './pages/Contact';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';

// Route guards
const PrivateRoute: React.FC<{ children: React.ReactNode; role?: string }> = ({ children, role }) => {
  const { user, userData, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/auth" />;
  if (role && userData?.role !== role) return <Navigate to="/" />;
  
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout><Home /></Layout>} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/doctors" element={<Layout><Doctors /></Layout>} />
      <Route path="/contact" element={<Layout><Contact /></Layout>} />
      
      <Route path="/profile" element={
        <PrivateRoute>
          <Layout><Profile /></Layout>
        </PrivateRoute>
      } />
      
      <Route path="/doctor-registration" element={
        <PrivateRoute role="doctor">
          <Layout><DoctorRegistration /></Layout>
        </PrivateRoute>
      } />
      
      <Route path="/admin" element={
        <PrivateRoute role="admin">
          <Layout><AdminDashboard /></Layout>
        </PrivateRoute>
      } />
    </Routes>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LanguageProvider>
          <Router>
            <div className="min-h-screen transition-colors duration-300 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <AppRoutes />
              <Toaster position="bottom-right" />
            </div>
          </Router>
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
