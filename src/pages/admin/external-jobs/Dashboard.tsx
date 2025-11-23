import { useNavigate } from "react-router-dom";
import { ArrowLeft, DollarSign, FileText, TrendingUp, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useExternalJobOrderStats } from "@/hooks/useExternalJobOrders";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6366f1'];

const Dashboard = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useExternalJobOrderStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const paymentStatusData = [
    { name: 'Paid', value: stats.statusCounts.paid || 0, color: '#10b981' },
    { name: 'Partial', value: stats.statusCounts.partial || 0, color: '#f59e0b' },
    { name: 'Unpaid', value: stats.statusCounts.unpaid || 0, color: '#ef4444' },
  ];

  const jobStatusData = [
    { name: 'Completed', value: stats.jobStatusCounts.completed || 0 },
    { name: 'In Progress', value: stats.jobStatusCounts.in_progress || 0 },
    { name: 'Pending', value: stats.jobStatusCounts.pending || 0 },
    { name: 'Cancelled', value: stats.jobStatusCounts.cancelled || 0 },
  ];

  const collectionRate = stats.totalAmount > 0 
    ? ((stats.paidAmount / stats.totalAmount) * 100).toFixed(1)
    : "0.0";

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

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="text-2xl font-bold">₹{stats.totalAmount.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Amount Received</p>
              <p className="text-2xl font-bold">₹{stats.paidAmount.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-500/10 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Amount</p>
              <p className="text-2xl font-bold">₹{stats.pendingAmount.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Commission</p>
              <p className="text-2xl font-bold text-purple-600">₹{stats.totalCommission.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <p className="text-2xl font-bold">{stats.totalOrders}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Payment Status Distribution</h3>
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
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Job Status Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={jobStatusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Collection Rate</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Overall Collection Rate</span>
            <span className="text-2xl font-bold text-primary">{collectionRate}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-4">
            <div
              className="bg-primary h-4 rounded-full transition-all"
              style={{ width: `${collectionRate}%` }}
            />
          </div>
          <div className="grid grid-cols-3 gap-4 pt-4">
            <div>
              <p className="text-sm text-muted-foreground">Billed</p>
              <p className="text-xl font-semibold">₹{stats.totalAmount.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Collected</p>
              <p className="text-xl font-semibold text-green-600">₹{stats.paidAmount.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Outstanding</p>
              <p className="text-xl font-semibold text-orange-600">₹{stats.pendingAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;