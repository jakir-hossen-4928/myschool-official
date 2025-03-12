import React, { useState } from 'react';
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { useFundTracker } from './FundTrackerContext';

const Reports = () => {
  const { transactions } = useFundTracker();
  const [selectedCategory, setSelectedCategory] = useState('Academic');
  const [files, setFiles] = useState<File[]>([]);
  const [convertedImages, setConvertedImages] = useState<{ category: string; url: string }[]>([]);

  const categories = ['Academic', 'Development'];

  const exportCategoryReport = (category: string) => {
    const doc = new jsPDF();
    const reportTitle = `${category} Fund Report`;
    const categoryTransactions = transactions.filter(t => t.category === category);
    const categoryIncome = categoryTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
    const categoryExpense = categoryTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
    const categoryBalance = categoryIncome - categoryExpense;

    doc.setFontSize(20);
    doc.text(reportTitle, 14, 20);
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28);
    doc.setFillColor(240, 240, 240);
    doc.rect(14, 35, 182, 25, 'F');
    doc.setFontSize(14);
    doc.text(`${category} Fund Summary`, 16, 45);
    doc.setFontSize(12);
    doc.text(`Total Income: ৳${categoryIncome.toFixed(2)}`, 16, 52);
    doc.text(`Total Expenses: ৳${categoryExpense.toFixed(2)}`, 105, 52);
    doc.text(`Net Balance: ৳${categoryBalance.toFixed(2)}`, 16, 58);
    doc.autoTable({
      head: [['Date', 'Description', 'Type', 'Amount']],
      body: categoryTransactions.map(t => [t.date, t.description, t.type === 'income' ? 'Income' : 'Expense', `৳${Number(t.amount).toFixed(2)}`]),
      startY: 70,
      theme: 'grid',
      columnStyles: { 3: { halign: 'right' } }
    });
    doc.line(14, doc.lastAutoTable.finalY + 30, 80, doc.lastAutoTable.finalY + 30);
    doc.line(120, doc.lastAutoTable.finalY + 30, 186, doc.lastAutoTable.finalY + 30);
    doc.text("Prepared By", 14, doc.lastAutoTable.finalY + 38);
    doc.text("Approved By", 120, doc.lastAutoTable.finalY + 38);
    doc.save(`${category.toLowerCase()}_fund_report.pdf`);
  };

  const convertToImage = async (file: File): Promise<string> => {
    const pdf2img = await import("pdf-img-convert");

    return new Promise((resolve, reject) => {
      if (file.type === 'application/pdf') {
        // Handle PDF conversion with pdf-img-convert
        file.arrayBuffer().then(async (buffer) => {
          try {
            const pdfArray = await pdf2img.convert(new Uint8Array(buffer), { base64: true });
            // Return the first page as a base64-encoded image
            if (pdfArray.length > 0) {
              resolve(`data:image/png;base64,${pdfArray[0]}`);
            } else {
              reject(new Error('No pages found in PDF'));
            }
          } catch (error) {
            reject(new Error(`PDF conversion failed: ${error}`));
          }
        }).catch((error) => reject(new Error(`Error reading PDF buffer: ${error}`)));
      } else if (file.type.startsWith('image/')) {
        // Handle image files
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Error reading image'));
        reader.readAsDataURL(file);
      } else if (file.type === 'text/plain') {
        // Handle text files by rendering text onto a canvas
        const reader = new FileReader();
        reader.onload = () => {
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.width = 800;
          canvas.height = 600;
          if (context) {
            context.fillStyle = 'white';
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.fillStyle = 'black';
            context.font = '16px Arial';
            const text = (reader.result as string).split('\n');
            text.forEach((line, index) => context.fillText(line, 10, 20 + index * 20));
            resolve(canvas.toDataURL('image/png'));
          } else {
            reject(new Error('Failed to get canvas context'));
          }
        };
        reader.onerror = () => reject(new Error('Error reading text file'));
        reader.readAsText(file);
      } else {
        reject(new Error('Unsupported file type'));
      }
    });
  };

  const handleFileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) return;

    try {
      const imagePromises = files.map(file => convertToImage(file));
      const imageUrls = await Promise.all(imagePromises);
      const newImages = imageUrls.map(url => ({ category: selectedCategory, url }));
      setConvertedImages(prev => [...prev, ...newImages]);
      setFiles([]); // Clear files after submission
    } catch (error) {
      console.error('Error converting files to images:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 md:mb-6">Reports</h2>
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-lg font-medium mb-4">Generate Reports</h3>
        <div className="flex flex-col md:flex-row gap-4">
          <button
            onClick={() => exportCategoryReport('Academic')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Academic Fund Report
          </button>
          <button
            onClick={() => exportCategoryReport('Development')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Development Fund Report
          </button>
        </div>
      </div>

      {/* File Submission Section */}
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-lg font-medium mb-4">Submit Proof Documents</h3>
        <form onSubmit={handleFileSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full p-2 border rounded"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Upload Files (PDF, Image, Text)</label>
            <input
              type="file"
              multiple
              accept="image/*,application/pdf,text/plain"
              onChange={handleFileChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            disabled={files.length === 0}
          >
            Submit Proof
          </button>
        </form>
      </div>

      {/* Display Converted Images */}
      {convertedImages.length > 0 && (
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-4">Submitted Proofs</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {convertedImages.map((img, index) => (
              <div key={index} className="border p-2 rounded">
                <img src={img.url} alt={`Proof ${index}`} className="w-full h-auto max-h-48 object-contain" />
                <p className="text-sm text-gray-600 mt-2">Category: {img.category}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;