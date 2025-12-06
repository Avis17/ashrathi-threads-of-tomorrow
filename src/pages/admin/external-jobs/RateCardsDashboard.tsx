import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BarChart3, TrendingUp, TrendingDown, Filter, Calendar, PieChart as PieChartIcon, Activity } from "lucide-react";
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
  AreaChart,
  Area,
  PieChart,
  Pie,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts";
import { useExternalJobRateCards } from "@/hooks/useExternalJobRateCards";
import { format, parseISO } from "date-fns";

interface OperationCategory {
  category_name?: string;
  name?: string;
  job_name?: string;
  rate: number;
}

interface Operation {
  operation_name: string;
  categories?: OperationCategory[];
  commission_percent?: number;
  round_off?: number;
  adjustment?: number;
  total_rate?: number;
}

interface RateWithDate {
  rate: number;
  styleName: string;
  createdAt: string;
  styleId: string;
}

const OPERATION_COLORS: Record<string, string> = {
  "Cutting": "#f97316",
  "Stitching(Singer)": "#8b5cf6",
  "Stitching(Powertable)": "#06b6d4",
  "Checking": "#eab308",
  "Ironing": "#ec4899",
  "Packing": "#22c55e",
};

const PIE_COLORS = ["#8b5cf6", "#06b6d4", "#22c55e", "#f97316", "#ec4899", "#eab308", "#3b82f6", "#ef4444"];

const RateCardsDashboard = () => {
  const navigate = useNavigate();
  const { data: rateCards, isLoading } = useExternalJobRateCards();
  const [selectedOperation, setSelectedOperation] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Extract all unique operations and categories from rate cards with dates
  const { operations, categoriesByOperation, categoryRatesData, rateTrendData, operationDistribution, categoryFrequency } = useMemo(() => {
    const opsSet = new Set<string>();
    const catsByOp: Record<string, Set<string>> = {};
    const ratesData: Record<string, Record<string, RateWithDate[]>> = {};
    const opDistribution: Record<string, number> = {};
    const catFreq: Record<string, number> = {};

    rateCards?.forEach((card) => {
      const operationsData = card.operations_data as unknown as Operation[] | null;
      if (!operationsData || !Array.isArray(operationsData)) return;

      operationsData.forEach((op) => {
        if (!op.operation_name) return;
        
        opsSet.add(op.operation_name);
        opDistribution[op.operation_name] = (opDistribution[op.operation_name] || 0) + 1;
        
        if (!catsByOp[op.operation_name]) {
          catsByOp[op.operation_name] = new Set();
        }
        if (!ratesData[op.operation_name]) {
          ratesData[op.operation_name] = {};
        }

        // Handle categories - can be category_name, name, or job_name
        const categories = op.categories || [];
        categories.forEach((cat) => {
          const categoryName = cat.category_name || cat.name || cat.job_name || '';
          if (!categoryName) return;
          
          catsByOp[op.operation_name].add(categoryName);
          catFreq[categoryName] = (catFreq[categoryName] || 0) + 1;
          
          if (!ratesData[op.operation_name][categoryName]) {
            ratesData[op.operation_name][categoryName] = [];
          }
          ratesData[op.operation_name][categoryName].push({
            rate: cat.rate,
            styleName: card.style_name,
            createdAt: card.created_at,
            styleId: card.style_id,
          });
        });
      });
    });

    // Sort rates by date for trend analysis
    Object.values(ratesData).forEach((cats) => {
      Object.values(cats).forEach((rates) => {
        rates.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      });
    });

    // Operation distribution for pie chart
    const opDistArray = Object.entries(opDistribution).map(([name, value]) => ({
      name,
      value,
      color: OPERATION_COLORS[name] || "#94a3b8",
    }));

    // Category frequency for pie chart
    const catFreqArray = Object.entries(catFreq)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    return {
      operations: Array.from(opsSet).sort(),
      categoriesByOperation: Object.fromEntries(
        Object.entries(catsByOp).map(([k, v]) => [k, Array.from(v).sort()])
      ),
      categoryRatesData: ratesData,
      rateTrendData: ratesData,
      operationDistribution: opDistArray,
      categoryFrequency: catFreqArray,
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
        if (rateInfo && rateInfo.length > 0) {
          const rates = rateInfo.map(r => r.rate);
          data.push({
            category: cat,
            operation: op,
            min: Math.min(...rates),
            max: Math.max(...rates),
            avg: rates.reduce((a, b) => a + b, 0) / rates.length,
            count: rates.length,
            styles: rateInfo.map(r => r.styleName),
          });
        }
      });
    });

    return data.sort((a, b) => b.max - a.max);
  }, [selectedOperation, selectedCategory, operations, categoriesByOperation, categoryRatesData]);

  // Rate trend over time - only when specific operation and category selected
  const trendChartData = useMemo(() => {
    if (selectedOperation === "all" || selectedCategory === "all") return [];

    const rateInfo = rateTrendData[selectedOperation]?.[selectedCategory];
    if (!rateInfo) return [];

    return rateInfo.map((item) => ({
      date: format(parseISO(item.createdAt), "dd MMM yy"),
      fullDate: item.createdAt,
      rate: item.rate,
      styleName: item.styleName,
      styleId: item.styleId,
    }));
  }, [selectedOperation, selectedCategory, rateTrendData]);

  // Detailed breakdown data
  const detailedData = useMemo(() => {
    if (selectedOperation === "all" || selectedCategory === "all") return [];

    const rateInfo = categoryRatesData[selectedOperation]?.[selectedCategory];
    if (!rateInfo) return [];

    return rateInfo.map((item) => ({
      styleName: item.styleName,
      rate: item.rate,
      createdAt: item.createdAt,
    })).sort((a, b) => b.rate - a.rate);
  }, [selectedOperation, selectedCategory, categoryRatesData]);

  // Rate distribution histogram
  const rateDistribution = useMemo(() => {
    if (detailedData.length === 0) return [];

    const rates = detailedData.map(d => d.rate);
    const min = Math.min(...rates);
    const max = Math.max(...rates);
    const bucketSize = (max - min) / 5 || 1;
    
    const buckets: Record<string, number> = {};
    rates.forEach((rate) => {
      const bucketIndex = Math.floor((rate - min) / bucketSize);
      const bucketStart = min + bucketIndex * bucketSize;
      const bucketEnd = bucketStart + bucketSize;
      const key = `₹${bucketStart.toFixed(1)}-${bucketEnd.toFixed(1)}`;
      buckets[key] = (buckets[key] || 0) + 1;
    });

    return Object.entries(buckets).map(([range, count]) => ({
      range,
      count,
    }));
  }, [detailedData]);

  // Stats for selected filters
  const stats = useMemo(() => {
    if (chartData.length === 0) return null;

    const allRates = chartData.flatMap((d) => [d.min, d.max]);
    const lowestRate = Math.min(...allRates);
    const highestRate = Math.max(...allRates);
    const avgRate = chartData.reduce((sum, d) => sum + d.avg, 0) / chartData.length;
    const variance = highestRate - lowestRate;

    return {
      lowestRate,
      highestRate,
      avgRate,
      totalCategories: chartData.length,
      variance,
      variancePercent: lowestRate > 0 ? ((variance / lowestRate) * 100) : 0,
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
          <CardDescription>
            Select an operation and category to see detailed rate trends and analysis
          </CardDescription>
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
          {selectedOperation !== "all" && selectedCategory !== "all" && (
            <div className="mt-4 p-3 bg-primary/10 rounded-lg">
              <p className="text-sm font-medium">
                Showing detailed analysis for: <Badge variant="secondary">{selectedOperation}</Badge> → <Badge variant="outline">{selectedCategory}</Badge>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Lowest Rate</p>
                  <p className="text-2xl font-bold text-green-600">₹{stats.lowestRate.toFixed(2)}</p>
                </div>
                <TrendingDown className="h-8 w-8 text-green-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Highest Rate</p>
                  <p className="text-2xl font-bold text-red-600">₹{stats.highestRate.toFixed(2)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-red-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Average Rate</p>
                  <p className="text-2xl font-bold text-blue-600">₹{stats.avgRate.toFixed(2)}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Variance</p>
                  <p className="text-2xl font-bold text-amber-600">₹{stats.variance.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{stats.variancePercent.toFixed(0)}% spread</p>
                </div>
                <Activity className="h-8 w-8 text-amber-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Categories</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.totalCategories}</p>
                </div>
                <Filter className="h-8 w-8 text-purple-500/50" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Rate Trend Over Time - Only when specific operation and category selected */}
      {trendChartData.length > 0 && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Rate Trend Over Time
              <Badge variant="secondary">{selectedOperation}</Badge>
              <Badge variant="outline">{selectedCategory}</Badge>
            </CardTitle>
            <CardDescription>
              Price variation for {selectedCategory} in {selectedOperation} across {trendChartData.length} rate cards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendChartData} margin={{ left: 20, right: 20, top: 10, bottom: 10 }}>
                  <defs>
                    <linearGradient id="rateGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 11 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    tickFormatter={(v) => `₹${v}`}
                    domain={['dataMin - 0.5', 'dataMax + 0.5']}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        const avgRate = trendChartData.reduce((sum, d) => sum + d.rate, 0) / trendChartData.length;
                        const diff = data.rate - avgRate;
                        const diffPercent = (diff / avgRate) * 100;
                        return (
                          <div className="bg-popover border rounded-lg shadow-lg p-3">
                            <p className="font-semibold">{data.styleName}</p>
                            <p className="text-xs text-muted-foreground">{data.styleId}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {format(parseISO(data.fullDate), "dd MMM yyyy, HH:mm")}
                            </p>
                            <p className="text-xl font-bold mt-2">₹{data.rate.toFixed(2)}</p>
                            <div className={`text-sm mt-1 ${diff > 0 ? 'text-red-500' : 'text-green-500'}`}>
                              {diff > 0 ? '+' : ''}{diff.toFixed(2)} ({diffPercent.toFixed(1)}%) vs avg
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="rate" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    fill="url(#rateGradient)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="rate" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <p className="text-sm text-muted-foreground">Min Rate</p>
                <p className="text-lg font-bold text-green-600">
                  ₹{Math.min(...trendChartData.map(d => d.rate)).toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <p className="text-sm text-muted-foreground">Avg Rate</p>
                <p className="text-lg font-bold text-blue-600">
                  ₹{(trendChartData.reduce((sum, d) => sum + d.rate, 0) / trendChartData.length).toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-red-500/10 rounded-lg">
                <p className="text-sm text-muted-foreground">Max Rate</p>
                <p className="text-lg font-bold text-red-600">
                  ₹{Math.max(...trendChartData.map(d => d.rate)).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Distribution Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rate Distribution Histogram - Only when specific selection */}
        {rateDistribution.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Rate Distribution
              </CardTitle>
              <CardDescription>
                How rates are distributed across rate cards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={rateDistribution}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="range" tick={{ fontSize: 10 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-popover border rounded-lg shadow-lg p-3">
                              <p className="font-semibold">{data.range}</p>
                              <p className="text-lg font-bold mt-1">{data.count} rate cards</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Operation Usage Distribution */}
        {operationDistribution.length > 0 && (selectedOperation === "all" || selectedCategory === "all") && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5" />
                Operation Usage
              </CardTitle>
              <CardDescription>
                Distribution of operations across all rate cards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={operationDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {operationDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-popover border rounded-lg shadow-lg p-3">
                              <p className="font-semibold">{data.name}</p>
                              <p className="text-lg font-bold mt-1">{data.value} uses</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Top Categories Chart */}
      {categoryFrequency.length > 0 && (selectedOperation === "all" || selectedCategory === "all") && (
        <Card>
          <CardHeader>
            <CardTitle>Top Categories by Usage</CardTitle>
            <CardDescription>
              Most frequently used categories across all rate cards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryFrequency} layout="vertical" margin={{ left: 100 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={90} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-popover border rounded-lg shadow-lg p-3">
                            <p className="font-semibold">{data.name}</p>
                            <p className="text-lg font-bold mt-1">Used {data.value} times</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {categoryFrequency.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
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
                  <Bar dataKey="min" fill="#22c55e" name="Min Rate" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="avg" fill="#3b82f6" name="Avg Rate" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="max" fill="#ef4444" name="Max Rate" radius={[0, 4, 4, 0]} />
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
              Individual rates by style/rate card - Red bars indicate rates above average
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
                        const diff = data.rate - avgRate;
                        return (
                          <div className="bg-popover border rounded-lg shadow-lg p-3">
                            <p className="font-semibold">{data.styleName}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(parseISO(data.createdAt), "dd MMM yyyy")}
                            </p>
                            <p className="text-xl font-bold mt-2">₹{data.rate.toFixed(2)}</p>
                            <Badge 
                              variant={isAboveAvg ? "destructive" : "default"}
                              className="mt-2"
                            >
                              {isAboveAvg ? `+₹${diff.toFixed(2)} Above Avg` : `₹${Math.abs(diff).toFixed(2)} Below Avg`}
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
                          fill={entry.rate > avgRate ? "#ef4444" : "#22c55e"}
                        />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 p-4 bg-muted/50 rounded-lg flex gap-6">
              <p className="text-sm text-muted-foreground">
                <span className="inline-block w-3 h-3 rounded bg-red-500 mr-2"></span>
                Rates above average - may need review
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="inline-block w-3 h-3 rounded bg-green-500 mr-2"></span>
                Rates at or below average - competitive
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rate Cards Table */}
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
                            style={{ borderColor: OPERATION_COLORS[row.operation], color: OPERATION_COLORS[row.operation] }}
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
                          <span className={variancePercent > 20 ? "text-amber-600 font-medium" : "text-muted-foreground"}>
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
