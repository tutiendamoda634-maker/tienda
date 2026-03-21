import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/Landing';
import RegisterPage from './pages/Register';
import DashboardPage from './pages/Dashboard';
import DemoPage from './pages/Demo';
import LoginPage from './pages/Login';
import AdminPage from './pages/Admin';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route path="/demo" element={<DemoPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Tenant dashboard */}
        <Route path="/panel" element={<DashboardPage />} />

        {/* Super Admin */}
        <Route path="/admin" element={<AdminPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
