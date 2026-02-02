/**
 * CMT Quotation PDF Generator - Native jsPDF rendering for professional output
 * Uses direct text/table rendering instead of html2canvas for crisp, clean PDFs
 */

import { CMTQuotationData } from '@/types/cmt-quotation';
import { sanitizePdfText, formatCurrencyAscii } from './invoiceUtils';

// Dynamic import for jsPDF - reduces bundle size
const loadPdfLibs = async () => {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable')
  ]);
  return { jsPDF, autoTable };
};

// Colors
const COLORS = {
  primary: [26, 26, 26] as [number, number, number],      // #1a1a1a
  secondary: [55, 65, 81] as [number, number, number],    // #374151
  muted: [107, 114, 128] as [number, number, number],     // #6b7280
  light: [156, 163, 175] as [number, number, number],     // #9ca3af
  white: [255, 255, 255] as [number, number, number],
  lightBg: [249, 250, 251] as [number, number, number],   // #f9fafb
  border: [229, 231, 235] as [number, number, number],    // #e5e7eb
  accent: [45, 64, 87] as [number, number, number],       // Feather Navy #2D4057
};

export const generateCMTPdf = async (data: CMTQuotationData): Promise<void> => {
  const { jsPDF, autoTable } = await loadPdfLibs();
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let yPos = margin;

  // Calculate totals
  const totalStitchingCost = data.operations.reduce((sum, op) => sum + op.ratePerPiece, 0);
  const finalCMTPerPiece = totalStitchingCost + data.finishingPackingCost + data.overheadsCost;
  const totalOrderValue = finalCMTPerPiece * data.orderQuantity;
  const totalSMV = data.operations.reduce((sum, op) => sum + op.smv, 0);

  // ===== HEADER SECTION =====
  // Header background
  doc.setFillColor(...COLORS.accent);
  doc.rect(0, 0, pageWidth, 50, 'F');

  // Company Logo placeholder
  doc.setFillColor(...COLORS.white);
  doc.roundedRect(margin, 10, 22, 22, 2, 2, 'F');
  doc.setTextColor(...COLORS.accent);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('FF', margin + 11, 23, { align: 'center' });

  // Company Name
  const textStartX = margin + 28;
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('FEATHER FASHIONS', textStartX, 18);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 210, 220);
  doc.text('Garment Manufacturing Unit', textStartX, 25);
  
  doc.setFontSize(7);
  doc.setTextColor(170, 180, 190);
  doc.text('251/1, Vadivel Nagar, Thottipalayam, Pooluvapatti', textStartX, 31);
  doc.text('Tiruppur, Tamil Nadu 641602, India', textStartX, 36);

  // Quotation Badge - Right side
  doc.setFillColor(...COLORS.white);
  doc.roundedRect(pageWidth - margin - 55, 10, 55, 32, 3, 3, 'F');
  doc.setTextColor(...COLORS.accent);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('CMT QUOTATION', pageWidth - margin - 27.5, 20, { align: 'center' });
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.muted);
  doc.text(sanitizePdfText(`No: ${data.quotationNo}`), pageWidth - margin - 27.5, 28, { align: 'center' });
  doc.text(sanitizePdfText(`Date: ${data.date}`), pageWidth - margin - 27.5, 34, { align: 'center' });
  doc.text(sanitizePdfText(`Valid: ${data.validUntil}`), pageWidth - margin - 27.5, 40, { align: 'center' });

  yPos = 55;

  // Contact info bar
  doc.setFillColor(...COLORS.lightBg);
  doc.rect(0, yPos, pageWidth, 10, 'F');
  doc.setTextColor(...COLORS.muted);
  doc.setFontSize(7);
  const contactInfo = [
    'GST: 33FWTPS1281P1ZJ',
    'Ph: +91 9789225510',
    'Email: hello@featherfashions.in'
  ];
  const infoWidth = (pageWidth - 2 * margin) / 3;
  contactInfo.forEach((info, i) => {
    doc.text(sanitizePdfText(info), margin + (i * infoWidth) + infoWidth / 2, yPos + 6.5, { align: 'center' });
  });

  yPos = 72;

  // ===== BUYER & STYLE DETAILS =====
  // Section header
  const addSectionHeader = (title: string, currentY: number): number => {
    doc.setFillColor(...COLORS.lightBg);
    doc.rect(margin, currentY, pageWidth - 2 * margin, 8, 'F');
    doc.setFillColor(...COLORS.accent);
    doc.rect(margin, currentY, 2, 8, 'F');
    doc.setTextColor(...COLORS.secondary);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(sanitizePdfText(title), margin + 5, currentY + 5.5);
    return currentY + 12;
  };

  yPos = addSectionHeader('BUYER & STYLE DETAILS', yPos);

  // Two-column layout
  const colWidth = (pageWidth - 2 * margin) / 2 - 5;
  
  // Left column - Buyer
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.secondary);
  doc.text('Buyer:', margin, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(sanitizePdfText(data.buyerName || 'Not specified'), margin + 15, yPos);
  
  if (data.buyerAddress) {
    yPos += 5;
    doc.setTextColor(...COLORS.muted);
    doc.setFontSize(8);
    const addressLines = data.buyerAddress.split('\n');
    addressLines.slice(0, 2).forEach((line, i) => {
      doc.text(sanitizePdfText(line), margin, yPos + (i * 4));
    });
    yPos += Math.min(addressLines.length, 2) * 4;
  }

  // Right column - Style Details
  const rightCol = margin + colWidth + 10;
  let rightY = yPos - (data.buyerAddress ? 5 + Math.min(data.buyerAddress.split('\n').length, 2) * 4 : 0);
  
  const styleDetails = [
    ['Style', data.styleName || '-'],
    ['Code', data.styleCode || '-'],
    ['Fabric', `${data.fabricType || '-'} ${data.gsm ? `(${data.gsm} GSM)` : ''}`],
    ['Fit', data.fitType || '-'],
    ['Size Range', data.sizeRange || '-'],
    ['Order Qty', data.orderQuantity > 0 ? `${data.orderQuantity.toLocaleString()} pcs` : '-'],
  ];

  doc.setFontSize(8);
  styleDetails.forEach((detail, i) => {
    const row = Math.floor(i / 2);
    const col = i % 2;
    const x = rightCol + (col * 45);
    const y = rightY + (row * 5);
    doc.setTextColor(...COLORS.muted);
    doc.text(sanitizePdfText(`${detail[0]}:`), x, y);
    doc.setTextColor(...COLORS.secondary);
    doc.text(sanitizePdfText(detail[1]), x + 22, y);
  });

  yPos = Math.max(yPos, rightY + 15) + 5;

  // ===== OPERATIONS TABLE =====
  yPos = addSectionHeader('OPERATIONS BREAKDOWN', yPos);

  if (data.operations.length > 0) {
    const operationsData = data.operations.map(op => [
      sanitizePdfText(op.category),
      sanitizePdfText(op.machineType),
      sanitizePdfText(op.description || '-'),
      op.smv.toFixed(2),
      sanitizePdfText(`Rs ${op.ratePerPiece.toFixed(2)}`)
    ]);

    // Add totals row
    operationsData.push([
      '', '', 'Total',
      totalSMV.toFixed(2),
      sanitizePdfText(`Rs ${totalStitchingCost.toFixed(2)}`)
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Category', 'Machine', 'Description', 'SMV', 'Rate/Pc']],
      body: operationsData,
      theme: 'plain',
      headStyles: {
        fillColor: COLORS.secondary,
        textColor: COLORS.white,
        fontSize: 8,
        fontStyle: 'bold',
        cellPadding: 3
      },
      bodyStyles: {
        fontSize: 8,
        cellPadding: 3,
        textColor: COLORS.secondary
      },
      alternateRowStyles: {
        fillColor: COLORS.lightBg
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 30 },
        2: { cellWidth: 'auto' },
        3: { cellWidth: 18, halign: 'right' },
        4: { cellWidth: 28, halign: 'right' }
      },
      margin: { left: margin, right: margin },
      didParseCell: (hookData) => {
        // Style the totals row
        if (hookData.row.index === operationsData.length - 1 && hookData.section === 'body') {
          hookData.cell.styles.fontStyle = 'bold';
          hookData.cell.styles.fillColor = COLORS.border;
        }
      }
    });

    yPos = (doc as any).lastAutoTable.finalY + 8;
  } else {
    doc.setTextColor(...COLORS.light);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text('No operations added', pageWidth / 2, yPos + 5, { align: 'center' });
    yPos += 12;
  }

  // ===== TRIMS TABLE (if any) =====
  if (data.trims.length > 0) {
    yPos = addSectionHeader('TRIMS & ACCESSORIES', yPos);

    const trimsData = data.trims.map(trim => [
      sanitizePdfText(trim.trimName || '-'),
      sanitizePdfText(trim.providedBy),
      sanitizePdfText(trim.remarks || '-')
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Item', 'Provided By', 'Remarks']],
      body: trimsData,
      theme: 'plain',
      headStyles: {
        fillColor: COLORS.secondary,
        textColor: COLORS.white,
        fontSize: 8,
        fontStyle: 'bold',
        cellPadding: 3
      },
      bodyStyles: {
        fontSize: 8,
        cellPadding: 3,
        textColor: COLORS.secondary
      },
      alternateRowStyles: {
        fillColor: COLORS.lightBg
      },
      margin: { left: margin, right: margin }
    });

    yPos = (doc as any).lastAutoTable.finalY + 8;
  }

  // ===== COST SUMMARY =====
  yPos = addSectionHeader('COST SUMMARY', yPos);

  // Cost summary box
  doc.setFillColor(...COLORS.lightBg);
  doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 42, 2, 2, 'F');
  doc.setDrawColor(...COLORS.border);
  doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 42, 2, 2, 'S');

  // Cost details grid
  const costItems = [
    ['Total Stitching Cost', `Rs ${totalStitchingCost.toFixed(2)}`],
    ['Finishing & Packing', `Rs ${data.finishingPackingCost.toFixed(2)}`],
    ['Overheads', `Rs ${data.overheadsCost.toFixed(2)}`],
    ['Order Quantity', data.orderQuantity > 0 ? `${data.orderQuantity.toLocaleString()} pcs` : '-']
  ];

  doc.setFontSize(8);
  const costColWidth = (pageWidth - 2 * margin - 20) / 2;
  costItems.forEach((item, i) => {
    const row = Math.floor(i / 2);
    const col = i % 2;
    const x = margin + 10 + (col * costColWidth);
    const y = yPos + 8 + (row * 6);
    doc.setTextColor(...COLORS.muted);
    doc.text(sanitizePdfText(item[0]), x, y);
    doc.setTextColor(...COLORS.secondary);
    doc.setFont('helvetica', 'bold');
    doc.text(sanitizePdfText(item[1]), x + 50, y);
    doc.setFont('helvetica', 'normal');
  });

  // Final CMT Per Piece - centered
  const boxY = yPos + 24;
  const boxWidth = 80;
  const boxX = (pageWidth - boxWidth) / 2;
  
  doc.setFillColor(...COLORS.accent);
  doc.roundedRect(boxX, boxY, boxWidth, 14, 2, 2, 'F');
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(7);
  doc.text('FINAL CMT / PIECE', boxX + boxWidth / 2, boxY + 5, { align: 'center' });
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(sanitizePdfText(`Rs ${finalCMTPerPiece.toFixed(2)}`), boxX + boxWidth / 2, boxY + 11, { align: 'center' });

  yPos += 45;

  yPos += 8;

  // ===== FOOTER / SIGNATURE =====
  // Check if we have enough space for footer
  if (yPos > pageHeight - 40) {
    doc.addPage();
    yPos = margin;
  }

  // Footer line
  doc.setDrawColor(...COLORS.border);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 8;

  // Left side - disclaimer
  doc.setTextColor(...COLORS.light);
  doc.setFontSize(7);
  doc.text('This is a computer generated quotation.', margin, yPos);
  doc.text('For any queries, please contact us.', margin, yPos + 4);

  // Right side - Signature
  const sigX = pageWidth - margin - 50;
  doc.setDrawColor(...COLORS.muted);
  doc.line(sigX, yPos + 10, sigX + 50, yPos + 10);
  doc.setTextColor(...COLORS.secondary);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(sanitizePdfText(data.signatoryName || 'Authorized Signatory'), sigX + 25, yPos + 16, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.muted);
  doc.text('Feather Fashions', sigX + 25, yPos + 20, { align: 'center' });

  // Save PDF
  doc.save(`CMT-Quotation-${data.quotationNo}.pdf`);
};
