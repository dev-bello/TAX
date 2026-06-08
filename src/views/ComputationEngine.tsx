import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, AlertTriangle, CheckCircle2, FileText, Loader2, ArrowRight } from 'lucide-react';
import HelpTooltip from '../components/HelpTooltip';
import BankStatementUploader from '../components/BankStatementUploader';
import { useToast } from '../components/Toast';
import type { TaxSummary } from '../components/BankStatementUploader';

// Format number with commas
const formatNumber = (value: string): string => {
  const num = value.replace(/[^\d]/g, '');
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const parseNumber = (value: string): number => {
  return parseInt(value.replace(/[^\d]/g, ''), 10) || 0;
};

interface TaxResult {
  totalProfit: number;
  deductions: number;
  taxableProfit: number;
  taxRate: number;
  taxLiability: number;
  tetFundLiability: number;
  totalLiability: number;
  effectiveRate: number;
}

const TAX_TABS = [
  { id: 'CIT', label: 'Company Tax (CIT)', description: 'Tax on business profits' },
  { id: 'PAYE', label: 'Employee Tax (PAYE)', description: 'Tax on employee salaries' },
  { id: 'VAT', label: 'Value Added Tax (VAT)', description: 'Tax on goods and services' },
  { id: 'Levy', label: 'Development Levy', description: 'Education infrastructure tax' },
];

export default function ComputationEngine() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('CIT');
  const [showUploader, setShowUploader] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<TaxResult | null>(null);
  const [extractionMode, setExtractionMode] = useState<'transactions' | 'tax'>('tax');
  
  // Form state
  const [taxableIncome, setTaxableIncome] = useState('');
  const [deductibleExpenses, setDeductibleExpenses] = useState('');
  const [assetDepreciation, setAssetDepreciation] = useState('');
  const [taxRate, setTaxRate] = useState('');

  // PAYE state
  const [annualSalary, setAnnualSalary] = useState('');
  const [numEmployees, setNumEmployees] = useState('');

  // VAT state
  const [vatSales, setVatSales] = useState('');
  const [vatPurchases, setVatPurchases] = useState('');
  
  // Validation state
  const [validations, setValidations] = useState<Record<string, { isValid: boolean; message: string; type: 'error' | 'warning' | 'info' }>>({});
  const [showValidation, setShowValidation] = useState(false);

  // Auto-calculate when inputs change
  useEffect(() => {
    const timer = setTimeout(() => {
      let hasInput = false;
      
      if (activeTab === 'CIT') {
        hasInput = parseNumber(taxableIncome) > 0;
      } else if (activeTab === 'PAYE') {
        hasInput = parseNumber(annualSalary) > 0 && parseInt(numEmployees) > 0;
      } else if (activeTab === 'VAT') {
        hasInput = parseNumber(vatSales) > 0;
      } else if (activeTab === 'Levy') {
        hasInput = parseNumber(taxableIncome) > 0;
      }
      
      if (hasInput) {
        calculateTax(true);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [activeTab, taxableIncome, deductibleExpenses, assetDepreciation, taxRate, annualSalary, numEmployees, vatSales, vatPurchases]);

  const validateInput = useCallback((field: string, value: string): { isValid: boolean; message: string; type: 'error' | 'warning' | 'info' } => {
    const numValue = parseNumber(value);
    
    switch (field) {
      case 'taxableIncome':
        if (numValue === 0) return { isValid: false, message: 'Please enter your taxable income', type: 'error' };
        if (numValue < 100000) return { isValid: true, message: 'This seems low for a business. Did you mean to include more revenue?', type: 'warning' };
        if (numValue > 1000000000) return { isValid: true, message: `₦${(numValue / 1000000).toFixed(0)}M is very high. Please double-check.`, type: 'warning' };
        return { isValid: true, message: '', type: 'info' };
      case 'deductibleExpenses':
        const income = parseNumber(taxableIncome);
        if (numValue > income * 0.9) return { isValid: true, message: `Expenses are ${((numValue / income) * 100).toFixed(0)}% of income. NRS may question this.`, type: 'warning' };
        if (numValue > income) return { isValid: false, message: 'Expenses cannot exceed income.', type: 'error' };
        return { isValid: true, message: '', type: 'info' };
      case 'assetDepreciation':
        if (numValue > parseNumber(taxableIncome) * 0.5) return { isValid: true, message: 'High depreciation. Ensure you have asset receipts.', type: 'warning' };
        return { isValid: true, message: '', type: 'info' };
      default:
        return { isValid: true, message: '', type: 'info' };
    }
  }, [taxableIncome]);

  const handleInputChange = (field: string, value: string, setter: (val: string) => void) => {
    const formatted = formatNumber(value);
    setter(formatted);
    setTimeout(() => {
      const validation = validateInput(field, formatted);
      setValidations(prev => ({ ...prev, [field]: validation }));
      setShowValidation(true);
    }, 500);
  };

  const calculateTax = (silent = false) => {
    setIsCalculating(true);
    setShowValidation(true);
    
    // Simulate calculation delay
    setTimeout(() => {
      let newResult: TaxResult;
      
      if (activeTab === 'CIT') {
        const income = parseNumber(taxableIncome);
        const expenses = parseNumber(deductibleExpenses);
        const depreciation = parseNumber(assetDepreciation);
        const rate = parseInt(taxRate) || 30;
        
        const totalProfit = income;
        const deductions = expenses + depreciation;
        const taxableProfit = Math.max(0, totalProfit - deductions);
        const taxLiability = taxableProfit * (rate / 100);
        const tetFund = (income >= 25000000) ? taxableProfit * 0.02 : 0;
        
        newResult = {
          totalProfit,
          deductions,
          taxableProfit,
          taxRate: rate,
          taxLiability,
          tetFundLiability: tetFund,
          totalLiability: taxLiability + tetFund,
          effectiveRate: totalProfit > 0 ? ((taxLiability + tetFund) / totalProfit) * 100 : 0,
        };
      } else if (activeTab === 'PAYE') {
        const salary = parseNumber(annualSalary);
        const employees = parseInt(numEmployees) || 1;
        const annualTaxPerEmployee = salary * 0.15; // Simplified PAYE ~15%
        const totalLiability = annualTaxPerEmployee * employees;
        
        newResult = {
          totalProfit: salary * employees,
          deductions: 0,
          taxableProfit: salary * employees,
          taxRate: 15,
          taxLiability: totalLiability,
          tetFundLiability: 0,
          totalLiability,
          effectiveRate: 15,
        };
      } else if (activeTab === 'VAT') {
        const sales = parseNumber(vatSales);
        const purchases = parseNumber(vatPurchases);
        const vatOutput = sales * 0.075;
        const vatInput = purchases * 0.075;
        const netVat = Math.max(0, vatOutput - vatInput);
        
        newResult = {
          totalProfit: sales,
          deductions: purchases,
          taxableProfit: sales - purchases,
          taxRate: 7.5,
          taxLiability: netVat,
          tetFundLiability: 0,
          totalLiability: netVat,
          effectiveRate: sales > 0 ? (netVat / sales) * 100 : 0,
        };
      } else {
        // Development Levy
        const income = parseNumber(taxableIncome);
        const rate = income >= 25000000 ? 2 : 0;
        const levy = income * (rate / 100);
        
        newResult = {
          totalProfit: income,
          deductions: 0,
          taxableProfit: income,
          taxRate: rate,
          taxLiability: levy,
          tetFundLiability: 0,
          totalLiability: levy,
          effectiveRate: rate,
        };
      }
      
      setResult(newResult);
      setIsCalculating(false);
      if (!silent) {
        addToast(`Tax calculated successfully! Total liability: ₦${(newResult.totalLiability / 1000000).toFixed(2)}M`, 'success');
      }
    }, 800);
  };

  const handleTransactionsExtracted = (transactions: any[]) => {
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    setTaxableIncome(formatNumber(income.toString()));
    setDeductibleExpenses(formatNumber(expenses.toString()));
    setShowUploader(false);
    addToast('Bank statement parsed successfully!', 'success');
    
    setTimeout(() => {
      setValidations({
        taxableIncome: validateInput('taxableIncome', income.toString()),
        deductibleExpenses: validateInput('deductibleExpenses', expenses.toString())
      });
      setShowValidation(true);
    }, 100);
  };

  const handleTaxDataExtracted = (taxSummary: TaxSummary) => {
    setTaxableIncome(formatNumber(Math.round(taxSummary.totalRevenue).toString()));
    setDeductibleExpenses(formatNumber(Math.round(taxSummary.totalExpenses).toString()));
    setAssetDepreciation(formatNumber(Math.round(taxSummary.assetPurchases * 0.25).toString()));
    setTaxRate(taxSummary.estimatedTaxRate.toString());
    setShowUploader(false);
    addToast(
      `Tax data extracted! Revenue: ₦${(taxSummary.totalRevenue / 1000000).toFixed(1)}M, Rate: ${taxSummary.estimatedTaxRate}%`,
      'success'
    );
    
    setTimeout(() => {
      setValidations({
        taxableIncome: validateInput('taxableIncome', taxSummary.totalRevenue.toString()),
        deductibleExpenses: validateInput('deductibleExpenses', taxSummary.totalExpenses.toString()),
      });
      setShowValidation(true);
    }, 100);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);
  };

  const renderForm = () => {
    switch (activeTab) {
      case 'CIT':
        return (
          <>
            <h2 className="text-xl md:text-2xl font-bold mb-6 md:mb-8">Company Income Tax (CIT)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 md:gap-x-12 gap-y-8 md:gap-y-10">
              <div className="relative group">
                <label className="block text-sm font-semibold text-on-surface-variant mb-2">
                  <HelpTooltip term="Taxable Income" explanation="This is your business profit after deducting all allowable expenses. Think of it as: Money In - Money Out = What the government taxes you on. Enter your annual profit here." />
                </label>
                <div className="relative">
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 text-xl font-bold text-outline">₦</span>
                  <input type="text" value={taxableIncome} onChange={(e) => handleInputChange('taxableIncome', e.target.value, setTaxableIncome)}
                    className={`w-full bg-transparent border-0 border-b-2 pl-8 py-3 md:py-3 md:py-2 text-xl md:text-2xl font-bold transition-colors focus:outline-none min-h-touch min-h-touch ${showValidation && validations.taxableIncome?.type === 'error' ? 'border-error text-error focus:border-error' : showValidation && validations.taxableIncome?.type === 'warning' ? 'border-tertiary text-tertiary focus:border-tertiary' : 'border-outline-variant text-on-surface focus:border-primary'}`} />
                </div>
                {showValidation && validations.taxableIncome?.message && (
                  <div className={`flex items-start gap-2 mt-2 text-xs ${validations.taxableIncome.type === 'error' ? 'text-error' : 'text-tertiary'}`}>
                    {validations.taxableIncome.type === 'error' ? <AlertTriangle size={14} className="shrink-0 mt-0.5" /> : <CheckCircle2 size={14} className="shrink-0 mt-0.5" />}
                    <span>{validations.taxableIncome.message}</span>
                  </div>
                )}
              </div>

              <div className="relative group">
                <label className="block text-sm font-semibold text-on-surface-variant mb-2">
                  <HelpTooltip term="Deductible Expenses" explanation="Money you spent running your business that reduces your tax. Examples: office rent, salaries, fuel, internet bills, professional fees. Basically, all legitimate costs of doing business." />
                </label>
                <div className="relative">
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 text-xl font-bold text-outline">₦</span>
                  <input type="text" value={deductibleExpenses} onChange={(e) => handleInputChange('deductibleExpenses', e.target.value, setDeductibleExpenses)}
                    className={`w-full bg-transparent border-0 border-b-2 pl-8 py-3 md:py-3 md:py-2 text-xl md:text-2xl font-bold transition-colors focus:outline-none min-h-touch min-h-touch ${showValidation && validations.deductibleExpenses?.type === 'error' ? 'border-error text-error focus:border-error' : showValidation && validations.deductibleExpenses?.type === 'warning' ? 'border-tertiary text-tertiary focus:border-tertiary' : 'border-outline-variant text-on-surface focus:border-primary'}`} />
                </div>
                {showValidation && validations.deductibleExpenses?.message && (
                  <div className={`flex items-start gap-2 mt-2 text-xs ${validations.deductibleExpenses.type === 'error' ? 'text-error' : 'text-tertiary'}`}>
                    {validations.deductibleExpenses.type === 'error' ? <AlertTriangle size={14} className="shrink-0 mt-0.5" /> : <CheckCircle2 size={14} className="shrink-0 mt-0.5" />}
                    <span>{validations.deductibleExpenses.message}</span>
                  </div>
                )}
              </div>

              <div className="relative group">
                <label className="block text-sm font-semibold text-on-surface-variant mb-2">
                  <HelpTooltip term="Asset Depreciation" explanation="When you buy expensive items like laptops or machinery, you can't deduct the full cost immediately. Instead, you deduct a portion each year (usually 25% in Nigeria). This gradual deduction is called depreciation." />
                </label>
                <div className="relative">
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 text-xl font-bold text-outline">₦</span>
                  <input type="text" value={assetDepreciation} onChange={(e) => handleInputChange('assetDepreciation', e.target.value, setAssetDepreciation)}
                    className={`w-full bg-transparent border-0 border-b-2 pl-8 py-3 md:py-2 text-xl md:text-2xl font-bold transition-colors focus:outline-none min-h-touch ${showValidation && validations.assetDepreciation?.type === 'warning' ? 'border-tertiary text-tertiary focus:border-tertiary' : 'border-outline-variant text-on-surface focus:border-primary'}`} />
                </div>
                {showValidation && validations.assetDepreciation?.message && (
                  <div className="flex items-start gap-2 mt-2 text-xs text-tertiary">
                    <CheckCircle2 size={14} className="shrink-0 mt-0.5" />
                    <span>{validations.assetDepreciation.message}</span>
                  </div>
                )}
              </div>

              <div className="relative group">
                <label className="block text-sm font-semibold text-on-surface-variant mb-2 flex items-center gap-2">
                  <HelpTooltip term="Tax Rate" explanation="The percentage of your profit that goes to the government as tax. Your rate depends on your company size: Small companies (under ₦25M revenue) pay 0%, Medium (₦25M-₦100M) pay 20%, Large (over ₦100M) pay 30%." />
                </label>
                <div className="relative">
                  <input type="text" value={taxRate} onChange={(e) => setTaxRate(e.target.value.replace(/[^\d]/g, ''))}
                    className="w-full bg-transparent border-0 border-b-2 border-outline-variant focus:border-primary focus:ring-0 py-2 text-xl md:text-2xl font-bold text-on-surface transition-colors focus:outline-none" />
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 text-xl font-bold text-outline">%</span>
                </div>
              </div>
            </div>
          </>
        );
      case 'PAYE':
        return (
          <>
            <h2 className="text-xl md:text-2xl font-bold mb-6 md:mb-8">Employee Tax (PAYE)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 md:gap-x-12 gap-y-8 md:gap-y-10">
              <div className="relative group">
                <label className="block text-sm font-semibold text-on-surface-variant mb-2">Annual Salary per Employee</label>
                <div className="relative">
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 text-xl font-bold text-outline">₦</span>
                  <input type="text" value={annualSalary} onChange={(e) => setAnnualSalary(formatNumber(e.target.value))}
                    className="w-full bg-transparent border-0 border-b-2 border-outline-variant focus:border-primary pl-8 py-2 text-xl md:text-2xl font-bold text-on-surface transition-colors focus:outline-none" />
                </div>
              </div>
              <div className="relative group">
                <label className="block text-sm font-semibold text-on-surface-variant mb-2">Number of Employees</label>
                <input type="text" value={numEmployees} onChange={(e) => setNumEmployees(e.target.value.replace(/[^\d]/g, ''))}
                  className="w-full bg-transparent border-0 border-b-2 border-outline-variant focus:border-primary py-2 text-xl md:text-2xl font-bold text-on-surface transition-colors focus:outline-none" />
              </div>
            </div>
          </>
        );
      case 'VAT':
        return (
          <>
            <h2 className="text-xl md:text-2xl font-bold mb-6 md:mb-8">Value Added Tax (VAT)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 md:gap-x-12 gap-y-8 md:gap-y-10">
              <div className="relative group">
                <label className="block text-sm font-semibold text-on-surface-variant mb-2">Total Sales (VAT-inclusive)</label>
                <div className="relative">
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 text-xl font-bold text-outline">₦</span>
                  <input type="text" value={vatSales} onChange={(e) => setVatSales(formatNumber(e.target.value))}
                    className="w-full bg-transparent border-0 border-b-2 border-outline-variant focus:border-primary pl-8 py-2 text-xl md:text-2xl font-bold text-on-surface transition-colors focus:outline-none" />
                </div>
              </div>
              <div className="relative group">
                <label className="block text-sm font-semibold text-on-surface-variant mb-2">Total Purchases (VAT-inclusive)</label>
                <div className="relative">
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 text-xl font-bold text-outline">₦</span>
                  <input type="text" value={vatPurchases} onChange={(e) => setVatPurchases(formatNumber(e.target.value))}
                    className="w-full bg-transparent border-0 border-b-2 border-outline-variant focus:border-primary pl-8 py-2 text-xl md:text-2xl font-bold text-on-surface transition-colors focus:outline-none" />
                </div>
              </div>
            </div>
          </>
        );
      case 'Levy':
        return (
          <>
            <h2 className="text-xl md:text-2xl font-bold mb-6 md:mb-8">Development Levy</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 md:gap-x-12 gap-y-8 md:gap-y-10">
              <div className="relative group">
                <label className="block text-sm font-semibold text-on-surface-variant mb-2">Annual Revenue</label>
                <div className="relative">
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 text-xl font-bold text-outline">₦</span>
                  <input type="text" value={taxableIncome} onChange={(e) => handleInputChange('taxableIncome', e.target.value, setTaxableIncome)}
                    className="w-full bg-transparent border-0 border-b-2 border-outline-variant focus:border-primary pl-8 py-2 text-xl md:text-2xl font-bold text-on-surface transition-colors focus:outline-none" />
                </div>
              </div>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-on-surface tracking-tight mb-2">Tax Calculator</h1>
        <p className="text-on-surface-variant text-base md:text-lg">Precise tax calculation based on current Nigerian tax law.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Form Area */}
        <div className="flex-1" data-tour="calculator">
          {/* Tabs */}
          <div className="flex gap-1.5 lg:gap-2 mb-8 bg-surface-container-low p-1.5 rounded-2xl overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-1.5">
            {TAX_TABS.map(tab => (
              <button key={tab.id} onClick={() => { setActiveTab(tab.id); setResult(null); }}
                className={`flex-shrink-0 px-4 lg:px-6 py-3 lg:py-2.5 rounded-xl font-semibold transition-all text-sm lg:text-sm whitespace-nowrap min-h-touch touch-manipulation ${activeTab === tab.id ? 'bg-surface-container-lowest text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="bg-surface-container-lowest p-4 md:p-8 rounded-3xl shadow-taxfyp border border-outline-variant/15" data-tour="smart-validation">
            <div className="mb-6 p-4 bg-primary-container/10 rounded-2xl border border-primary/20">
              <p className="text-sm text-on-surface-variant">
                <strong className="text-primary">New to taxes?</strong> This calculator helps you estimate your {TAX_TABS.find(t => t.id === activeTab)?.description}. Just enter your numbers below and we'll do the math.
              </p>
            </div>

            {/* Upload Bank Statement Button */}
            {activeTab === 'CIT' && (
              <div className="mb-8" data-tour="bank-upload">
                <button onClick={() => setShowUploader(!showUploader)} className="flex items-center gap-2 text-primary font-semibold hover:underline">
                  <FileText size={18} />
                  {showUploader ? 'Hide Upload' : 'Upload Bank Statement Instead'}
                </button>
                <p className="text-xs text-on-surface-variant mt-1">Don't know these numbers? Upload your bank statement and we'll extract them automatically.</p>
              </div>
            )}

            {/* Bank Statement Uploader */}
            {showUploader && activeTab === 'CIT' && (
              <div className="mb-8 p-6 bg-surface-container-low rounded-2xl border border-outline-variant/20">
                <div className="mb-4">
                  <p className="text-sm font-semibold text-on-surface mb-2">Extract Mode</p>
                  <div className="flex bg-surface-container-high p-1 rounded-xl">
                    <button
                      onClick={() => setExtractionMode('transactions')}
                      className={`flex-1 py-2 rounded-lg font-semibold text-sm transition-all ${extractionMode === 'transactions' ? 'bg-surface-container-lowest shadow-sm text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`}
                    >
                      Expenses Only
                    </button>
                    <button
                      onClick={() => setExtractionMode('tax')}
                      className={`flex-1 py-2 rounded-lg font-semibold text-sm transition-all ${extractionMode === 'tax' ? 'bg-surface-container-lowest shadow-sm text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`}
                    >
                      Tax Summary
                    </button>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-2">
                    {extractionMode === 'transactions'
                      ? 'Extract individual transactions for expense tracking'
                      : 'Extract total revenue, expenses, and estimated tax rate directly'}
                  </p>
                </div>
                <BankStatementUploader
                  onTransactionsExtracted={extractionMode === 'transactions' ? handleTransactionsExtracted : undefined}
                  onTaxDataExtracted={extractionMode === 'tax' ? handleTaxDataExtracted : undefined}
                  extractionMode={extractionMode === 'transactions' ? 'expenses' : 'tax'}
                />
              </div>
            )}
            
            {renderForm()}

            <div className="mt-12 flex flex-col sm:flex-row justify-end gap-3">
              <button onClick={() => {
                setTaxableIncome(''); setDeductibleExpenses(''); setAssetDepreciation(''); setTaxRate('');
                setAnnualSalary(''); setNumEmployees(''); setVatSales(''); setVatPurchases('');
                setValidations({}); setResult(null);
              }} className="w-full sm:w-auto bg-surface-container-low text-on-surface px-6 py-3 rounded-xl font-semibold hover:bg-surface-container-high transition-colors min-h-touch touch-manipulation">
                Clear
              </button>
              <button onClick={() => calculateTax()} disabled={isCalculating}
                className="w-full sm:w-auto premium-gradient text-white px-8 py-3 rounded-xl font-semibold shadow-taxfyp hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-touch touch-manipulation">
                {isCalculating ? <Loader2 size={20} className="animate-spin" /> : <Calculator size={20} />}
                {isCalculating ? 'Calculating...' : 'Calculate Tax'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-full lg:w-96">
          <div className="lg:sticky lg:top-28 space-y-6">
            <div className="premium-gradient rounded-3xl p-6 md:p-8 text-white shadow-taxfyp relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-bl-full -z-0"></div>
              <h3 className="text-white/80 font-semibold mb-2 relative z-10">Estimated Tax Owed</h3>
              <div className="text-4xl md:text-5xl font-extrabold mb-8 relative z-10">
                {result ? formatCurrency(result.totalLiability) : '₦0.00'}
              </div>
              
              {result && (
                <div className="space-y-4 relative z-10 text-sm">
                  <div className="flex justify-between items-center border-b border-white/20 pb-2">
                    <span className="text-white/80">Total Revenue/Sales</span>
                    <span className="font-semibold">{formatCurrency(result.totalProfit)}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/20 pb-2">
                    <span className="text-white/80">Deductions</span>
                    <span className="font-semibold">-{formatCurrency(result.deductions)}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/20 pb-2">
                    <span className="text-white/80">Taxable Amount</span>
                    <span className="font-semibold">{formatCurrency(result.taxableProfit)}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/20 pb-2">
                    <span className="text-white/80">Tax Rate</span>
                    <span className="font-semibold">{result.taxRate}%</span>
                  </div>
                  {result.tetFundLiability > 0 && (
                    <div className="flex justify-between items-center border-b border-white/20 pb-2">
                      <span className="text-white/80">TETFund (2%)</span>
                      <span className="font-semibold">{formatCurrency(result.tetFundLiability)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-white/80">Effective Rate</span>
                    <span className="font-semibold">{result.effectiveRate.toFixed(1)}%</span>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/20">
              <h4 className="font-bold text-on-surface mb-2">Need a tailored scenario?</h4>
              <p className="text-sm text-on-surface-variant mb-4">Use the Scenario Planner to see how investments affect your taxes.</p>
              <button onClick={() => navigate('/scenario')}
                className="w-full bg-surface-container-lowest border border-outline-variant/30 text-on-surface py-2 rounded-xl font-semibold hover:bg-surface-container-high transition-colors flex items-center justify-center gap-2">
                Open Planner <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
