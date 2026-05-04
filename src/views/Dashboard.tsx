import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, Tooltip, BarChart, Bar, YAxis } from 'recharts';
import { Wallet, PiggyBank, CalendarDays, ArrowRight, AlertTriangle, CheckCircle2, ExternalLink, Lightbulb, TrendingDown, Info, Loader2 } from 'lucide-react';
import { useToast } from '../components/Toast';
import { useBusinessProfile } from '../hooks/useBusinessProfile';
import HelpTooltip from '../components/HelpTooltip';

function getNextVatDeadline(): Date {
  const now = new Date();
  const deadline = new Date(now.getFullYear(), now.getMonth() + 1, 21);
  if (now.getDate() > 21) {
    deadline.setMonth(deadline.getMonth() + 1);
  }
  return deadline;
}

function getNextCitDeadline(): Date {
  const now = new Date();
  let deadline = new Date(now.getFullYear(), 2, 31); // March 31
  if (now > deadline) {
    deadline = new Date(now.getFullYear() + 1, 2, 31);
  }
  return deadline;
}

function daysUntil(target: Date): number {
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function formatCurrency(n: number): string {
  if (n >= 1_000_000_000) return `₦${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(0)}K`;
  return `₦${n.toFixed(0)}`;
}

const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

export default function Dashboard() {
  const { addToast } = useToast();
  const { profile } = useBusinessProfile();
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [showDeductionsModal, setShowDeductionsModal] = useState(false);
  const [claimedDeductions, setClaimedDeductions] = useState<string[]>([]);

  const turnover = profile?.annualTurnover ?? 0;
  const taxRate = profile?.taxRate ?? 0;
  const taxEstimate = turnover * (taxRate / 100);

  const deductions = [
    { id: 'internet', label: 'Office Internet (₦540K)', amount: 540000 },
    { id: 'professional', label: 'Professional Fees (₦350K)', amount: 350000 },
    { id: 'fuel', label: 'Transportation/Fuel (₦280K)', amount: 280000 },
    { id: 'utilities', label: 'Utilities (₦195K)', amount: 195000 },
    { id: 'marketing', label: 'Marketing (₦85K)', amount: 85000 },
  ];

  const totalSavings = deductions
    .filter(d => claimedDeductions.includes(d.id))
    .reduce((sum, d) => sum + d.amount, 0);

  const vatDeadline = getNextVatDeadline();
  const citDeadline = getNextCitDeadline();
  const vatDays = daysUntil(vatDeadline);
  const citDays = daysUntil(citDeadline);

  const isVatUrgent = vatDays <= 7;
  const isCitUrgent = citDays <= 14;

  const nextDeadline = vatDays <= citDays
    ? { label: 'VAT Remittance', date: vatDeadline, days: vatDays, urgent: isVatUrgent }
    : { label: 'Company Tax Filing', date: citDeadline, days: citDays, urgent: isCitUrgent };

  const lineData = useMemo(() => {
    const base = turnover / 12;
    return MONTHS.map((m, i) => ({
      name: m,
      actual: Math.round(base * (0.7 + Math.sin(i) * 0.3)),
      baseline: Math.round(base),
    }));
  }, [turnover]);

  const barData = useMemo(() => {
    const total = taxEstimate || 1;
    return [
      { name: 'Company Tax', value: Math.round((total * 0.45) / 1_000_000) },
      { name: 'VAT', value: Math.round((total * 0.30) / 1_000_000) },
      { name: 'Employee Tax', value: Math.round((total * 0.15) / 1_000_000) },
      { name: 'Levy', value: Math.round((total * 0.10) / 1_000_000) },
    ];
  }, [taxEstimate]);

  const handleGenerateReport = () => {
    setIsGeneratingReport(true);
    setTimeout(() => {
      setIsGeneratingReport(false);
      addToast('Tax report generated and downloaded!', 'success');
    }, 2000);
  };

  const handlePrepareTaxReturn = () => {
    window.dispatchEvent(new CustomEvent('navigateTo', { detail: 'calculator' }));
    addToast('Navigating to Tax Calculator...', 'info');
  };

  const handleViewDeductions = () => {
    setShowDeductionsModal(true);
  };

  const toggleDeduction = (id: string) => {
    setClaimedDeductions(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const handleClaimDeductions = () => {
    setShowDeductionsModal(false);
    if (claimedDeductions.length > 0) {
      addToast(`Successfully claimed ${claimedDeductions.length} deductions! Saved ${formatCurrency(totalSavings)}`, 'success');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500" data-tour="welcome">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-on-surface tracking-tight mb-2">Your Tax Overview</h1>
          <p className="text-on-surface-variant text-base md:text-lg">
            {profile ? `Based on your ${profile.classification} profile.` : 'Complete your business profile to get started.'}
          </p>
        </div>
        <button onClick={handleGenerateReport} disabled={isGeneratingReport}
          className="bg-surface-container-lowest border border-outline-variant/30 text-primary px-6 py-3 rounded-xl font-semibold hover:bg-surface-container-low transition-colors flex items-center gap-2 shadow-sm w-full md:w-auto justify-center disabled:opacity-50">
          {isGeneratingReport ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
          {isGeneratingReport ? 'Generating...' : 'Generate Report'}
        </button>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-tour="tax-overview">
        <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-taxfyp border border-outline-variant/15 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10"></div>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-primary-container/10 rounded-xl text-primary">
              <Wallet size={24} />
            </div>
            <h3 className="text-on-surface-variant font-semibold"><HelpTooltip term="Total Tax Owed" explanation="The estimated amount of tax your business owes based on your turnover and tax rate. This is before deductions and exemptions are applied." /></h3>
          </div>
          <div className="text-4xl font-extrabold text-on-surface mb-2">{formatCurrency(taxEstimate)}</div>
          <div className="text-sm text-primary font-medium flex items-center gap-1">
            <span>↓ Estimated at {taxRate}% rate</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-taxfyp border border-outline-variant/15 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-tertiary/5 rounded-bl-full -z-10"></div>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-tertiary-container/10 rounded-xl text-tertiary">
              <PiggyBank size={24} />
            </div>
            <h3 className="text-on-surface-variant font-semibold"><HelpTooltip term="Money Saved" explanation="The total amount you've saved through tax deductions and smart tax planning. This reduces your taxable income." /></h3>
          </div>
          <div className="text-4xl font-extrabold text-on-surface mb-2">{formatCurrency(totalSavings)}</div>
          <div className="text-sm text-tertiary font-medium">Through smart deductions</div>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-taxfyp border border-outline-variant/15 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-error/5 rounded-bl-full -z-10"></div>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-error-container/30 rounded-xl text-error">
              <CalendarDays size={24} />
            </div>
            <h3 className="text-on-surface-variant font-semibold"><HelpTooltip term="Next Deadline" explanation="The nearest upcoming tax filing or payment deadline. Missing deadlines results in penalties and interest charges." /></h3>
          </div>
          <div className="text-4xl font-extrabold text-on-surface mb-2">{nextDeadline.days} Days</div>
          <div className="text-sm text-error font-medium">{nextDeadline.label} ({nextDeadline.date.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })})</div>

          {nextDeadline.urgent && (
            <div className="mt-4 p-3 bg-error/10 rounded-xl border border-error/20">
              <div className="flex items-start gap-2">
                <AlertTriangle size={16} className="text-error shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-error">Penalty Warning</p>
                  <p className="text-xs text-on-surface-variant">
                    Missing this deadline = 10% penalty + ₦500K fine + interest (2025/26 Act rates)
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface-container-lowest p-8 rounded-3xl shadow-taxfyp border border-outline-variant/15">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-on-surface">Tax Spending Trend</h2>
            <div className="flex gap-4 text-sm font-medium">
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-primary"></span> Actual</div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-outline-variant"></span> Expected</div>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6e7a70'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6e7a70'}} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                  cursor={{ stroke: '#e1e3df', strokeWidth: 2, strokeDasharray: '4 4' }}
                />
                <Line type="monotone" dataKey="actual" stroke="#0a6a48" strokeWidth={4} dot={false} activeDot={{ r: 6, fill: '#0a6a48', stroke: '#fff', strokeWidth: 2 }} />
                <Line type="monotone" dataKey="baseline" stroke="#bdcabe" strokeWidth={2} strokeDasharray="6 6" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-taxfyp border border-outline-variant/15">
          <h2 className="text-xl font-bold text-on-surface mb-8">Where Your Tax Goes</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 14, fill: '#191c1a', fontWeight: 600}} width={110} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="value" fill="#0a6a48" radius={[0, 8, 8, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Actionable Next Steps */}
      <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-taxfyp border border-outline-variant/15" data-tour="actionable-steps">
        <h2 className="text-xl font-bold text-on-surface mb-6">Action Required: Pay Your Taxes</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* VAT Payment */}
          <div className="p-5 bg-error-container/10 border border-error/20 rounded-2xl">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-on-surface"><HelpTooltip term="VAT Payment Due" explanation="Value Added Tax payment due date. VAT is 7.5% on goods and services. Due by 21st of each month in Nigeria." /></h3>
                <p className="text-sm text-on-surface-variant">{formatCurrency(taxEstimate * 0.075)} for {vatDeadline.toLocaleDateString('en-NG', { month: 'long', year: 'numeric' })}</p>
              </div>
              <span className="bg-error text-white text-xs font-bold px-2 py-1 rounded-full">{vatDays <= 7 ? 'URGENT' : `${vatDays} DAYS`}</span>
            </div>
            <div className="flex items-center gap-2 mb-4 text-sm text-error">
              <AlertTriangle size={16} />
              <span>Due in {vatDays} days ({vatDeadline.toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })})</span>
            </div>
            <a
              href="https://www.nrs.gov.ng/taxpayer-portal/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-error text-white py-3 rounded-xl font-semibold hover:bg-error/90 transition-colors"
            >
              Pay Now via NRS Portal
              <ExternalLink size={18} />
            </a>
            <p className="text-xs text-on-surface-variant mt-3 text-center">
              Late payment penalty: ₦250,000 (10%) + ₦500K fine (2025/26 Act)
            </p>
          </div>

          {/* Company Tax */}
          <div className="p-5 bg-primary-container/10 border border-primary/20 rounded-2xl">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-on-surface"><HelpTooltip term="Company Tax Filing" explanation="Annual Company Income Tax return due by March 31. Shows profits, deductions, and tax owed for the year." /></h3>
                <p className="text-sm text-on-surface-variant">Annual return due</p>
              </div>
              <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">{citDays} DAYS</span>
            </div>
            <div className="flex items-center gap-2 mb-4 text-sm text-primary">
              <CalendarDays size={16} />
              <span>Due {citDeadline.toLocaleDateString('en-NG', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <button onClick={handlePrepareTaxReturn} className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors">
              Prepare Tax Return
            </button>
            <p className="text-xs text-on-surface-variant mt-3 text-center">
              Start preparing now to avoid last-minute rush
            </p>
          </div>
        </div>

        {/* Savings Opportunity */}
        <div className="mt-6 p-5 bg-tertiary-container/10 border border-tertiary/20 rounded-2xl" data-tour="savings-opportunity">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="p-3 bg-tertiary/20 rounded-xl">
              <Lightbulb className="text-tertiary" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-tertiary mb-2">You Could Save {formatCurrency(deductions.reduce((s, d) => s + d.amount, 0) - totalSavings)}!</h3>
              <p className="text-sm text-on-surface-variant mb-3">
                We found {deductions.length} expenses you haven't claimed as deductions yet. Adding these could reduce your tax by {formatCurrency(deductions.reduce((s, d) => s + d.amount, 0) - totalSavings)}.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {deductions.slice(0, 2).map(d => (
                  <span key={d.id} className="text-xs bg-surface-container-high px-2 py-1 rounded-md">{d.label}</span>
                ))}
                <span className="text-xs bg-surface-container-high px-2 py-1 rounded-md">+{deductions.length - 2} more</span>
              </div>
              <button onClick={handleViewDeductions} className="text-tertiary font-semibold text-sm flex items-center gap-1 hover:underline">
                View and add deductions <ArrowRight size={16} />
              </button>
            </div>
            <div className="text-left sm:text-right w-full sm:w-auto mt-2 sm:mt-0">
              <div className="text-2xl font-extrabold text-tertiary">{formatCurrency(deductions.reduce((s, d) => s + d.amount, 0) - totalSavings)}</div>
              <div className="text-xs text-on-surface-variant">Potential Savings</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-container-low p-6 rounded-3xl">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-bold text-on-surface">Uncategorized Expenses</h3>
            <span className="bg-surface-container-lowest px-3 py-1 rounded-full text-xs font-bold text-on-surface-variant">Action Req</span>
          </div>
          <div className="text-3xl font-extrabold mb-1">3</div>
          <p className="text-sm text-on-surface-variant">Needs your review.</p>
        </div>

        <div className="bg-surface-container-low p-6 rounded-3xl">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-bold text-on-surface">Audit Risk</h3>
            <AlertTriangle size={20} className="text-primary" />
          </div>
          <div className="text-3xl font-extrabold mb-1 text-primary">Low</div>
          <p className="text-sm text-on-surface-variant">Audit probability &lt; 2%.</p>
        </div>

        <div className="bg-surface-container-low p-6 rounded-3xl">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-bold text-on-surface">NRS Connection</h3>
            <CheckCircle2 size={20} className="text-tertiary" />
          </div>
          <div className="text-3xl font-extrabold mb-1">100%</div>
          <p className="text-sm text-on-surface-variant">Tax portal connection stable.</p>
        </div>
      </div>

      {/* Deductions Modal */}
      {showDeductionsModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowDeductionsModal(false)}>
          <div className="bg-surface-container-lowest rounded-3xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-on-surface mb-4">Claim Deductions</h3>
            <p className="text-sm text-on-surface-variant mb-4">Select expenses to claim as tax deductions:</p>
            <div className="space-y-2 mb-6">
              {deductions.map(d => (
                <label key={d.id} className="flex items-center gap-3 p-3 rounded-xl border border-outline-variant/20 hover:bg-surface-container-low cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={claimedDeductions.includes(d.id)}
                    onChange={() => toggleDeduction(d.id)}
                    className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium text-on-surface">{d.label}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-between items-center mb-4 p-3 bg-tertiary-container/10 rounded-xl">
              <span className="text-sm font-semibold text-tertiary">Total Savings</span>
              <span className="text-lg font-bold text-tertiary">{formatCurrency(totalSavings)}</span>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowDeductionsModal(false)} className="flex-1 py-2.5 rounded-xl font-semibold text-on-surface-variant hover:bg-surface-container-low transition-colors border border-outline-variant/30">
                Cancel
              </button>
              <button onClick={handleClaimDeductions} className="flex-1 py-2.5 rounded-xl font-semibold bg-primary text-white hover:bg-primary/90 transition-colors">
                Claim Selected
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
