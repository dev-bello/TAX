import { useState, useEffect, useCallback } from 'react';

export type BusinessType = 'sole_proprietorship' | 'partnership' | 'limited_company' | 'plc' | 'enterprise';
export type TaxYear = 'calendar' | 'fiscal_april' | 'fiscal_july';
export type ComplianceStatus = 'compliant' | 'pending' | 'overdue' | 'unknown';

export interface BusinessProfile {
  // Step 1: Business Identity
  businessName: string;
  businessType: BusinessType;
  yearOfIncorporation: number;
  cacNumber: string;
  tin: string;

  // Step 2: Business Operations
  sector: string;
  numberOfEmployees: number;
  annualTurnover: number;
  isProfessional: boolean;

  // Step 3: Tax Setup
  vatRegistered: boolean;
  vatNumber: string;
  taxYear: TaxYear;
  complianceStatus: ComplianceStatus;

  // Step 4: Contact
  businessAddress: string;
  email: string;
  phoneNumber: string;

  // Computed
  classification: string;
  taxRate: number;
}

const STORAGE_KEY = 'taxfyp-business-profile';

function loadProfile(): BusinessProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as BusinessProfile;
  } catch {
    return null;
  }
}

function saveProfile(profile: BusinessProfile) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));
}

export function getClassification(turnover: number): string {
  if (turnover < 25_000_000) return 'Small Company';
  if (turnover <= 100_000_000) return 'Medium Company';
  return 'Large Company';
}

export function getTaxRate(turnover: number): number {
  if (turnover < 25_000_000) return 0;
  if (turnover <= 100_000_000) return 20;
  return 30;
}

export function useBusinessProfile() {
  const [profile, setProfileState] = useState<BusinessProfile | null>(loadProfile);

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setProfileState(loadProfile());
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const setProfile = useCallback((profile: BusinessProfile) => {
    saveProfile(profile);
    setProfileState(profile);
  }, []);

  const updateProfile = useCallback((updates: Partial<BusinessProfile>) => {
    setProfileState(prev => {
      if (!prev) return null;
      const next = { ...prev, ...updates };
      saveProfile(next);
      return next;
    });
  }, []);

  const clearProfile = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setProfileState(null);
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));
  }, []);

  const hasProfile = profile !== null;

  return { profile, hasProfile, setProfile, updateProfile, clearProfile };
}
