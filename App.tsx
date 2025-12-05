import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { BodyStats } from './pages/BodyStats';
import { RoutineBuilder } from './pages/RoutineBuilder';
import { WorkoutSession } from './pages/WorkoutSession';
import { ExerciseLibrary } from './pages/ExerciseLibrary';
import { WorkoutHistory } from './pages/WorkoutHistory';
import { Settings } from './pages/Settings';

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="antialiased text-gray-100 bg-dark min-h-screen font-sans">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/stats" element={<BodyStats />} />
          <Route path="/routines" element={<RoutineBuilder />} />
          <Route path="/workout" element={<WorkoutSession />} />
          <Route path="/exercises" element={<ExerciseLibrary />} />
          <Route path="/history" element={<WorkoutHistory />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </HashRouter>
  );
};

export default App;