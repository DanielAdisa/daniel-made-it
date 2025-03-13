'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';

interface TransactionFormProps {
  isEditing?: boolean;
  defaultValues?: Transaction;
  onSubmit: (data: TransactionFormData) => void;
  onCancel?: () => void;
}

export interface Transaction {
  id?: string;
  amount: number;
  title: string;
  category: string;
  date: string;
  type: 'income' | 'expense';
  notes?: string;
}

export type TransactionFormData = Omit<Transaction, 'id'>;

const transactionSchema = z.object({
  amount: z.number().positive('Amount must be greater than 0'),
  title: z.string().min(1, 'Title is required'),
  category: z.string().min(1, 'Category is required'),
  date: z.string().min(1, 'Date is required'),
  type: z.enum(['income', 'expense']),
  notes: z.string().optional(),
});

const categories = [
  { id: 'salary', name: 'Salary', type: 'income' },
  { id: 'investment', name: 'Investment', type: 'income' },
  { id: 'side-hustle', name: 'Side Hustle', type: 'income' },
  { id: 'gift', name: 'Gift', type: 'income' },
  { id: 'groceries', name: 'Groceries', type: 'expense' },
  { id: 'rent', name: 'Rent/Mortgage', type: 'expense' },
  { id: 'utilities', name: 'Utilities', type: 'expense' },
  { id: 'transportation', name: 'Transportation', type: 'expense' },
  { id: 'entertainment', name: 'Entertainment', type: 'expense' },
  { id: 'healthcare', name: 'Healthcare', type: 'expense' },
];

export default function TransactionForm({
  isEditing = false,
  defaultValues,
  onSubmit,
  onCancel,
}: TransactionFormProps) {
  const [formData, setFormData] = useState<TransactionFormData>({
    amount: defaultValues?.amount || 0,
    title: defaultValues?.title || '',
    category: defaultValues?.category || '',
    date: defaultValues?.date || new Date().toISOString().split('T')[0],
    type: defaultValues?.type || 'expense',
    notes: defaultValues?.notes || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [filteredCategories, setFilteredCategories] = useState(categories);
  
  useEffect(() => {
    setFilteredCategories(categories.filter(category => category.type === formData.type));
  }, [formData.type]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    if (name === 'amount') {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0,
      });
    } else if (name === 'type') {
      setFormData({
        ...formData,
        [name]: value as 'income' | 'expense',
        category: '', // Reset category when type changes
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const validateForm = (): boolean => {
    try {
      transactionSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">
        {isEditing ? 'Edit Transaction' : 'Add New Transaction'}
      </h2>
      
      <div className="flex space-x-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            aria-label="Transaction type"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">$</span>
            <input
              type="number"
              name="amount"
              value={formData.amount || ''}
              onChange={handleChange}
              step="0.01"
              min="0"
              placeholder="0.00"
              className="w-full pl-8 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Transaction title"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Category
        </label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          aria-label="Transaction category"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select a category</option>
          {filteredCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Date
        </label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          title="Transaction date"
          placeholder="Select date"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes (Optional)
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          placeholder="Add any additional notes..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {isEditing ? 'Update Transaction' : 'Add Transaction'}
        </button>
      </div>
    </form>
  );
}
