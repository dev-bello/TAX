import React, { useState, useEffect } from 'react';
import {
  Building2, Users, Receipt, MapPin, Mail, Phone, CheckCircle2,
  ArrowRight, ArrowLeft, ShieldCheck, Briefcase, Calendar, TrendingUp,
  Loader2, AlertCircle
} from 'lucide-react';
import { useToast } from '../components/Toast';
import HelpTooltip from '../components/HelpTooltip';
import { useBusinessProfile, getClassification, getTaxRate } from '../hooks/useBusinessProfile';
import type { BusinessType, TaxYear, BusinessProfile } from '../hooks/useBusinessProfile';

const STEPS = [
  { id: 'welcome', title: 'Welcome', icon: ShieldCheck },
  { id: 'identity', title: 'Business Identity', icon: Building2 },
  { id: 'operations', title: 'Operations', icon: Briefcase },
  { id: 'tax', title: 'Tax Setup', icon: Receipt },
  { id: 'contact', title: 'Contact', icon: MapPin },
  { id: 'review', title: 'Review', icon: CheckCircle2 },
];

const BUSINESS_TYPES: { value: BusinessType; label: string }[] = [
  { value: 'sole_proprietorship', label: 'Sole Proprietorship' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'limited_company', label: 'Limited Liability Company' },
  { value: 'plc', label: 'Public Limited Company' },
  { value: 'enterprise', label: 'Enterprise / SME' },
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

const TAX_YEARS: { value: TaxYear; label: string }[] = [
  { value: 'calendar', label: 'Calendar Year (Jan - Dec)' },
  { value: 'fiscal_april', label: 'Fiscal Year (Apr - Mar)' },
  { value: 'fiscal_july', label: 'Fiscal Year (Jul - Jun)' },
];

const DRAFT_KEY = 'taxfyp-onboarding-draft';

interface OnboardingDraft {
  step: number;
  businessName: string;
  businessType: BusinessType;
  yearOfIncorporation: string;
  cacNumber: string;
  tin: string;
  sector: string;
  numberOfEmployees: string;
  annualTurnover: string;
  isProfessional: boolean;
  vatRegistered: boolean;
  vatNumber: string;
  taxYear: TaxYear;
  businessAddress: string;
  email: string;
  phoneNumber: string;
}

function loadDraft(): OnboardingDraft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveDraft(draft: OnboardingDraft) {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

function clearDraft() {
  localStorage.removeItem(DRAFT_KEY);
}

function formatNumberInput(value: string): string {
  const num = value.replace(/[^\d]/g, '');
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function parseNumberInput(value: string): number {
  return parseInt(value.replace(/[^\d]/g, ''), 10) || 0;
}

export default function OnboardingWizard() {
  const { addToast } = useToast();
  const { setProfile } = useBusinessProfile();
  const [isSaving, setIsSaving] = useState(false);

  // Load draft or start fresh
  const draft = loadDraft();
  const [step, setStep] = useState(draft?.step ?? 0);

  // Form state
  const [businessName, setBusinessName] = useState(draft?.businessName ?? '');
  const [businessType, setBusinessType] = useState<BusinessType>(draft?.businessType ?? 'limited_company');
  const [yearOfIncorporation, setYearOfIncorporation] = useState(draft?.yearOfIncorporation ?? '');
  const [cacNumber, setCacNumber] = useState(draft?.cacNumber ?? '');
  const [tin, setTin] = useState(draft?.tin ?? '');

  const [sector, setSector] = useState(draft?.sector ?? 'technology');
  const [numberOfEmployees, setNumberOfEmployees] = useState(draft?.numberOfEmployees ?? '');
  const [annualTurnover, setAnnualTurnover] = useState(draft?.annualTurnover ?? '');
  const [isProfessional, setIsProfessional] = useState(draft?.isProfessional ?? false);

  const [vatRegistered, setVatRegistered] = useState(draft?.vatRegistered ?? false);
  const [vatNumber, setVatNumber] = useState(draft?.vatNumber ?? '');
  const [taxYear, setTaxYear] = useState<TaxYear>(draft?.taxYear ?? 'calendar');

  const [businessAddress, setBusinessAddress] = useState(draft?.businessAddress ?? '');
  const [email, setEmail] = useState(draft?.email ?? '');
  const [phoneNumber, setPhoneNumber] = useState(draft?.phoneNumber ?? '');

  // Persist draft on every change
  useEffect(() => {
    saveDraft({
      step,
      businessName,
      businessType,
      yearOfIncorporation,
      cacNumber,
      tin,
      sector,
      numberOfEmployees,
      annualTurnover,
      isProfessional,
      vatRegistered,
      vatNumber,
      taxYear,
      businessAddress,
      email,
      phoneNumber,
    });
  }, [step, businessName, businessType, yearOfIncorporation, cacNumber, tin, sector, numberOfEmployees, annualTurnover, isProfessional, vatRegistered, vatNumber, taxYear, businessAddress, email, phoneNumber]);

  const currentYear = new Date().getFullYear();
  const turnoverNum = parseNumberInput(annualTurnover);
  const employeesNum = parseNumberInput(numberOfEmployees);
  const yearNum = parseNumberInput(yearOfIncorporation);

  const validateStep = (): boolean => {
    switch (step) {
      case 1:
        if (!businessName.trim()) { addToast('Please enter your business name', 'error'); return false; }
        if (!yearOfIncorporation || yearNum < 1900 || yearNum > currentYear) { addToast('Please enter a valid year of incorporation', 'error'); return false; }
        if (!cacNumber.trim()) { addToast('Please enter your CAC registration number', 'error'); return false; }
        if (!tin.trim()) { addToast('Please enter your TIN', 'error'); return false; }
        return true;
      case 2:
        if (!annualTurnover || turnoverNum <= 0) { addToast('Please enter your annual turnover', 'error'); return false; }
        if (!numberOfEmployees || employeesNum < 0) { addToast('Please enter the number of employees', 'error'); return false; }
        return true;
      case 3:
        if (vatRegistered && !vatNumber.trim()) { addToast('Please enter your VAT number', 'error'); return false; }
        return true;
      case 4:
        if (!businessAddress.trim()) { addToast('Please enter your business address', 'error'); return false; }
        if (!email.trim() || !email.includes('@')) { addToast('Please enter a valid email address', 'error'); return false; }
        if (!phoneNumber.trim()) { addToast('Please enter your phone number', 'error'); return false; }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setStep(s => Math.min(s + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setStep(s => Math.max(s - 1, 0));
  };

  const handleComplete = () => {
    setIsSaving(true);
    setTimeout(() => {
      const classification = getClassification(turnoverNum);
      const taxRate = getTaxRate(turnoverNum);

      const profile: BusinessProfile = {
        businessName: businessName.trim(),
        businessType,
        yearOfIncorporation: yearNum,
        cacNumber: cacNumber.trim(),
        tin: tin.trim(),
        sector,
        numberOfEmployees: employeesNum,
        annualTurnover: turnoverNum,
        isProfessional,
        vatRegistered,
        vatNumber: vatNumber.trim(),
        taxYear,
        complianceStatus: 'unknown',
        businessAddress: businessAddress.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
        classification,
        taxRate,
      };

      setProfile(profile);
      clearDraft();
      setIsSaving(false);
      addToast('Welcome aboard! Your profile has been created.', 'success');
      window.dispatchEvent(new CustomEvent('navigateTo', { detail: 'dashboard' }));
    }, 1500);
  };

  const progressPercent = ((step) / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Header */}
        {step > 0 && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-on-surface">{STEPS[step].title}</h2>
              <span className="text-sm text-on-surface-variant">Step {step} of {STEPS.length - 1}</span>
            </div>
            <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between mt-2">
              {STEPS.slice(1).map((s, i) => (
                <div
                  key={s.id}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i + 1 <= step ? 'bg-primary' : 'bg-outline-variant'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Card */}
        <div className="bg-surface-container-lowest rounded-3xl shadow-taxfyp border border-outline-variant/15 p-6 md:p-10">
          {/* Step Content */}
          {step === 0 && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-primary-container/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <ShieldCheck size={40} className="text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-on-surface mb-4">Welcome to Tax FYP</h1>
              <p className="text-on-surface-variant text-lg mb-2 max-w-md mx-auto">
                The smartest way for Nigerian businesses to manage taxes.
              </p>
              <p className="text-on-surface-variant text-sm mb-8 max-w-md mx-auto">
                Let's get your business set up in just a few steps. This will help us personalize your tax dashboard and calculate your obligations accurately.
              </p>
              <div className="space-y-3 max-w-sm mx-auto mb-8">
                <div className="flex items-center gap-3 text-sm text-on-surface-variant">
                  <CheckCircle2 size={18} className="text-primary shrink-0" />
                  <span>Personalized tax calculations</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-on-surface-variant">
                  <CheckCircle2 size={18} className="text-primary shrink-0" />
                  <span>Deadline reminders & compliance alerts</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-on-surface-variant">
                  <CheckCircle2 size={18} className="text-primary shrink-0" />
                  <span>AI-powered expense tracking</span>
                </div>
              </div>
              <button
                onClick={handleNext}
                className="premium-gradient text-white px-10 py-3 rounded-xl font-semibold shadow-taxfyp hover:opacity-90 transition-opacity flex items-center gap-2 mx-auto"
              >
                Get Started <ArrowRight size={20} />
              </button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-on-surface-variant mb-2">Business Name *</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                  placeholder="e.g. Adeyemi Technologies Ltd"
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface-variant mb-2"><HelpTooltip term="Business Type" explanation="The legal structure of your business. Sole Proprietorship = one owner. Limited Company = separate legal entity. Partnership = shared ownership." /> *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {BUSINESS_TYPES.map(type => (
                    <button
                      key={type.value}
                      onClick={() => setBusinessType(type.value)}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        businessType === type.value
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-outline-variant/30 text-on-surface-variant hover:border-outline-variant hover:bg-surface-container-low'
                      }`}
                    >
                      <span className="text-sm font-semibold">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-on-surface-variant mb-2">Year of Incorporation *</label>
                  <div className="relative">
                    <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
                    <input
                      type="text"
                      value={yearOfIncorporation}
                      onChange={e => setYearOfIncorporation(e.target.value.replace(/[^\d]/g, '').slice(0, 4))}
                      placeholder={String(currentYear)}
                      className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl pl-10 pr-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-on-surface-variant mb-2"><HelpTooltip term="CAC Number" explanation="Corporate Affairs Commission registration number. It's like your business's ID card, issued when you register your company in Nigeria. Format: RC1234567 or BN1234567." /> *</label>
                  <input
                    type="text"
                    value={cacNumber}
                    onChange={e => setCacNumber(e.target.value)}
                    placeholder="e.g. RC1234567"
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface-variant mb-2"><HelpTooltip term="TIN" explanation="Tax Identification Number - your unique taxpayer ID issued by NRS. Every business must have one to file taxes. It looks like 12345678-0001." /> *</label>
                <input
                  type="text"
                  value={tin}
                  onChange={e => setTin(e.target.value)}
                  placeholder="e.g. 12345678-0001"
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
                <p className="text-xs text-on-surface-variant mt-1">Your TIN is required for all tax filings with the NRS.</p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-on-surface-variant mb-3">What industry is your business in? *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {SECTORS.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setSector(s.id)}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${
                        sector === s.id
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-outline-variant/30 text-on-surface-variant hover:border-outline-variant hover:bg-surface-container-low'
                      }`}
                    >
                      <span className="text-sm font-semibold">{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-on-surface-variant mb-2">
                    <span className="flex items-center gap-2">
                      <Users size={16} />
                      Number of Employees *
                    </span>
                  </label>
                  <input
                    type="text"
                    value={numberOfEmployees}
                    onChange={e => setNumberOfEmployees(e.target.value.replace(/[^\d]/g, ''))}
                    placeholder="e.g. 12"
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-on-surface-variant mb-2">
                    <span className="flex items-center gap-2">
                      <TrendingUp size={16} />
                      <HelpTooltip term="Annual Turnover" explanation="The total amount of money your business receives from sales and services in one year, before deducting any costs. Also called revenue or gross income." /> (₦) *
                    </span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline font-semibold">₦</span>
                    <input
                      type="text"
                      value={annualTurnover}
                      onChange={e => setAnnualTurnover(formatNumberInput(e.target.value))}
                      placeholder="e.g. 50,000,000"
                      className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl pl-10 pr-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                  {turnoverNum > 0 && (
                    <p className="text-xs text-primary mt-1 font-medium">
                      Classification: {getClassification(turnoverNum)} (Tax Rate: {getTaxRate(turnoverNum)}%)
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-2xl border border-outline-variant/20">
                <div>
                  <h3 className="text-sm font-semibold text-on-surface">Do you provide professional services?</h3>
                  <p className="text-xs text-on-surface-variant">Consulting, legal, accounting, or management services</p>
                </div>
                <button
                  onClick={() => setIsProfessional(!isProfessional)}
                  className={`w-14 h-8 rounded-full p-1 transition-colors ${isProfessional ? 'bg-primary' : 'bg-outline-variant'}`}
                >
                  <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${isProfessional ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-2xl border border-outline-variant/20">
                <div>
                  <h3 className="text-sm font-semibold text-on-surface"><HelpTooltip term="VAT Registration" explanation="Value Added Tax registration is mandatory if your annual turnover exceeds ₦25 million. Once registered, you must charge 7.5% VAT on sales and remit it monthly." /></h3>
                  <p className="text-xs text-on-surface-variant">Businesses with turnover above ₦25M must register for VAT</p>
                </div>
                <button
                  onClick={() => setVatRegistered(!vatRegistered)}
                  className={`w-14 h-8 rounded-full p-1 transition-colors ${vatRegistered ? 'bg-primary' : 'bg-outline-variant'}`}
                >
                  <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${vatRegistered ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>

              {vatRegistered && (
                <div>
                  <label className="block text-sm font-semibold text-on-surface-variant mb-2">VAT Registration Number</label>
                  <input
                    type="text"
                    value={vatNumber}
                    onChange={e => setVatNumber(e.target.value)}
                    placeholder="e.g. VAT12345678"
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-on-surface-variant mb-3">Tax Year *</label>
                <div className="space-y-2">
                  {TAX_YEARS.map(ty => (
                    <button
                      key={ty.value}
                      onClick={() => setTaxYear(ty.value)}
                      className={`w-full p-3 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${
                        taxYear === ty.value
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-outline-variant/30 text-on-surface-variant hover:border-outline-variant hover:bg-surface-container-low'
                      }`}
                    >
                      <Calendar size={18} />
                      <span className="text-sm font-semibold">{ty.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-primary-container/10 rounded-2xl border border-primary/20">
                <div className="flex items-start gap-3">
                  <AlertCircle size={18} className="text-primary shrink-0 mt-0.5" />
                  <p className="text-sm text-on-surface-variant">
                    Your tax rate is determined by your annual turnover. Based on your input, you fall under the <strong className="text-primary">{getClassification(turnoverNum)}</strong> category with a <strong className="text-primary">{getTaxRate(turnoverNum)}%</strong> company tax rate.
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-on-surface-variant mb-2">
                  <span className="flex items-center gap-2">
                    <MapPin size={16} />
                    Business Address *
                  </span>
                </label>
                <textarea
                  value={businessAddress}
                  onChange={e => setBusinessAddress(e.target.value)}
                  placeholder="e.g. 123 Victoria Island, Lagos"
                  rows={3}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface-variant mb-2">
                  <span className="flex items-center gap-2">
                    <Mail size={16} />
                    Business Email *
                  </span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. hello@yourbusiness.com"
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface-variant mb-2">
                  <span className="flex items-center gap-2">
                    <Phone size={16} />
                    Phone Number *
                  </span>
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  placeholder="e.g. +234 801 234 5678"
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-primary-container/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} className="text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-on-surface mb-2">Review Your Profile</h2>
                <p className="text-sm text-on-surface-variant">Please confirm your details before completing setup.</p>
              </div>

              <div className="space-y-4">
                <ReviewSection title="Business Identity">
                  <ReviewItem label="Business Name" value={businessName} />
                  <ReviewItem label="Business Type" value={BUSINESS_TYPES.find(t => t.value === businessType)?.label} />
                  <ReviewItem label="Year of Incorporation" value={yearOfIncorporation} />
                  <ReviewItem label="CAC Number" value={cacNumber} />
                  <ReviewItem label="TIN" value={tin} />
                </ReviewSection>

                <ReviewSection title="Operations">
                  <ReviewItem label="Industry" value={SECTORS.find(s => s.id === sector)?.label} />
                  <ReviewItem label="Employees" value={numberOfEmployees} />
                  <ReviewItem label="Annual Turnover" value={`₦${annualTurnover}`} />
                  <ReviewItem label="Professional Services" value={isProfessional ? 'Yes' : 'No'} />
                </ReviewSection>

                <ReviewSection title="Tax Setup">
                  <ReviewItem label="VAT Registered" value={vatRegistered ? 'Yes' : 'No'} />
                  {vatRegistered && <ReviewItem label="VAT Number" value={vatNumber} />}
                  <ReviewItem label="Tax Year" value={TAX_YEARS.find(t => t.value === taxYear)?.label} />
                  <ReviewItem label="Classification" value={`${getClassification(turnoverNum)} (${getTaxRate(turnoverNum)}% tax rate)`} />
                </ReviewSection>

                <ReviewSection title="Contact">
                  <ReviewItem label="Address" value={businessAddress} />
                  <ReviewItem label="Email" value={email} />
                  <ReviewItem label="Phone" value={phoneNumber} />
                </ReviewSection>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          {step > 0 && (
            <div className="flex justify-between mt-8 pt-6 border-t border-outline-variant/15">
              <button
                onClick={handleBack}
                className="px-6 py-3 rounded-xl font-semibold text-on-surface-variant hover:bg-surface-container-low transition-colors flex items-center gap-2"
              >
                <ArrowLeft size={18} /> Back
              </button>

              {step < STEPS.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="premium-gradient text-white px-8 py-3 rounded-xl font-semibold shadow-taxfyp hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  Continue <ArrowRight size={18} />
                </button>
              ) : (
                <button
                  onClick={handleComplete}
                  disabled={isSaving}
                  className="premium-gradient text-white px-8 py-3 rounded-xl font-semibold shadow-taxfyp hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                  {isSaving ? 'Saving...' : 'Complete Setup'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Skip option */}
        {step === 0 && (
          <p className="text-center text-sm text-on-surface-variant mt-6">
            Already have an account?{' '}
            <button className="text-primary font-semibold hover:underline">Sign In</button>
          </p>
        )}
      </div>
    </div>
  );
}

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface-container-low rounded-2xl p-4">
      <h3 className="text-sm font-bold text-on-surface mb-3">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function ReviewItem({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between text-sm">
      <span className="text-on-surface-variant">{label}</span>
      <span className="font-medium text-on-surface text-right max-w-[60%]">{value}</span>
    </div>
  );
}
