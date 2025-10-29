import { Routes, Route, Navigate } from 'react-router-dom';

import AdminDebug from './pages/AdminDebug';
import LoginPatient from './pages/LoginPatient';
import LoginPractitioner from './pages/LoginPractitioner';
import PatientHome from './pages/PatientHome';
import PatientPendingApproval from './pages/PatientPendingApproval';
import PractitionerApprovals from './pages/PractitionerApprovals';
import PractitionerHome from './pages/PractitionerHome';
import RegisterPatient from './pages/RegisterPatient';
import RegisterPractitioner from './pages/RegisterPractitioner';
import VerifyEmail from './pages/VerifyEmail';
import Welcome from './pages/Welcome';
import ProtectedRoute from './routes/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/register/practitioner" element={<RegisterPractitioner />} />
      <Route path="/register/patient" element={<RegisterPatient />} />
      <Route path="/login/practitioner" element={<LoginPractitioner />} />
      <Route path="/login/patient" element={<LoginPatient />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route
        path="/patient/pending-approval"
        element={
          <ProtectedRoute role="patient">
            <PatientPendingApproval />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/home"
        element={
          <ProtectedRoute role="patient">
            <PatientHome />
          </ProtectedRoute>
        }
      />
      <Route
        path="/practitioner/home"
        element={
          <ProtectedRoute role="practitioner">
            <PractitionerHome />
          </ProtectedRoute>
        }
      />
      <Route
        path="/practitioner/approvals"
        element={
          <ProtectedRoute role="practitioner">
            <PractitionerApprovals />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/debug"
        element={
          <ProtectedRoute role="practitioner">
            <AdminDebug />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
