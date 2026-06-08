import Dexie, { Table } from 'dexie';
import type { BusinessProfile } from './validation';

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  status: 'verified' | 'review' | 'high-confidence';
  type: 'income' | 'expense';
  createdAt: Date;
}

export interface Receipt {
  id: string;
  vendor: string;
  date: string;
  amount: number;
  category: string;
  items?: string[];
  confidence: number;
  imageData?: string;
  createdAt: Date;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  items: Array<{ description: string; quantity: number; rate: number }>;
  createdAt: Date;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  salary: number;
  department: string;
  startDate: string;
  createdAt: Date;
}

export interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  changes: Record<string, unknown>;
  timestamp: Date;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

class TaxDatabase extends Dexie {
  profiles!: Table<BusinessProfile>;
  transactions!: Table<Transaction>;
  receipts!: Table<Receipt>;
  invoices!: Table<Invoice>;
  employees!: Table<Employee>;
  auditLogs!: Table<AuditLog>;
  chatMessages!: Table<ChatMessage>;

  constructor() {
    super('TaxFYPDB');
    this.version(1).stores({
      profiles: '++id',
      transactions: '++id, date, category, status',
      receipts: '++id, date, category',
      invoices: '++id, status, dueDate',
      employees: '++id, department',
      auditLogs: '++id, timestamp, entity',
      chatMessages: '++id, timestamp',
    });
  }
}

export const db = new TaxDatabase();

// Data export
export async function exportAllData(): Promise<string> {
  const data = {
    profiles: await db.profiles.toArray(),
    transactions: await db.transactions.toArray(),
    receipts: await db.receipts.toArray(),
    invoices: await db.invoices.toArray(),
    employees: await db.employees.toArray(),
    auditLogs: await db.auditLogs.toArray(),
    chatMessages: await db.chatMessages.toArray(),
    exportedAt: new Date().toISOString(),
    version: 1,
  };
  return JSON.stringify(data, null, 2);
}

// Data import
export async function importAllData(jsonString: string): Promise<void> {
  const data = JSON.parse(jsonString);
  
  if (!data.version || data.version !== 1) {
    throw new Error('Invalid backup file version');
  }

  await db.transaction('rw', 
    [db.profiles, db.transactions, db.receipts, db.invoices, db.employees, db.auditLogs, db.chatMessages],
    async () => {
      if (data.profiles) await db.profiles.bulkPut(data.profiles);
      if (data.transactions) await db.transactions.bulkPut(data.transactions);
      if (data.receipts) await db.receipts.bulkPut(data.receipts);
      if (data.invoices) await db.invoices.bulkPut(data.invoices);
      if (data.employees) await db.employees.bulkPut(data.employees);
      if (data.auditLogs) await db.auditLogs.bulkPut(data.auditLogs);
      if (data.chatMessages) await db.chatMessages.bulkPut(data.chatMessages);
    }
  );
}

// Audit logging
export async function logAudit(action: string, entity: string, entityId: string, changes: Record<string, unknown>): Promise<void> {
  await db.auditLogs.add({
    id: crypto.randomUUID(),
    action,
    entity,
    entityId,
    changes,
    timestamp: new Date(),
  });
}
