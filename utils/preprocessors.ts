/**
 * Preprocesses raw GTBank statement text to ensure consistent formatting
 * for better parsing
 */
export function preprocessGTBankStatement(text: string): string {
  // First, normalize whitespace and newlines
  let preprocessed = text.replace(/\s+/g, ' ').trim();
  
  // Look for transaction table headers
  const headerPattern = /Trans\.\s*Date\s*Value\s*Date\s*Reference\s*Debits\s*Credits\s*Balance\s*Originating\s*Branch\s*Remarks/g;
  
  // Find and standardize transaction rows
  const transactionPattern = /(\d{2}-\w{3}-\d{4})\s+(\d{2}-\w{3}-\d{4})\s+('[\w\d]+)\s+(?:(\d{1,3}(?:,\d{3})*\.\d{2})\s+)?(?:(\d{1,3}(?:,\d{3})*\.\d{2})\s+)?(\d{1,3}(?:,\d{3})*\.\d{2})\s+(.*?)\s+((?:TRANSFER|NIBSS|Airtime|Electronic|Commission|VAT|SMS|TELCO).*)/g;
  
  // Extract customer information
  const customerInfoPattern = /CUSTOMER\s+STATEMENT\s+(.*?)\s+Statement\s+Period\s+([\d\w-]+)/i;
  const customerMatch = customerInfoPattern.exec(preprocessed);
  
  let customerInfo = '';
  if (customerMatch) {
    customerInfo = `Customer Name: ${customerMatch[1].trim()}\nStatement Period: ${customerMatch[2].trim()}\n\n`;
  }
  
  // Format transactions as CSV-like rows
  let formattedRows = '';
  let match;
  
  // Reset the regex lastIndex
  transactionPattern.lastIndex = 0;
  
  while ((match = transactionPattern.exec(preprocessed)) !== null) {
    const transDate = match[1];
    const valueDate = match[2];
    const reference = match[3];
    const debit = match[4] || '';
    const credit = match[5] || '';
    const balance = match[6];
    const branch = match[7] ? match[7].trim() : '';
    const remarks = match[8] ? match[8].trim() : '';
    
    formattedRows += `${transDate}|${valueDate}|${reference}|${debit}|${credit}|${balance}|${branch}|${remarks}\n`;
  }
  
  // If we successfully extracted transactions, return the formatted data
  if (formattedRows) {
    return customerInfo + 
      "Trans. Date|Value Date|Reference|Debits|Credits|Balance|Originating Branch|Remarks\n" + 
      formattedRows;
  }
  
  // Otherwise return the original text
  return preprocessed;
}

