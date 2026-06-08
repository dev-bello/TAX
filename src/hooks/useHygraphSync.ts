import { useState, useEffect, useCallback } from 'react';
import {
  hygraphRequest,
  GET_BUSINESS_PROFILE,
  CREATE_BUSINESS_PROFILE,
  UPDATE_BUSINESS_PROFILE,
  PUBLISH_BUSINESS_PROFILE,
  GET_TAX_RETURNS,
  CREATE_TAX_RETURN,
  PUBLISH_TAX_RETURN,
} from '../lib/hygraph';

export function useHygraphSync(userId?: string) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const syncProfile = useCallback(async (profile: any) => {
    if (!userId) return;
    setIsSyncing(true);
    setSyncError(null);
    try {
      // Check if profile exists
      const existing = await hygraphRequest(GET_BUSINESS_PROFILE, { userId });
      const existingId = existing?.businessProfiles?.[0]?.id;

      let result;
      if (existingId) {
        result = await hygraphRequest(UPDATE_BUSINESS_PROFILE, {
          id: existingId,
          businessName: profile.businessName,
          businessType: profile.businessType,
          yearOfIncorporation: profile.yearOfIncorporation,
          cacNumber: profile.cacNumber,
          tin: profile.tin,
          sector: profile.sector,
          numberOfEmployees: profile.numberOfEmployees,
          annualTurnover: profile.annualTurnover,
          isProfessional: profile.isProfessional,
          vatRegistered: profile.vatRegistered,
          vatNumber: profile.vatNumber,
          taxYear: profile.taxYear,
          complianceStatus: profile.complianceStatus,
          businessAddress: profile.businessAddress,
          email: profile.email,
          phoneNumber: profile.phoneNumber,
          classification: profile.classification,
          taxRate: profile.taxRate,
        });
        if (result?.updateBusinessProfile?.id) {
          await hygraphRequest(PUBLISH_BUSINESS_PROFILE, { id: result.updateBusinessProfile.id });
        }
      } else {
        result = await hygraphRequest(CREATE_BUSINESS_PROFILE, {
          userId,
          businessName: profile.businessName,
          businessType: profile.businessType,
          yearOfIncorporation: profile.yearOfIncorporation,
          cacNumber: profile.cacNumber,
          tin: profile.tin,
          sector: profile.sector,
          numberOfEmployees: profile.numberOfEmployees,
          annualTurnover: profile.annualTurnover,
          isProfessional: profile.isProfessional,
          vatRegistered: profile.vatRegistered,
          vatNumber: profile.vatNumber,
          taxYear: profile.taxYear,
          complianceStatus: profile.complianceStatus,
          businessAddress: profile.businessAddress,
          email: profile.email,
          phoneNumber: profile.phoneNumber,
          classification: profile.classification,
          taxRate: profile.taxRate,
        });
        if (result?.createBusinessProfile?.id) {
          await hygraphRequest(PUBLISH_BUSINESS_PROFILE, { id: result.createBusinessProfile.id });
        }
      }

      setLastSync(new Date());
      return result;
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : 'Sync failed');
      console.error('Hygraph sync error:', err);
    } finally {
      setIsSyncing(false);
    }
  }, [userId]);

  const loadProfile = useCallback(async () => {
    if (!userId) return null;
    try {
      const result = await hygraphRequest(GET_BUSINESS_PROFILE, { userId });
      return result?.businessProfiles?.[0] || null;
    } catch (err) {
      console.error('Failed to load profile from Hygraph:', err);
      return null;
    }
  }, [userId]);

  const saveTaxReturn = useCallback(async (taxData: {
    businessName: string;
    year: string;
    totalRevenue: number;
    totalExpenses: number;
    taxLiability: number;
    status?: string;
  }) => {
    if (!userId) return;
    setIsSyncing(true);
    try {
      const createResult = await hygraphRequest(CREATE_TAX_RETURN, {
        userId,
        businessName: taxData.businessName,
        year: taxData.year,
        totalRevenue: taxData.totalRevenue,
        totalExpenses: taxData.totalExpenses,
        taxLiability: taxData.taxLiability,
        statuss: taxData.status || 'draft',
      });

      if (createResult?.createTaxReturn?.id) {
        await hygraphRequest(PUBLISH_TAX_RETURN, { id: createResult.createTaxReturn.id });
      }

      setLastSync(new Date());
      return createResult;
    } catch (err) {
      console.error('Failed to save tax return:', err);
      throw err;
    } finally {
      setIsSyncing(false);
    }
  }, [userId]);

  const loadTaxReturns = useCallback(async () => {
    if (!userId) return [];
    try {
      const result = await hygraphRequest(GET_TAX_RETURNS, { userId });
      return result?.taxReturns || [];
    } catch (err) {
      console.error('Failed to load tax returns:', err);
      return [];
    }
  }, [userId]);

  return {
    isSyncing,
    lastSync,
    syncError,
    syncProfile,
    loadProfile,
    saveTaxReturn,
    loadTaxReturns,
  };
}
