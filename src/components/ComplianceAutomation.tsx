import React, { useState } from 'react';
import { FileText, CheckCircle2, Download, Calendar, Clock, AlertTriangle, ChevronRight, RefreshCw, ExternalLink } from 'lucide-react';

interface TaxForm {
  id: string;
  name: string;
  formCode: string;
  deadline: string;
  status: 'ready' | 'pending' | 'filed' | 'overdue';
  autoFillStatus: 'complete' | 'partial' | 'empty';
  lastUpdated: string;
  estimatedTime: string;
  dataSources: string[];
}

interface FilingDeadline {
  id: string;
  taxType: string;
  formName: string;
  dueDate: string;
  daysRemaining: number;
  status: 'upcoming' | 'urgent' | 'overdue';
  autoFileEnabled: boolean;
}

interface ComplianceChecklist {
  id: string;
  task: string;
  completed: boolean;
  required: boolean;
  category: 'documentation' | 'calculation' | 'review';
}

const TAX_FORMS: TaxForm[] = [
  {
    id: 'vat-march',
    name: 'VAT Return - March 2026',
    formCode: 'VAT-001',
    deadline: '2026-04-21',
    status: 'ready',
    autoFillStatus: 'complete',
    lastUpdated: '2026-03-28',
    estimatedTime: '5 min',
    dataSources: ['Bank Statements', 'Invoices', 'Receipts'],
  },
  {
    id: 'cit-annual',
    name: 'Company Income Tax Return 2025',
    formCode: 'CIT-001',
    deadline: '2026-06-30',
    status: 'pending',
    autoFillStatus: 'partial',
    lastUpdated: '2026-03-25',
    estimatedTime: '15 min',
    dataSources: ['Financial Statements', 'Asset Register', 'Expense Reports'],
  },
  {
    id: 'paye-march',
    name: 'PAYE Remittance - March 2026',
    formCode: 'PAYE-001',
    deadline: '2026-04-10',
    status: 'ready',
    autoFillStatus: 'complete',
    lastUpdated: '2026-03-29',
    estimatedTime: '3 min',
    dataSources: ['Payroll Data', 'Employee Records'],
  },
];

const UPCOMING_DEADLINES: FilingDeadline[] = [
  {
    id: '1',
    taxType: 'VAT',
    formName: 'Monthly VAT Return',
    dueDate: '2026-04-21',
    daysRemaining: 15,
    status: 'upcoming',
    autoFileEnabled: true,
  },
  {
    id: '2',
    taxType: 'WHT',
    formName: 'Withholding Tax Return',
    dueDate: '2026-04-10',
    daysRemaining: 4,
    status: 'urgent',
    autoFileEnabled: false,
  },
  {
    id: '3',
    taxType: 'CIT',
    formName: 'Company Income Tax',
    dueDate: '2026-06-30',
    daysRemaining: 86,
    status: 'upcoming',
    autoFileEnabled: true,
  },
];

const COMPLIANCE_CHECKLIST: ComplianceChecklist[] = [
  { id: '1', task: 'Verify all income sources are recorded', completed: true, required: true, category: 'documentation' },
  { id: '2', task: 'Cross-check expenses with receipts', completed: true, required: true, category: 'documentation' },
  { id: '3', task: 'Calculate depreciation on assets', completed: false, required: true, category: 'calculation' },
  { id: '4', task: 'Review tax computation for errors', completed: false, required: true, category: 'review' },
  { id: '5', task: 'Obtain board resolution for tax filing', completed: false, required: false, category: 'documentation' },
];

export default function ComplianceAutomation() {
  const [activeForm, setActiveForm] = useState<string | null>(null);
  const [showChecklist, setShowChecklist] = useState(false);
  const [generatingForm, setGeneratingForm] = useState<string | null>(null);
  const [checklist, setChecklist] = useState(COMPLIANCE_CHECKLIST);

  const toggleChecklistItem = (id: string) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const generateForm = async (formId: string) => {
    setGeneratingForm(formId);
    // Simulate form generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setGeneratingForm(null);
    setActiveForm(formId);
  };

  const downloadForm = (form: TaxForm) => {
    // Simulate download
    const blob = new Blob(['NRS Tax Form - Auto Generated'], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${form.formCode}-AutoFilled.pdf`;
    a.click();
  };

  const completedChecklistCount = checklist.filter(item => item.completed).length;
  const checklistProgress = (completedChecklistCount / checklist.length) * 100;

  return (
    <div className="space-y-8">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-outline-variant/15">
          <div className="text-3xl font-bold text-primary mb-1">{TAX_FORMS.filter(f => f.status === 'ready').length}</div>
          <div className="text-sm text-on-surface-variant">Forms Ready to File</div>
        </div>
        <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-outline-variant/15">
          <div className="text-3xl font-bold text-tertiary mb-1">{UPCOMING_DEADLINES.filter(d => d.status === 'urgent').length}</div>
          <div className="text-sm text-on-surface-variant">Urgent Deadlines</div>
        </div>
        <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-outline-variant/15">
          <div className="text-3xl font-bold text-on-surface mb-1">{Math.round(checklistProgress)}%</div>
          <div className="text-sm text-on-surface-variant">Compliance Ready</div>
        </div>
        <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-outline-variant/15">
          <div className="text-3xl font-bold text-error mb-1">2.5hrs</div>
          <div className="text-sm text-on-surface-variant">Time Saved (Auto-fill)</div>
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-taxfyp border border-outline-variant/15">
        <h3 className="font-bold text-on-surface text-xl mb-6 flex items-center gap-2">
          <Clock className="text-primary" size={24} />
          Upcoming Deadlines
        </h3>

        <div className="space-y-4">
          {UPCOMING_DEADLINES.map((deadline) => (
            <div 
              key={deadline.id}
              className={`p-4 rounded-2xl border ${
                deadline.status === 'urgent' ? 'bg-error-container/10 border-error/30' :
                deadline.status === 'overdue' ? 'bg-error/10 border-error' :
                'bg-surface-container-low border-outline-variant/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    deadline.status === 'urgent' ? 'bg-error text-white' :
                    deadline.status === 'overdue' ? 'bg-error text-white' :
                    'bg-primary-container/20 text-primary'
                  }`}>
                    <Calendar size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface">{deadline.formName}</h4>
                    <p className="text-sm text-on-surface-variant">
                      Due: {new Date(deadline.dueDate).toLocaleDateString('en-NG', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className={`text-2xl font-bold ${
                      deadline.status === 'urgent' ? 'text-error' :
                      deadline.status === 'overdue' ? 'text-error' :
                      'text-on-surface'
                    }`}>
                      {deadline.daysRemaining}
                    </span>
                    <p className="text-xs text-on-surface-variant">days left</p>
                  </div>

                  {deadline.autoFileEnabled ? (
                    <button className="bg-primary text-white px-4 py-2 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center gap-2">
                      Auto-File
                      <ExternalLink size={14} />
                    </button>
                  ) : (
                    <button className="bg-surface-container-high text-on-surface-variant px-4 py-2 rounded-xl font-semibold text-sm">
                      Manual File
                    </button>
                  )}
                </div>
              </div>

              {deadline.status === 'urgent' && (
                <div className="mt-3 p-3 bg-error/10 rounded-xl flex items-start gap-2">
                  <AlertTriangle size={16} className="text-error shrink-0 mt-0.5" />
                  <p className="text-sm text-error">
                    <strong>Penalty Warning (2025/26 Act):</strong> Late filing attracts ₦100,000 fine + ₦50,000 daily penalty (doubled from previous rates)
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Auto-Generated Forms */}
      <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-taxfyp border border-outline-variant/15">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-on-surface text-xl flex items-center gap-2">
            <FileText className="text-primary" size={24} />
            Auto-Generated Tax Forms
          </h3>
          <button 
            onClick={() => setShowChecklist(!showChecklist)}
            className="text-primary font-semibold text-sm flex items-center gap-1"
          >
            {showChecklist ? 'Hide' : 'Show'} Compliance Checklist
            <ChevronRight size={16} className={`transition-transform ${showChecklist ? 'rotate-90' : ''}`} />
          </button>
        </div>

        {/* Compliance Checklist */}
        {showChecklist && (
          <div className="mb-6 p-5 bg-surface-container-low rounded-2xl border border-outline-variant/20">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-on-surface">Pre-Filing Checklist</h4>
              <span className="text-sm text-on-surface-variant">{completedChecklistCount}/{checklist.length} completed</span>
            </div>
            <div className="h-2 bg-surface-container-high rounded-full overflow-hidden mb-4">
              <div 
                className="h-full bg-tertiary rounded-full transition-all duration-500"
                style={{ width: `${checklistProgress}%` }}
              />
            </div>
            <div className="space-y-2">
              {checklist.map((item) => (
                <label key={item.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-surface-container-high cursor-pointer transition-colors">
                  <input 
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => toggleChecklistItem(item.id)}
                    className="mt-1 w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary"
                  />
                  <div className="flex-1">
                    <span className={`text-sm ${item.completed ? 'line-through text-on-surface-variant' : 'text-on-surface'}`}>
                      {item.task}
                    </span>
                    {item.required && (
                      <span className="ml-2 text-xs text-error font-medium">Required</span>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          {TAX_FORMS.map((form) => (
            <div key={form.id} className="p-5 bg-surface-container-low rounded-2xl border border-outline-variant/20">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold px-2 py-1 bg-primary/10 text-primary rounded-full">
                      {form.formCode}
                    </span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      form.autoFillStatus === 'complete' ? 'bg-tertiary/10 text-tertiary' :
                      form.autoFillStatus === 'partial' ? 'bg-tertiary/10 text-tertiary' :
                      'bg-outline-variant/20 text-on-surface-variant'
                    }`}>
                      {form.autoFillStatus === 'complete' ? 'Auto-Filled' : form.autoFillStatus === 'partial' ? 'Partial Fill' : 'Empty'}
                    </span>
                  </div>
                  <h4 className="font-bold text-on-surface">{form.name}</h4>
                  <p className="text-sm text-on-surface-variant">
                    Deadline: {new Date(form.deadline).toLocaleDateString('en-NG', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>

                {form.status === 'ready' && (
                  <span className="flex items-center gap-1 text-tertiary text-sm font-medium">
                    <CheckCircle2 size={16} />
                    Ready
                  </span>
                )}
              </div>

              <div className="mb-4">
                <p className="text-xs text-on-surface-variant mb-2">Data sources:</p>
                <div className="flex flex-wrap gap-2">
                  {form.dataSources.map((source, idx) => (
                    <span key={idx} className="text-xs bg-surface-container-high px-2 py-1 rounded-md text-on-surface-variant">
                      {source}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                {form.status === 'ready' ? (
                  <>
                    <button 
                      onClick={() => downloadForm(form)}
                      className="flex-1 bg-primary text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                    >
                      <Download size={16} />
                      Download PDF
                    </button>
                    <a 
                      href="https://www.nrs.gov.ng/taxpayer-portal/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-surface-container-high text-on-surface py-2.5 rounded-xl font-semibold text-sm hover:bg-surface-container-highest transition-colors flex items-center justify-center gap-2"
                    >
                      File on NRS
                      <ExternalLink size={14} />
                    </a>
                  </>
                ) : (
                  <button 
                    onClick={() => generateForm(form.id)}
                    disabled={generatingForm === form.id}
                    className="w-full bg-surface-container-high text-on-surface py-2.5 rounded-xl font-semibold text-sm hover:bg-surface-container-highest transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {generatingForm === form.id ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <RefreshCw size={16} />
                        Generate Form ({form.estimatedTime})
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Auto-Filing Benefits */}
      <div className="bg-gradient-to-r from-primary-container/20 to-tertiary-container/20 p-6 rounded-3xl border border-primary/20">
        <h3 className="font-bold text-on-surface text-xl mb-4">Benefits of Auto-Filing</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Clock size={20} className="text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-on-surface">Save Time</h4>
              <p className="text-sm text-on-surface-variant">Auto-fill reduces filing time from hours to minutes</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-tertiary/10 rounded-lg">
              <CheckCircle2 size={20} className="text-tertiary" />
            </div>
            <div>
              <h4 className="font-semibold text-on-surface">Reduce Errors</h4>
              <p className="text-sm text-on-surface-variant">Automated calculations minimize mistakes</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-error/10 rounded-lg">
              <AlertTriangle size={20} className="text-error" />
            </div>
            <div>
              <h4 className="font-semibold text-on-surface">Avoid Penalties</h4>
              <p className="text-sm text-on-surface-variant">Never miss a deadline with automated reminders</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
