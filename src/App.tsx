import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import { AuthProvider } from '@/contexts/AuthContext';
import { SocialProvider } from '@/contexts/SocialContext';
import AppRoutes from '@/routes';
import { Toaster } from 'sonner';
import { Suspense, lazy } from 'react';

// Lazy load the VerifyEmail component
const VerifyEmail = lazy(() => import('@/pages/auth/VerifyEmail'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnMount: false,
      refetchOnReconnect: false,
    },
  },
});

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Something went wrong</h1>
        <p className="text-gray-600 mb-4">{error.message}</p>
        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-brand-purple text-white rounded-md hover:bg-brand-purple-dark"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AuthProvider>
            <SocialProvider>
              <Suspense fallback={<div>Loading...</div>}>
                <AppRoutes />
              </Suspense>
              <Toaster position="top-right" />
            </SocialProvider>
          </AuthProvider>
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
