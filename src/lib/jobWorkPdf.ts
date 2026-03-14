import type { BatchJobWork, BatchJobWorkOperation } from '@/hooks/useJobWorks';
import { format } from 'date-fns';

const loadPdfLibs = async () => {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);
  return { jsPDF, autoTable };
};

interface JobWorkPdfData {
  jobWork: BatchJobWork;
  operations: BatchJobWorkOperation[];
  styles: Array<{ id: string; style_code: string; style_name: string }>;
  payments: Array<{ id: string; payment_amount: number; payment_type?: string; is_settled?: boolean; notes?: string; created_at: string; adjustment?: number }>;
  workerInfo?: { address?: string; gstin?: string } | null;
}

export async function generateJobWorkPdf(data: JobWorkPdfData) {
  const { jsPDF, autoTable } = await loadPdfLibs();
  const { jobWork, operations, styles, payments, workerInfo } = data;

  const doc = new jsPDF('p', 'mm', 'a4');
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const ml = 15;
  const mr = pw - 15;
  let y = 15;

  const brandColor: [number, number, number] = [45, 64, 87];
  const goldColor: [number, number, number] = [184, 134, 11];
  const grayText: [number, number, number] = [80, 80, 80];
  const lightGray: [number, number, number] = [245, 245, 245];

  // ─── HEADER ────────────────────────────────
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...brandColor);
  doc.text('Feather Fashions', ml, y + 5);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 100, 100);
  doc.text('Crafted with Precision, Designed for Comfort', ml, y + 10);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text('Vadivel Nagar, 251/1, Thottipalayam, Pooluvapatti, Tiruppur, TN 641602', ml, y + 15);

  // Title on right
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...brandColor);
  doc.text('JOB WORK BILL', mr, y + 5, { align: 'right' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayText);
  doc.text(`Date: ${format(new Date(jobWork.created_at), 'dd MMM yyyy')}`, mr, y + 11, { align: 'right' });

  // Divider
  y += 20;
  doc.setDrawColor(...goldColor);
  doc.setLineWidth(0.8);
  doc.line(ml, y, mr, y);
  y += 6;

  // ─── WORKER DETAILS ────────────────────────
  doc.setFillColor(...lightGray);
  doc.roundedRect(ml, y, pw - 30, 24, 2, 2, 'F');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...brandColor);
  doc.text('Job Worker', ml + 4, y + 6);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(jobWork.company_name, ml + 4, y + 12);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayText);
  if (workerInfo?.address) {
    doc.text(workerInfo.address, ml + 4, y + 17);
  }
  if (workerInfo?.gstin) {
    doc.text(`GSTIN: ${workerInfo.gstin}`, ml + 4, y + 21);
  }

  // Right side - summary boxes
  const boxX = pw / 2 + 10;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayText);
  doc.text('Total Pieces', boxX, y + 6);
  doc.text('Work Status', boxX + 35, y + 6);

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(String(jobWork.pieces), boxX, y + 13);

  const statusLabel = (jobWork.work_status || 'pending').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  doc.setFontSize(10);
  doc.text(statusLabel, boxX + 35, y + 13);

  y += 30;

  // ─── VARIATIONS TABLE ──────────────────────
  const variations = (jobWork.variations || []) as Array<{ type_index: number; style_id: string; color: string; pieces: number; sizes?: string }>;

  if (variations.length > 0) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...brandColor);
    doc.text('Style & Color Details', ml, y);
    y += 2;

    autoTable(doc, {
      startY: y,
      margin: { left: ml, right: 15 },
      head: [['Style', 'Color', 'Sizes', 'Pieces']],
      body: variations.map(v => {
        const style = styles.find(s => s.id === v.style_id);
        return [
          `${style?.style_code || ''} - ${style?.style_name || 'Unknown'}`,
          v.color,
          v.sizes || '-',
          String(v.pieces),
        ];
      }),
      headStyles: { fillColor: brandColor, fontSize: 8, font: 'helvetica', fontStyle: 'bold', cellPadding: 3 },
      bodyStyles: { fontSize: 8, cellPadding: 2.5, textColor: [40, 40, 40] },
      alternateRowStyles: { fillColor: [250, 250, 248] },
      columnStyles: { 3: { halign: 'right' } },
    });

    y = (doc as any).lastAutoTable.finalY + 6;
  }

  // ─── OPERATIONS TABLE ──────────────────────
  const isSetItem = operations.some(op => op.operation.includes('Top')) && operations.some(op => op.operation.includes('Pant'));

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...brandColor);
  doc.text('Operations & Pricing', ml, y);
  y += 2;

  const opsTotal = operations.reduce((s, op) => s + (op.rate_per_piece * op.quantity), 0);

  autoTable(doc, {
    startY: y,
    margin: { left: ml, right: 15 },
    head: [['Operation', 'Rate/Pc (Rs.)', 'Quantity', 'Amount (Rs.)']],
    body: [
      ...operations.map(op => [
        op.operation,
        op.rate_per_piece.toFixed(2),
        String(op.quantity),
        (op.rate_per_piece * op.quantity).toFixed(2),
      ]),
      [{ content: 'Operations Total', colSpan: 3, styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } }, { content: opsTotal.toFixed(2), styles: { fontStyle: 'bold', fillColor: [240, 240, 240], halign: 'right' } }],
    ],
    headStyles: { fillColor: brandColor, fontSize: 8, font: 'helvetica', fontStyle: 'bold', cellPadding: 3 },
    bodyStyles: { fontSize: 8, cellPadding: 2.5, textColor: [40, 40, 40] },
    alternateRowStyles: { fillColor: [250, 250, 248] },
    columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' } },
  });

  y = (doc as any).lastAutoTable.finalY + 6;

  // ─── CONFIRMED RETURNS ─────────────────────
  const confirmedData = jobWork.confirmed_return_pieces as { top?: number; pant?: number; total?: number } | null;

  if (confirmedData) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...brandColor);
    doc.text('Confirmed Return Pieces', ml, y);
    y += 2;

    if (isSetItem && confirmedData.top !== undefined) {
      autoTable(doc, {
        startY: y,
        margin: { left: ml, right: 15 },
        head: [['Component', 'Sent', 'Returned', 'Short']],
        body: [
          ['Top', String(jobWork.pieces), String(confirmedData.top ?? 0), String(jobWork.pieces - (confirmedData.top ?? 0))],
          ['Pant', String(jobWork.pieces), String(confirmedData.pant ?? 0), String(jobWork.pieces - (confirmedData.pant ?? 0))],
        ],
        headStyles: { fillColor: brandColor, fontSize: 8, fontStyle: 'bold', cellPadding: 3 },
        bodyStyles: { fontSize: 8, cellPadding: 2.5, textColor: [40, 40, 40] },
        alternateRowStyles: { fillColor: [250, 250, 248] },
        columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' } },
      });
    } else {
      autoTable(doc, {
        startY: y,
        margin: { left: ml, right: 15 },
        head: [['Sent', 'Returned', 'Short']],
        body: [
          [String(jobWork.pieces), String(confirmedData.total ?? 0), String(jobWork.pieces - (confirmedData.total ?? 0))],
        ],
        headStyles: { fillColor: brandColor, fontSize: 8, fontStyle: 'bold', cellPadding: 3 },
        bodyStyles: { fontSize: 8, cellPadding: 2.5, textColor: [40, 40, 40] },
        columnStyles: { 0: { halign: 'right' }, 1: { halign: 'right' }, 2: { halign: 'right' } },
      });
    }
    y = (doc as any).lastAutoTable.finalY + 6;
  }

  // ─── BILLING SUMMARY ──────────────────────
  const ensureSpace = (needed: number) => {
    if (y + needed > ph - 25) {
      doc.addPage();
      y = 15;
    }
  };

  ensureSpace(50);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...brandColor);
  doc.text('Billing Summary', ml, y);
  y += 2;

  const profitPerPiece = jobWork.company_profit || 0;
  const pricePerPiece = jobWork.pieces > 0 ? opsTotal / jobWork.pieces : 0;

  const summaryRows: string[][] = [];

  if (confirmedData && isSetItem && confirmedData.top !== undefined) {
    const topOp = operations.find(op => op.operation.includes('Top'));
    const pantOp = operations.find(op => op.operation.includes('Pant'));
    const topRate = topOp?.rate_per_piece ?? 0;
    const pantRate = pantOp?.rate_per_piece ?? 0;
    const topCount = confirmedData.top ?? 0;
    const pantCount = confirmedData.pant ?? 0;

    summaryRows.push(
      ['Top Work', `${topCount} pcs x Rs.${topRate.toFixed(2)}`, (topRate * topCount).toFixed(2)],
      ['Pant Work', `${pantCount} pcs x Rs.${pantRate.toFixed(2)}`, (pantRate * pantCount).toFixed(2)],
    );

    if (profitPerPiece > 0) {
      const profitBase = Math.max(topCount, pantCount);
      summaryRows.push(['Company Profit', `${profitBase} pcs x Rs.${profitPerPiece.toFixed(2)}`, (profitPerPiece * profitBase).toFixed(2)]);
    }

    const billable = (topRate * topCount) + (pantRate * pantCount) + (profitPerPiece * Math.max(topCount, pantCount));
    summaryRows.push(['', '', '']);
    summaryRows.push(['TOTAL BILLABLE', '', billable.toFixed(2)]);
  } else if (confirmedData && confirmedData.total !== undefined) {
    const billablePcs = confirmedData.total;
    summaryRows.push(
      ['Operations', `${billablePcs} pcs x Rs.${pricePerPiece.toFixed(2)}`, (pricePerPiece * billablePcs).toFixed(2)],
    );
    if (profitPerPiece > 0) {
      summaryRows.push(['Company Profit', `${billablePcs} pcs x Rs.${profitPerPiece.toFixed(2)}`, (profitPerPiece * billablePcs).toFixed(2)]);
    }
    const billable = (pricePerPiece + profitPerPiece) * billablePcs;
    summaryRows.push(['', '', '']);
    summaryRows.push(['TOTAL BILLABLE', '', billable.toFixed(2)]);
  } else {
    // No confirmed return — use original
    summaryRows.push(
      ['Operations Total', `${jobWork.pieces} pcs`, opsTotal.toFixed(2)],
    );
    if (profitPerPiece > 0) {
      summaryRows.push(['Company Profit', `${jobWork.pieces} pcs x Rs.${profitPerPiece.toFixed(2)}`, (profitPerPiece * jobWork.pieces).toFixed(2)]);
    }
    summaryRows.push(['', '', '']);
    summaryRows.push(['TOTAL AMOUNT', '', jobWork.total_amount.toFixed(2)]);
  }

  autoTable(doc, {
    startY: y,
    margin: { left: ml, right: 15 },
    head: [['Description', 'Details', 'Amount (Rs.)']],
    body: summaryRows.map((row, idx) => {
      const isTotal = row[0].includes('TOTAL');
      if (isTotal) {
        return row.map(cell => ({ content: cell, styles: { fontStyle: 'bold' as const, fillColor: [240, 235, 220] as [number, number, number], fontSize: 10 } }));
      }
      if (row[0] === '' && row[1] === '' && row[2] === '') {
        return row.map(cell => ({ content: '', styles: { cellPadding: 0.5 } }));
      }
      return row;
    }),
    headStyles: { fillColor: brandColor, fontSize: 8, fontStyle: 'bold', cellPadding: 3 },
    bodyStyles: { fontSize: 8, cellPadding: 2.5, textColor: [40, 40, 40] },
    columnStyles: { 2: { halign: 'right' } },
  });

  y = (doc as any).lastAutoTable.finalY + 6;

  // ─── PAYMENT SUMMARY ──────────────────────
  if (payments.length > 0) {
    ensureSpace(40);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...brandColor);
    doc.text('Payment History', ml, y);
    y += 2;

    autoTable(doc, {
      startY: y,
      margin: { left: ml, right: 15 },
      head: [['Date', 'Type', 'Amount (Rs.)', 'Status', 'Notes']],
      body: payments.map(p => [
        format(new Date(p.created_at), 'dd MMM yyyy'),
        (p.payment_type || 'payment') === 'advance' ? 'Advance' : 'Payment',
        p.payment_amount.toFixed(2),
        (p.payment_type || 'payment') === 'advance' ? (p.is_settled ? 'Settled' : 'Unsettled') : '-',
        p.notes || '-',
      ]),
      headStyles: { fillColor: brandColor, fontSize: 8, fontStyle: 'bold', cellPadding: 3 },
      bodyStyles: { fontSize: 8, cellPadding: 2.5, textColor: [40, 40, 40] },
      alternateRowStyles: { fillColor: [250, 250, 248] },
      columnStyles: { 2: { halign: 'right' } },
    });

    y = (doc as any).lastAutoTable.finalY + 6;
  }

  // ─── PAYMENT TOTALS BOX ────────────────────
  ensureSpace(30);

  doc.setFillColor(245, 245, 242);
  doc.roundedRect(pw / 2, y, pw / 2 - 15, 28, 2, 2, 'F');

  const totalPaid = payments.reduce((s, p) => s + p.payment_amount, 0);
  const balRight = mr - 4;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayText);
  doc.text('Total Amount:', pw / 2 + 4, y + 7);
  doc.text(`Rs. ${jobWork.total_amount.toFixed(2)}`, balRight, y + 7, { align: 'right' });

  doc.text('Total Paid:', pw / 2 + 4, y + 13);
  doc.setTextColor(34, 139, 34);
  doc.text(`Rs. ${totalPaid.toFixed(2)}`, balRight, y + 13, { align: 'right' });

  doc.setDrawColor(200, 200, 200);
  doc.line(pw / 2 + 4, y + 16, balRight, y + 16);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(jobWork.balance_amount > 0 ? 200 : 34, jobWork.balance_amount > 0 ? 60 : 139, jobWork.balance_amount > 0 ? 20 : 34);
  doc.text('Balance Due:', pw / 2 + 4, y + 23);
  doc.text(`Rs. ${jobWork.balance_amount.toFixed(2)}`, balRight, y + 23, { align: 'right' });

  y += 34;

  // ─── NOTES ─────────────────────────────────
  if (jobWork.notes) {
    ensureSpace(20);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...brandColor);
    doc.text('Notes:', ml, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...grayText);
    const noteLines = doc.splitTextToSize(jobWork.notes, pw - 30);
    doc.text(noteLines, ml, y + 5);
    y += 5 + noteLines.length * 4;
  }

  // ─── FOOTER ────────────────────────────────
  const footerY = ph - 20;
  doc.setDrawColor(...goldColor);
  doc.setLineWidth(0.5);
  doc.line(ml, footerY, mr, footerY);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(140, 140, 140);
  doc.text('This is a computer-generated document. No signature required.', ml, footerY + 5);
  doc.text(`Generated on ${format(new Date(), 'dd MMM yyyy, HH:mm')}`, mr, footerY + 5, { align: 'right' });

  // For authorized signatory
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayText);
  doc.text('For Feather Fashions', mr, footerY - 12, { align: 'right' });
  doc.setLineWidth(0.3);
  doc.setDrawColor(150, 150, 150);
  doc.line(mr - 45, footerY - 5, mr, footerY - 5);
  doc.setFontSize(7);
  doc.text('Authorized Signatory', mr, footerY - 2, { align: 'right' });

  // Save
  const filename = `JobWork_${jobWork.company_name.replace(/\s+/g, '_')}_${format(new Date(jobWork.created_at), 'ddMMyyyy')}.pdf`;
  doc.save(filename);
}
