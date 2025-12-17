import { useNavigate } from 'react-router-dom';
import { Plus, Store, Calendar, TrendingUp, Target, MapPin, Clock, ChevronRight, LogOut, User, Zap, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMarketIntel, INTEREST_LEVELS } from '@/hooks/useMarketIntel';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function MarketIntelHome() {
  const navigate = useNavigate();
  const { user, signOut, isAdmin } = useAuth();
  const { shops, todayVisits, visits, todayLoading, getStats } = useMarketIntel();
  const stats = getStats();

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const getInterestBadge = (level: string | null) => {
    const interest = INTEREST_LEVELS.find(i => i.value === level);
    if (!interest) return null;
    return (
      <Badge className={`${interest.color} text-white`}>
        {interest.label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white sticky top-0 z-10 shadow-lg">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                <Zap className="h-5 w-5 text-yellow-300" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">Feather Market Intel</h1>
                <p className="text-xs text-blue-200">{format(new Date(), 'EEEE, dd MMM yyyy')}</p>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="h-10 w-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center hover:bg-white/30 transition-colors">
                  <span className="text-white font-semibold text-sm">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">Account</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Primary CTA */}
        <Button 
          onClick={() => navigate('/market-intel/new-visit')}
          className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/40"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Shop Visit
        </Button>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-white/80 backdrop-blur border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-slate-900">{stats.todayVisitCount}</p>
                  <p className="text-xs text-slate-500 font-medium">Today's Visits</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <Store className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-slate-900">{stats.totalShops}</p>
                  <p className="text-xs text-slate-500 font-medium">Total Shops</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center shadow-lg shadow-rose-500/30">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-slate-900">{stats.hotLeads}</p>
                  <p className="text-xs text-slate-500 font-medium">Hot Leads</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-slate-900">{stats.ordersThisMonth}</p>
                  <p className="text-xs text-slate-500 font-medium">Month Orders</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className={`grid ${isAdmin ? 'grid-cols-3' : 'grid-cols-2'} gap-3`}>
          <Button 
            variant="outline" 
            className="h-12 justify-start bg-white/80 backdrop-blur border-slate-200 hover:bg-white hover:border-blue-300 transition-all"
            onClick={() => navigate('/market-intel/shops')}
          >
            <Store className="w-4 h-4 mr-2 text-blue-600" />
            <span className="truncate">All Shops</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-12 justify-start bg-white/80 backdrop-blur border-slate-200 hover:bg-white hover:border-blue-300 transition-all"
            onClick={() => navigate('/market-intel/visits')}
          >
            <Calendar className="w-4 h-4 mr-2 text-blue-600" />
            <span className="truncate">History</span>
          </Button>
          {isAdmin && (
            <Button 
              variant="outline" 
              className="h-12 justify-start bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200 hover:border-indigo-400 hover:from-indigo-100 hover:to-purple-100 transition-all"
              onClick={() => navigate('/market-intel/dashboard')}
            >
              <BarChart3 className="w-4 h-4 mr-2 text-indigo-600" />
              <span className="truncate text-indigo-700 font-medium">Dashboard</span>
            </Button>
          )}
        </div>

        {/* Today's Visits */}
        <Card className="bg-white/90 backdrop-blur border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center justify-between">
              <span className="text-slate-800">Today's Visits</span>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">{todayVisits.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {todayLoading ? (
              <div className="p-4 text-center text-slate-500">Loading...</div>
            ) : todayVisits.length === 0 ? (
              <div className="p-6 text-center">
                <div className="h-16 w-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-3">
                  <MapPin className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-sm text-slate-500 mb-2">No visits recorded today</p>
                <Button 
                  variant="link" 
                  className="text-blue-600 font-medium"
                  onClick={() => navigate('/market-intel/new-visit')}
                >
                  Add your first visit →
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {todayVisits.slice(0, 5).map((visit) => (
                  <div 
                    key={visit.id} 
                    className="p-4 flex items-center justify-between hover:bg-blue-50/50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/market-intel/visits/${visit.id}`)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">
                        {visit.market_intel_shops?.shop_name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span className="text-xs text-slate-500">
                          {visit.visit_time?.slice(0, 5)}
                        </span>
                        <span className="text-xs text-slate-300">•</span>
                        <span className="text-xs text-slate-500 capitalize">
                          {visit.visit_purpose?.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getInterestBadge(visit.interest_level)}
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Shops Added */}
        <Card className="bg-white/90 backdrop-blur border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-800">Recently Added Shops</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {shops.length === 0 ? (
              <div className="p-6 text-center">
                <div className="h-16 w-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-3">
                  <Store className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-sm text-slate-500">No shops added yet</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {shops.slice(0, 5).map((shop) => (
                  <div 
                    key={shop.id} 
                    className="p-4 flex items-center justify-between hover:bg-blue-50/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">{shop.shop_name}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {shop.city}
                        <span className="text-slate-300">•</span>
                        <span className="capitalize">{shop.shop_type?.replace('_', ' ')}</span>
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
