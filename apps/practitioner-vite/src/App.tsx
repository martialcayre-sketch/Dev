import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AnalyticsExportPage from './pages/AnalyticsExportPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ConsultationCreatePage from './pages/ConsultationCreatePage';
import ConsultationDetailPage from './pages/ConsultationDetailPage';
import ConsultationsListPage from './pages/ConsultationsListPage';
import DashboardPage from './pages/DashboardPage';
import DiagnosticsPage from './pages/DiagnosticsPage';
import DocumentSendPage from './pages/DocumentSendPage';
import DocumentsPage from './pages/DocumentsPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import MessagesPage from './pages/MessagesPage';
import PatientCreatePage from './pages/PatientCreatePage';
import PatientDayFlowAlimPage from './pages/PatientDayFlowAlimPage';
import PatientDetailPage from './pages/PatientDetailPage';
import PatientQuestionnairesPage from './pages/PatientQuestionnairesPage';
import PatientsInvitationsPage from './pages/PatientsInvitationsPage';
import PatientsPage from './pages/PatientsPage';
import PlanCreatePage from './pages/PlanCreatePage';
import PlansPage from './pages/PlansPage';
import SettingsPage from './pages/SettingsPage';
import SupplementsPage from './pages/SupplementsPage';
import ToolsPage from './pages/ToolsPage';
import ToolsQuestionnairesCategoryPage from './pages/ToolsQuestionnairesCategoryPage';

export default function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}
