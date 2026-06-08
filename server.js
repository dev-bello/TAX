/**
 * Standalone proxy server for the Tax FYP app.
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

const CAC_SEARCH_URL =
  'https://authapp.cac.gov.ng/name_similarity_app/api/public_search/search';
const CAC_TAX_BASE =
  'https://icrp.cac.gov.ng/tin_service/api/v1/public/tin/generate-tax-id';

app.use(express.json());

// ── CAC search proxy ──────────────────────────────────────────────────────────

app.post('/api/cac-search', async (req, res) => {
  try {
    const response = await fetch(CAC_SEARCH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Origin: 'https://icrp.cac.gov.ng',
        Referer: 'https://icrp.cac.gov.ng/',
      },
      body: JSON.stringify(req.body),
    });

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: `CAC API returned ${response.status}`,
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('CAC search proxy error:', err);
    res.status(502).json({
      success: false,
      message: 'Failed to reach CAC search API.',
    });
  }
});

// ── CAC tax-id proxy ──────────────────────────────────────────────────────────
// The browser calls  GET /api/cac-tax/{companyId}?rc=...&type=...
// We proxy it to    GET https://icrp.cac.gov.ng/.../generate-tax-id/{companyId}?rc=...&type=...

app.get('/api/cac-tax/*', async (req, res) => {
  try {
    // Reconstruct the target URL with the path suffix and query string
    const suffix = req.params[0] || '';
    const query = new URLSearchParams(req.query).toString();
    const targetUrl = `${CAC_TAX_BASE}/${suffix}${query ? '?' + query : ''}`;

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Origin: 'https://icrp.cac.gov.ng',
        Referer: 'https://icrp.cac.gov.ng/',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: `CAC Tax API returned ${response.status}`,
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('CAC tax proxy error:', err);
    res.status(502).json({
      success: false,
      message: 'Failed to reach CAC tax API.',
    });
  }
});

// ── Static files ──────────────────────────────────────────────────────────────

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Tax FYP server running at http://localhost:${PORT}`);
  console.log(`CAC search proxy  →  http://localhost:${PORT}/api/cac-search`);
  console.log(`CAC tax proxy     →  http://localhost:${PORT}/api/cac-tax`);
});
