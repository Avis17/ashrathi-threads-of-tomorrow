import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, DollarSign, FileText, TrendingUp, Clock, Package, Percent, Calculator, Users, Eye, EyeOff, Wallet, BadgeIndianRupee, AlertTriangle, TrendingDown, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useExternalJobOrderStats } from "@/hooks/useExternalJobOrders";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Legend, 
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line, AreaChart, Area
} from "recharts";

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6366f1', '#8b5cf6', '#ec4899'];

const formatAmount = (amount: number, visible: boolean) => {
  return visible ? `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` : '₹****';
};

const Dashboard = () => {
  const [amountsVisible, setAmountsVisible] = useState(false);
  const navigate = useNavigate();
  const { data: stats, isLoading } = useExternalJobOrderStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  if (!stats) return null;

  // Ensure all values have defaults to prevent undefined errors
  const safeStats = {
    totalAmount: stats.totalAmount || 0,
    paidAmount: stats.paidAmount || 0,
    pendingAmount: stats.pendingAmount || 0,
    totalOrders: stats.totalOrders || 0,
    totalPieces: stats.totalPieces || 0,
    totalCommission: stats.totalCommission || 0,
    totalOperationsCost: stats.totalOperationsCost || 0,
    grossProfit: stats.grossProfit || 0,
    netProfit: stats.netProfit || 0,
    paymentAdjustments: stats.paymentAdjustments || 0,
    expectedNetProfit: stats.expectedNetProfit || 0,
    expectedNetProfitMargin: stats.expectedNetProfitMargin || 0,
    statusCounts: stats.statusCounts || {},
    jobStatusCounts: stats.jobStatusCounts || {},
    weeklyData: stats.weeklyData || [],
    monthlyData: stats.monthlyData || [],
    yearlyData: stats.yearlyData || [],
  };

  const paymentStatusData = [
    { name: 'Paid', value: safeStats.statusCounts.paid || 0, color: '#10b981' },
    { name: 'Partial', value: safeStats.statusCounts.partial || 0, color: '#f59e0b' },
    { name: 'Unpaid', value: safeStats.statusCounts.unpaid || 0, color: '#ef4444' },
    { name: 'Delayed', value: safeStats.statusCounts.delayed || 0, color: '#8b5cf6' },
    { name: 'Hold', value: safeStats.statusCounts.hold || 0, color: '#6366f1' },
  ].filter(item => item.value > 0);

  const jobStatusData = [
    { name: 'Completed', value: safeStats.jobStatusCounts.completed || 0, color: '#10b981' },
    { name: 'In Progress', value: safeStats.jobStatusCounts.in_progress || 0, color: '#3b82f6' },
    { name: 'Pending', value: safeStats.jobStatusCounts.pending || 0, color: '#f59e0b' },
    { name: 'Cancelled', value: safeStats.jobStatusCounts.cancelled || 0, color: '#ef4444' },
  ].filter(item => item.value > 0);

  const collectionRate = safeStats.totalAmount > 0 
    ? ((safeStats.paidAmount / safeStats.totalAmount) * 100).toFixed(1)
    : "0.0";

  const profitMargin = safeStats.totalAmount > 0 
    ? ((safeStats.grossProfit / safeStats.totalAmount) * 100).toFixed(1)
    : "0.0";

  const avgOrderValue = safeStats.totalOrders > 0 
    ? (safeStats.totalAmount / safeStats.totalOrders).toFixed(2)
    : "0.00";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/admin/external-jobs")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Job Order Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive analytics and insights
          </p>
        </div>
      </div>

      {/* Privacy Toggle */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setAmountsVisible(!amountsVisible)}
          className="gap-2"
        >
          {amountsVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {amountsVisible ? 'Hide Amounts' : 'Show Amounts'}
        </Button>
      </div>

      {/* Stats Cards - Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800 min-w-0">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-3 bg-blue-500/20 rounded-lg shrink-0">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 truncate">Total Orders</p>
              <p className="text-xl sm:text-2xl font-bold text-blue-900 dark:text-blue-100">{safeStats.totalOrders}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800 min-w-0">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-3 bg-purple-500/20 rounded-lg shrink-0">
              <Package className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-purple-700 dark:text-purple-300 truncate">Total Pieces</p>
              <p className="text-xl sm:text-2xl font-bold text-purple-900 dark:text-purple-100 truncate">{safeStats.totalPieces.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border-emerald-200 dark:border-emerald-800 min-w-0">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-3 bg-emerald-500/20 rounded-lg shrink-0">
              <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-emerald-700 dark:text-emerald-300 truncate">Total Amount</p>
              <p className="text-xl sm:text-2xl font-bold text-emerald-900 dark:text-emerald-100 truncate">{formatAmount(safeStats.totalAmount, amountsVisible)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800 min-w-0">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-3 bg-green-500/20 rounded-lg shrink-0">
              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-green-700 dark:text-green-300 truncate">Amount Received</p>
              <p className="text-xl sm:text-2xl font-bold text-green-900 dark:text-green-100 truncate">{formatAmount(safeStats.paidAmount, amountsVisible)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800 min-w-0">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-3 bg-orange-500/20 rounded-lg shrink-0">
              <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-orange-700 dark:text-orange-300 truncate">Pending Amount</p>
              <p className="text-xl sm:text-2xl font-bold text-orange-900 dark:text-orange-100 truncate">{formatAmount(safeStats.pendingAmount, amountsVisible)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Stats Cards - Row 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="p-4 sm:p-6 bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950 dark:to-teal-900 border-teal-200 dark:border-teal-800 min-w-0">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-3 bg-teal-500/20 rounded-lg shrink-0">
              <Calculator className="h-5 w-5 sm:h-6 sm:w-6 text-teal-600 dark:text-teal-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-teal-700 dark:text-teal-300 truncate">Gross Profit</p>
              <p className="text-lg sm:text-2xl font-bold text-teal-900 dark:text-teal-100 truncate">{formatAmount(safeStats.grossProfit, amountsVisible)}</p>
              <p className="text-xs text-teal-600 dark:text-teal-400 truncate">Based on billed</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6 bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950 dark:to-cyan-900 border-cyan-200 dark:border-cyan-800 min-w-0">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-3 bg-cyan-500/20 rounded-lg shrink-0">
              <Wallet className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-cyan-700 dark:text-cyan-300 truncate">Net Profit</p>
              <p className="text-lg sm:text-2xl font-bold text-cyan-900 dark:text-cyan-100 truncate">{formatAmount(safeStats.netProfit, amountsVisible)}</p>
              <p className="text-xs text-cyan-600 dark:text-cyan-400 truncate">Based on received</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border-amber-200 dark:border-amber-800 min-w-0">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-3 bg-amber-500/20 rounded-lg shrink-0">
              <TrendingDown className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-300 truncate">Payment Shortfall</p>
              <p className="text-lg sm:text-2xl font-bold text-amber-900 dark:text-amber-100 truncate">{formatAmount(safeStats.paymentAdjustments, amountsVisible)}</p>
              <p className="text-xs text-amber-600 dark:text-amber-400 truncate">Billed vs Received</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6 bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950 dark:to-pink-900 border-pink-200 dark:border-pink-800 min-w-0">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-3 bg-pink-500/20 rounded-lg shrink-0">
              <BadgeIndianRupee className="h-5 w-5 sm:h-6 sm:w-6 text-pink-600 dark:text-pink-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-pink-700 dark:text-pink-300 truncate">Commission Paid</p>
              <p className="text-lg sm:text-2xl font-bold text-pink-900 dark:text-pink-100 truncate">{formatAmount(safeStats.totalCommission, amountsVisible)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6 bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-950 dark:to-rose-900 border-rose-200 dark:border-rose-800 min-w-0">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-3 bg-rose-500/20 rounded-lg shrink-0">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-rose-600 dark:text-rose-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-rose-700 dark:text-rose-300 truncate">Operations Cost</p>
              <p className="text-lg sm:text-2xl font-bold text-rose-900 dark:text-rose-100 truncate">{formatAmount(safeStats.totalOperationsCost, amountsVisible)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 border-indigo-200 dark:border-indigo-800 min-w-0">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-3 bg-indigo-500/20 rounded-lg shrink-0">
              <Percent className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-indigo-700 dark:text-indigo-300 truncate">Avg Order Value</p>
              <p className="text-lg sm:text-2xl font-bold text-indigo-900 dark:text-indigo-100 truncate">{formatAmount(parseFloat(avgOrderValue), amountsVisible)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Expected Net Profit - Highlighted Card */}
      <Card className="p-6 bg-gradient-to-br from-lime-50 via-green-50 to-emerald-50 dark:from-lime-950 dark:via-green-950 dark:to-emerald-950 border-2 border-lime-300 dark:border-lime-700 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-lime-500 to-green-600 rounded-xl shadow-md">
              <Target className="h-8 w-8 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-lime-700 dark:text-lime-300">Expected Net Profit</p>
              <p className="text-3xl font-bold text-lime-900 dark:text-lime-100">{formatAmount(safeStats.expectedNetProfit, amountsVisible)}</p>
              <p className="text-xs text-lime-600 dark:text-lime-400 mt-1">From pending payments after deducting costs</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end">
              <Percent className="h-5 w-5 text-lime-600 dark:text-lime-400" />
              <span className="text-2xl font-bold text-lime-700 dark:text-lime-300">
                {safeStats.expectedNetProfitMargin.toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-lime-600 dark:text-lime-400 mt-1">Expected Margin</p>
          </div>
        </div>
      </Card>

      {/* Collection Rate & Profit Margin */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Collection Rate</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Overall Collection Rate</span>
              <span className="text-2xl font-bold text-primary">{collectionRate}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-4">
              <div
                className="bg-emerald-500 h-4 rounded-full transition-all"
                style={{ width: `${Math.min(parseFloat(collectionRate), 100)}%` }}
              />
            </div>
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div>
                <p className="text-sm text-muted-foreground">Billed</p>
                <p className="text-lg font-semibold">₹{safeStats.totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Collected</p>
                <p className="text-lg font-semibold text-emerald-600">₹{safeStats.paidAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Outstanding</p>
                <p className="text-lg font-semibold text-orange-600">₹{safeStats.pendingAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Profit Margin</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Gross Profit Margin</span>
              <span className="text-2xl font-bold text-teal-600">{profitMargin}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-4">
              <div
                className="bg-teal-500 h-4 rounded-full transition-all"
                style={{ width: `${Math.min(Math.max(parseFloat(profitMargin), 0), 100)}%` }}
              />
            </div>
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div>
                <p className="text-sm text-muted-foreground">Revenue</p>
                <p className="text-lg font-semibold">₹{safeStats.totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ops Cost</p>
                <p className="text-lg font-semibold text-red-600">₹{safeStats.totalOperationsCost.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gross Profit</p>
                <p className="text-lg font-semibold text-teal-600">₹{safeStats.grossProfit.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Time-based Charts */}
      <Card className="p-6">
        <Tabs defaultValue="weekly" className="w-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Order Trends</h3>
            <TabsList>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">Yearly</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="weekly">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-4">Orders & Pieces (Last 7 Days)</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={safeStats.weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Legend />
                    <Bar dataKey="orders" name="Orders" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="pieces" name="Pieces" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-4">Revenue (Last 7 Days)</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={safeStats.weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" tickFormatter={(value) => `₹${(value/1000).toFixed(0)}k`} />
                    <Tooltip 
                      formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Amount']}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Area type="monotone" dataKey="amount" stroke="#10b981" fill="#10b98133" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="monthly">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-4">Orders & Pieces (Last 12 Months)</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={safeStats.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Legend />
                    <Bar dataKey="orders" name="Orders" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="pieces" name="Pieces" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-4">Revenue & Profit (Last 12 Months)</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={safeStats.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" tickFormatter={(value) => `₹${(value/1000).toFixed(0)}k`} />
                    <Tooltip 
                      formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, '']}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Legend />
                    <Line type="monotone" dataKey="amount" name="Revenue" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="profit" name="Profit" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="yearly">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-4">Orders & Pieces (Last 5 Years)</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={safeStats.yearlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Legend />
                    <Bar dataKey="orders" name="Orders" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="pieces" name="Pieces" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-4">Revenue (Last 5 Years)</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={safeStats.yearlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" tickFormatter={(value) => `₹${(value/1000).toFixed(0)}k`} />
                    <Tooltip 
                      formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Amount']}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Area type="monotone" dataKey="amount" stroke="#10b981" fill="#10b98133" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Status Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Payment Status Distribution</h3>
          {paymentStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {paymentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No payment data available
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Job Status Overview</h3>
          {jobStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={jobStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {jobStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No job status data available
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
