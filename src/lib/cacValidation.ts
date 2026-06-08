/**
 * CAC (Corporate Affairs Commission) validation and lookup utilities
 *
 * This module performs live lookups against the official CAC public registry.
 * Because the registry API runs on a different origin and is protected by
 * Cloudflare, requests must go through a proxy when called from a browser.
 *
 * Proxy setup (handled automatically):
 *   - Vite dev server (vite.config.ts)
 *   - Standalone server (server.js)
 */

// ── Constants ───────────────────────────────────────────────────────────────

const CAC_REGEX = /^(RC|BN|IT)\d{5,8}$/i;

const CAC_SEARCH_PROXY = '/api/cac-search';
const CAC_SEARCH_DIRECT =
  'https://authapp.cac.gov.ng/name_similarity_app/api/public_search/search';

const CAC_TAX_PROXY = '/api/cac-tax';
const CAC_TAX_DIRECT =
  'https://icrp.cac.gov.ng/tin_service/api/v1/public/tin/generate-tax-id';

const FETCH_TIMEOUT = 15000;

// ── Format helpers ──────────────────────────────────────────────────────────

export function isValidCacFormat(cacNumber: string): boolean {
  if (!cacNumber || typeof cacNumber !== 'string') return false;
  return CAC_REGEX.test(cacNumber.trim().toUpperCase());
}

export function normalizeCacNumber(cacNumber: string): string {
  return cacNumber.trim().toUpperCase();
}

export function getCacPrefix(cacNumber: string): string {
  const m = cacNumber.trim().toUpperCase().match(/^(RC|BN|IT)/);
  return m ? m[1] : '';
}

/** Extract just the numeric part (e.g. "RC8623414" → "8623414") */
export function getCacNumberOnly(cacNumber: string): string {
  return cacNumber.replace(/[^0-9]/g, '');
}

export function getCacType(cacNumber: string): string {
  const prefix = getCacPrefix(cacNumber);
  if (prefix === 'RC') return 'Company Registration';
  if (prefix === 'BN') return 'Business Name';
  if (prefix === 'IT') return 'Incorporated Trustees';
  return 'Unknown';
}

// ── Types ───────────────────────────────────────────────────────────────────

export interface CacLookupResult {
  success: boolean;
  cacNumber: string;
  businessName?: string;
  yearOfIncorporation?: number;
  businessType?: string;
  status?: 'active' | 'inactive' | 'dissolved';
  taxId?: string;
  message?: string;
}

export interface CacCompanyRecord {
  id: number;
  approvedName: string;
  rcNumber: string;
  companyId: number;
  classificationId: number;
  companyRegistrationDate: string;
  classificationName: string;
  natureOfBusiness: string;
  status: string;
}

// ── API helpers ─────────────────────────────────────────────────────────────

function getSearchUrl(): string {
  return typeof window !== 'undefined' ? CAC_SEARCH_PROXY : CAC_SEARCH_DIRECT;
}

function getTaxUrl(companyId: number, rcNumber: string, type: number): string {
  if (typeof window !== 'undefined') {
    return `${CAC_TAX_PROXY}/${companyId}?rc=${rcNumber}&type=${type}`;
  }
  return `${CAC_TAX_DIRECT}/${companyId}?rc=${rcNumber}&type=${type}`;
}

function buildSearchPayload(cacNumber: string): Record<string, string> {
  return {
    SearchType: 'ALL',
    searchTerm: getCacNumberOnly(cacNumber),
  };
}

// ── Response parsers ────────────────────────────────────────────────────────

function parseSearchResponse(
  cacNumber: string,
  data: unknown
): CacLookupResult & { rawRecord?: CacCompanyRecord } {
  const res = data as Record<string, unknown>;

  if (!res.success) {
    return {
      success: false,
      cacNumber,
      message: (res.message as string) || 'CAC lookup failed',
    };
  }

  const list = res.data as Array<Record<string, unknown>> | undefined;
  if (!list || list.length === 0) {
    return {
      success: false,
      cacNumber,
      message: 'No company found for that CAC number.',
    };
  }

  const record = list[0];

  const rawName =
    (record.approvedName as string) ??
    (record.companyName as string) ??
    (record.businessName as string) ??
    (record.name as string) ??
    '';

  const rawDate =
    (record.companyRegistrationDate as string) ??
    (record.registrationDate as string) ??
    '';
  const yearMatch = rawDate.match(/(\d{4})/);
  const year = yearMatch ? parseInt(yearMatch[1], 10) : undefined;

  const rawType =
    (record.classificationName as string) ??
    (record.companyType as string) ??
    (record.natureOfBusiness as string) ??
    '';

  const companyRecord: CacCompanyRecord = {
    id: Number(record.id ?? 0),
    approvedName: rawName,
    rcNumber: String(record.rcNumber ?? ''),
    companyId: Number(record.companyId ?? 0),
    classificationId: Number(record.classificationId ?? 0),
    companyRegistrationDate: rawDate,
    classificationName: rawType,
    natureOfBusiness: String(record.natureOfBusiness ?? ''),
    status: String(record.status ?? ''),
  };

  if (!rawName) {
    return {
      success: false,
      cacNumber,
      message: 'No company found for that CAC number.',
    };
  }

  return {
    success: true,
    cacNumber,
    businessName: rawName,
    yearOfIncorporation: year,
    businessType: mapCacTypeToApp(rawType),
    status: parseStatus(String(record.status ?? '')),
    rawRecord: companyRecord,
  };
}

function parseTaxResponse(data: unknown): { success: boolean; taxId?: string; message?: string } {
  // NOTE: the tax endpoint returns success:false even when data is present!
  const res = data as Record<string, unknown>;
  const payload = res.data as Record<string, unknown> | undefined;

  const taxId =
    (payload?.tax_id as string) ??
    (payload?.taxId as string) ??
    (payload?.tin as string) ??
    '';

  if (taxId) {
    return { success: true, taxId };
  }

  return {
    success: false,
    message: (res.message as string) || 'Tax ID not found in registry.',
  };
}

function parseStatus(raw: string): CacLookupResult['status'] {
  const lower = raw.toLowerCase();
  if (lower.includes('active')) return 'active';
  if (lower.includes('dissolv')) return 'dissolved';
  return 'inactive';
}

function mapCacTypeToApp(raw: string): string | undefined {
  const lower = raw.toLowerCase();
  if (lower.includes('public limited')) return 'plc';
  if (lower.includes('private') && lower.includes('limited')) return 'limited_company';
  if (lower.includes('limited liability')) return 'limited_company';
  if (lower.includes('business name')) return 'enterprise';
  if (lower.includes('sole proprietorship')) return 'sole_proprietorship';
  if (lower.includes('partnership')) return 'partnership';
  if (lower.includes('trustee')) return 'enterprise';
  if (lower.includes('company')) return 'limited_company';
  return undefined;
}

// ── Fetch utilities ─────────────────────────────────────────────────────────

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

// ── Public API ──────────────────────────────────────────────────────────────

export async function fetchCacFromRegistry(
  cacNumber: string
): Promise<CacLookupResult & { rawRecord?: CacCompanyRecord }> {
  const normalized = normalizeCacNumber(cacNumber);

  if (!isValidCacFormat(normalized)) {
    throw new Error('Invalid CAC number format. Expected: RC1234567, BN1234567, or IT1234567');
  }

  const response = await fetchWithTimeout(
    getSearchUrl(),
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(buildSearchPayload(normalized)),
    },
    FETCH_TIMEOUT
  );

  if (!response.ok) {
    throw new Error(`CAC API returned HTTP ${response.status}`);
  }

  const data = await response.json();
  const result = parseSearchResponse(normalized, data);

  if (!result.success) {
    throw new Error(result.message || 'CAC lookup failed');
  }

  return result;
}

/**
 * Fetch Tax ID (TIN) using companyId, rcNumber and classificationId from the
 * search result.  These three values come from the first CAC search response.
 */
export async function fetchCacTaxId(
  companyId: number,
  rcNumber: string,
  classificationId: number
): Promise<{ success: boolean; taxId?: string; message?: string }> {
  const url = getTaxUrl(companyId, rcNumber, classificationId);

  const response = await fetchWithTimeout(
    url,
    {
      method: 'GET',
      headers: { Accept: 'application/json' },
    },
    FETCH_TIMEOUT
  );

  if (!response.ok) {
    throw new Error(`CAC Tax API returned HTTP ${response.status}`);
  }

  const data = await response.json();
  const result = parseTaxResponse(data);

  if (!result.success) {
    throw new Error(result.message || 'Tax ID lookup failed');
  }

  return result;
}

/**
 * Look up a CAC number in the registry.
 * Throws an error if the lookup fails — no mock fallback.
 */
export async function lookupCacNumber(
  cacNumber: string
): Promise<CacLookupResult & { rawRecord?: CacCompanyRecord }> {
  const normalized = normalizeCacNumber(cacNumber);

  if (!isValidCacFormat(normalized)) {
    throw new Error('Invalid CAC number format. Expected: RC1234567, BN1234567, or IT1234567');
  }

  return fetchCacFromRegistry(normalized);
}
