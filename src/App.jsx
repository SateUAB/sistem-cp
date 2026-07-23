import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Details from './pages/Details';

import AdminDashboard from './pages/AdminDashboard';
import CallForm from './pages/CallForm';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const location = useLocation();
  const isDetailsPage = location.pathname.startsWith('/details/');
  let editalId = '';
  if (isDetailsPage) {
    editalId = decodeURIComponent(location.pathname.replace('/details/', ''));
  }

  return (
    <>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/details/:id" element={<Details />} />
        </Routes>
      </Layout>

      {/* Chatbot Widget - Global */}
      <chamadas-publicas-widget 
        api-base="https://chatbot-cp-alpha.vercel.app/api/v1"
        edital={editalId}
      >
        <span slot="rotulo-botao">Tirar dúvidas do edital</span>
      </chamadas-publicas-widget>
    </>
  );
}

export default App;
