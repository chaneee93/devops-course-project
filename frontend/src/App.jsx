import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import CoursesPage from './pages/CoursesPage';
import MyEnrollmentsPage from './pages/MyEnrollmentsPage';
import TimetablePage from './pages/TimetablePage';
import NavTabs from './components/NavTabs';
import ProtectedRoute from './components/ProtectedRoute';
import { goToRegister } from './auth';

function LoginRoute() {
  const navigate = useNavigate();
  return (
    <LoginPage
      onSignup={() => goToRegister()}          // 회원가입 → Keycloak 등록 페이지로 리다이렉트
      onLoginSuccess={() => navigate('/courses')}
    />
  );
}

function AppLayout({ children }) {
  return (
    <div>
      <NavTabs />
      {children}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginRoute />} />
        <Route path="/courses" element={
          <ProtectedRoute><AppLayout><CoursesPage /></AppLayout></ProtectedRoute>
        } />
        <Route path="/my-enrollments" element={
          <ProtectedRoute><AppLayout><MyEnrollmentsPage /></AppLayout></ProtectedRoute>
        } />
        <Route path="/timetable" element={
          <ProtectedRoute><AppLayout><TimetablePage /></AppLayout></ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}
