import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { usePartPayments } from '@/hooks/usePartPayments';
import { useWeeklySettlements } from '@/hooks/useWeeklySettlements';
import { useJobProductionEntries } from '@/hooks/useJobProduction';
import { Banknote, Calendar, TrendingUp } from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval, parseISO } from 'date-fns';

interface EmployeePaymentRecordsProps {
  employeeId: string;
  employeeName: string;
}

const EmployeePaymentRecords = ({ employeeId, employeeName }: EmployeePaymentRecordsProps) => {
  const { data: partPayments, isLoading: loadingPayments } = usePartPayments(employeeId);
  const { data: settlements, isLoading: loadingSettlements } = useWeeklySettlements(employeeId);
  const { data: productionEntries, isLoading: loadingProduction } = useJobProductionEntries();

  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const yearStart = startOfYear(now);
  const yearEnd = endOfYear(now);

  // Calculate earnings
  const earnings = useMemo(() => {
    const employeeProduction = productionEntries?.filter(entry => entry.employee_id === employeeId) || [];
    
    const weekProduction = employeeProduction
      .filter(entry => isWithinInterval(parseISO(entry.date), { start: weekStart, end: weekEnd }))
      .reduce((sum, entry) => sum + (entry.total_amount || 0), 0);
    
    const monthProduction = employeeProduction
      .filter(entry => isWithinInterval(parseISO(entry.date), { start: monthStart, end: monthEnd }))
      .reduce((sum, entry) => sum + (entry.total_amount || 0), 0);
    
    const yearProduction = employeeProduction
      .filter(entry => isWithinInterval(parseISO(entry.date), { start: yearStart, end: yearEnd }))
      .reduce((sum, entry) => sum + (entry.total_amount || 0), 0);

    return {
      week: weekProduction,
      month: monthProduction,
      year: yearProduction,
    };
  }, [productionEntries, employeeId, weekStart, weekEnd, monthStart, monthEnd, yearStart, yearEnd]);

  // Combine and sort all payment records
  const allRecords = useMemo(() => {
    const payments = (partPayments || []).map(payment => ({
      date: payment.payment_date,
      type: 'Part Payment' as const,
      amount: payment.amount,
      mode: payment.payment_mode,
      status: 'paid' as const,
      note: payment.note,
    }));

    const settlementRecords = (settlements || []).map(settlement => ({
      date: settlement.payment_date || settlement.week_end_date,
      type: 'Weekly Settlement' as const,
      amount: settlement.net_payable,
      mode: settlement.payment_mode,
      status: settlement.payment_status,
      note: settlement.remarks,
      weekRange: `${format(parseISO(settlement.week_start_date), 'MMM dd')} - ${format(parseISO(settlement.week_end_date), 'MMM dd, yyyy')}`,
    }));

    return [...payments, ...settlementRecords].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [partPayments, settlements]);

  const isLoading = loadingPayments || loadingSettlements || loadingProduction;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Payment Records</h2>
            <p className="text-muted-foreground">{employeeName}</p>
          </div>
        </div>
        <div className="text-center py-8 text-muted-foreground">Loading payment records...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Payment Records</h2>
          <p className="text-muted-foreground">{employeeName}</p>
        </div>
      </div>

      {/* Earnings Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{earnings.week.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {format(weekStart, 'MMM dd')} - {format(weekEnd, 'MMM dd, yyyy')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{earnings.month.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {format(monthStart, 'MMMM yyyy')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Banknote className="h-4 w-4 text-primary" />
              This Year
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{earnings.year.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {format(yearStart, 'yyyy')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Payment Transactions</CardTitle>
          <CardDescription>
            Complete history of part payments and weekly settlements
          </CardDescription>
        </CardHeader>
        <CardContent>
          {allRecords.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No payment records found
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Week/Period</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Payment Mode</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allRecords.map((record, index) => (
                    <TableRow 
                      key={index}
                      className={record.type === 'Part Payment' ? 'bg-blue-50/50 dark:bg-blue-950/20' : 'bg-green-50/50 dark:bg-green-950/20'}
                    >
                      <TableCell className="font-medium">
                        {format(parseISO(record.date), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={record.type === 'Part Payment' ? 'default' : 'secondary'}>
                          {record.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {'weekRange' in record ? record.weekRange : '-'}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        ₹{record.amount?.toLocaleString() || '0'}
                      </TableCell>
                      <TableCell className="capitalize">
                        {record.mode?.replace('_', ' ') || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={record.status === 'paid' ? 'default' : record.status === 'pending' ? 'secondary' : 'outline'}
                        >
                          {record.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                        {record.note || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeePaymentRecords;
