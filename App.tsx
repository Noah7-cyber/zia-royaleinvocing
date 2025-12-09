import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Settings as SettingsIcon, 
  PlusCircle, 
  Menu, 
  X,
  CreditCard
} from 'lucide-react';
import { Invoice, AppSettings, ViewState } from './types';
import * as Storage from './services/storage';
import { Dashboard } from './components/Dashboard';
import { InvoiceForm } from './components/InvoiceForm';
import { InvoicePreview } from './components/InvoicePreview';

// --- Sidebar Component (Internal for simplicity) ---
const Sidebar = ({ currentView, setView, isOpen, toggle, color }: any) => {
  const menuItems = [
    { id: 'DASHBOARD', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'INVOICES', label: 'Invoices', icon: FileText },
    { id: 'CREATE_INVOICE', label: 'New Invoice', icon: PlusCircle },
    { id: 'SETTINGS', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" onClick={toggle} />
      )}
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static w-64 bg-white border-r border-gray-200 z-30 transition-transform duration-200 ease-in-out flex flex-col no-print`}>
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold" style={{ backgroundColor: color }}>
              ZR
            </div>
            <h1 className="font-bold text-xl text-gray-800 tracking-tight">Zia's Royalle</h1>
          </div>
          <button onClick={toggle} className="md:hidden text-gray-500">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setView(item.id); toggle(); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'text-white shadow-md' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                style={isActive ? { backgroundColor: color } : {}}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t text-xs text-gray-400 text-center">
          v1.0.0 • Local Storage
        </div>
      </div>
    </>
  );
};

// --- Main App ---
function App() {
  const [view, setView] = useState<ViewState>('DASHBOARD');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [settings, setSettings] = useState<AppSettings>(Storage.getSettings());
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Load data on mount
  useEffect(() => {
    setInvoices(Storage.getInvoices());
  }, []);

  // Handlers
  const handleSaveInvoice = (invoice: Invoice) => {
    Storage.saveInvoice(invoice);
    setInvoices(Storage.getInvoices());
    setView('INVOICES');
    setEditingInvoice(null);
  };

  const handleDeleteInvoice = (id: string) => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      Storage.deleteInvoice(id);
      setInvoices(Storage.getInvoices());
    }
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setView('EDIT_INVOICE');
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    Storage.saveSettings(settings);
    alert('Settings saved!');
  };

  // --- Render Views ---

  const renderInvoiceList = () => (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Invoices</h2>
        <button 
          onClick={() => setView('CREATE_INVOICE')}
          className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
          style={{ backgroundColor: settings.primaryColor }}
        >
          <PlusCircle size={18} /> New Invoice
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Number</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Client</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No invoices found. Create one to get started.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{inv.invoiceNumber}</td>
                    <td className="px-6 py-4 text-gray-600">{inv.client.name}</td>
                    <td className="px-6 py-4 text-gray-600">{inv.date}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{settings.currency}{inv.total.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${inv.status === 'Paid' ? 'bg-green-100 text-green-800' : 
                          inv.status === 'Pending' ? 'bg-amber-100 text-amber-800' : 
                          'bg-gray-100 text-gray-800'}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => setPreviewInvoice(inv)} className="text-gray-400 hover:text-blue-600">Preview</button>
                      <button onClick={() => handleEditInvoice(inv)} className="text-gray-400 hover:text-gray-600">Edit</button>
                      <button onClick={() => handleDeleteInvoice(inv.id)} className="text-red-400 hover:text-red-600">Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="p-6 max-w-3xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Settings</h2>
      <form onSubmit={handleSaveSettings} className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-2">
             <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
             <input 
               type="text" 
               className="w-full p-2 border rounded-lg"
               value={settings.businessName}
               onChange={(e) => setSettings({...settings, businessName: e.target.value})}
             />
          </div>

          <div className="col-span-2">
             <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
             <input 
               type="text" 
               className="w-full p-2 border rounded-lg"
               value={settings.logoUrl}
               onChange={(e) => setSettings({...settings, logoUrl: e.target.value})}
             />
             <p className="text-xs text-gray-500 mt-1">Paste a URL to your logo image. The default is Zia's Royalle logo.</p>
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
             <div className="flex items-center gap-3">
               <input 
                 type="color" 
                 className="h-10 w-20 rounded cursor-pointer"
                 value={settings.primaryColor}
                 onChange={(e) => setSettings({...settings, primaryColor: e.target.value})}
               />
               <span className="text-sm text-gray-500">{settings.primaryColor}</span>
             </div>
             <p className="text-xs text-gray-500 mt-1">This color will be used on invoices and buttons.</p>
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Currency Symbol</label>
             <input 
               type="text" 
               className="w-full p-2 border rounded-lg"
               value={settings.currency}
               onChange={(e) => setSettings({...settings, currency: e.target.value})}
             />
          </div>

           <div className="col-span-2">
             <label className="block text-sm font-medium text-gray-700 mb-1">Business Address</label>
             <textarea 
               rows={3}
               className="w-full p-2 border rounded-lg"
               value={settings.businessAddress}
               onChange={(e) => setSettings({...settings, businessAddress: e.target.value})}
             />
          </div>
        </div>

        <div className="pt-4 border-t flex justify-end">
          <button type="submit" className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800" style={{ backgroundColor: settings.primaryColor }}>
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
      <Sidebar 
        currentView={view} 
        setView={setView} 
        isOpen={isSidebarOpen} 
        toggle={() => setIsSidebarOpen(!isSidebarOpen)} 
        color={settings.primaryColor}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b p-4 flex items-center justify-between">
           <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold" style={{ backgroundColor: settings.primaryColor }}>
                ZR
              </div>
              <span className="font-bold">Zia's Royalle</span>
           </div>
           <button onClick={() => setIsSidebarOpen(true)}>
             <Menu className="text-gray-600" />
           </button>
        </div>

        <main className="flex-1 overflow-y-auto">
          {view === 'DASHBOARD' && <Dashboard invoices={invoices} settings={settings} />}
          {view === 'INVOICES' && renderInvoiceList()}
          {(view === 'CREATE_INVOICE' || view === 'EDIT_INVOICE') && (
            <InvoiceForm 
              initialData={view === 'EDIT_INVOICE' ? editingInvoice! : undefined}
              settings={settings}
              onSave={handleSaveInvoice}
              onCancel={() => { setView('INVOICES'); setEditingInvoice(null); }}
            />
          )}
          {view === 'SETTINGS' && renderSettings()}
        </main>
      </div>

      {/* Full Screen Invoice Preview Modal */}
      {previewInvoice && (
        <InvoicePreview 
          invoice={previewInvoice} 
          settings={settings} 
          onClose={() => setPreviewInvoice(null)} 
        />
      )}
    </div>
  );
}

export default App;