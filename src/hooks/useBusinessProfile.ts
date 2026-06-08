import { useState, useEffect, useCallback } from 'react';
import {
  hygraphRequest,
  GET_BUSINESS_PROFILE,
  CREATE_BUSINESS_PROFILE,
  UPDATE_BUSINESS_PROFILE,
  PUBLISH_BUSINESS_PROFILE,
} from '../lib/hygraph';
import { validateProfile, type BusinessProfile, type BusinessType, type TaxYear } from '../lib/validation';

export type { BusinessProfile, BusinessType, TaxYear };
export type ComplianceStatus = 'compliant' | 'pending' | 'overdue' | 'unknown';

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

function normalizeProfile(raw: any): BusinessProfile | null {
  if (!raw) return null;
  // Pass raw data to Zod - schema handles defaults and type coercion
  return validateProfile(raw);
}

export function useBusinessProfile(userId?: string) {
  const [profile, setProfileState] = useState<BusinessProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return null;
    }
    try {
      setIsLoading(true);
      const result = await hygraphRequest(GET_BUSINESS_PROFILE, { userId });
      console.log('Profile query result:', result);
      const raw = result?.businessProfiles?.[0];
      console.log('Raw profile:', raw);
      const normalized = normalizeProfile(raw);
      console.log('Normalized profile:', normalized);
      setProfileState(normalized);
      setError(null);
      return normalized;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load profile';
      setError(msg);
      console.error('Hygraph profile load error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadProfile();
    } else {
      setIsLoading(false);
    }
  }, [userId, loadProfile]);

  const setProfile = useCallback(async (newProfile: BusinessProfile) => {
    const validated = validateProfile(newProfile);
    if (!validated) {
      throw new Error('Invalid profile data');
    }
    if (!userId) {
      throw new Error('No user ID available');
    }
    try {
      const result = await hygraphRequest(CREATE_BUSINESS_PROFILE, {
        userId,
        businessName: validated.businessName,
        businessType: validated.businessType,
        yearOfIncorporation: validated.yearOfIncorporation,
        cacNumber: validated.cacNumber,
        tin: validated.tin,
        sector: validated.sector,
        numberOfEmployees: validated.numberOfEmployees,
        annualTurnover: validated.annualTurnover,
        isProfessional: validated.isProfessional,
        vatRegistered: validated.vatRegistered,
        vatNumber: validated.vatNumber,
        taxYear: validated.taxYear,
        complianceStatus: validated.complianceStatus,
        businessAddress: validated.businessAddress,
        email: validated.email,
        phoneNumber: validated.phoneNumber,
        classification: validated.classification,
        taxRate: validated.taxRate,
      });
      if (result?.createBusinessProfile?.id) {
        await hygraphRequest(PUBLISH_BUSINESS_PROFILE, { id: result.createBusinessProfile.id });
      }
      setProfileState(validated);
      setError(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save profile';
      setError(msg);
      console.error('Hygraph profile save error:', err);
      throw err;
    }
  }, [userId]);

  const updateProfile = useCallback(async (updates: Partial<BusinessProfile>) => {
    if (!userId) return;
    setProfileState((prev) => {
      if (!prev) return null;
      const next = { ...prev, ...updates };
      const validated = validateProfile(next);
      if (validated) {
        // Fire-and-forget save to Hygraph
        hygraphRequest(GET_BUSINESS_PROFILE, { userId })
          .then((result: any) => {
            const existing = result?.businessProfiles?.[0];
            if (existing?.id) {
              return hygraphRequest(UPDATE_BUSINESS_PROFILE, {
                id: existing.id,
                businessName: validated.businessName,
                businessType: validated.businessType,
                yearOfIncorporation: validated.yearOfIncorporation,
                cacNumber: validated.cacNumber,
                tin: validated.tin,
                sector: validated.sector,
                numberOfEmployees: validated.numberOfEmployees,
                annualTurnover: validated.annualTurnover,
                isProfessional: validated.isProfessional,
                vatRegistered: validated.vatRegistered,
                vatNumber: validated.vatNumber,
                taxYear: validated.taxYear,
                complianceStatus: validated.complianceStatus,
                businessAddress: validated.businessAddress,
                email: validated.email,
                phoneNumber: validated.phoneNumber,
                classification: validated.classification,
                taxRate: validated.taxRate,
              });
            }
          })
          .then((result: any) => {
            if (result?.updateBusinessProfile?.id) {
              hygraphRequest(PUBLISH_BUSINESS_PROFILE, { id: result.updateBusinessProfile.id });
            }
          })
          .catch(console.error);
        return validated;
      }
      return prev;
    });
  }, [userId]);

  const clearProfile = useCallback(async () => {
    setProfileState(null);
    setError(null);
  }, []);

  const exportData = useCallback(async () => {
    if (!profile) return JSON.stringify({ error: 'No profile loaded' }, null, 2);
    return JSON.stringify({ profile, exportedAt: new Date().toISOString() }, null, 2);
  }, [profile]);

  const hasProfile = profile !== null;

  return {
    profile,
    hasProfile,
    isLoading,
    error,
    setProfile,
    updateProfile,
    clearProfile,
    exportData,
    loadProfile,
  };
}
