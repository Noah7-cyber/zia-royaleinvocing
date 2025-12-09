import React, { useState } from 'react';
import { Invoice, InvoiceStatus, AppSettings } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, FileText, CheckCircle, Clock, Sparkles } from 'lucide-react';
import { analyzeBusinessHealth } from '../services/geminiService';

interface DashboardProps {
  invoices: Invoice[];
  settings: AppSettings;
}

export const Dashboard: React.FC<DashboardProps> = ({ invoices, settings }) => {
  const [aiInsight, setAiInsight] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);

  // Calculate Stats
  const totalRevenue = invoices
    .filter((i) => i.status === InvoiceStatus.PAID)
    .reduce((sum, i) => sum + i.total, 0);

  const pendingAmount = invoices
    .filter((i) => i.status === InvoiceStatus.PENDING)
    .reduce((sum, i) => sum + i.total, 0);

  const totalInvoices = invoices.length;
  
  // Prepare Chart Data
  const chartData = invoices.reduce((acc: any[], curr) => {
    const month = new Date(curr.date).toLocaleString('default', { month: 'short' });
    const existing = acc.find((item) => item.name === month);
    if (existing) {
      existing.amount += curr.total;
    } else {
      acc.push({ name: month, amount: curr.total });
    }
    return acc;
  }, []);

  const handleAiAnalysis = async () => {
    setLoadingAi(true);
    const result = await analyzeBusinessHealth(invoices);
    setAiInsight(result);
    setLoadingAi(false);
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>
        <button
          onClick={handleAiAnalysis}
          disabled={loadingAi}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg shadow-md hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          {loadingAi ? 'Analyzing...' : 'Ask AI Insights'}
        </button>
      </div>

      {aiInsight && (
        <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl shadow-sm text-purple-900 mb-6 flex gap-3">
          <Sparkles className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
          <p className="italic">{aiInsight}</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={`${settings.currency}${totalRevenue.toFixed(2)}`} 
          icon={<DollarSign className="w-6 h-6 text-emerald-600" />}
          color="bg-emerald-50"
        />
        <StatCard 
          title="Pending Amount" 
          value={`${settings.currency}${pendingAmount.toFixed(2)}`} 
          icon={<Clock className="w-6 h-6 text-amber-600" />}
          color="bg-amber-50"
        />
        <StatCard 
          title="Total Invoices" 
          value={totalInvoices.toString()} 
          icon={<FileText className="w-6 h-6 text-blue-600" />}
          color="bg-blue-50"
        />
        <StatCard 
          title="Paid Invoices" 
          value={invoices.filter(i => i.status === InvoiceStatus.PAID).length.toString()} 
          icon={<CheckCircle className="w-6 h-6 text-purple-600" />}
          color="bg-purple-50"
        />
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Revenue Overview</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `${settings.currency}${val}`} />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar 
                dataKey="amount" 
                fill={settings.primaryColor} 
                radius={[4, 4, 0, 0]} 
                barSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }: { title: string, value: string, icon: React.ReactNode, color: string }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between hover:shadow-md transition-shadow">
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
    </div>
    <div className={`p-3 rounded-lg ${color}`}>
      {icon}
    </div>
  </div>
);