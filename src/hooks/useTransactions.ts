import { useState, useEffect, useCallback } from 'react';
import {
  hygraphRequest,
  GET_TRANSACTIONS,
  CREATE_TRANSACTION,
  PUBLISH_TRANSACTION,
  DELETE_TRANSACTION,
} from '../lib/hygraph';

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  status: 'verified' | 'review' | 'high-confidence';
  type: 'income' | 'expense';
  confidence?: number;
  businessName?: string;
}

export function useTransactions(userId?: string, businessName?: string) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTransactions = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const result = await hygraphRequest(GET_TRANSACTIONS, { userId });
      const data = (result?.transactions || []).map((t: any) => ({
        id: t.id,
        date: t.date,
        description: t.description,
        amount: t.amount,
        category: t.category || 'Uncategorized',
        status: (t.status as Transaction['status']) || 'review',
        type: (t.type as Transaction['type']) || 'expense',
        confidence: t.confidence,
        businessName: t.businessName,
      }));
      setTransactions(data);
      setError(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load transactions';
      setError(msg);
      console.error('Hygraph transactions load error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadTransactions();
    } else {
      setIsLoading(false);
    }
  }, [userId, loadTransactions]);

  const addTransactions = useCallback(async (newTxs: Omit<Transaction, 'id'>[]) => {
    if (!userId) {
      console.error('No userId available for saving transactions');
      return;
    }

    const created: Transaction[] = [];

    for (const tx of newTxs) {
      try {
        const result = await hygraphRequest(CREATE_TRANSACTION, {
          userId,
          businessName: tx.businessName || businessName || 'Business',
          date: tx.date || new Date().toISOString().split('T')[0],
          description: tx.description || 'Transaction',
          amount: tx.amount || 0,
          type: tx.type || 'expense',
          category: tx.category || 'Uncategorized',
          confidence: tx.confidence ?? 0.5,
          status: tx.status || 'review',
        });
        if (result?.createTransaction?.id) {
          await hygraphRequest(PUBLISH_TRANSACTION, { id: result.createTransaction.id });
          created.push({ ...tx, id: result.createTransaction.id });
        }
      } catch (err) {
        console.error('Failed to create transaction:', err);
      }
    }

    setTransactions((prev) => [...created, ...prev]);
  }, [userId, businessName]);

  const deleteTransaction = useCallback(async (id: string) => {
    try {
      await hygraphRequest(DELETE_TRANSACTION, { id });
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error('Failed to delete transaction:', err);
    }
  }, []);

  const monthlyTotals = transactions.reduce((acc, t) => {
    const month = new Date(t.date).toLocaleString('en-NG', { month: 'short' });
    if (!acc[month]) acc[month] = { income: 0, expense: 0 };
    acc[month][t.type] += t.amount;
    return acc;
  }, {} as Record<string, { income: number; expense: number }>);

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0);
  const netProfit = totalIncome - totalExpense;

  return {
    transactions,
    isLoading,
    error,
    addTransactions,
    deleteTransaction,
    monthlyTotals,
    totalIncome,
    totalExpense,
    netProfit,
    loadTransactions,
  };
}
