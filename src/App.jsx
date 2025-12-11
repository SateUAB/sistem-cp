import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Details from './pages/Details';

import AdminDashboard from './pages/AdminDashboard';
import CallForm from './pages/CallForm';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/details/:id" element={<Details />} />
      </Routes>
    </Layout>
  );
}

export default App;
