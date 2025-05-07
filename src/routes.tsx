import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';

// Lazy load all page components
const Index = lazy(() => import('@/pages/Index'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const CurationDetailPage = lazy(() => import('@/pages/CurationDetailPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const SignupPage = lazy(() => import('@/pages/SignupPage'));
const CreateCurationPage = lazy(() => import('@/pages/CreateCurationPage'));
const VerifyEmailPage = lazy(() => import('@/pages/VerifyEmailPage'));
const FollowersPage = lazy(() => import('@/pages/FollowersPage'));
const FollowingPage = lazy(() => import('@/pages/FollowingPage'));

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-purple"></div>
  </div>
);

export default function AppRoutes() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/profile/:username" element={<ProfilePage />} />
        <Route path="/profile/:username/followers" element={<FollowersPage />} />
        <Route path="/profile/:username/following" element={<FollowingPage />} />
        <Route path="/curation/:id" element={<CurationDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/create" element={<CreateCurationPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
} 