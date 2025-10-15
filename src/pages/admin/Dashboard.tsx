import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Package, FileText, DollarSign, TrendingUp, TrendingDown, ShoppingCart, Clock, CheckCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { OrderStatusBadge } from '@/components/customer/OrderStatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function Dashboard() {
  const navigate = useNavigate();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [customersRes, productsRes, invoicesRes, invoicesWithData, recentInvoices, ordersRes, ordersData] = await Promise.all([
        supabase.from('customers').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('invoices').select('*', { count: 'exact', head: true }),
        supabase.from('invoices').select('total_amount, created_at, invoice_date'),
        supabase.from('invoices').select('total_amount, invoice_date').order('invoice_date', { ascending: false }).limit(6),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
      ]);

      const totalAmount = invoicesWithData.data?.reduce(
        (sum, invoice) => sum + Number(invoice.total_amount || 0),
        0
      ) || 0;

      // Calculate monthly revenue for last 6 months
      const monthlyRevenue = recentInvoices.data?.reduce((acc: any[], invoice) => {
        const month = new Date(invoice.invoice_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        const existing = acc.find(item => item.month === month);
        if (existing) {
          existing.revenue += Number(invoice.total_amount);
        } else {
          acc.push({ month, revenue: Number(invoice.total_amount) });
        }
        return acc;
      }, []).reverse() || [];

      // Product category distribution
      const productsData = await supabase.from('products').select('category');
      const categoryCount = productsData.data?.reduce((acc: any, product) => {
        acc[product.category] = (acc[product.category] || 0) + 1;
        return acc;
      }, {});
      const categoryDistribution = Object.entries(categoryCount || {}).map(([name, value]) => ({ name, value }));

      // Order statistics
      const totalOrders = ordersRes.count || 0;
      const pendingOrders = ordersData.data?.filter(o => o.status === 'pending').length || 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const ordersToday = ordersData.data?.filter(o => new Date(o.created_at) >= today).length || 0;
      const totalOrderRevenue = ordersData.data?.reduce((sum, order) => sum + Number(order.total_amount || 0), 0) || 0;
      const avgOrderValue = totalOrders > 0 ? totalOrderRevenue / totalOrders : 0;

      // Order status distribution
      const statusCount = ordersData.data?.reduce((acc: any, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {});
      const orderStatusDistribution = Object.entries(statusCount || {}).map(([name, value]) => ({ name, value }));

      // Daily order trends (last 7 days)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        return date;
      }).reverse();

      const dailyOrders = last7Days.map(date => {
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        const count = ordersData.data?.filter(o => {
          const orderDate = new Date(o.created_at);
          return orderDate >= date && orderDate < nextDay;
        }).length || 0;
        return {
          date: format(date, 'MMM dd'),
          orders: count
        };
      });

      // Recent orders (last 10)
      const recentOrders = ordersData.data?.slice(0, 10) || [];

      return {
        customers: customersRes.count || 0,
        products: productsRes.count || 0,
        invoices: invoicesRes.count || 0,
        totalAmount,
        monthlyRevenue,
        categoryDistribution,
        totalOrders,
        pendingOrders,
        ordersToday,
        avgOrderValue,
        orderStatusDistribution,
        dailyOrders,
        recentOrders,
      };
    },
  });

  const statCards = [
    {
      title: 'Total Customers',
      value: stats?.customers || 0,
      icon: Users,
      gradient: 'from-blue-500 to-cyan-500',
      trend: '+12%',
      trendUp: true,
    },
    {
      title: 'Total Products',
      value: stats?.products || 0,
      icon: Package,
      gradient: 'from-green-500 to-emerald-500',
      trend: '+8%',
      trendUp: true,
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      gradient: 'from-purple-500 to-pink-500',
      trend: `${stats?.ordersToday || 0} today`,
      trendUp: true,
    },
    {
      title: 'Total Revenue',
      value: `₹${stats?.totalAmount.toFixed(2) || '0.00'}`,
      icon: DollarSign,
      gradient: 'from-orange-500 to-red-500',
      trend: '+15%',
      trendUp: true,
    },
    {
      title: 'Pending Orders',
      value: stats?.pendingOrders || 0,
      icon: Clock,
      gradient: 'from-yellow-500 to-amber-500',
      trend: 'Requires action',
      trendUp: false,
    },
    {
      title: 'Avg Order Value',
      value: `₹${stats?.avgOrderValue.toFixed(2) || '0.00'}`,
      icon: CheckCircle,
      gradient: 'from-indigo-500 to-violet-500',
      trend: '+5%',
      trendUp: true,
    },
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

  const chartConfig = {
    revenue: {
      label: 'Revenue',
      color: 'hsl(var(--chart-1))',
    },
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="text-muted-foreground">Overview of your business metrics</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-muted-foreground">Overview of your business metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden animate-fade-in border-none shadow-lg">
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-10`} />
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-md`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="flex items-center gap-1 text-sm">
                {stat.trendUp ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                <span className={stat.trendUp ? 'text-green-600' : 'text-red-600'}>
                  {stat.trend}
                </span>
                {stat.trend.includes('%') && <span className="text-muted-foreground">vs last month</span>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Order Trends */}
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>Daily Order Trends</CardTitle>
            <CardDescription>Orders volume for the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats?.dailyOrders || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="orders" 
                    stroke="hsl(var(--chart-3))" 
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--chart-3))", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Order Status Distribution */}
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>Order Status</CardTitle>
            <CardDescription>Distribution of orders by status</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.orderStatusDistribution || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stats?.orderStatusDistribution?.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Monthly Revenue Chart */}
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
            <CardDescription>Revenue trend for the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.monthlyRevenue || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar 
                    dataKey="revenue" 
                    fill="hsl(var(--chart-2))" 
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Product Category Distribution */}
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>Product Categories</CardTitle>
            <CardDescription>Distribution of products by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.categoryDistribution || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stats?.categoryDistribution?.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders Section */}
      <Card className="animate-fade-in">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest 10 orders placed by customers</CardDescription>
          </div>
          <Button variant="outline" onClick={() => navigate('/admin/orders')}>
            View All Orders
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                  stats.recentOrders.map((order: any) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.order_number}</TableCell>
                      <TableCell>
                        {format(new Date(order.created_at), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>{order.delivery_name}</TableCell>
                      <TableCell className="font-semibold">₹{order.total_amount}</TableCell>
                      <TableCell>
                        <OrderStatusBadge status={order.status} />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/admin/orders/${order.id}`)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No orders yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
