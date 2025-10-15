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
import { useState } from 'react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [flippedCard, setFlippedCard] = useState<string | null>(null);

  // Date ranges
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [customersRes, productsRes, invoicesRes, invoicesWithData, recentInvoices, ordersRes, ordersData] = await Promise.all([
        supabase.from('customers').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('should_remove', false),
        supabase.from('invoices').select('*', { count: 'exact', head: true }),
        supabase.from('invoices').select('total_amount, created_at, invoice_date'),
        supabase.from('invoices').select('total_amount, invoice_date').order('invoice_date', { ascending: false }).limit(6),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
      ]);

      // Customers trend
      const { count: newCustomersLast30 } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString());
      
      const { count: newCustomersPrev30 } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sixtyDaysAgo.toISOString())
        .lt('created_at', thirtyDaysAgo.toISOString());

      const customersTrend = newCustomersPrev30 && newCustomersPrev30 > 0 
        ? (((newCustomersLast30 || 0) - newCustomersPrev30) / newCustomersPrev30) * 100 
        : (newCustomersLast30 || 0) > 0 ? 100 : 0;

      // Products trend
      const { data: recentProductChanges } = await supabase
        .from('products')
        .select('created_at, should_remove')
        .gte('created_at', sixtyDaysAgo.toISOString());

      const addedLast30 = recentProductChanges?.filter(p => 
        new Date(p.created_at) >= thirtyDaysAgo && !p.should_remove
      ).length || 0;

      const addedPrev30 = recentProductChanges?.filter(p => 
        new Date(p.created_at) >= sixtyDaysAgo && 
        new Date(p.created_at) < thirtyDaysAgo && 
        !p.should_remove
      ).length || 0;

      const productsTrend = addedPrev30 > 0 
        ? ((addedLast30 - addedPrev30) / addedPrev30) * 100 
        : addedLast30 > 0 ? 100 : 0;

      // Orders trend (last 30 days)
      const ordersLast30 = ordersData.data?.filter(o => 
        new Date(o.created_at) >= thirtyDaysAgo
      ) || [];

      const ordersPrev30Count = ordersData.data?.filter(o => 
        new Date(o.created_at) >= sixtyDaysAgo && 
        new Date(o.created_at) < thirtyDaysAgo
      ).length || 0;

      const ordersTrend = ordersPrev30Count > 0
        ? ((ordersLast30.length - ordersPrev30Count) / ordersPrev30Count) * 100
        : ordersLast30.length > 0 ? 100 : 0;

      // Revenue trend (invoices + online orders)
      const ordersRevenueLast30 = ordersLast30.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
      const invoicesLast30 = invoicesWithData.data?.filter(i => 
        new Date(i.created_at) >= thirtyDaysAgo
      ) || [];
      const invoicesRevenueLast30 = invoicesLast30.reduce((sum, i) => sum + Number(i.total_amount || 0), 0);
      const totalRevenueLast30 = ordersRevenueLast30 + invoicesRevenueLast30;

      const ordersPrev30 = ordersData.data?.filter(o => 
        new Date(o.created_at) >= sixtyDaysAgo && 
        new Date(o.created_at) < thirtyDaysAgo
      ) || [];
      const ordersRevenuePrev30 = ordersPrev30.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
      
      const invoicesPrev30 = invoicesWithData.data?.filter(i => 
        new Date(i.created_at) >= sixtyDaysAgo && 
        new Date(i.created_at) < thirtyDaysAgo
      ) || [];
      const invoicesRevenuePrev30 = invoicesPrev30.reduce((sum, i) => sum + Number(i.total_amount || 0), 0);
      const totalRevenuePrev30 = ordersRevenuePrev30 + invoicesRevenuePrev30;

      const revenueTrend = totalRevenuePrev30 > 0
        ? ((totalRevenueLast30 - totalRevenuePrev30) / totalRevenuePrev30) * 100
        : totalRevenueLast30 > 0 ? 100 : 0;

      // Pending orders trend
      const pendingOrdersCurrent = ordersData.data?.filter(o => 
        ['pending', 'confirmed'].includes(o.status)
      ).length || 0;

      const pendingOrdersPrev = ordersData.data?.filter(o => 
        ['pending', 'confirmed'].includes(o.status) &&
        new Date(o.created_at) >= sixtyDaysAgo && 
        new Date(o.created_at) < thirtyDaysAgo
      ).length || 0;

      const pendingTrend = pendingOrdersPrev > 0
        ? ((pendingOrdersCurrent - pendingOrdersPrev) / pendingOrdersPrev) * 100
        : pendingOrdersCurrent > 0 ? 100 : 0;

      // AOV trend
      const aovLast30 = ordersLast30.length > 0
        ? ordersRevenueLast30 / ordersLast30.length
        : 0;

      const aovPrev30 = ordersPrev30.length > 0
        ? ordersRevenuePrev30 / ordersPrev30.length
        : 0;

      const aovTrend = aovPrev30 > 0
        ? ((aovLast30 - aovPrev30) / aovPrev30) * 100
        : aovLast30 > 0 ? 100 : 0;

      const totalAmount = invoicesWithData.data?.reduce(
        (sum, invoice) => sum + Number(invoice.total_amount || 0),
        0
      ) || 0;

      // Monthly revenue
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
      const productsData = await supabase.from('products').select('category').eq('should_remove', false);
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
        // Trends
        customersTrend,
        productsTrend,
        ordersTrend,
        revenueTrend,
        pendingTrend,
        aovTrend,
        // Breakdown data
        newCustomersLast30,
        newCustomersPrev30,
        addedLast30,
        addedPrev30,
        ordersLast30Count: ordersLast30.length,
        ordersPrev30Count,
        totalRevenueLast30,
        totalRevenuePrev30,
        ordersRevenueLast30,
        invoicesRevenueLast30,
        pendingOrdersCurrent,
        pendingOrdersPrev,
        aovLast30,
        aovPrev30,
      };
    },
  });

  const statCards = [
    {
      title: 'Total Customers',
      value: stats?.customers || 0,
      icon: Users,
      gradient: 'from-blue-500 to-cyan-500',
      trend: stats?.customersTrend || 0,
      trendUp: (stats?.customersTrend || 0) >= 0,
      breakdown: `New customers (30d): ${stats?.newCustomersLast30 || 0}\nPrevious period: ${stats?.newCustomersPrev30 || 0}\nTotal in database: ${stats?.customers || 0}`,
    },
    {
      title: 'Total Products',
      value: stats?.products || 0,
      icon: Package,
      gradient: 'from-green-500 to-emerald-500',
      trend: stats?.productsTrend || 0,
      trendUp: (stats?.productsTrend || 0) >= 0,
      breakdown: `Active products: ${stats?.products || 0}\nAdded last 30d: ${stats?.addedLast30 || 0}\nPrevious period: ${stats?.addedPrev30 || 0}`,
    },
    {
      title: 'Total Orders (30d)',
      value: stats?.ordersLast30Count || 0,
      icon: ShoppingCart,
      gradient: 'from-purple-500 to-pink-500',
      trend: stats?.ordersTrend || 0,
      trendUp: (stats?.ordersTrend || 0) >= 0,
      breakdown: `Orders last 30d: ${stats?.ordersLast30Count || 0}\nPrevious 30d: ${stats?.ordersPrev30Count || 0}\nToday: ${stats?.ordersToday || 0}`,
    },
    {
      title: 'Total Revenue (30d)',
      value: `₹${stats?.totalRevenueLast30?.toLocaleString() || '0'}`,
      icon: DollarSign,
      gradient: 'from-orange-500 to-red-500',
      trend: stats?.revenueTrend || 0,
      trendUp: (stats?.revenueTrend || 0) >= 0,
      breakdown: `Online orders: ₹${stats?.ordersRevenueLast30?.toLocaleString() || 0}\nInvoices: ₹${stats?.invoicesRevenueLast30?.toLocaleString() || 0}\nTotal: ₹${stats?.totalRevenueLast30?.toLocaleString() || 0}\nPrevious: ₹${stats?.totalRevenuePrev30?.toLocaleString() || 0}`,
    },
    {
      title: 'Pending Orders',
      value: stats?.pendingOrdersCurrent || 0,
      icon: Clock,
      gradient: 'from-yellow-500 to-amber-500',
      trend: stats?.pendingTrend || 0,
      trendUp: (stats?.pendingTrend || 0) < 0, // Lower is better
      breakdown: `Current pending: ${stats?.pendingOrdersCurrent || 0}\nPrevious period: ${stats?.pendingOrdersPrev || 0}\nLower is better`,
    },
    {
      title: 'Avg Order Value (30d)',
      value: `₹${stats?.aovLast30?.toFixed(0) || '0'}`,
      icon: CheckCircle,
      gradient: 'from-indigo-500 to-violet-500',
      trend: stats?.aovTrend || 0,
      trendUp: (stats?.aovTrend || 0) >= 0,
      breakdown: `Current AOV: ₹${stats?.aovLast30?.toFixed(2) || 0}\nPrevious AOV: ₹${stats?.aovPrev30?.toFixed(2) || 0}\nFrom online orders only`,
    },
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

  const chartConfig = {
    revenue: {
      label: 'Revenue',
      color: '#3B82F6',
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
        {statCards.map((stat, index) => {
          const isFlipped = flippedCard === stat.title;
          return (
            <div 
              key={index} 
              className="cursor-pointer"
              onClick={() => setFlippedCard(isFlipped ? null : stat.title)}
              style={{ perspective: '1000px', height: '180px' }}
            >
              <div 
                className="relative w-full h-full transition-transform duration-600"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
              >
                {/* Front of card */}
                <Card 
                  className="absolute w-full h-full overflow-hidden animate-fade-in border-none shadow-lg"
                  style={{ backfaceVisibility: 'hidden' }}
                >
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
                        {stat.trend >= 0 ? '+' : ''}{stat.trend.toFixed(1)}%
                      </span>
                      <span className="text-muted-foreground">vs previous</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Back of card */}
                <Card 
                  className="absolute w-full h-full overflow-hidden border-none shadow-lg"
                  style={{ 
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-20`} />
                  <CardHeader className="relative">
                    <CardTitle className="text-sm font-semibold">
                      {stat.title} - Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs space-y-1 relative">
                    {stat.breakdown.split('\n').map((line, i) => (
                      <p key={i} className="text-muted-foreground leading-relaxed">{line}</p>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          );
        })}
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
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    dot={{ fill: "#3B82F6", r: 4 }}
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
                    fill="#10B981" 
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
