import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format, parseISO, eachDayOfInterval, isWithinInterval } from 'date-fns';
import type { StaffWeeklyPayout, StaffAdvance } from '@/hooks/useStaffAdvances';
import type { StaffAbsence } from '@/hooks/useStaff';
import letterheadLogo from '@/assets/feather-letterhead-logo.png';

interface PayslipData {
  payout: StaffWeeklyPayout;
  staffName: string;
  employeeCode?: string;
  department?: string;
  advances: StaffAdvance[];
  absences: StaffAbsence[];
}

const BRAND_DARK = '#1a2332';
const BRAND_BLUE = '#2D4057';
const BRAND_GOLD = '#B8860B';
const BRAND_LIGHT = '#f8fafc';
const TEXT_GRAY = '#64748b';
const TEXT_DARK = '#1e293b';
const BORDER_COLOR = '#e2e8f0';
const GREEN = '#16a34a';
const RED = '#dc2626';
const ORANGE = '#ea580c';

export const generatePayslipPDF = async (data: PayslipData) => {
  const { payout, staffName, employeeCode, department, advances, absences } = data;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 16;
  const contentW = pageW - margin * 2;
  let y = margin;

  // ─── Helper Functions ───
  const drawLine = (yPos: number, color = BORDER_COLOR) => {
    doc.setDrawColor(color);
    doc.setLineWidth(0.3);
    doc.line(margin, yPos, pageW - margin, yPos);
  };

  const addSectionTitle = (title: string, yPos: number): number => {
    doc.setFillColor(BRAND_DARK);
    doc.roundedRect(margin, yPos, contentW, 7, 1, 1, 'F');
    doc.setTextColor('#ffffff');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(title.toUpperCase(), margin + 4, yPos + 4.8);
    return yPos + 10;
  };

  const addKeyValue = (label: string, value: string, xStart: number, yPos: number, labelW = 40): number => {
    doc.setTextColor(TEXT_GRAY);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text(label, xStart, yPos);
    doc.setTextColor(TEXT_DARK);
    doc.setFont('helvetica', 'bold');
    doc.text(value, xStart + labelW, yPos);
    return yPos;
  };

  // ─── HEADER ───
  // Logo
  try {
    doc.addImage(letterheadLogo, 'PNG', margin, y, 28, 14);
  } catch { /* fallback if logo fails */ }

  // Company info - right aligned
  doc.setTextColor(BRAND_BLUE);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Feather Fashions', pageW - margin, y + 4, { align: 'right' });
  
  doc.setTextColor(TEXT_GRAY);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text('251/1, Vadivel Nagar, Thottipalayam', pageW - margin, y + 8.5, { align: 'right' });
  doc.text('Pooluvapatti, Tiruppur, Tamil Nadu 641602', pageW - margin, y + 12, { align: 'right' });
  
  doc.setTextColor(BRAND_GOLD);
  doc.setFontSize(7);
  doc.text('+91 9988322555 | hello@featherfashions.in', pageW - margin, y + 15.5, { align: 'right' });

  y += 20;
  drawLine(y, BRAND_BLUE);
  y += 2;

  // ─── PAYSLIP TITLE ───
  doc.setFillColor(BRAND_BLUE);
  doc.roundedRect(margin, y, contentW, 10, 1.5, 1.5, 'F');
  doc.setTextColor('#ffffff');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('WEEKLY SALARY PAYSLIP', pageW / 2, y + 6.8, { align: 'center' });
  y += 14;

  // ─── EMPLOYEE DETAILS ───
  y = addSectionTitle('Employee Details', y);

  const weekStart = parseISO(payout.week_start_date);
  const weekEnd = parseISO(payout.week_end_date);

  // Row 1
  addKeyValue('Employee Name:', staffName, margin + 2, y + 2);
  addKeyValue('Employee Code:', employeeCode || '—', pageW / 2, y + 2);
  y += 7;

  // Row 2
  addKeyValue('Pay Period:', `${format(weekStart, 'dd MMM yyyy')} — ${format(weekEnd, 'dd MMM yyyy')}`, margin + 2, y);
  addKeyValue('Payment Date:', format(parseISO(payout.payment_date), 'dd MMM yyyy'), pageW / 2, y);
  y += 7;

  // Row 3
  addKeyValue('Payment Mode:', (payout.payment_mode || 'Cash').replace('_', ' ').toUpperCase(), margin + 2, y);
  addKeyValue('Daily Rate:', `₹${payout.daily_rate.toLocaleString()}`, pageW / 2, y);
  y += 10;

  // ─── DAY-WISE ATTENDANCE ───
  y = addSectionTitle('Attendance & Day Breakdown', y);

  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const dayRows = days.map(day => {
    const dateStr = format(day, 'yyyy-MM-dd');
    let status = 'Present';
    let amount = payout.daily_rate;
    
    for (const a of absences) {
      const from = parseISO(a.from_date);
      const to = parseISO(a.to_date);
      if (isWithinInterval(day, { start: from, end: to })) {
        if (a.leave_type === 'first_half' || a.leave_type === 'second_half') {
          status = `Half Day (${a.leave_type === 'first_half' ? 'AM Off' : 'PM Off'})`;
          amount = payout.daily_rate * 0.5;
        } else {
          status = 'Absent';
          amount = 0;
        }
      }
    }
    
    return [
      format(day, 'EEE'),
      format(day, 'dd MMM yyyy'),
      status,
      `₹${amount.toLocaleString()}`,
    ];
  });

  autoTable(doc, {
    startY: y,
    head: [['Day', 'Date', 'Status', 'Amount']],
    body: dayRows,
    theme: 'grid',
    margin: { left: margin, right: margin },
    headStyles: {
      fillColor: BRAND_DARK,
      textColor: '#ffffff',
      fontSize: 8,
      fontStyle: 'bold',
      cellPadding: 2.5,
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: TEXT_DARK,
    },
    columnStyles: {
      0: { cellWidth: 16, halign: 'center' },
      1: { cellWidth: 35 },
      2: { cellWidth: 'auto' },
      3: { cellWidth: 28, halign: 'right', fontStyle: 'bold' },
    },
    didParseCell: (hookData) => {
      if (hookData.section === 'body' && hookData.column.index === 2) {
        const val = String(hookData.cell.raw);
        if (val === 'Absent') {
          hookData.cell.styles.textColor = RED;
          hookData.cell.styles.fontStyle = 'bold';
        } else if (val.includes('Half Day')) {
          hookData.cell.styles.textColor = ORANGE;
          hookData.cell.styles.fontStyle = 'bold';
        } else {
          hookData.cell.styles.textColor = GREEN;
        }
      }
      if (hookData.section === 'body' && hookData.column.index === 3) {
        const val = String(hookData.cell.raw);
        if (val === '₹0') {
          hookData.cell.styles.textColor = RED;
        }
      }
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  y = (doc as any).lastAutoTable.finalY + 6;

  // ─── SALARY BREAKDOWN ───
  y = addSectionTitle('Salary Calculation', y);

  // Parse effort bonus from notes
  let effortBonus = 0;
  if (payout.notes) {
    const match = payout.notes.match(/Effort Bonus:\s*₹?([\d,]+)/);
    if (match) effortBonus = parseFloat(match[1].replace(/,/g, ''));
  }

  const absenceDeduction = payout.absent_days * payout.daily_rate;

  const calcRows: (string | string[])[][] = [
    ['Full Week Salary', `${payout.total_days} days × ₹${payout.daily_rate.toLocaleString()}`, `₹${(payout.total_days * payout.daily_rate).toLocaleString()}`],
  ];

  if (payout.absent_days > 0) {
    calcRows.push([
      'Absence Deduction',
      `${payout.absent_days} day${payout.absent_days !== 1 ? 's' : ''} × ₹${payout.daily_rate.toLocaleString()}`,
      `- ₹${absenceDeduction.toLocaleString()}`,
    ]);
  }

  calcRows.push([
    'Gross Salary (Working Days)',
    `${payout.working_days} days × ₹${payout.daily_rate.toLocaleString()}`,
    `₹${payout.gross_salary.toLocaleString()}`,
  ]);

  if (payout.advance_deducted > 0) {
    calcRows.push([
      'Advance Deduction',
      'Deducted from pending advances',
      `- ₹${payout.advance_deducted.toLocaleString()}`,
    ]);
  }

  if (effortBonus > 0) {
    calcRows.push([
      'Effort Bonus',
      'Reward for hard work',
      `+ ₹${effortBonus.toLocaleString()}`,
    ]);
  }

  autoTable(doc, {
    startY: y,
    head: [['Component', 'Details', 'Amount']],
    body: calcRows,
    theme: 'grid',
    margin: { left: margin, right: margin },
    headStyles: {
      fillColor: BRAND_DARK,
      textColor: '#ffffff',
      fontSize: 8,
      fontStyle: 'bold',
      cellPadding: 2.5,
    },
    bodyStyles: {
      fontSize: 8.5,
      cellPadding: 3,
      textColor: TEXT_DARK,
    },
    columnStyles: {
      0: { cellWidth: 50, fontStyle: 'bold' },
      1: { cellWidth: 'auto', textColor: TEXT_GRAY },
      2: { cellWidth: 35, halign: 'right', fontStyle: 'bold' },
    },
    didParseCell: (hookData) => {
      if (hookData.section === 'body' && hookData.column.index === 2) {
        const val = String(hookData.cell.raw);
        if (val.startsWith('-')) hookData.cell.styles.textColor = RED;
        else if (val.startsWith('+')) hookData.cell.styles.textColor = GREEN;
      }
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  y = (doc as any).lastAutoTable.finalY + 2;

  // ─── NET PAYABLE BOX ───
  doc.setFillColor('#ecfdf5');
  doc.roundedRect(margin, y, contentW, 12, 2, 2, 'F');
  doc.setDrawColor(GREEN);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, y, contentW, 12, 2, 2, 'S');
  
  doc.setTextColor(TEXT_DARK);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('NET PAYABLE', margin + 6, y + 7.5);
  
  doc.setTextColor(GREEN);
  doc.setFontSize(14);
  doc.text(`₹${payout.net_paid.toLocaleString()}`, pageW - margin - 6, y + 7.8, { align: 'right' });
  y += 18;

  // ─── PENDING ADVANCES ───
  const pendingAdvances = advances.filter(a => a.remaining_amount > 0);
  if (pendingAdvances.length > 0) {
    y = addSectionTitle('Remaining Advance Balances', y);

    const advRows = pendingAdvances.map((a, i) => [
      String(i + 1),
      format(parseISO(a.advance_date), 'dd MMM yyyy'),
      `₹${a.amount.toLocaleString()}`,
      `₹${(a.amount - a.remaining_amount).toLocaleString()}`,
      `₹${a.remaining_amount.toLocaleString()}`,
      a.status.replace('_', ' '),
    ]);

    const totalRemaining = pendingAdvances.reduce((s, a) => s + a.remaining_amount, 0);

    autoTable(doc, {
      startY: y,
      head: [['#', 'Date', 'Original', 'Recovered', 'Remaining', 'Status']],
      body: advRows,
      foot: [['', '', '', '', `₹${totalRemaining.toLocaleString()}`, 'Total Pending']],
      theme: 'grid',
      margin: { left: margin, right: margin },
      headStyles: {
        fillColor: BRAND_DARK,
        textColor: '#ffffff',
        fontSize: 7.5,
        fontStyle: 'bold',
        cellPadding: 2,
      },
      bodyStyles: {
        fontSize: 7.5,
        cellPadding: 2,
        textColor: TEXT_DARK,
      },
      footStyles: {
        fillColor: '#fff7ed',
        textColor: ORANGE,
        fontSize: 8,
        fontStyle: 'bold',
        cellPadding: 2.5,
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 28 },
        2: { cellWidth: 28, halign: 'right' },
        3: { cellWidth: 28, halign: 'right' },
        4: { cellWidth: 28, halign: 'right', fontStyle: 'bold' },
        5: { cellWidth: 'auto', halign: 'center' },
      },
      didParseCell: (hookData) => {
        if (hookData.section === 'body' && hookData.column.index === 4) {
          hookData.cell.styles.textColor = ORANGE;
        }
      },
      alternateRowStyles: { fillColor: [255, 251, 245] },
    });

    y = (doc as any).lastAutoTable.finalY + 6;
  }

  // ─── NOTES ───
  if (payout.notes) {
    const cleanNotes = payout.notes.replace(/Effort Bonus:\s*₹?[\d,]+\s*\|?\s*/g, '').trim();
    if (cleanNotes) {
      doc.setTextColor(TEXT_GRAY);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'italic');
      doc.text(`Notes: ${cleanNotes}`, margin + 2, y);
      y += 6;
    }
  }

  // ─── FOOTER ───
  const pageH = doc.internal.pageSize.getHeight();
  const footerY = pageH - 22;

  drawLine(footerY, BORDER_COLOR);

  // Signature line
  doc.setDrawColor(TEXT_GRAY);
  doc.setLineWidth(0.3);
  doc.line(pageW - margin - 50, footerY + 10, pageW - margin, footerY + 10);
  doc.setTextColor(TEXT_GRAY);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Authorized Signatory', pageW - margin - 25, footerY + 14, { align: 'center' });

  // Footer text
  doc.setTextColor(TEXT_GRAY);
  doc.setFontSize(6.5);
  doc.text('This is a system-generated payslip. For queries, contact the HR department.', margin, footerY + 8);
  doc.text(`Generated on ${format(new Date(), 'dd MMM yyyy, hh:mm a')}`, margin, footerY + 12);

  // ─── SAVE ───
  const fileName = `Payslip_${staffName.replace(/\s+/g, '_')}_${format(weekStart, 'dd_MMM')}-${format(weekEnd, 'dd_MMM_yyyy')}.pdf`;
  doc.save(fileName);
};
