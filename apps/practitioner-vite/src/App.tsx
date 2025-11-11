import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import DashboardPage from './pages/DashboardPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';

// Lazy load feature-heavy pages
const PatientsPage = lazy(() => import('./pages/PatientsPage'));
const PatientDetailPage = lazy(() => import('./pages/PatientDetailPage'));
const PatientCreatePage = lazy(() => import('./pages/PatientCreatePage'));
const PatientQuestionnairesPage = lazy(() => import('./pages/PatientQuestionnairesPage'));
const PatientDayFlowAlimPage = lazy(() => import('./pages/PatientDayFlowAlimPage'));
const PatientsInvitationsPage = lazy(() => import('./pages/PatientsInvitationsPage'));
const ToolsPage = lazy(() => import('./pages/ToolsPage'));
const ToolsQuestionnairesCategoryPage = lazy(
  () => import('./pages/ToolsQuestionnairesCategoryPage')
);
const DiagnosticsPage = lazy(() => import('./pages/DiagnosticsPage'));
const PlansPage = lazy(() => import('./pages/PlansPage'));
const PlanCreatePage = lazy(() => import('./pages/PlanCreatePage'));
const SupplementsPage = lazy(() => import('./pages/SupplementsPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const AnalyticsExportPage = lazy(() => import('./pages/AnalyticsExportPage'));
const DocumentsPage = lazy(() => import('./pages/DocumentsPage'));
const DocumentSendPage = lazy(() => import('./pages/DocumentSendPage'));
const MessagesPage = lazy(() => import('./pages/MessagesPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const ConsultationsListPage = lazy(() => import('./pages/ConsultationsListPage'));
const ConsultationCreatePage = lazy(() => import('./pages/ConsultationCreatePage'));
const ConsultationDetailPage = lazy(() => import('./pages/ConsultationDetailPage'));

export default function App() {
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
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/patients/invitations" element={<PatientsInvitationsPage />} />
            <Route path="/patients/create" element={<PatientCreatePage />} />
            <Route path="/patients/:id/questionnaires" element={<PatientQuestionnairesPage />} />
            <Route path="/patients/:id/dayflow-alim" element={<PatientDayFlowAlimPage />} />
            <Route path="/patients/:id" element={<PatientDetailPage />} />
            <Route path="/patients/*" element={<PatientsPage />} />
            <Route path="/tools/*" element={<ToolsPage />} />
            <Route
              path="/tools/questionnaires/:category"
              element={<ToolsQuestionnairesCategoryPage />}
            />
            <Route path="/diagnostics/*" element={<DiagnosticsPage />} />
            <Route path="/plans/*" element={<PlansPage />} />
            <Route path="/plans/create" element={<PlanCreatePage />} />
            <Route path="/supplements/*" element={<SupplementsPage />} />
            <Route path="/analytics/*" element={<AnalyticsPage />} />
            <Route path="/analytics/export" element={<AnalyticsExportPage />} />
            <Route path="/documents/*" element={<DocumentsPage />} />
            <Route path="/documents/send" element={<DocumentSendPage />} />
            <Route path="/messages/*" element={<MessagesPage />} />
            <Route path="/settings/*" element={<SettingsPage />} />
            <Route path="/consultations/*" element={<ConsultationsListPage />} />
            <Route path="/consultations/create" element={<ConsultationCreatePage />} />
            <Route path="/consultations/:id" element={<ConsultationDetailPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
