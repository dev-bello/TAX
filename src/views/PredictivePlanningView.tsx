import React from 'react';
import { TrendingUp, Lightbulb } from 'lucide-react';
import PredictiveTaxPlanner from '../components/PredictiveTaxPlanner';
import AIInsightsPanel from '../components/AIInsightsPanel';

export default function PredictivePlanningView() {
  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary-container/10 rounded-lg">
            <TrendingUp className="text-primary" size={28} />
          </div>
          <h1 className="text-4xl font-extrabold text-on-surface tracking-tight">Tax Forecasting & Insights</h1>
        </div>
        <p className="text-on-surface-variant text-lg">
          AI-powered predictions, industry benchmarks, and optimization strategies to minimize your tax burden.
        </p>
      </div>

      <PredictiveTaxPlanner />
      
      {/* Blended AI Insights Section */}
      <div className="mt-8 pt-8 border-t border-outline-variant/20">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-tertiary-container/10 rounded-lg">
            <Lightbulb className="text-tertiary" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-on-surface">Smart Recommendations</h2>
            <p className="text-sm text-on-surface-variant">AI-powered insights based on your forecasting data and industry benchmarks</p>
          </div>
        </div>
        <AIInsightsPanel />
      </div>
    </div>
  );
}
