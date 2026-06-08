import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X, Building2, Briefcase, Receipt, MapPin, Mail, Phone,
  Calendar, Users, TrendingUp, ShieldCheck, Edit2, CheckCircle2,
  Award, FileText, Clock, AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useBusinessProfile, getClassification, getTaxRate } from '../hooks/useBusinessProfile';
import type { BusinessType, TaxYear } from '../hooks/useBusinessProfile';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

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

function formatCurrency(n: number): string {
  if (n >= 1_000_000_000) return `₦${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(0)}K`;
  return `₦${n.toFixed(0)}`;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, clearProfile } = useBusinessProfile(user?.id);
  const [isEditing, setIsEditing] = useState(false);

  if (!isOpen || !profile) return null;

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset your profile? This will clear all your business information and return you to onboarding.')) {
      clearProfile();
      onClose();
      navigate('/onboarding');
    }
  };

  const vatStatus = profile.vatRegistered
    ? { label: 'Registered', color: 'text-primary bg-primary/10', icon: CheckCircle2 }
    : { label: 'Not Registered', color: 'text-on-surface-variant bg-surface-container-high', icon: AlertCircle };

  const complianceColor = profile.complianceStatus === 'compliant'
    ? 'text-primary bg-primary/10'
    : profile.complianceStatus === 'overdue'
    ? 'text-error bg-error/10'
    : 'text-tertiary bg-tertiary/10';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-surface-container-lowest rounded-3xl shadow-2xl border border-outline-variant/20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="premium-gradient p-6 md:p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-bl-full" />

          <div className="flex justify-between items-start relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Building2 size={32} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold">{profile.businessName}</h2>
                <p className="text-white/80 text-sm mt-1">{BUSINESS_TYPE_LABELS[profile.businessType]}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-sm"
                title="Edit Profile"
              >
                <Edit2 size={18} />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-sm"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 relative z-10">
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
              <div className="text-white/70 text-xs mb-1">Tax Rate</div>
              <div className="text-xl font-bold">{profile.taxRate}%</div>
            </div>
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
              <div className="text-white/70 text-xs mb-1">Classification</div>
              <div className="text-xl font-bold">{profile.classification}</div>
            </div>
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
              <div className="text-white/70 text-xs mb-1">Annual Turnover</div>
              <div className="text-xl font-bold">{formatCurrency(profile.annualTurnover)}</div>
            </div>
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
              <div className="text-white/70 text-xs mb-1">Employees</div>
              <div className="text-xl font-bold">{profile.numberOfEmployees}</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Business Identity Card */}
            <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/15">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <ShieldCheck size={20} className="text-primary" />
                </div>
                <h3 className="text-lg font-bold text-on-surface">Business Identity</h3>
              </div>

              <div className="space-y-4">
                <InfoRow icon={Building2} label="Business Name" value={profile.businessName} />
                <InfoRow icon={Briefcase} label="Business Type" value={BUSINESS_TYPE_LABELS[profile.businessType]} />
                <InfoRow icon={Calendar} label="Year of Incorporation" value={String(profile.yearOfIncorporation)} />
                <InfoRow icon={FileText} label="CAC Number" value={profile.cacNumber} />
                <InfoRow icon={FileText} label="TIN" value={profile.tin} />
              </div>
            </div>

            {/* Operations Card */}
            <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/15">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-tertiary/10 rounded-lg">
                  <TrendingUp size={20} className="text-tertiary" />
                </div>
                <h3 className="text-lg font-bold text-on-surface">Operations</h3>
              </div>

              <div className="space-y-4">
                <InfoRow icon={Briefcase} label="Industry" value={SECTOR_LABELS[profile.sector] || profile.sector} />
                <InfoRow icon={Users} label="Employees" value={`${profile.numberOfEmployees} staff`} />
                <InfoRow icon={TrendingUp} label="Annual Turnover" value={formatCurrency(profile.annualTurnover)} />
                <InfoRow
                  icon={Award}
                  label="Professional Services"
                  value={profile.isProfessional ? 'Yes' : 'No'}
                  valueColor={profile.isProfessional ? 'text-primary' : 'text-on-surface-variant'}
                />
              </div>
            </div>

            {/* Tax Setup Card */}
            <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/15">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Receipt size={20} className="text-primary" />
                </div>
                <h3 className="text-lg font-bold text-on-surface">Tax Setup</h3>
              </div>

              <div className="space-y-4">
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
              </div>
            </div>

            {/* Contact Card */}
            <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/15">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-tertiary/10 rounded-lg">
                  <MapPin size={20} className="text-tertiary" />
                </div>
                <h3 className="text-lg font-bold text-on-surface">Contact Information</h3>
              </div>

              <div className="space-y-4">
                <InfoRow icon={MapPin} label="Address" value={profile.businessAddress} />
                <InfoRow icon={Mail} label="Email" value={profile.email} />
                <InfoRow icon={Phone} label="Phone" value={profile.phoneNumber} />
              </div>
            </div>
          </div>

          {/* Tax Breakdown Card */}
          <div className="mt-6 bg-surface-container-low rounded-2xl p-6 border border-outline-variant/15">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp size={20} className="text-primary" />
              </div>
              <h3 className="text-lg font-bold text-on-surface">Tax Breakdown</h3>
            </div>

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
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleReset}
              className="flex-1 py-3 rounded-xl font-semibold text-error border border-error/30 hover:bg-error/5 transition-colors"
            >
              Reset Profile
            </button>
            <button
              onClick={onClose}
              className="flex-1 premium-gradient text-white py-3 rounded-xl font-semibold shadow-taxfyp hover:opacity-90 transition-opacity"
            >
              Done
            </button>
          </div>
        </div>
      </div>
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
