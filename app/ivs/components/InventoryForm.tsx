import { useState } from 'react';
import { FaSave, FaTimes } from 'react-icons/fa';

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

type InventoryFormProps = {
  item?: InventoryItem;
  onSave: (item: Omit<InventoryItem, 'id'>) => void;
  onCancel: () => void;
};

const CATEGORIES = ['Electronics', 'Books', 'Clothing', 'Food', 'Other'];

export default function InventoryForm({ item, onSave, onCancel }: InventoryFormProps) {
  const [formData, setFormData] = useState({
    name: item?.name || '',
    category: item?.category || CATEGORIES[0],
    quantity: item?.quantity || 0,
    costPrice: item?.costPrice || 0,
    sellingPrice: item?.sellingPrice || 0,
    sku: item?.sku || '',
    lastRestocked: item?.lastRestocked ? item.lastRestocked.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.sku.trim()) {
      newErrors.sku = 'SKU is required';
    }
    
    if (formData.quantity < 0) {
      newErrors.quantity = 'Quantity cannot be negative';
    }
    
    if (formData.costPrice <= 0) {
      newErrors.costPrice = 'Cost price must be greater than zero';
    }
    
    if (formData.sellingPrice <= 0) {
      newErrors.sellingPrice = 'Selling price must be greater than zero';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name.includes('Price') || name === 'quantity' ? parseFloat(value) : value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave({
        ...formData,
        lastRestocked: new Date(formData.lastRestocked),
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4">{item ? 'Edit Inventory Item' : 'Add New Inventory Item'}</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
              Item Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="sku">
              SKU
            </label>
            <input
              id="sku"
              name="sku"
              type="text"
              value={formData.sku}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${errors.sku ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.sku && <p className="mt-1 text-sm text-red-500">{errors.sku}</p>}
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="category">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              {CATEGORIES.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="quantity">
              Quantity
            </label>
            <input
              id="quantity"
              name="quantity"
              type="number"
              min="0"
              value={formData.quantity}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${errors.quantity ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.quantity && <p className="mt-1 text-sm text-red-500">{errors.quantity}</p>}
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="costPrice">
              Cost Price ($)
            </label>
            <input
              id="costPrice"
              name="costPrice"
              type="number"
              step="0.01"
              min="0"
              value={formData.costPrice}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${errors.costPrice ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.costPrice && <p className="mt-1 text-sm text-red-500">{errors.costPrice}</p>}
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="sellingPrice">
              Selling Price ($)
            </label>
            <input
              id="sellingPrice"
              name="sellingPrice"
              type="number"
              step="0.01"
              min="0"
              value={formData.sellingPrice}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${errors.sellingPrice ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.sellingPrice && <p className="mt-1 text-sm text-red-500">{errors.sellingPrice}</p>}
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="lastRestocked">
              Last Restocked Date
            </label>
            <input
              id="lastRestocked"
              name="lastRestocked"
              type="date"
              value={formData.lastRestocked}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <FaTimes className="mr-2" /> Cancel
          </button>
          
          <button
            type="submit"
            className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <FaSave className="mr-2" /> Save
          </button>
        </div>
      </form>
    </div>
  );
}
