import React, { useState, useEffect } from 'react';

declare global {
  interface Window {
    PDFDocument: any; // Declare PDFKit globally
  }
}

interface VoucherData {
  voucherNo: number;
  recipient: string;
  amount: string;
  method: string;
  purpose: string;
  category: string;
  date?: string; // Optional for transaction-based vouchers
}

const Voucher = () => {
  const [voucherData, setVoucherData] = useState<VoucherData>({
    voucherNo: Math.floor(100000 + Math.random() * 900000),
    recipient: '',
    amount: '',
    method: 'cash',
    purpose: '',
    category: 'Academic'
  });
  const [fontBuffer, setFontBuffer] = useState<ArrayBuffer | null>(null);
  const [pdfKitLoaded, setPdfKitLoaded] = useState(false);

  const categories = ['Academic', 'Development'];

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

  const generateVoucher = (data: VoucherData = voucherData) => {
    if (!pdfKitLoaded || !fontBuffer || !window.PDFDocument) {
      console.error('PDFKit or font not loaded yet');
      return;
    }

    const doc = new window.PDFDocument({ size: 'A4' });
    const chunks: Uint8Array[] = [];
    doc.on('data', (chunk: Uint8Array) => chunks.push(chunk));
    doc.on('end', () => {
      const pdfBlob = new Blob(chunks, { type: 'application/pdf' });
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `voucher_${data.voucherNo}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    });

    doc.registerFont('NotoSansBengali', fontBuffer);
    doc.font('NotoSansBengali');

    doc.fillColor('#2980B9').rect(0, 0, 595, 85).fill();
    doc.fillColor('white').fontSize(18).text('MySchool PAYMENT VOUCHER', 40, 40);

    doc.fillColor(data.category === 'Academic' ? '#4CAF50' : '#FF9800')
       .rect(450, 28, 100, 28)
       .fill();
    doc.fillColor('white').fontSize(10).text(data.category, 460, 40);

    doc.fillColor('black').fontSize(12);
    doc.text(`Voucher No: ${data.voucherNo}`, 40, 100);
    doc.text(`Date: ${data.date || new Date().toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' })}`, 40, 120);
    doc.text(`Recipient: ${data.recipient}`, 40, 140);
    doc.text(`Amount: ৳${Number(data.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 40, 160);
    doc.text(`Payment Method: ${data.method}`, 40, 180);
    doc.text('Purpose: ', 40, 200);
    doc.text(data.purpose, 100, 200, { width: 455 });

    const purposeHeight = doc.heightOfString(data.purpose, { width: 455 });
    const nextY = 200 + Math.max(20, purposeHeight);
    doc.text(`Fund Category: ${data.category}`, 40, nextY);

    const signatureY = nextY + 70;
    doc.moveTo(40, signatureY).lineTo(555, signatureY).stroke();
    doc.text('Authorized By:', 40, signatureY + 20);
    doc.text('Signature: ___________________', 40, signatureY + 40);
    doc.text('Verified By:', 340, signatureY + 20);
    doc.text('Signature: ___________________', 340, signatureY + 40);

    doc.end();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateVoucher();
    setVoucherData({
      voucherNo: Math.floor(100000 + Math.random() * 900000),
      recipient: '',
      amount: '',
      method: 'cash',
      purpose: '',
      category: 'Academic'
    });
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Vouchers</h2>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-medium mb-4">Create New Voucher</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Voucher No</label>
              <input type="text" value={voucherData.voucherNo} readOnly className="w-full p-2 border rounded bg-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Recipient</label>
              <input
                type="text"
                value={voucherData.recipient}
                onChange={(e) => setVoucherData({ ...voucherData, recipient: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (৳)</label>
              <input
                type="number"
                value={voucherData.amount}
                onChange={(e) => setVoucherData({ ...voucherData, amount: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <select
                value={voucherData.method}
                onChange={(e) => setVoucherData({ ...voucherData, method: e.target.value })}
                className="w-full p-2 border rounded"
              >
                <option value="cash">Cash</option>
                <option value="check">Check</option>
                <option value="bank">Bank Transfer</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
              <textarea
                value={voucherData.purpose}
                onChange={(e) => setVoucherData({ ...voucherData, purpose: e.target.value })}
                className="w-full p-2 border rounded min-h-[80px] resize-y"
                placeholder="Enter purpose here"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={voucherData.category}
                onChange={(e) => setVoucherData({ ...voucherData, category: e.target.value })}
                className="w-full p-2 border rounded"
              >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
            disabled={!pdfKitLoaded || !fontBuffer}
          >
            Generate Voucher
          </button>
        </form>
      </div>
    </div>
  );
};

// Export generateVoucher for use in Transaction.tsx
export const generateVoucher = (data: VoucherData) => {
  const voucherInstance = new Voucher();
  voucherInstance['generateVoucher'](data);
};

export default Voucher;