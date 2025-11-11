import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import DashboardPage from './pages/DashboardPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

// Lazy load questionnaire-related pages (large bundle components)
const QuestionnaireDetailPage = lazy(() => import('./pages/QuestionnaireDetailPage'));
const QuestionnairesPage = lazy(() => import('./pages/QuestionnairesPage'));
const LifeJourneyPage = lazy(() => import('./pages/LifeJourneyPage'));
const AnamnesePage = lazy(() => import('./pages/AnamnesePage'));
const ConsultationPage = lazy(() => import('./pages/ConsultationPage'));
const IdentificationPage = lazy(() => import('./pages/IdentificationPage'));

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-screen">Chargement...</div>
          }
        >
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/dashboard/consultation" element={<ConsultationPage />} />
            <Route path="/dashboard/identification" element={<IdentificationPage />} />
            <Route path="/dashboard/anamnese" element={<AnamnesePage />} />
            <Route path="/dashboard/questionnaires" element={<QuestionnairesPage />} />
            <Route path="/dashboard/questionnaires/:id" element={<QuestionnaireDetailPage />} />
            <Route path="/dashboard/life-journey" element={<LifeJourneyPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
