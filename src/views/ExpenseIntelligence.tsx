import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, MoreHorizontal, BrainCircuit, Loader2, X, ChevronDown, ChevronUp, Pencil, Trash2, Eye } from 'lucide-react';
import BankStatementUploader from '../components/BankStatementUploader';
import { useToast } from '../components/Toast';
import HelpTooltip from '../components/HelpTooltip';

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  status: 'verified' | 'review' | 'high-confidence';
  type: 'expense';
}

const INITIAL_TRANSACTIONS: Transaction[] = [];

export default function ExpenseIntelligence() {
  const { addToast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [filter, setFilter] = useState<'all' | 'review'>('all');
  const [uploadedTransactions, setUploadedTransactions] = useState<any[]>([]);
  const [reviewingTransaction, setReviewingTransaction] = useState<Transaction | null>(null);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [showMatchingDetails, setShowMatchingDetails] = useState(false);

  const filteredTransactions = filter === 'all' 
    ? transactions 
    : transactions.filter(t => t.status === 'review');

  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
  const autoCategorized = Math.round(((transactions.length - transactions.filter(t => t.status === 'review').length) / transactions.length) * 100);
  const needsReview = transactions.filter(t => t.status === 'review').length;

  const handleTransactionsExtracted = (extracted: any[]) => {
    setUploadedTransactions(extracted);
    
    // Convert extracted bank transactions to our format
    const newTransactions: Transaction[] = extracted.map((t, i) => ({
      id: `uploaded-${Date.now()}-${i}`,
      date: t.date || 'Mar 20, 2026',
      description: t.description || 'Bank Transaction',
      amount: t.amount || 0,
      category: t.category || 'Uncategorized',
      status: (t.confidence && t.confidence > 0.8) ? 'verified' : 'review',
      type: 'expense',
    }));

    setTransactions(prev => [...newTransactions, ...prev]);
    addToast(`Added ${newTransactions.length} transactions from bank statement!`, 'success');
  };

  const handleReview = (transaction: Transaction) => {
    setReviewingTransaction(transaction);
    setActionMenuOpen(null);
  };

  const handleCategorize = (transactionId: string, category: string) => {
    setTransactions(prev => prev.map(t => 
      t.id === transactionId ? { ...t, category, status: 'verified' as const } : t
    ));
    setReviewingTransaction(null);
    addToast(`Transaction categorized as ${category}`, 'success');
  };

  const handleDelete = (transactionId: string) => {
    setTransactions(prev => prev.filter(t => t.id !== transactionId));
    setActionMenuOpen(null);
    addToast('Transaction removed', 'info');
  };

  const handleAddAllToExpenses = () => {
    addToast(`${uploadedTransactions.length} transactions added to expense records`, 'success');
    setUploadedTransactions([]);
  };

  const categories = ['Office Expenses', 'Utilities', 'Transportation', 'Meals', 'Professional Services', 'Asset Purchase', 'Marketing', 'Supplies', 'Miscellaneous'];

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-on-surface tracking-tight mb-2">Smart Expenses</h1>
        <p className="text-on-surface-variant text-base md:text-lg">AI-driven categorization and reconciliation for audit-proof records.</p>
      </div>

      <div className="grid grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-8">
        <div className="bg-surface-container-lowest p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-taxfyp border border-outline-variant/15">
          <div className="text-xs md:text-sm text-on-surface-variant font-medium mb-1"><HelpTooltip term="Total Spent" explanation="The total amount of money your business has spent this month across all categories." /></div>
          <div className="text-2xl md:text-3xl font-extrabold text-on-surface">₦{(totalSpent / 1000000).toFixed(1)}M</div>
        </div>
        <div className="bg-surface-container-lowest p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-taxfyp border border-outline-variant/15">
          <div className="text-xs md:text-sm text-on-surface-variant font-medium mb-1"><HelpTooltip term="Auto-Categorized" explanation="The percentage of expenses that our AI has automatically sorted into proper tax categories. Higher is better for tax filing." /></div>
          <div className="text-2xl md:text-3xl font-extrabold text-primary">{autoCategorized}%</div>
        </div>
        <div className="bg-surface-container-lowest p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-taxfyp border border-outline-variant/15">
          <div className="text-xs md:text-sm text-on-surface-variant font-medium mb-1"><HelpTooltip term="Needs Review" explanation="Expenses that our AI couldn't automatically categorize or that look unusual. You should review these to ensure they're properly classified for tax deductions." /></div>
          <div className="text-2xl md:text-3xl font-extrabold text-error">{needsReview}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Table Area */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-3xl shadow-taxfyp border border-outline-variant/15 overflow-hidden">
          <div className="p-4 md:p-6 border-b border-outline-variant/15 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-surface-container-lowest">
            <h2 className="text-lg md:text-xl font-bold text-on-surface">Recent Transactions</h2>
            <div className="flex gap-2">
              <button onClick={() => setFilter('all')} 
                className={`text-xs md:text-sm font-semibold px-3 md:px-4 py-1.5 rounded-lg transition-colors ${filter === 'all' ? 'text-primary bg-primary/10' : 'text-on-surface-variant hover:bg-surface-container-low'}`}>
                All
              </button>
              <button onClick={() => setFilter('review')} 
                className={`text-xs md:text-sm font-semibold px-3 md:px-4 py-1.5 rounded-lg transition-colors ${filter === 'review' ? 'text-error bg-error/10' : 'text-on-surface-variant hover:bg-surface-container-low'}`}>
                Needs Review
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant text-sm">
                  <th className="p-4 font-semibold">Date</th>
                  <th className="p-4 font-semibold">Description</th>
                  <th className="p-4 font-semibold">Amount</th>
                  <th className="p-4 font-semibold">AI Category</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="p-4 text-sm">{transaction.date}</td>
                    <td className="p-4 font-medium">{transaction.description}</td>
                    <td className="p-4 font-bold">₦{transaction.amount.toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`bg-surface-container-high px-3 py-1 rounded-md text-xs font-semibold ${transaction.category === 'Uncategorized' ? 'text-outline' : ''}`}>
                        {transaction.category}
                      </span>
                    </td>
                    <td className="p-4">
                      {transaction.status === 'verified' && (
                        <div className="flex items-center gap-1 text-primary text-sm font-medium">
                          <CheckCircle2 size={16} /> Auto-Verified
                        </div>
                      )}
                      {transaction.status === 'review' && (
                        <div className="flex items-center gap-1 text-error text-sm font-medium">
                          <AlertTriangle size={16} /> Needs Review
                        </div>
                      )}
                      {transaction.status === 'high-confidence' && (
                        <div className="flex items-center gap-1 text-tertiary text-sm font-medium">
                          <BrainCircuit size={16} /> High Confidence
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-right relative">
                      {transaction.status === 'review' ? (
                        <button onClick={() => handleReview(transaction)} 
                          className="bg-surface-container-lowest border border-outline-variant/30 px-3 py-1 rounded-lg text-xs font-bold hover:bg-surface-container-high transition-colors">
                          Review
                        </button>
                      ) : (
                        <div className="relative">
                          <button onClick={() => setActionMenuOpen(actionMenuOpen === transaction.id ? null : transaction.id)} 
                            className="p-1 text-outline hover:text-on-surface transition-colors">
                            <MoreHorizontal size={18} />
                          </button>
                          {actionMenuOpen === transaction.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setActionMenuOpen(null)} />
                              <div className="absolute right-0 top-full mt-1 w-40 bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant/20 z-20 py-1 animate-in fade-in zoom-in-95 duration-200">
                                <button onClick={() => { handleReview(transaction); }} 
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-on-surface hover:bg-surface-container-low transition-colors">
                                  <Pencil size={14} /> Edit
                                </button>
                                <button onClick={() => { addToast(`Viewing details for ${transaction.description}`, 'info'); setActionMenuOpen(null); }} 
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-on-surface hover:bg-surface-container-low transition-colors">
                                  <Eye size={14} /> View Details
                                </button>
                                <button onClick={() => handleDelete(transaction.id)} 
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-error hover:bg-error-container/10 transition-colors">
                                  <Trash2 size={14} /> Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-on-surface-variant">
                      {filter === 'review' ? 'No transactions need review!' : 'No transactions found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6" data-tour="expenses">
          {/* Bank Statement Upload */}
          <div className="bg-surface-container-lowest p-4 rounded-2xl shadow-taxfyp border border-outline-variant/15">
            <BankStatementUploader 
              onTransactionsExtracted={handleTransactionsExtracted}
            />
          </div>

          {uploadedTransactions.length > 0 && (
            <div className="bg-primary-container/10 border border-primary/20 p-4 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 size={18} className="text-primary" />
                <h4 className="font-bold text-primary text-sm">{uploadedTransactions.length} Transactions Ready</h4>
              </div>
              <p className="text-xs text-on-surface-variant mb-3">Review and add these to your expense records.</p>
              <button onClick={handleAddAllToExpenses}
                className="w-full bg-primary text-white py-2 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity">
                Add All to Expenses
              </button>
            </div>
          )}

          <div className="bg-primary-container/10 border border-primary/20 p-4 md:p-6 rounded-2xl md:rounded-3xl">
            <div className="flex items-center gap-3 mb-3 md:mb-4">
              <div className="p-1.5 md:p-2 bg-primary/20 rounded-lg text-primary">
                <BrainCircuit size={20} className="md:w-6 md:h-6" />
              </div>
              <h3 className="font-bold text-primary text-base md:text-lg">Smart Matching</h3>
            </div>
            <p className="text-xs md:text-sm text-on-surface-variant mb-4 md:mb-6">Our engine has matched 145 bank transactions to uploaded receipts with 98% confidence.</p>
            
            <div className="space-y-3 md:space-y-4">
              <div>
                <div className="flex justify-between text-xs md:text-sm font-semibold mb-1">
                  <span>Matched</span>
                  <span className="text-primary">145</span>
                </div>
                <div className="w-full bg-surface-container-high rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs md:text-sm font-semibold mb-1">
                  <span>Missing Receipts</span>
                  <span className="text-error">12</span>
                </div>
                <div className="w-full bg-surface-container-high rounded-full h-2">
                  <div className="bg-error h-2 rounded-full" style={{ width: '10%' }}></div>
                </div>
              </div>
            </div>

            <button onClick={() => setShowMatchingDetails(!showMatchingDetails)}
              className="w-full mt-4 md:mt-6 bg-surface-container-lowest text-primary py-2 md:py-2.5 rounded-xl font-semibold hover:bg-surface-container-high transition-colors shadow-sm text-sm md:text-base flex items-center justify-center gap-2">
              {showMatchingDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              {showMatchingDetails ? 'Hide Details' : 'View Details'}
            </button>

            {showMatchingDetails && (
              <div className="mt-4 p-3 bg-surface-container-low rounded-xl space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex justify-between text-xs">
                  <span className="text-on-surface-variant">Total Transactions</span>
                  <span className="font-medium">157</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-on-surface-variant">With Receipts</span>
                  <span className="font-medium text-primary">145</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-on-surface-variant">Missing Receipts</span>
                  <span className="font-medium text-error">12</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-on-surface-variant">Confidence Score</span>
                  <span className="font-medium text-tertiary">98%</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {reviewingTransaction && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setReviewingTransaction(null)}>
          <div className="bg-surface-container-lowest rounded-3xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-on-surface">Review Transaction</h3>
              <button onClick={() => setReviewingTransaction(null)} className="p-1 rounded-lg hover:bg-surface-container-low text-outline">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Description</span>
                <span className="font-medium text-on-surface">{reviewingTransaction.description}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Amount</span>
                <span className="font-medium text-on-surface">₦{reviewingTransaction.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Date</span>
                <span className="font-medium text-on-surface">{reviewingTransaction.date}</span>
              </div>
            </div>

            <p className="text-sm font-semibold text-on-surface mb-3">Select Category:</p>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {categories.map(cat => (
                <button key={cat} onClick={() => handleCategorize(reviewingTransaction.id, cat)}
                  className={`p-2.5 rounded-xl text-xs font-medium transition-colors ${
                    reviewingTransaction.category === cat 
                      ? 'bg-primary text-white' 
                      : 'bg-surface-container-low text-on-surface hover:bg-surface-container-high'
                  }`}>
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setReviewingTransaction(null)} 
                className="flex-1 py-2.5 rounded-xl font-semibold text-on-surface-variant hover:bg-surface-container-low transition-colors border border-outline-variant/30">
                Cancel
              </button>
              <button onClick={() => handleDelete(reviewingTransaction.id)} 
                className="flex-1 py-2.5 rounded-xl font-semibold text-error hover:bg-error-container/10 transition-colors border border-error/30">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
