import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3, TrendingUp, TrendingDown, IndianRupee, Scissors, Package, Briefcase, DollarSign, PieChart, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useJobBatch } from '@/hooks/useJobBatches';
import { useJobBatchExpenses } from '@/hooks/useJobExpenses';
import { useBatchCuttingLogs } from '@/hooks/useBatchCuttingLogs';
import { useBatchSalaryEntries } from '@/hooks/useBatchSalary';
import { useBatchJobWorks } from '@/hooks/useJobWorks';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  PieChart as RechartsPie, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  RadialBarChart, RadialBar,
} from 'recharts';

const CHART_COLORS = [
  'hsl(221, 83%, 53%)', 'hsl(142, 71%, 45%)', 'hsl(38, 92%, 50%)',
  'hsl(262, 83%, 58%)', 'hsl(0, 84%, 60%)', 'hsl(199, 89%, 48%)',
  'hsl(326, 100%, 74%)', 'hsl(173, 80%, 40%)', 'hsl(47, 96%, 53%)',
  'hsl(280, 67%, 51%)', 'hsl(12, 76%, 61%)', 'hsl(160, 60%, 45%)',
];

interface StyleInfo {
  id: string;
  style_code: string;
  style_name: string;
  linked_cmt_quotation_id: string | null;
}

const BatchDashboardPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: batch, isLoading } = useJobBatch(id || '');
  const { data: expenses = [] } = useJobBatchExpenses(id || '');
  const { data: cuttingLogs = [] } = useBatchCuttingLogs(id || '');
  const { data: salaryEntries = [] } = useBatchSalaryEntries(id || '');
  const { data: jobWorks = [] } = useBatchJobWorks(id || '');

  const rollsData = (batch?.rolls_data || []) as any[];

  // Get unique style IDs
  const styleIds = useMemo(() => [...new Set(rollsData.map(r => r.style_id).filter(Boolean))], [rollsData]);

  const { data: styles = [] } = useQuery({
    queryKey: ['dashboard-styles', styleIds],
    queryFn: async () => {
      if (styleIds.length === 0) return [];
      const { data, error } = await supabase.from('job_styles').select('id, style_code, style_name, linked_cmt_quotation_id').in('id', styleIds);
      if (error) throw error;
      return data as StyleInfo[];
    },
    enabled: styleIds.length > 0,
  });

  const cmtIds = styles.map(s => s.linked_cmt_quotation_id).filter(Boolean) as string[];
  const { data: cmtQuotations = [] } = useQuery({
    queryKey: ['dashboard-cmt', cmtIds],
    queryFn: async () => {
      if (cmtIds.length === 0) return [];
      const { data, error } = await supabase.from('cmt_quotations').select('id, approved_rates, final_cmt_per_piece, operations').in('id', cmtIds);
      if (error) throw error;
      return data;
    },
    enabled: cmtIds.length > 0,
  });

  // === CALCULATIONS ===
  const cuttingSummary: Record<number, number> = {};
  cuttingLogs.forEach(log => {
    cuttingSummary[log.type_index] = (cuttingSummary[log.type_index] || 0) + log.pieces_cut;
  });
  const totalCutPieces = Object.values(cuttingSummary).reduce((sum, val) => sum + val, 0);

  // Per-style breakdown
  const styleBreakdown = useMemo(() => {
    const groups: Record<string, { styleId: string; typeIndices: number[]; colors: string[] }> = {};
    rollsData.forEach((type, idx) => {
      const sid = type.style_id;
      if (!sid) return;
      if (!groups[sid]) groups[sid] = { styleId: sid, typeIndices: [], colors: [] };
      groups[sid].typeIndices.push(idx);
      groups[sid].colors.push(type.color || `Type ${idx + 1}`);
    });

    return Object.values(groups).map(group => {
      const style = styles.find(s => s.id === group.styleId);
      const cmt = cmtQuotations.find(c => c.id === style?.linked_cmt_quotation_id);
      const approvedRates = cmt?.approved_rates as any;
      const cmtRate = approvedRates?.finalCMTPerPiece || cmt?.final_cmt_per_piece || 0;
      const cutPieces = group.typeIndices.reduce((sum, idx) => sum + (cuttingSummary[idx] || 0), 0);
      const expectedRevenue = cmtRate * cutPieces;

      // Salary for this style
      const styleSalary = salaryEntries.filter(e => e.style_id === group.styleId);
      const totalSalary = styleSalary.reduce((sum, e) => sum + (e.rate_per_piece * e.quantity), 0);
      const paidSalary = styleSalary.reduce((sum, e) => sum + e.paid_amount, 0);

      // Job work for this style
      const styleJw = jobWorks.filter(jw => {
        const vars = (jw.variations || []) as Array<{ style_id: string }>;
        return vars.some(v => v.style_id === group.styleId);
      });
      const jwPaid = styleJw.reduce((sum, jw) => sum + jw.paid_amount, 0);
      const jwTotal = styleJw.reduce((sum, jw) => sum + jw.total_amount, 0);

      return {
        styleId: group.styleId,
        styleCode: style?.style_code || 'Unknown',
        styleName: style?.style_name || '',
        colors: group.colors,
        cmtRate,
        cutPieces,
        expectedRevenue,
        totalSalary,
        paidSalary,
        jwTotal,
        jwPaid,
        colorCutData: group.typeIndices.map(idx => ({
          color: rollsData[idx]?.color || `Type ${idx + 1}`,
          pieces: cuttingSummary[idx] || 0,
        })),
      };
    });
  }, [rollsData, styles, cmtQuotations, cuttingSummary, salaryEntries, jobWorks]);

  // Totals
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalSalary = salaryEntries.reduce((sum, e) => sum + (e.rate_per_piece * e.quantity), 0);
  const totalSalaryPaid = salaryEntries.reduce((sum, e) => sum + e.paid_amount, 0);
  const totalJwAmount = jobWorks.reduce((sum, jw) => sum + jw.total_amount, 0);
  const totalJwPaid = jobWorks.reduce((sum, jw) => sum + jw.paid_amount, 0);
  const totalExpectedRevenue = styleBreakdown.reduce((sum, s) => sum + s.expectedRevenue, 0);

  const totalActualCost = totalSalary + totalExpenses + totalJwAmount;
  const totalAmountPaid = totalSalaryPaid + totalExpenses + totalJwPaid;
  const expectedProfit = totalExpectedRevenue - totalActualCost;
  const actualProfit = totalExpectedRevenue - totalAmountPaid;
  const profitMargin = totalExpectedRevenue > 0 ? (expectedProfit / totalExpectedRevenue) * 100 : 0;

  const costPerPiece = totalCutPieces > 0 ? totalActualCost / totalCutPieces : 0;
  const revenuePerPiece = totalCutPieces > 0 ? totalExpectedRevenue / totalCutPieces : 0;
  const profitPerPiece = revenuePerPiece - costPerPiece;

  // Chart data
  const costBreakdownData = [
    { name: 'Salary', value: totalSalary, color: CHART_COLORS[0] },
    { name: 'Expenses', value: totalExpenses, color: CHART_COLORS[2] },
    { name: 'Job Work', value: totalJwAmount, color: CHART_COLORS[3] },
  ].filter(d => d.value > 0);

  const expenseByType = useMemo(() => {
    const groups: Record<string, number> = {};
    expenses.forEach(e => {
      const type = e.expense_type || 'Other';
      groups[type] = (groups[type] || 0) + e.amount;
    });
    return Object.entries(groups).map(([name, value], i) => ({ name, value, color: CHART_COLORS[i % CHART_COLORS.length] }));
  }, [expenses]);

  const styleComparisonData = styleBreakdown.map(s => ({
    name: s.styleCode,
    revenue: s.expectedRevenue,
    cost: s.totalSalary + s.jwTotal,
    profit: s.expectedRevenue - s.totalSalary - s.jwTotal,
  }));

  const paymentStatusData = [
    { name: 'Salary Paid', value: totalSalaryPaid, color: 'hsl(142, 71%, 45%)' },
    { name: 'Salary Pending', value: Math.max(0, totalSalary - totalSalaryPaid), color: 'hsl(38, 92%, 50%)' },
    { name: 'JW Paid', value: totalJwPaid, color: 'hsl(199, 89%, 48%)' },
    { name: 'JW Pending', value: Math.max(0, totalJwAmount - totalJwPaid), color: 'hsl(0, 84%, 60%)' },
  ].filter(d => d.value > 0);

  const cuttingByColor = useMemo(() => {
    return rollsData.map((type, idx) => ({
      color: type.color || `Type ${idx + 1}`,
      pieces: cuttingSummary[idx] || 0,
    })).sort((a, b) => b.pieces - a.pieces);
  }, [rollsData, cuttingSummary]);

  // Per-piece economics by style
  const perPieceByStyle = styleBreakdown.map(s => ({
    name: s.styleCode,
    cmtRate: s.cmtRate,
    actualCost: s.cutPieces > 0 ? (s.totalSalary + s.jwTotal) / s.cutPieces : 0,
    profitPerPiece: s.cutPieces > 0 ? s.cmtRate - (s.totalSalary + s.jwTotal) / s.cutPieces : 0,
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!batch) return null;

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/job-management/batch/${id}`)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              Batch Analytics
            </h1>
            <p className="text-sm text-muted-foreground">{batch.batch_number}</p>
          </div>
        </div>
        <Badge variant="outline" className="text-sm px-3 py-1.5">
          {totalCutPieces} Total Pieces
        </Badge>
      </div>

      {/* Hero Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Expected Revenue"
          value={`₹${totalExpectedRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
          subtitle={`₹${revenuePerPiece.toFixed(2)}/pc (CMT Rate)`}
          icon={<Target className="h-5 w-5" />}
          iconBg="bg-emerald-500/10"
          iconColor="text-emerald-600"
        />
        <StatCard
          title="Total Cost"
          value={`₹${totalActualCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
          subtitle={`₹${costPerPiece.toFixed(2)}/pc`}
          icon={<DollarSign className="h-5 w-5" />}
          iconBg="bg-red-500/10"
          iconColor="text-red-600"
        />
        <StatCard
          title="Expected Profit"
          value={`₹${expectedProfit.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
          subtitle={`${profitMargin.toFixed(1)}% margin | ₹${profitPerPiece.toFixed(2)}/pc`}
          icon={expectedProfit >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
          iconBg={expectedProfit >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'}
          iconColor={expectedProfit >= 0 ? 'text-green-600' : 'text-red-600'}
        />
        <StatCard
          title="Actual Profit (Paid)"
          value={`₹${actualProfit.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
          subtitle={`Paid out: ₹${totalAmountPaid.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
          icon={<IndianRupee className="h-5 w-5" />}
          iconBg="bg-blue-500/10"
          iconColor="text-blue-600"
        />
      </div>

      {/* Financial Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <IndianRupee className="h-4 w-4 text-primary" />
            Financial Summary — Per Style
          </CardTitle>
          <CardDescription>CMT approved rate × cut pieces = Expected Revenue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-semibold">Style</th>
                  <th className="pb-3 font-semibold text-right">CMT Rate</th>
                  <th className="pb-3 font-semibold text-right">Pieces</th>
                  <th className="pb-3 font-semibold text-right">Expected Revenue</th>
                  <th className="pb-3 font-semibold text-right">Salary Cost</th>
                  <th className="pb-3 font-semibold text-right">Job Work Cost</th>
                  <th className="pb-3 font-semibold text-right">Expenses (Share)</th>
                  <th className="pb-3 font-semibold text-right">Total Cost</th>
                  <th className="pb-3 font-semibold text-right">Profit</th>
                  <th className="pb-3 font-semibold text-right">Margin</th>
                </tr>
              </thead>
              <tbody>
                {styleBreakdown.map(s => {
                  const expenseShare = totalCutPieces > 0 ? (s.cutPieces / totalCutPieces) * totalExpenses : 0;
                  const styleTotalCost = s.totalSalary + s.jwTotal + expenseShare;
                  const styleProfit = s.expectedRevenue - styleTotalCost;
                  const styleMargin = s.expectedRevenue > 0 ? (styleProfit / s.expectedRevenue) * 100 : 0;
                  return (
                    <tr key={s.styleId} className="border-b last:border-0">
                      <td className="py-3">
                        <div className="font-medium">{s.styleCode}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[150px]">{s.styleName}</div>
                      </td>
                      <td className="py-3 text-right font-mono">₹{s.cmtRate}</td>
                      <td className="py-3 text-right">{s.cutPieces.toLocaleString()}</td>
                      <td className="py-3 text-right font-semibold text-emerald-600">₹{s.expectedRevenue.toLocaleString()}</td>
                      <td className="py-3 text-right">₹{s.totalSalary.toLocaleString()}</td>
                      <td className="py-3 text-right">₹{s.jwTotal.toLocaleString()}</td>
                      <td className="py-3 text-right text-muted-foreground">₹{expenseShare.toFixed(0)}</td>
                      <td className="py-3 text-right font-semibold">₹{styleTotalCost.toFixed(0)}</td>
                      <td className={`py-3 text-right font-bold ${styleProfit >= 0 ? 'text-emerald-600' : 'text-destructive'}`}>
                        ₹{styleProfit.toFixed(0)}
                      </td>
                      <td className="py-3 text-right">
                        <Badge variant={styleMargin >= 0 ? 'default' : 'destructive'} className="text-xs">
                          {styleMargin.toFixed(1)}%
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
                <tr className="bg-muted/50 font-semibold">
                  <td className="py-3">TOTAL</td>
                  <td className="py-3 text-right">—</td>
                  <td className="py-3 text-right">{totalCutPieces.toLocaleString()}</td>
                  <td className="py-3 text-right text-emerald-600">₹{totalExpectedRevenue.toLocaleString()}</td>
                  <td className="py-3 text-right">₹{totalSalary.toLocaleString()}</td>
                  <td className="py-3 text-right">₹{totalJwAmount.toLocaleString()}</td>
                  <td className="py-3 text-right">₹{totalExpenses.toLocaleString()}</td>
                  <td className="py-3 text-right">₹{totalActualCost.toLocaleString()}</td>
                  <td className={`py-3 text-right font-bold ${expectedProfit >= 0 ? 'text-emerald-600' : 'text-destructive'}`}>
                    ₹{expectedProfit.toFixed(0)}
                  </td>
                  <td className="py-3 text-right">
                    <Badge variant={profitMargin >= 0 ? 'default' : 'destructive'}>{profitMargin.toFixed(1)}%</Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Payment Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary" />
            Payment Tracker
          </CardTitle>
          <CardDescription>Expected vs Paid across all cost categories</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <PaymentRow label="Salary" expected={totalSalary} paid={totalSalaryPaid} color="hsl(221, 83%, 53%)" />
          <PaymentRow label="Job Work" expected={totalJwAmount} paid={totalJwPaid} color="hsl(262, 83%, 58%)" />
          <PaymentRow label="Expenses" expected={totalExpenses} paid={totalExpenses} color="hsl(38, 92%, 50%)" />
          <Separator />
          <PaymentRow label="TOTAL" expected={totalActualCost} paid={totalAmountPaid} color="hsl(142, 71%, 45%)" isBold />
          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <p className="text-xs text-muted-foreground">Total Outstanding</p>
              <p className="text-lg font-bold text-orange-600">₹{(totalActualCost - totalAmountPaid).toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-500/5 text-center">
              <p className="text-xs text-muted-foreground">Expected Profit</p>
              <p className={`text-lg font-bold ${expectedProfit >= 0 ? 'text-emerald-600' : 'text-destructive'}`}>
                ₹{expectedProfit.toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/5 text-center">
              <p className="text-xs text-muted-foreground">Actual Profit (Cash)</p>
              <p className={`text-lg font-bold ${actualProfit >= 0 ? 'text-blue-600' : 'text-destructive'}`}>
                ₹{actualProfit.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cost Breakdown Pie */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cost Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <RechartsPie>
                <Pie
                  data={costBreakdownData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {costBreakdownData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
              </RechartsPie>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Expense Breakdown Pie */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <RechartsPie>
                <Pie
                  data={expenseByType}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {expenseByType.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
              </RechartsPie>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Per-Style Revenue vs Cost Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue vs Cost by Style</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={styleComparisonData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="revenue" name="Revenue" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cost" name="Cost" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" name="Profit" fill="hsl(221, 83%, 53%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Status Donut */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <RechartsPie>
                <Pie
                  data={paymentStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {paymentStatusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
              </RechartsPie>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Cutting Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Scissors className="h-4 w-4 text-primary" />
            Cutting Distribution by Color
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={cuttingByColor} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis type="number" fontSize={12} />
              <YAxis dataKey="color" type="category" width={120} fontSize={11} />
              <Tooltip formatter={(value: number) => `${value} pcs`} />
              <Bar dataKey="pieces" fill="hsl(221, 83%, 53%)" radius={[0, 4, 4, 0]}>
                {cuttingByColor.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Per-Piece Economics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <PieChart className="h-4 w-4 text-primary" />
            Per-Piece Economics
          </CardTitle>
          <CardDescription>CMT rate vs actual cost per piece by style</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={perPieceByStyle}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} tickFormatter={v => `₹${v}`} />
              <Tooltip formatter={(value: number) => `₹${value.toFixed(2)}`} />
              <Legend />
              <Bar dataKey="cmtRate" name="CMT Rate" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="actualCost" name="Actual Cost/pc" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="profitPerPiece" name="Profit/pc" fill="hsl(221, 83%, 53%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Job Work Summary */}
      {jobWorks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary" />
              Job Work Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-semibold">Company</th>
                    <th className="pb-3 font-semibold text-right">Pieces</th>
                    <th className="pb-3 font-semibold text-right">Total Amount</th>
                    <th className="pb-3 font-semibold text-right">Paid</th>
                    <th className="pb-3 font-semibold text-right">Balance</th>
                    <th className="pb-3 font-semibold text-center">Work Status</th>
                    <th className="pb-3 font-semibold text-center">Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {jobWorks.map(jw => (
                    <tr key={jw.id} className="border-b last:border-0">
                      <td className="py-3 font-medium">{jw.company_name}</td>
                      <td className="py-3 text-right">{jw.pieces}</td>
                      <td className="py-3 text-right">₹{jw.total_amount.toLocaleString()}</td>
                      <td className="py-3 text-right text-emerald-600">₹{jw.paid_amount.toLocaleString()}</td>
                      <td className="py-3 text-right text-orange-600">₹{jw.balance_amount.toLocaleString()}</td>
                      <td className="py-3 text-center">
                        <Badge variant="outline" className="text-xs capitalize">{jw.work_status || 'pending'}</Badge>
                      </td>
                      <td className="py-3 text-center">
                        <Badge variant={jw.payment_status === 'paid' ? 'default' : 'secondary'} className="text-xs capitalize">
                          {jw.payment_status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Reusable stat card
const StatCard = ({ title, value, subtitle, icon, iconBg, iconColor }: {
  title: string; value: string; subtitle: string;
  icon: React.ReactNode; iconBg: string; iconColor: string;
}) => (
  <Card className="overflow-hidden">
    <CardContent className="p-4">
      <div className="flex items-start gap-3">
        <div className={`p-2.5 rounded-xl ${iconBg}`}>
          <span className={iconColor}>{icon}</span>
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{title}</p>
          <p className="text-xl font-bold mt-0.5 truncate">{value}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Payment row with progress
const PaymentRow = ({ label, expected, paid, color, isBold }: {
  label: string; expected: number; paid: number; color: string; isBold?: boolean;
}) => {
  const percent = expected > 0 ? Math.min((paid / expected) * 100, 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className={isBold ? 'font-bold' : 'font-medium'}>{label}</span>
        <div className="flex items-center gap-4 text-right">
          <span className="text-muted-foreground">₹{expected.toLocaleString()}</span>
          <span className={`font-semibold ${isBold ? 'text-base' : ''}`}>₹{paid.toLocaleString()}</span>
          <Badge variant={percent >= 100 ? 'default' : 'secondary'} className="text-xs w-14 justify-center">
            {percent.toFixed(0)}%
          </Badge>
        </div>
      </div>
      <Progress value={percent} className="h-1.5" />
    </div>
  );
};

export default BatchDashboardPage;
