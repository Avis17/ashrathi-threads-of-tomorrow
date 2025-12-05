import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Building2, Phone, Mail, MapPin, TrendingUp, DollarSign, Package, Clock, Star, Award, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area } from "recharts";

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6366f1', '#ec4899', '#14b8a6'];

const CompanyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: company, isLoading } = useQuery({
    queryKey: ['external-job-company', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('external_job_companies')
        .select('*')
        .eq('id', id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch company job orders with operations
  const { data: companyOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ['external-job-company-orders', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('external_job_orders')
        .select(`
          *,
          external_job_operations (
            *,
            external_job_operation_categories (*)
          ),
          external_job_payments (*)
        `)
        .eq('company_id', id!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Calculate company stats
  const calculateStats = () => {
    if (!companyOrders || companyOrders.length === 0) {
      return {
        totalOrders: 0,
        totalAmount: 0,
        paidAmount: 0,
        pendingAmount: 0,
        totalPieces: 0,
        totalCommission: 0,
        totalOperationsCost: 0,
        grossProfit: 0,
        avgOrderValue: 0,
        avgDeliveryDays: 0,
        avgPaymentDays: 0,
        paymentStatusData: [],
        jobStatusData: [],
        monthlyData: [],
        yearlyData: [],
        profitMargin: 0,
        collectionRate: 0,
        orderFrequency: 0,
        companyRating: { score: 0, label: '', color: '' },
      };
    }

    const totalOrders = companyOrders.length;
    const totalAmount = companyOrders.reduce((sum, o) => sum + (o.total_with_gst || o.total_amount || 0), 0);
    const paidAmount = companyOrders.reduce((sum, o) => sum + (o.paid_amount || 0), 0);
    const pendingAmount = totalAmount - paidAmount;
    const totalPieces = companyOrders.reduce((sum, o) => sum + (o.number_of_pieces || 0), 0);

    let totalCommission = 0;
    let totalOperationsCost = 0;

    companyOrders.forEach(order => {
      order.external_job_operations?.forEach((op: any) => {
        const categoriesTotal = op.external_job_operation_categories
          ?.reduce((sum: number, cat: any) => sum + cat.rate, 0) || 0;
        const commissionPercent = op.commission_percent || 0;
        const roundOff = op.round_off || 0;

        if (commissionPercent > 0) {
          const commissionAmount = (categoriesTotal * commissionPercent) / 100;
          totalCommission += commissionAmount * order.number_of_pieces;
        }

        const operationTotal = roundOff > 0 ? roundOff : (categoriesTotal + (categoriesTotal * commissionPercent / 100));
        totalOperationsCost += operationTotal * order.number_of_pieces;
      });
    });

    const grossProfit = totalAmount - totalOperationsCost;
    const avgOrderValue = totalAmount / totalOrders;
    const profitMargin = totalAmount > 0 ? (grossProfit / totalAmount) * 100 : 0;
    const collectionRate = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;

    // Calculate average delivery days
    let totalDeliveryDays = 0;
    let deliveryCount = 0;
    companyOrders.forEach(order => {
      if (order.job_status === 'completed' && order.delivery_date && order.order_date) {
        const orderDate = new Date(order.order_date);
        const deliveryDate = new Date(order.delivery_date);
        const days = Math.ceil((deliveryDate.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
        if (days > 0) {
          totalDeliveryDays += days;
          deliveryCount++;
        }
      }
    });
    const avgDeliveryDays = deliveryCount > 0 ? Math.round(totalDeliveryDays / deliveryCount) : 0;

    // Calculate average payment days
    let totalPaymentDays = 0;
    let paymentCount = 0;
    companyOrders.forEach(order => {
      const payments = order.external_job_payments || [];
      if (payments.length > 0 && order.order_date) {
        const orderDate = new Date(order.order_date);
        const lastPayment = payments.sort((a: any, b: any) => 
          new Date(b.payment_date || b.created_at).getTime() - new Date(a.payment_date || a.created_at).getTime()
        )[0];
        const paymentDate = new Date(lastPayment.payment_date || lastPayment.created_at);
        const days = Math.ceil((paymentDate.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
        if (days >= 0) {
          totalPaymentDays += days;
          paymentCount++;
        }
      }
    });
    const avgPaymentDays = paymentCount > 0 ? Math.round(totalPaymentDays / paymentCount) : 0;

    // Order frequency (orders per month)
    const firstOrderDate = new Date(companyOrders[companyOrders.length - 1].created_at || '');
    const lastOrderDate = new Date(companyOrders[0].created_at || '');
    const monthsSpan = Math.max(1, Math.ceil((lastOrderDate.getTime() - firstOrderDate.getTime()) / (1000 * 60 * 60 * 24 * 30)));
    const orderFrequency = totalOrders / monthsSpan;

    // Payment status breakdown
    const paymentStatusCounts = companyOrders.reduce((acc, order) => {
      const status = order.payment_status || 'unpaid';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const paymentStatusData = Object.entries(paymentStatusCounts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));

    // Job status breakdown
    const jobStatusCounts = companyOrders.reduce((acc, order) => {
      const status = order.job_status || 'pending';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const jobStatusData = Object.entries(jobStatusCounts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));

    // Monthly data (last 12 months)
    const now = new Date();
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
      const monthOrders = companyOrders.filter(o => {
        const orderDate = new Date(o.order_date || o.created_at || '');
        return orderDate.getMonth() === date.getMonth() && orderDate.getFullYear() === date.getFullYear();
      });

      let monthProfit = 0;
      monthOrders.forEach(o => {
        let opsCost = 0;
        o.external_job_operations?.forEach((op: any) => {
          const catTotal = op.external_job_operation_categories?.reduce((s: number, c: any) => s + c.rate, 0) || 0;
          opsCost += (op.round_off || catTotal + (catTotal * (op.commission_percent || 0) / 100)) * o.number_of_pieces;
        });
        monthProfit += (o.total_with_gst || o.total_amount || 0) - opsCost;
      });

      return {
        name: date.toLocaleDateString('en-US', { month: 'short' }),
        orders: monthOrders.length,
        amount: monthOrders.reduce((sum, o) => sum + (o.total_with_gst || o.total_amount || 0), 0),
        pieces: monthOrders.reduce((sum, o) => sum + (o.number_of_pieces || 0), 0),
        paid: monthOrders.reduce((sum, o) => sum + (o.paid_amount || 0), 0),
        profit: monthProfit,
      };
    });

    // Yearly data (last 5 years)
    const yearlyData = Array.from({ length: 5 }, (_, i) => {
      const year = now.getFullYear() - (4 - i);
      const yearOrders = companyOrders.filter(o => {
        const orderDate = new Date(o.order_date || o.created_at || '');
        return orderDate.getFullYear() === year;
      });

      let yearProfit = 0;
      yearOrders.forEach(o => {
        let opsCost = 0;
        o.external_job_operations?.forEach((op: any) => {
          const catTotal = op.external_job_operation_categories?.reduce((s: number, c: any) => s + c.rate, 0) || 0;
          opsCost += (op.round_off || catTotal + (catTotal * (op.commission_percent || 0) / 100)) * o.number_of_pieces;
        });
        yearProfit += (o.total_with_gst || o.total_amount || 0) - opsCost;
      });

      return {
        name: year.toString(),
        orders: yearOrders.length,
        amount: yearOrders.reduce((sum, o) => sum + (o.total_with_gst || o.total_amount || 0), 0),
        pieces: yearOrders.reduce((sum, o) => sum + (o.number_of_pieces || 0), 0),
        paid: yearOrders.reduce((sum, o) => sum + (o.paid_amount || 0), 0),
        profit: yearProfit,
      };
    });

    // Calculate company rating
    let ratingScore = 0;
    
    // Profit margin contribution (max 30 points)
    ratingScore += Math.min(30, profitMargin * 1);
    
    // Collection rate contribution (max 25 points)
    ratingScore += Math.min(25, collectionRate * 0.25);
    
    // Order frequency contribution (max 20 points)
    ratingScore += Math.min(20, orderFrequency * 5);
    
    // Payment speed contribution (max 15 points) - lower is better
    if (avgPaymentDays <= 7) ratingScore += 15;
    else if (avgPaymentDays <= 15) ratingScore += 12;
    else if (avgPaymentDays <= 30) ratingScore += 8;
    else if (avgPaymentDays <= 45) ratingScore += 4;
    
    // Order volume contribution (max 10 points)
    ratingScore += Math.min(10, totalOrders * 0.5);

    let ratingLabel = '';
    let ratingColor = '';
    if (ratingScore >= 80) { ratingLabel = 'Excellent'; ratingColor = 'text-green-500'; }
    else if (ratingScore >= 60) { ratingLabel = 'Good'; ratingColor = 'text-blue-500'; }
    else if (ratingScore >= 40) { ratingLabel = 'Average'; ratingColor = 'text-yellow-500'; }
    else { ratingLabel = 'Needs Improvement'; ratingColor = 'text-red-500'; }

    return {
      totalOrders,
      totalAmount,
      paidAmount,
      pendingAmount,
      totalPieces,
      totalCommission,
      totalOperationsCost,
      grossProfit,
      avgOrderValue,
      avgDeliveryDays,
      avgPaymentDays,
      paymentStatusData,
      jobStatusData,
      monthlyData,
      yearlyData,
      profitMargin,
      collectionRate,
      orderFrequency,
      companyRating: { score: Math.round(ratingScore), label: ratingLabel, color: ratingColor },
    };
  };

  const stats = calculateStats();

  if (isLoading || ordersLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!company) {
    return <div>Company not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin/external-jobs")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{company.company_name}</h1>
            <p className="text-muted-foreground mt-1">Company Details & Analytics</p>
          </div>
        </div>
        <Button onClick={() => navigate(`/admin/external-jobs/company/edit/${company.id}`)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Company
        </Button>
      </div>

      {/* Company Rating Card */}
      <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-full bg-primary/20">
              <Award className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Company Rating</p>
              <div className="flex items-center gap-3">
                <span className={`text-4xl font-bold ${stats.companyRating.color}`}>
                  {stats.companyRating.score}/100
                </span>
                <Badge variant="outline" className={stats.companyRating.color}>
                  {stats.companyRating.label}
                </Badge>
              </div>
            </div>
          </div>
          <div className="text-right space-y-1 text-sm">
            <p>Profit Margin: <span className="font-semibold">{stats.profitMargin.toFixed(1)}%</span></p>
            <p>Collection Rate: <span className="font-semibold">{stats.collectionRate.toFixed(1)}%</span></p>
            <p>Avg Payment: <span className="font-semibold">{stats.avgPaymentDays} days</span></p>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="details">Company Info</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Stats Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalOrders}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Amount</p>
                  <p className="text-2xl font-bold text-green-600">₹{stats.totalAmount.toLocaleString()}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/20">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Paid Amount</p>
                  <p className="text-2xl font-bold text-emerald-600">₹{stats.paidAmount.toLocaleString()}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/20">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-amber-600">₹{stats.pendingAmount.toLocaleString()}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Gross Profit</p>
                  <p className="text-2xl font-bold text-purple-600">₹{stats.grossProfit.toLocaleString()}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-pink-500/10 to-pink-600/5 border-pink-500/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-pink-500/20">
                  <DollarSign className="h-5 w-5 text-pink-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Commission Paid</p>
                  <p className="text-2xl font-bold text-pink-600">₹{stats.totalCommission.toLocaleString()}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 border-indigo-500/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/20">
                  <DollarSign className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Operations Cost</p>
                  <p className="text-2xl font-bold text-indigo-600">₹{stats.totalOperationsCost.toLocaleString()}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-teal-500/10 to-teal-600/5 border-teal-500/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-teal-500/20">
                  <Package className="h-5 w-5 text-teal-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Pieces</p>
                  <p className="text-2xl font-bold text-teal-600">{stats.totalPieces.toLocaleString()}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Progress Bars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Collection Rate</span>
                  <span className="font-semibold">{stats.collectionRate.toFixed(1)}%</span>
                </div>
                <Progress value={stats.collectionRate} className="h-3" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Profit Margin</span>
                  <span className="font-semibold">{stats.profitMargin.toFixed(1)}%</span>
                </div>
                <Progress value={Math.max(0, stats.profitMargin)} className="h-3" />
              </div>
            </Card>
          </div>

          {/* Timing Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Avg Delivery Time</p>
                  <p className="text-xl font-bold">{stats.avgDeliveryDays} days</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Avg Payment Time</p>
                  <p className="text-xl font-bold">{stats.avgPaymentDays} days</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Avg Order Value</p>
                  <p className="text-xl font-bold">₹{stats.avgOrderValue.toLocaleString()}</p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Payment Status Pie Chart */}
            <Card className="p-4">
              <h3 className="font-semibold mb-4">Payment Status Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={stats.paymentStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {stats.paymentStatusData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            {/* Job Status Pie Chart */}
            <Card className="p-4">
              <h3 className="font-semibold mb-4">Job Status Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={stats.jobStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {stats.jobStatusData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            {/* Monthly Orders Bar Chart */}
            <Card className="p-4 md:col-span-2">
              <h3 className="font-semibold mb-4">Monthly Orders & Revenue</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" orientation="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      name === 'amount' || name === 'profit' || name === 'paid' 
                        ? `₹${value.toLocaleString()}` 
                        : value,
                      name.charAt(0).toUpperCase() + name.slice(1)
                    ]}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="orders" fill="#6366f1" name="Orders" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="amount" fill="#10b981" name="Amount" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          {/* Monthly Profit Trend */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Monthly Profit Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={stats.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Profit']} />
                <Area type="monotone" dataKey="profit" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Payment vs Amount Line Chart */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Amount vs Paid Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: number) => [`₹${value.toLocaleString()}`]} />
                <Legend />
                <Line type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={2} name="Total Amount" />
                <Line type="monotone" dataKey="paid" stroke="#10b981" strokeWidth={2} name="Paid Amount" />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Yearly Comparison */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Yearly Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.yearlyData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: number, name: string) => [
                  name === 'amount' || name === 'profit' ? `₹${value.toLocaleString()}` : value,
                  name.charAt(0).toUpperCase() + name.slice(1)
                ]} />
                <Legend />
                <Bar dataKey="orders" fill="#6366f1" name="Orders" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pieces" fill="#f59e0b" name="Pieces" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Building2 className="h-4 w-4" />
                    <span className="text-sm">Company Name</span>
                  </div>
                  <p className="font-semibold">{company.company_name}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Phone className="h-4 w-4" />
                    <span className="text-sm">Contact Person</span>
                  </div>
                  <p className="font-semibold">{company.contact_person}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Phone className="h-4 w-4" />
                    <span className="text-sm">Contact Number</span>
                  </div>
                  <p className="font-semibold">{company.contact_number}</p>
                </div>

                {company.alternate_number && (
                  <div>
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Phone className="h-4 w-4" />
                      <span className="text-sm">Alternate Number</span>
                    </div>
                    <p className="font-semibold">{company.alternate_number}</p>
                  </div>
                )}

                {company.email && (
                  <div>
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Mail className="h-4 w-4" />
                      <span className="text-sm">Email</span>
                    </div>
                    <p className="font-semibold">{company.email}</p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">Address</span>
                  </div>
                  <p className="font-semibold">{company.address}</p>
                </div>

                {company.gst_number && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">GST Number</p>
                    <p className="font-semibold">{company.gst_number}</p>
                  </div>
                )}

                {company.upi_id && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">UPI ID</p>
                    <p className="font-semibold">{company.upi_id}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <Badge variant={company.is_active ? "default" : "destructive"}>
                    {company.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </div>

            {company.account_details && (
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-muted-foreground mb-2">Account Details</p>
                <p className="whitespace-pre-wrap">{company.account_details}</p>
              </div>
            )}

            {company.notes && (
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-muted-foreground mb-2">Notes</p>
                <p className="whitespace-pre-wrap">{company.notes}</p>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CompanyDetails;