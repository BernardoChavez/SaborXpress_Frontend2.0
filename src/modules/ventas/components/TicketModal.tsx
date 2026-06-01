import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  ticketText: string;
}

const TicketModal = ({ isOpen, onClose, ticketText }: Props) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(ticketText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Imprimir Ticket</title>
            <style>
              body {
                font-family: monospace;
                white-space: pre;
                margin: 20px;
                font-size: 14px;
              }
            </style>
          </head>
          <body>${ticketText}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
      printWindow.close();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose} 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-sm overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-6 border-b border-gray-50 flex items-center justify-between shrink-0">
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <Printer className="text-orange-500" size={20} />
                Comprobante de Venta
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>

            {/* Monospaced Ticket Preview */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50 flex justify-center">
              <pre className="bg-white p-6 rounded-2xl border border-gray-200 shadow-inner font-mono text-xs text-gray-800 leading-relaxed max-w-full overflow-x-auto whitespace-pre">
                {ticketText}
              </pre>
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-gray-50 grid grid-cols-2 gap-3 shrink-0">
              <button
                onClick={handleCopy}
                className="py-3 px-4 border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs uppercase rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                {copied ? 'Copiado' : 'Copiar'}
              </button>
              <button
                onClick={handlePrint}
                className="py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs uppercase rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-orange-500/10 transition-all active:scale-95"
              >
                <Printer size={16} />
                Imprimir
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TicketModal;
