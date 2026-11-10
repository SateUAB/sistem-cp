import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import HomePage from './pages/HomePage';
import CallPage from './pages/CallPage';
import NavProvider from './components/cp/NavProvider';
import { BackToTop, ChatWidget, ScrollProgress, SiteHeader } from './components/cp/Shell';

function App() {
  return (
    <>
      <div className="cp full">
        <NavProvider>
          <ScrollProgress />
          <SiteHeader />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/details/:id" element={<CallPage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
          <BackToTop />
          {/* Dialogs render here, outside the animated sections (a transform would break position: fixed) */}
          <div id="cp-layer" />
        </NavProvider>
      </div>
      <Analytics />

      {/* Chatbot Widget - Global */}
      <ChatWidget />
    </>
  );
}

export default App;
