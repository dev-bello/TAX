import React, { useState, useMemo } from 'react';
import { TrendingUp, AlertTriangle, Lightbulb, Calendar, ArrowRight, PiggyBank, Target } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from 'recharts';

interface TaxPrediction {
  month: string;
  projectedTax: number;
  actualTax: number | null;
  savingsTarget: number;
  cumulativeSavings: number;
}

interface Anomaly {
  id: string;
  type: 'expense_spike' | 'income_drop' | 'unusual_pattern';
  description: string;
  severity: 'warning' | 'error';
  amount: number;
  recommendedAction: string;
}

interface OptimizationOpportunity {
  id: string;
  title: string;
  description: string;
  potentialSavings: number;
  deadline: string;
  category: 'timing' | 'deduction' | 'investment';
}

export default function PredictiveTaxPlanner() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('6months');
  const [showOptimization, setShowOptimization] = useState(false);

  // Generate predictive data
  const predictionData: TaxPrediction[] = useMemo(() => {
    const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const baseTax = 12000000; // ₦12M base monthly
    
    return months.map((month, index) => {
      const seasonalFactor = month === 'Dec' ? 1.3 : month === 'Jun' ? 0.8 : 1;
      const growthFactor = 1 + (index * 0.02); // 2% monthly growth
      const projectedTax = baseTax * seasonalFactor * growthFactor;
      
      return {
        month,
        projectedTax: Math.round(projectedTax),
        actualTax: index < 2 ? Math.round(projectedTax * (0.9 + Math.random() * 0.2)) : null,
        savingsTarget: Math.round(projectedTax * 0.15), // Save 15% of projected tax
        cumulativeSavings: 0, // Will calculate below
      };
    }).map((item, index, arr) => ({
      ...item,
      cumulativeSavings: arr.slice(0, index + 1).reduce((sum, curr) => sum + curr.savingsTarget, 0),
    }));
  }, []);

  // Detect anomalies
  const anomalies: Anomaly[] = useMemo(() => [
    {
      id: '1',
      type: 'expense_spike',
      description: 'Office expenses increased 340% in March',
      severity: 'warning',
      amount: 2400000,
      recommendedAction: 'Verify if this was a one-time equipment purchase or data entry error',
    },
    {
      id: '2',
      type: 'income_drop',
      description: 'Revenue dropped 25% compared to February trend',
      severity: 'error',
      amount: 12500000,
      recommendedAction: 'Review sales records and check for unrecorded invoices',
    },
  ], []);

  // Optimization opportunities
  const opportunities: OptimizationOpportunity[] = useMemo(() => [
    {
      id: '1',
      title: 'Q2 Equipment Purchase',
      description: 'Buy ₦5M worth of computers/office equipment in Q2 to claim capital allowances this year',
      potentialSavings: 1500000,
      deadline: 'Jun 30, 2026',
      category: 'timing',
    },
    {
      id: '2',
      title: 'Professional Development',
      description: 'Invest in staff training before year-end to claim full deduction',
      potentialSavings: 600000,
      deadline: 'Dec 31, 2026',
      category: 'deduction',
    },
    {
      id: '3',
      title: 'Prepay Rent',
      description: 'Prepay 6 months rent to accelerate deduction into current tax year',
      potentialSavings: 900000,
      deadline: 'Mar 31, 2026',
      category: 'investment',
    },
  ], []);

  const totalProjectedTax = predictionData.reduce((sum, item) => sum + item.projectedTax, 0);
  const totalSavingsNeeded = predictionData.reduce((sum, item) => sum + item.savingsTarget, 0);
  const currentSavingsRate = 0.65; // 65% of target saved so far

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
          <div className="text-3xl font-extrabold text-on-surface">₦{(totalProjectedTax / 1000000).toFixed(1)}M</div>
          <p className="text-sm text-on-surface-variant mt-2">Based on current trends</p>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-taxfyp border border-outline-variant/15">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-tertiary-container/10 rounded-lg text-tertiary">
              <PiggyBank size={24} />
            </div>
            <span className="text-on-surface-variant font-medium">Savings Target</span>
          </div>
          <div className="text-3xl font-extrabold text-tertiary">₦{(totalSavingsNeeded / 1000000).toFixed(1)}M</div>
          <div className="mt-2">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-on-surface-variant">Progress</span>
              <span className="font-medium text-tertiary">{Math.round(currentSavingsRate * 100)}%</span>
            </div>
            <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
              <div 
                className="h-full bg-tertiary rounded-full transition-all duration-500"
                style={{ width: `${currentSavingsRate * 100}%` }}
              />
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
          <p className="text-sm text-on-surface-variant mt-2">Require your attention</p>
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
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      anomaly.severity === 'error' ? 'bg-error text-white' : 'bg-tertiary text-white'
                    }`}>
                      {anomaly.severity === 'error' ? 'CRITICAL' : 'WARNING'}
                    </span>
                    <p className="font-semibold text-on-surface mt-2">{anomaly.description}</p>
                  </div>
                  <span className="text-lg font-bold text-on-surface">₦{(anomaly.amount / 1000000).toFixed(1)}M</span>
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
            <p className="text-sm text-on-surface-variant">Forecast for next 9 months</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedTimeframe('6months')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedTimeframe === '6months' 
                  ? 'bg-primary text-white' 
                  : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
              }`}
            >
              6 Months
            </button>
            <button
              onClick={() => setSelectedTimeframe('12months')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedTimeframe === '12months' 
                  ? 'bg-primary text-white' 
                  : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
              }`}
            >
              12 Months
            </button>
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
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
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 12, fill: '#6e7a70'}}
                tickFormatter={(value) => `₦${(value / 1000000).toFixed(0)}M`}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                formatter={(value: number) => [`₦${(value / 1000000).toFixed(2)}M`, '']}
              />
              <ReferenceLine y={totalSavingsNeeded / 9} stroke="#6b8e5a" strokeDasharray="3 3" label="Avg Monthly Tax" />
              <Area 
                type="monotone" 
                dataKey="projectedTax" 
                stroke="#0a6a48" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#taxGradient)" 
                name="Projected Tax"
              />
              <Area 
                type="monotone" 
                dataKey="savingsTarget" 
                stroke="#6b8e5a" 
                strokeWidth={2}
                strokeDasharray="5 5"
                fillOpacity={1} 
                fill="url(#savingsGradient)" 
                name="Monthly Savings Target"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-6 p-4 bg-primary-container/10 rounded-2xl">
          <div className="flex items-start gap-3">
            <Lightbulb className="text-primary shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-semibold text-primary mb-1">💡 Savings Recommendation</p>
              <p className="text-sm text-on-surface-variant">
                Based on your projections, you should save <strong className="text-on-surface">₦{(predictionData[0]?.savingsTarget / 1000000).toFixed(2)}M per month</strong> to comfortably cover your tax obligations. 
                Consider setting up an automatic transfer to a dedicated tax savings account.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Optimization Opportunities */}
      <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-taxfyp border border-outline-variant/15">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-on-surface">Tax Optimization Opportunities</h2>
            <p className="text-sm text-on-surface-variant">Actionable ways to reduce your tax burden</p>
          </div>
          <button 
            onClick={() => setShowOptimization(!showOptimization)}
            className="text-primary font-semibold text-sm flex items-center gap-1"
          >
            {showOptimization ? 'Hide Details' : 'View All'}
            <ArrowRight size={16} className={`transition-transform ${showOptimization ? 'rotate-90' : ''}`} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {opportunities.slice(0, showOptimization ? undefined : 3).map((opp) => (
            <div key={opp.id} className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/10 hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                  opp.category === 'timing' ? 'bg-primary/10 text-primary' :
                  opp.category === 'deduction' ? 'bg-tertiary/10 text-tertiary' :
                  'bg-error/10 text-error'
                }`}>
                  {opp.category.toUpperCase()}
                </span>
                <span className="text-xs text-on-surface-variant flex items-center gap-1">
                  <Calendar size={12} />
                  Due {opp.deadline}
                </span>
              </div>
              <h4 className="font-bold text-on-surface mb-2">{opp.title}</h4>
              <p className="text-sm text-on-surface-variant mb-4">{opp.description}</p>
              <div className="flex justify-between items-center pt-3 border-t border-outline-variant/10">
                <span className="text-lg font-bold text-tertiary">₦{(opp.potentialSavings / 1000000).toFixed(2)}M saved</span>
                <button className="text-primary text-sm font-semibold hover:underline">
                  Learn More
                </button>
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
                ₦{(opportunities.reduce((sum, opp) => sum + opp.potentialSavings, 0) / 1000000).toFixed(2)}M
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
