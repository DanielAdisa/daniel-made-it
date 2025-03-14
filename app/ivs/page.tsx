"use client";

import { useState, useEffect } from "react";
import { FaBook, FaBoxOpen, FaChartLine, FaHome, FaPlus, FaSearch, FaTimes, FaDollarSign, 
  FaChevronDown, FaDownload, FaUpload, FaSync, FaSave } from "react-icons/fa";

// Define TypeScript interfaces for our data models
interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  lastRestocked: Date;
  sku: string;
}

interface Transaction {
  id: string;
  date: Date;
  description: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  relatedInventoryId?: string;
}

// Modify Receipt interface to include a linked transaction id
interface Receipt {
  id: string;
  date: Date;
  customerId: string;
  customerName: string;
  items: { id: string; name: string; quantity: number; price: number }[];
  totalAmount: number;
  transactionId?: string; // Add this to link to transactions
}

// Form state interfaces
interface InventoryFormData {
  name: string;
  category: string;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  sku: string;
}

interface TransactionFormData {
  description: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  date: string;
  relatedInventoryId?: string;
}

// New interface for ReceiptFormData
interface ReceiptFormData {
  date: string;
  customerId: string;
  customerName: string;
  items: { id: string; name: string; quantity: number; price: number }[];
  totalAmount: number;
}

// Currency interface
interface Currency {
  code: string;
  symbol: string;
  name: string;
}

// Add interface for app data
interface AppData {
  inventory: InventoryItem[];
  transactions: Transaction[];
  receipts: Receipt[]; // Add receipts to AppData
  lastUpdated: string;
  version: string;
  selectedCurrency: string;
  selectedTheme: string; // Add this to save theme preference
  categories: Category[]; // Add categories to AppData
}

// First, let's add a Theme interface and available themes
interface Theme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  cardBackground: string;
  text: string;
  border: string;
  buttonText: string;
  success: string;
  danger: string;
  warning: string;
}

// Add Category interface to the existing interfaces section
interface Category {
  id: string;
  name: string;
  description: string;
  type: "inventory" | "transaction" | "both"; // categorize by usage type
  color: string; // For visual distinction
}

// Main component
export default function BookKeepingSystem() {
  // Update the activeTab state to include categories
  const [activeTab, setActiveTab] = useState<"dashboard" | "inventory" | "transactions" | "receipts" | "categories">("dashboard");
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Currency state
  const [currencies] = useState<Currency[]>([
    { code: "USD", symbol: "$", name: "US Dollar" },
    { code: "EUR", symbol: "€", name: "Euro" },
    { code: "GBP", symbol: "£", name: "British Pound" },
    { code: "JPY", symbol: "¥", name: "Japanese Yen" },
    { code: "NGN", symbol: "₦", name: "Nigerian Naira" },
    { code: "INR", symbol: "₹", name: "Indian Rupee" },
  ]);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(currencies[0]);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  
  // Modal states
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  
  // Edit states - add these for tracking the item being edited
  const [editingInventoryItem, setEditingInventoryItem] = useState<InventoryItem | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // New state for receipts
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState<Receipt | null>(null);

  // Form states
  const [inventoryFormData, setInventoryFormData] = useState<InventoryFormData>({
    name: "",
    category: "",
    quantity: 0,
    costPrice: 0,
    sellingPrice: 0,
    sku: "",
  });
  
  const [transactionFormData, setTransactionFormData] = useState<TransactionFormData>({
    description: "",
    type: "income",
    category: "",
    amount: 0,
    date: new Date().toISOString().split('T')[0],
  });

  // New form state for receipts
  const [receiptFormData, setReceiptFormData] = useState<ReceiptFormData>({
    date: new Date().toISOString().split('T')[0],
    customerId: "",
    customerName: "",
    items: [],
    totalAmount: 0,
  });

  // Theme colors
  const theme = {
    primary: "indigo-600",
    primaryLight: "indigo-100",
    primaryDark: "indigo-800",
    secondary: "violet-500",
    secondaryLight: "violet-100",
    secondaryDark: "violet-800",
    success: "emerald-500",
    successLight: "emerald-100",
    danger: "rose-500",
    dangerLight: "rose-100",
    warning: "amber-500",
    warningLight: "amber-100",
    info: "sky-500",
    infoLight: "sky-100",
    gray: "gray-200",
    grayDark: "gray-700",
    textPrimary: "gray-900",
    textSecondary: "gray-600",
    textLight: "gray-400",
    white: "white",
    black: "black",
  };

  // Define available themes
  const themes: Theme[] = [
    {
      id: "default",
      name: "Midnight Blue",
      primary: "indigo-600",
      secondary: "violet-500",
      accent: "indigo-400",
      background: "gray-900",
      cardBackground: "gray-800",
      text: "white",
      border: "gray-700",
      buttonText: "white",
      success: "emerald-500",
      danger: "rose-500",
      warning: "amber-500"
    },
    {
      id: "dark-purple",
      name: "Dark Purple",
      primary: "purple-600",
      secondary: "fuchsia-500",
      accent: "purple-400",
      background: "gray-900",
      cardBackground: "gray-800",
      text: "white",
      border: "purple-900",
      buttonText: "white",
      success: "green-500",
      danger: "red-500",
      warning: "yellow-500"
    },
    {
      id: "emerald",
      name: "Emerald",
      primary: "emerald-600",
      secondary: "teal-500",
      accent: "emerald-400",
      background: "gray-900",
      cardBackground: "gray-800",
      text: "white",
      border: "emerald-900",
      buttonText: "white",
      success: "green-500",
      danger: "rose-500",
      warning: "amber-500"
    },
    {
      id: "crimson",
      name: "Crimson",
      primary: "rose-600",
      secondary: "pink-500",
      accent: "rose-400",
      background: "gray-900",
      cardBackground: "gray-800",
      text: "white",
      border: "rose-900",
      buttonText: "white",
      success: "emerald-500",
      danger: "red-600",
      warning: "amber-500"
    },
    {
      id: "navy",
      name: "Navy",
      primary: "blue-600",
      secondary: "sky-500",
      accent: "blue-400",
      background: "slate-900",
      cardBackground: "slate-800",
      text: "white",
      border: "blue-900",
      buttonText: "white", 
      success: "emerald-500",
      danger: "rose-500",
      warning: "amber-500"
    }
  ];
  
  // Theme state
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes[0]);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  
  // Add state for data persistence
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [dataChanged, setDataChanged] = useState(false);

  // Add categories state
  const [categories, setCategories] = useState<Category[]>([
    // Some default categories to start with
    { id: "cat-1", name: "Electronics", description: "Electronic items and gadgets", type: "inventory", color: "blue-500" },
    { id: "cat-2", name: "Stationery", description: "Office supplies and stationery", type: "inventory", color: "green-500" },
    { id: "cat-3", name: "Sales", description: "Income from sales", type: "transaction", color: "emerald-500" },
    { id: "cat-4", name: "Utilities", description: "Utility bills and expenses", type: "transaction", color: "amber-500" },
    { id: "cat-5", name: "Salaries", description: "Staff salaries", type: "transaction", color: "rose-500" }
  ]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  
  // Add category form state
  const [categoryFormData, setCategoryFormData] = useState<{
    name: string;
    description: string;
    type: "inventory" | "transaction" | "both";
    color: string;
  }>({
    name: "",
    description: "",
    type: "both",
    color: "blue-500"
  });
  
  // Add category modal state
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Available colors for categories
  const categoryColors = [
    "blue-500", "indigo-500", "purple-500", "pink-500", "rose-500", 
    "red-500", "orange-500", "amber-500", "yellow-500", "lime-500",
    "green-500", "emerald-500", "teal-500", "cyan-500", "sky-500"
  ];

  // LOCAL STORAGE INTEGRATION
  // Load data from localStorage on initial mount
  useEffect(() => {
    loadFromLocalStorage();
  }, []);

  // Save data to localStorage whenever inventory or transactions change
  useEffect(() => {
    if (inventory.length > 0 || transactions.length > 0 || receipts.length > 0) {
      saveToLocalStorage();
      setDataChanged(true);
    }
  }, [inventory, transactions, receipts, selectedCurrency]);

  // Load theme from localStorage
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('bookkeep-data');
      if (savedData) {
        const parsedData: AppData = JSON.parse(savedData);
        if (parsedData.selectedTheme) {
          const savedTheme = themes.find(theme => theme.id === parsedData.selectedTheme);
          if (savedTheme) {
            setCurrentTheme(savedTheme);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load theme from localStorage:', error);
    }
  }, []);

  // Function to load data from localStorage
  const loadFromLocalStorage = () => {
    try {
      const savedData = localStorage.getItem('bookkeep-data');
      
      if (savedData) {
        const parsedData: AppData = JSON.parse(savedData);
        
        // Convert date strings back to Date objects for transactions
        const loadedTransactions = parsedData.transactions.map(transaction => ({
          ...transaction,
          date: new Date(transaction.date)
        }));
        
        // Convert date strings back to Date objects for inventory items
        const loadedInventory = parsedData.inventory.map(item => ({
          ...item,
          lastRestocked: new Date(item.lastRestocked)
        }));
        
        setInventory(loadedInventory);
        setTransactions(loadedTransactions);
        
        // Load receipts if they exist
        if (parsedData.receipts) {
          const loadedReceipts = parsedData.receipts.map(receipt => ({
            ...receipt,
            date: new Date(receipt.date)
          }));
          setReceipts(loadedReceipts);
        }
        
        // Set selected currency if available
        const currencyCode = parsedData.selectedCurrency;
        if (currencyCode) {
          const foundCurrency = currencies.find(c => c.code === currencyCode);
          if (foundCurrency) {
            setSelectedCurrency(foundCurrency);
          }
        }
        
        // Load categories if they exist
        if (parsedData.categories) {
          setCategories(parsedData.categories);
        }

        setLastSaved(new Date(parsedData.lastUpdated));
        console.log('Data loaded from localStorage');
      }
    } catch (error) {
      console.error('Failed to load data from localStorage:', error);
    }
  };

  // Function to save data to localStorage
  const saveToLocalStorage = () => {
    try {
      setIsSaving(true);
      const currentTime = new Date().toISOString();
      
      const dataToSave: AppData = {
        inventory,
        transactions,
        receipts, // Add receipts to saved data
        lastUpdated: currentTime,
        version: "1.0",
        selectedCurrency: selectedCurrency.code,
        selectedTheme: currentTheme.id, // Save selected theme
        categories,
      };
      
      localStorage.setItem('bookkeep-data', JSON.stringify(dataToSave));
      setLastSaved(new Date());
      setDataChanged(false);
      
      setTimeout(() => {
        setIsSaving(false);
      }, 1000);
      
    } catch (error) {
      console.error('Failed to save data to localStorage:', error);
      setIsSaving(false);
    }
  };

  // EXPORT/IMPORT FUNCTIONALITY
  // Function to export data to a JSON file
  const exportData = () => {
    try {
      const currentTime = new Date().toISOString().replace(/[:.]/g, '-');
      const dataToExport: AppData = {
        inventory,
        transactions,
        receipts, // Add receipts to exported data
        lastUpdated: new Date().toISOString(),
        version: "1.0",
        selectedCurrency: selectedCurrency.code,
        selectedTheme: currentTheme.id, // Include theme in exports
        categories,
      };
      
      const json = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const href = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = href;
      link.download = `bookkeep-export-${currentTime}.json`;
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      URL.revokeObjectURL(href);
      
    } catch (error) {
      console.error('Failed to export data:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  // Function to import data from a JSON file
  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const importedData: AppData = JSON.parse(e.target?.result as string);
          
          // Validate imported data structure
          if (!importedData.inventory || !importedData.transactions) {
            throw new Error('Invalid data format');
          }
          
          // Confirm before overwriting existing data
          if (inventory.length > 0 || transactions.length > 0) {
            if (!window.confirm('Importing will replace your existing data. Continue?')) {
              return;
            }
          }
          
          // Convert date strings to Date objects
          const processedTransactions = importedData.transactions.map(transaction => ({
            ...transaction,
            date: new Date(transaction.date)
          }));
          
          const processedInventory = importedData.inventory.map(item => ({
            ...item,
            lastRestocked: new Date(item.lastRestocked)
          }));
          
          setInventory(processedInventory);
          setTransactions(processedTransactions);
          
          // Load receipts if they exist
          if (importedData.receipts) {
            const loadedReceipts = importedData.receipts.map(receipt => ({
              ...receipt,
              date: new Date(receipt.date)
            }));
            setReceipts(loadedReceipts);
          }
          
          // Set currency if available
          if (importedData.selectedCurrency) {
            const foundCurrency = currencies.find(c => c.code === importedData.selectedCurrency);
            if (foundCurrency) {
              setSelectedCurrency(foundCurrency);
            }
          }

          // Load theme if available
          if (importedData.selectedTheme) {
            const importedTheme = themes.find(theme => theme.id === importedData.selectedTheme);
            if (importedTheme) {
              setCurrentTheme(importedTheme);
            }
          }

          // Load categories if they exist
          if (importedData.categories) {
            setCategories(importedData.categories);
          }
          
          alert('Data imported successfully!');
          
        } catch (error) {
          console.error('Failed to parse imported data:', error);
          alert('The selected file contains invalid data. Please try again with a valid export file.');
        }
      };
      
      reader.readAsText(file);
      
    } catch (error) {
      console.error('Failed to import data:', error);
      alert('Failed to import data. Please try again.');
    }
    
    // Reset input
    event.target.value = '';
  };

  // Function to add a new inventory item
  const addInventoryItem = () => {
    const newItem: InventoryItem = {
      ...inventoryFormData,
      id: `inv-${Date.now()}`,
      lastRestocked: new Date(),
      quantity: Number(inventoryFormData.quantity),
      costPrice: Number(inventoryFormData.costPrice),
      sellingPrice: Number(inventoryFormData.sellingPrice),
    };
    setInventory([...inventory, newItem]);
    setShowInventoryModal(false);
    
    // Reset form
    resetInventoryForm();
  };
  
  // Function to update an inventory item
  const updateInventoryItem = () => {
    if (!editingInventoryItem) return;
    
    const updatedItem: InventoryItem = {
      ...editingInventoryItem,
      name: inventoryFormData.name,
      category: inventoryFormData.category,
      quantity: Number(inventoryFormData.quantity),
      costPrice: Number(inventoryFormData.costPrice),
      sellingPrice: Number(inventoryFormData.sellingPrice),
      sku: inventoryFormData.sku,
    };
    
    setInventory(inventory.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    ));
    
    setShowInventoryModal(false);
    setEditingInventoryItem(null);
    resetInventoryForm();
  };
  
  // Function to delete an inventory item
  const deleteInventoryItem = (id: string) => {
    if (window.confirm("Are you sure you want to delete this inventory item?")) {
      setInventory(inventory.filter(item => item.id !== id));
    }
  };
  
  // Function to reset inventory form
  const resetInventoryForm = () => {
    setInventoryFormData({
      name: "",
      category: "",
      quantity: 0,
      costPrice: 0,
      sellingPrice: 0,
      sku: "",
    });
  };

  // Function to add a new transaction
  const addTransaction = () => {
    const newTransaction: Transaction = {
      id: `txn-${Date.now()}`,
      description: transactionFormData.description,
      type: transactionFormData.type,
      category: transactionFormData.category,
      amount: Number(transactionFormData.amount),
      date: new Date(transactionFormData.date),
      relatedInventoryId: transactionFormData.relatedInventoryId,
    };
    setTransactions([...transactions, newTransaction]);
    setShowTransactionModal(false);
    
    // Reset form
    resetTransactionForm();
  };
  
  // Function to update a transaction
  const updateTransaction = () => {
    if (!editingTransaction) return;
    
    const updatedTransaction: Transaction = {
      ...editingTransaction,
      description: transactionFormData.description,
      type: transactionFormData.type,
      category: transactionFormData.category,
      amount: Number(transactionFormData.amount),
      date: new Date(transactionFormData.date),
      relatedInventoryId: transactionFormData.relatedInventoryId,
    };
    
    setTransactions(transactions.map(transaction => 
      transaction.id === updatedTransaction.id ? updatedTransaction : transaction
    ));
    
    setShowTransactionModal(false);
    setEditingTransaction(null);
    resetTransactionForm();
  };
  
  // Function to delete a transaction
  const deleteTransaction = (id: string) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      setTransactions(transactions.filter(transaction => transaction.id !== id));
    }
  };
  
  // Function to reset transaction form
  const resetTransactionForm = () => {
    setTransactionFormData({
      description: "",
      type: "income",
      category: "",
      amount: 0,
      date: new Date().toISOString().split('T')[0],
    });
  };

  // New functions for receipts
  // Update the addReceipt function to create a transaction and update inventory
  const addReceipt = () => {
    // Validate inventory quantities first
    let validInventory = true;
    const updatedInventory = [...inventory];
    
    for (const item of receiptFormData.items) {
      const inventoryItem = inventory.find(invItem => invItem.id === item.id);
      if (!inventoryItem || inventoryItem.quantity < item.quantity) {
        const itemName = inventoryItem ? inventoryItem.name : "Unknown item";
        alert(`Error: Not enough inventory for ${itemName}`);
        validInventory = false;
        break;
      }
    }
    
    if (!validInventory) {
      return;
    }
    
    // Create the new receipt
    const newReceipt: Receipt = {
      id: `rcp-${Date.now()}`,
      date: new Date(receiptFormData.date),
      customerId: receiptFormData.customerId,
      customerName: receiptFormData.customerName,
      items: receiptFormData.items,
      totalAmount: receiptFormData.totalAmount,
    };
    
    // Create a corresponding income transaction
    const transactionId = `txn-${Date.now()}`;
    const newTransaction: Transaction = {
      id: transactionId,
      date: new Date(receiptFormData.date),
      description: `Sale to ${receiptFormData.customerName}`,
      type: "income",
      category: "Sales",
      amount: receiptFormData.totalAmount,
    };
    
    // Update the receipt with the transaction ID
    newReceipt.transactionId = transactionId;
    
    // Update inventory quantities
    receiptFormData.items.forEach(item => {
      const inventoryIndex = updatedInventory.findIndex(invItem => invItem.id === item.id);
      if (inventoryIndex !== -1) {
        updatedInventory[inventoryIndex] = {
          ...updatedInventory[inventoryIndex],
          quantity: updatedInventory[inventoryIndex].quantity - item.quantity
        };
      }
    });
    
    // Save all updates
    setReceipts([...receipts, newReceipt]);
    setTransactions([...transactions, newTransaction]);
    setInventory(updatedInventory);
    setShowReceiptModal(false);
    resetReceiptForm();
  };

  // Update the updateReceipt function to handle the transaction and inventory changes
  const updateReceipt = () => {
    if (!editingReceipt) return;
    
    // Find quantities that have changed to update inventory correctly
    const quantityDifferences = editingReceipt.items.map(oldItem => {
      const newItem = receiptFormData.items.find(item => item.id === oldItem.id);
      return {
        id: oldItem.id,
        difference: newItem ? newItem.quantity - oldItem.quantity : -oldItem.quantity
      };
    });
    
    // Add new items not in original receipt
    receiptFormData.items.forEach(item => {
      if (!editingReceipt.items.some(oldItem => oldItem.id === item.id)) {
        quantityDifferences.push({
          id: item.id,
          difference: item.quantity
        });
      }
    });
    
    // Create the updated receipt
    const updatedReceipt: Receipt = {
      ...editingReceipt,
      date: new Date(receiptFormData.date),
      customerId: receiptFormData.customerId,
      customerName: receiptFormData.customerName,
      items: receiptFormData.items,
      totalAmount: receiptFormData.totalAmount,
    };
    
    // Find or create corresponding transaction
    let updatedTransaction: Transaction | null = null;
    let existingTransactionIndex = -1;
    
    if (editingReceipt.transactionId) {
      // Find existing transaction
      existingTransactionIndex = transactions.findIndex(t => t.id === editingReceipt.transactionId);
      
      if (existingTransactionIndex !== -1) {
        updatedTransaction = {
          ...transactions[existingTransactionIndex],
          date: new Date(receiptFormData.date),
          description: `Sale to ${receiptFormData.customerName}`,
          amount: receiptFormData.totalAmount,
        };
      }
    }
    
    // If no valid transaction found or linked, create a new one
    if (updatedTransaction === null) {
      const transactionId = `txn-${Date.now()}`;
      updatedTransaction = {
        id: transactionId,
        date: new Date(receiptFormData.date),
        description: `Sale to ${receiptFormData.customerName}`,
        type: "income",
        category: "Sales",
        amount: receiptFormData.totalAmount,
      };
      updatedReceipt.transactionId = transactionId;
    }
    
    // Update inventory quantities - check for valid inventory first
    const updatedInventory = [...inventory];
    let validInventoryChanges = true;

    // Verify all inventory changes are valid before applying
    quantityDifferences.forEach(diff => {
      const inventoryIndex = updatedInventory.findIndex(invItem => invItem.id === diff.id);
      if (inventoryIndex !== -1) {
        const newQuantity = updatedInventory[inventoryIndex].quantity - diff.difference;
        if (newQuantity < 0) {
          validInventoryChanges = false;
          alert(`Error: Not enough inventory for ${updatedInventory[inventoryIndex].name}`);
        }
      }
    });

    if (!validInventoryChanges) {
      return;
    }
    
    // Apply inventory updates if all changes are valid
    quantityDifferences.forEach(diff => {
      const inventoryIndex = updatedInventory.findIndex(invItem => invItem.id === diff.id);
      if (inventoryIndex !== -1 && diff.difference !== 0) {
        updatedInventory[inventoryIndex] = {
          ...updatedInventory[inventoryIndex],
          quantity: updatedInventory[inventoryIndex].quantity - diff.difference
        };
      }
    });
    
    // Save all updates
    setReceipts(receipts.map(receipt =>
      receipt.id === updatedReceipt.id ? updatedReceipt : receipt
    ));
    
    // Update transactions array based on whether we're updating or adding
    if (existingTransactionIndex !== -1) {
      const newTransactions = [...transactions];
      newTransactions[existingTransactionIndex] = updatedTransaction;
      setTransactions(newTransactions);
    } else {
      setTransactions([...transactions, updatedTransaction]);
    }
    
    setInventory(updatedInventory);
    setShowReceiptModal(false);
    setEditingReceipt(null);
    resetReceiptForm();
  };

  // Update the deleteReceipt function to handle linked transactions and restore inventory
  const deleteReceipt = (id: string) => {
    if (window.confirm("Are you sure you want to delete this receipt?")) {
      const receiptToDelete = receipts.find(receipt => receipt.id === id);
      
      if (receiptToDelete) {
        // Restore inventory quantities
        const updatedInventory = [...inventory];
        receiptToDelete.items.forEach(item => {
          const inventoryIndex = updatedInventory.findIndex(invItem => invItem.id === item.id);
          if (inventoryIndex !== -1) {
            updatedInventory[inventoryIndex] = {
              ...updatedInventory[inventoryIndex],
              quantity: updatedInventory[inventoryIndex].quantity + item.quantity
            };
          }
        });
        
        // Delete linked transaction if exists
        if (receiptToDelete.transactionId) {
          setTransactions(transactions.filter(
            transaction => transaction.id !== receiptToDelete.transactionId
          ));
        }
        
        // Delete receipt and update inventory
        setReceipts(receipts.filter(receipt => receipt.id !== id));
        setInventory(updatedInventory);
      } else {
        setReceipts(receipts.filter(receipt => receipt.id !== id));
      }
    }
  };

  // Function to reset receipt form
  const resetReceiptForm = () => {
    setReceiptFormData({
      date: new Date().toISOString().split('T')[0],
      customerId: "",
      customerName: "",
      items: [],
      totalAmount: 0,
    });
  };

  // Handle inventory form changes
  const handleInventoryFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInventoryFormData({
      ...inventoryFormData,
      [name]: value,
    });
  };
  
  // Handle transaction form changes
  const handleTransactionFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTransactionFormData({
      ...transactionFormData,
      [name]: value,
    });
  };

  // New handler for receipt form changes
  const handleReceiptFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setReceiptFormData({
      ...receiptFormData,
      [name]: value,
    });
  };

  // Calculate summary statistics
  const totalInventoryValue = inventory.reduce(
    (sum, item) => sum + item.costPrice * item.quantity,
    0
  );
  
  const totalSalesValue = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  
  const profit = totalSalesValue - totalExpenses;

  // Format currency function
  const formatCurrency = (amount: number): string => {
    return `${selectedCurrency.symbol}${amount.toFixed(2)}`;
  };

  // useEffect to set form data when editing an inventory item
  useEffect(() => {
    if (editingInventoryItem) {
      setInventoryFormData({
        name: editingInventoryItem.name,
        category: editingInventoryItem.category,
        quantity: editingInventoryItem.quantity,
        costPrice: editingInventoryItem.costPrice,
        sellingPrice: editingInventoryItem.sellingPrice,
        sku: editingInventoryItem.sku,
      });
      setShowInventoryModal(true);
    }
  }, [editingInventoryItem]);
  
  // useEffect to set form data when editing a transaction
  useEffect(() => {
    if (editingTransaction) {
      setTransactionFormData({
        description: editingTransaction.description,
        type: editingTransaction.type,
        category: editingTransaction.category,
        amount: editingTransaction.amount,
        date: editingTransaction.date.toISOString().split('T')[0],
        relatedInventoryId: editingTransaction.relatedInventoryId,
      });
      setShowTransactionModal(true);
    }
  }, [editingTransaction]);

  // useEffect to set form data when editing a receipt
  useEffect(() => {
    if (editingReceipt) {
      setReceiptFormData({
        date: editingReceipt.date.toISOString().split('T')[0],
        customerId: editingReceipt.customerId,
        customerName: editingReceipt.customerName,
        items: editingReceipt.items,
        totalAmount: editingReceipt.totalAmount,
      });
      setShowReceiptModal(true);
    }
  }, [editingReceipt]);

  // Close currency dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.getElementById('currency-dropdown');
      if (dropdown && !dropdown.contains(event.target as Node)) {
        setShowCurrencyDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Add these filtered data states to keep the original data intact
  // Add near the beginning of the component after the other state declarations
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [filteredReceipts, setFilteredReceipts] = useState<Receipt[]>([]);

  // Update useEffect to initialize filtered data when original data loads
  useEffect(() => {
    setFilteredInventory(inventory);
    setFilteredTransactions(transactions);
    setFilteredReceipts(receipts);
    setFilteredCategories(categories);
  }, [inventory, transactions, receipts, categories]);

  // Add this useEffect for search functionality
  useEffect(() => {
    if (searchQuery.trim() === '') {
      // If search is empty, show all data
      setFilteredInventory(inventory);
      setFilteredTransactions(transactions);
      setFilteredReceipts(receipts);
      setFilteredCategories(categories);
      return;
    }
    
    const query = searchQuery.toLowerCase().trim();
    
    // Filter inventory items
    const matchedInventory = inventory.filter(item => 
      item.name.toLowerCase().includes(query) || 
      item.category.toLowerCase().includes(query) || 
      item.sku.toLowerCase().includes(query)
    );
    setFilteredInventory(matchedInventory);
    
    // Filter transactions
    const matchedTransactions = transactions.filter(transaction => 
      transaction.description.toLowerCase().includes(query) || 
      transaction.category.toLowerCase().includes(query) || 
      transaction.type.toLowerCase().includes(query) ||
      transaction.amount.toString().includes(query)
    );
    setFilteredTransactions(matchedTransactions);
    
    // Filter receipts
    const matchedReceipts = receipts.filter(receipt => 
      receipt.customerName.toLowerCase().includes(query) || 
      receipt.customerId.toLowerCase().includes(query) ||
      receipt.totalAmount.toString().includes(query) ||
      // Also search items within receipts
      receipt.items.some(item => 
        item.name.toLowerCase().includes(query) ||
        item.price.toString().includes(query)
      )
    );
    setFilteredReceipts(matchedReceipts);

    // Filter categories
    const matchedCategories = categories.filter(category => 
      category.name.toLowerCase().includes(query) || 
      category.description.toLowerCase().includes(query) ||
      category.type.toLowerCase().includes(query)
    );
    setFilteredCategories(matchedCategories);
  }, [searchQuery, inventory, transactions, receipts, categories]);

  // Add a stats object to display search results count 
  const searchStats = {
    inventory: searchQuery ? `${filteredInventory.length} of ${inventory.length}` : `${inventory.length} items`,
    transactions: searchQuery ? `${filteredTransactions.length} of ${transactions.length}` : `${transactions.length} records`,
    receipts: searchQuery ? `${filteredReceipts.length} of ${receipts.length}` : `${receipts.length} records`,
    categories: searchQuery ? `${filteredCategories.length} of ${categories.length}` : `${categories.length} categories`
  };

  // Add functions to manage categories
  const addCategory = () => {
    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name: categoryFormData.name,
      description: categoryFormData.description,
      type: categoryFormData.type,
      color: categoryFormData.color
    };
    
    setCategories([...categories, newCategory]);
    setShowCategoryModal(false);
    resetCategoryForm();
  };

  const updateCategory = () => {
    if (!editingCategory) return;
    
    const updatedCategory: Category = {
      ...editingCategory,
      name: categoryFormData.name,
      description: categoryFormData.description,
      type: categoryFormData.type,
      color: categoryFormData.color
    };
    
    setCategories(categories.map(category => 
      category.id === updatedCategory.id ? updatedCategory : category
    ));
    
    setShowCategoryModal(false);
    setEditingCategory(null);
    resetCategoryForm();
  };

  const deleteCategory = (id: string) => {
    // Check if the category is in use before deleting
    const isUsedInInventory = inventory.some(item => item.category === id);
    const isUsedInTransactions = transactions.some(transaction => transaction.category === id);
    
    if (isUsedInInventory || isUsedInTransactions) {
      alert("This category is currently in use and cannot be deleted.");
      return;
    }
    
    if (window.confirm("Are you sure you want to delete this category?")) {
      setCategories(categories.filter(category => category.id !== id));
    }
  };

  const resetCategoryForm = () => {
    setCategoryFormData({
      name: "",
      description: "",
      type: "both",
      color: "blue-500"
    });
  };

  const handleCategoryFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCategoryFormData({
      ...categoryFormData,
      [name]: value,
    });
  };

  // Update useEffect for editingCategory
  useEffect(() => {
    if (editingCategory) {
      setCategoryFormData({
        name: editingCategory.name,
        description: editingCategory.description,
        type: editingCategory.type,
        color: editingCategory.color
      });
      setShowCategoryModal(true);
    }
  }, [editingCategory]);

  return (
    <div className={`min-h-screen bg-${currentTheme.background}`}>
      {/* Header - with gradient background */}
      <header className={`bg-gradient-to-r from-${currentTheme.background} to-${currentTheme.cardBackground} text-${currentTheme.text} shadow-lg border-b border-${currentTheme.border} sticky top-0 z-10`}>
        <div className="container mx-auto p-4 flex flex-col sm:flex-row justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center mb-2 sm:mb-0">
            <FaBook className={`mr-2 text-${currentTheme.accent}`} />
            BookKeep Pro
          </h1>
          <div className="flex flex-col sm:flex-row items-center space-x-0 space-y-2 sm:space-y-0 sm:space-x-4">
            {/* Data Actions */}
            <div className="flex space-x-2">
              {/* Theme Selector Button */}
              <div className="relative">
                <button
                  title="Change Theme"
                  onClick={() => setShowThemeSelector(!showThemeSelector)}
                  className={`px-2 py-1 rounded bg-${currentTheme.cardBackground} hover:bg-${currentTheme.background} text-${currentTheme.text} border border-${currentTheme.border} text-sm flex items-center`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                  Theme
                </button>
                
                {showThemeSelector && (
                  <div className={`absolute right-0 mt-2 w-48 bg-${currentTheme.cardBackground} rounded-md shadow-lg z-10 py-1 border border-${currentTheme.border} overflow-hidden animate-fadeIn`}>
                    {themes.map((theme) => (
                      <button
                        key={theme.id}
                        className={`flex items-center justify-between w-full text-left px-4 py-3 text-sm hover:bg-${theme.background} transition-colors duration-150 ${
                          theme.id === currentTheme.id ? `bg-${theme.background} text-${theme.accent}` : `text-${theme.text}`
                        }`}
                        onClick={() => {
                          setCurrentTheme(theme);
                          setShowThemeSelector(false);
                          // Trigger save to persist theme choice
                          setTimeout(() => saveToLocalStorage(), 100);
                        }}
                      >
                        <span>{theme.name}</span>
                        <span className={`h-4 w-4 rounded-full bg-${theme.primary}`}></span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <button
                title="Save Data"
                onClick={saveToLocalStorage}
                className={`px-2 py-1 rounded ${isSaving ? `bg-${currentTheme.success} text-${currentTheme.buttonText}` : `bg-${currentTheme.cardBackground} text-${currentTheme.text}`} hover:bg-${currentTheme.background} border border-${currentTheme.border} text-sm flex items-center`}
              >
                <FaSave className={`mr-1 ${isSaving ? 'animate-pulse' : ''}`} />
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              
              <button
                title="Export Data"
                onClick={exportData}
                className={`px-2 py-1 rounded bg-${currentTheme.cardBackground} hover:bg-${currentTheme.background} text-${currentTheme.text} border border-${currentTheme.border} text-sm flex items-center`}
              >
                <FaDownload className="mr-1" /> Export
              </button>
              
              <label className={`px-2 py-1 rounded bg-${currentTheme.cardBackground} hover:bg-${currentTheme.background} text-${currentTheme.text} border border-${currentTheme.border} text-sm flex items-center cursor-pointer`}>
                <FaUpload className="mr-1" /> Import
                <input 
                  type="file"
                  accept=".json"
                  onChange={importData}
                  className="hidden"
                />
              </label>
            </div>
            
            {/* Currency Selector */}
            <div className="relative" id="currency-dropdown">
              <button 
                className={`flex items-center bg-${currentTheme.cardBackground} hover:bg-${currentTheme.background} text-${currentTheme.text} px-3 py-2 rounded transition-all duration-200 border border-${currentTheme.border} text-sm`}
                onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
              >
                <FaDollarSign className={`mr-1 text-${currentTheme.accent}`} />
                <span className="mr-1">{selectedCurrency.code}</span>
                <FaChevronDown size={12} className={`transform transition-transform duration-200 ${showCurrencyDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showCurrencyDropdown && (
                <div className={`absolute right-0 mt-2 w-48 bg-${currentTheme.cardBackground} rounded-md shadow-lg z-10 py-1 border border-${currentTheme.border} overflow-hidden animate-fadeIn`}>
                  {currencies.map((currency) => (
                    <button
                      key={currency.code}
                      className={`flex items-center justify-between w-full text-left px-4 py-2 text-sm hover:bg-${currentTheme.background} transition-colors duration-150 ${
                        currency.code === selectedCurrency.code ? `bg-${currentTheme.background} text-${currentTheme.accent}` : `text-${currentTheme.text}`
                      }`}
                      onClick={() => {
                        setSelectedCurrency(currency);
                        setShowCurrencyDropdown(false);
                      }}
                    >
                      <span>{currency.name}</span>
                      <span className="text-gray-400 font-medium">{currency.symbol}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative w-full sm:w-auto">
              <FaSearch className={`absolute left-3 top-3 ${searchQuery ? `text-${currentTheme.accent}` : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Search..."
                className={`pl-10 pr-10 py-2 rounded-md bg-${currentTheme.cardBackground} text-${currentTheme.text} placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-${currentTheme.primary} border ${searchQuery ? `border-${currentTheme.accent}` : `border-${currentTheme.border}`} w-full sm:w-48 text-sm`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className={`absolute right-2 top-2 text-${currentTheme.text} hover:text-${currentTheme.accent} rounded p-1`}
                  onClick={() => setSearchQuery('')}
                  title="Clear search"
                >
                  <FaTimes size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Data status indicator */}
        <div className={`bg-${currentTheme.background} text-xs text-gray-400 px-4 py-1 flex justify-between`}>
          <div>
            {lastSaved ? (
              <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
            ) : (
              <span>Not saved yet</span>
            )}
          </div>
          <div>
            {dataChanged && <span className="text-amber-400">Unsaved changes</span>}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 flex flex-col lg:flex-row">
        {/* Sidebar Navigation */}
        <aside className={`w-full lg:w-64 bg-${currentTheme.cardBackground} rounded-lg shadow-md p-4 mb-6 lg:mb-0 lg:mr-8 border border-${currentTheme.border}`}>
          <nav>
            <ul className="space-y-2">
              <li>
                <button
                  className={`w-full flex items-center p-3 rounded-md text-sm ${
                    activeTab === "dashboard" ? `bg-${currentTheme.primary}/50 text-${currentTheme.accent}` : `hover:bg-${currentTheme.background} text-gray-300`
                  }`}
                  onClick={() => setActiveTab("dashboard")}
                >
                  <FaHome className="mr-3" />
                  <span>Dashboard</span>
                </button>
              </li>
              <li>
                <button
                  className={`w-full flex items-center p-3 rounded-md text-sm ${
                    activeTab === "inventory" ? `bg-${currentTheme.primary}/50 text-${currentTheme.accent}` : `hover:bg-${currentTheme.background} text-gray-300`
                  }`}
                  onClick={() => setActiveTab("inventory")}
                >
                  <FaBoxOpen className="mr-3" />
                  <span>Inventory</span>
                </button>
              </li>
              <li>
                <button
                  className={`w-full flex items-center p-3 rounded-md text-sm ${
                    activeTab === "transactions" ? `bg-${currentTheme.primary}/50 text-${currentTheme.accent}` : `hover:bg-${currentTheme.background} text-gray-300`
                  }`}
                  onClick={() => setActiveTab("transactions")}
                >
                  <FaBook className="mr-3" />
                  <span>Transactions</span>
                </button>
              </li>
              <li>
                <button
                  className={`w-full flex items-center p-3 rounded-md text-sm ${
                    activeTab === "receipts" ? `bg-${currentTheme.primary}/50 text-${currentTheme.accent}` : `hover:bg-${currentTheme.background} text-gray-300`
                  }`}
                  onClick={() => setActiveTab("receipts")}
                >
                  <FaBook className="mr-3" />
                  <span>Receipts</span>
                </button>
              </li>
              <li>
                <button
                  className={`w-full flex items-center p-3 rounded-md text-sm ${
                    activeTab === "categories" ? `bg-${currentTheme.primary}/50 text-${currentTheme.accent}` : `hover:bg-${currentTheme.background} text-gray-300`
                  }`}
                  onClick={() => setActiveTab("categories")}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span>Categories</span>
                </button>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main Content Area */}
        <div className={`flex-1 bg-${currentTheme.cardBackground} rounded-lg shadow-md p-6 border border-${currentTheme.border}`}>
          {/* Dashboard tab - use currentTheme for cards and tables */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <h2 className={`text-2xl font-bold mb-4 flex items-center text-${currentTheme.text}`}>
                <FaChartLine className={`mr-2 text-${currentTheme.accent}`} />
                Dashboard Overview
              </h2>
              
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className={`bg-${currentTheme.background} rounded-lg shadow-md p-6 border-l-4 border-${currentTheme.primary}`}>
                  <h3 className="text-gray-400 text-sm">Inventory Value</h3>
                  <p className={`text-2xl font-bold text-${currentTheme.text}`}>{formatCurrency(totalInventoryValue)}</p>
                </div>
                
                <div className={`bg-${currentTheme.background} rounded-lg shadow-md p-6 border-l-4 border-${currentTheme.success}`}>
                  <h3 className="text-gray-400 text-sm">Total Sales</h3>
                  <p className={`text-2xl font-bold text-${currentTheme.text}`}>{formatCurrency(totalSalesValue)}</p>
                </div>
                
                <div className={`bg-${currentTheme.background} rounded-lg shadow-md p-6 border-l-4 border-${currentTheme.danger}`}>
                  <h3 className="text-gray-400 text-sm">Total Expenses</h3>
                  <p className={`text-2xl font-bold text-${currentTheme.text}`}>{formatCurrency(totalExpenses)}</p>
                </div>
                
                <div className={`bg-${currentTheme.background} rounded-lg shadow-md p-6 border-l-4 border-${currentTheme.secondary}`}>
                  <h3 className="text-gray-400 text-sm">Profit</h3>
                  <p className={`text-2xl font-bold ${profit >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {formatCurrency(profit)}
                  </p>
                </div>
              </div>
              
              {/* Recent Activity */}
              <div>
                <h3 className={`text-xl font-semibold mb-4 text-${currentTheme.text} border-b border-${currentTheme.border} pb-2`}>Recent Activity</h3>
                {filteredTransactions.length === 0 ? (
                  <p className="text-gray-400">
                    {searchQuery ? "No matching transactions found." : "No transactions recorded yet."}
                  </p>
                ) : (
                  <div className={`overflow-x-auto rounded-lg border border-${currentTheme.border}`}>
                    <table className="w-full text-left">
                      <thead>
                        <tr className={`bg-${currentTheme.background}`}>
                          <th className="p-4 text-gray-400 font-semibold">Date</th>
                          <th className="p-4 text-gray-400 font-semibold">Description</th>
                          <th className="p-4 text-gray-400 font-semibold">Category</th>
                          <th className="p-4 text-gray-400 font-semibold">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTransactions.slice(0, 5).map((transaction) => (
                          <tr key={transaction.id} className={`border-b border-${currentTheme.border} hover:bg-${currentTheme.background}/50`}>
                            <td className="p-4 text-gray-300">{transaction.date.toLocaleDateString()}</td>
                            <td className="p-4 text-gray-300">{transaction.description}</td>
                            <td className="p-4 text-gray-300">{transaction.category}</td>
                            <td className={`p-4 ${transaction.type === "income" ? "text-emerald-400" : "text-rose-400"}`}>
                              {transaction.type === "income" ? "+" : "-"}{formatCurrency(transaction.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Inventory tab */}
          {activeTab === "inventory" && (
            <div>
              <div className={`flex justify-between items-center mb-6 border-b border-${currentTheme.border} pb-3`}>
                <div>
                  <h2 className={`text-2xl font-bold text-${currentTheme.text}`}>Inventory Management</h2>
                  {searchQuery && (
                    <p className={`text-sm text-${currentTheme.accent} mt-1`}>
                      Showing {searchStats.inventory}
                    </p>
                  )}
                </div>
                <button 
                  className={`flex items-center bg-${currentTheme.primary} hover:bg-${currentTheme.primary}/80 text-${currentTheme.buttonText} px-4 py-2 rounded-md shadow text-sm`}
                  onClick={() => {
                    setEditingInventoryItem(null);
                    resetInventoryForm();
                    setShowInventoryModal(true);
                  }}
                >
                  <FaPlus className="mr-2" /> Add Item
                </button>
              </div>
              
              {filteredInventory.length === 0 ? (
                <div className={`text-center py-12 bg-${currentTheme.background} rounded-lg border border-${currentTheme.border}`}>
                  {searchQuery ? (
                    <>
                      <FaSearch className="mx-auto text-4xl text-gray-500 mb-4" />
                      <h3 className={`text-xl font-medium text-${currentTheme.text}`}>No matching inventory items</h3>
                      <p className="text-gray-400 mt-2">Try different search terms</p>
                    </>
                  ) : (
                    <>
                      <FaBoxOpen className="mx-auto text-4xl text-gray-500 mb-4" />
                      <h3 className={`text-xl font-medium text-${currentTheme.text}`}>No inventory items yet</h3>
                      <p className="text-gray-400 mt-2">Add your first inventory item to get started</p>
                    </>
                  )}
                </div>
              ) : (
                <div className={`overflow-x-auto rounded-lg border border-${currentTheme.border}`}>
                  <table className="w-full text-left">
                    <thead>
                      <tr className={`bg-${currentTheme.background}`}>
                        <th className="p-4 text-gray-400 font-semibold">Item Name</th>
                        <th className="p-4 text-gray-400 font-semibold">SKU</th>
                        <th className="p-4 text-gray-400 font-semibold">Category</th>
                        <th className="p-4 text-gray-400 font-semibold">Quantity</th>
                        <th className="p-4 text-gray-400 font-semibold">Cost Price</th>
                        <th className="p-4 text-gray-400 font-semibold">Selling Price</th>
                        <th className="p-4 text-gray-400 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInventory.map((item) => (
                        <tr key={item.id} className={`border-b border-${currentTheme.border} hover:bg-${currentTheme.background}/50`}>
                          <td className={`p-4 text-${currentTheme.text}`}>{item.name}</td>
                          <td className="p-4 text-gray-400">{item.sku}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              // Find matching category to apply its color
                              (() => {
                                const category = categories.find(c => c.id === item.category);
                                return category 
                                  ? `bg-${category.color}/20 text-${category.color} border border-${category.color}/30` 
                                  : `bg-${currentTheme.primary}/20 text-${currentTheme.accent} border border-${currentTheme.primary}/30`;
                              })()
                            }`}>
                              {/* Display category name instead of ID */}
                              {(() => {
                                const category = categories.find(c => c.id === item.category);
                                return category ? category.name : item.category;
                              })()}
                            </span>
                          </td>
                          <td className={`p-4 text-${currentTheme.text}`}>{item.quantity}</td>
                          <td className={`p-4 text-${currentTheme.text}`}>{formatCurrency(item.costPrice)}</td>
                          <td className={`p-4 text-${currentTheme.text}`}>{formatCurrency(item.sellingPrice)}</td>
                          <td className="p-4 space-x-2">
                            <button 
                              className={`text-${currentTheme.accent} hover:text-${currentTheme.primary} text-sm`}
                              onClick={() => setEditingInventoryItem(item)}
                            >
                              Edit
                            </button>
                            <button 
                              className={`text-${currentTheme.danger} hover:text-${currentTheme.danger}/80 text-sm`}
                              onClick={() => deleteInventoryItem(item.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Transaction tab */}
          {activeTab === "transactions" && (
            <div>
              <div className={`flex justify-between items-center mb-6 border-b border-${currentTheme.border} pb-3`}>
                <div>
                  <h2 className={`text-2xl font-bold text-${currentTheme.text}`}>Financial Transactions</h2>
                  {searchQuery && (
                    <p className={`text-sm text-${currentTheme.accent} mt-1`}>
                      Showing {searchStats.transactions}
                    </p>
                  )}
                </div>
                <button 
                  className={`flex items-center bg-${currentTheme.primary} hover:bg-${currentTheme.primary}/80 text-${currentTheme.buttonText} px-4 py-2 rounded-md shadow text-sm`}
                  onClick={() => {
                    setEditingTransaction(null);
                    resetTransactionForm();
                    setShowTransactionModal(true);
                  }}
                >
                  <FaPlus className="mr-2" /> Add Transaction
                </button>
              </div>
              
              {filteredTransactions.length === 0 ? (
                <div className={`text-center py-12 bg-${currentTheme.background} rounded-lg border border-${currentTheme.border}`}>
                  {searchQuery ? (
                    <>
                      <FaSearch className="mx-auto text-4xl text-gray-500 mb-4" />
                      <h3 className={`text-xl font-medium text-${currentTheme.text}`}>No matching transactions</h3>
                      <p className="text-gray-400 mt-2">Try different search terms</p>
                    </>
                  ) : (
                    <>
                      <FaBook className="mx-auto text-4xl text-gray-500 mb-4" />
                      <h3 className={`text-xl font-medium text-${currentTheme.text}`}>No transactions recorded</h3>
                      <p className="text-gray-400 mt-2">Add your first transaction to start tracking finances</p>
                    </>
                  )}
                </div>
              ) : (
                <div className={`overflow-x-auto rounded-lg border border-${currentTheme.border}`}>
                  <table className="w-full text-left">
                    <thead>
                      <tr className={`bg-${currentTheme.background}`}>
                        <th className="p-4 text-gray-400 font-semibold">Date</th>
                        <th className="p-4 text-gray-400 font-semibold">Description</th>
                        <th className="p-4 text-gray-400 font-semibold">Category</th>
                        <th className="p-4 text-gray-400 font-semibold">Type</th>
                        <th className="p-4 text-gray-400 font-semibold">Amount</th>
                        <th className="p-4 text-gray-400 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.map((transaction) => (
                        <tr key={transaction.id} className={`border-b border-${currentTheme.border} hover:bg-${currentTheme.background}/50`}>
                          <td className={`p-4 text-${currentTheme.text}`}>{transaction.date.toLocaleDateString()}</td>
                          <td className={`p-4 text-${currentTheme.text}`}>{transaction.description}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              // Find matching category to apply its color
                              (() => {
                                const category = categories.find(c => c.id === transaction.category);
                                return category 
                                  ? `bg-${category.color}/20 text-${category.color} border border-${category.color}/30` 
                                  : transaction.type === "income"
                                    ? `bg-${currentTheme.success}/20 text-${currentTheme.success} border border-${currentTheme.success}/30`
                                    : `bg-${currentTheme.danger}/20 text-${currentTheme.danger} border border-${currentTheme.danger}/30`;
                              })()
                            }`}>
                              {/* Display category name instead of ID */}
                              {(() => {
                                const category = categories.find(c => c.id === transaction.category);
                                return category ? category.name : transaction.category;
                              })()}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              transaction.type === "income" ? `bg-${currentTheme.success}/20 text-${currentTheme.success} border border-${currentTheme.success}/30` : `bg-${currentTheme.danger}/20 text-${currentTheme.danger} border border-${currentTheme.danger}/30`
                            }`}>
                              {transaction.type}
                            </span>
                          </td>
                          <td className={`p-4 ${transaction.type === "income" ? `text-${currentTheme.success}` : `text-${currentTheme.danger}`}`}>
                            {formatCurrency(transaction.amount)}
                          </td>
                          <td className="p-4 space-x-2">
                            <button 
                              className={`text-${currentTheme.accent} hover:text-${currentTheme.primary} text-sm`}
                              onClick={() => setEditingTransaction(transaction)}
                            >
                              Edit
                            </button>
                            <button 
                              className={`text-${currentTheme.danger} hover:text-${currentTheme.danger}/80 text-sm`}
                              onClick={() => deleteTransaction(transaction.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Receipts tab */}
          {activeTab === "receipts" && (
            <div>
              <div className={`flex justify-between items-center mb-6 border-b border-${currentTheme.border} pb-3`}>
                <div>
                  <h2 className={`text-2xl font-bold text-${currentTheme.text}`}>Receipts Management</h2>
                  {searchQuery && (
                    <p className={`text-sm text-${currentTheme.accent} mt-1`}>
                      Showing {searchStats.receipts}
                    </p>
                  )}
                </div>
                <button
                  className={`flex items-center bg-${currentTheme.primary} hover:bg-${currentTheme.primary}/80 text-${currentTheme.buttonText} px-4 py-2 rounded-md shadow text-sm`}
                  onClick={() => {
                    setEditingReceipt(null);
                    resetReceiptForm();
                    setShowReceiptModal(true);
                  }}
                >
                  <FaPlus className="mr-2" /> Add Receipt
                </button>
              </div>

              {filteredReceipts.length === 0 ? (
                <div className={`text-center py-12 bg-${currentTheme.background} rounded-lg border border-${currentTheme.border}`}>
                  {searchQuery ? (
                    <>
                      <FaSearch className="mx-auto text-4xl text-gray-500 mb-4" />
                      <h3 className={`text-xl font-medium text-${currentTheme.text}`}>No matching receipts</h3>
                      <p className="text-gray-400 mt-2">Try different search terms</p>
                    </>
                  ) : (
                    <>
                      <FaBook className="mx-auto text-4xl text-gray-500 mb-4" />
                      <h3 className={`text-xl font-medium text-${currentTheme.text}`}>No receipts recorded</h3>
                      <p className="text-gray-400 mt-2">Add your first receipt to start tracking</p>
                    </>
                  )}
                </div>
              ) : (
                <div className={`overflow-x-auto rounded-lg border border-${currentTheme.border}`}>
                  <table className="w-full text-left">
                    <thead>
                      <tr className={`bg-${currentTheme.background}`}>
                        <th className="p-4 text-gray-400 font-semibold">Date</th>
                        <th className="p-4 text-gray-400 font-semibold">Customer ID</th>
                        <th className="p-4 text-gray-400 font-semibold">Customer Name</th>
                        <th className="p-4 text-gray-400 font-semibold">Total Amount</th>
                        <th className="p-4 text-gray-400 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredReceipts.map((receipt) => (
                        <tr key={receipt.id} className={`border-b border-${currentTheme.border} hover:bg-${currentTheme.background}/50`}>
                          <td className={`p-4 text-${currentTheme.text}`}>{receipt.date.toLocaleDateString()}</td>
                          <td className={`p-4 text-${currentTheme.text}`}>{receipt.customerId}</td>
                          <td className={`p-4 text-${currentTheme.text}`}>{receipt.customerName}</td>
                          <td className={`p-4 text-${currentTheme.success}`}>{formatCurrency(receipt.totalAmount)}</td>
                          <td className="p-4 space-x-2">
                            <button
                              className={`text-${currentTheme.accent} hover:text-${currentTheme.primary} text-sm`}
                              onClick={() => setEditingReceipt(receipt)}
                            >
                              Edit
                            </button>
                            <button
                              className={`text-${currentTheme.danger} hover:text-${currentTheme.danger}/80 text-sm`}
                              onClick={() => deleteReceipt(receipt.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === "categories" && (
            <div>
              <div className={`flex justify-between items-center mb-6 border-b border-${currentTheme.border} pb-3`}>
                <div>
                  <h2 className={`text-2xl font-bold text-${currentTheme.text}`}>Category Management</h2>
                  {searchQuery && (
                    <p className={`text-sm text-${currentTheme.accent} mt-1`}>
                      Showing {searchStats.categories}
                    </p>
                  )}
                </div>
                <button
                  className={`flex items-center bg-${currentTheme.primary} hover:bg-${currentTheme.primary}/80 text-${currentTheme.buttonText} px-4 py-2 rounded-md shadow text-sm`}
                  onClick={() => {
                    setEditingCategory(null);
                    resetCategoryForm();
                    setShowCategoryModal(true);
                  }}
                >
                  <FaPlus className="mr-2" /> Add Category
                </button>
              </div>

              {filteredCategories.length === 0 ? (
                <div className={`text-center py-12 bg-${currentTheme.background} rounded-lg border border-${currentTheme.border}`}>
                  {searchQuery ? (
                    <>
                      <FaSearch className="mx-auto text-4xl text-gray-500 mb-4" />
                      <h3 className={`text-xl font-medium text-${currentTheme.text}`}>No matching categories</h3>
                      <p className="text-gray-400 mt-2">Try different search terms</p>
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <h3 className={`text-xl font-medium text-${currentTheme.text}`}>No categories defined</h3>
                      <p className="text-gray-400 mt-2">Add categories to organize your inventory and transactions</p>
                    </>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCategories.map(category => (
                    <div 
                      key={category.id} 
                      className={`bg-${currentTheme.background} rounded-lg border border-${currentTheme.border} overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200`}
                    >
                      <div className={`bg-${category.color} h-2 w-full`}></div>
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <h3 className={`text-lg font-medium text-${currentTheme.text}`}>{category.name}</h3>
                          <span className={`px-2 py-1 bg-${currentTheme.background} text-xs rounded-full border border-${currentTheme.border} text-gray-400`}>
                            {category.type === "both" ? "Inventory & Transactions" : 
                             category.type === "inventory" ? "Inventory Only" : "Transactions Only"}
                          </span>
                        </div>
                        <p className="mt-2 text-gray-400 text-sm">{category.description}</p>
                        <div className="mt-4 flex justify-end space-x-2">
                          <button 
                            className={`text-${currentTheme.accent} hover:text-${currentTheme.primary} text-sm`}
                            onClick={() => setEditingCategory(category)}
                          >
                            Edit
                          </button>
                          <button 
                            className={`text-${currentTheme.danger} hover:text-${currentTheme.danger}/80 text-sm`}
                            onClick={() => deleteCategory(category.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Inventory Modal - Dark UI */}
      {showInventoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300">
          <div 
            className={`bg-${currentTheme.cardBackground} p-0 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100 opacity-100 border border-${currentTheme.border}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`flex justify-between items-center px-6 py-4 border-b border-${currentTheme.border}`}>
              <h3 className={`text-xl font-bold text-${currentTheme.text} flex items-center`}>
                <FaBoxOpen className={`mr-2 text-${currentTheme.accent}`} />
                {editingInventoryItem ? 'Edit Inventory Item' : 'Add Inventory Item'}
              </h3>
              <button 
                onClick={() => {
                  setShowInventoryModal(false);
                  setEditingInventoryItem(null);
                }}
                className={`text-gray-400 hover:text-${currentTheme.text} transition-colors duration-200 p-1 rounded-full hover:bg-${currentTheme.background}`}
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="px-6 py-4">
              <form onSubmit={(e) => { 
                e.preventDefault(); 
                editingInventoryItem ? updateInventoryItem() : addInventoryItem();
              }}>
                <div className="mb-4">
                  <label className={`block text-sm font-medium text-${currentTheme.text} mb-1`}>Item Name</label>
                  <input 
                    type="text" 
                    name="name"
                    value={inventoryFormData.name}
                    onChange={handleInventoryFormChange}
                    className={`w-full p-3 bg-${currentTheme.background} border border-${currentTheme.border} text-${currentTheme.text} rounded-lg focus:ring-2 focus:ring-${currentTheme.primary} focus:border-${currentTheme.primary} transition-all duration-200 text-sm`}
                    required
                    placeholder="Enter item name"
                  />
                </div>
                
                <div className="mb-4">
                  <label className={`block text-sm font-medium text-${currentTheme.text} mb-1`}>SKU</label>
                  <input 
                    type="text" 
                    name="sku"
                    value={inventoryFormData.sku}
                    onChange={handleInventoryFormChange}
                    className={`w-full p-3 bg-${currentTheme.background} border border-${currentTheme.border} text-${currentTheme.text} rounded-lg focus:ring-2 focus:ring-${currentTheme.primary} focus:border-${currentTheme.primary} transition-all duration-200 text-sm`}
                    required
                    placeholder="Stock keeping unit"
                  />
                </div>
                
                <div className="mb-4">
                  <label className={`block text-sm font-medium text-${currentTheme.text} mb-1`}>Category</label>
                  <select 
                    name="category"
                    value={inventoryFormData.category}
                    onChange={handleInventoryFormChange}
                    className={`w-full p-3 bg-${currentTheme.background} border border-${currentTheme.border} text-${currentTheme.text} rounded-lg focus:ring-2 focus:ring-${currentTheme.primary} focus:border-${currentTheme.primary} transition-all duration-200 text-sm`}
                    required
                  >
                    <option value="">Select a category</option>
                    {categories
                      .filter(cat => cat.type === "inventory" || cat.type === "both")
                      .map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))
                    }
                  </select>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className={`block text-sm font-medium text-${currentTheme.text} mb-1`}>Quantity</label>
                    <input 
                      type="number" 
                      name="quantity"
                      title="Quantity"
                      value={inventoryFormData.quantity}
                      onChange={handleInventoryFormChange}
                      className={`w-full p-3 bg-${currentTheme.background} border border-${currentTheme.border} text-${currentTheme.text} rounded-lg focus:ring-2 focus:ring-${currentTheme.primary} focus:border-${currentTheme.primary} transition-all duration-200 text-sm`}
                      min="0"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium text-${currentTheme.text} mb-1`}>
                      Cost <span className="text-gray-500 text-xs">({selectedCurrency.symbol})</span>
                    </label>
                    <input 
                      type="number" 
                      name="costPrice"
                      title="Cost Price"
                      value={inventoryFormData.costPrice}
                      onChange={handleInventoryFormChange}
                      className={`w-full p-3 bg-${currentTheme.background} border border-${currentTheme.border} text-${currentTheme.text} rounded-lg focus:ring-2 focus:ring-${currentTheme.primary} focus:border-${currentTheme.primary} transition-all duration-200 text-sm`}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium text-${currentTheme.text} mb-1`}>
                      Price <span className="text-gray-500 text-xs">({selectedCurrency.symbol})</span>
                    </label>
                    <input 
                      type="number" 
                      name="sellingPrice"
                      title="Selling Price"
                      value={inventoryFormData.sellingPrice}
                      onChange={handleInventoryFormChange}
                      className={`w-full p-3 bg-${currentTheme.background} border border-${currentTheme.border} text-${currentTheme.text} rounded-lg focus:ring-2 focus:ring-${currentTheme.primary} focus:border-${currentTheme.primary} transition-all duration-200 text-sm`}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>
                
                <div className={`flex justify-end space-x-3 mt-8 pt-4 border-t border-${currentTheme.border}`}>
                  <button 
                    type="button"
                    onClick={() => {
                      setShowInventoryModal(false);
                      setEditingInventoryItem(null);
                    }}
                    className={`px-4 py-2.5 bg-${currentTheme.background} hover:bg-${currentTheme.background}/80 text-${currentTheme.text} rounded-lg shadow-sm font-medium transition-all duration-200 border border-${currentTheme.border} text-sm`}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className={`px-5 py-2.5 bg-${currentTheme.primary} hover:bg-${currentTheme.primary}/80 text-${currentTheme.buttonText} rounded-lg shadow-sm font-medium transition-all duration-200 flex items-center text-sm`}
                  >
                    <FaPlus className="mr-2 h-4 w-4" /> 
                    {editingInventoryItem ? 'Update Item' : 'Save Item'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Modal - Improved design */}
      {showTransactionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300">
          <div 
            className={`bg-${currentTheme.cardBackground} p-0 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100 opacity-100 border border-${currentTheme.border}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`flex justify-between items-center px-6 py-4 border-b border-${currentTheme.border}`}>
              <h3 className={`text-xl font-bold text-${currentTheme.text} flex items-center`}>
                <FaBook className={`mr-2 text-${currentTheme.accent}`} />
                {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
              </h3>
              <button 
                onClick={() => {
                  setShowTransactionModal(false);
                  setEditingTransaction(null);
                }}
                className={`text-gray-400 hover:text-${currentTheme.text} transition-colors duration-200 p-1 rounded-full hover:bg-${currentTheme.background}`}
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="px-6 py-4">
              <form onSubmit={(e) => { 
                e.preventDefault(); 
                editingTransaction ? updateTransaction() : addTransaction();
              }}>
                <div className="mb-4">
                  <label className={`block text-sm font-medium text-${currentTheme.text} mb-1`}>Description</label>
                  <input 
                    type="text" 
                    name="description"
                    value={transactionFormData.description}
                    onChange={handleTransactionFormChange}
                    className={`w-full p-3 bg-${currentTheme.background} border border-${currentTheme.border} text-${currentTheme.text} rounded-lg focus:ring-2 focus:ring-${currentTheme.primary} focus:border-${currentTheme.primary} transition-all duration-200 text-sm`}
                    required
                    placeholder="Transaction description"
                  />
                </div>
                
                <div className="mb-4">
                  <label className={`block text-sm font-medium text-${currentTheme.text} mb-1`}>Type</label>
                  <div className="flex space-x-2 mb-2">
                    <button
                      type="button"
                      className={`flex-1 py-3 px-4 rounded-lg font-medium border ${
                        transactionFormData.type === "income" 
                          ? `bg-${currentTheme.success}/30 text-${currentTheme.success} border-${currentTheme.success}/30`
                          : `bg-${currentTheme.background} text-${currentTheme.text} border-${currentTheme.border} hover:bg-${currentTheme.background}/80`
                      }`}
                      onClick={() => setTransactionFormData({...transactionFormData, type: "income"})}
                    >
                      Income
                    </button>
                    <button
                      type="button"
                      className={`flex-1 py-3 px-4 rounded-lg font-medium border ${
                        transactionFormData.type === "expense" 
                          ? `bg-${currentTheme.danger}/30 text-${currentTheme.danger} border-${currentTheme.danger}/30`
                          : `bg-${currentTheme.background} text-${currentTheme.text} border-${currentTheme.border} hover:bg-${currentTheme.background}/80`
                      }`}
                      onClick={() => setTransactionFormData({...transactionFormData, type: "expense"})}
                    >
                      Expense
                    </button>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className={`block text-sm font-medium text-${currentTheme.text} mb-1`}>Category</label>
                  <select 
                    name="category"
                    value={transactionFormData.category}
                    onChange={handleTransactionFormChange}
                    className={`w-full p-3 bg-${currentTheme.background} border border-${currentTheme.border} text-${currentTheme.text} rounded-lg focus:ring-2 focus:ring-${currentTheme.primary} focus:border-${currentTheme.primary} transition-all duration-200 text-sm`}
                    required
                  >
                    <option value="">Select a category</option>
                    {categories
                      .filter(cat => cat.type === "transaction" || cat.type === "both")
                      .map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))
                    }
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className={`block text-sm font-medium text-${currentTheme.text} mb-1`}>
                      Amount <span className="text-gray-500 text-xs">({selectedCurrency.symbol})</span>
                    </label>
                    <input 
                      type="number" 
                      title="Transaction amount"
                      name="amount"
                      value={transactionFormData.amount}
                      onChange={handleTransactionFormChange}
                      className={`w-full p-3 bg-${currentTheme.background} border border-${currentTheme.border} text-${currentTheme.text} rounded-lg focus:ring-2 focus:ring-${currentTheme.primary} focus:border-${currentTheme.primary} transition-all duration-200 text-sm`}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium text-${currentTheme.text} mb-1`}>Date</label>
                    <input 
                      type="date" 
                      name="date"
                      title="Transaction date"
                      value={transactionFormData.date}
                      onChange={handleTransactionFormChange}
                      className={`w-full p-3 bg-${currentTheme.background} border border-${currentTheme.border} text-${currentTheme.text} rounded-lg focus:ring-2 focus:ring-${currentTheme.primary} focus:border-${currentTheme.primary} transition-all duration-200 text-sm`}
                      required
                    />
                  </div>
                </div>
                
                {inventory.length > 0 && (
                  <div className="mb-4">
                    <label className={`block text-sm font-medium text-${currentTheme.text} mb-1`}>Related Inventory Item (Optional)</label>
                    <select 
                      name="relatedInventoryId"
                      title="Related Inventory Item"
                      value={transactionFormData.relatedInventoryId || ""}
                      onChange={handleTransactionFormChange}
                      className={`w-full p-3 bg-${currentTheme.background} border border-${currentTheme.border} text-${currentTheme.text} rounded-lg focus:ring-2 focus:ring-${currentTheme.primary} focus:border-${currentTheme.primary} transition-all duration-200 text-sm`}
                    >
                      <option value="">None</option>
                      {inventory.map(item => (
                        <option key={item.id} value={item.id}>{item.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                
                <div className={`flex justify-end space-x-3 mt-8 pt-4 border-t border-${currentTheme.border}`}>
                  <button 
                    type="button"
                    onClick={() => {
                      setShowTransactionModal(false);
                      setEditingTransaction(null);
                    }}
                    className={`px-4 py-2.5 bg-${currentTheme.background} hover:bg-${currentTheme.background}/80 text-${currentTheme.text} rounded-lg shadow-sm font-medium transition-all duration-200 border border-${currentTheme.border} text-sm`}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className={`px-5 py-2.5 ${transactionFormData.type === "income" ? `bg-${currentTheme.success} hover:bg-${currentTheme.success}/80` : `bg-${currentTheme.primary} hover:bg-${currentTheme.primary}/80`} text-${currentTheme.buttonText} rounded-lg shadow-sm font-medium transition-all duration-200 flex items-center text-sm`}
                  >
                    <FaPlus className="mr-2 h-4 w-4" /> 
                    {editingTransaction ? 'Update Transaction' : 'Save Transaction'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceiptModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300">
          <div
            className={`bg-${currentTheme.cardBackground} p-0 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100 opacity-100 border border-${currentTheme.border}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`flex justify-between items-center px-6 py-4 border-b border-${currentTheme.border}`}>
              <h3 className={`text-xl font-bold text-${currentTheme.text} flex items-center`}>
                <FaBook className={`mr-2 text-${currentTheme.accent}`} />
                {editingReceipt ? 'Edit Receipt' : 'Add Receipt'}
              </h3>
              <button
                onClick={() => {
                  setShowReceiptModal(false);
                  setEditingReceipt(null);
                }}
                className={`text-gray-400 hover:text-${currentTheme.text} transition-colors duration-200 p-1 rounded-full hover:bg-${currentTheme.background}`}
              >
                <FaTimes />
              </button>
            </div>

            <div className="px-6 py-4">
              <form onSubmit={(e) => {
                e.preventDefault();
                editingReceipt ? updateReceipt() : addReceipt();
              }}>
                <div className="mb-4">
                  <label className={`block text-sm font-medium text-${currentTheme.text} mb-1`}>Date</label>
                  <input
                    type="date"
                    name="date"
                    title="Receipt date"
                    aria-label="Receipt date"
                    value={receiptFormData.date}
                    onChange={handleReceiptFormChange}
                    className={`w-full p-3 bg-${currentTheme.background} border border-${currentTheme.border} text-${currentTheme.text} rounded-lg focus:ring-2 focus:ring-${currentTheme.primary} focus:border-${currentTheme.primary} transition-all duration-200 text-sm`}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className={`block text-sm font-medium text-${currentTheme.text} mb-1`}>Customer ID</label>
                  <input
                    type="text"
                    name="customerId"
                    value={receiptFormData.customerId}
                    onChange={handleReceiptFormChange}
                    className={`w-full p-3 bg-${currentTheme.background} border border-${currentTheme.border} text-${currentTheme.text} rounded-lg focus:ring-2 focus:ring-${currentTheme.primary} focus:border-${currentTheme.primary} transition-all duration-200 text-sm`}
                    required
                    placeholder="Enter customer ID"
                  />
                </div>

                <div className="mb-4">
                  <label className={`block text-sm font-medium text-${currentTheme.text} mb-1`}>Customer Name</label>
                  <input
                    type="text"
                    name="customerName"
                    value={receiptFormData.customerName}
                    onChange={handleReceiptFormChange}
                    className={`w-full p-3 bg-${currentTheme.background} border border-${currentTheme.border} text-${currentTheme.text} rounded-lg focus:ring-2 focus:ring-${currentTheme.primary} focus:border-${currentTheme.primary} transition-all duration-200 text-sm`}
                    required
                    placeholder="Enter customer name"
                  />
                </div>

                <div className="mb-4">
                  <label className={`block text-sm font-medium text-${currentTheme.text} mb-1`}>Items</label>
                  
                  <div className={`bg-${currentTheme.background} rounded-lg border border-${currentTheme.border} p-4 mb-3`}>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2">
                        <label className="block text-xs text-gray-400 mb-1">Select Item</label>
                        <select
                          title="Select inventory item"
                          aria-label="Select inventory item"
                          className={`w-full p-2 bg-${currentTheme.background} border border-${currentTheme.border} text-${currentTheme.text} rounded-lg focus:ring-2 focus:ring-${currentTheme.primary} focus:border-${currentTheme.primary} transition-all duration-200 text-sm`}
                          value=""
                          onChange={(e) => {
                            if (e.target.value) {
                              const selectedItem = inventory.find(item => item.id === e.target.value);
                              if (selectedItem) {
                                const receiptItem = {
                                  id: selectedItem.id,
                                  name: selectedItem.name,
                                  quantity: 1,
                                  price: selectedItem.sellingPrice
                                };
                                setReceiptFormData({
                                  ...receiptFormData,
                                  items: [...receiptFormData.items, receiptItem],
                                  totalAmount: receiptFormData.totalAmount + selectedItem.sellingPrice
                                });
                                e.target.value = ""; // Reset select
                              }
                            }
                          }}
                        >
                          <option value="">-- Select an item --</option>
                          {inventory
                            .filter(item => item.quantity > 0)
                            .filter(item => {
                              const existingItem = receiptFormData.items.find(receiptItem => receiptItem.id === item.id);
                              
                              // If editing, we need to consider the original receipt quantities
                              if (editingReceipt && existingItem) {
                                const originalItem = editingReceipt.items.find(origItem => origItem.id === item.id);
                                if (originalItem) {
                                  // Only filter out if quantity in form exceeds available + original
                                  return existingItem.quantity < (item.quantity + originalItem.quantity);
                                }
                              }
                              
                              // For new receipts, just check if there's still available inventory
                              return !existingItem || existingItem.quantity < item.quantity;
                            })
                            .map(item => {
                              // Calculate available quantity
                              const existingItem = receiptFormData.items.find(receiptItem => receiptItem.id === item.id);
                              let availableQty = item.quantity;
                              
                              if (existingItem) {
                                if (editingReceipt) {
                                  const originalItem = editingReceipt.items.find(origItem => origItem.id === item.id);
                                  if (originalItem) {
                                    availableQty = item.quantity + originalItem.quantity - existingItem.quantity;
                                  } else {
                                    availableQty = item.quantity - existingItem.quantity;
                                  }
                                } else {
                                  availableQty = item.quantity - existingItem.quantity;
                                }
                              }
                              
                              return (
                                <option key={item.id} value={item.id}>
                                  {item.name} - {formatCurrency(item.sellingPrice)} (Available: {availableQty})
                                </option>
                              );
                            })
                          }
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Quantity</label>
                        <input
                          type="number"
                          className={`w-full p-2 bg-${currentTheme.background} border border-${currentTheme.border} text-${currentTheme.text} rounded-lg focus:ring-2 focus:ring-${currentTheme.primary} focus:border-${currentTheme.primary} transition-all duration-200 text-sm`}
                          min="1"
                          placeholder="Quantity"
                          title="Item quantity"
                          aria-label="Item quantity"
                          disabled
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Item List */}
                  {receiptFormData.items.length > 0 ? (
                    <div className={`bg-${currentTheme.background} rounded-lg border border-${currentTheme.border} overflow-hidden`}>
                      <table className="min-w-full divide-y divide-gray-700">
                        <thead>
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-400">Item</th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-400">Quantity</th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-400">Price</th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-400">Total</th>
                            <th className="px-3 py-2 text-xs font-medium text-gray-400"></th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y divide-${currentTheme.border}`}>
                          {receiptFormData.items.map((item, index) => (
                            <tr key={`${item.id}-${index}`}>
                              <td className={`px-3 py-2 text-sm text-${currentTheme.text}`}>{item.name}</td>
                              <td className="px-3 py-2 text-right">
                                <input 
                                  type="number" 
                                  title={`Quantity for ${item.name}`}
                                  placeholder="Qty"
                                  aria-label={`Quantity for ${item.name}`}
                                  className={`w-16 p-1 bg-${currentTheme.background} border border-${currentTheme.border} text-${currentTheme.text} rounded text-sm text-center`}
                                  min="1"
                                  value={item.quantity}
                                  max={(() => {
                                    const inventoryItem = inventory.find(invItem => invItem.id === item.id);
                                    if (!inventoryItem) return 1;
                                    
                                    // If editing, we need to account for the original quantity
                                    if (editingReceipt) {
                                      const originalItem = editingReceipt.items.find(origItem => origItem.id === item.id);
                                      if (originalItem) {
                                        return originalItem.quantity + inventoryItem.quantity;
                                      }
                                    }
                                    
                                    return inventoryItem.quantity;
                                  })()}
                                  onChange={(e) => {
                                    const inventoryItem = inventory.find(invItem => invItem.id === item.id);
                                    if (!inventoryItem) return;
                                    
                                    let maxAllowed = inventoryItem.quantity;
                                    
                                    // If editing, we need to account for the original quantity
                                    if (editingReceipt) {
                                      const originalItem = editingReceipt.items.find(origItem => origItem.id === item.id);
                                      if (originalItem) {
                                        maxAllowed += originalItem.quantity;
                                      }
                                    }
                                    
                                    // Parse and cap the new quantity
                                    const newValue = parseInt(e.target.value) || 1;
                                    const newQuantity = Math.min(newValue, maxAllowed);
                                    
                                    if (newValue > maxAllowed) {
                                      // Provide feedback that we've limited the quantity
                                      alert(`Maximum available quantity for ${item.name} is ${maxAllowed}`);
                                    }
                                    
                                    const newItems = [...receiptFormData.items];
                                    const oldTotal = item.quantity * item.price;
                                    const newTotal = newQuantity * item.price;
                                    
                                    newItems[index] = {
                                      ...item,
                                      quantity: newQuantity
                                    };
                                    
                                    setReceiptFormData({
                                      ...receiptFormData,
                                      items: newItems,
                                      totalAmount: receiptFormData.totalAmount - oldTotal + newTotal
                                    });
                                  }}
                                />
                              </td>
                              <td className={`px-3 py-2 text-right text-sm text-${currentTheme.text}`}>{formatCurrency(item.price)}</td>
                              <td className={`px-3 py-2 text-right text-sm text-${currentTheme.success}`}>
                                {formatCurrency(item.price * item.quantity)}
                              </td>
                              <td className="px-3 py-2 text-center">
                                <button
                                  type="button"
                                  title="Remove item"
                                  aria-label="Remove item from receipt"
                                  className={`text-${currentTheme.danger} hover:text-${currentTheme.danger}/80`}
                                  onClick={() => {
                                    const newItems = receiptFormData.items.filter((_, i) => i !== index);
                                    const itemTotal = item.price * item.quantity;
                                    
                                    setReceiptFormData({
                                      ...receiptFormData,
                                      items: newItems,
                                      totalAmount: receiptFormData.totalAmount - itemTotal
                                    });
                                  }}
                                >
                                  <FaTimes />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className={`border-t-2 border-${currentTheme.primary}/30`}>
                            <td className={`px-3 py-2 text-sm font-medium text-${currentTheme.text}`} colSpan={3}>
                              Total
                            </td>
                            <td className={`px-3 py-2 text-right text-sm font-bold text-${currentTheme.success}`}>
                              {formatCurrency(receiptFormData.totalAmount)}
                            </td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  ) : (
                    <div className={`text-center py-4 bg-${currentTheme.background} rounded-lg border border-${currentTheme.border}`}>
                      <p className="text-gray-400 text-sm">No items added to receipt</p>
                    </div>
                  )}
                </div>

                {/* Remove the manual total amount input field since we're calculating it automatically */}
                {/* Instead, add this hidden field to keep the form working */}
                <input
                  type="hidden"
                  name="totalAmount"
                  value={receiptFormData.totalAmount}
                  title="Receipt Total Amount"
                  placeholder="Receipt Total Amount"
                />

                <div className={`flex justify-end space-x-3 mt-8 pt-4 border-t border-${currentTheme.border}`}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowReceiptModal(false);
                      setEditingReceipt(null);
                    }}
                    className={`px-4 py-2.5 bg-${currentTheme.background} hover:bg-${currentTheme.background}/80 text-${currentTheme.text} rounded-lg shadow-sm font-medium transition-all duration-200 border border-${currentTheme.border} text-sm`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-5 py-2.5 bg-${currentTheme.primary} hover:bg-${currentTheme.primary}/80 text-${currentTheme.buttonText} rounded-lg shadow-sm font-medium transition-all duration-200 flex items-center text-sm`}
                  >
                    <FaPlus className="mr-2 h-4 w-4" />
                    {editingReceipt ? 'Update Receipt' : 'Save Receipt'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300">
          <div 
            className={`bg-${currentTheme.cardBackground} p-0 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100 opacity-100 border border-${currentTheme.border}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`flex justify-between items-center px-6 py-4 border-b border-${currentTheme.border}`}>
              <h3 className={`text-xl font-bold text-${currentTheme.text} flex items-center`}>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 text-${currentTheme.accent}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h3>
              <button 
                onClick={() => {
                  setShowCategoryModal(false);
                  setEditingCategory(null);
                }}
                className={`text-gray-400 hover:text-${currentTheme.text} transition-colors duration-200 p-1 rounded-full hover:bg-${currentTheme.background}`}
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="px-6 py-4">
              <form onSubmit={(e) => { 
                e.preventDefault(); 
                editingCategory ? updateCategory() : addCategory();
              }}>
                <div className="mb-4">
                  <label className={`block text-sm font-medium text-${currentTheme.text} mb-1`}>Category Name</label>
                  <input 
                    type="text" 
                    name="name"
                    value={categoryFormData.name}
                    onChange={handleCategoryFormChange}
                    className={`w-full p-3 bg-${currentTheme.background} border border-${currentTheme.border} text-${currentTheme.text} rounded-lg focus:ring-2 focus:ring-${currentTheme.primary} focus:border-${currentTheme.primary} transition-all duration-200 text-sm`}
                    required
                    placeholder="Enter category name"
                  />
                </div>
                
                <div className="mb-4">
                  <label className={`block text-sm font-medium text-${currentTheme.text} mb-1`}>Description</label>
                  <textarea 
                    name="description"
                    value={categoryFormData.description}
                    onChange={handleCategoryFormChange}
                    className={`w-full p-3 bg-${currentTheme.background} border border-${currentTheme.border} text-${currentTheme.text} rounded-lg focus:ring-2 focus:ring-${currentTheme.primary} focus:border-${currentTheme.primary} transition-all duration-200 text-sm`}
                    rows={3}
                    placeholder="Category description (optional)"
                  ></textarea>
                </div>
                
                <div className="mb-4">
                  <label className={`block text-sm font-medium text-${currentTheme.text} mb-1`}>Category Type</label>
                  <select
                    name="type"
                    title="Category Type"
                    value={categoryFormData.type}
                    onChange={handleCategoryFormChange}
                    className={`w-full p-3 bg-${currentTheme.background} border border-${currentTheme.border} text-${currentTheme.text} rounded-lg focus:ring-2 focus:ring-${currentTheme.primary} focus:border-${currentTheme.primary} transition-all duration-200 text-sm`}
                    required
                  >
                    <option value="both">Both Inventory & Transactions</option>
                    <option value="inventory">Inventory Only</option>
                    <option value="transaction">Transactions Only</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className={`block text-sm font-medium text-${currentTheme.text} mb-1`}>Color</label>
                  <div className="grid grid-cols-5 gap-2">
                    {categoryColors.map(color => (
                      <div 
                        key={color} 
                        className={`w-full aspect-square rounded-md cursor-pointer border-2 ${categoryFormData.color === color ? `border-${currentTheme.text}` : 'border-transparent'}`}
                        onClick={() => setCategoryFormData({...categoryFormData, color})}
                      >
                        <div className={`w-full h-full rounded bg-${color} hover:opacity-80 transition-opacity`}></div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className={`flex justify-end space-x-3 mt-8 pt-4 border-t border-${currentTheme.border}`}>
                  <button 
                    type="button"
                    onClick={() => {
                      setShowCategoryModal(false);
                      setEditingCategory(null);
                    }}
                    className={`px-4 py-2.5 bg-${currentTheme.background} hover:bg-${currentTheme.background}/80 text-${currentTheme.text} rounded-lg shadow-sm font-medium transition-all duration-200 border border-${currentTheme.border} text-sm`}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className={`px-5 py-2.5 bg-${currentTheme.primary} hover:bg-${currentTheme.primary}/80 text-${currentTheme.buttonText} rounded-lg shadow-sm font-medium transition-all duration-200 flex items-center text-sm`}
                  >
                    <FaPlus className="mr-2 h-4 w-4" /> 
                    {editingCategory ? 'Update Category' : 'Save Category'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}