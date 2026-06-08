import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, Briefcase, Receipt, MapPin, Mail, Phone,
  Calendar, Users, TrendingUp, ShieldCheck, Edit2, CheckCircle2,
  Award, FileText, Clock, AlertCircle, ArrowLeft, Save, X,
  LogOut, Loader2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useBusinessProfile, getClassification, getTaxRate } from '../hooks/useBusinessProfile';
import { useToast } from '../components/Toast';
import { isValidCacFormat } from '../lib/cacValidation';

import type { BusinessType, TaxYear } from '../hooks/useBusinessProfile';

const BUSINESS_TYPE_LABELS: Record<BusinessType, string> = {
  sole_proprietorship: 'Sole Proprietorship',
  partnership: 'Partnership',
  limited_company: 'Limited Liability Company',
  plc: 'Public Limited Company',
  enterprise: 'Enterprise / SME',
};

const TAX_YEAR_LABELS: Record<TaxYear, string> = {
  calendar: 'Calendar Year (Jan - Dec)',
  fiscal_april: 'Fiscal Year (Apr - Mar)',
  fiscal_july: 'Fiscal Year (Jul - Jun)',
};

const SECTOR_LABELS: Record<string, string> = {
  manufacturing: 'Manufacturing',
  technology: 'Technology',
  agriculture: 'Agriculture',
  retail: 'Retail / Trade',
  healthcare: 'Healthcare',
  education: 'Education',
  construction: 'Construction',
  finance: 'Finance / Banking',
  logistics: 'Logistics / Transport',
  hospitality: 'Hospitality / Tourism',
  media: 'Media / Entertainment',
  other: 'Other',
};

const BUSINESS_TYPES: { value: BusinessType; label: string }[] = [
  { value: 'sole_proprietorship', label: 'Sole Proprietorship' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'limited_company', label: 'Limited Liability Company' },
  { value: 'plc', label: 'Public Limited Company' },
  { value: 'enterprise', label: 'Enterprise / SME' },
];

const TAX_YEARS: { value: TaxYear; label: string }[] = [
  { value: 'calendar', label: 'Calendar Year (Jan - Dec)' },
  { value: 'fiscal_april', label: 'Fiscal Year (Apr - Mar)' },
  { value: 'fiscal_july', label: 'Fiscal Year (Jul - Jun)' },
];

const SECTORS = [
  { id: 'manufacturing', label: 'Manufacturing' },
  { id: 'technology', label: 'Technology' },
  { id: 'agriculture', label: 'Agriculture' },
  { id: 'retail', label: 'Retail / Trade' },
  { id: 'healthcare', label: 'Healthcare' },
  { id: 'education', label: 'Education' },
  { id: 'construction', label: 'Construction' },
  { id: 'finance', label: 'Finance / Banking' },
  { id: 'logistics', label: 'Logistics / Transport' },
  { id: 'hospitality', label: 'Hospitality / Tourism' },
  { id: 'media', label: 'Media / Entertainment' },
  { id: 'other', label: 'Other' },
];

function formatCurrency(n: number): string {
  if (n >= 1_000_000_000) return `₦${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(0)}K`;
  return `₦${n.toFixed(0)}`;
}

function formatNumberInput(value: string): string {
  const num = value.replace(/[^\d]/g, '');
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function parseNumberInput(value: string): number {
  return parseInt(value.replace(/[^\d]/g, ''), 10) || 0;
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, updateProfile, clearProfile } = useBusinessProfile(user?.id);
  const { addToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const [editForm, setEditForm] = useState({
    businessName: profile?.businessName || '',
    businessType: profile?.businessType || 'limited_company',
    yearOfIncorporation: String(profile?.yearOfIncorporation || new Date().getFullYear()),
    cacNumber: profile?.cacNumber || '',
    tin: profile?.tin || '',
    sector: profile?.sector || 'technology',
    numberOfEmployees: String(profile?.numberOfEmployees || 1),
    annualTurnover: formatNumberInput(String(profile?.annualTurnover || 0)),
    isProfessional: profile?.isProfessional || false,
    vatRegistered: profile?.vatRegistered || false,
    vatNumber: profile?.vatNumber || '',
    taxYear: profile?.taxYear || 'calendar',
    businessAddress: profile?.businessAddress || '',
    email: profile?.email || '',
    phoneNumber: profile?.phoneNumber || '',
  });

  if (!profile) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-surface-container-high rounded-2xl flex items-center justify-center mb-4">
          <Building2 size={32} className="text-outline" />
        </div>
        <h2 className="text-xl font-bold text-on-surface mb-2">No Profile Found</h2>
        <p className="text-sm text-on-surface-variant mb-6 text-center max-w-sm">
          You haven't set up your business profile yet. Create one to get started.
        </p>
        <button
          onClick={() => navigate('/onboarding')}
          className="premium-gradient text-white px-6 py-3 rounded-xl font-semibold shadow-taxfyp hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <ShieldCheck size={18} /> Create Profile
        </button>
      </div>
    );
  }

  const vatStatus = profile.vatRegistered
    ? { label: 'Registered', color: 'text-primary bg-primary/10', icon: CheckCircle2 }
    : { label: 'Not Registered', color: 'text-on-surface-variant bg-surface-container-high', icon: AlertCircle };

  const complianceColor = profile.complianceStatus === 'compliant'
    ? 'text-primary bg-primary/10'
    : profile.complianceStatus === 'overdue'
    ? 'text-error bg-error/10'
    : 'text-tertiary bg-tertiary/10';

  const handleEditToggle = () => {
    if (isEditing) {
      setEditForm({
        businessName: profile.businessName,
        businessType: profile.businessType,
        yearOfIncorporation: String(profile.yearOfIncorporation),
        cacNumber: profile.cacNumber,
        tin: profile.tin,
        sector: profile.sector,
        numberOfEmployees: String(profile.numberOfEmployees),
        annualTurnover: formatNumberInput(String(profile.annualTurnover)),
        isProfessional: profile.isProfessional,
        vatRegistered: profile.vatRegistered,
        vatNumber: profile.vatNumber,
        taxYear: profile.taxYear,
        businessAddress: profile.businessAddress,
        email: profile.email,
        phoneNumber: profile.phoneNumber,
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    setIsSaving(true);
    const turnoverNum = parseNumberInput(editForm.annualTurnover);
    const yearNum = parseInt(editForm.yearOfIncorporation, 10) || new Date().getFullYear();
    const employeesNum = parseInt(editForm.numberOfEmployees, 10) || 1;

    const classification = getClassification(turnoverNum);
    const taxRate = getTaxRate(turnoverNum);

    setTimeout(() => {
      updateProfile({
        businessName: editForm.businessName.trim(),
        businessType: editForm.businessType,
        yearOfIncorporation: yearNum,
        cacNumber: editForm.cacNumber.trim(),
        tin: editForm.tin.trim(),
        sector: editForm.sector,
        numberOfEmployees: employeesNum,
        annualTurnover: turnoverNum,
        isProfessional: editForm.isProfessional,
        vatRegistered: editForm.vatRegistered,
        vatNumber: editForm.vatNumber.trim(),
        taxYear: editForm.taxYear,
        businessAddress: editForm.businessAddress.trim(),
        email: editForm.email.trim(),
        phoneNumber: editForm.phoneNumber.trim(),
        classification,
        taxRate,
      });
      setIsSaving(false);
      setIsEditing(false);
      addToast('Profile updated successfully', 'success');
    }, 800);
  };

  const handleReset = () => {
    clearProfile();
    setShowResetConfirm(false);
    addToast('Profile reset. Redirecting...', 'info');
    setTimeout(() => navigate('/onboarding'), 500);
  };

  return (
    <div className="max-w-5xl mx-auto pb-8">
      {/* Header */}
      <div className="premium-gradient rounded-3xl p-6 md:p-8 text-white relative overflow-hidden mb-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-bl-full" />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-3 md:p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-sm min-h-touch touch-manipulation"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm shrink-0">
              <Building2 size={24} className="text-white md:w-7 md:h-7" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl md:text-3xl font-extrabold truncate">{profile.businessName}</h1>
              <p className="text-white/80 text-xs md:text-sm truncate">{BUSINESS_TYPE_LABELS[profile.businessType]} · {SECTOR_LABELS[profile.sector] || profile.sector}</p>
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            {isEditing ? (
              <>
                <button
                  onClick={handleEditToggle}
                  className="flex-1 md:flex-none px-4 py-3 md:py-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-sm text-sm font-semibold flex items-center justify-center gap-2 min-h-touch touch-manipulation"
                >
                  <X size={16} /> Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 md:flex-none px-4 py-3 md:py-2 rounded-xl bg-white text-primary hover:bg-white/90 transition-colors text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-70 min-h-touch touch-manipulation"
                >
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </>
            ) : (
              <button
                onClick={handleEditToggle}
                className="w-full md:w-auto px-4 py-3 md:py-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-sm text-sm font-semibold flex items-center justify-center gap-2 min-h-touch touch-manipulation"
              >
                <Edit2 size={16} /> Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-6 relative z-10">
          <StatCard label="Tax Rate" value={`${profile.taxRate}%`} />
          <StatCard label="Classification" value={profile.classification} />
          <StatCard label="Annual Turnover" value={formatCurrency(profile.annualTurnover)} />
          <StatCard label="Employees" value={String(profile.numberOfEmployees)} />
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Business Identity */}
        <SectionCard icon={ShieldCheck} title="Business Identity" color="primary">
          <div className="space-y-4">
            {isEditing ? (
              <>
                <EditField label="Business Name" value={editForm.businessName} onChange={v => setEditForm(p => ({ ...p, businessName: v }))} />
                <EditSelect label="Business Type" value={editForm.businessType} onChange={v => setEditForm(p => ({ ...p, businessType: v as BusinessType }))} options={BUSINESS_TYPES.map(t => ({ value: t.value, label: t.label }))} />
                <EditField label="Year of Incorporation" value={editForm.yearOfIncorporation} onChange={v => setEditForm(p => ({ ...p, yearOfIncorporation: v }))} type="number" />
                <EditField label="CAC Number" value={editForm.cacNumber} onChange={v => setEditForm(p => ({ ...p, cacNumber: v }))} validate={isValidCacFormat} validateMessage="Invalid CAC format. Use RC1234567, BN1234567, or IT1234567" />
                <EditField label="TIN" value={editForm.tin} onChange={v => setEditForm(p => ({ ...p, tin: v }))} />
              </>
            ) : (
              <>
                <InfoRow icon={Building2} label="Business Name" value={profile.businessName} />
                <InfoRow icon={Briefcase} label="Business Type" value={BUSINESS_TYPE_LABELS[profile.businessType]} />
                <InfoRow icon={Calendar} label="Year of Incorporation" value={String(profile.yearOfIncorporation)} />
                <InfoRow icon={FileText} label="CAC Number" value={profile.cacNumber} />
                <InfoRow icon={FileText} label="TIN" value={profile.tin} />
              </>
            )}
          </div>
        </SectionCard>

        {/* Operations */}
        <SectionCard icon={TrendingUp} title="Operations" color="tertiary">
          <div className="space-y-4">
            {isEditing ? (
              <>
                <EditSelect label="Industry Sector" value={editForm.sector} onChange={v => setEditForm(p => ({ ...p, sector: v }))} options={SECTORS.map(s => ({ value: s.id, label: s.label }))} />
                <EditField label="Number of Employees" value={editForm.numberOfEmployees} onChange={v => setEditForm(p => ({ ...p, numberOfEmployees: v }))} type="number" />
                <EditField label="Annual Turnover" value={editForm.annualTurnover} onChange={v => setEditForm(p => ({ ...p, annualTurnover: formatNumberInput(v) }))} />
                <div className="flex items-center justify-between p-3 bg-surface-container-high rounded-xl">
                  <span className="text-sm text-on-surface">Professional Services</span>
                  <button
                    onClick={() => setEditForm(p => ({ ...p, isProfessional: !p.isProfessional }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${editForm.isProfessional ? 'bg-primary' : 'bg-outline-variant'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${editForm.isProfessional ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <InfoRow icon={Briefcase} label="Industry" value={SECTOR_LABELS[profile.sector] || profile.sector} />
                <InfoRow icon={Users} label="Employees" value={`${profile.numberOfEmployees} staff`} />
                <InfoRow icon={TrendingUp} label="Annual Turnover" value={formatCurrency(profile.annualTurnover)} />
                <InfoRow icon={Award} label="Professional Services" value={profile.isProfessional ? 'Yes' : 'No'} valueColor={profile.isProfessional ? 'text-primary' : 'text-on-surface-variant'} />
              </>
            )}
          </div>
        </SectionCard>

        {/* Tax Setup */}
        <SectionCard icon={Receipt} title="Tax Setup" color="primary">
          <div className="space-y-4">
            {isEditing ? (
              <>
                <div className="flex items-center justify-between p-3 bg-surface-container-high rounded-xl">
                  <span className="text-sm text-on-surface">VAT Registered</span>
                  <button
                    onClick={() => setEditForm(p => ({ ...p, vatRegistered: !p.vatRegistered }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${editForm.vatRegistered ? 'bg-primary' : 'bg-outline-variant'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${editForm.vatRegistered ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                {editForm.vatRegistered && (
                  <EditField label="VAT Number" value={editForm.vatNumber} onChange={v => setEditForm(p => ({ ...p, vatNumber: v }))} />
                )}
                <EditSelect label="Tax Year" value={editForm.taxYear} onChange={v => setEditForm(p => ({ ...p, taxYear: v as TaxYear }))} options={TAX_YEARS.map(t => ({ value: t.value, label: t.label }))} />
                <InfoRow icon={TrendingUp} label="Tax Rate" value={`${profile.taxRate}%`} valueColor="text-primary font-bold" />
                <InfoRow icon={Award} label="Classification" value={profile.classification} valueColor="text-primary font-bold" />
              </>
            ) : (
              <>
                <div className="flex items-center justify-between p-3 bg-surface-container-high rounded-xl">
                  <span className="text-sm text-on-surface-variant">VAT Status</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 ${vatStatus.color}`}>
                    <vatStatus.icon size={12} /> {vatStatus.label}
                  </span>
                </div>
                {profile.vatRegistered && (
                  <InfoRow icon={FileText} label="VAT Number" value={profile.vatNumber} />
                )}
                <InfoRow icon={Clock} label="Tax Year" value={TAX_YEAR_LABELS[profile.taxYear]} />
                <InfoRow icon={TrendingUp} label="Tax Rate" value={`${profile.taxRate}%`} valueColor="text-primary font-bold" />
                <InfoRow icon={Award} label="Classification" value={profile.classification} valueColor="text-primary font-bold" />
                <div className="flex items-center justify-between p-3 bg-surface-container-high rounded-xl">
                  <span className="text-sm text-on-surface-variant">Compliance Status</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full capitalize ${complianceColor}`}>
                    {profile.complianceStatus}
                  </span>
                </div>
              </>
            )}
          </div>
        </SectionCard>

        {/* Contact */}
        <SectionCard icon={MapPin} title="Contact Information" color="tertiary">
          <div className="space-y-4">
            {isEditing ? (
              <>
                <EditField label="Business Address" value={editForm.businessAddress} onChange={v => setEditForm(p => ({ ...p, businessAddress: v }))} />
                <EditField label="Email" value={editForm.email} onChange={v => setEditForm(p => ({ ...p, email: v }))} type="email" />
                <EditField label="Phone Number" value={editForm.phoneNumber} onChange={v => setEditForm(p => ({ ...p, phoneNumber: v }))} type="tel" />
              </>
            ) : (
              <>
                <InfoRow icon={MapPin} label="Address" value={profile.businessAddress} />
                <InfoRow icon={Mail} label="Email" value={profile.email} />
                <InfoRow icon={Phone} label="Phone" value={profile.phoneNumber} />
              </>
            )}
          </div>
        </SectionCard>
      </div>

      {/* Tax Breakdown */}
      <SectionCard icon={TrendingUp} title="Tax Breakdown" color="primary" className="mt-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <TaxBreakdownCard
            label="Company Income Tax"
            rate={`${profile.taxRate}%`}
            description={profile.taxRate === 0 ? 'Exempt (Small Company)' : `Based on ${profile.classification} status`}
            highlight={profile.taxRate > 0}
          />
          <TaxBreakdownCard
            label="Education Tax (TETFund)"
            rate={profile.annualTurnover >= 25_000_000 ? '2%' : '0%'}
            description={profile.annualTurnover >= 25_000_000 ? 'Applicable to Medium & Large' : 'Exempt (Small Company)'}
            highlight={profile.annualTurnover >= 25_000_000}
          />
          <TaxBreakdownCard
            label="VAT"
            rate={profile.vatRegistered ? '7.5%' : 'N/A'}
            description={profile.vatRegistered ? 'Monthly remittance required' : 'Not registered'}
            highlight={profile.vatRegistered}
          />
        </div>

        {profile.annualTurnover > 0 && (
          <div className="mt-4 p-4 bg-primary-container/10 rounded-xl border border-primary/20">
            <div className="flex items-start gap-3">
              <AlertCircle size={18} className="text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-primary">Estimated Annual Tax Liability</p>
                <p className="text-2xl font-extrabold text-primary mt-1">
                  {formatCurrency(profile.annualTurnover * (profile.taxRate / 100))}
                </p>
                <p className="text-xs text-on-surface-variant mt-1">
                  This is an estimate based on your annual turnover and tax rate. Actual liability may vary based on deductions and exemptions.
                </p>
              </div>
            </div>
          </div>
        )}
      </SectionCard>

      {/* Data Management */}
      <div className="mt-6 bg-surface-container-low rounded-2xl p-6 border border-outline-variant/15">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FileText size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-on-surface">Data Management</h3>
            <p className="text-sm text-on-surface-variant">Backup or restore your data</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              try {
                if (!profile) {
                  addToast('No profile to export', 'error');
                  return;
                }
                const data = JSON.stringify({ profile, exportedAt: new Date().toISOString() }, null, 2);
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `taxfyp-profile-${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
                addToast('Profile exported successfully', 'success');
              } catch {
                addToast('Failed to export profile', 'error');
              }
            }}
            className="w-full sm:w-auto px-4 py-3 sm:py-2 rounded-xl font-semibold text-primary border border-primary/30 hover:bg-primary/5 transition-colors text-sm min-h-touch touch-manipulation flex items-center justify-center"
          >
            Export Profile
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="mt-6 bg-surface-container-low rounded-2xl p-6 border border-error/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-error/10 rounded-lg">
            <LogOut size={20} className="text-error" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-on-surface">Danger Zone</h3>
            <p className="text-sm text-on-surface-variant">Irreversible actions for your profile</p>
          </div>
        </div>
        <button
          onClick={() => setShowResetConfirm(true)}
          className="w-full sm:w-auto px-4 py-3 sm:py-2 rounded-xl font-semibold text-error border border-error/30 hover:bg-error/5 transition-colors text-sm min-h-touch touch-manipulation"
        >
          Reset Profile
        </button>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowResetConfirm(false)} />
          <div className="relative bg-surface-container-lowest rounded-3xl shadow-2xl border border-outline-variant/20 max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-error/10 rounded-xl flex items-center justify-center">
                <AlertCircle size={20} className="text-error" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-on-surface">Reset Profile?</h3>
                <p className="text-sm text-on-surface-variant">This will permanently delete all your business information and cannot be undone.</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-3 sm:py-2.5 rounded-xl font-semibold text-on-surface-variant border border-outline-variant/30 hover:bg-surface-container-low transition-colors min-h-touch touch-manipulation"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="flex-1 py-3 sm:py-2.5 rounded-xl font-semibold bg-error text-white hover:bg-error/90 transition-colors min-h-touch touch-manipulation"
              >
                Reset Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Subcomponents ─── */

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
      <div className="text-white/70 text-xs mb-1">{label}</div>
      <div className="text-lg md:text-xl font-bold truncate">{value}</div>
    </div>
  );
}

function SectionCard({
  icon: Icon,
  title,
  color,
  children,
  className = '',
}: {
  icon: React.ElementType;
  title: string;
  color: 'primary' | 'tertiary';
  children: React.ReactNode;
  className?: string;
}) {
  const colorClasses = color === 'primary' ? 'bg-primary/10 text-primary' : 'bg-tertiary/10 text-tertiary';
  return (
    <div className={`bg-surface-container-low rounded-2xl p-6 border border-outline-variant/15 ${className}`}>
      <div className="flex items-center gap-3 mb-5">
        <div className={`p-2 rounded-lg ${colorClasses}`}>
          <Icon size={20} />
        </div>
        <h3 className="text-lg font-bold text-on-surface">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  valueColor = 'text-on-surface font-medium',
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={16} className="text-outline mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-xs text-on-surface-variant">{label}</div>
        <div className={`text-sm ${valueColor} truncate`}>{value}</div>
      </div>
    </div>
  );
}

function TaxBreakdownCard({
  label,
  rate,
  description,
  highlight = false,
}: {
  label: string;
  rate: string;
  description: string;
  highlight?: boolean;
}) {
  return (
    <div className={`p-4 rounded-xl border ${highlight ? 'border-primary/30 bg-primary/5' : 'border-outline-variant/20 bg-surface-container-high'}`}>
      <div className="text-sm text-on-surface-variant mb-1">{label}</div>
      <div className={`text-2xl font-extrabold ${highlight ? 'text-primary' : 'text-on-surface'}`}>{rate}</div>
      <div className="text-xs text-on-surface-variant mt-1">{description}</div>
    </div>
  );
}

function EditField({
  label,
  value,
  onChange,
  type = 'text',
  validate,
  validateMessage,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  validate?: (value: string) => boolean;
  validateMessage?: string;
}) {
  const isInvalid = validate ? !validate(value) && value.length > 0 : false;
  return (
    <div>
      <label className="block text-xs md:text-sm text-on-surface-variant mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`w-full bg-surface-container-high border rounded-xl px-4 py-3 md:py-2.5 text-base md:text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all min-h-touch ${
          isInvalid ? 'border-error' : 'border-outline-variant/30'
        }`}
      />
      {isInvalid && validateMessage && (
        <p className="text-xs text-error mt-1">{validateMessage}</p>
      )}
    </div>
  );
}

function EditSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="block text-xs md:text-sm text-on-surface-variant mb-2">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl px-4 py-3 md:py-2.5 text-base md:text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none min-h-touch"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
