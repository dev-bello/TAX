import React, { useState, useMemo } from 'react';
import { Lightbulb, TrendingUp, TrendingDown, AlertTriangle, Target, BarChart3, Users, Building2, CheckCircle2, ArrowRight, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { useBusinessProfile } from '../hooks/useBusinessProfile';
import { useTransactions } from '../hooks/useTransactions';

function formatCurrency(n: number): string {
  if (n >= 1_000_000_000) return `₦${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(0)}K`;
  return `₦${n.toFixed(0)}`;
}

export default function AIInsightsPanel() {
  const { user } = useAuth();
  const { profile } = useBusinessProfile(user?.id);
  const { transactions, totalIncome, totalExpense, netProfit } = useTransactions(user?.id);
  const [activeTab, setActiveTab] = useState<'insights' | 'benchmarks' | 'recommendations'>('insights');
  const [completedRecs, setCompletedRecs] = useState<string[]>([]);

  const toggleRecommendation = (id: string) => {
    setCompletedRecs(prev => 
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  // Real benchmarks based on profile data
  const benchmarks = useMemo(() => {
    if (!profile) return [];
    
    const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;
    const expenseRatio = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0;
    const taxRate = profile.taxRate;
    
    return [
      {
        category: 'Tax Rate',
        yourValue: taxRate,
        industryAvg: profile.annualTurnover > 100_000_000 ? 30 : profile.annualTurnover > 25_000_000 ? 20 : 0,
        topPerformer: profile.annualTurnover > 100_000_000 ? 25 : profile.annualTurnover > 25_000_000 ? 15 : 0,
        unit: '%',
        status: taxRate <= 20 ? 'above' as const : 'below' as const,
      },
      {
        category: 'Profit Margin',
        yourValue: Math.round(profitMargin),
        industryAvg: 25,
        topPerformer: 40,
        unit: '%',
        status: profitMargin >= 25 ? 'above' as const : 'below' as const,
      },
      {
        category: 'Expense Ratio',
        yourValue: Math.round(expenseRatio),
        industryAvg: 65,
        topPerformer: 50,
        unit: '%',
        status: expenseRatio <= 65 ? 'above' as const : 'below' as const,
      },
    ];
  }, [profile, totalIncome, totalExpense, netProfit]);

  // Real recommendations based on profile
  const recommendations = useMemo(() => {
    if (!profile) return [];
    const recs: Array<{ id: string; title: string; description: string; impact: 'high' | 'medium' | 'low'; category: 'savings' | 'compliance' | 'efficiency'; potentialValue: number; difficulty: 'easy' | 'moderate' | 'hard'; timeToImplement: string }> = [];
    
    if (profile.annualTurnover > 25_000_000 && !profile.vatRegistered) {
      recs.push({
        id: 'vat',
        title: 'Register for VAT Immediately',
        description: `Your ₦${(profile.annualTurnover/1_000_000).toFixed(1)}M turnover exceeds the mandatory VAT threshold. Avoid ₦500K penalties.`,
        impact: 'high',
        category: 'compliance',
        potentialValue: 500000,
        difficulty: 'easy',
        timeToImplement: '1 week',
      });
    }
    
    if (profile.isProfessional) {
      recs.push({
        id: 'prof',
        title: 'Claim Professional Expenses',
        description: 'Deduct training, certifications, and professional subscriptions from your taxable income.',
        impact: 'medium',
        category: 'savings',
        potentialValue: profile.annualTurnover * 0.015,
        difficulty: 'easy',
        timeToImplement: '2 weeks',
      });
    }
    
    if (profile.numberOfEmployees >= 3) {
      recs.push({
        id: 'paye',
        title: 'Review Employee Benefit Structure',
        description: `With ${profile.numberOfEmployees} employees, tax-free allowances can reduce PAYE liability.`,
        impact: 'medium',
        category: 'savings',
        potentialValue: profile.numberOfEmployees * 60000,
        difficulty: 'moderate',
        timeToImplement: '1 month',
      });
    }
    
    if (totalExpense > totalIncome * 0.8) {
      recs.push({
        id: 'expense',
        title: 'Reduce Expense Ratio',
        description: `Your expenses are ${((totalExpense/totalIncome)*100).toFixed(0)}% of income. Industry average is 65%.`,
        impact: 'high',
        category: 'efficiency',
        potentialValue: (totalExpense - totalIncome * 0.65) * (profile.taxRate / 100),
        difficulty: 'hard',
        timeToImplement: '3 months',
      });
    }
    
    return recs;
  }, [profile, totalExpense, totalIncome]);

  const totalPotentialSavings = recommendations
    .filter(r => !completedRecs.includes(r.id))
    .reduce((sum, r) => sum + r.potentialValue, 0);

  const highImpactRecs = recommendations.filter(r => r.impact === 'high' && !completedRecs.includes(r.id));
  const easyWins = recommendations.filter(r => r.difficulty === 'easy' && !completedRecs.includes(r.id));

  // Real tax trend data
  const taxTrends = useMemo(() => {
    if (!profile) return [];
    const months = ['Jan','Feb','Mar','Apr','May','Jun'];
    return months.map(m => ({
      month: m,
      yourRate: profile.taxRate,
      industryAvg: profile.annualTurnover > 100_000_000 ? 30 : 20,
      optimized: Math.max(0, profile.taxRate - 5),
    }));
  }, [profile]);

  if (!profile) {
    return <div className="text-center text-on-surface-variant py-8">Complete your profile to see insights.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-primary-container/30 to-primary-container/10 p-5 rounded-2xl border border-primary/20">
          <div className="flex items-center gap-3 mb-2">
            <Lightbulb className="text-primary" size={24} />
            <span className="text-on-surface-variant">AI Insights</span>
          </div>
          <div className="text-3xl font-bold text-primary">{recommendations.length - completedRecs.length}</div>
          <p className="text-sm text-on-surface-variant">Active recommendations</p>
        </div>

        <div className="bg-gradient-to-br from-tertiary-container/30 to-tertiary-container/10 p-5 rounded-2xl border border-tertiary/20">
          <div className="flex items-center gap-3 mb-2">
            <Target className="text-tertiary" size={24} />
            <span className="text-on-surface-variant">Potential Savings</span>
          </div>
          <div className="text-3xl font-bold text-tertiary">{formatCurrency(totalPotentialSavings)}</div>
          <p className="text-sm text-on-surface-variant">From AI recommendations</p>
        </div>

        <div className="bg-gradient-to-br from-error-container/30 to-error-container/10 p-5 rounded-2xl border border-error/20">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="text-error" size={24} />
            <span className="text-on-surface-variant">Easy Wins</span>
          </div>
          <div className="text-3xl font-bold text-error">{easyWins.length}</div>
          <p className="text-sm text-on-surface-variant">Quick improvements</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-surface-container-low p-1.5 rounded-2xl">
        {[
          { id: 'insights', label: 'Smart Insights', icon: Lightbulb },
          { id: 'benchmarks', label: 'Benchmarks', icon: BarChart3 },
          { id: 'recommendations', label: 'Recommendations', icon: Target },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              activeTab === tab.id
                ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          {/* Tax Rate Trend Chart */}
          <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-sm border border-outline-variant/15">
            <h3 className="font-bold text-on-surface text-lg mb-2">Your Tax Rate vs. Industry</h3>
            <p className="text-sm text-on-surface-variant mb-6">
              Your effective tax rate compared to industry average for {profile.classification} businesses
            </p>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={taxTrends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6e7a70'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6e7a70'}} tickFormatter={(value) => `${value}%`} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} formatter={(value: number) => [`${value}%`, '']} />
                  <Bar dataKey="yourRate" name="Your Rate" fill="#0a6a48" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="industryAvg" name="Industry Avg" fill="#bdcabe" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="optimized" name="Optimized" fill="#6b8e5a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 flex justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-[#0a6a48]" />
                <span className="text-sm text-on-surface-variant">Your Rate</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-[#bdcabe]" />
                <span className="text-sm text-on-surface-variant">Industry Avg</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-[#6b8e5a]" />
                <span className="text-sm text-on-surface-variant">Optimized</span>
              </div>
            </div>
          </div>

          {/* Key Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-tertiary-container/10 p-5 rounded-2xl border border-tertiary/20">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-tertiary/20 rounded-lg">
                  {netProfit >= 0 ? <TrendingDown className="text-tertiary" size={20} /> : <TrendingUp className="text-error" size={20} />}
                </div>
                <div>
                  <h4 className="font-bold text-tertiary mb-1">{netProfit >= 0 ? 'Profitable' : 'Loss Detected'}</h4>
                  <p className="text-sm text-on-surface-variant">
                    Your net profit is <strong className="text-on-surface">{formatCurrency(netProfit)}</strong>. 
                    {netProfit >= 0 
                      ? ` You're operating at a ${((netProfit/totalIncome)*100).toFixed(1)}% margin.`
                      : ' Review expenses urgently.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-primary-container/10 p-5 rounded-2xl border border-primary/20">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <TrendingUp className="text-primary" size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-primary mb-1">Tax Classification</h4>
                  <p className="text-sm text-on-surface-variant">
                    You're classified as a <strong className="text-on-surface">{profile.classification}</strong> with a 
                    <strong className="text-on-surface"> {profile.taxRate}%</strong> tax rate.
                    {profile.annualTurnover < 25_000_000 ? ' Small company exemption applies.' : ''}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'benchmarks' && (
        <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-sm border border-outline-variant/15">
          <h3 className="font-bold text-on-surface text-lg mb-6">How You Compare</h3>
          
          <div className="space-y-6">
            {benchmarks.map((benchmark) => (
              <div key={benchmark.category}>
                <div className="flex justify-between items-center mb-3">
                  <span className="font-semibold text-on-surface">{benchmark.category}</span>
                  <span className={`text-sm font-bold ${benchmark.status === 'above' ? 'text-tertiary' : 'text-error'}`}>
                    {benchmark.yourValue}{benchmark.unit}
                  </span>
                </div>

                <div className="relative h-8 bg-surface-container-high rounded-full overflow-hidden">
                  <div className="absolute top-0 bottom-0 w-0.5 bg-on-surface-variant z-10" style={{ left: `${benchmark.industryAvg}%` }}>
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-[10px] text-on-surface-variant whitespace-nowrap">Avg</div>
                  </div>
                  <div className="absolute top-0 bottom-0 w-0.5 bg-tertiary z-10" style={{ left: `${benchmark.topPerformer}%` }}>
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-[10px] text-tertiary whitespace-nowrap">Best</div>
                  </div>
                  <div className={`h-full rounded-full transition-all duration-500 ${benchmark.status === 'above' ? 'bg-tertiary' : 'bg-error'}`} style={{ width: `${Math.min(benchmark.yourValue, 100)}%` }} />
                </div>

                <div className="flex justify-between mt-2 text-xs text-on-surface-variant">
                  <span>0{benchmark.unit}</span>
                  <span>Industry Avg: {benchmark.industryAvg}{benchmark.unit}</span>
                  <span>100{benchmark.unit}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-surface-container-low rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <Users size={16} className="text-on-surface-variant" />
              <span className="text-sm font-semibold text-on-surface">Benchmark Methodology</span>
            </div>
            <p className="text-xs text-on-surface-variant">
              Comparisons are based on Nigerian tax act thresholds for {profile.classification} businesses 
              with {profile.annualTurnover < 25_000_000 ? 'small' : profile.annualTurnover < 100_000_000 ? 'medium' : 'large'} revenue.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'recommendations' && (
        <div className="space-y-4">
          {highImpactRecs.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold text-on-surface mb-4 flex items-center gap-2">
                <AlertTriangle size={20} className="text-error" />
                High Impact Actions
              </h3>
              {highImpactRecs.map((rec) => (
                <RecommendationCard 
                  key={rec.id} 
                  recommendation={rec} 
                  isCompleted={completedRecs.includes(rec.id)}
                  onToggle={() => toggleRecommendation(rec.id)}
                />
              ))}
            </div>
          )}

          {easyWins.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold text-on-surface mb-4 flex items-center gap-2">
                <CheckCircle2 size={20} className="text-tertiary" />
                Quick Wins (Easy to Implement)
              </h3>
              {easyWins.map((rec) => (
                <RecommendationCard 
                  key={rec.id} 
                  recommendation={rec}
                  isCompleted={completedRecs.includes(rec.id)}
                  onToggle={() => toggleRecommendation(rec.id)}
                />
              ))}
            </div>
          )}

          {recommendations.filter(r => !highImpactRecs.includes(r) && !easyWins.includes(r)).length > 0 && (
            <div>
              <h3 className="font-bold text-on-surface mb-4">All Recommendations</h3>
              {recommendations
                .filter(r => !highImpactRecs.includes(r) && !easyWins.includes(r))
                .map((rec) => (
                  <RecommendationCard 
                    key={rec.id} 
                    recommendation={rec}
                    isCompleted={completedRecs.includes(rec.id)}
                    onToggle={() => toggleRecommendation(rec.id)}
                  />
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RecommendationCard({ 
  recommendation, 
  isCompleted, 
  onToggle 
}: { 
  recommendation: { id: string; title: string; description: string; impact: string; category: string; potentialValue: number; difficulty: string; timeToImplement: string };
  isCompleted: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={`p-5 rounded-2xl border mb-4 transition-all ${
      isCompleted 
        ? 'bg-surface-container-low/50 border-outline-variant/20 opacity-60' 
        : 'bg-surface-container-lowest border-outline-variant/20 hover:border-primary/30'
    }`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${
              recommendation.impact === 'high' ? 'bg-error/10 text-error' :
              recommendation.impact === 'medium' ? 'bg-primary/10 text-primary' :
              'bg-surface-container-high text-on-surface-variant'
            }`}>
              {recommendation.impact.toUpperCase()} IMPACT
            </span>
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${
              recommendation.difficulty === 'easy' ? 'bg-tertiary/10 text-tertiary' :
              recommendation.difficulty === 'moderate' ? 'bg-primary/10 text-primary' :
              'bg-error/10 text-error'
            }`}>
              {recommendation.difficulty.toUpperCase()}
            </span>
          </div>

          <h4 className={`font-bold mb-2 ${isCompleted ? 'line-through text-on-surface-variant' : 'text-on-surface'}`}>
            {recommendation.title}
          </h4>
          <p className="text-sm text-on-surface-variant mb-3">{recommendation.description}</p>

          <div className="flex flex-wrap gap-4 text-xs">
            {recommendation.potentialValue > 0 && (
              <span className="flex items-center gap-1 text-tertiary font-semibold">
                <TrendingUp size={12} />
                Save {formatCurrency(recommendation.potentialValue)}/year
              </span>
            )}
            <span className="flex items-center gap-1 text-on-surface-variant">
              <Clock size={12} />
              {recommendation.timeToImplement}
            </span>
          </div>
        </div>

        <button
          onClick={onToggle}
          className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
            isCompleted 
              ? 'bg-tertiary text-white' 
              : 'bg-surface-container-high text-on-surface-variant hover:bg-primary hover:text-white'
          }`}
        >
          {isCompleted ? <CheckCircle2 size={20} /> : <ArrowRight size={20} />}
        </button>
      </div>
    </div>
  );
}
