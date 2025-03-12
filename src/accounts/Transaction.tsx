import React, { useState, useEffect } from 'react';
import { useFundTracker } from './FundTrackerContext';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

declare global {
  interface Window {
    PDFDocument: any;
  }
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const Transaction = () => {
  const { transactions, addTransaction, setTransactions } = useFundTracker();
  const [formData, setFormData] = useState({
    date: '',
    description: '',
    amount: '',
    type: 'income' as 'income' | 'expense',
    category: 'Academic',
  });
  const [filters, setFilters] = useState({ dateFrom: '', dateTo: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fontBuffer, setFontBuffer] = useState<ArrayBuffer | null>(null);
  const [pdfKitLoaded, setPdfKitLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Track loading state

  const categories = ['Academic', 'Development'];

  // Load PDFKit and font
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '/pdfkit.standalone.js';
    script.async = true;
    script.onload = () => setPdfKitLoaded(true);
    script.onerror = () => console.error('Failed to load PDFKit');
    document.body.appendChild(script);

    fetch('/NotoSansBengali-VariableFont_wdth,wght.ttf')
      .then(response => response.arrayBuffer())
      .then(buffer => setFontBuffer(buffer))
      .catch(error => console.error('Error loading font:', error));

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Fetch transactions from backend
  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (filters.dateFrom) params.startDate = filters.dateFrom;
      if (filters.dateTo) params.endDate = filters.dateTo;

      const response = await axios.get(`${BACKEND_URL}/transactions`, { params });
      const serverTransactions = response.data.transactions.map(t => ({
        ...t,
        id: `${t.date}-${t.description}-${t.amount}-${Math.random()}`, // Unique ID
        amount: t.amount.toString(),
      }));

      setTransactions([]); // Clear existing transactions
      serverTransactions.forEach(t => addTransaction(t));
      // toast.success('Transactions loaded successfully!');
    } catch (error) {
      console.error('Error fetching transactions:', error.response?.data || error.message);
      toast.error('Failed to load transactions.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch transactions on mount and when filters change
  useEffect(() => {
    fetchTransactions();
  }, [filters.dateFrom, filters.dateTo]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const newTransaction = {
      date: formData.date,
      description: formData.description,
      amount: parseFloat(formData.amount),
      type: formData.type,
      category: formData.category,
    };

    try {
      const response = await axios.post(`${BACKEND_URL}/transactions`, newTransaction);
      console.log('Transaction added:', response.data);
      addTransaction({ ...newTransaction, id: `${newTransaction.date}-${newTransaction.description}-${newTransaction.amount}-${Math.random()}` });
      setFormData({ date: '', description: '', amount: '', type: 'income', category: 'Academic' });
      setIsModalOpen(false);
      toast.success('Transaction added successfully!');
      await fetchTransactions(); // Refresh transactions
    } catch (error) {
      console.error('Error adding transaction:', error.response?.data || error.message);
      toast.error('Failed to add transaction.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    const from = filters.dateFrom ? new Date(filters.dateFrom) : null;
    const to = filters.dateTo ? new Date(filters.dateTo) : null;
    return (!from || date >= from) && (!to || date <= to);
  });

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const netBalance = totalIncome - totalExpense;

  const exportPDF = () => {
    if (!pdfKitLoaded || !fontBuffer || !window.PDFDocument) {
      toast.error('PDF generation tools not loaded yet.');
      return;
    }

    setIsLoading(true);
    const doc = new window.PDFDocument({ size: 'A4' });
    const chunks: Uint8Array[] = [];
    doc.on('data', (chunk: Uint8Array) => chunks.push(chunk));
    doc.on('end', () => {
      const pdfBlob = new Blob(chunks, { type: 'application/pdf' });
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'transactions.pdf';
      link.click();
      URL.revokeObjectURL(url);
      setIsLoading(false);
      toast.success('PDF exported successfully!');
    });

    doc.registerFont('NotoSansBengali', fontBuffer);
    doc.font('NotoSansBengali');

    doc.fillColor('#2980B9').rect(0, 0, 595, 85).fill();
    doc.fillColor('white').fontSize(18).text('MySchool Transactions', 40, 40);

    doc.fillColor('black').fontSize(12);
    doc.text(`Date Range: ${filters.dateFrom || 'N/A'} to ${filters.dateTo || 'N/A'}`, 40, 90);
    doc.text(`Total Income: ৳${totalIncome.toFixed(2)}`, 40, 110);
    doc.text(`Total Expenses: ৳${totalExpense.toFixed(2)}`, 40, 130);
    doc.text(`Net Balance: ৳${netBalance.toFixed(2)}`, 40, 150);

    const startY = 170;
    doc.text('Date', 40, startY);
    doc.text('Description', 120, startY);
    doc.text('Category', 300, startY);
    doc.text('Amount', 400, startY);
    doc.moveTo(40, startY + 15).lineTo(555, startY + 15).stroke();

    let yPos = startY + 25;
    filteredTransactions.forEach(t => {
      doc.text(t.date, 40, yPos);
      doc.text(t.description, 120, yPos, { width: 170 });
      doc.text(t.category, 300, yPos);
      doc.text(`${t.type === 'income' ? '+' : '-'}৳${Number(t.amount).toFixed(2)}`, 400, yPos);
      const rowHeight = Math.max(20, doc.heightOfString(t.description, { width: 170 }));
      yPos += rowHeight + 5;

      if (yPos > 780) {
        doc.addPage();
        yPos = 40;
        doc.text('Date', 40, yPos);
        doc.text('Description', 120, yPos);
        doc.text('Category', 300, yPos);
        doc.text('Amount', 400, yPos);
        doc.moveTo(40, yPos + 15).lineTo(555, yPos + 15).stroke();
        yPos += 25;
      }
    });

    doc.end();
  };

  const generateVoucherFromTransaction = (transaction: any) => {
    if (!pdfKitLoaded || !fontBuffer || !window.PDFDocument) {
      toast.error('PDF generation tools not loaded yet.');
      return;
    }

    setIsLoading(true);
    const doc = new window.PDFDocument({ size: 'A4' });
    const chunks: Uint8Array[] = [];
    doc.on('data', (chunk: Uint8Array) => chunks.push(chunk));
    doc.on('end', () => {
      const pdfBlob = new Blob(chunks, { type: 'application/pdf' });
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `voucher_${transaction.id}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      setIsLoading(false);
      toast.success('Voucher generated successfully!');
    });

    doc.registerFont('NotoSansBengali', fontBuffer);
    doc.font('NotoSansBengali');

    doc.fillColor('#2980B9').rect(0, 0, 595, 85).fill();
    doc.fillColor('white').fontSize(18).text('MySchool PAYMENT VOUCHER', 40, 40);

    doc.fillColor(transaction.category === 'Academic' ? '#4CAF50' : '#FF9800')
      .rect(450, 28, 100, 28)
      .fill();
    doc.fillColor('white').fontSize(10).text(transaction.category, 460, 40);

    doc.fillColor('black').fontSize(12);
    const voucherNo = Math.floor(100000 + Math.random() * 900000);
    doc.text(`Voucher No: ${voucherNo}`, 40, 100);
    doc.text(`Date: ${transaction.date}`, 40, 120);
    doc.text(`Recipient: ${transaction.description}`, 40, 140);
    doc.text(`Amount: ৳${Number(transaction.amount).toFixed(2)}`, 40, 160);
    doc.text(`Payment Method: Cash`, 40, 180);
    doc.text(`Purpose: ${transaction.type === 'income' ? 'Received as Income' : 'Payment for Expense'}`, 40, 200, { width: 455 });

    const nextY = 200 + Math.max(20, doc.heightOfString(transaction.type === 'income' ? 'Received as Income' : 'Payment for Expense', { width: 455 }));
    doc.text(`Fund Category: ${transaction.category}`, 40, nextY);

    const signatureY = nextY + 70;
    doc.moveTo(40, signatureY).lineTo(555, signatureY).stroke();
    doc.text('Authorized By:', 40, signatureY + 20);
    doc.text('Signature: ___________________', 40, signatureY + 40);
    doc.text('Verified By:', 340, signatureY + 20);
    doc.text('Signature: ___________________', 340, signatureY + 40);

    doc.end();
  };

  return (
    <div className="p-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h2 className="text-2xl font-bold mb-2 sm:mb-0">Transactions</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Add Transaction'}
          </button>
          <button
            onClick={exportPDF}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
            disabled={isLoading || !pdfKitLoaded || !fontBuffer}
          >
            {isLoading ? 'Processing...' : 'Export to PDF'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h3 className="text-lg font-medium mb-4">Filter Transactions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={e => setFilters({ ...filters, dateFrom: e.target.value })}
              className="w-full p-2 border rounded"
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={e => setFilters({ ...filters, dateTo: e.target.value })}
              className="w-full p-2 border rounded"
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Add New Transaction</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (৳)</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                  min="0"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value as 'income' | 'expense' })}
                  className="w-full p-2 border rounded"
                  disabled={isLoading}
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-2 border rounded"
                  disabled={isLoading}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400 disabled:bg-gray-200"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
                  disabled={isLoading}
                >
                  {isLoading ? 'Adding...' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transaction Table */}
      {filteredTransactions.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-md overflow-x-auto">
          <h3 className="text-lg font-medium mb-4">Transaction History</h3>
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Date</th>
                <th className="p-2 text-left">Description</th>
                <th className="p-2 text-left">Category</th>
                <th className="p-2 text-left">Amount</th>
                <th className="p-2 text-left">Voucher</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map(t => (
                <tr key={t.id} className="border-b">
                  <td className="p-2">{t.date}</td>
                  <td className="p-2">{t.description}</td>
                  <td className="p-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${t.category === 'Academic' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                        }`}
                    >
                      {t.category}
                    </span>
                  </td>
                  <td className={`p-2 ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === 'income' ? '+' : '-'}৳{Number(t.amount).toFixed(2)}
                  </td>
                  <td className="p-2">
                    <button
                      onClick={() => generateVoucherFromTransaction(t)}
                      className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 disabled:bg-gray-400"
                      disabled={isLoading || !pdfKitLoaded || !fontBuffer}
                    >
                      {isLoading ? 'Generating...' : 'Generate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {filteredTransactions.length === 0 && (
        <div className="text-gray-500 mt-4">No transactions match the filters.</div>
      )}
    </div>
  );
};

export default Transaction;