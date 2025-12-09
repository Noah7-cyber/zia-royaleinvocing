import React, { useState, useEffect } from 'react';
import { Invoice, InvoiceItem, InvoiceStatus, AppSettings } from '../types';
import { generateId } from '../services/storage';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';

interface InvoiceFormProps {
  initialData?: Invoice;
  settings: AppSettings;
  onSave: (invoice: Invoice) => void;
  onCancel: () => void;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({ initialData, settings, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Invoice>(initialData || {
    id: generateId(),
    invoiceNumber: `INV-${Math.floor(Math.random() * 10000)}`,
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    client: { name: '', email: '', address: '' },
    items: [],
    status: InvoiceStatus.DRAFT,
    subtotal: 0,
    taxRate: settings.taxRate,
    taxAmount: 0,
    total: 0,
  });

  // Calculate totals whenever items or tax rate changes
  useEffect(() => {
    const subtotal = formData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxAmount = subtotal * (formData.taxRate / 100);
    const total = subtotal + taxAmount;
    setFormData(prev => ({ ...prev, subtotal, taxAmount, total }));
  }, [formData.items, formData.taxRate]);

  const handleClientChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, client: { ...prev.client, [field]: value } }));
  };

  const addItem = () => {
    const newItem: InvoiceItem = { id: generateId(), description: '', quantity: 1, price: 0 };
    setFormData(prev => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const removeItem = (id: string) => {
    setFormData(prev => ({ ...prev, items: prev.items.filter(i => i.id !== id) }));
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 max-w-5xl mx-auto bg-white rounded-xl shadow-lg border border-gray-100 my-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <button type="button" onClick={onCancel} className="flex items-center text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </button>
        <h2 className="text-2xl font-bold text-gray-800">
          {initialData ? 'Edit Invoice' : 'New Invoice'}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Invoice Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Invoice Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">Number</label>
              <input 
                type="text" 
                required
                className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-purple-200 outline-none"
                value={formData.invoiceNumber}
                onChange={e => setFormData({...formData, invoiceNumber: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Status</label>
              <select 
                className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-purple-200 outline-none"
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value as InvoiceStatus})}
              >
                {Object.values(InvoiceStatus).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Date</label>
              <input 
                type="date" 
                required
                className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-purple-200 outline-none"
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Due Date</label>
              <input 
                type="date" 
                required
                className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-purple-200 outline-none"
                value={formData.dueDate}
                onChange={e => setFormData({...formData, dueDate: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Client Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Bill To</h3>
          <div>
            <label className="block text-sm font-medium text-gray-600">Client Name</label>
            <input 
              type="text" 
              required
              className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-purple-200 outline-none"
              value={formData.client.name}
              onChange={e => handleClientChange('name', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Email</label>
            <input 
              type="email" 
              className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-purple-200 outline-none"
              value={formData.client.email}
              onChange={e => handleClientChange('email', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Address</label>
            <textarea 
              rows={2}
              className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-purple-200 outline-none"
              value={formData.client.address}
              onChange={e => handleClientChange('address', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Items</h3>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="grid grid-cols-12 gap-4 mb-2 text-sm font-medium text-gray-500 uppercase">
            <div className="col-span-6">Description</div>
            <div className="col-span-2">Qty</div>
            <div className="col-span-3">Price</div>
            <div className="col-span-1"></div>
          </div>
          
          <div className="space-y-3">
            {formData.items.map((item) => (
              <div key={item.id} className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-6">
                  <input 
                    type="text" 
                    placeholder="Item description"
                    className="w-full p-2 border rounded-md focus:ring-1 focus:ring-purple-500 outline-none"
                    value={item.description}
                    onChange={e => updateItem(item.id, 'description', e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <input 
                    type="number" 
                    min="1"
                    className="w-full p-2 border rounded-md focus:ring-1 focus:ring-purple-500 outline-none"
                    value={item.quantity}
                    onChange={e => updateItem(item.id, 'quantity', parseFloat(e.target.value))}
                  />
                </div>
                <div className="col-span-3">
                  <input 
                    type="number" 
                    min="0"
                    step="0.01"
                    className="w-full p-2 border rounded-md focus:ring-1 focus:ring-purple-500 outline-none"
                    value={item.price}
                    onChange={e => updateItem(item.id, 'price', parseFloat(e.target.value))}
                  />
                </div>
                <div className="col-span-1 text-right">
                  <button 
                    type="button" 
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button 
            type="button" 
            onClick={addItem}
            className="mt-4 flex items-center text-sm text-purple-600 hover:text-purple-800 font-medium"
          >
            <Plus className="w-4 h-4 mr-1" /> Add Item
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="flex justify-end">
        <div className="w-full md:w-1/3 space-y-3">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>{settings.currency}{formData.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-gray-600">
            <span className="flex items-center gap-2">
              Tax Rate % 
              <input 
                type="number" 
                className="w-16 p-1 text-sm border rounded"
                value={formData.taxRate}
                onChange={e => setFormData({...formData, taxRate: parseFloat(e.target.value) || 0})}
              />
            </span>
            <span>{settings.currency}{formData.taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xl font-bold text-gray-800 border-t pt-3">
            <span>Total</span>
            <span style={{ color: settings.primaryColor }}>
              {settings.currency}{formData.total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-4 border-t flex justify-end gap-4">
        <button 
          type="button" 
          onClick={onCancel}
          className="px-6 py-2 border rounded-lg text-gray-600 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center shadow-lg"
          style={{ backgroundColor: settings.primaryColor }}
        >
          <Save className="w-4 h-4 mr-2" /> Save Invoice
        </button>
      </div>
    </form>
  );
};