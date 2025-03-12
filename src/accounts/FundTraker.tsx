import React, { useState, useEffect } from 'react';
import { Menu, X, Home, DollarSign, FileText } from 'lucide-react';
import Transaction from './Transaction'; // Assuming this is your updated Transaction component
import Voucher from './Voucher';
import { FundTrackerProvider, useFundTracker } from './FundTrackerContext';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

declare global {
  interface Window {
    PDFDocument: any;
  }
}

const FundTracker = () => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);


  useEffect(() => {
    setMobileMenuOpen(false);
  }, [activeMenu]);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <Home size={18} /> },
    { id: 'transactions', label: 'Transactions', icon: <DollarSign size={18} /> },
    { id: 'vouchers', label: 'Vouchers', icon: <FileText size={18} /> },
  ];

  return (
    <FundTrackerProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
        {/* Toast Container */}
        <ToastContainer position="top-right" autoClose={3000} />

        {/* Mobile Header */}
        <div className="md:hidden bg-white shadow-md p-4 flex justify-between items-center">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-full hover:bg-gray-100">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-white p-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Menu</h2>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-full hover:bg-gray-100">
                <X size={24} />
              </button>
            </div>
            <nav className="flex flex-col">
              {menuItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveMenu(item.id)}
                  className={`flex items-center p-4 mb-2 rounded ${activeMenu === item.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        )}

        {/* Sidebar (desktop) */}
        <div className="hidden md:block w-64 bg-white shadow-md p-4 h-screen">
          <nav>
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                className={`w-full flex items-center p-3 mb-2 rounded ${activeMenu === item.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
          {activeMenu === 'dashboard' && <Dashboard />}
          {activeMenu === 'transactions' && <Transaction />}
          {activeMenu === 'vouchers' && <Voucher />}
          {!(['dashboard', 'transactions', 'vouchers'].includes(activeMenu)) && (
            <div className="text-red-500">No content selected - Active Menu: {activeMenu}</div>
          )}
        </div>
      </div>
    </FundTrackerProvider>
  );
};

const Dashboard = () => {
  const { transactions, setTransactions } = useFundTracker();
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    category: '',
    type: '',
  });
  const [fontBuffer, setFontBuffer] = useState<ArrayBuffer | null>(null);
  const [pdfKitLoaded, setPdfKitLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Track loading state

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

      setTransactions(serverTransactions); // Replace all transactions
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

  const filteredTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    const from = filters.dateFrom ? new Date(filters.dateFrom) : null;
    const to = filters.dateTo ? new Date(filters.dateTo) : null;
    const matchesDate = (!from || date >= from) && (!to || date <= to);
    const matchesCategory = filters.category ? t.category === filters.category : true;
    const matchesType = filters.type ? t.type === filters.type : true;
    return matchesDate && matchesCategory && matchesType;
  });

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const balance = totalIncome - totalExpense;

  const academicIncome = filteredTransactions
    .filter(t => t.type === 'income' && t.category === 'Academic')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const academicExpense = filteredTransactions
    .filter(t => t.type === 'expense' && t.category === 'Academic')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const academicBalance = academicIncome - academicExpense;

  const developmentIncome = filteredTransactions
    .filter(t => t.type === 'income' && t.category === 'Development')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const developmentExpense = filteredTransactions
    .filter(t => t.type === 'expense' && t.category === 'Development')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const developmentBalance = developmentIncome - developmentExpense;

  const getChartData = (categoryFilter: string) => {
    const chartTransactions = categoryFilter ? filteredTransactions.filter(t => t.category === categoryFilter) : filteredTransactions;
    const monthlyData: { [key: string]: { income: number; expense: number } } = {};

    chartTransactions.forEach(t => {
      const month = t.date.substring(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = { income: 0, expense: 0 };
      }
      monthlyData[month][t.type] += Number(t.amount);
    });

    const sortedMonths = Object.keys(monthlyData).sort();
    return {
      labels: sortedMonths.map(month => {
        const [year, monthNum] = month.split('-');
        return `${new Date(0, monthNum - 1).toLocaleString('default', { month: 'short' })} ${year}`;
      }),
      datasets: [
        {
          label: 'Income',
          data: sortedMonths.map(month => monthlyData[month].income),
          backgroundColor: 'rgba(76, 175, 80, 0.8)',
          borderColor: '#4CAF50',
          borderWidth: 1,
        },
        {
          label: 'Expenses',
          data: sortedMonths.map(month => monthlyData[month].expense),
          backgroundColor: 'rgba(244, 67, 54, 0.8)',
          borderColor: '#F44336',
          borderWidth: 1,
        },
      ],
    };
  };

  const exportToPDF = () => {
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
      link.download = 'finance_dashboard.pdf';
      link.click();
      URL.revokeObjectURL(url);
      setIsLoading(false);
      toast.success('PDF exported successfully!');
    });

    doc.registerFont('NotoSansBengali', fontBuffer);
    doc.font('NotoSansBengali');

    doc.fillColor('#2980B9').rect(0, 0, 595, 85).fill();
    doc.fillColor('white').fontSize(18).text('MySchool Finance Dashboard', 40, 40);

    doc.fillColor('black').fontSize(12);
    doc.text(`Date Range: ${filters.dateFrom || 'N/A'} to ${filters.dateTo || 'N/A'}`, 40, 90);
    doc.text(`Total Income: ৳${totalIncome.toFixed(2)}`, 40, 110);
    doc.text(`Total Expenses: ৳${totalExpense.toFixed(2)}`, 40, 130);
    doc.text(`Net Balance: ৳${balance.toFixed(2)}`, 40, 150);

    doc.text('Academic Funds:', 40, 170);
    doc.text(`Income: ৳${academicIncome.toFixed(2)}`, 60, 190);
    doc.text(`Expenses: ৳${academicExpense.toFixed(2)}`, 60, 210);
    doc.text(`Balance: ৳${academicBalance.toFixed(2)}`, 60, 230);

    doc.text('Development Funds:', 40, 260);
    doc.text(`Income: ৳${developmentIncome.toFixed(2)}`, 60, 280);
    doc.text(`Expenses: ৳${developmentExpense.toFixed(2)}`, 60, 300);
    doc.text(`Balance: ৳${developmentBalance.toFixed(2)}`, 60, 320);

    if (filteredTransactions.length > 0) {
      const startY = 350;
      doc.text('Filtered Transactions:', 40, startY);
      doc.text('Date', 40, startY + 20);
      doc.text('Description', 120, startY + 20);
      doc.text('Category', 300, startY + 20);
      doc.text('Amount', 400, startY + 20);
      doc.moveTo(40, startY + 35).lineTo(555, startY + 35).stroke();

      let yPos = startY + 45;
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
    }

  doc.end();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Finance Dashboard</h2>
        <button
          onClick={exportToPDF}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          disabled={isLoading || !pdfKitLoaded || !fontBuffer}
        >
          {isLoading ? 'Processing...' : 'Export to PDF'}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h3 className="text-lg font-medium mb-4">Filter Dashboard</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={filters.category}
              onChange={e => setFilters({ ...filters, category: e.target.value })}
              className="w-full p-2 border rounded"
              disabled={isLoading}
            >
              <option value="">All</option>
              <option value="Academic">Academic</option>
              <option value="Development">Development</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={filters.type}
              onChange={e => setFilters({ ...filters, type: e.target.value })}
              className="w-full p-2 border rounded"
              disabled={isLoading}
            >
              <option value="">All</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6">
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
          <p className="text-sm text-gray-500">Total Income</p>
          <p className="text-xl md:text-2xl text-green-600">৳{totalIncome.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
          <p className="text-sm text-gray-500">Total Expenses</p>
          <p className="text-xl md:text-2xl text-red-600">৳{totalExpense.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
          <p className="text-sm text-gray-500">Net Balance</p>
          <p className="text-xl md:text-2xl text-blue-600">৳{balance.toFixed(2)}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <h3 className="text-lg font-medium mb-2">Academic Funds</h3>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <p className="text-xs text-gray-500">Income</p>
              <p className="text-sm md:text-base text-green-600">৳{academicIncome.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Expenses</p>
              <p className="text-sm md:text-base text-red-600">৳{academicExpense.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Balance</p>
              <p className="text-sm md:text-base text-blue-600">৳{academicBalance.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md border-l-4 border-orange-500">
          <h3 className="text-lg font-medium mb-2">Development Funds</h3>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <p className="text-xs text-gray-500">Income</p>
              <p className="text-sm md:text-base text-green-600">৳{developmentIncome.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Expenses</p>
              <p className="text-sm md:text-base text-red-600">৳{developmentExpense.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Balance</p>
              <p className="text-sm md:text-base text-blue-600">৳{developmentBalance.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
        <div className="flex flex-wrap items-center justify-between mb-4">
          <h3 className="text-lg md:text-xl font-medium">Financial Trend</h3>
          <div className="flex space-x-2 mt-2 md:mt-0">
            <button
              onClick={() => setFilters({ ...filters, category: '' })}
              className={`px-3 py-1 text-sm rounded ${!filters.category ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'} ${isLoading ? 'cursor-not-allowed' : ''}`}
              disabled={isLoading}
            >
              All
            </button>
            <button
              onClick={() => setFilters({ ...filters, category: 'Academic' })}
              className={`px-3 py-1 text-sm rounded ${filters.category === 'Academic' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'} ${isLoading ? 'cursor-not-allowed' : ''}`}
              disabled={isLoading}
            >
              Academic
            </button>
            <button
              onClick={() => setFilters({ ...filters, category: 'Development' })}
              className={`px-3 py-1 text-sm rounded ${filters.category === 'Development' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'} ${isLoading ? 'cursor-not-allowed' : ''}`}
              disabled={isLoading}
            >
              Development
            </button>
          </div>
        </div>
        <div className="h-64 md:h-80">
          <Bar
            data={getChartData(filters.category)}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                title: { display: true, text: filters.category ? `${filters.category} Income vs Expenses` : 'Income vs Expenses' },
                legend: { position: 'bottom' },
                tooltip: {
                  callbacks: {
                    label: (context) => `${context.dataset.label}: ৳${context.raw.toFixed(2)}`,
                  },
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  title: { display: true, text: 'Amount (৳)' },
                },
              },
            }}
          />
        </div>
      </div>
      {filteredTransactions.length === 0 && (
        <div className="text-gray-500 mt-4">No transactions match the filters.</div>
      )}
    </div>
  );
};

export default FundTracker;