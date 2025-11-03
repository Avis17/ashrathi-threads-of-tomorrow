import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { TrendingUp, TrendingDown, Target, AlertCircle } from "lucide-react";

interface AnalyticsData {
  id: string;
  batch_id: string;
  metric_type: string;
  predicted_value: number;
  actual_value: number;
  deviation_percent: number;
  production_batches: {
    batch_number: string;
    color: string | null;
    products: {
      name: string;
    };
  };
}

export const PredictionAnalytics = () => {
  const { data: analytics = [], isLoading } = useQuery({
    queryKey: ["production-analytics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("production_analytics")
        .select(`
          *,
          production_batches (
            batch_number,
            color,
            products (name)
          )
        `)
        .order("recorded_at", { ascending: false });
      if (error) throw error;
      return data as AnalyticsData[];
    },
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading analytics...</div>;
  }

  const quantityMetrics = analytics.filter((a) => a.metric_type === "quantity");
  const costMetrics = analytics.filter((a) => a.metric_type === "total_cost");
  const efficiencyMetrics = analytics.filter((a) => a.metric_type === "efficiency");

  const avgQuantityDeviation = quantityMetrics.length > 0
    ? quantityMetrics.reduce((sum, m) => sum + Math.abs(m.deviation_percent), 0) / quantityMetrics.length
    : 0;

  const avgCostDeviation = costMetrics.length > 0
    ? costMetrics.reduce((sum, m) => sum + Math.abs(m.deviation_percent), 0) / costMetrics.length
    : 0;

  const avgAccuracy = 100 - ((avgQuantityDeviation + avgCostDeviation) / 2);

  const mostEfficientBatch = efficiencyMetrics.length > 0
    ? efficiencyMetrics.reduce((max, m) => (m.actual_value > max.actual_value ? m : max))
    : null;

  const predictionAccuracyTrend = quantityMetrics.slice(0, 10).reverse().map((m, idx) => ({
    batch: m.production_batches.batch_number.slice(-6),
    accuracy: 100 - Math.abs(m.deviation_percent),
    deviation: m.deviation_percent,
  }));

  const costComparisonData = costMetrics.slice(0, 10).map((m) => ({
    batch: m.production_batches.batch_number.slice(-6),
    predicted: m.predicted_value,
    actual: m.actual_value,
    product: m.production_batches.products.name,
  }));

  const quantityComparisonData = quantityMetrics.slice(0, 10).map((m) => ({
    batch: m.production_batches.batch_number.slice(-6),
    predicted: m.predicted_value,
    actual: m.actual_value,
    color: m.production_batches.color || "N/A",
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Prediction Analytics</h2>
        <p className="text-muted-foreground">
          Track prediction accuracy and efficiency across production batches
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Avg Prediction Accuracy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgAccuracy.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all batches
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Quantity Deviation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              {avgQuantityDeviation > 5 ? (
                <AlertCircle className="h-5 w-5 text-destructive" />
              ) : (
                <Target className="h-5 w-5 text-green-600" />
              )}
              {avgQuantityDeviation.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Average deviation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Cost Deviation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              {avgCostDeviation > 10 ? (
                <TrendingUp className="h-5 w-5 text-destructive" />
              ) : (
                <TrendingDown className="h-5 w-5 text-green-600" />
              )}
              {avgCostDeviation.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Average cost variance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Most Efficient Batch</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {mostEfficientBatch ? mostEfficientBatch.production_batches.batch_number.slice(-6) : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {mostEfficientBatch ? `${mostEfficientBatch.actual_value.toFixed(1)}% efficiency` : "No data"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Prediction Accuracy Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {predictionAccuracyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={predictionAccuracyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="batch" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="accuracy" stroke="#10b981" name="Accuracy %" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-muted-foreground">No prediction data available</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Predicted vs Actual Quantity</CardTitle>
          </CardHeader>
          <CardContent>
            {quantityComparisonData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={quantityComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="batch" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="predicted" fill="#6366f1" name="Predicted" />
                  <Bar dataKey="actual" fill="#10b981" name="Actual" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-muted-foreground">No quantity data available</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Predicted vs Actual Cost</CardTitle>
          </CardHeader>
          <CardContent>
            {costComparisonData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={costComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="batch" />
                  <YAxis />
                  <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="predicted" fill="#f59e0b" name="Predicted Cost" />
                  <Bar dataKey="actual" fill="#ef4444" name="Actual Cost" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-muted-foreground">No cost data available</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Color-wise Efficiency</CardTitle>
          </CardHeader>
          <CardContent>
            {quantityMetrics.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Color</TableHead>
                    <TableHead>Batches</TableHead>
                    <TableHead>Avg Deviation</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(
                    quantityMetrics.reduce((acc, m) => {
                      const color = m.production_batches.color || "Unknown";
                      if (!acc[color]) acc[color] = [];
                      acc[color].push(m.deviation_percent);
                      return acc;
                    }, {} as Record<string, number[]>)
                  ).map(([color, deviations]) => {
                    const avgDev = deviations.reduce((sum, d) => sum + Math.abs(d), 0) / deviations.length;
                    return (
                      <TableRow key={color}>
                        <TableCell>
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-primary/10 text-sm">
                            {color}
                          </span>
                        </TableCell>
                        <TableCell>{deviations.length}</TableCell>
                        <TableCell>{avgDev.toFixed(1)}%</TableCell>
                        <TableCell>
                          {avgDev < 5 ? (
                            <Badge variant="default">Excellent</Badge>
                          ) : avgDev < 10 ? (
                            <Badge variant="secondary">Good</Badge>
                          ) : (
                            <Badge variant="destructive">Needs Attention</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 text-muted-foreground">No color data available</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Batch Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Batch</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Metric</TableHead>
                  <TableHead>Predicted</TableHead>
                  <TableHead>Actual</TableHead>
                  <TableHead>Deviation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.slice(0, 15).map((metric) => (
                  <TableRow key={metric.id}>
                    <TableCell className="font-mono text-sm">
                      {metric.production_batches.batch_number}
                    </TableCell>
                    <TableCell>{metric.production_batches.products.name}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-primary/10 text-xs">
                        {metric.production_batches.color || "N/A"}
                      </span>
                    </TableCell>
                    <TableCell className="capitalize">{metric.metric_type.replace("_", " ")}</TableCell>
                    <TableCell>
                      {metric.metric_type === "total_cost"
                        ? `₹${metric.predicted_value.toLocaleString()}`
                        : metric.predicted_value.toFixed(0)}
                    </TableCell>
                    <TableCell>
                      {metric.metric_type === "total_cost"
                        ? `₹${metric.actual_value.toLocaleString()}`
                        : metric.actual_value.toFixed(0)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          Math.abs(metric.deviation_percent) < 5
                            ? "default"
                            : Math.abs(metric.deviation_percent) < 10
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {metric.deviation_percent > 0 ? "+" : ""}
                        {metric.deviation_percent.toFixed(1)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No analytics data available. Complete some production batches to see predictions.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};