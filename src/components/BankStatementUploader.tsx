import React, { useState, useRef, useCallback } from 'react';
import { UploadCloud, FileText, X, Loader2, CheckCircle2, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

interface Transaction {
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category?: string;
  confidence?: number;
}

interface BankStatementUploaderProps {
  onTransactionsExtracted?: (transactions: Transaction[]) => void;
  apiKey?: string;
}

// Moonshot AI API endpoint
const MOONSHOT_API_URL = 'https://api.moonshot.ai/v1/chat/completions';

export default function BankStatementUploader({ onTransactionsExtracted, apiKey }: BankStatementUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [extractedTransactions, setExtractedTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use provided API key, environment variable, or fall back to hardcoded one
  const MOONSHOT_API_KEY = apiKey || process.env.MOONSHOT_API_KEY || 'sk-Ox9DhWOCgmu6eCduQtehi26xKuRlhmgAT6s8oD4NfNJ4npEZ';

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFileWithAI = async (file: File) => {
    try {
      // Read file content
      const fileContent = await file.text();
      
      setUploadProgress(30);

      // Create system prompt for transaction extraction
      const systemPrompt = `You are a financial data extraction specialist. Analyze bank statement data and extract all transactions into structured JSON format.

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

      const userPrompt = `Extract all transactions from this bank statement data:

${fileContent.substring(0, 15000)} ${fileContent.length > 15000 ? '... (truncated for length)' : ''}

Provide the transactions in the specified JSON format.`;

      setUploadProgress(50);

      const response = await fetch(MOONSHOT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MOONSHOT_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'moonshot-v1-8k',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: userPrompt
            }
          ],
          temperature: 0.3,
          max_tokens: 4000,
        }),
      });

      setUploadProgress(70);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices?.[0]?.message?.content;

      if (!aiResponse) {
        throw new Error('Empty response from AI');
      }

      setUploadProgress(80);

      // Extract JSON from response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Could not parse AI response - no JSON found');
      }

      const parsedData = JSON.parse(jsonMatch[0]);
      
      if (parsedData.transactions && Array.isArray(parsedData.transactions)) {
        setExtractedTransactions(parsedData.transactions);
        setSuccess(true);
        
        if (onTransactionsExtracted) {
          onTransactionsExtracted(parsedData.transactions);
        }
      } else {
        throw new Error('Invalid transaction data format - expected "transactions" array');
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
    const validTypes = [
      'application/pdf',
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain'
    ];

    const fileExtension = file.name.toLowerCase();
    const isValidType = validTypes.includes(file.type) || 
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
