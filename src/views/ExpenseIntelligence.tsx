import React from 'react';
import { UploadCloud, CheckCircle2, AlertTriangle, MoreHorizontal, BrainCircuit } from 'lucide-react';

export default function ExpenseIntelligence() {
  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-on-surface tracking-tight mb-2">Smart Expenses</h1>
        <p className="text-on-surface-variant text-lg">AI-driven categorization and reconciliation for audit-proof records.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-sovereign border border-outline-variant/15">
          <div className="text-sm text-on-surface-variant font-medium mb-1">Total Spent This Month</div>
          <div className="text-3xl font-extrabold text-on-surface">₦4.2M</div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-sovereign border border-outline-variant/15">
          <div className="text-sm text-on-surface-variant font-medium mb-1">Auto-Categorized</div>
          <div className="text-3xl font-extrabold text-primary">94%</div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-sovereign border border-outline-variant/15">
          <div className="text-sm text-on-surface-variant font-medium mb-1">Needs Your Review</div>
          <div className="text-3xl font-extrabold text-error">12</div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-sovereign border border-outline-variant/15 flex items-center justify-center">
          <button className="premium-gradient text-white w-full py-3 rounded-xl font-semibold shadow-md flex items-center justify-center gap-2">
            <UploadCloud size={20} /> Upload Receipts
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Table Area */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-3xl shadow-sovereign border border-outline-variant/15 overflow-hidden">
          <div className="p-6 border-b border-outline-variant/15 flex justify-between items-center bg-surface-container-lowest">
            <h2 className="text-xl font-bold text-on-surface">Recent Transactions</h2>
            <div className="flex gap-2">
              <button className="text-sm font-semibold text-primary bg-primary/10 px-4 py-1.5 rounded-lg">All</button>
              <button className="text-sm font-semibold text-on-surface-variant hover:bg-surface-container-low px-4 py-1.5 rounded-lg">Needs Review</button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant text-sm">
                  <th className="p-4 font-semibold">Date</th>
                  <th className="p-4 font-semibold">Description</th>
                  <th className="p-4 font-semibold">Amount</th>
                  <th className="p-4 font-semibold">AI Category</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                <tr className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="p-4 text-sm">Mar 21, 2026</td>
                  <td className="p-4 font-medium">MTN Nigeria - Internet</td>
                  <td className="p-4 font-bold">₦45,000</td>
                  <td className="p-4">
                    <span className="bg-surface-container-high px-3 py-1 rounded-md text-xs font-semibold">Office Expenses</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1 text-primary text-sm font-medium">
                      <CheckCircle2 size={16} /> Auto-Verified
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button className="p-1 text-outline hover:text-on-surface"><MoreHorizontal size={18} /></button>
                  </td>
                </tr>
                <tr className="hover:bg-surface-container-low/50 transition-colors bg-error/5">
                  <td className="p-4 text-sm">Mar 19, 2026</td>
                  <td className="p-4 font-medium">Unknown Vendor - POS</td>
                  <td className="p-4 font-bold">₦120,000</td>
                  <td className="p-4">
                    <span className="bg-surface-container-high px-3 py-1 rounded-md text-xs font-semibold text-outline">Uncategorized</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1 text-error text-sm font-medium">
                      <AlertTriangle size={16} /> Needs Review
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button className="bg-surface-container-lowest border border-outline-variant/30 px-3 py-1 rounded-lg text-xs font-bold hover:bg-surface-container-high">Review</button>
                  </td>
                </tr>
                <tr className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="p-4 text-sm">Mar 15, 2026</td>
                  <td className="p-4 font-medium">Lagos State Water Corp</td>
                  <td className="p-4 font-bold">₦15,500</td>
                  <td className="p-4">
                    <span className="bg-surface-container-high px-3 py-1 rounded-md text-xs font-semibold">Utilities</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1 text-primary text-sm font-medium">
                      <CheckCircle2 size={16} /> Auto-Verified
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button className="p-1 text-outline hover:text-on-surface"><MoreHorizontal size={18} /></button>
                  </td>
                </tr>
                <tr className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="p-4 text-sm">Mar 12, 2026</td>
                  <td className="p-4 font-medium">HP Store - Laptops</td>
                  <td className="p-4 font-bold">₦1,250,000</td>
                  <td className="p-4">
                    <span className="bg-surface-container-high px-3 py-1 rounded-md text-xs font-semibold">Asset Purchase</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1 text-tertiary text-sm font-medium">
                      <BrainCircuit size={16} /> High Confidence
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button className="p-1 text-outline hover:text-on-surface"><MoreHorizontal size={18} /></button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          <div className="bg-primary-container/10 border border-primary/20 p-6 rounded-3xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/20 rounded-lg text-primary">
                <BrainCircuit size={24} />
              </div>
              <h3 className="font-bold text-primary text-lg">Smart Matching</h3>
            </div>
            <p className="text-sm text-on-surface-variant mb-6">Our engine has matched 145 bank transactions to uploaded receipts with 98% confidence.</p>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm font-semibold mb-1">
                  <span>Matched</span>
                  <span className="text-primary">145</span>
                </div>
                <div className="w-full bg-surface-container-high rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm font-semibold mb-1">
                  <span>Missing Receipts</span>
                  <span className="text-error">12</span>
                </div>
                <div className="w-full bg-surface-container-high rounded-full h-2">
                  <div className="bg-error h-2 rounded-full" style={{ width: '10%' }}></div>
                </div>
              </div>
            </div>

            <button className="w-full mt-6 bg-surface-container-lowest text-primary py-2.5 rounded-xl font-semibold hover:bg-surface-container-high transition-colors shadow-sm">
              Scan Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
