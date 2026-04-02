import React, { useState } from 'react';
import { Calculator, HelpCircle } from 'lucide-react';

export default function ComputationEngine() {
  const [activeTab, setActiveTab] = useState('Company Tax (CIT)');

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-on-surface tracking-tight mb-2">Tax Calculator</h1>
        <p className="text-on-surface-variant text-lg">Precise tax calculation based on current Nigerian tax law.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Form Area */}
        <div className="flex-1">
          {/* Tabs */}
          <div className="flex gap-2 mb-8 bg-surface-container-low p-1.5 rounded-2xl inline-flex">
            {['Company Tax (CIT)', 'Employee Tax (PAYE)', 'Value Added Tax (VAT)', 'Development Levy'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-xl font-semibold transition-all ${
                  activeTab === tab 
                    ? 'bg-surface-container-lowest text-on-surface shadow-sm' 
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-sovereign border border-outline-variant/15">
            <h2 className="text-2xl font-bold mb-8">Company Tax (CIT)</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              <div className="relative group">
                <label className="block text-sm font-semibold text-on-surface-variant mb-2">Taxable Income (₦)</label>
                <div className="relative">
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 text-xl font-bold text-outline">₦</span>
                  <input 
                    type="text" 
                    defaultValue="45,000,000" 
                    className="w-full bg-transparent border-0 border-b-2 border-outline-variant focus:border-primary focus:ring-0 pl-8 py-2 text-2xl font-bold text-on-surface transition-colors"
                  />
                </div>
              </div>

              <div className="relative group">
                <label className="block text-sm font-semibold text-on-surface-variant mb-2">Deductible Expenses (₦)</label>
                <div className="relative">
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 text-xl font-bold text-outline">₦</span>
                  <input 
                    type="text" 
                    defaultValue="12,500,000" 
                    className="w-full bg-transparent border-0 border-b-2 border-outline-variant focus:border-primary focus:ring-0 pl-8 py-2 text-2xl font-bold text-on-surface transition-colors"
                  />
                </div>
              </div>

              <div className="relative group">
                <label className="block text-sm font-semibold text-on-surface-variant mb-2">Asset Depreciation (₦)</label>
                <div className="relative">
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 text-xl font-bold text-outline">₦</span>
                  <input 
                    type="text" 
                    defaultValue="5,000,000" 
                    className="w-full bg-transparent border-0 border-b-2 border-outline-variant focus:border-primary focus:ring-0 pl-8 py-2 text-2xl font-bold text-on-surface transition-colors"
                  />
                </div>
              </div>

              <div className="relative group">
                <label className="block text-sm font-semibold text-on-surface-variant mb-2 flex items-center gap-2">
                  Tax Rate (%) <HelpCircle size={14} className="text-outline cursor-pointer" />
                </label>
                <div className="relative">
                  <input 
                    type="text" 
                    defaultValue="30" 
                    className="w-full bg-transparent border-0 border-b-2 border-outline-variant focus:border-primary focus:ring-0 py-2 text-2xl font-bold text-on-surface transition-colors"
                  />
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 text-xl font-bold text-outline">%</span>
                </div>
              </div>
            </div>

            <div className="mt-12 flex justify-end">
              <button className="bg-surface-container-low text-on-surface px-6 py-3 rounded-xl font-semibold hover:bg-surface-container-high transition-colors mr-4">
                Clear
              </button>
              <button className="premium-gradient text-white px-8 py-3 rounded-xl font-semibold shadow-sovereign hover:opacity-90 transition-opacity flex items-center gap-2">
                <Calculator size={20} /> Calculate Tax
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Sticky */}
        <div className="w-full lg:w-96">
          <div className="sticky top-28">
            <div className="premium-gradient rounded-3xl p-8 text-white shadow-sovereign relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-bl-full -z-0"></div>
              <h3 className="text-white/80 font-semibold mb-2 relative z-10">Estimated Tax Owed</h3>
              <div className="text-5xl font-extrabold mb-8 relative z-10">₦8.25M</div>
              
              <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-center border-b border-white/20 pb-2">
                  <span className="text-white/80">Total Profit</span>
                  <span className="font-semibold">₦45.0M</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/20 pb-2">
                  <span className="text-white/80">Deductions</span>
                  <span className="font-semibold">-₦17.5M</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/20 pb-2">
                  <span className="text-white/80">Taxable Profit</span>
                  <span className="font-semibold">₦27.5M</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-white/80">Effective Rate</span>
                  <span className="font-semibold">30%</span>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-surface-container-low p-6 rounded-3xl border border-outline-variant/20">
              <h4 className="font-bold text-on-surface mb-2">Need a tailored scenario?</h4>
              <p className="text-sm text-on-surface-variant mb-4">Use the Scenario Planner to see how investments affect your taxes.</p>
              <button className="w-full bg-surface-container-lowest border border-outline-variant/30 text-on-surface py-2 rounded-xl font-semibold hover:bg-surface-container-high transition-colors">
                Open Planner
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
