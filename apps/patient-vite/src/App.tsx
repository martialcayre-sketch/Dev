import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AnamnesePage from './pages/AnamnesePage';
import ConsultationPage from './pages/ConsultationPage';
import DashboardPage from './pages/DashboardPage';
import HomePage from './pages/HomePage';
import IdentificationPage from './pages/IdentificationPage';
import LifeJourneyPage from './pages/LifeJourneyPage';
import LoginPage from './pages/LoginPage';
import QuestionnaireDetailPage from './pages/QuestionnaireDetailPage';
import QuestionnairesPage from './pages/QuestionnairesPage';
import SignupPage from './pages/SignupPage';

function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}

export default App;
