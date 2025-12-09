import React, { useRef, useState } from 'react';
import { Invoice, AppSettings } from '../types';
import { Printer, X, Share2, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface InvoicePreviewProps {
  invoice: Invoice;
  settings: AppSettings;
  onClose: () => void;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoice, settings, onClose }) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (!printRef.current) return;
    
    try {
      setIsSharing(true);
      
      // 1. Capture the invoice as a canvas
      const canvas = await html2canvas(printRef.current, {
        scale: 2, // Higher scale for better quality
        useCORS: true, // Allow cross-origin images (logo)
        logging: false,
        backgroundColor: '#ffffff'
      });

      // 2. Convert to PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      // 3. Create Blob and File
      const pdfBlob = pdf.output('blob');
      const file = new File([pdfBlob], `Invoice-${invoice.invoiceNumber}.pdf`, { type: 'application/pdf' });

      // 4. Share using Web Share API
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Invoice #${invoice.invoiceNumber}`,
          text: `Please find attached invoice #${invoice.invoiceNumber} from ${settings.businessName}.`,
          files: [file]
        });
      } else {
        // Fallback: Just download it if sharing isn't supported
        pdf.save(`Invoice-${invoice.invoiceNumber}.pdf`);
        alert('Sharing files is not supported on this browser. The invoice has been downloaded instead.');
      }

    } catch (error) {
      console.error('Error sharing invoice:', error);
      if ((error as any).name !== 'AbortError') {
        alert('Failed to share invoice. Please try printing to PDF instead.');
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center p-4 print:p-0 print:static print:bg-white print:z-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto print:shadow-none print:w-full print:max-w-none print:h-auto print:max-h-none print:rounded-none">
        
        {/* Toolbar - Hidden when printing */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center print:hidden z-10">
          <h2 className="text-lg font-semibold text-gray-700">Preview Invoice</h2>
          <div className="flex gap-3">
            <button 
              onClick={handleShare}
              disabled={isSharing}
              className="flex items-center px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSharing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Share2 className="w-4 h-4 mr-2" />
              )}
              {isSharing ? 'Generating...' : 'Share PDF'}
            </button>
            <button 
              onClick={handlePrint}
              className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              <Printer className="w-4 h-4 mr-2" /> Print / PDF
            </button>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div ref={printRef} className="p-12 print:p-0 min-h-[1000px] flex flex-col justify-between" style={{ fontFamily: 'Outfit, sans-serif' }}>
          
          <div>
            {/* Header / Brand */}
            <div className="flex justify-between items-start border-b-4 pb-8 mb-8" style={{ borderColor: settings.primaryColor }}>
              <div className="w-1/2">
                {settings.logoUrl && (
                    <img 
                      src={settings.logoUrl} 
                      alt="Logo" 
                      crossOrigin="anonymous"
                      className="h-24 w-auto object-contain mb-4"
                    />
                )}
                <h1 className="text-4xl font-bold uppercase tracking-wide" style={{ color: settings.primaryColor }}>
                  INVOICE
                </h1>
                <p className="text-gray-500 font-medium mt-1">#{invoice.invoiceNumber}</p>
              </div>
              <div className="w-1/2 text-right text-gray-600">
                <h3 className="font-bold text-xl text-gray-800 mb-1">{settings.businessName}</h3>
                <p className="whitespace-pre-line text-sm">{settings.businessAddress}</p>
                <p className="text-sm mt-2">{settings.businessEmail}</p>
                <p className="text-sm">{settings.businessPhone}</p>
              </div>
            </div>

            {/* Client & Date Info */}
            <div className="flex justify-between mb-12">
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Bill To</h4>
                <h3 className="text-xl font-bold text-gray-800">{invoice.client.name}</h3>
                <p className="text-gray-600 whitespace-pre-line mt-1">{invoice.client.address}</p>
                <p className="text-gray-600 mt-1">{invoice.client.email}</p>
              </div>
              <div className="text-right">
                <div className="mb-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Date Issued</h4>
                  <p className="text-lg font-medium">{invoice.date}</p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Due Date</h4>
                  <p className="text-lg font-medium">{invoice.dueDate}</p>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full mb-12">
              <thead className="border-b-2" style={{ borderColor: settings.primaryColor }}>
                <tr className="text-left">
                  <th className="py-3 font-bold text-gray-600 w-1/2">Description</th>
                  <th className="py-3 font-bold text-gray-600 text-center">Qty</th>
                  <th className="py-3 font-bold text-gray-600 text-right">Price</th>
                  <th className="py-3 font-bold text-gray-600 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {invoice.items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100">
                    <td className="py-4">{item.description}</td>
                    <td className="py-4 text-center">{item.quantity}</td>
                    <td className="py-4 text-right">{settings.currency}{item.price.toFixed(2)}</td>
                    <td className="py-4 text-right font-medium">{settings.currency}{(item.quantity * item.price).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
             {/* Totals */}
            <div className="flex justify-end mb-12">
              <div className="w-64 space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium">{settings.currency}{invoice.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax ({invoice.taxRate}%)</span>
                  <span className="font-medium">{settings.currency}{invoice.taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-2xl font-bold border-t-2 pt-4 mt-2" style={{ borderColor: settings.primaryColor, color: settings.primaryColor }}>
                  <span>Total</span>
                  <span>{settings.currency}{invoice.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            {invoice.notes && (
               <div className="mb-12 bg-gray-50 p-4 rounded-lg border-l-4" style={{ borderColor: settings.primaryColor }}>
                <h4 className="font-bold text-sm text-gray-700 mb-1">Notes</h4>
                <p className="text-gray-600 text-sm">{invoice.notes}</p>
              </div>
            )}

            <div className="text-center text-gray-400 text-sm border-t pt-8">
              <p>Thank you for your business!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};