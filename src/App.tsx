import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { initAuthListener } from './lib/authListener';
import { useConductorStore } from './stores/conductorStore';
import Archive from './pages/Archive';
import SignUp from './pages/SignUp';
import Gatekeeper from './pages/Gatekeeper';
import ConductorDashboard from './pages/ConductorDashboard';
import SubmitEntry from './pages/SubmitEntry';
import ReviseEntry from './pages/ReviseEntry';
import EntryDetail from './pages/EntryDetail';
import VeilTest from './pages/VeilTest';
import Messaging from './pages/Messaging';
import Profile from './pages/Profile';
import SacredInsights from './pages/SacredInsights';
import Scholars from './pages/Scholars';
import Observatory from './pages/Observatory';
import Loading from './components/Loading';
import AdminReview from './pages/AdminReview';
import { RequireAdmin } from './components/RequireAdmin';
import { CommandPalette } from './components/CommandPalette';
import { PulseProvider } from './context/PulseProvider';

const App: React.FC = () => {
  const { uid, isLoading } = useConductorStore();

  useEffect(() => {
    const unsubscribe = initAuthListener();
    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Router>
      <PulseProvider>
        <CommandPalette />
        <Routes>
          <Route path="/archive" element={<Archive />} />
          <Route path="/archive/:postId" element={<EntryDetail />} />
          <Route path="/signup" element={<SignUp />} />
          <Route 
            path="/signin" 
            element={uid ? <Navigate to="/dashboard" replace /> : <Gatekeeper />} 
          />
          <Route path="/dashboard" element={<ConductorDashboard />} />
          <Route path="/submit" element={<SubmitEntry />} />
          <Route path="/revise/:postId" element={<ReviseEntry />} />
          <Route path="/sacred-insights" element={<SacredInsights />} />
          <Route path="/scholars" element={<Scholars />} />
          <Route path="/messaging" element={<Messaging />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/observatory" element={<Observatory />} />
          <Route path="/veil-test" element={<VeilTest />} />

          <Route
            path="/admin/review"
            element={
              <RequireAdmin>
                <AdminReview />
              </RequireAdmin>
            }
          />
          <Route 
            path="/" 
            element={uid ? <Navigate to="/dashboard" replace /> : <Gatekeeper />} 
          />
        </Routes>
      </PulseProvider>
    </Router>
  );
};

export default App;
