/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './views/Dashboard';
import ComputationEngine from './views/ComputationEngine';
import ScenarioPlanner from './views/ScenarioPlanner';
import ComplianceCalendar from './views/ComplianceCalendar';
import ExpenseIntelligence from './views/ExpenseIntelligence';
import OnboardingWizard from './views/OnboardingWizard';
import PredictivePlanningView from './views/PredictivePlanningView';
import LearningView from './views/LearningView';
import ComplianceView from './views/ComplianceView';
import ProfilePage from './views/ProfilePage';
import AuthView from './views/AuthView';
import ErrorBoundary from './components/ErrorBoundary';
import { TourProvider } from './components/AppTour';
import { ToastProvider } from './components/Toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useBusinessProfile } from './hooks/useBusinessProfile';

function AppRoutes() {
  const location = useLocation();
  const isOnboarding = location.pathname === '/onboarding';
  const { user, isAuthenticated } = useAuth();
  const { hasProfile, isLoading } = useBusinessProfile(user?.id);

  // Show loading while checking auth/profile
  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="animate-pulse">
          <h1 className="text-3xl font-extrabold text-primary">Tax FYP</h1>
        </div>
      </div>
    );
  }

  // Not authenticated - show auth routes
  if (!isAuthenticated) {
    return (
      <ToastProvider>
        <Routes>
          <Route path="/login" element={<AuthView mode="login" />} />
          <Route path="/signup" element={<AuthView mode="signup" />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </ToastProvider>
    );
  }

  // Authenticated with profile but on onboarding - redirect to dashboard
  if (hasProfile && location.pathname === '/onboarding') {
    return (
      <ToastProvider>
        <Navigate to="/" replace />
      </ToastProvider>
    );
  }

  // Authenticated - show full app
  return (
    <ToastProvider>
      <TourProvider isOnboarding={isOnboarding}>
        <Routes>
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/signup" element={<Navigate to="/" replace />} />
          <Route path="/onboarding" element={<OnboardingWizard />} />
          <Route
            path="/*"
            element={
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/calculator" element={<ComputationEngine />} />
                  <Route path="/scenario" element={<ScenarioPlanner />} />
                  <Route path="/forecasting" element={<PredictivePlanningView />} />
                  <Route path="/calendar" element={<ComplianceCalendar />} />
                  <Route path="/compliance" element={<ComplianceView />} />
                  <Route path="/expenses" element={<ExpenseIntelligence />} />
                  <Route path="/learning" element={<LearningView />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            }
          />
        </Routes>
      </TourProvider>
    </ToastProvider>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ErrorBoundary>
  );
}
