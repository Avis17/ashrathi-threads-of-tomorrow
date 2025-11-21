import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { TrendingUp, Calendar, Package, IndianRupee } from 'lucide-react';
import { format, startOfYear, eachMonthOfInterval, endOfYear } from 'date-fns';

interface CustomerAnalyticsProps {
  customerId: string;
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#f97316'];

export function CustomerAnalytics({ customerId }: CustomerAnalyticsProps) {
  const { data: invoices } = useQuery({
    queryKey: ['customer-analytics', customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          invoice_items(*)
        `)
        .eq('customer_id', customerId);
      if (error) throw error;
      return data;
    },
  });

  // Monthly revenue data
  const monthlyData = (() => {
    if (!invoices) return [];
    const currentYear = new Date().getFullYear();
    const months = eachMonthOfInterval({
      start: startOfYear(new Date(currentYear, 0)),
      end: endOfYear(new Date(currentYear, 0)),
    });

    return months.map(month => {
      const monthInvoices = invoices.filter(inv => {
        const invDate = new Date(inv.invoice_date);
        return invDate.getMonth() === month.getMonth() && invDate.getFullYear() === currentYear;
      });
      
      return {
        month: format(month, 'MMM'),
        revenue: monthInvoices.reduce((sum, inv) => sum + Number(inv.total_amount), 0),
        count: monthInvoices.length,
      };
    });
  })();

  // Payment status distribution
  const paymentStatusData = (() => {
    if (!invoices) return [];
    const statusCounts = invoices.reduce((acc: any, inv) => {
      acc[inv.status] = (acc[inv.status] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
    }));
  })();

  // Category-wise purchases
  const categoryData = (() => {
    if (!invoices) return [];
    const categories: any = {};
    
    invoices.forEach(invoice => {
      invoice.invoice_items?.forEach((item: any) => {
        // Extract category from HSN code (simple grouping)
        const category = item.hsn_code?.substring(0, 2) || 'Other';
        categories[category] = (categories[category] || 0) + Number(item.amount);
      });
    });

    return Object.entries(categories)
      .map(([category, amount]) => ({
        category: `HSN ${category}`,
        amount,
      }))
      .sort((a, b) => (b.amount as number) - (a.amount as number))
      .slice(0, 6);
  })();

  // Yearly comparison
  const yearlyData = (() => {
    if (!invoices) return [];
    const yearCounts: any = {};
    
    invoices.forEach(inv => {
      const year = new Date(inv.invoice_date).getFullYear();
      if (!yearCounts[year]) {
        yearCounts[year] = { year, revenue: 0, orders: 0 };
      }
      yearCounts[year].revenue += Number(inv.total_amount);
      yearCounts[year].orders += 1;
    });

    return Object.values(yearCounts).sort((a: any, b: any) => a.year - b.year);
  })();

  return (
    <div className="space-y-6">
      {/* Monthly Revenue Trend */}
      <Card className="animate-fade-in border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Monthly Revenue Trend ({new Date().getFullYear()})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Revenue']}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#6366f1"
                strokeWidth={3}
                dot={{ fill: '#6366f1', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Status Distribution */}
        <Card className="animate-fade-in border-l-4 border-l-purple-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IndianRupee className="h-5 w-5 text-purple-500" />
              Payment Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {paymentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category-wise Purchases */}
        <Card className="animate-fade-in border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-green-500" />
              Category-wise Purchases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="category" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Amount']}
                />
                <Bar dataKey="amount" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Yearly Comparison */}
      <Card className="animate-fade-in border-l-4 border-l-orange-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-orange-500" />
            Year-over-Year Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={yearlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" />
              <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" />
              <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="revenue" fill="#f97316" name="Revenue (₹)" radius={[8, 8, 0, 0]} />
              <Bar yAxisId="right" dataKey="orders" fill="#06b6d4" name="Orders" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Monthly Order Count */}
      <Card className="animate-fade-in border-l-4 border-l-pink-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-pink-500" />
            Monthly Order Volume ({new Date().getFullYear()})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: any) => [value, 'Orders']}
              />
              <Bar dataKey="count" fill="#ec4899" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
