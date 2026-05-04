import React, { useState } from 'react';
import { Lightbulb, TrendingUp, TrendingDown, AlertTriangle, Target, BarChart3, Users, Building2, CheckCircle2, ArrowRight, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Benchmark {
  category: string;
  yourValue: number;
  industryAvg: number;
  topPerformer: number;
  unit: string;
  status: 'above' | 'below' | 'on-par';
}

interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: 'savings' | 'compliance' | 'efficiency';
  potentialValue: number;
  difficulty: 'easy' | 'moderate' | 'hard';
  timeToImplement: string;
  completed: boolean;
}

interface TaxTrend {
  month: string;
  yourRate: number;
  industryAvg: number;
  optimized: number;
}

const BENCHMARKS: Benchmark[] = [
  {
    category: 'Tax Rate',
    yourValue: 24,
    industryAvg: 28,
    topPerformer: 18,
    unit: '%',
    status: 'above',
  },
  {
    category: 'Deductions Claimed',
    yourValue: 68,
    industryAvg: 72,
    topPerformer: 85,
    unit: '%',
    status: 'below',
  },
  {
    category: 'Compliance Score',
    yourValue: 94,
    industryAvg: 87,
    topPerformer: 98,
    unit: '%',
    status: 'above',
  },
  {
    category: 'Filing Timeliness',
    yourValue: 96,
    industryAvg: 82,
    topPerformer: 100,
    unit: '%',
    status: 'above',
  },
];

const AI_RECOMMENDATIONS: AIRecommendation[] = [
  {
    id: '1',
    title: 'Claim Home Office Deduction',
    description: 'You work from home 3 days/week. You can claim 30% of rent and utilities as business expenses.',
    impact: 'high',
    category: 'savings',
    potentialValue: 1800000,
    difficulty: 'easy',
    timeToImplement: '1 week',
    completed: false,
  },
  {
    id: '2',
    title: 'Switch to Quarterly VAT Filing',
    description: 'Your monthly VAT is consistently low. Quarterly filing reduces admin burden and improves cash flow.',
    impact: 'medium',
    category: 'efficiency',
    potentialValue: 500000,
    difficulty: 'moderate',
    timeToImplement: '2 weeks',
    completed: false,
  },
  {
    id: '3',
    title: 'Set Up Tax Reserve Account',
    description: 'Create a dedicated high-yield account for tax savings. Current setup risks cash flow issues.',
    impact: 'high',
    category: 'compliance',
    potentialValue: 0,
    difficulty: 'easy',
    timeToImplement: '3 days',
    completed: false,
  },
  {
    id: '4',
    title: 'Review Employee Benefits Structure',
    description: 'Restructure benefits to maximize tax-free allowances (transport, meal, etc.).',
    impact: 'medium',
    category: 'savings',
    potentialValue: 1200000,
    difficulty: 'hard',
    timeToImplement: '1 month',
    completed: false,
  },
  {
    id: '5',
    title: 'Implement Digital Receipt System',
    description: '34% of your receipts are still paper-based. Digital system prevents loss and simplifies audits.',
    impact: 'medium',
    category: 'efficiency',
    potentialValue: 0,
    difficulty: 'easy',
    timeToImplement: '2 weeks',
    completed: false,
  },
];

const TAX_TRENDS: TaxTrend[] = [
  { month: 'Jan', yourRate: 26, industryAvg: 28, optimized: 20 },
  { month: 'Feb', yourRate: 25, industryAvg: 28, optimized: 19 },
  { month: 'Mar', yourRate: 24, industryAvg: 27, optimized: 19 },
  { month: 'Apr', yourRate: 24, industryAvg: 27, optimized: 18 },
  { month: 'May', yourRate: 23, industryAvg: 27, optimized: 18 },
  { month: 'Jun', yourRate: 24, industryAvg: 28, optimized: 19 },
];

export default function AIInsightsPanel() {
  const [activeTab, setActiveTab] = useState<'insights' | 'benchmarks' | 'recommendations'>('insights');
  const [completedRecs, setCompletedRecs] = useState<string[]>([]);

  const toggleRecommendation = (id: string) => {
    setCompletedRecs(prev => 
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const totalPotentialSavings = AI_RECOMMENDATIONS
    .filter(r => !completedRecs.includes(r.id))
    .reduce((sum, r) => sum + r.potentialValue, 0);

  const highImpactRecs = AI_RECOMMENDATIONS.filter(r => r.impact === 'high' && !completedRecs.includes(r.id));
  const easyWins = AI_RECOMMENDATIONS.filter(r => r.difficulty === 'easy' && !completedRecs.includes(r.id));

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-primary-container/30 to-primary-container/10 p-5 rounded-2xl border border-primary/20">
          <div className="flex items-center gap-3 mb-2">
            <Lightbulb className="text-primary" size={24} />
            <span className="text-on-surface-variant">AI Insights</span>
          </div>
          <div className="text-3xl font-bold text-primary">{AI_RECOMMENDATIONS.length - completedRecs.length}</div>
          <p className="text-sm text-on-surface-variant">Active recommendations</p>
        </div>

        <div className="bg-gradient-to-br from-tertiary-container/30 to-tertiary-container/10 p-5 rounded-2xl border border-tertiary/20">
          <div className="flex items-center gap-3 mb-2">
            <Target className="text-tertiary" size={24} />
            <span className="text-on-surface-variant">Potential Savings</span>
          </div>
          <div className="text-3xl font-bold text-tertiary">₦{(totalPotentialSavings / 1000000).toFixed(1)}M</div>
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
              Your effective tax rate compared to industry average and optimized businesses
            </p>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={TAX_TRENDS} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6e7a70'}} />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 12, fill: '#6e7a70'}}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                    formatter={(value: number) => [`${value}%`, '']}
                  />
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
                  <TrendingDown className="text-tertiary" size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-tertiary mb-1">Good News!</h4>
                  <p className="text-sm text-on-surface-variant">
                    Your effective tax rate is <strong className="text-on-surface">14% lower</strong> than industry average. 
                    You're doing better than 68% of similar businesses.
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
                  <h4 className="font-bold text-primary mb-1">Opportunity</h4>
                  <p className="text-sm text-on-surface-variant">
                    You could reduce your tax rate by another <strong className="text-on-surface">6%</strong> by implementing 
                    our top 3 recommendations. Potential savings: ₦3.5M/year.
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
            {BENCHMARKS.map((benchmark) => (
              <div key={benchmark.category}>
                <div className="flex justify-between items-center mb-3">
                  <span className="font-semibold text-on-surface">{benchmark.category}</span>
                  <span className={`text-sm font-bold ${
                    benchmark.status === 'above' ? 'text-tertiary' :
                    benchmark.status === 'below' ? 'text-error' :
                    'text-primary'
                  }`}>
                    {benchmark.yourValue}{benchmark.unit}
                  </span>
                </div>

                <div className="relative h-8 bg-surface-container-high rounded-full overflow-hidden">
                  {/* Industry Average Marker */}
                  <div 
                    className="absolute top-0 bottom-0 w-0.5 bg-on-surface-variant z-10"
                    style={{ left: `${(benchmark.industryAvg / 100) * 100}%` }}
                  >
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-[10px] text-on-surface-variant whitespace-nowrap">
                      Avg
                    </div>
                  </div>

                  {/* Top Performer Marker */}
                  <div 
                    className="absolute top-0 bottom-0 w-0.5 bg-tertiary z-10"
                    style={{ left: `${(benchmark.topPerformer / 100) * 100}%` }}
                  >
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-[10px] text-tertiary whitespace-nowrap">
                      Best
                    </div>
                  </div>

                  {/* Your Value Bar */}
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      benchmark.status === 'above' ? 'bg-tertiary' :
                      benchmark.status === 'below' ? 'bg-error' :
                      'bg-primary'
                    }`}
                    style={{ width: `${(benchmark.yourValue / 100) * 100}%` }}
                  />
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
              Comparisons are based on anonymized data from 2,500+ Nigerian businesses with similar 
              revenue (₦25M-₦100M) in the Technology sector. Updated monthly.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'recommendations' && (
        <div className="space-y-4">
          {/* Priority Recommendations */}
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

          {/* Easy Wins */}
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

          {/* All Recommendations */}
          <div>
            <h3 className="font-bold text-on-surface mb-4">All Recommendations</h3>
            {AI_RECOMMENDATIONS
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
  recommendation: AIRecommendation; 
  isCompleted: boolean;
  onToggle: () => void;
  key?: string;
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
                Save ₦{(recommendation.potentialValue / 1000000).toFixed(1)}M/year
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
