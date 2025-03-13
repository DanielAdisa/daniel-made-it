"use client";

import { useState, useEffect } from "react";
import { FaBook, FaBoxOpen, FaChartLine, FaHome, FaPlus, FaSearch, FaTimes, FaDollarSign, FaChevronDown } from "react-icons/fa";

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

// Currency interface
interface Currency {
  code: string;
  symbol: string;
  name: string;
}

// Main component
export default function BookKeepingSystem() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "inventory" | "transactions">("dashboard");
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

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header - with gradient background */}
      <header className="bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-lg border-b border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto p-4 flex flex-col sm:flex-row justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center mb-2 sm:mb-0">
            <FaBook className="mr-2 text-indigo-400" />
            BookKeep Pro
          </h1>
          <div className="flex flex-col sm:flex-row items-center space-x-0 space-y-2 sm:space-y-0 sm:space-x-4">
            {/* Currency Selector */}
            <div className="relative" id="currency-dropdown">
              <button 
                className="flex items-center bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded transition-all duration-200 border border-gray-700 text-sm"
                onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
              >
                <FaDollarSign className="mr-1 text-indigo-400" />
                <span className="mr-1">{selectedCurrency.code}</span>
                <FaChevronDown size={12} className={`transform transition-transform duration-200 ${showCurrencyDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showCurrencyDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg z-10 py-1 border border-gray-700 overflow-hidden animate-fadeIn">
                  {currencies.map((currency) => (
                    <button
                      key={currency.code}
                      className={`flex items-center justify-between w-full text-left px-4 py-2 text-sm hover:bg-gray-700 transition-colors duration-150 ${
                        currency.code === selectedCurrency.code ? 'bg-gray-700 text-indigo-400' : 'text-white'
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
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 rounded-md bg-gray-800 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-gray-700 w-full sm:w-48 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 flex flex-col lg:flex-row">
        {/* Sidebar Navigation */}
        <aside className="w-full lg:w-64 bg-gray-800 rounded-lg shadow-md p-4 mb-6 lg:mb-0 lg:mr-8 border border-gray-700">
          <nav>
            <ul className="space-y-2">
              <li>
                <button
                  className={`w-full flex items-center p-3 rounded-md text-sm ${
                    activeTab === "dashboard" ? "bg-indigo-900/50 text-indigo-400" : "hover:bg-gray-700 text-gray-300"
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
                    activeTab === "inventory" ? "bg-indigo-900/50 text-indigo-400" : "hover:bg-gray-700 text-gray-300"
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
                    activeTab === "transactions" ? "bg-indigo-900/50 text-indigo-400" : "hover:bg-gray-700 text-gray-300"
                  }`}
                  onClick={() => setActiveTab("transactions")}
                >
                  <FaBook className="mr-3" />
                  <span>Transactions</span>
                </button>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 bg-gray-800 rounded-lg shadow-md p-6 border border-gray-700">
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center text-white">
                <FaChartLine className="mr-2 text-indigo-400" />
                Dashboard Overview
              </h2>
              
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gray-900 rounded-lg shadow-md p-6 border-l-4 border-indigo-500">
                  <h3 className="text-gray-400 text-sm">Inventory Value</h3>
                  <p className="text-2xl font-bold text-white">{formatCurrency(totalInventoryValue)}</p>
                </div>
                
                <div className="bg-gray-900 rounded-lg shadow-md p-6 border-l-4 border-emerald-500">
                  <h3 className="text-gray-400 text-sm">Total Sales</h3>
                  <p className="text-2xl font-bold text-white">{formatCurrency(totalSalesValue)}</p>
                </div>
                
                <div className="bg-gray-900 rounded-lg shadow-md p-6 border-l-4 border-rose-500">
                  <h3 className="text-gray-400 text-sm">Total Expenses</h3>
                  <p className="text-2xl font-bold text-white">{formatCurrency(totalExpenses)}</p>
                </div>
                
                <div className="bg-gray-900 rounded-lg shadow-md p-6 border-l-4 border-violet-500">
                  <h3 className="text-gray-400 text-sm">Profit</h3>
                  <p className={`text-2xl font-bold ${profit >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {formatCurrency(profit)}
                  </p>
                </div>
              </div>
              
              {/* Recent Activity */}
              <div>
                <h3 className="text-xl font-semibold mb-4 text-white border-b border-gray-700 pb-2">Recent Activity</h3>
                {transactions.length === 0 ? (
                  <p className="text-gray-400">No transactions recorded yet.</p>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-gray-700">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-gray-900">
                          <th className="p-4 text-gray-400 font-semibold">Date</th>
                          <th className="p-4 text-gray-400 font-semibold">Description</th>
                          <th className="p-4 text-gray-400 font-semibold">Category</th>
                          <th className="p-4 text-gray-400 font-semibold">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.slice(0, 5).map((transaction) => (
                          <tr key={transaction.id} className="border-b border-gray-700 hover:bg-gray-700/50">
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

          {activeTab === "inventory" && (
            <div>
              <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-3">
                <h2 className="text-2xl font-bold text-white">Inventory Management</h2>
                <button 
                  className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md shadow text-sm"
                  onClick={() => {
                    setEditingInventoryItem(null);  // Ensure we're not in edit mode
                    resetInventoryForm();  // Reset the form
                    setShowInventoryModal(true);  // Show the modal
                  }}
                >
                  <FaPlus className="mr-2" /> Add Item
                </button>
              </div>
              
              {inventory.length === 0 ? (
                <div className="text-center py-12 bg-gray-900 rounded-lg border border-gray-700">
                  <FaBoxOpen className="mx-auto text-4xl text-gray-500 mb-4" />
                  <h3 className="text-xl font-medium text-gray-300">No inventory items yet</h3>
                  <p className="text-gray-400 mt-2">Add your first inventory item to get started</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-700">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-900">
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
                      {inventory.map((item) => (
                        <tr key={item.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                          <td className="p-4 text-gray-300">{item.name}</td>
                          <td className="p-4 text-gray-400">{item.sku}</td>
                          <td className="p-4">
                            <span className="px-2 py-1 rounded-full text-xs bg-indigo-900 text-indigo-300 border border-indigo-700">
                              {item.category}
                            </span>
                          </td>
                          <td className="p-4 text-gray-300">{item.quantity}</td>
                          <td className="p-4 text-gray-300">{formatCurrency(item.costPrice)}</td>
                          <td className="p-4 text-gray-300">{formatCurrency(item.sellingPrice)}</td>
                          <td className="p-4 space-x-2">
                            <button 
                              className="text-indigo-400 hover:text-indigo-300 text-sm"
                              onClick={() => setEditingInventoryItem(item)}
                            >
                              Edit
                            </button>
                            <button 
                              className="text-rose-400 hover:text-rose-300 text-sm"
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

          {activeTab === "transactions" && (
            <div>
              <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-3">
                <h2 className="text-2xl font-bold text-white">Financial Transactions</h2>
                <button 
                  className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md shadow text-sm"
                  onClick={() => {
                    setEditingTransaction(null);  // Ensure we're not in edit mode
                    resetTransactionForm();  // Reset the form
                    setShowTransactionModal(true);  // Show the modal
                  }}
                >
                  <FaPlus className="mr-2" /> Add Transaction
                </button>
              </div>
              
              {transactions.length === 0 ? (
                <div className="text-center py-12 bg-gray-900 rounded-lg border border-gray-700">
                  <FaBook className="mx-auto text-4xl text-gray-500 mb-4" />
                  <h3 className="text-xl font-medium text-gray-300">No transactions recorded</h3>
                  <p className="text-gray-400 mt-2">Add your first transaction to start tracking finances</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-700">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-900">
                        <th className="p-4 text-gray-400 font-semibold">Date</th>
                        <th className="p-4 text-gray-400 font-semibold">Description</th>
                        <th className="p-4 text-gray-400 font-semibold">Category</th>
                        <th className="p-4 text-gray-400 font-semibold">Type</th>
                        <th className="p-4 text-gray-400 font-semibold">Amount</th>
                        <th className="p-4 text-gray-400 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((transaction) => (
                        <tr key={transaction.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                          <td className="p-4 text-gray-300">{transaction.date.toLocaleDateString()}</td>
                          <td className="p-4 text-gray-300">{transaction.description}</td>
                          <td className="p-4 text-gray-300">{transaction.category}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              transaction.type === "income" ? "bg-emerald-900 text-emerald-300 border border-emerald-700" : "bg-rose-900 text-rose-300 border border-rose-700"
                            }`}>
                              {transaction.type}
                            </span>
                          </td>
                          <td className={`p-4 ${transaction.type === "income" ? "text-emerald-400" : "text-rose-400"}`}>
                            {formatCurrency(transaction.amount)}
                          </td>
                          <td className="p-4 space-x-2">
                            <button 
                              className="text-indigo-400 hover:text-indigo-300 text-sm"
                              onClick={() => setEditingTransaction(transaction)}
                            >
                              Edit
                            </button>
                            <button 
                              className="text-rose-400 hover:text-rose-300 text-sm"
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
        </div>
      </div>

      {/* Inventory Modal - Dark UI */}
      {showInventoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300">
          <div 
            className="bg-gray-800 p-0 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100 opacity-100 border border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-700">
              <h3 className="text-xl font-bold text-white flex items-center">
                <FaBoxOpen className="mr-2 text-indigo-400" />
                {editingInventoryItem ? 'Edit Inventory Item' : 'Add Inventory Item'}
              </h3>
              <button 
                onClick={() => {
                  setShowInventoryModal(false);
                  setEditingInventoryItem(null);
                }}
                className="text-gray-400 hover:text-white transition-colors duration-200 p-1 rounded-full hover:bg-gray-700"
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
                  <label className="block text-sm font-medium text-gray-300 mb-1">Item Name</label>
                  <input 
                    type="text" 
                    name="name"
                    value={inventoryFormData.name}
                    onChange={handleInventoryFormChange}
                    className="w-full p-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-sm"
                    required
                    placeholder="Enter item name"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-1">SKU</label>
                  <input 
                    type="text" 
                    name="sku"
                    value={inventoryFormData.sku}
                    onChange={handleInventoryFormChange}
                    className="w-full p-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-sm"
                    required
                    placeholder="Stock keeping unit"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                  <input 
                    type="text" 
                    name="category"
                    value={inventoryFormData.category}
                    onChange={handleInventoryFormChange}
                    className="w-full p-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-sm"
                    required
                    placeholder="Item category"
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Quantity</label>
                    <input 
                      type="number" 
                      name="quantity"
                      value={inventoryFormData.quantity}
                      onChange={handleInventoryFormChange}
                      className="w-full p-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-sm"
                      min="0"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Cost <span className="text-gray-500 text-xs">({selectedCurrency.symbol})</span>
                    </label>
                    <input 
                      type="number" 
                      name="costPrice"
                      value={inventoryFormData.costPrice}
                      onChange={handleInventoryFormChange}
                      className="w-full p-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-sm"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Price <span className="text-gray-500 text-xs">({selectedCurrency.symbol})</span>
                    </label>
                    <input 
                      type="number" 
                      name="sellingPrice"
                      value={inventoryFormData.sellingPrice}
                      onChange={handleInventoryFormChange}
                      className="w-full p-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-sm"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-8 pt-4 border-t border-gray-700">
                  <button 
                    type="button"
                    onClick={() => {
                      setShowInventoryModal(false);
                      setEditingInventoryItem(null);
                    }}
                    className="px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg shadow-sm font-medium transition-all duration-200 border border-gray-600 text-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm font-medium transition-all duration-200 flex items-center text-sm"
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
            className="bg-gray-800 p-0 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100 opacity-100 border border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-700">
              <h3 className="text-xl font-bold text-white flex items-center">
                <FaBook className="mr-2 text-indigo-400" />
                {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
              </h3>
              <button 
                onClick={() => {
                  setShowTransactionModal(false);
                  setEditingTransaction(null);
                }}
                className="text-gray-400 hover:text-white transition-colors duration-200 p-1 rounded-full hover:bg-gray-700"
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
                  <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                  <input 
                    type="text" 
                    name="description"
                    value={transactionFormData.description}
                    onChange={handleTransactionFormChange}
                    className="w-full p-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-sm"
                    required
                    placeholder="Transaction description"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Type</label>
                  <div className="flex space-x-2 mb-2">
                    <button
                      type="button"
                      className={`flex-1 py-3 px-4 rounded-lg font-medium border ${
                        transactionFormData.type === "income" 
                          ? "bg-emerald-900/80 text-emerald-300 border-emerald-700" 
                          : "bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600"
                      }`}
                      onClick={() => setTransactionFormData({...transactionFormData, type: "income"})}
                    >
                      Income
                    </button>
                    <button
                      type="button"
                      className={`flex-1 py-3 px-4 rounded-lg font-medium border ${
                        transactionFormData.type === "expense" 
                          ? "bg-rose-900/80 text-rose-300 border-rose-700" 
                          : "bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600"
                      }`}
                      onClick={() => setTransactionFormData({...transactionFormData, type: "expense"})}
                    >
                      Expense
                    </button>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                  <input 
                    type="text" 
                    name="category"
                    value={transactionFormData.category}
                    onChange={handleTransactionFormChange}
                    className="w-full p-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-sm"
                    required
                    placeholder="Transaction category"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Amount <span className="text-gray-500 text-xs">({selectedCurrency.symbol})</span>
                    </label>
                    <input 
                      type="number" 
                      name="amount"
                      value={transactionFormData.amount}
                      onChange={handleTransactionFormChange}
                      className="w-full p-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-sm"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Date</label>
                    <input 
                      type="date" 
                      name="date"
                      value={transactionFormData.date}
                      onChange={handleTransactionFormChange}
                      className="w-full p-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-sm"
                      required
                    />
                  </div>
                </div>
                
                {inventory.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-1">Related Inventory Item (Optional)</label>
                    <select 
                      name="relatedInventoryId"
                      value={transactionFormData.relatedInventoryId || ""}
                      onChange={handleTransactionFormChange}
                      className="w-full p-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-sm"
                    >
                      <option value="">None</option>
                      {inventory.map(item => (
                        <option key={item.id} value={item.id}>{item.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                
                <div className="flex justify-end space-x-3 mt-8 pt-4 border-t border-gray-700">
                  <button 
                    type="button"
                    onClick={() => {
                      setShowTransactionModal(false);
                      setEditingTransaction(null);
                    }}
                    className="px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg shadow-sm font-medium transition-all duration-200 border border-gray-600 text-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className={`px-5 py-2.5 ${transactionFormData.type === "income" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-indigo-600 hover:bg-indigo-700"} text-white rounded-lg shadow-sm font-medium transition-all duration-200 flex items-center text-sm`}
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
    </div>
  );
}
