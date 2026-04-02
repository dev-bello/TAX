import React, { useState } from 'react';
import { Package, MonitorSmartphone, Tractor, ShoppingCart, Cross, MoreHorizontal, ShieldCheck } from 'lucide-react';

export default function BusinessIdentity() {
  const [turnover, setTurnover] = useState('50000000');
  const [selectedSector, setSelectedSector] = useState('tech');
  const [isProfessional, setIsProfessional] = useState(true);

  const sectors = [
    { id: 'manufacturing', label: 'Manufacturing', icon: Package },
    { id: 'tech', label: 'Technology', icon: MonitorSmartphone },
    { id: 'agric', label: 'Agriculture', icon: Tractor },
    { id: 'retail', label: 'Retail/Trade', icon: ShoppingCart },
    { id: 'health', label: 'Healthcare', icon: Cross },
    { id: 'other', label: 'Other', icon: MoreHorizontal },
  ];

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold text-on-surface tracking-tight mb-4">Business Profile</h1>
        <p className="text-on-surface-variant text-lg">This helps us tailor your tax obligations and identify applicable incentives.</p>
        
        <div className="flex justify-center items-center gap-2 mt-8">
          <div className="w-12 h-2 bg-primary rounded-full"></div>
          <div className="w-12 h-2 bg-primary rounded-full"></div>
          <div className="w-12 h-2 bg-surface-container-high rounded-full"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-10">
          <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-sovereign border border-outline-variant/15">
            <label className="block text-lg font-bold text-on-surface mb-4">Estimated Yearly Revenue (₦)</label>
            <div className="relative">
              <span className="absolute left-0 top-1/2 -translate-y-1/2 text-2xl font-bold text-outline">₦</span>
              <input 
                type="text" 
                value={turnover}
                onChange={(e) => setTurnover(e.target.value)}
                className="w-full bg-transparent border-0 border-b-2 border-outline-variant focus:border-primary focus:ring-0 pl-10 py-3 text-4xl font-extrabold text-on-surface transition-colors"
              />
            </div>
            <p className="text-sm text-on-surface-variant mt-3">Determines your company size classification (Small, Medium, or Large) for Company Tax rates.</p>
          </div>

          <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-sovereign border border-outline-variant/15">
            <label className="block text-lg font-bold text-on-surface mb-6">What does your business do?</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {sectors.map(sector => {
                const Icon = sector.icon;
                const isSelected = selectedSector === sector.id;
                return (
                  <button
                    key={sector.id}
                    onClick={() => setSelectedSector(sector.id)}
                    className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${
                      isSelected 
                        ? 'border-primary bg-primary/5 text-primary' 
                        : 'border-outline-variant/30 text-on-surface-variant hover:border-outline-variant hover:bg-surface-container-low'
                    }`}
                  >
                    <Icon size={28} />
                    <span className="font-semibold text-sm">{sector.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-sovereign border border-outline-variant/15 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-on-surface mb-1">Do you provide professional services?</h3>
              <p className="text-sm text-on-surface-variant">Are you providing consulting, legal, or management services?</p>
            </div>
            <button 
              onClick={() => setIsProfessional(!isProfessional)}
              className={`w-14 h-8 rounded-full p-1 transition-colors ${isProfessional ? 'bg-primary' : 'bg-outline-variant'}`}
            >
              <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${isProfessional ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </button>
          </div>

          <div className="flex justify-between pt-4">
            <button className="px-8 py-3 rounded-xl font-semibold text-on-surface-variant hover:bg-surface-container-low transition-colors">
              Back
            </button>
            <button className="premium-gradient text-white px-10 py-3 rounded-xl font-semibold shadow-sovereign hover:opacity-90 transition-opacity">
              Continue
            </button>
          </div>
        </div>

        {/* Right Sidebar - Live Status */}
        <div className="w-full">
          <div className="sticky top-28 premium-gradient rounded-3xl p-8 text-white shadow-sovereign relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-bl-full -z-0"></div>
            
            <div className="flex items-center gap-3 mb-8 relative z-10">
              <ShieldCheck size={28} className="text-primary-fixed" />
              <h3 className="text-xl font-bold">Your Tax Profile</h3>
            </div>

            <div className="space-y-6 relative z-10">
              <div>
                <div className="text-white/70 text-sm mb-1">Classification</div>
                <div className="text-2xl font-bold text-primary-fixed">Medium Company</div>
                <div className="text-xs text-white/60 mt-1">Based on ₦50M turnover</div>
              </div>

              <div className="h-px w-full bg-white/20"></div>

              <div>
                <div className="text-white/70 text-sm mb-1">Your Company Tax Rate</div>
                <div className="text-3xl font-extrabold">20%</div>
              </div>

              <div className="h-px w-full bg-white/20"></div>

              <div>
                <div className="text-white/70 text-sm mb-2">Possible Tax Breaks</div>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-fixed mt-1.5 shrink-0"></div>
                    <span>Tax Holiday Eligible (Tech)</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-fixed mt-1.5 shrink-0"></div>
                    <span>Withholding Tax (WHT) Exemption</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
