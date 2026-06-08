import { z } from 'zod';
import { isValidCacFormat } from './cacValidation';

export const BusinessTypeSchema = z.enum([
  'sole_proprietorship',
  'partnership',
  'limited_company',
  'plc',
  'enterprise',
]);

export const TaxYearSchema = z.enum(['calendar', 'fiscal_april', 'fiscal_july']);
export const ComplianceStatusSchema = z.enum(['compliant', 'pending', 'overdue', 'unknown']);

// Lenient schema that coerces types and provides defaults for missing fields
export const BusinessProfileSchema = z.object({
  businessName: z.string().min(1),
  businessType: BusinessTypeSchema.default('limited_company'),
  yearOfIncorporation: z.coerce.number().int().min(1800).max(new Date().getFullYear()).default(new Date().getFullYear()),
  cacNumber: z.string()
    .refine(
      (val) => !val || isValidCacFormat(val),
      { message: 'Invalid CAC format. Use RC1234567, BN1234567, or IT1234567' }
    )
    .default(''),
  tin: z.string().default(''),
  sector: z.string().default(''),
  numberOfEmployees: z.coerce.number().int().min(0).default(0),
  annualTurnover: z.coerce.number().min(0).default(0),
  isProfessional: z.coerce.boolean().default(false),
  vatRegistered: z.coerce.boolean().default(false),
  vatNumber: z.string().default(''),
  taxYear: TaxYearSchema.default('calendar'),
  complianceStatus: ComplianceStatusSchema.default('unknown'),
  businessAddress: z.string().default(''),
  email: z.string().email().default('user@example.com'),
  phoneNumber: z.string().default(''),
  classification: z.string().default('Small Company'),
  taxRate: z.coerce.number().min(0).max(100).default(0),
});

export type BusinessType = z.infer<typeof BusinessTypeSchema>;
export type TaxYear = z.infer<typeof TaxYearSchema>;
export type ComplianceStatus = z.infer<typeof ComplianceStatusSchema>;
export type BusinessProfile = z.infer<typeof BusinessProfileSchema>;

// Schema versioning for migrations
export const CURRENT_SCHEMA_VERSION = 1;

export function validateProfile(data: unknown): BusinessProfile | null {
  try {
    return BusinessProfileSchema.parse(data);
  } catch (error) {
    console.error('Profile validation failed:', error);
    return null;
  }
}

export function migrateProfile(data: Record<string, unknown>): BusinessProfile | null {
  // Add migration logic here as schema evolves
  // For now, just validate
  return validateProfile(data);
}
