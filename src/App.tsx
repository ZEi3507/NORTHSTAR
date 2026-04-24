import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { initAuthListener } from './lib/authListener';
import Archive from './pages/Archive';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import ConductorDashboard from './pages/ConductorDashboard';
import SubmitEntry from './pages/SubmitEntry';
import ReviseEntry from './pages/ReviseEntry';
import EntryDetail from './pages/EntryDetail';
import VeilTest from './pages/VeilTest';
import SacredInsights from './pages/SacredInsights';

import AdminReview from './pages/AdminReview';
import { RequireAdmin } from './components/RequireAdmin';

const App: React.FC = () => {
  useEffect(() => {
    const unsubscribe = initAuthListener();
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/archive" element={<Archive />} />
        <Route path="/archive/:postId" element={<EntryDetail />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/dashboard" element={<ConductorDashboard />} />
        <Route path="/submit" element={<SubmitEntry />} />
        <Route path="/revise/:postId" element={<ReviseEntry />} />
        <Route path="/sacred-insights" element={<SacredInsights />} />
        <Route path="/veil-test" element={<VeilTest />} />

        <Route
          path="/admin/review"
          element={
            <RequireAdmin>
              <AdminReview />
            </RequireAdmin>
          }
        />
        <Route path="/" element={<Navigate to="/archive" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
