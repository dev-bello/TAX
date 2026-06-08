import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, MonitorSmartphone, Tractor, ShoppingCart, Cross, MoreHorizontal, ShieldCheck, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { useToast } from '../components/Toast';
import { useAuth } from '../contexts/AuthContext';
import { useBusinessProfile } from '../hooks/useBusinessProfile';

export default function BusinessIdentity() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user } = useAuth();
  const { setProfile } = useBusinessProfile(user?.id);
  const [turnover, setTurnover] = useState('50000000');
  const [selectedSector, setSelectedSector] = useState('tech');
  const [isProfessional, setIsProfessional] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const sectors = [
    { id: 'manufacturing', label: 'Manufacturing', icon: Package },
    { id: 'tech', label: 'Technology', icon: MonitorSmartphone },
    { id: 'agric', label: 'Agriculture', icon: Tractor },
    { id: 'retail', label: 'Retail/Trade', icon: ShoppingCart },
    { id: 'health', label: 'Healthcare', icon: Cross },
    { id: 'other', label: 'Other', icon: MoreHorizontal },
  ];

  const formatNumber = (value: string): string => {
    const num = value.replace(/[^\d]/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const parseNumber = (value: string): number => {
    return parseInt(value.replace(/[^\d]/g, ''), 10) || 0;
  };

  const numTurnover = parseNumber(turnover);
  
  const classification = numTurnover < 25000000 ? 'Small Company' : numTurnover <= 100000000 ? 'Medium Company' : 'Large Company';
  const taxRate = numTurnover < 25000000 ? 0 : numTurnover <= 100000000 ? 20 : 30;
  
  const handleTurnoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatNumber(e.target.value);
    setTurnover(formatted);
    setSaved(false);
  };

  const handleContinue = () => {
    if (numTurnover === 0) {
      addToast('Please enter your estimated yearly revenue', 'error');
      return;
    }
    
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      addToast('Business profile saved successfully!', 'success');
      // Store profile via hook
      setProfile({
        annualTurnover: numTurnover,
        sector: selectedSector,
        isProfessional,
        classification,
        taxRate,
      } as any);
      // Reload to refresh global state
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    }, 1500);
  };

  const handleBack = () => {
    addToast('Previous step not available in this demo', 'info');
  };

  const sectorLabel = sectors.find(s => s.id === selectedSector)?.label || 'Technology';

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold text-on-surface tracking-tight mb-4">Business Profile</h1>
        <p className="text-on-surface-variant text-lg">This helps us tailor your tax obligations and identify applicable incentives.</p>
        
        <div className="flex justify-center items-center gap-2 mt-8">
          <div className="w-12 h-2 bg-primary rounded-full"></div>
          <div className="w-12 h-2 bg-primary rounded-full"></div>
          <div className={`w-12 h-2 rounded-full transition-colors ${saved ? 'bg-primary' : 'bg-surface-container-high'}`}></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-10">
          <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-taxfyp border border-outline-variant/15">
            <label className="block text-lg font-bold text-on-surface mb-4">Estimated Yearly Revenue (₦)</label>
            <div className="relative">
              <span className="absolute left-0 top-1/2 -translate-y-1/2 text-2xl font-bold text-outline">₦</span>
              <input 
                type="text" 
                value={turnover}
                onChange={handleTurnoverChange}
                className="w-full bg-transparent border-0 border-b-2 border-outline-variant focus:border-primary focus:ring-0 pl-10 py-3 text-4xl font-extrabold text-on-surface transition-colors"
              />
            </div>
            <p className="text-sm text-on-surface-variant mt-3">Determines your company size classification (Small, Medium, or Large) for Company Tax rates.</p>
          </div>

          <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-taxfyp border border-outline-variant/15">
            <label className="block text-lg font-bold text-on-surface mb-6">What does your business do?</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {sectors.map(sector => {
                const Icon = sector.icon;
                const isSelected = selectedSector === sector.id;
                return (
                  <button
                    key={sector.id}
                    onClick={() => { setSelectedSector(sector.id); setSaved(false); }}
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

          <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-taxfyp border border-outline-variant/15 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-on-surface mb-1">Do you provide professional services?</h3>
              <p className="text-sm text-on-surface-variant">Are you providing consulting, legal, or management services?</p>
            </div>
            <button 
              onClick={() => { setIsProfessional(!isProfessional); setSaved(false); }}
              className={`w-14 h-8 rounded-full p-1 transition-colors ${isProfessional ? 'bg-primary' : 'bg-outline-variant'}`}
            >
              <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${isProfessional ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </button>
          </div>

          <div className="flex justify-between pt-4">
            <button onClick={handleBack} className="px-8 py-3 rounded-xl font-semibold text-on-surface-variant hover:bg-surface-container-low transition-colors">
              Back
            </button>
            <button onClick={handleContinue} disabled={isSaving || saved}
              className="premium-gradient text-white px-10 py-3 rounded-xl font-semibold shadow-taxfyp hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50">
              {isSaving ? <Loader2 size={20} className="animate-spin" /> : saved ? <CheckCircle2 size={20} /> : <ArrowRight size={20} />}
              {isSaving ? 'Saving...' : saved ? 'Saved!' : 'Continue'}
            </button>
          </div>
        </div>

        {/* Right Sidebar - Live Status */}
        <div className="w-full">
          <div className="sticky top-28 premium-gradient rounded-3xl p-8 text-white shadow-taxfyp relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-bl-full -z-0"></div>
            
            <div className="flex items-center gap-3 mb-8 relative z-10">
              <ShieldCheck size={28} className="text-primary-fixed" />
              <h3 className="text-xl font-bold">Your Tax Profile</h3>
            </div>

            <div className="space-y-6 relative z-10">
              <div>
                <div className="text-white/70 text-sm mb-1">Classification</div>
                <div className="text-2xl font-bold text-primary-fixed">{classification}</div>
                <div className="text-xs text-white/60 mt-1">Based on ₦{(numTurnover / 1000000).toFixed(0)}M turnover</div>
              </div>

              <div className="h-px w-full bg-white/20"></div>

              <div>
                <div className="text-white/70 text-sm mb-1">Your Company Tax Rate</div>
                <div className="text-3xl font-extrabold">{taxRate}%</div>
              </div>

              <div className="h-px w-full bg-white/20"></div>

              <div>
                <div className="text-white/70 text-sm mb-2">Sector</div>
                <div className="text-lg font-semibold">{sectorLabel}</div>
              </div>

              <div className="h-px w-full bg-white/20"></div>

              <div>
                <div className="text-white/70 text-sm mb-2">Possible Tax Breaks</div>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-fixed mt-1.5 shrink-0"></div>
                    <span>{selectedSector === 'tech' || selectedSector === 'agric' || selectedSector === 'manufacturing' ? 'Tax Holiday Eligible' : 'Standard Rate Applies'}</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-fixed mt-1.5 shrink-0"></div>
                    <span>Withholding Tax (WHT) Exemption</span>
                  </li>
                  {isProfessional && (
                    <li className="flex items-start gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-fixed mt-1.5 shrink-0"></div>
                      <span>Professional Services Allowance</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
