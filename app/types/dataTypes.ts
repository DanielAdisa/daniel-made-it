/**
 * Type definitions for BookKeep Pro application data
 */

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  lastRestocked: Date;
  sku: string;
  threshold?: number; // Alert threshold
  batches?: InventoryBatch[]; // Batch tracking
  history?: InventoryHistory[]; // History tracking
}

export interface InventoryBatch {
  id: string;
  quantity: number;
  costPrice: number;
  expiryDate: Date | null;
  manufactureDate: Date;
  batchNumber: string;
  createdAt: Date;
}

export interface InventoryHistory {
  id: string;
  date: Date;
  type: 'add' | 'remove' | 'adjust' | 'threshold-change' | 'expiry' | 'batch-add';
  quantity: number;
  batchId?: string;
  transactionId?: string;
  notes: string;
}

export interface Transaction {
  id: string;
  date: Date;
  description: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  relatedInventoryId?: string;
}

export interface InventoryFormData {
  name: string;
  category: string;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  sku: string;
}

export interface TransactionFormData {
  description: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  date: string;
  relatedInventoryId?: string;
}

export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export interface AppData {
  inventory: InventoryItem[];
  transactions: Transaction[];
  lastUpdated: string;
  version: string;
  selectedCurrency: string;
  clientId?: string;
  syncTimestamp?: string;
}
