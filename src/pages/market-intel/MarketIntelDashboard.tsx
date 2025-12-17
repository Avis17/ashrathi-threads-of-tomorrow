import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  ArrowLeft, 
  TrendingUp, 
  Store, 
  Users, 
  DollarSign, 
  Target, 
  Calendar,
  MapPin,
  Package,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Flame,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ShoppingBag,
  Shirt,
  Baby,
  Heart,
  Eye,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, parseISO, isWithinInterval } from 'date-fns';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  Legend
} from 'recharts';
import { INTEREST_LEVELS, VISIT_PURPOSES, SHOP_TYPES, CITIES, PRODUCT_CATEGORIES, PRICE_SEGMENTS } from '@/hooks/useMarketIntel';

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export default function MarketIntelDashboard() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  // Fetch all visits
  const { data: visits = [], isLoading: visitsLoading } = useQuery({
    queryKey: ['market-intel-all-visits-dashboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('market_intel_visits')
        .select('*, market_intel_shops(*)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch all shops
  const { data: shops = [], isLoading: shopsLoading } = useQuery({
    queryKey: ['market-intel-all-shops-dashboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('market_intel_shops')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <ShieldCheck className="w-16 h-16 mx-auto text-slate-400 mb-4" />
            <h2 className="text-xl font-bold mb-2">Admin Access Required</h2>
            <p className="text-slate-600 mb-4">You need admin privileges to view this dashboard.</p>
            <Button onClick={() => navigate('/market-intel')}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate stats
  const today = new Date();
  const thisMonth = { start: startOfMonth(today), end: endOfMonth(today) };
  const last30Days = { start: subDays(today, 30), end: today };

  const todayStr = format(today, 'yyyy-MM-dd');
  const todayVisits = visits.filter(v => v.visit_date === todayStr);
  const monthVisits = visits.filter(v => {
    if (!v.visit_date) return false;
    const date = parseISO(v.visit_date);
    return isWithinInterval(date, thisMonth);
  });

  const totalOrders = visits.filter(v => v.order_taken).length;
  const totalOrderValue = visits.filter(v => v.order_taken).reduce((sum, v) => sum + (v.order_amount || 0), 0);
  const monthOrderValue = monthVisits.filter(v => v.order_taken).reduce((sum, v) => sum + (v.order_amount || 0), 0);
  const totalSamples = visits.filter(v => v.sample_given).length;
  const hotLeads = visits.filter(v => v.interest_level === 'hot').length;
  const warmLeads = visits.filter(v => v.interest_level === 'warm').length;

  // Interest level distribution
  const interestData = INTEREST_LEVELS.map(level => ({
    name: level.label.replace(' 🔥', ''),
    value: visits.filter(v => v.interest_level === level.value).length,
    color: level.color.replace('bg-', '').replace('-500', '')
  })).filter(d => d.value > 0);

  // Visit purpose distribution
  const purposeData = VISIT_PURPOSES.map(purpose => ({
    name: purpose.label,
    value: visits.filter(v => v.visit_purpose === purpose.value).length
  })).filter(d => d.value > 0);

  // Shop type distribution
  const shopTypeData = SHOP_TYPES.map(type => ({
    name: type.label,
    value: shops.filter(s => s.shop_type === type.value).length
  })).filter(d => d.value > 0);

  // City distribution
  const cityData = CITIES.slice(0, -1).map(city => ({
    name: city,
    shops: shops.filter(s => s.city === city).length,
    visits: visits.filter(v => v.market_intel_shops?.city === city).length
  })).filter(d => d.shops > 0 || d.visits > 0).sort((a, b) => b.visits - a.visits).slice(0, 8);

  // Daily visits for last 14 days
  const last14Days = eachDayOfInterval({ start: subDays(today, 13), end: today });
  const dailyVisitsData = last14Days.map(day => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const dayVisits = visits.filter(v => v.visit_date === dayStr);
    return {
      date: format(day, 'dd MMM'),
      visits: dayVisits.length,
      orders: dayVisits.filter(v => v.order_taken).length,
      orderValue: dayVisits.filter(v => v.order_taken).reduce((sum, v) => sum + (v.order_amount || 0), 0)
    };
  });

  // Top performing cities by order value
  const cityOrderData = [...new Set(visits.map(v => v.market_intel_shops?.city))].filter(Boolean).map(city => ({
    city,
    orderValue: visits.filter(v => v.market_intel_shops?.city === city && v.order_taken).reduce((sum, v) => sum + (v.order_amount || 0), 0),
    orders: visits.filter(v => v.market_intel_shops?.city === city && v.order_taken).length
  })).sort((a, b) => b.orderValue - a.orderValue).slice(0, 6);

  // Conversion rates
  const conversionRate = visits.length > 0 ? ((totalOrders / visits.length) * 100).toFixed(1) : '0';
  const sampleConversionRate = totalSamples > 0 
    ? ((visits.filter(v => v.sample_given && v.order_taken).length / totalSamples) * 100).toFixed(1) 
    : '0';

  // SECTOR CATEGORIZATION
  const sectorMapping: Record<string, string> = {
    'Leggings': 'Women',
    'Sports Bras': 'Women',
    'Coord Sets': 'Women',
    'Nightwear': 'Women',
    'Track Pants': 'Men',
    'T-Shirts': 'Men',
    'Joggers': 'Men',
    'Shorts': 'Men',
    'Kids Wear': 'Kids',
    'Innerwear': 'Unisex',
  };

  // Products shown vs interested analysis
  const allProductsShown = visits.flatMap(v => v.products_shown || []);
  const allProductsInterested = visits.flatMap(v => v.products_interested || []);
  
  const productShowCount: Record<string, number> = {};
  const productInterestCount: Record<string, number> = {};
  
  allProductsShown.forEach(p => { productShowCount[p] = (productShowCount[p] || 0) + 1; });
  allProductsInterested.forEach(p => { productInterestCount[p] = (productInterestCount[p] || 0) + 1; });
  
  const productComparisonData = PRODUCT_CATEGORIES.map(cat => ({
    name: cat,
    shown: productShowCount[cat] || 0,
    interested: productInterestCount[cat] || 0,
    conversionRate: productShowCount[cat] > 0 
      ? Math.round((productInterestCount[cat] || 0) / productShowCount[cat] * 100) 
      : 0
  })).filter(d => d.shown > 0 || d.interested > 0);

  // Sector breakdown from shop categories
  const shopSectorCounts: Record<string, number> = { 'Women': 0, 'Men': 0, 'Kids': 0, 'Unisex': 0 };
  shops.forEach(shop => {
    (shop.product_categories || []).forEach(cat => {
      const sector = sectorMapping[cat];
      if (sector) shopSectorCounts[sector]++;
    });
  });
  
  const sectorData = Object.entries(shopSectorCounts)
    .filter(([_, count]) => count > 0)
    .map(([name, value]) => ({ name, value }));

  // Products interested from visits - sector breakdown
  const interestSectorCounts: Record<string, number> = { 'Women': 0, 'Men': 0, 'Kids': 0, 'Unisex': 0 };
  allProductsInterested.forEach(product => {
    const sector = sectorMapping[product];
    if (sector) interestSectorCounts[sector]++;
  });
  
  const interestSectorData = Object.entries(interestSectorCounts)
    .filter(([_, count]) => count > 0)
    .map(([name, value]) => ({ name, value }));

  // Competitor analysis - brands they currently stock
  const allCurrentBrands = shops.flatMap(s => s.current_brands || []);
  const brandCount: Record<string, number> = {};
  allCurrentBrands.forEach(brand => {
    if (brand && brand.trim()) {
      brandCount[brand.trim()] = (brandCount[brand.trim()] || 0) + 1;
    }
  });
  
  const topCompetitorBrands = Object.entries(brandCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  // Competitor products mentioned in visits
  const allCompetitorProducts = visits.flatMap(v => v.competitor_products || []);
  const competitorProductCount: Record<string, number> = {};
  allCompetitorProducts.forEach(product => {
    if (product && product.trim()) {
      competitorProductCount[product.trim()] = (competitorProductCount[product.trim()] || 0) + 1;
    }
  });
  
  const topCompetitorProducts = Object.entries(competitorProductCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([name, count]) => ({ name, count }));

  // Price segment distribution
  const priceSegmentData = PRICE_SEGMENTS.map(segment => ({
    name: segment.label.split(' ')[0],
    value: shops.filter(s => s.price_segment === segment.value).length
  })).filter(d => d.value > 0);

  const isLoading = visitsLoading || shopsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl mx-auto mb-4 animate-pulse" />
          <p className="text-white/70">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/market-intel')}
              className="text-white/80 hover:text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-bold text-lg">Market Intelligence Dashboard</h1>
              <p className="text-xs text-white/70">Analytics & Insights</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 pb-8">
        {/* Primary Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-100 font-medium">Total Visits</p>
                  <p className="text-3xl font-bold">{visits.length}</p>
                  <p className="text-xs text-blue-200 mt-1">{todayVisits.length} today</p>
                </div>
                <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500 to-green-600 text-white border-0 shadow-xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-emerald-100 font-medium">Total Shops</p>
                  <p className="text-3xl font-bold">{shops.length}</p>
                  <p className="text-xs text-emerald-200 mt-1">{shops.filter(s => s.is_verified).length} verified</p>
                </div>
                <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Store className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white border-0 shadow-xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-amber-100 font-medium">Total Orders</p>
                  <p className="text-3xl font-bold">{totalOrders}</p>
                  <p className="text-xs text-amber-200 mt-1">₹{(totalOrderValue / 1000).toFixed(1)}K value</p>
                </div>
                <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-rose-500 to-red-600 text-white border-0 shadow-xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-rose-100 font-medium">Hot Leads</p>
                  <p className="text-3xl font-bold">{hotLeads}</p>
                  <p className="text-xs text-rose-200 mt-1">{warmLeads} warm</p>
                </div>
                <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Flame className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Conversion Metrics */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-white">{conversionRate}%</p>
              <p className="text-xs text-slate-400">Order Rate</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-white">{sampleConversionRate}%</p>
              <p className="text-xs text-slate-400">Sample→Order</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-white">{totalSamples}</p>
              <p className="text-xs text-slate-400">Samples Given</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Tabs */}
        <Tabs defaultValue="trends" className="w-full">
          <TabsList className="w-full bg-slate-800/50 border-slate-700 grid grid-cols-4">
            <TabsTrigger value="trends" className="data-[state=active]:bg-blue-600 text-xs">Trends</TabsTrigger>
            <TabsTrigger value="products" className="data-[state=active]:bg-blue-600 text-xs">Products</TabsTrigger>
            <TabsTrigger value="distribution" className="data-[state=active]:bg-blue-600 text-xs">Distribution</TabsTrigger>
            <TabsTrigger value="geography" className="data-[state=active]:bg-blue-600 text-xs">Geography</TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-4 mt-4">
            {/* Daily Visits Trend */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                  Daily Visits (Last 14 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={dailyVisitsData}>
                    <defs>
                      <linearGradient id="visitGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: 8 }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="visits" stroke="#3b82f6" fill="url(#visitGradient)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Orders Trend */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  Orders vs Visits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={dailyVisitsData}>
                    <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: 8 }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Bar dataKey="visits" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Visits" />
                    <Bar dataKey="orders" fill="#10b981" radius={[4, 4, 0, 0]} name="Orders" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="distribution" className="space-y-4 mt-4">
            {/* Interest Level Distribution */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-white flex items-center gap-2">
                  <Target className="w-4 h-4 text-rose-400" />
                  Interest Level Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={interestData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {interestData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: 8 }}
                    />
                    <Legend 
                      wrapperStyle={{ fontSize: 10 }}
                      formatter={(value) => <span className="text-slate-300">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Visit Purpose Distribution */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-white flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-purple-400" />
                  Visit Purpose Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={purposeData} layout="vertical">
                    <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 9 }} axisLine={false} tickLine={false} width={80} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: 8 }}
                    />
                    <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Shop Type Distribution */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-white flex items-center gap-2">
                  <Store className="w-4 h-4 text-cyan-400" />
                  Shop Type Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={shopTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {shopTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: 8 }}
                    />
                    <Legend 
                      wrapperStyle={{ fontSize: 10 }}
                      formatter={(value) => <span className="text-slate-300">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="geography" className="space-y-4 mt-4">
            {/* City Performance */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  City-wise Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={cityData}>
                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 9 }} axisLine={false} tickLine={false} angle={-45} textAnchor="end" height={60} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: 8 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Bar dataKey="shops" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Shops" />
                    <Bar dataKey="visits" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Visits" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Cities by Order Value */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-400" />
                  Top Cities by Order Value
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {cityOrderData.map((city, index) => (
                  <div key={city.city} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-white truncate">{city.city}</p>
                        <p className="text-sm font-bold text-emerald-400">₹{city.orderValue.toLocaleString()}</p>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-1.5 mt-1">
                        <div 
                          className="bg-gradient-to-r from-emerald-500 to-green-400 h-1.5 rounded-full"
                          style={{ width: `${(city.orderValue / (cityOrderData[0]?.orderValue || 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {cityOrderData.length === 0 && (
                  <p className="text-center text-slate-500 py-4">No order data available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products & Competitors Tab */}
          <TabsContent value="products" className="space-y-4 mt-4">
            {/* Sector Breakdown */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs text-white flex items-center gap-2">
                    <Shirt className="w-4 h-4 text-pink-400" />
                    Shop Categories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={140}>
                    <PieChart>
                      <Pie
                        data={sectorData}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={55}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {sectorData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={['#ec4899', '#3b82f6', '#f59e0b', '#8b5cf6'][index % 4]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: 8 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-1 justify-center mt-2">
                    {sectorData.map((d, i) => (
                      <span key={d.name} className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: ['#ec4899', '#3b82f6', '#f59e0b', '#8b5cf6'][i % 4] + '33', color: ['#ec4899', '#3b82f6', '#f59e0b', '#8b5cf6'][i % 4] }}>
                        {d.name}: {d.value}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs text-white flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-400" />
                    Interest by Sector
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={140}>
                    <PieChart>
                      <Pie
                        data={interestSectorData}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={55}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {interestSectorData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={['#f43f5e', '#0ea5e9', '#eab308', '#a855f7'][index % 4]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: 8 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-1 justify-center mt-2">
                    {interestSectorData.map((d, i) => (
                      <span key={d.name} className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: ['#f43f5e', '#0ea5e9', '#eab308', '#a855f7'][i % 4] + '33', color: ['#f43f5e', '#0ea5e9', '#eab308', '#a855f7'][i % 4] }}>
                        {d.name}: {d.value}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Products Shown vs Interested */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-white flex items-center gap-2">
                  <Eye className="w-4 h-4 text-cyan-400" />
                  Products: Shown vs Interested
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={productComparisonData} layout="vertical">
                    <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 9 }} axisLine={false} tickLine={false} width={70} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: 8 }}
                      formatter={(value, name) => [value, name === 'shown' ? 'Shown' : 'Interested']}
                    />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Bar dataKey="shown" fill="#06b6d4" radius={[0, 4, 4, 0]} name="Shown" />
                    <Bar dataKey="interested" fill="#10b981" radius={[0, 4, 4, 0]} name="Interested" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Product Interest with Conversion */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-white flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-emerald-400" />
                  Product Interest Rankings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {productComparisonData.sort((a, b) => b.interested - a.interested).slice(0, 6).map((product, index) => (
                  <div key={product.name} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                      index === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-600' :
                      index === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-500' :
                      index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-800' :
                      'bg-slate-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-white truncate">{product.name}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-emerald-400">{product.interested} interested</span>
                          <Badge variant="outline" className="text-[10px] border-cyan-500/30 text-cyan-400">
                            {product.conversionRate}% conv
                          </Badge>
                        </div>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-1.5 mt-1">
                        <div 
                          className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-1.5 rounded-full"
                          style={{ width: `${Math.min(100, (product.interested / (productComparisonData[0]?.interested || 1)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {productComparisonData.length === 0 && (
                  <p className="text-center text-slate-500 py-4 text-sm">No product data available</p>
                )}
              </CardContent>
            </Card>

            {/* Competitor Analysis */}
            <Card className="bg-gradient-to-br from-rose-900/50 to-orange-900/50 border-rose-700/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-rose-400" />
                  Competitor Brands in Market
                </CardTitle>
              </CardHeader>
              <CardContent>
                {topCompetitorBrands.length > 0 ? (
                  <div className="space-y-2">
                    {topCompetitorBrands.map((brand, index) => (
                      <div key={brand.name} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400 text-xs font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1 flex items-center justify-between">
                          <p className="text-sm text-white truncate">{brand.name}</p>
                          <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30 text-xs">
                            {brand.count} shops
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-rose-300/70 py-4 text-sm">No competitor data recorded</p>
                )}
              </CardContent>
            </Card>

            {/* Competitor Products Mentioned */}
            {topCompetitorProducts.length > 0 && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-white flex items-center gap-2">
                    <Package className="w-4 h-4 text-orange-400" />
                    Competitor Products Mentioned
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {topCompetitorProducts.map((product) => (
                      <Badge key={product.name} variant="outline" className="border-orange-500/30 text-orange-300 px-3 py-1">
                        {product.name} <span className="ml-1 text-orange-400 font-bold">({product.count})</span>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Price Segment Distribution */}
            {priceSegmentData.length > 0 && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-white flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-400" />
                    Shop Price Segments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={150}>
                    <BarChart data={priceSegmentData}>
                      <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: 8 }} />
                      <Bar dataKey="value" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Month Summary */}
        <Card className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white border-0 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              This Month Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-xs text-indigo-200">Visits</p>
                <p className="text-2xl font-bold">{monthVisits.length}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-xs text-indigo-200">Orders</p>
                <p className="text-2xl font-bold">{monthVisits.filter(v => v.order_taken).length}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-xs text-indigo-200">Order Value</p>
                <p className="text-2xl font-bold">₹{(monthOrderValue / 1000).toFixed(1)}K</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-xs text-indigo-200">New Shops</p>
                <p className="text-2xl font-bold">
                  {shops.filter(s => {
                    if (!s.created_at) return false;
                    const date = parseISO(s.created_at);
                    return isWithinInterval(date, thisMonth);
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admin Badge */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 py-2">
          <ShieldCheck className="w-4 h-4" />
          <span>Admin Dashboard</span>
        </div>
      </div>
    </div>
  );
}