import { Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import MainLayout from '../layouts/MainLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import PrivateRoute from './PrivateRoute';
import AdminRoute from './AdminRoute';

import Home from '../pages/Home/Home';
import Login from '../pages/Login/Login';
import Register from '../pages/Register/Register';
import Quiz from '../pages/Quiz/Quiz';
import Library from '../pages/Library/Library';
import BookImages from '../pages/Library/BookImages';
import DocumentReader from '../pages/DocumentReader/DocumentReader';
import Videos from '../pages/Videos/Videos';
import Exam from '../pages/Exam/Exam';
import Results from '../pages/Results/Results';
import Payment from '../pages/Payment/Payment';
import Certificate from '../pages/Certificate/Certificate';
import Leaderboard from '../pages/Leaderboard/Leaderboard';
import Profile from '../pages/Profile/Profile';
import About from '../pages/About/About';
import Contact from '../pages/Contact/Contact';
import Faq from '../pages/Faq/Faq';
import AiChat from '../pages/AiChat/AiChat';
import AiSolve from '../pages/AiSolve/AiSolve';
import Admin from '../pages/Admin/Admin';
import AdminLibrary from '../pages/AdminLibrary/AdminLibrary';
import AdminVideos from '../pages/AdminVideos/AdminVideos';
import AdminAiQuestions from '../pages/AdminAiQuestions/AdminAiQuestions';
import AdminTeamMembers from '../pages/AdminTeamMembers/AdminTeamMembers';
import AdminUsers from '../pages/AdminUsers/AdminUsers';

function AppRoutes() {
  const { t } = useTranslation();
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/library" element={<Library />} />
        <Route path="/library/images" element={<BookImages />} />
        <Route path="/videos" element={<Videos />} />
      </Route>

      <Route element={<PrivateRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Profile />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/quiz/:id" element={<Quiz />} />
          <Route path="/exam" element={<Exam />} />
          <Route path="/exam/:id" element={<Exam />} />
          <Route path="/results" element={<Results />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/certificates" element={<Certificate />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/ai-chat" element={<AiChat />} />
          <Route path="/ai-solve" element={<AiSolve />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
          <Route path="/admin/library" element={<AdminRoute><AdminLibrary /></AdminRoute>} />
          <Route path="/admin/videos" element={<AdminRoute><AdminVideos /></AdminRoute>} />
          <Route path="/admin/ai-questions" element={<AdminRoute><AdminAiQuestions /></AdminRoute>} />
          <Route path="/admin/team-members" element={<AdminRoute><AdminTeamMembers /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
        </Route>
      </Route>

      <Route element={<PrivateRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/reader/:id" element={<DocumentReader />} />
        </Route>
      </Route>

      <Route path="*" element={
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-gray-800 dark:text-gray-200 mb-4">{t('pageNotFound.title')}</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">{t('pageNotFound.message')}</p>
            <a href="/" className="text-primary-600 dark:text-primary-400 hover:underline">{t('pageNotFound.goHome')}</a>
          </div>
        </div>
      } />
    </Routes>
  );
}

export default AppRoutes;
