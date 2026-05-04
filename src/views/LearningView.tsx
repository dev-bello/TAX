import React from 'react';
import { BookOpen } from 'lucide-react';
import TaxLearningCenter from '../components/TaxLearningCenter';

export default function LearningView() {
  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-tertiary-container/10 rounded-lg">
            <BookOpen className="text-tertiary" size={28} />
          </div>
          <h1 className="text-4xl font-extrabold text-on-surface tracking-tight">Tax Academy</h1>
        </div>
        <p className="text-on-surface-variant text-lg">
          Master Nigerian tax concepts with bite-sized lessons and earn badges as you learn.
        </p>
      </div>

      <TaxLearningCenter />
    </div>
  );
}
