import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, Tooltip, BarChart, Bar, YAxis } from 'recharts';
import { Wallet, PiggyBank, CalendarDays, ArrowRight, AlertTriangle, CheckCircle2 } from 'lucide-react';

const lineData = [
  { name: 'JAN', actual: 130, baseline: 150 },
  { name: 'FEB', actual: 110, baseline: 160 },
  { name: 'MAR', actual: 90, baseline: 130 },
  { name: 'APR', actual: 70, baseline: 140 },
  { name: 'MAY', actual: 85, baseline: 150 },
  { name: 'JUN', actual: 60, baseline: 110 },
  { name: 'JUL', actual: 45, baseline: 120 },
  { name: 'AUG', actual: 55, baseline: 130 },
  { name: 'SEP', actual: 30, baseline: 100 },
  { name: 'OCT', actual: 40, baseline: 110 },
  { name: 'NOV', actual: 35, baseline: 105 },
  { name: 'DEC', actual: 25, baseline: 90 },
];

const barData = [
  { name: 'Company Tax', value: 45 },
  { name: 'VAT', value: 30 },
  { name: 'Employee Tax', value: 15 },
  { name: 'Levy', value: 10 },
];

export default function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold text-on-surface tracking-tight mb-2">Your Tax Overview</h1>
          <p className="text-on-surface-variant text-lg">Your taxes are looking good. No immediate actions required.</p>
        </div>
        <button className="bg-surface-container-lowest border border-outline-variant/30 text-primary px-6 py-3 rounded-xl font-semibold hover:bg-surface-container-low transition-colors flex items-center gap-2 shadow-sm">
          Generate Report <ArrowRight size={18} />
        </button>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-sovereign border border-outline-variant/15 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10"></div>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-primary-container/10 rounded-xl text-primary">
              <Wallet size={24} />
            </div>
            <h3 className="text-on-surface-variant font-semibold">Total Tax Owed</h3>
          </div>
          <div className="text-4xl font-extrabold text-on-surface mb-2">₦14.2M</div>
          <div className="text-sm text-primary font-medium flex items-center gap-1">
            <span>↓ 12% vs expected</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-sovereign border border-outline-variant/15 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-tertiary/5 rounded-bl-full -z-10"></div>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-tertiary-container/10 rounded-xl text-tertiary">
              <PiggyBank size={24} />
            </div>
            <h3 className="text-on-surface-variant font-semibold">Money Saved</h3>
          </div>
          <div className="text-4xl font-extrabold text-on-surface mb-2">₦2.8M</div>
          <div className="text-sm text-tertiary font-medium">Through smart deductions</div>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-sovereign border border-outline-variant/15 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-error/5 rounded-bl-full -z-10"></div>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-error-container/30 rounded-xl text-error">
              <CalendarDays size={24} />
            </div>
            <h3 className="text-on-surface-variant font-semibold">Next Deadline</h3>
          </div>
          <div className="text-4xl font-extrabold text-on-surface mb-2">3 Days</div>
          <div className="text-sm text-error font-medium">VAT Remittance (Mar 25)</div>
        </div>
      </div>

      {/* Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface-container-lowest p-8 rounded-3xl shadow-sovereign border border-outline-variant/15">
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

        <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-sovereign border border-outline-variant/15">
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
            <h3 className="font-bold text-on-surface">FIRS Connection</h3>
            <CheckCircle2 size={20} className="text-tertiary" />
          </div>
          <div className="text-3xl font-extrabold mb-1">100%</div>
          <p className="text-sm text-on-surface-variant">Tax portal connection stable.</p>
        </div>
      </div>
    </div>
  );
}
