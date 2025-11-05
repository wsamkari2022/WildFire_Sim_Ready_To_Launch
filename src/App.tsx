/**
 * MAIN APPLICATION ROUTER
 *
 * Purpose:
 * - Defines all application routes and navigation structure
 * - Manages the complete study flow from demographics to completion
 *
 * Application Flow (in order):
 * 1. /demographics - Informed consent and demographic data collection
 * 2. /explicitvaluepage - Explicit moral value assessment
 * 3. /preferences - Implicit value preference selection (drag & drop)
 * 4. /completion - Implicit value completion confirmation
 * 5. /values - Final implicit value assessment and matching
 * 6. /tutorial - Pre-simulation tutorial and instructions
 * 7. /simulation - Main wildfire scenario simulation (3 scenarios)
 * 8. /thank-you - Post-simulation thank you page
 * 9. /feedback - Comprehensive feedback form (CVR, APA, Viz, Overall)
 * 10. /final-analysis - Detailed value analysis report (accessed from feedback)
 * 11. /view-results - Session metrics and tracking data (accessed from feedback)
 * 12. /results-feedback - Additional results-specific feedback
 * 13. /study-complete - Final completion page
 *
 * Dependencies:
 * - react-router-dom for routing
 * - All page components listed above
 *
 * Database Interactions:
 * - None (routing only, database calls handled by individual pages)
 *
 * Notes:
 * - Default route (/) redirects to /demographics
 * - No authentication or protected routes
 * - Users can navigate back through browser history
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DemographicPage from './pages/DemographicPage';
import ExplicitValuesPage from './pages/ExplicitValuesPage';
import PreferencesPage from './implicit_value_pages/PreferencesPage';
import CompletionPage from './implicit_value_pages/CompletionPage';
import ValuesPage from './implicit_value_pages/ValuesPage';
import TutorialPage from './pages/TutorialPage';
import SimulationPage from './SimulationMainPage';
import ThankYouPage from './pages/ThankYouPage';
import FeedbackPage from './pages/FeedbackPage';
import FinalAnalysisPage from './pages/FinalAnalysisPage';
import ViewResultsPage from './pages/ViewResultsPage';
import ResultsFeedbackPage from './pages/ResultsFeedbackPage';
import StudyCompletePage from './pages/StudyCompletePage';

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
        <Route path="/tutorial" element={<TutorialPage />} />
        <Route path="/simulation" element={<SimulationPage />} />
        <Route path="/thank-you" element={<ThankYouPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/final-analysis" element={<FinalAnalysisPage />} />
        <Route path="/view-results" element={<ViewResultsPage />} />
        <Route path="/results-feedback" element={<ResultsFeedbackPage />} />
        <Route path="/study-complete" element={<StudyCompletePage />} />
      </Routes>
    </Router>
  );
}

export default App;