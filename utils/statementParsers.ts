// This file defines bank statement formats and parsing logic

export interface BankFormat {
  name: string;
  datePattern?: RegExp;
  transactionPattern?: RegExp;
  headerRow?: string;
  pattern?: RegExp;
  parser?: (text: string) => { csv: string, json: any[] };
}

export interface Transaction {
  date: string;
  description: string;
  amount: number;
  type: string; // "debit" or "credit"
  balance?: number;
  reference?: string;
}

// Supported bank formats
export const BANK_FORMATS: { [key: string]: BankFormat } = {
  standard: {
    name: "Standard Bank",
    datePattern: /\d{2}\/\d{2}\/\d{4}/,
    transactionPattern: /(\d{2}\/\d{2}\/\d{4})\s+(.{15,}?)\s+(\-?\$?\d+\.\d{2})/,
    headerRow: "Date,Description,Amount,Type"
  },
  chase: {
    name: "Chase Bank",
    datePattern: /\d{2}\/\d{2}\/\d{2}/,
    transactionPattern: /(\d{2}\/\d{2}\/\d{2})\s+(.{10,}?)\s+(\-?\$?\d+\.\d{2})/,
    headerRow: "Date,Description,Amount,Type"
  },
  boa: {
    name: "Bank of America",
    datePattern: /\d{2}\/\d{2}\/\d{4}/,
    transactionPattern: /(\d{2}\/\d{2}\/\d{4})\s+(.{15,}?)\s+(\-?\$?\d+\.\d{2})/,
    headerRow: "Date,Description,Amount,Type"
  },
  wells: {
    name: "Wells Fargo",
    datePattern: /\d{2}\/\d{2}\/\d{2}/,
    transactionPattern: /(\d{2}\/\d{2}\/\d{2})\s+(.{10,}?)\s+(\-?\$?\d+\.\d{2})/,
    headerRow: "Date,Description,Amount,Type"
  },
  citi: {
    name: "Citibank",
    datePattern: /\d{2}\/\d{2}\/\d{2}/,
    transactionPattern: /(\d{2}\/\d{2}\/\d{2})\s+(.{10,}?)\s+(\-?\$?\d+\.\d{2})/,
    headerRow: "Date,Description,Amount,Type"
  },
  gtbank: {
    name: "GTBank",
    pattern: /Trans\.\s*Date\s*Value\s*Date\s*Reference\s*Debits\s*Credits\s*Balance\s*Originating\s*Branch\s*Remarks/i,
    parser: parseGTBankStatement
  },
};

/**
 * Parses GTBank statement format
 */
function parseGTBankStatement(text: string) {
  // Look for transactions in the preprocessed format (pipe-delimited)
  const rows = text.split('\n').filter(line => line.includes('|'));
  
  // Extract headers if in preprocessed format
  const headers = rows[0].split('|').map(h => h.trim());
  
  // Create array for transactions
  const transactions = [];
  
  // Process each transaction row
  for (let i = 1; i < rows.length; i++) {
    const cells = rows[i].split('|').map(cell => cell.trim());
    if (cells.length < 6) continue; // Skip invalid rows
    
    // Create transaction object
    const transaction = {
      transactionDate: cells[0],
      valueDate: cells[1],
      reference: cells[2],
      debit: cells[3] ? parseFloat(cells[3].replace(/,/g, '')) : null,
      credit: cells[4] ? parseFloat(cells[4].replace(/,/g, '')) : null,
      balance: parseFloat(cells[5].replace(/,/g, '')),
      branch: cells[6],
      remarks: cells[7],
      type: cells[3] ? 'debit' : 'credit',
      amount: cells[3] ? parseFloat(cells[3].replace(/,/g, '')) : parseFloat(cells[4].replace(/,/g, '')),
    };
    
    transactions.push(transaction);
  }
  
  // If preprocessed format wasn't detected, try to parse raw text
  if (transactions.length === 0) {
    // Add fallback parsing logic here for raw text
    // ...
  }
  
  // Generate CSV
  let csv = 'Transaction Date,Value Date,Reference,Type,Amount,Balance,Branch,Remarks\n';
  
  transactions.forEach(t => {
    csv += `${t.transactionDate},${t.valueDate},${t.reference},${t.type},${t.amount},${t.balance},${t.branch},"${t.remarks}"\n`;
  });
  
  return {
    csv,
    json: transactions
  };
}

/**
 * Parse a bank statement text into a structured CSV format
 * @param text The extracted text from a PDF bank statement
 * @param bankFormatKey The bank format to use for parsing
 * @returns Object containing CSV string and JSON data
 */
export function parseBankStatement(text: string, bankFormatKey: string = 'auto'): { csv: string, json: Transaction[] } {
  // Initialize with default format
  let bankFormat = BANK_FORMATS.standard;
  
  // Auto-detect bank format if needed
  if (bankFormatKey === 'auto') {
    // Simple detection based on patterns in the text
    for (const key of Object.keys(BANK_FORMATS)) {
      const format = BANK_FORMATS[key];
      const patternMatches = format.datePattern ? (text.match(format.datePattern) || []).length : 0;
      if (patternMatches > 5) {  // If we find multiple date matches in this format
        bankFormat = format;
        break;
      }
    }
  } else if (BANK_FORMATS[bankFormatKey]) {
    bankFormat = BANK_FORMATS[bankFormatKey];
  }
  
  // Parse transactions from text
  const transactions: Transaction[] = [];
  const lines = text.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check if transactionPattern exists before using it
    if (!bankFormat.transactionPattern) continue;
    
    const match = line.match(bankFormat.transactionPattern);
    
    if (match) {
      const [_, date, description, amountStr] = match;
      const amount = parseFloat(amountStr.replace(/[\$,]/g, ''));
      
      // Determine if credit or debit based on amount
      const type = amount < 0 ? "debit" : "credit";
      
      // Try to find balance in the next few lines
      let balance = undefined;
      for (let j = 1; j <= 3 && i + j < lines.length; j++) {
        const nextLine = lines[i + j].trim();
        const balanceMatch = nextLine.match(/balance[:\s]+[\$]?(\d+,?\d+\.\d{2})/i);
        if (balanceMatch) {
          balance = parseFloat(balanceMatch[1].replace(/[\$,]/g, ''));
          break;
        }
      }
      
      // Add to transactions list
      transactions.push({
        date,
        description: description.trim(),
        amount: Math.abs(amount),
        type,
        balance
      });
    }
  }
  
  // Generate CSV
  let csvContent = bankFormat.headerRow + '\n';
  transactions.forEach(tx => {
    csvContent += `${tx.date},"${tx.description.replace(/"/g, '""')}",${tx.amount.toFixed(2)},${tx.type}\n`;
  });
  
  return { csv: csvContent, json: transactions };
}

/**
 * Default parser as a fallback
 */
function parseDefaultFormat(text: string) {
  // Simple CSV with just the extracted text
  const csv = 'Text\n' + text.replace(/,/g, ' ').replace(/\n/g, '\\n');
  
  return {
    csv,
    json: [{fullText: text}]
  };
}
