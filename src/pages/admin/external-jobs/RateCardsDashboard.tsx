import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BarChart3, TrendingUp, TrendingDown, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { useExternalJobRateCards } from "@/hooks/useExternalJobRateCards";

interface OperationCategory {
  category_name: string;
  rate: number;
}

interface Operation {
  operation_name: string;
  categories: OperationCategory[];
  commission_percent?: number;
  round_off?: number;
  adjustment?: number;
  total_rate?: number;
}

const OPERATION_COLORS: Record<string, string> = {
  "Cutting": "hsl(var(--chart-1))",
  "Stitching(Singer)": "hsl(var(--chart-2))",
  "Stitching(Powertable)": "hsl(var(--chart-3))",
  "Checking": "hsl(var(--chart-4))",
  "Ironing": "hsl(var(--chart-5))",
  "Packing": "hsl(142, 76%, 36%)",
};

const RateCardsDashboard = () => {
  const navigate = useNavigate();
  const { data: rateCards, isLoading } = useExternalJobRateCards();
  const [selectedOperation, setSelectedOperation] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Extract all unique operations and categories from rate cards
  const { operations, categoriesByOperation, categoryRatesData } = useMemo(() => {
    const opsSet = new Set<string>();
    const catsByOp: Record<string, Set<string>> = {};
    const ratesData: Record<string, Record<string, { rates: number[]; styleNames: string[] }>> = {};

    rateCards?.forEach((card) => {
      const operationsData = card.operations_data as unknown as Operation[] | null;
      if (!operationsData) return;

      operationsData.forEach((op) => {
        opsSet.add(op.operation_name);
        if (!catsByOp[op.operation_name]) {
          catsByOp[op.operation_name] = new Set();
        }
        if (!ratesData[op.operation_name]) {
          ratesData[op.operation_name] = {};
        }

        op.categories?.forEach((cat) => {
          catsByOp[op.operation_name].add(cat.category_name);
          
          if (!ratesData[op.operation_name][cat.category_name]) {
            ratesData[op.operation_name][cat.category_name] = { rates: [], styleNames: [] };
          }
          ratesData[op.operation_name][cat.category_name].rates.push(cat.rate);
          ratesData[op.operation_name][cat.category_name].styleNames.push(card.style_name);
        });
      });
    });

    return {
      operations: Array.from(opsSet).sort(),
      categoriesByOperation: Object.fromEntries(
        Object.entries(catsByOp).map(([k, v]) => [k, Array.from(v).sort()])
      ),
      categoryRatesData: ratesData,
    };
  }, [rateCards]);

  // Get categories for selected operation
  const availableCategories = useMemo(() => {
    if (selectedOperation === "all") {
      const allCats = new Set<string>();
      Object.values(categoriesByOperation).forEach((cats) => {
        cats.forEach((c) => allCats.add(c));
      });
      return Array.from(allCats).sort();
    }
    return categoriesByOperation[selectedOperation] || [];
  }, [selectedOperation, categoriesByOperation]);

  // Generate chart data for rate comparison
  const chartData = useMemo(() => {
    const data: Array<{
      category: string;
      operation: string;
      min: number;
      max: number;
      avg: number;
      count: number;
      styles: string[];
    }> = [];

    const targetOps = selectedOperation === "all" ? operations : [selectedOperation];

    targetOps.forEach((op) => {
      const targetCats = selectedCategory === "all" 
        ? (categoriesByOperation[op] || [])
        : [selectedCategory];

      targetCats.forEach((cat) => {
        const rateInfo = categoryRatesData[op]?.[cat];
        if (rateInfo && rateInfo.rates.length > 0) {
          const rates = rateInfo.rates;
          data.push({
            category: cat,
            operation: op,
            min: Math.min(...rates),
            max: Math.max(...rates),
            avg: rates.reduce((a, b) => a + b, 0) / rates.length,
            count: rates.length,
            styles: rateInfo.styleNames,
          });
        }
      });
    });

    return data.sort((a, b) => b.max - a.max);
  }, [selectedOperation, selectedCategory, operations, categoriesByOperation, categoryRatesData]);

  // Detailed breakdown data
  const detailedData = useMemo(() => {
    if (selectedOperation === "all" || selectedCategory === "all") return [];

    const rateInfo = categoryRatesData[selectedOperation]?.[selectedCategory];
    if (!rateInfo) return [];

    return rateInfo.rates.map((rate, idx) => ({
      styleName: rateInfo.styleNames[idx],
      rate,
    })).sort((a, b) => b.rate - a.rate);
  }, [selectedOperation, selectedCategory, categoryRatesData]);

  // Stats for selected filters
  const stats = useMemo(() => {
    if (chartData.length === 0) return null;

    const allRates = chartData.flatMap((d) => [d.min, d.max]);
    const lowestRate = Math.min(...allRates);
    const highestRate = Math.max(...allRates);
    const avgRate = chartData.reduce((sum, d) => sum + d.avg, 0) / chartData.length;

    return {
      lowestRate,
      highestRate,
      avgRate,
      totalCategories: chartData.length,
    };
  }, [chartData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/admin/external-jobs/rate-cards")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-primary" />
            Rate Cards Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Compare and analyze rates across operations and categories
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">Operation</label>
              <Select value={selectedOperation} onValueChange={(v) => {
                setSelectedOperation(v);
                setSelectedCategory("all");
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select operation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Operations</SelectItem>
                  {operations.map((op) => (
                    <SelectItem key={op} value={op}>{op}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {availableCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Lowest Rate</p>
                  <p className="text-3xl font-bold text-green-600">₹{stats.lowestRate.toFixed(2)}</p>
                </div>
                <TrendingDown className="h-10 w-10 text-green-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Highest Rate</p>
                  <p className="text-3xl font-bold text-red-600">₹{stats.highestRate.toFixed(2)}</p>
                </div>
                <TrendingUp className="h-10 w-10 text-red-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Average Rate</p>
                  <p className="text-3xl font-bold text-blue-600">₹{stats.avgRate.toFixed(2)}</p>
                </div>
                <BarChart3 className="h-10 w-10 text-blue-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Categories</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.totalCategories}</p>
                </div>
                <Filter className="h-10 w-10 text-purple-500/50" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Rate Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Rate Range Comparison</CardTitle>
          <CardDescription>
            Min, Max, and Average rates for each category
          </CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 120, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" tickFormatter={(v) => `₹${v}`} />
                  <YAxis 
                    type="category" 
                    dataKey="category" 
                    width={110}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-popover border rounded-lg shadow-lg p-3">
                            <p className="font-semibold">{data.category}</p>
                            <p className="text-sm text-muted-foreground">{data.operation}</p>
                            <div className="mt-2 space-y-1 text-sm">
                              <p><span className="text-green-600">Min:</span> ₹{data.min.toFixed(2)}</p>
                              <p><span className="text-red-600">Max:</span> ₹{data.max.toFixed(2)}</p>
                              <p><span className="text-blue-600">Avg:</span> ₹{data.avg.toFixed(2)}</p>
                              <p className="text-muted-foreground">Used in {data.count} rate cards</p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <Bar dataKey="min" fill="hsl(142, 76%, 36%)" name="Min Rate" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="avg" fill="hsl(217, 91%, 60%)" name="Avg Rate" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="max" fill="hsl(0, 84%, 60%)" name="Max Rate" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[400px] flex items-center justify-center text-muted-foreground">
              No data available for the selected filters
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Breakdown - Only when specific operation and category selected */}
      {detailedData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Detailed Rate Breakdown
              <Badge variant="secondary">{selectedOperation}</Badge>
              <Badge variant="outline">{selectedCategory}</Badge>
            </CardTitle>
            <CardDescription>
              Individual rates by style/rate card for {selectedCategory} in {selectedOperation}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={detailedData} margin={{ left: 20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="styleName" 
                    tick={{ fontSize: 11 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tickFormatter={(v) => `₹${v}`} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        const avgRate = detailedData.reduce((sum, d) => sum + d.rate, 0) / detailedData.length;
                        const isAboveAvg = data.rate > avgRate;
                        return (
                          <div className="bg-popover border rounded-lg shadow-lg p-3">
                            <p className="font-semibold">{data.styleName}</p>
                            <p className="text-lg font-bold mt-1">₹{data.rate.toFixed(2)}</p>
                            <Badge 
                              variant={isAboveAvg ? "destructive" : "default"}
                              className="mt-2"
                            >
                              {isAboveAvg ? "Above Average" : "Below Average"}
                            </Badge>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                    {detailedData.map((entry, index) => {
                      const avgRate = detailedData.reduce((sum, d) => sum + d.rate, 0) / detailedData.length;
                      return (
                        <Cell 
                          key={`cell-${index}`}
                          fill={entry.rate > avgRate ? "hsl(0, 84%, 60%)" : "hsl(142, 76%, 36%)"}
                        />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <span className="inline-block w-3 h-3 rounded bg-red-500 mr-2"></span>
                Rates above average - may need review
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                <span className="inline-block w-3 h-3 rounded bg-green-500 mr-2"></span>
                Rates at or below average - competitive
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rate Cards Table for Selected Filters */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Rate Summary Table</CardTitle>
            <CardDescription>
              Quick overview of all categories with their rate ranges
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Category</th>
                    <th className="text-left py-3 px-4 font-medium">Operation</th>
                    <th className="text-right py-3 px-4 font-medium">Min Rate</th>
                    <th className="text-right py-3 px-4 font-medium">Max Rate</th>
                    <th className="text-right py-3 px-4 font-medium">Avg Rate</th>
                    <th className="text-right py-3 px-4 font-medium">Variance</th>
                    <th className="text-center py-3 px-4 font-medium">Records</th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.map((row, idx) => {
                    const variance = row.max - row.min;
                    const variancePercent = row.min > 0 ? ((variance / row.min) * 100) : 0;
                    return (
                      <tr key={idx} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4 font-medium">{row.category}</td>
                        <td className="py-3 px-4">
                          <Badge 
                            variant="outline" 
                            style={{ borderColor: OPERATION_COLORS[row.operation] }}
                          >
                            {row.operation}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right text-green-600 font-medium">
                          ₹{row.min.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right text-red-600 font-medium">
                          ₹{row.max.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right text-blue-600 font-medium">
                          ₹{row.avg.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className={variancePercent > 20 ? "text-amber-600" : "text-muted-foreground"}>
                            ₹{variance.toFixed(2)} ({variancePercent.toFixed(0)}%)
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant="secondary">{row.count}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RateCardsDashboard;
