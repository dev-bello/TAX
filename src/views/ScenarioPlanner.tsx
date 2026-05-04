import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { SlidersHorizontal, TrendingUp, Lightbulb, AlertTriangle as AlertIcon, CheckCircle2, X, ChevronRight } from 'lucide-react';
import HelpTooltip from '../components/HelpTooltip';
import { useToast } from '../components/Toast';

export default function ScenarioPlanner() {
  const { addToast } = useToast();
  const [capex, setCapex] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [isPioneer, setIsPioneer] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const scenarioAnalysis = useMemo(() => {
    const profitMargin = 0.40;
    const grossProfit = revenue * profitMargin;
    const capitalAllowance = capex * 0.25;
    const taxableProfit = Math.max(0, grossProfit - capitalAllowance);

    let citRate = 0;
    if (!isPioneer) {
      if (revenue > 100) citRate = 0.30;
      else if (revenue >= 25) citRate = 0.20;
    }

    const citLiability = taxableProfit * citRate;
    const tetFundRate = (revenue >= 25 && !isPioneer) ? 0.02 : 0;
    const tetFundLiability = taxableProfit * tetFundRate;
    const totalLiability = citLiability + tetFundLiability;

    return {
      grossProfit,
      capitalAllowance,
      taxableProfit,
      citRate,
      citLiability,
      tetFundLiability,
      totalLiability,
      effectiveRate: revenue > 0 ? (totalLiability / revenue) * 100 : 0,
    };
  }, [revenue, capex, isPioneer]);

  const scenarioData = [
    { name: 'Current', liability: 0 },
    { name: 'Scenario', liability: Number(scenarioAnalysis.totalLiability.toFixed(2)) },
  ];

  let insightTitle = "Strategic Insight";
  let insightText = "";

  if (isPioneer) {
    insightTitle = "Pioneer Status Advantage";
    insightText = "A tax holiday grants a 100% exemption on Company Tax and Education Tax for the designated period, maximizing your reinvestment potential.";
  } else if (capex > 100) {
    insightTitle = "Aggressive Capital Shielding";
    insightText = `By investing ₦${capex}M in Asset Purchases, you generate ₦${scenarioAnalysis.capitalAllowance.toFixed(1)}M in capital allowances, significantly shielding your ₦${scenarioAnalysis.grossProfit.toFixed(1)}M gross profit from the ${scenarioAnalysis.citRate * 100}% Company Tax rate.`;
  } else if (revenue > 100 && capex < 30) {
    insightTitle = "High Tax Exposure";
    insightText = "Your revenue pushes you into the 30% Company Tax bracket, but low asset purchases leaves your profits exposed. Consider accelerating planned asset purchases to generate capital allowances.";
  } else {
    insightTitle = "Balanced Growth";
    insightText = `Your current model yields a taxable profit of ₦${scenarioAnalysis.taxableProfit.toFixed(1)}M. Capital allowances are offsetting ₦${scenarioAnalysis.capitalAllowance.toFixed(1)}M of potential taxable income.`;
  }

  const handleViewBreakdown = () => {
    setShowBreakdown(true);
  };

  const handleSaveScenario = () => {
    localStorage.setItem('taxfyp-scenario', JSON.stringify({ capex, revenue, isPioneer, result: scenarioAnalysis }));
    addToast('Scenario saved successfully!', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-on-surface tracking-tight mb-2">Plan Ahead</h1>
        <p className="text-on-surface-variant text-lg">Model the tax implications of your strategic business decisions using the 2025/26 Nigeria Tax Act.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Adjustment Levers */}
        <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-taxfyp border border-outline-variant/15">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-primary-container/10 rounded-lg text-primary">
              <SlidersHorizontal size={24} />
            </div>
            <h2 className="text-2xl font-bold text-on-surface">Adjust Your Numbers</h2>
          </div>

          <div className="mb-6 p-4 bg-primary-container/10 rounded-2xl border border-primary/20">
            <p className="text-sm text-on-surface-variant">
              <strong className="text-primary">Plan your taxes strategically!</strong> Use this tool to see how buying equipment or changing your revenue affects your tax bill. Adjust the sliders below to explore different scenarios.
            </p>
          </div>

          <div className="space-y-8">
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="font-semibold text-on-surface flex items-center gap-2">
                  <HelpTooltip term="Capital Expenditure" explanation="Money you spend on long-lasting business assets like computers, machinery, vehicles, or office equipment. Unlike daily expenses (like food), these items last multiple years and can reduce your taxes through depreciation." />
                  <span className="text-xl font-bold text-primary">₦{capex}M</span>
                </label>
              </div>
              <input type="range" min="0" max="200" value={capex} onChange={(e) => setCapex(Number(e.target.value))} className="w-full" />
              <div className="flex justify-between text-xs text-outline mt-2">
                <span>₦0</span>
                <span>₦200M</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="font-semibold text-on-surface flex items-center gap-2">
                  <HelpTooltip term="Revenue" explanation="All the money your business earns from sales or services before any expenses are deducted. This is your total 'Money In' for the year. Your revenue determines your company size classification and tax rate." />
                  <span className="text-xl font-bold text-primary">₦{revenue}M</span>
                </label>
              </div>
              <input type="range" min="10" max="500" value={revenue} onChange={(e) => setRevenue(Number(e.target.value))} className="w-full" />
              <div className="flex justify-between text-xs text-outline mt-2">
                <span>₦10M</span>
                <span>₦500M</span>
              </div>
            </div>

            <div>
              <label className="font-semibold text-on-surface block mb-4 flex items-center gap-2">
                <HelpTooltip term="Tax Holiday" explanation="A special government incentive where certain businesses (especially in tech, agriculture, or manufacturing) pay 0% company tax for 3-5 years. This encourages investment in key sectors. Check if your business qualifies for Pioneer Status!" />
              </label>
              <div className="flex bg-surface-container-low p-1.5 rounded-xl">
                <button onClick={() => setIsPioneer(true)}
                  className={`flex-1 py-2 rounded-lg font-semibold transition-all ${isPioneer ? 'bg-surface-container-lowest shadow-sm text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`}>
                  Eligible
                </button>
                <button onClick={() => setIsPioneer(false)}
                  className={`flex-1 py-2 rounded-lg font-semibold transition-all ${!isPioneer ? 'bg-surface-container-lowest shadow-sm text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`}>
                  Not Eligible
                </button>
              </div>
            </div>

            {/* Dynamic Alerts */}
            {revenue > 100 && !isPioneer && (
              <div className="bg-error-container/30 border border-error/20 p-4 rounded-2xl flex gap-4 items-start">
                <AlertIcon className="text-error shrink-0 mt-0.5" size={20} />
                <div>
                  <h4 className="font-bold text-error mb-1">Large Company Bracket</h4>
                  <p className="text-sm text-on-error-container">Revenue exceeds ₦100M. You are subject to the full 30% Company Tax rate and 2% Education Tax.</p>
                </div>
              </div>
            )}
            {revenue >= 25 && revenue <= 100 && !isPioneer && (
              <div className="bg-primary-container/30 border border-primary/20 p-4 rounded-2xl flex gap-4 items-start">
                <CheckCircle2 className="text-primary shrink-0 mt-0.5" size={20} />
                <div>
                  <h4 className="font-bold text-primary mb-1">Medium Company Bracket</h4>
                  <p className="text-sm text-on-primary-container">Revenue is between ₦25M and ₦100M. You qualify for the reduced 20% Company Tax rate.</p>
                </div>
              </div>
            )}
            {revenue < 25 && !isPioneer && (
              <div className="bg-tertiary-container/30 border border-tertiary/20 p-4 rounded-2xl flex gap-4 items-start">
                <CheckCircle2 className="text-tertiary shrink-0 mt-0.5" size={20} />
                <div>
                  <h4 className="font-bold text-tertiary mb-1">Small Company Exemption</h4>
                  <p className="text-sm text-on-tertiary-container">Revenue is below ₦25M. You are fully exempt from Company Tax and Education Tax.</p>
                </div>
              </div>
            )}
            {isPioneer && (
              <div className="bg-tertiary-container/30 border border-tertiary/20 p-4 rounded-2xl flex gap-4 items-start">
                <CheckCircle2 className="text-tertiary shrink-0 mt-0.5" size={20} />
                <div>
                  <h4 className="font-bold text-tertiary mb-1">Tax Holiday Active</h4>
                  <p className="text-sm text-on-tertiary-container">You are currently enjoying a tax holiday. 0% Company Tax applied.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Impact Analysis */}
        <div className="space-y-6">
          <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-taxfyp border border-outline-variant/15">
            <h2 className="text-2xl font-bold text-on-surface mb-6">How This Affects Your Taxes</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-surface-container-low p-4 rounded-2xl">
                <div className="text-sm text-on-surface-variant mb-1">Current Tax Owed</div>
                <div className="text-2xl font-extrabold text-on-surface">₦0.0M</div>
              </div>
              <div className="premium-gradient p-4 rounded-2xl text-white shadow-md">
                <div className="text-sm text-white/80 mb-1">New Tax Owed</div>
                <div className="text-2xl font-extrabold">₦{scenarioAnalysis.totalLiability.toFixed(1)}M</div>
              </div>
            </div>

            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scenarioData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 14, fill: '#191c1a', fontWeight: 600}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6e7a70'}} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="liability" fill="#0a6a48" radius={[8, 8, 0, 0]} barSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-6 pt-6 border-t border-outline-variant/15 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-on-surface-variant block mb-1">
                  <HelpTooltip term="Effective Tax Rate" explanation="The actual percentage of your profit that you pay in tax after all deductions and exemptions. This is often lower than the official tax rate because of allowable deductions and capital allowances." />
                </span>
                <span className="font-bold text-on-surface">{scenarioAnalysis.citRate * 100}%</span>
              </div>
              <div>
                <span className="text-on-surface-variant block mb-1">
                  <HelpTooltip term="TETFund" explanation="Tertiary Education Trust Fund - a 2% tax that medium and large companies pay to support universities and colleges in Nigeria. Small companies (under ₦25M revenue) are exempt from this tax." />
                </span>
                <span className="font-bold text-on-surface">₦{scenarioAnalysis.tetFundLiability.toFixed(2)}M</span>
              </div>
            </div>
          </div>

          <div className="bg-tertiary-container/10 border border-tertiary/20 p-6 rounded-3xl flex gap-4 items-start">
            <div className="p-2 bg-tertiary/10 rounded-lg text-tertiary shrink-0">
              <Lightbulb size={24} />
            </div>
            <div>
              <h3 className="font-bold text-tertiary mb-2">{insightTitle}</h3>
              <p className="text-sm text-on-surface-variant mb-4">{insightText}</p>
              <div className="flex gap-3">
                <button onClick={handleViewBreakdown} className="text-tertiary font-bold text-sm flex items-center gap-1 hover:underline">
                  View detailed breakdown <TrendingUp size={16} />
                </button>
                <button onClick={handleSaveScenario} className="text-primary font-bold text-sm flex items-center gap-1 hover:underline">
                  Save scenario <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown Modal */}
      {showBreakdown && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowBreakdown(false)}>
          <div className="bg-surface-container-lowest rounded-3xl shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-on-surface">Detailed Tax Breakdown</h3>
              <button onClick={() => setShowBreakdown(false)} className="p-1 rounded-lg hover:bg-surface-container-low text-outline">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-surface-container-low rounded-xl">
                <span className="text-sm text-on-surface-variant">Revenue</span>
                <span className="font-bold text-on-surface">₦{revenue}M</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-surface-container-low rounded-xl">
                <span className="text-sm text-on-surface-variant">Gross Profit (40% margin)</span>
                <span className="font-bold text-on-surface">₦{scenarioAnalysis.grossProfit.toFixed(1)}M</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-surface-container-low rounded-xl">
                <span className="text-sm text-on-surface-variant">Capital Allowance (25% of ₦{capex}M)</span>
                <span className="font-bold text-tertiary">-₦{scenarioAnalysis.capitalAllowance.toFixed(1)}M</span>
              </div>
              <div className="h-px bg-outline-variant/20"></div>
              <div className="flex justify-between items-center p-3 bg-primary-container/10 rounded-xl border border-primary/20">
                <span className="text-sm font-semibold text-primary">Taxable Profit</span>
                <span className="font-bold text-primary">₦{scenarioAnalysis.taxableProfit.toFixed(1)}M</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-surface-container-low rounded-xl">
                <span className="text-sm text-on-surface-variant">Company Income Tax ({scenarioAnalysis.citRate * 100}%)</span>
                <span className="font-bold text-on-surface">₦{scenarioAnalysis.citLiability.toFixed(2)}M</span>
              </div>
              {scenarioAnalysis.tetFundLiability > 0 && (
                <div className="flex justify-between items-center p-3 bg-surface-container-low rounded-xl">
                  <span className="text-sm text-on-surface-variant">TETFund (2%)</span>
                  <span className="font-bold text-on-surface">₦{scenarioAnalysis.tetFundLiability.toFixed(2)}M</span>
                </div>
              )}
              <div className="h-px bg-outline-variant/20"></div>
              <div className="flex justify-between items-center p-4 premium-gradient rounded-xl text-white">
                <span className="font-semibold">Total Tax Liability</span>
                <span className="text-2xl font-extrabold">₦{scenarioAnalysis.totalLiability.toFixed(2)}M</span>
              </div>
              <div className="flex justify-between items-center p-3">
                <span className="text-sm text-on-surface-variant">Effective Tax Rate</span>
                <span className="font-bold text-tertiary">{scenarioAnalysis.effectiveRate.toFixed(2)}%</span>
              </div>
            </div>

            <button onClick={() => setShowBreakdown(false)} className="w-full mt-6 py-3 rounded-xl font-semibold bg-surface-container-low text-on-surface hover:bg-surface-container-high transition-colors">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
