/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
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
import { TourProvider } from './components/AppTour';
import { ToastProvider } from './components/Toast';
import { useBusinessProfile } from './hooks/useBusinessProfile';

export default function App() {
  const { hasProfile } = useBusinessProfile();
  const [currentView, setCurrentView] = useState<'dashboard' | 'calculator' | 'scenario' | 'forecasting' | 'calendar' | 'compliance' | 'expenses' | 'learning' | 'onboarding'>(hasProfile ? 'dashboard' : 'onboarding');
  const [isReady, setIsReady] = useState(false);

  // Prevent any flash by locking the initial view until we're certain
  useEffect(() => {
    // Small delay ensures localStorage is read and state is settled
    const timer = setTimeout(() => setIsReady(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) setCurrentView(detail);
    };
    window.addEventListener('navigateTo', handler);
    return () => window.removeEventListener('navigateTo', handler);
  }, []);

  // Guard: force onboarding if no profile exists
  useEffect(() => {
    if (!hasProfile && currentView !== 'onboarding') {
      setCurrentView('onboarding');
    }
  }, [hasProfile, currentView]);

  const isOnboarding = currentView === 'onboarding';

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard />;
      case 'calculator': return <ComputationEngine />;
      case 'scenario': return <ScenarioPlanner />;
      case 'forecasting': return <PredictivePlanningView />;
      case 'calendar': return <ComplianceCalendar />;
      case 'compliance': return <ComplianceView />;
      case 'expenses': return <ExpenseIntelligence />;
      case 'learning': return <LearningView />;
      case 'onboarding': return <OnboardingWizard />;
      default: return <Dashboard />;
    }
  };

  if (!isReady) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="animate-pulse">
          <h1 className="text-3xl font-extrabold text-primary">Tax FYP</h1>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <TourProvider isOnboarding={isOnboarding}>
        {isOnboarding ? (
          renderView()
        ) : (
          <Layout currentView={currentView} setCurrentView={setCurrentView}>
            {renderView()}
          </Layout>
        )}
      </TourProvider>
    </ToastProvider>
  );
}
