import { Routes, Route } from 'react-router-dom';
import Index from '@/pages/Index';
import NotFound from '@/pages/NotFound';
import ProfilePage from '@/pages/ProfilePage';
import CurationDetailPage from '@/pages/CurationDetailPage';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import { CreateCurationPage } from '@/pages/CreateCurationPage';
import VerifyEmailPage from '@/pages/VerifyEmailPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/profile/:username" element={<ProfilePage />} />
      <Route path="/curation/:id" element={<CurationDetailPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/create" element={<CreateCurationPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
} 