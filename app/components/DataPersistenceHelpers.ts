/**
 * Helper functions for data persistence, synchronization, and backup
 */

import { InventoryItem, Transaction, Currency } from '../types/dataTypes';

export interface AppData {
  inventory: InventoryItem[];
  transactions: Transaction[];
  lastUpdated: string;
  version: string;
  selectedCurrency: string;
  settings?: Record<string, any>;
  clientId?: string;
  syncTimestamp?: string;
}

/**
 * Prepare data for storage by handling Date conversions
 */
export function prepareDataForStorage(
  inventory: InventoryItem[], 
  transactions: Transaction[],
  selectedCurrency: Currency
): AppData {
  return {
    inventory,
    transactions,
    lastUpdated: new Date().toISOString(),
    version: "1.0",
    selectedCurrency: selectedCurrency.code
  };
}

/**
 * Process data from storage by converting string dates back to Date objects
 */
export function processDataFromStorage(data: AppData): {
  inventory: InventoryItem[],
  transactions: Transaction[],
  selectedCurrencyCode: string
} {
  // Convert date strings back to Date objects for transactions
  const processedTransactions = data.transactions.map(transaction => ({
    ...transaction,
    date: new Date(transaction.date)
  }));
  
  // Convert date strings back to Date objects for inventory items
  const processedInventory = data.inventory.map(item => ({
    ...item,
    lastRestocked: new Date(item.lastRestocked)
  }));
  
  return {
    inventory: processedInventory,
    transactions: processedTransactions,
    selectedCurrencyCode: data.selectedCurrency
  };
}

/**
 * Generate a timestamp-based filename for exports
 */
export function generateExportFilename(): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `bookkeep-export-${timestamp}.json`;
}

/**
 * Utility to generate a unique ID for records
 */
export function generateUniqueId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validate imported data structure
 */
export function validateImportedData(data: any): boolean {
  return (
    data && 
    Array.isArray(data.inventory) && 
    Array.isArray(data.transactions) &&
    typeof data.version === 'string'
  );
}

/**
 * Future cloud sync preparation - placeholder
 */
export async function prepareDataForCloudSync(data: AppData): Promise<AppData> {
  // This would add additional metadata needed for cloud sync
  return {
    ...data,
    clientId: getClientId(),
    syncTimestamp: new Date().toISOString()
  };
}

/**
 * Generate or retrieve a unique client ID for this device/browser
 */
function getClientId(): string {
  let clientId = localStorage.getItem('bookkeep-client-id');
  
  if (!clientId) {
    clientId = `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('bookkeep-client-id', clientId);
  }
  
  return clientId;
}
