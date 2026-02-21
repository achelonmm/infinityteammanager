import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TournamentProvider } from './contexts/TournamentContext';
import { AuthProvider } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import Registration from './pages/Registration';
import TeamsPlayers from './pages/TeamsPlayers';
import Pairings from './pages/Pairings';
import Rankings from './pages/Rankings';
import Statistics from './pages/Statistics';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <TournamentProvider>
        <Router>
          <div className="App">
            <Navigation />
            <Routes>
              {/* Protected Admin Routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/registration" element={
                <ProtectedRoute>
                  <Registration />
                </ProtectedRoute>
              } />
              <Route path="/teams" element={
                <ProtectedRoute>
                  <TeamsPlayers />
                </ProtectedRoute>
              } />
              <Route path="/pairings" element={
                <ProtectedRoute>
                  <Pairings />
                </ProtectedRoute>
              } />
              
              {/* Public Routes */}
              <Route path="/rankings" element={<Rankings />} />
              <Route path="/statistics" element={<Statistics />} />
            </Routes>
          </div>
        </Router>
      </TournamentProvider>
    </AuthProvider>
  );
}

export default App;