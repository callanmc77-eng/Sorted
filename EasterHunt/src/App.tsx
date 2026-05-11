import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import WelcomePage from './pages/WelcomePage';
import HuntPage from './pages/HuntPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ChatPage from './pages/ChatPage';
import FinishPage from './pages/FinishPage';
import AdminPage from './pages/AdminPage';
import PresentationPage from './pages/PresentationPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route element={<AppShell />}>
          <Route path="/hunt" element={<HuntPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/finish" element={<FinishPage />} />
        </Route>
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/presentation" element={<PresentationPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
