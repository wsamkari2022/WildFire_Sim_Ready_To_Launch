import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DemographicPage from './pages/DemographicPage';
import ExplicitValuesPage from './pages/ExplicitValuesPage';
import PreferencesPage from './implicit_value_pages/PreferencesPage';
import CompletionPage from './implicit_value_pages/CompletionPage';
import ValuesPage from './implicit_value_pages/ValuesPage';
import SimulationPage from './SimulationMainPage';
import FinalAnalysisPage from './pages/FinalAnalysisPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/demographics" replace />} />
        <Route path="/demographics" element={<DemographicPage />} />
        <Route path="/explicitvaluepage" element={<ExplicitValuesPage />} />
        <Route path="/preferences" element={<PreferencesPage />} />
        <Route path="/completion" element={<CompletionPage />} />
        <Route path="/values" element={<ValuesPage />} />
        <Route path="/simulation" element={<SimulationPage />} />
        <Route path="/final-analysis" element={<FinalAnalysisPage />} />
      </Routes>
    </Router>
  );
}

export default App;