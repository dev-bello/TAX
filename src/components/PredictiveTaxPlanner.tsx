import React, { useState, useMemo } from 'react';
import { TrendingUp, AlertTriangle, Lightbulb, Calendar, ArrowRight, PiggyBank, Target } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { useBusinessProfile } from '../hooks/useBusinessProfile';
import { useTransactions } from '../hooks/useTransactions';

function formatCurrency(n: number): string {
  if (n >= 1_000_000_000) return `₦${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(0)}K`;
  return `₦${n.toFixed(0)}`;
}

export default function PredictiveTaxPlanner() {
  const { user } = useAuth();
  const { profile } = useBusinessProfile(user?.id);
  const { transactions, monthlyTotals, totalIncome, totalExpense, netProfit } = useTransactions(user?.id);
  const [selectedTimeframe, setSelectedTimeframe] = useState('6months');
  const [showOptimization, setShowOptimization] = useState(false);

  const months = useMemo(() => {
    const m = [];
    const now = new Date();
    for (let i = 0; i < 9; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      m.push(d.toLocaleString('en-NG', { month: 'short' }));
    }
    return m;
  }, []);

  // Real projections based on actual transaction trends
  const predictionData = useMemo(() => {
    if (!profile) return [];
    
    const monthlyProfit = netProfit / Math.max(Object.keys(monthlyTotals).length, 1);
    const taxRate = profile.taxRate / 100;
    const baseTax = monthlyProfit * taxRate;
    
    return months.map((month, index) => {
      const seasonalFactor = month === 'Dec' ? 1.3 : month === 'Jun' ? 0.8 : 1;
      const growthFactor = 1 + (index * 0.02);
      const projectedTax = baseTax * seasonalFactor * growthFactor;
      
      return {
        month,
        projectedTax: Math.max(0, Math.round(projectedTax)),
        actualTax: index < 2 && monthlyTotals[month] ? Math.round(monthlyTotals[month].expense * 0.3) : null,
        savingsTarget: Math.round(projectedTax * 0.15),
      };
    }).map((item, index, arr) => ({
      ...item,
      cumulativeSavings: arr.slice(0, index + 1).reduce((sum, curr) => sum + curr.savingsTarget, 0),
    }));
  }, [profile, netProfit, monthlyTotals, months]);

  // Detect real anomalies from transactions
  const anomalies = useMemo(() => {
    const result: Array<{ id: string; type: string; description: string; severity: 'warning' | 'error'; amount: number; recommendedAction: string }> = [];
    
    if (transactions.length === 0) return result;
    
    // Find expense spikes by category
    const categoryTotals: Record<string, number> = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });
    
    const avgExpense = totalExpense / Math.max(Object.keys(categoryTotals).length, 1);
    
    Object.entries(categoryTotals).forEach(([cat, amount], i) => {
      if (amount > avgExpense * 3) {
        result.push({
          id: `spike-${i}`,
          type: 'expense_spike',
          description: `${cat} expenses are ${((amount/avgExpense)).toFixed(0)}x higher than average`,
          severity: 'warning',
          amount,
          recommendedAction: `Review ${cat} transactions and verify all are legitimate business expenses`,
        });
      }
    });
    
    // Check if expenses exceed income
    if (totalExpense > totalIncome * 0.9) {
      result.push({
        id: 'low-margin',
        type: 'income_drop',
        description: `Your expense-to-income ratio is ${((totalExpense/totalIncome)*100).toFixed(0)}%`,
        severity: 'error',
        amount: totalExpense - totalIncome,
        recommendedAction: 'Review your pricing strategy and cut non-essential expenses',
      });
    }
    
    return result;
  }, [transactions, totalExpense, totalIncome]);

  // Real optimization opportunities based on profile
  const opportunities = useMemo(() => {
    if (!profile) return [];
    const ops: Array<{ id: string; title: string; description: string; potentialSavings: number; deadline: string; category: 'timing' | 'deduction' | 'investment' | 'compliance' }> = [];
    
    if (profile.annualTurnover > 25_000_000 && !profile.vatRegistered) {
      ops.push({
        id: 'vat-reg',
        title: 'Register for VAT',
        description: `Your turnover (₦${(profile.annualTurnover/1_000_000).toFixed(1)}M) exceeds the ₦25M threshold. Register to avoid penalties.`,
        potentialSavings: 500000,
        deadline: 'Within 30 days',
        category: 'compliance',
      });
    }
    
    if (profile.isProfessional && profile.annualTurnover > 10_000_000) {
      ops.push({
        id: 'prof-deduct',
        title: 'Maximize Professional Deductions',
        description: 'As a professional services business, you can claim training, certification, and equipment costs.',
        potentialSavings: profile.annualTurnover * 0.02,
        deadline: 'Before year-end',
        category: 'deduction',
      });
    }
    
    if (profile.numberOfEmployees > 5) {
      ops.push({
        id: 'paye-opt',
        title: 'Optimize PAYE Structure',
        description: `With ${profile.numberOfEmployees} employees, restructuring allowances can reduce overall tax burden.`,
        potentialSavings: profile.numberOfEmployees * 50000,
        deadline: 'Next payroll cycle',
        category: 'timing',
      });
    }
    
    return ops;
  }, [profile]);

  if (!profile) {
    return (
      <div className="bg-surface-container-lowest p-8 rounded-3xl text-center">
        <p className="text-on-surface-variant">Complete your business profile to see tax forecasts.</p>
      </div>
    );
  }

  const totalProjectedTax = predictionData.reduce((sum, item) => sum + item.projectedTax, 0);
  const totalSavingsNeeded = predictionData.reduce((sum, item) => sum + item.savingsTarget, 0);
  const currentSavingsRate = totalIncome > 0 ? Math.min(totalSavingsNeeded / totalIncome, 1) : 0;

  return (
    <div className="space-y-8">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-taxfyp border border-outline-variant/15">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-primary-container/10 rounded-lg text-primary">
              <TrendingUp size={24} />
            </div>
            <span className="text-on-surface-variant font-medium">Projected Annual Tax</span>
          </div>
          <div className="text-3xl font-extrabold text-on-surface">{formatCurrency(totalProjectedTax)}</div>
          <p className="text-sm text-on-surface-variant mt-2">Based on {profile.classification} profile</p>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-taxfyp border border-outline-variant/15">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-tertiary-container/10 rounded-lg text-tertiary">
              <PiggyBank size={24} />
            </div>
            <span className="text-on-surface-variant font-medium">Savings Target</span>
          </div>
          <div className="text-3xl font-extrabold text-tertiary">{formatCurrency(totalSavingsNeeded)}</div>
          <div className="mt-2">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-on-surface-variant">Progress</span>
              <span className="font-medium text-tertiary">{Math.round(currentSavingsRate * 100)}%</span>
            </div>
            <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
              <div className="h-full bg-tertiary rounded-full transition-all duration-500" style={{ width: `${currentSavingsRate * 100}%` }} />
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-taxfyp border border-outline-variant/15">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-error-container/30 rounded-lg text-error">
              <AlertTriangle size={24} />
            </div>
            <span className="text-on-surface-variant font-medium">Anomalies Detected</span>
          </div>
          <div className="text-3xl font-extrabold text-error">{anomalies.length}</div>
          <p className="text-sm text-on-surface-variant mt-2">From your transaction data</p>
        </div>
      </div>

      {/* Anomaly Alerts */}
      {anomalies.length > 0 && (
        <div className="bg-error-container/10 border border-error/20 p-6 rounded-3xl">
          <h3 className="font-bold text-error mb-4 flex items-center gap-2">
            <AlertTriangle size={20} />
            Unusual Patterns Detected
          </h3>
          <div className="space-y-4">
            {anomalies.map((anomaly) => (
              <div key={anomaly.id} className="bg-surface-container-lowest p-4 rounded-2xl">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${anomaly.severity === 'error' ? 'bg-error text-white' : 'bg-tertiary text-white'}`}>
                      {anomaly.severity === 'error' ? 'CRITICAL' : 'WARNING'}
                    </span>
                    <p className="font-semibold text-on-surface mt-2">{anomaly.description}</p>
                  </div>
                  <span className="text-lg font-bold text-on-surface">{formatCurrency(anomaly.amount)}</span>
                </div>
                <p className="text-sm text-on-surface-variant">{anomaly.recommendedAction}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tax Projection Chart */}
      <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-taxfyp border border-outline-variant/15">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-on-surface">Tax Projection & Savings Plan</h2>
            <p className="text-sm text-on-surface-variant">Based on your actual transaction history</p>
          </div>
        </div>

        <div className="h-80">
          {predictionData.length > 0 && predictionData.some(d => d.projectedTax > 0) ? (
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <AreaChart data={predictionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="taxGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0a6a48" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0a6a48" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6b8e5a" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6b8e5a" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6e7a70'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6e7a70'}} tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} formatter={(value: number) => [formatCurrency(value), '']} />
                <ReferenceLine y={totalSavingsNeeded / 9} stroke="#6b8e5a" strokeDasharray="3 3" />
                <Area type="monotone" dataKey="projectedTax" stroke="#0a6a48" strokeWidth={3} fillOpacity={1} fill="url(#taxGradient)" name="Projected Tax" />
                <Area type="monotone" dataKey="savingsTarget" stroke="#6b8e5a" strokeWidth={2} strokeDasharray="5 5" fillOpacity={1} fill="url(#savingsGradient)" name="Monthly Savings Target" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-on-surface-variant">
              <TrendingUp size={48} className="mb-4 opacity-30" />
              <p className="text-sm font-medium">No projection data available</p>
              <p className="text-xs mt-1">Add transactions to generate tax projections</p>
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-primary-container/10 rounded-2xl">
          <div className="flex items-start gap-3">
            <Lightbulb className="text-primary shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-semibold text-primary mb-1">Savings Recommendation</p>
              <p className="text-sm text-on-surface-variant">
                Based on your {profile.classification} status and ₦{(profile.annualTurnover/1_000_000).toFixed(1)}M turnover, 
                you should save <strong className="text-on-surface">{formatCurrency(totalSavingsNeeded / 9)} per month</strong> to cover tax obligations.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Optimization Opportunities */}
      {opportunities.length > 0 && (
        <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-taxfyp border border-outline-variant/15">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-on-surface">Tax Optimization Opportunities</h2>
              <p className="text-sm text-on-surface-variant">Based on your business profile</p>
            </div>
            <button onClick={() => setShowOptimization(!showOptimization)} className="text-primary font-semibold text-sm flex items-center gap-1">
              {showOptimization ? 'Hide Details' : 'View All'}
              <ArrowRight size={16} className={`transition-transform ${showOptimization ? 'rotate-90' : ''}`} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {opportunities.slice(0, showOptimization ? undefined : 3).map((opp) => (
              <div key={opp.id} className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/10 hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${opp.category === 'timing' ? 'bg-primary/10 text-primary' : opp.category === 'deduction' ? 'bg-tertiary/10 text-tertiary' : 'bg-error/10 text-error'}`}>
                    {opp.category.toUpperCase()}
                  </span>
                </div>
                <h4 className="font-bold text-on-surface mb-2">{opp.title}</h4>
                <p className="text-sm text-on-surface-variant mb-4">{opp.description}</p>
                <div className="flex justify-between items-center pt-3 border-t border-outline-variant/10">
                  <span className="text-lg font-bold text-tertiary">{formatCurrency(opp.potentialSavings)} saved</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-tertiary-container/10 rounded-2xl border border-tertiary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Target className="text-tertiary" size={24} />
                <div>
                  <p className="font-bold text-tertiary">Total Potential Savings</p>
                  <p className="text-sm text-on-surface-variant">By implementing all opportunities</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-extrabold text-tertiary">
                  {formatCurrency(opportunities.reduce((sum, opp) => sum + opp.potentialSavings, 0))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
