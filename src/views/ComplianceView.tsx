import React from 'react';
import { FileCheck } from 'lucide-react';
import ComplianceAutomation from '../components/ComplianceAutomation';

export default function ComplianceView() {
  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-error-container/30 rounded-lg">
            <FileCheck className="text-error" size={28} />
          </div>
          <h1 className="text-4xl font-extrabold text-on-surface tracking-tight">Compliance Center</h1>
        </div>
        <p className="text-on-surface-variant text-lg">
          Auto-generated tax forms, deadline tracking, and one-click filing to NRS.
        </p>
      </div>

      <ComplianceAutomation />
    </div>
  );
}
