import { format } from 'date-fns';
import logo from '@/assets/logo.png';
import signature from '@/assets/signature.png';
import { formatCurrencyAscii, numberToWords, sanitizePdfText } from '@/lib/invoiceUtils';

const COMPANY_INFO = {
  name: 'FEATHER FASHIONS',
  address: '15/153, Kuttiyar Street, Erode - 638001, Tamil Nadu, India',
  gstin: '33AALPN7662P1ZR',
  phone: '+91 96006 72707',
  email: 'info.featherfashions@gmail.com',
  state: 'Tamil Nadu',
  stateCode: '33',
  pan: 'AALPN7662P',
  bank: {
    name: 'HDFC Bank',
    branch: 'Erode Main Branch',
    accountNo: '50200085396498',
    ifsc: 'HDFC0000665',
  },
};

const loadPdfLibs = async () => {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable')
  ]);
  return { jsPDF, autoTable };
};

export async function generateDebitNotePDF(
  note: any,
  items: any[],
  action: 'download' | 'preview'
): Promise<string | void> {
  const { jsPDF, autoTable } = await loadPdfLibs();
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 12;
  const contentW = pageW - margin * 2;
  let y = margin;

  doc.setFillColor(250, 250, 247);
  doc.rect(0, 0, pageW, doc.internal.pageSize.getHeight(), 'F');
  doc.setDrawColor(200, 180, 140);
  doc.setLineWidth(0.5);
  doc.rect(margin - 2, margin - 2, contentW + 4, doc.internal.pageSize.getHeight() - margin * 2 + 4);

  try {
    const img = new Image();
    img.src = logo;
    await new Promise(r => { img.onload = r; });
    doc.addImage(img, 'PNG', margin, y, 22, 22);
  } catch {}

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text(sanitizePdfText(COMPANY_INFO.name), margin + 26, y + 7);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(sanitizePdfText(COMPANY_INFO.address), margin + 26, y + 13);
  doc.text(`GSTIN: ${COMPANY_INFO.gstin} | PAN: ${COMPANY_INFO.pan}`, margin + 26, y + 17);
  doc.text(`Phone: ${COMPANY_INFO.phone} | Email: ${COMPANY_INFO.email}`, margin + 26, y + 21);
  y += 28;

  doc.setFillColor(139, 69, 19);
  doc.rect(margin, y, contentW, 8, 'F');
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('DEBIT NOTE', pageW / 2, y + 5.5, { align: 'center' });
  y += 12;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 30, 30);
  const detailsY = y;
  const halfW = contentW / 2;

  doc.setFont('helvetica', 'bold');
  doc.text('Debit Note To:', margin, detailsY);
  doc.setFont('helvetica', 'normal');
  doc.text(sanitizePdfText(note.party_name), margin, detailsY + 5);
  if (note.party_address) {
    const addrLines = doc.splitTextToSize(sanitizePdfText(note.party_address), halfW - 5);
    doc.text(addrLines, margin, detailsY + 10);
  }
  if (note.party_gstin) doc.text(`GSTIN: ${note.party_gstin}`, margin, detailsY + 20);
  if (note.party_state) doc.text(`State: ${note.party_state}${note.party_state_code ? ` (${note.party_state_code})` : ''}`, margin, detailsY + 24);

  const rx = margin + halfW + 5;
  doc.setFont('helvetica', 'bold');
  doc.text('Debit Note No:', rx, detailsY);
  doc.setFont('helvetica', 'normal');
  doc.text(sanitizePdfText(note.debit_note_no), rx + 30, detailsY);
  doc.setFont('helvetica', 'bold');
  doc.text('Date:', rx, detailsY + 5);
  doc.setFont('helvetica', 'normal');
  doc.text(format(new Date(note.debit_note_date), 'dd/MM/yyyy'), rx + 30, detailsY + 5);

  if (note.original_invoice_no) {
    doc.setFont('helvetica', 'bold');
    doc.text('Orig. Invoice No:', rx, detailsY + 10);
    doc.setFont('helvetica', 'normal');
    doc.text(sanitizePdfText(note.original_invoice_no), rx + 30, detailsY + 10);
  }
  if (note.original_invoice_date) {
    doc.setFont('helvetica', 'bold');
    doc.text('Orig. Invoice Date:', rx, detailsY + 15);
    doc.setFont('helvetica', 'normal');
    doc.text(format(new Date(note.original_invoice_date), 'dd/MM/yyyy'), rx + 30, detailsY + 15);
  }
  y = detailsY + 30;

  if (note.reason) {
    doc.setFont('helvetica', 'bold');
    doc.text('Reason for Debit Note:', margin, y);
    doc.setFont('helvetica', 'normal');
    const reasonLines = doc.splitTextToSize(sanitizePdfText(note.reason), contentW);
    doc.text(reasonLines, margin, y + 5);
    y += 5 + reasonLines.length * 4;
  }
  y += 3;

  const tableBody = items.map((item, i) => [
    (i + 1).toString(),
    sanitizePdfText(item.description),
    item.hsn_code || '-',
    String(item.quantity),
    formatCurrencyAscii(Number(item.rate)),
    formatCurrencyAscii(Number(item.amount)),
  ]);

  autoTable(doc, {
    startY: y,
    head: [['#', 'Description', 'HSN', 'Qty', 'Rate', 'Amount']],
    body: tableBody,
    theme: 'grid',
    margin: { left: margin, right: margin },
    styles: { fontSize: 7.5, cellPadding: 2, textColor: [30, 30, 30] },
    headStyles: { fillColor: [139, 69, 19], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.5 },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 22, halign: 'center' },
      3: { cellWidth: 18, halign: 'center' },
      4: { cellWidth: 28, halign: 'right' },
      5: { cellWidth: 30, halign: 'right' },
    },
    alternateRowStyles: { fillColor: [250, 248, 240] },
  });

  y = (doc as any).lastAutoTable.finalY + 5;
  const summaryX = pageW - margin - 65;
  const valX = pageW - margin;

  const subtotal = Number(note.subtotal);
  const cgstAmt = Number(note.cgst_amount);
  const sgstAmt = Number(note.sgst_amount);
  const igstAmt = Number(note.igst_amount);
  const roundedTotal = Math.round(Number(note.total_amount));

  const drawRow = (label: string, value: string, bold = false) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(8);
    doc.text(label, summaryX, y);
    doc.text(value, valX, y, { align: 'right' });
    y += 5;
  };

  drawRow('Subtotal:', formatCurrencyAscii(subtotal));
  if (note.tax_type === 'intra') {
    drawRow(`CGST @ ${note.cgst_rate}%:`, formatCurrencyAscii(cgstAmt));
    drawRow(`SGST @ ${note.sgst_rate}%:`, formatCurrencyAscii(sgstAmt));
  } else {
    drawRow(`IGST @ ${note.igst_rate}%:`, formatCurrencyAscii(igstAmt));
  }

  doc.setDrawColor(139, 69, 19);
  doc.setLineWidth(0.3);
  doc.line(summaryX, y - 1, valX, y - 1);
  drawRow('Total Amount:', formatCurrencyAscii(roundedTotal), true);

  y += 2;
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'italic');
  doc.text(`Amount in Words: ${numberToWords(roundedTotal)} Rupees Only`, margin, y);
  y += 8;

  doc.setFillColor(245, 240, 230);
  doc.rect(margin, y, contentW / 2 - 2, 22, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 30, 30);
  doc.text('Bank Details', margin + 3, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(`Bank: ${COMPANY_INFO.bank.name}`, margin + 3, y + 10);
  doc.text(`A/C No: ${COMPANY_INFO.bank.accountNo}`, margin + 3, y + 14);
  doc.text(`IFSC: ${COMPANY_INFO.bank.ifsc}`, margin + 3, y + 18);

  const sigX = margin + contentW / 2 + 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(`For ${COMPANY_INFO.name}`, sigX, y + 5);

  try {
    const sigImg = new Image();
    sigImg.src = signature;
    await new Promise(r => { sigImg.onload = r; });
    doc.addImage(sigImg, 'PNG', sigX, y + 7, 25, 10);
  } catch {}

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('Authorized Signatory', sigX, y + 20);

  if (action === 'download') {
    doc.save(`DebitNote-${note.debit_note_no}.pdf`);
  } else {
    const blob = doc.output('blob');
    return URL.createObjectURL(blob);
  }
}
