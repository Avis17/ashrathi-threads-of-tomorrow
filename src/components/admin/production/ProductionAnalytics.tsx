import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Package, DollarSign, Activity } from "lucide-react";

interface ProductionBatch {
  id: string;
  batch_number: string;
  product_id: string;
  target_quantity: number;
  actual_quantity: number;
  total_cost: number;
  cost_per_piece: number;
  status: string;
  products: { name: string; product_code: string };
}

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

export function ProductionAnalytics() {
  const { data: batches, isLoading } = useQuery({
    queryKey: ["production-analytics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("production_batches")
        .select(`
          *,
          products!inner(name, product_code)
        `)
        .eq("status", "completed");
      if (error) throw error;
      return data as ProductionBatch[];
    },
  });

  const stats = batches
    ? {
        totalBatches: batches.length,
        totalProduced: batches.reduce((sum, b) => sum + b.actual_quantity, 0),
        totalCost: batches.reduce((sum, b) => sum + b.total_cost, 0),
        avgCostPerPiece: batches.length > 0
          ? batches.reduce((sum, b) => sum + b.cost_per_piece, 0) / batches.length
          : 0,
      }
    : { totalBatches: 0, totalProduced: 0, totalCost: 0, avgCostPerPiece: 0 };

  const productionByProduct = batches?.reduce((acc, batch) => {
    const key = batch.products.name;
    if (!acc[key]) {
      acc[key] = { name: key, quantity: 0, cost: 0 };
    }
    acc[key].quantity += batch.actual_quantity;
    acc[key].cost += batch.total_cost;
    return acc;
  }, {} as Record<string, { name: string; quantity: number; cost: number }>);

  const productionData = productionByProduct ? Object.values(productionByProduct) : [];

  const costBreakdown = batches?.reduce((acc, batch) => {
    const materialCost = batch.total_cost * 0.6; // Approximation
    const laborCost = batch.total_cost * 0.3;
    const overheadCost = batch.total_cost * 0.1;
    
    if (!acc.material) acc.material = 0;
    if (!acc.labor) acc.labor = 0;
    if (!acc.overhead) acc.overhead = 0;
    
    acc.material += materialCost;
    acc.labor += laborCost;
    acc.overhead += overheadCost;
    
    return acc;
  }, {} as Record<string, number>);

  const pieData = costBreakdown ? [
    { name: "Materials", value: costBreakdown.material || 0 },
    { name: "Labor", value: costBreakdown.labor || 0 },
    { name: "Overhead", value: costBreakdown.overhead || 0 },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Batches</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBatches}</div>
            <p className="text-xs text-muted-foreground">Completed batches</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Produced</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProduced}</div>
            <p className="text-xs text-muted-foreground">Total units produced</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">All production costs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Cost/Piece</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.avgCostPerPiece.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Average unit cost</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      {!isLoading && batches && batches.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Production by Product</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={productionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="quantity" fill="hsl(var(--primary))" name="Quantity" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cost Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ₹${entry.value.toFixed(0)}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Top Products Table */}
      {!isLoading && productionData.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Production Summary by Product</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Total Quantity</TableHead>
                  <TableHead>Total Cost</TableHead>
                  <TableHead>Avg Cost/Unit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productionData
                  .sort((a, b) => b.quantity - a.quantity)
                  .map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>₹{item.cost.toFixed(2)}</TableCell>
                      <TableCell>₹{(item.cost / item.quantity).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}

      {isLoading && (
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Loading analytics...</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && (!batches || batches.length === 0) && (
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">
              No completed production batches yet. Complete some batches to see analytics.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
