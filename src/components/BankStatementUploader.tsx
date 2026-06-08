import React, { useState, useRef, useCallback } from 'react';
import { UploadCloud, FileText, X, Loader2, CheckCircle2, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { sanitizeForPrompt } from '../lib/sanitize';

interface Transaction {
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category?: string;
  confidence?: number;
}

export interface TaxSummary {
  totalRevenue: number;
  totalExpenses: number;
  assetPurchases: number;
  estimatedTaxRate: number;
  period: string;
  confidence: number;
}

interface ExtractionResult {
  transactions: Transaction[];
  taxSummary?: TaxSummary;
}

interface BankStatementUploaderProps {
  onTransactionsExtracted?: (transactions: Transaction[]) => void;
  onTaxDataExtracted?: (taxSummary: TaxSummary) => void;
  extractionMode?: 'expenses' | 'tax' | 'both';
  apiKey?: string;
}

// Moonshot AI API endpoint
const MOONSHOT_API_URL = 'https://api.moonshot.ai/v1/chat/completions';

export default function BankStatementUploader({
  onTransactionsExtracted,
  onTaxDataExtracted,
  extractionMode = 'expenses',
  apiKey
}: BankStatementUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [extractedTransactions, setExtractedTransactions] = useState<Transaction[]>([]);
  const [taxSummary, setTaxSummary] = useState<TaxSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use provided API key or environment variable only - NEVER hardcode keys
  const MOONSHOT_API_KEY = apiKey || (import.meta as any).env?.VITE_MOONSHOT_API_KEY;
  
  if (!MOONSHOT_API_KEY) {
    console.warn('Moonshot API key not configured. Bank statement parsing will not function.');
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFileWithAI = async (file: File) => {
    if (!MOONSHOT_API_KEY) {
      setError('AI service is not configured. Please add your VITE_MOONSHOT_API_KEY to the .env file and restart the server.');
      return;
    }

    try {
      setUploadProgress(10);

      // Step 1: Upload file to Moonshot for extraction (works with PDF, Excel, CSV, TXT)
      const formData = new FormData();
      formData.append('file', file);
      formData.append('purpose', 'file-extract');

      const uploadRes = await fetch('https://api.moonshot.ai/v1/files', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${MOONSHOT_API_KEY}`,
        },
        body: formData,
      });

      if (!uploadRes.ok) {
        const err = await uploadRes.json().catch(() => ({}));
        throw new Error(err.error?.message || `File upload failed: ${uploadRes.status}`);
      }

      const fileObj = await uploadRes.json();
      const fileId = fileObj.id;
      setUploadProgress(40);

      // Step 2: Retrieve extracted text content
      const contentRes = await fetch(`https://api.moonshot.ai/v1/files/${fileId}/content`, {
        headers: { 'Authorization': `Bearer ${MOONSHOT_API_KEY}` },
      });

      if (!contentRes.ok) {
        throw new Error(`Failed to retrieve file content: ${contentRes.status}`);
      }

      const fileContent = await contentRes.text();
      setUploadProgress(60);

      // Step 3: Send extracted content to chat completions for structured parsing
      const isTaxMode = extractionMode === 'tax' || extractionMode === 'both';
      const isExpenseMode = extractionMode === 'expenses' || extractionMode === 'both';

      const systemPrompt = isTaxMode
        ? `You are a financial data extraction specialist for Nigerian tax purposes. Analyze bank statement data and extract both detailed transactions AND tax-relevant summary data.

Your task is to:
1. Parse the bank statement data provided
2. Identify all individual transactions (deposits and withdrawals)
3. Categorize transactions into tax-relevant categories: Sales Revenue, Office Expenses, Utilities, Transportation, Professional Services, Asset Purchase, Rent, Salaries, Marketing, Miscellaneous
4. Calculate tax summary: total revenue, total expenses, asset purchases, estimated tax rate based on revenue size
5. Determine statement period

Tax Rules for Nigeria:
- Revenue < ₦25M: 0% tax rate (small company)
- Revenue ₦25M-₦100M: 20% tax rate (medium company)
- Revenue > ₦100M: 30% tax rate (large company)
- Asset purchases may qualify for capital allowances (25% annual depreciation)

Respond ONLY with valid JSON in this exact format:
{
  "transactions": [
    {
      "date": "2026-03-15",
      "description": "Transaction description",
      "amount": 1234.56,
      "type": "expense",
      "category": "Office Expenses",
      "confidence": 0.95
    }
  ],
  "taxSummary": {
    "totalRevenue": 50000000,
    "totalExpenses": 25000000,
    "assetPurchases": 5000000,
    "estimatedTaxRate": 20,
    "period": "Jan 2026 - Mar 2026",
    "confidence": 0.92
  }
}`
        : `You are a financial data extraction specialist. Analyze bank statement data and extract all transactions into structured JSON format.

Your task is to:
1. Parse the bank statement data provided
2. Identify all individual transactions (deposits and withdrawals)
3. Extract date, description, amount, and determine if it's income or expense
4. Categorize each transaction into one of these categories: Sales Revenue, Office Expenses, Utilities, Transportation, Professional Services, Asset Purchase, Rent, Salaries, Marketing, Miscellaneous
5. Assign a confidence score (0.0-1.0) based on data clarity

Rules:
- Dates must be in YYYY-MM-DD format
- Amounts should be positive numbers (use type field to indicate direction)
- Include ALL transactions found
- If date is unclear, use the statement period or best estimate
- Type should be "income" for money coming in, "expense" for money going out

Respond ONLY with valid JSON in this exact format:
{
  "transactions": [
    {
      "date": "2026-03-15",
      "description": "Transaction description",
      "amount": 1234.56,
      "type": "expense",
      "category": "Office Expenses",
      "confidence": 0.95
    }
  ]
}`;

      const userPrompt = isTaxMode
        ? 'Extract all transactions AND calculate tax summary from the bank statement data above. Provide ONLY the JSON response with both "transactions" and "taxSummary" fields.'
        : 'Extract all transactions from the bank statement data above. Provide ONLY the JSON response.';

      const sanitizedContent = sanitizeForPrompt(fileContent.substring(0, 20000));

      const chatRes = await fetch('https://api.moonshot.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MOONSHOT_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'moonshot-v1-8k',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'system', content: sanitizedContent },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.3,
          max_tokens: 4000,
        }),
      });

      setUploadProgress(80);

      if (!chatRes.ok) {
        const err = await chatRes.json().catch(() => ({}));
        throw new Error(err.error?.message || `Chat API error: ${chatRes.status}`);
      }

      const chatData = await chatRes.json();
      const aiResponse = chatData.choices?.[0]?.message?.content;

      if (!aiResponse) {
        throw new Error('Empty response from AI');
      }

      // Extract JSON from response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Could not parse AI response - no JSON found');
      }

      const parsedData = JSON.parse(jsonMatch[0]);

      if (isExpenseMode && parsedData.transactions && Array.isArray(parsedData.transactions)) {
        setExtractedTransactions(parsedData.transactions);
      }

      if (isTaxMode && parsedData.taxSummary) {
        setTaxSummary(parsedData.taxSummary);
        if (onTaxDataExtracted) {
          onTaxDataExtracted(parsedData.taxSummary);
        }
      }

      if ((isExpenseMode && parsedData.transactions?.length > 0) || (isTaxMode && parsedData.taxSummary)) {
        setSuccess(true);
        if (onTransactionsExtracted && isExpenseMode && parsedData.transactions) {
          onTransactionsExtracted(parsedData.transactions);
        }
      } else {
        throw new Error('No valid data extracted from the statement');
      }

      setUploadProgress(100);
    } catch (err) {
      console.error('Error processing file:', err);
      setError(err instanceof Error ? err.message : 'Failed to process file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, []);

  const handleFile = (file: File) => {
    // Reset states
    setError(null);
    setSuccess(false);
    setExtractedTransactions([]);
    setUploadProgress(0);
    setShowPreview(false);

    // Validate file type
    const fileExtension = file.name.toLowerCase();
    const isValidType = 
      file.type === 'application/pdf' ||
      file.type === 'text/csv' ||
      file.type === 'application/vnd.ms-excel' ||
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.type === 'text/plain' ||
      fileExtension.endsWith('.pdf') ||
      fileExtension.endsWith('.csv') ||
      fileExtension.endsWith('.xls') ||
      fileExtension.endsWith('.xlsx') ||
      fileExtension.endsWith('.txt');

    if (!isValidType) {
      setError('Please upload a PDF, CSV, Excel, or text file containing your bank statement.');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size too large. Please upload a file smaller than 10MB.');
      return;
    }

    setIsUploading(true);
    processFileWithAI(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const clearFile = () => {
    setExtractedTransactions([]);
    setSuccess(false);
    setError(null);
    setUploadProgress(0);
    setShowPreview(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatAmount = (amount: number, type: string) => {
    const formatted = new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2
    }).format(amount);
    
    return type === 'income' ? `+${formatted}` : `-${formatted}`;
  };

  const isIdle = !isUploading && !success && !error && extractedTransactions.length === 0;

  return (
    <div className="space-y-3">
      {/* Compact Upload Area */}
      <div
        onClick={!isUploading ? handleClick : undefined}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl py-3 px-4 text-center cursor-pointer
          transition-all duration-300
          ${isDragging 
            ? 'border-primary bg-primary-container/10 scale-[1.02]' 
            : 'border-outline-variant/30 hover:border-primary/50 hover:bg-surface-container-low/50'
          }
          ${isUploading ? 'pointer-events-none opacity-70' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.csv,.xls,.xlsx,.txt"
          onChange={handleFileInput}
          className="hidden"
        />

        {isUploading ? (
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-primary animate-spin shrink-0" />
            <div className="flex-1 text-left">
              <p className="text-xs font-semibold text-on-surface">Processing bank statement...</p>
              <div className="mt-1 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-500 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
            <span className="text-xs text-on-surface-variant">{uploadProgress}%</span>
          </div>
        ) : success ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-tertiary shrink-0" />
              <p className="text-sm font-semibold text-on-surface">
                {extractedTransactions.length} transactions found
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearFile();
              }}
              className="text-xs text-primary hover:underline"
            >
              Clear
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <UploadCloud className="w-5 h-5 text-primary shrink-0" />
            <div className="text-left">
              <p className="text-xs font-semibold text-on-surface">Import Bank Statement</p>
              <p className="text-[10px] text-on-surface-variant">
                Drop PDF, CSV, or Excel here
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error Message - compact */}
      {error && (
        <div className="bg-error-container/30 border border-error/20 p-2.5 rounded-xl flex gap-2 items-start">
          <AlertTriangle className="text-error shrink-0 mt-0.5" size={14} />
          <p className="text-xs text-error flex-1">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="text-outline hover:text-on-surface"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Extracted Transactions Preview - compact */}
      {extractedTransactions.length > 0 && (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/15 overflow-hidden">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="w-full px-3 py-2 flex items-center justify-between hover:bg-surface-container-low transition-colors"
          >
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-on-surface text-xs">Extracted Transactions</h4>
              <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
                AI
              </span>
            </div>
            {showPreview ? <ChevronUp size={14} className="text-outline" /> : <ChevronDown size={14} className="text-outline" />}
          </button>
          
          {showPreview && (
            <>
              <div className="max-h-48 overflow-y-auto">
                <table className="w-full text-left">
                  <thead className="bg-surface-container-low text-[10px] text-on-surface-variant">
                    <tr>
                      <th className="px-3 py-1.5 font-semibold">Date</th>
                      <th className="px-3 py-1.5 font-semibold">Desc</th>
                      <th className="px-3 py-1.5 font-semibold text-right">Amt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10 text-xs">
                    {extractedTransactions.slice(0, 5).map((transaction, index) => (
                      <tr key={index} className="hover:bg-surface-container-low/50">
                        <td className="px-3 py-1.5 text-on-surface-variant">{transaction.date}</td>
                        <td className="px-3 py-1.5 font-medium text-on-surface truncate max-w-[100px]">
                          {transaction.description}
                        </td>
                        <td className={`px-3 py-1.5 text-right font-bold ${
                          transaction.type === 'income' ? 'text-tertiary' : 'text-on-surface'
                        }`}>
                          {formatAmount(transaction.amount, transaction.type)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {extractedTransactions.length > 5 && (
                  <div className="px-3 py-1.5 text-center text-[10px] text-on-surface-variant border-t border-outline-variant/10">
                    +{extractedTransactions.length - 5} more
                  </div>
                )}
              </div>
              <div className="px-3 py-2 border-t border-outline-variant/15 bg-surface-container-low">
                <button className="w-full bg-primary text-white py-2 rounded-lg font-semibold text-xs hover:opacity-90 transition-opacity">
                  Add All to Expenses
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
