import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout';
import LoadingSpinner from './components/ui/LoadingSpinner';
import SafeProtectedRoute from './components/auth/SafeProtectedRoute';
import ErrorBoundary from './components/auth/ErrorBoundary';

// Lazy loaded pages
const HomePage = lazy(() => import('./pages/HomePage'));
const LaunchPage = lazy(() => import('./pages/LaunchPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const DienstleisterSearchPage = lazy(() => import('./pages/DienstleisterPage'));
const BetreuerProfilePage = lazy(() => import('./pages/BetreuerProfilePage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const ImpressumPage = lazy(() => import('./pages/ImpressumPage'));
const DatenschutzPage = lazy(() => import('./pages/DatenschutzPage'));
const AgbPage = lazy(() => import('./pages/AgbPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const HelpPage = lazy(() => import('./pages/HelpPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const OwnerDashboardPage = lazy(() => import('./pages/OwnerDashboardPage'));
const CaretakerDashboardPage = lazy(() => import('./pages/CaretakerDashboardPage'));
const DienstleisterProfilePage = lazy(() => import('./pages/DienstleisterProfilePage'));
const MessagesPage = lazy(() => import('./pages/MessagesPage'));
const OwnerPublicProfilePage = lazy(() => import('./pages/OwnerPublicProfilePage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const PaymentSuccessPage = lazy(() => import('./pages/PaymentSuccessPage'));
const BlogListPage = lazy(() => import('./pages/BlogListPage'));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage'));

// Debug components (only in development)



function App() {
  return (
    <ErrorBoundary>
      <Layout>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/launch" element={<LaunchPage />} />
          <Route path="/suche" element={<SearchPage />} />
          <Route path="/dienstleister" element={<DienstleisterSearchPage />} />
          <Route 
            path="/betreuer/:id" 
            element={
              <SafeProtectedRoute>
                <BetreuerProfilePage />
              </SafeProtectedRoute>
            }
          />
          <Route 
            path="/dienstleister/:id" 
            element={
              <SafeProtectedRoute>
                <DienstleisterProfilePage />
              </SafeProtectedRoute>
            }
          />
          <Route path="/registrieren" element={<RegisterPage />} />
          <Route path="/anmelden" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/impressum" element={<ImpressumPage />} />
          <Route path="/datenschutz" element={<DatenschutzPage />} />
          <Route path="/agb" element={<AgbPage />} />
          <Route path="/ueber-uns" element={<AboutPage />} />
          <Route path="/kontakt" element={<ContactPage />} />
          <Route path="/hilfe" element={<HelpPage />} />
          <Route path="/preise" element={<PricingPage />} />
          <Route path="/mitgliedschaften" element={<PricingPage />} />
          <Route path="/payment/success" element={<PaymentSuccessPage />} />
          <Route path="/blog" element={<BlogListPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          
          {/* Debug Routes (only in development) */}
          {import.meta.env.DEV && (
            <>
            </>
          )}
          
          <Route 
            path="/dashboard-owner" 
            element={
              <SafeProtectedRoute requireOwner={true}>
                <OwnerDashboardPage />
              </SafeProtectedRoute>
            } 
          />
          <Route
            path="/dashboard-caretaker"
            element={
              <SafeProtectedRoute requireCaretaker={true}>
                <CaretakerDashboardPage />
              </SafeProtectedRoute>
            }
          />
          <Route 
            path="/nachrichten" 
            element={
              <SafeProtectedRoute>
                <MessagesPage />
              </SafeProtectedRoute>
            } 
          />
          <Route 
            path="/nachrichten/:conversationId" 
            element={
              <SafeProtectedRoute>
                <MessagesPage />
              </SafeProtectedRoute>
            } 
          />
          <Route 
            path="/owner/:userId" 
            element={
              <SafeProtectedRoute>
                <OwnerPublicProfilePage />
              </SafeProtectedRoute>
            } 
          />
          <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </Layout>
    </ErrorBoundary>
  );
}

export default App;