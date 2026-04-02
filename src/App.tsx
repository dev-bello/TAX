/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './views/Dashboard';
import ComputationEngine from './views/ComputationEngine';
import ScenarioPlanner from './views/ScenarioPlanner';
import ComplianceCalendar from './views/ComplianceCalendar';
import ExpenseIntelligence from './views/ExpenseIntelligence';
import BusinessIdentity from './views/BusinessIdentity';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard />;
      case 'calculator': return <ComputationEngine />;
      case 'scenario': return <ScenarioPlanner />;
      case 'calendar': return <ComplianceCalendar />;
      case 'expenses': return <ExpenseIntelligence />;
      case 'onboarding': return <BusinessIdentity />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout currentView={currentView} setCurrentView={setCurrentView}>
      {renderView()}
    </Layout>
  );
}
