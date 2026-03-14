import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { IndianRupee, Package, Briefcase, DollarSign, Calculator, TrendingUp, CheckCircle } from 'lucide-react';
import { useJobBatchExpenses } from '@/hooks/useJobExpenses';
import { useBatchSalaryEntries } from '@/hooks/useBatchSalary';
import { useBatchSalaryAdvances } from '@/hooks/useBatchSalaryAdvances';
import { useBatchJobWorks } from '@/hooks/useJobWorks';

interface BatchCostingSectionProps {
  batchId: string;
  totalCutPieces: number;
  totalConfirmedPieces: number;
}

export const BatchCostingSection = ({ batchId, totalCutPieces, totalConfirmedPieces }: BatchCostingSectionProps) => {
  const { data: expenses = [] } = useJobBatchExpenses(batchId);
  const { data: salaryEntries = [] } = useBatchSalaryEntries(batchId);
  const { data: advances = [] } = useBatchSalaryAdvances(batchId);
  const { data: jobWorks = [] } = useBatchJobWorks(batchId);

  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const expensesByType: Record<string, number> = {};
  expenses.forEach(e => {
    const type = e.expense_type || 'Other';
    expensesByType[type] = (expensesByType[type] || 0) + (e.amount || 0);
  });

  const totalSalary = salaryEntries.reduce((sum, e) => sum + (e.total_amount || 0), 0);
  const salaryByOperation: Record<string, number> = {};
  salaryEntries.forEach(e => {
    salaryByOperation[e.operation] = (salaryByOperation[e.operation] || 0) + (e.total_amount || 0);
  });

  const totalAdvances = advances.reduce((sum, a) => sum + (a.amount || 0), 0);

  const totalJobWork = jobWorks.reduce((sum, jw) => sum + (jw.total_amount || 0), 0);
  const totalJobWorkPaid = jobWorks.reduce((sum, jw) => sum + (jw.paid_amount || 0), 0);
  const totalJobWorkBalance = jobWorks.reduce((sum, jw) => sum + (jw.balance_amount || 0), 0);

  const grandTotal = totalExpenses + totalSalary + totalAdvances + totalJobWork;
  const costPerCutPiece = totalCutPieces > 0 ? grandTotal / totalCutPieces : 0;
  const costPerConfirmedPiece = totalConfirmedPieces > 0 ? grandTotal / totalConfirmedPieces : 0;

  const costSections = [
    { label: 'Total Expenses', amount: totalExpenses, icon: DollarSign, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
    { label: 'Total Salary', amount: totalSalary, icon: IndianRupee, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
    { label: 'Total Advances', amount: totalAdvances, icon: TrendingUp, color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
    { label: 'Total Job Work', amount: totalJobWork, icon: Briefcase, color: 'text-green-500', bgColor: 'bg-green-500/10' },
  ];

  const perPieceRow = (amount: number) => ({
    cut: totalCutPieces > 0 ? (amount / totalCutPieces).toFixed(2) : '0.00',
    confirmed: totalConfirmedPieces > 0 ? (amount / totalConfirmedPieces).toFixed(2) : '0.00',
  });

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {costSections.map((section) => {
          const Icon = section.icon;
          return (
            <Card key={section.label} className="border-none shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-2 rounded-lg ${section.bgColor}`}>
                    <Icon className={`h-4 w-4 ${section.color}`} />
                  </div>
                  <span className="text-xs text-muted-foreground">{section.label}</span>
                </div>
                <p className="text-xl font-bold">₹{section.amount.toFixed(2)}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Grand Total Card */}
      <Card className="border-l-4 border-l-primary">
        <CardContent className="p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <Calculator className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Grand Total Cost</p>
                <p className="text-3xl font-bold text-primary">₹{grandTotal.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex gap-6">
              {/* Cost per Cut Piece */}
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Cost Per Cut Piece</p>
                <Badge className="text-lg px-4 py-1 bg-gradient-to-r from-primary to-secondary text-primary-foreground">
                  ₹{costPerCutPiece.toFixed(2)}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  <Package className="h-3 w-3 inline mr-1" />
                  {totalCutPieces} cut pieces
                </p>
              </div>
              {/* Cost per Confirmed Piece */}
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Cost Per Confirmed Piece</p>
                <Badge variant="outline" className="text-lg px-4 py-1 border-green-500 text-green-600">
                  ₹{costPerConfirmedPiece.toFixed(2)}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  <CheckCircle className="h-3 w-3 inline mr-1" />
                  {totalConfirmedPieces} confirmed pieces
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Expenses Breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-orange-500" />
              Expenses Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.keys(expensesByType).length > 0 ? (
              <>
                {Object.entries(expensesByType).map(([type, amount]) => (
                  <div key={type} className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded-lg">
                    <span className="text-sm">{type}</span>
                    <span className="font-semibold text-sm">₹{amount.toFixed(2)}</span>
                  </div>
                ))}
                <Separator />
                <div className="flex items-center justify-between py-2 px-3 font-semibold">
                  <span>Total</span>
                  <span className="text-orange-600">₹{totalExpenses.toFixed(2)}</span>
                </div>
                {totalCutPieces > 0 && (
                  <div className="flex items-center justify-between py-1 px-3 text-xs text-muted-foreground">
                    <span>Per Cut Piece</span>
                    <span>₹{(totalExpenses / totalCutPieces).toFixed(2)}</span>
                  </div>
                )}
                {totalConfirmedPieces > 0 && (
                  <div className="flex items-center justify-between py-1 px-3 text-xs text-muted-foreground">
                    <span>Per Confirmed Piece</span>
                    <span>₹{(totalExpenses / totalConfirmedPieces).toFixed(2)}</span>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No expenses recorded</p>
            )}
          </CardContent>
        </Card>

        {/* Salary Breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-blue-500" />
              Salary Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.keys(salaryByOperation).length > 0 ? (
              <>
                {Object.entries(salaryByOperation).map(([op, amount]) => (
                  <div key={op} className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded-lg">
                    <span className="text-sm">{op}</span>
                    <span className="font-semibold text-sm">₹{amount.toFixed(2)}</span>
                  </div>
                ))}
                <Separator />
                <div className="flex items-center justify-between py-2 px-3 font-semibold">
                  <span>Total Salary</span>
                  <span className="text-blue-600">₹{totalSalary.toFixed(2)}</span>
                </div>
                {totalAdvances > 0 && (
                  <div className="flex items-center justify-between py-2 px-3 bg-purple-50 dark:bg-purple-500/10 rounded-lg">
                    <span className="text-sm text-purple-600">+ Advances</span>
                    <span className="font-semibold text-sm text-purple-600">₹{totalAdvances.toFixed(2)}</span>
                  </div>
                )}
                {totalCutPieces > 0 && (
                  <div className="flex items-center justify-between py-1 px-3 text-xs text-muted-foreground">
                    <span>Per Cut Piece (Salary + Advances)</span>
                    <span>₹{((totalSalary + totalAdvances) / totalCutPieces).toFixed(2)}</span>
                  </div>
                )}
                {totalConfirmedPieces > 0 && (
                  <div className="flex items-center justify-between py-1 px-3 text-xs text-muted-foreground">
                    <span>Per Confirmed Piece (Salary + Advances)</span>
                    <span>₹{((totalSalary + totalAdvances) / totalConfirmedPieces).toFixed(2)}</span>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No salary entries recorded</p>
            )}
          </CardContent>
        </Card>

        {/* Job Work Breakdown */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-green-500" />
              Job Work Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {jobWorks.length > 0 ? (
              <>
                {jobWorks.map((jw) => (
                  <div key={jw.id} className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded-lg">
                    <div>
                      <span className="text-sm font-medium">{jw.company_name}</span>
                      <span className="text-xs text-muted-foreground ml-2">({jw.pieces} pcs)</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-sm">₹{jw.total_amount.toFixed(2)}</span>
                      <div className="text-xs text-muted-foreground">
                        Paid: ₹{jw.paid_amount.toFixed(2)} | Bal: ₹{jw.balance_amount.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
                <Separator />
                <div className="flex items-center justify-between py-2 px-3 font-semibold">
                  <span>Total Job Work</span>
                  <span className="text-green-600">₹{totalJobWork.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between py-1 px-3 text-xs text-muted-foreground">
                  <span>Paid: ₹{totalJobWorkPaid.toFixed(2)}</span>
                  <span>Balance: ₹{totalJobWorkBalance.toFixed(2)}</span>
                </div>
                {totalCutPieces > 0 && (
                  <div className="flex items-center justify-between py-1 px-3 text-xs text-muted-foreground">
                    <span>Per Cut Piece</span>
                    <span>₹{(totalJobWork / totalCutPieces).toFixed(2)}</span>
                  </div>
                )}
                {totalConfirmedPieces > 0 && (
                  <div className="flex items-center justify-between py-1 px-3 text-xs text-muted-foreground">
                    <span>Per Confirmed Piece</span>
                    <span>₹{(totalJobWork / totalConfirmedPieces).toFixed(2)}</span>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No job work entries</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cost Per Piece Summary Table */}
      <Card className="border-l-4 border-l-secondary">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calculator className="h-4 w-4 text-secondary" />
            Cost Per Piece Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="grid grid-cols-4 text-xs font-medium text-muted-foreground px-3 py-2 bg-muted/50 rounded-t-lg">
              <span>Category</span>
              <span className="text-right">Total Amount</span>
              <span className="text-right">Per Cut Piece ({totalCutPieces})</span>
              <span className="text-right">Per Confirmed ({totalConfirmedPieces})</span>
            </div>
            {[
              { label: 'Expenses', amount: totalExpenses, color: 'text-orange-600' },
              { label: 'Salary', amount: totalSalary, color: 'text-blue-600' },
              { label: 'Advances', amount: totalAdvances, color: 'text-purple-600' },
              { label: 'Job Work', amount: totalJobWork, color: 'text-green-600' },
            ].map((row) => {
              const pp = perPieceRow(row.amount);
              return (
                <div key={row.label} className="grid grid-cols-4 px-3 py-2.5 border-b border-border/50 text-sm">
                  <span>{row.label}</span>
                  <span className={`text-right font-medium ${row.color}`}>₹{row.amount.toFixed(2)}</span>
                  <span className="text-right font-medium">₹{pp.cut}</span>
                  <span className="text-right font-medium">₹{pp.confirmed}</span>
                </div>
              );
            })}
            <div className="grid grid-cols-4 px-3 py-3 bg-primary/5 rounded-b-lg font-bold text-base">
              <span>Grand Total</span>
              <span className="text-right text-primary">₹{grandTotal.toFixed(2)}</span>
              <span className="text-right text-primary">₹{costPerCutPiece.toFixed(2)}</span>
              <span className="text-right text-green-600">₹{costPerConfirmedPiece.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
