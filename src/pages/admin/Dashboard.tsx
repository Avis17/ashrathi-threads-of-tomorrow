import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Package, FileText, DollarSign, TrendingUp, TrendingDown, ShoppingCart, Clock, CheckCircle, Briefcase, Receipt, CreditCard, AlertCircle, Wallet } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { OrderStatusBadge } from '@/components/admin/OrderStatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function Dashboard() {
  const navigate = useNavigate();
  const [showAmounts, setShowAmounts] = useState(false);

  // Date ranges
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats-combined'],
    queryFn: async () => {
      // Fetch all data in parallel
      const [
        customersRes,
        productsRes,
        invoicesRes,
        invoicesData,
        ordersRes,
        ordersData,
        jobOrdersData,
        jobCompaniesRes,
      ] = await Promise.all([
        supabase.from('customers').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('should_remove', false),
        supabase.from('invoices').select('*', { count: 'exact', head: true }),
        supabase.from('invoices').select('*').order('invoice_date', { ascending: false }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('external_job_orders').select('*').order('created_at', { ascending: false }),
        supabase.from('external_job_companies').select('*', { count: 'exact', head: true }),
      ]);

      const orders = ordersData.data || [];
      const invoices = invoicesData.data || [];
      // Filter out disabled job orders from stats
      const jobOrders = (jobOrdersData.data || []).filter((j: any) => !j.is_disabled);

      // === ONLINE ORDERS STATS ===
      const totalOnlineOrders = ordersRes.count || 0;
      const onlineOrdersRevenue = orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
      const pendingOnlineOrders = orders.filter(o => ['pending', 'confirmed'].includes(o.status)).length;
      const deliveredOnlineOrders = orders.filter(o => o.status === 'delivered').length;
      const cancelledOnlineOrders = orders.filter(o => o.status === 'cancelled').length;

      // === EXTERNAL JOB ORDERS STATS ===
      const totalJobOrders = jobOrders.length;
      const jobOrdersRevenue = jobOrders.reduce((sum, j) => sum + Number(j.total_with_gst || j.total_amount || 0), 0);
      const jobOrdersPaid = jobOrders.reduce((sum, j) => sum + Number(j.paid_amount || 0), 0);
      const jobOrdersPending = jobOrders.reduce((sum, j) => sum + Number(j.balance_amount || 0), 0);
      const jobOrdersGst = jobOrders.reduce((sum, j) => sum + Number(j.gst_amount || 0), 0);
      const pendingJobOrders = jobOrders.filter(j => j.job_status === 'pending' || j.job_status === 'in_progress').length;
      const completedJobOrders = jobOrders.filter(j => j.job_status === 'completed' || j.job_status === 'delivered').length;
      const totalJobPieces = jobOrders.reduce((sum, j) => sum + Number(j.number_of_pieces || 0), 0);

      // === INVOICES (WHOLESALE) STATS ===
      const totalInvoices = invoicesRes.count || 0;
      const invoicesRevenue = invoices.reduce((sum, i) => sum + Number(i.total_amount || 0), 0);
      const invoicesPaid = invoices.reduce((sum, i) => sum + Number(i.paid_amount || 0), 0);
      const invoicesPending = invoices.reduce((sum, i) => sum + Number(i.balance_amount || 0), 0);
      const paidInvoices = invoices.filter(i => i.payment_status === 'paid').length;
      const partialInvoices = invoices.filter(i => i.payment_status === 'partial').length;
      const unpaidInvoices = invoices.filter(i => i.payment_status === 'unpaid').length;

      // === COMBINED TOTALS ===
      const totalRevenue = onlineOrdersRevenue + jobOrdersRevenue + invoicesRevenue;
      const totalPaidAmount = onlineOrdersRevenue + jobOrdersPaid + invoicesPaid; // Online orders are paid upfront
      const totalPendingAmount = jobOrdersPending + invoicesPending;

      // === 30-DAY TRENDS ===
      const ordersLast30 = orders.filter(o => new Date(o.created_at) >= thirtyDaysAgo);
      const ordersPrev30 = orders.filter(o => 
        new Date(o.created_at) >= sixtyDaysAgo && new Date(o.created_at) < thirtyDaysAgo
      );

      const jobsLast30 = jobOrders.filter(j => new Date(j.created_at) >= thirtyDaysAgo);
      const jobsPrev30 = jobOrders.filter(j => 
        new Date(j.created_at) >= sixtyDaysAgo && new Date(j.created_at) < thirtyDaysAgo
      );

      const invoicesLast30 = invoices.filter(i => new Date(i.created_at) >= thirtyDaysAgo);
      const invoicesPrev30 = invoices.filter(i => 
        new Date(i.created_at) >= sixtyDaysAgo && new Date(i.created_at) < thirtyDaysAgo
      );

      const revenueLast30 = 
        ordersLast30.reduce((sum, o) => sum + Number(o.total_amount || 0), 0) +
        jobsLast30.reduce((sum, j) => sum + Number(j.total_with_gst || j.total_amount || 0), 0) +
        invoicesLast30.reduce((sum, i) => sum + Number(i.total_amount || 0), 0);

      const revenuePrev30 = 
        ordersPrev30.reduce((sum, o) => sum + Number(o.total_amount || 0), 0) +
        jobsPrev30.reduce((sum, j) => sum + Number(j.total_with_gst || j.total_amount || 0), 0) +
        invoicesPrev30.reduce((sum, i) => sum + Number(i.total_amount || 0), 0);

      const revenueTrend = revenuePrev30 > 0
        ? ((revenueLast30 - revenuePrev30) / revenuePrev30) * 100
        : revenueLast30 > 0 ? 100 : 0;

      // === MONTHLY COMBINED REVENUE ===
      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        return { month: format(date, 'MMM yyyy'), orders: 0, jobs: 0, invoices: 0 };
      }).reverse();

      orders.forEach(o => {
        const month = format(new Date(o.created_at), 'MMM yyyy');
        const entry = last6Months.find(m => m.month === month);
        if (entry) entry.orders += Number(o.total_amount || 0);
      });

      jobOrders.forEach(j => {
        const month = format(new Date(j.created_at), 'MMM yyyy');
        const entry = last6Months.find(m => m.month === month);
        if (entry) entry.jobs += Number(j.total_with_gst || j.total_amount || 0);
      });

      invoices.forEach(i => {
        const month = format(new Date(i.created_at), 'MMM yyyy');
        const entry = last6Months.find(m => m.month === month);
        if (entry) entry.invoices += Number(i.total_amount || 0);
      });

      // === DAILY TRENDS (Last 7 days) ===
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        return date;
      }).reverse();

      const dailyData = last7Days.map(date => {
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        
        const dayOrders = orders.filter(o => {
          const d = new Date(o.created_at);
          return d >= date && d < nextDay;
        }).length;

        const dayJobs = jobOrders.filter(j => {
          const d = new Date(j.created_at);
          return d >= date && d < nextDay;
        }).length;

        const dayInvoices = invoices.filter(i => {
          const d = new Date(i.created_at);
          return d >= date && d < nextDay;
        }).length;

        return {
          date: format(date, 'MMM dd'),
          orders: dayOrders,
          jobs: dayJobs,
          invoices: dayInvoices,
        };
      });

      // === PAYMENT STATUS DISTRIBUTION ===
      const paymentDistribution = [
        { name: 'Paid', value: paidInvoices + completedJobOrders, color: '#10B981' },
        { name: 'Partial', value: partialInvoices + jobOrders.filter(j => j.payment_status === 'partial').length, color: '#F59E0B' },
        { name: 'Unpaid', value: unpaidInvoices + jobOrders.filter(j => j.payment_status === 'unpaid').length, color: '#EF4444' },
      ];

      // === REVENUE SOURCE DISTRIBUTION ===
      const revenueDistribution = [
        { name: 'Online Orders', value: onlineOrdersRevenue, color: '#3B82F6' },
        { name: 'Job Orders', value: jobOrdersRevenue, color: '#8B5CF6' },
        { name: 'Wholesale', value: invoicesRevenue, color: '#10B981' },
      ];

      // === ORDER STATUS (Online) ===
      const orderStatusDistribution = [
        { name: 'Pending', value: orders.filter(o => o.status === 'pending').length },
        { name: 'Confirmed', value: orders.filter(o => o.status === 'confirmed').length },
        { name: 'Shipped', value: orders.filter(o => o.status === 'shipped').length },
        { name: 'Delivered', value: orders.filter(o => o.status === 'delivered').length },
        { name: 'Cancelled', value: orders.filter(o => o.status === 'cancelled').length },
      ].filter(s => s.value > 0);

      // === JOB STATUS DISTRIBUTION ===
      const jobStatusDistribution = [
        { name: 'Pending', value: jobOrders.filter(j => j.job_status === 'pending').length },
        { name: 'In Progress', value: jobOrders.filter(j => j.job_status === 'in_progress').length },
        { name: 'Completed', value: jobOrders.filter(j => j.job_status === 'completed').length },
        { name: 'Delivered', value: jobOrders.filter(j => j.job_status === 'delivered').length },
      ].filter(s => s.value > 0);

      // Recent items
      const recentOrders = orders.slice(0, 5);
      const recentJobs = jobOrders.slice(0, 5);
      const recentInvoices = invoices.slice(0, 5);

      return {
        // Counts
        totalCustomers: customersRes.count || 0,
        totalProducts: productsRes.count || 0,
        totalCompanies: jobCompaniesRes.count || 0,
        
        // Online Orders
        totalOnlineOrders,
        onlineOrdersRevenue,
        pendingOnlineOrders,
        deliveredOnlineOrders,
        cancelledOnlineOrders,
        
        // Job Orders
        totalJobOrders,
        jobOrdersRevenue,
        jobOrdersPaid,
        jobOrdersPending,
        jobOrdersGst,
        pendingJobOrders,
        completedJobOrders,
        totalJobPieces,
        
        // Invoices
        totalInvoices,
        invoicesRevenue,
        invoicesPaid,
        invoicesPending,
        paidInvoices,
        partialInvoices,
        unpaidInvoices,
        
        // Combined
        totalRevenue,
        totalPaidAmount,
        totalPendingAmount,
        
        // Trends
        revenueLast30,
        revenuePrev30,
        revenueTrend,
        ordersLast30Count: ordersLast30.length,
        jobsLast30Count: jobsLast30.length,
        invoicesLast30Count: invoicesLast30.length,
        
        // Charts
        monthlyRevenue: last6Months,
        dailyData,
        paymentDistribution,
        revenueDistribution,
        orderStatusDistribution,
        jobStatusDistribution,
        
        // Recent
        recentOrders,
        recentJobs,
        recentInvoices,
      };
    },
  });

  const formatAmount = (amount: number) => {
    return showAmounts ? `₹${amount.toLocaleString()}` : '****';
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

  const chartConfig = {
    orders: { label: 'Online Orders', color: '#3B82F6' },
    jobs: { label: 'Job Orders', color: '#8B5CF6' },
    invoices: { label: 'Wholesale', color: '#10B981' },
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="text-muted-foreground">Loading comprehensive business analytics...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const collectionRate = stats?.totalRevenue ? ((stats.totalPaidAmount / stats.totalRevenue) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Business Dashboard</h2>
          <p className="text-muted-foreground">Comprehensive overview of all business operations</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAmounts(!showAmounts)}
        >
          {showAmounts ? 'Hide Amounts' : 'Show Amounts'}
        </Button>
      </div>

      {/* Summary Cards Row 1 - Total Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Revenue (All Sources)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatAmount(stats?.totalRevenue || 0)}</div>
            <div className="flex items-center gap-1 text-sm mt-1">
              {(stats?.revenueTrend || 0) >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span className={(stats?.revenueTrend || 0) >= 0 ? 'text-green-600' : 'text-red-600'}>
                {(stats?.revenueTrend || 0) >= 0 ? '+' : ''}{(stats?.revenueTrend || 0).toFixed(1)}%
              </span>
              <span className="text-muted-foreground">vs prev 30d</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Total Collected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatAmount(stats?.totalPaidAmount || 0)}</div>
            <Progress value={collectionRate} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-1">{collectionRate.toFixed(1)}% collection rate</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Total Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{formatAmount(stats?.totalPendingAmount || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Jobs: {formatAmount(stats?.jobOrdersPending || 0)} | Invoices: {formatAmount(stats?.invoicesPending || 0)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Total GST Collected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{formatAmount(stats?.jobOrdersGst || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">From job orders</p>
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards Row 2 - Source Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Online Orders Card */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-blue-500" />
                Online Orders
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/orders')}>
                View →
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Orders</span>
              <span className="font-semibold">{stats?.totalOnlineOrders || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Revenue</span>
              <span className="font-semibold">{formatAmount(stats?.onlineOrdersRevenue || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Pending</span>
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                {stats?.pendingOnlineOrders || 0}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Delivered</span>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {stats?.deliveredOnlineOrders || 0}
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground pt-2 border-t">
              Last 30 days: {stats?.ordersLast30Count || 0} orders
            </div>
          </CardContent>
        </Card>

        {/* Job Orders Card */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-purple-500" />
                External Job Orders
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/external-jobs')}>
                View →
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Jobs</span>
              <span className="font-semibold">{stats?.totalJobOrders || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Revenue</span>
              <span className="font-semibold">{formatAmount(stats?.jobOrdersRevenue || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Collected</span>
              <span className="font-semibold text-green-600">{formatAmount(stats?.jobOrdersPaid || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Pending</span>
              <span className="font-semibold text-amber-600">{formatAmount(stats?.jobOrdersPending || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Pieces</span>
              <span className="font-semibold">{(stats?.totalJobPieces || 0).toLocaleString()}</span>
            </div>
            <div className="text-xs text-muted-foreground pt-2 border-t">
              Last 30 days: {stats?.jobsLast30Count || 0} jobs
            </div>
          </CardContent>
        </Card>

        {/* Wholesale Invoices Card */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 text-green-500" />
                Wholesale Invoices
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/invoice')}>
                View →
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Invoices</span>
              <span className="font-semibold">{stats?.totalInvoices || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Revenue</span>
              <span className="font-semibold">{formatAmount(stats?.invoicesRevenue || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Collected</span>
              <span className="font-semibold text-green-600">{formatAmount(stats?.invoicesPaid || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Pending</span>
              <span className="font-semibold text-amber-600">{formatAmount(stats?.invoicesPending || 0)}</span>
            </div>
            <div className="flex gap-2 pt-2 border-t">
              <Badge variant="outline" className="bg-green-50 text-green-700 text-xs">{stats?.paidInvoices || 0} Paid</Badge>
              <Badge variant="outline" className="bg-amber-50 text-amber-700 text-xs">{stats?.partialInvoices || 0} Partial</Badge>
              <Badge variant="outline" className="bg-red-50 text-red-700 text-xs">{stats?.unpaidInvoices || 0} Unpaid</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats?.totalCustomers || 0}</p>
                <p className="text-xs text-muted-foreground">B2B Customers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Briefcase className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{stats?.totalCompanies || 0}</p>
                <p className="text-xs text-muted-foreground">Job Companies</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats?.totalProducts || 0}</p>
                <p className="text-xs text-muted-foreground">Active Products</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-amber-600" />
              <div>
                <p className="text-2xl font-bold">{(stats?.pendingOnlineOrders || 0) + (stats?.pendingJobOrders || 0)}</p>
                <p className="text-xs text-muted-foreground">Pending Actions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue by Source</CardTitle>
            <CardDescription>Combined revenue from all business channels</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.monthlyRevenue || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="orders" name="Online Orders" fill="#3B82F6" stackId="a" />
                  <Bar dataKey="jobs" name="Job Orders" fill="#8B5CF6" stackId="a" />
                  <Bar dataKey="invoices" name="Wholesale" fill="#10B981" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Revenue Distribution Pie */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Distribution</CardTitle>
            <CardDescription>Share of revenue by business channel</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.revenueDistribution || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stats?.revenueDistribution?.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Daily Activity Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Activity (Last 7 Days)</CardTitle>
            <CardDescription>Orders, jobs, and invoices created per day</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.dailyData || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="orders" name="Online Orders" stroke="#3B82F6" fill="#3B82F680" />
                  <Area type="monotone" dataKey="jobs" name="Job Orders" stroke="#8B5CF6" fill="#8B5CF680" />
                  <Area type="monotone" dataKey="invoices" name="Wholesale" stroke="#10B981" fill="#10B98180" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Status Overview</CardTitle>
            <CardDescription>Distribution by order and job status</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="orders" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="orders">Online Orders</TabsTrigger>
                <TabsTrigger value="jobs">Job Orders</TabsTrigger>
              </TabsList>
              <TabsContent value="orders">
                <ChartContainer config={chartConfig} className="h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats?.orderStatusDistribution || []}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {stats?.orderStatusDistribution?.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </TabsContent>
              <TabsContent value="jobs">
                <ChartContainer config={chartConfig} className="h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats?.jobStatusDistribution || []}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {stats?.jobStatusDistribution?.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Tables */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest transactions across all channels</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="orders" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="orders">Online Orders</TabsTrigger>
              <TabsTrigger value="jobs">Job Orders</TabsTrigger>
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
            </TabsList>
            
            <TabsContent value="orders">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                      stats.recentOrders.map((order: any) => (
                        <TableRow key={order.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/admin/orders/${order.id}`)}>
                          <TableCell className="font-medium">{order.order_number}</TableCell>
                          <TableCell>{format(new Date(order.created_at), 'MMM dd, yyyy')}</TableCell>
                          <TableCell>{order.delivery_name}</TableCell>
                          <TableCell>{formatAmount(order.total_amount)}</TableCell>
                          <TableCell><OrderStatusBadge status={order.status} /></TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No orders yet</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="jobs">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job ID</TableHead>
                      <TableHead>Style</TableHead>
                      <TableHead>Pieces</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats?.recentJobs && stats.recentJobs.length > 0 ? (
                      stats.recentJobs.map((job: any) => (
                        <TableRow key={job.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/admin/external-jobs/details/${job.id}`)}>
                          <TableCell className="font-medium">{job.job_id}</TableCell>
                          <TableCell>{job.style_name}</TableCell>
                          <TableCell>{job.number_of_pieces}</TableCell>
                          <TableCell>{formatAmount(job.total_with_gst || job.total_amount)}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={
                              job.job_status === 'completed' || job.job_status === 'delivered' ? 'bg-green-50 text-green-700' :
                              job.job_status === 'in_progress' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
                            }>
                              {job.job_status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No job orders yet</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="invoices">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats?.recentInvoices && stats.recentInvoices.length > 0 ? (
                      stats.recentInvoices.map((invoice: any) => (
                        <TableRow key={invoice.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/admin/invoice/${invoice.id}`)}>
                          <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                          <TableCell>{format(new Date(invoice.invoice_date), 'MMM dd, yyyy')}</TableCell>
                          <TableCell>{formatAmount(invoice.total_amount)}</TableCell>
                          <TableCell>{formatAmount(invoice.balance_amount || 0)}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={
                              invoice.payment_status === 'paid' ? 'bg-green-50 text-green-700' :
                              invoice.payment_status === 'partial' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                            }>
                              {invoice.payment_status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No invoices yet</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
