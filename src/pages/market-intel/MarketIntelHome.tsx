import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Store, Calendar, TrendingUp, Target, MapPin, Clock, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMarketIntel, INTEREST_LEVELS } from '@/hooks/useMarketIntel';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';

export default function MarketIntelHome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { shops, todayVisits, visits, todayLoading, getStats } = useMarketIntel();
  const stats = getStats();

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Feather Market Intel</h1>
              <p className="text-sm text-gray-500">{format(new Date(), 'EEEE, dd MMM yyyy')}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-sm">
                {user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Primary CTA */}
        <Button 
          onClick={() => navigate('/market-intel/new-visit')}
          className="w-full h-14 text-lg font-semibold bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Shop Visit
        </Button>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.todayVisitCount}</p>
                  <p className="text-xs text-gray-500">Today's Visits</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Store className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalShops}</p>
                  <p className="text-xs text-gray-500">Total Shops</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                  <Target className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.hotLeads}</p>
                  <p className="text-xs text-gray-500">Hot Leads</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.ordersThisMonth}</p>
                  <p className="text-xs text-gray-500">Month Orders</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            className="h-12 justify-start"
            onClick={() => navigate('/market-intel/shops')}
          >
            <Store className="w-4 h-4 mr-2" />
            View All Shops
          </Button>
          <Button 
            variant="outline" 
            className="h-12 justify-start"
            onClick={() => navigate('/market-intel/visits')}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Visit History
          </Button>
        </div>

        {/* Today's Visits */}
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center justify-between">
              <span>Today's Visits</span>
              <Badge variant="secondary">{todayVisits.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {todayLoading ? (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : todayVisits.length === 0 ? (
              <div className="p-6 text-center">
                <MapPin className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">No visits recorded today</p>
                <Button 
                  variant="link" 
                  className="mt-1 text-blue-600"
                  onClick={() => navigate('/market-intel/new-visit')}
                >
                  Add your first visit
                </Button>
              </div>
            ) : (
              <div className="divide-y">
                {todayVisits.slice(0, 5).map((visit) => (
                  <div 
                    key={visit.id} 
                    className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/market-intel/visits/${visit.id}`)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {visit.market_intel_shops?.shop_name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {visit.visit_time?.slice(0, 5)}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500 capitalize">
                          {visit.visit_purpose?.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getInterestBadge(visit.interest_level)}
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Shops Added */}
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Recently Added Shops</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {shops.length === 0 ? (
              <div className="p-6 text-center">
                <Store className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">No shops added yet</p>
              </div>
            ) : (
              <div className="divide-y">
                {shops.slice(0, 5).map((shop) => (
                  <div 
                    key={shop.id} 
                    className="p-4 flex items-center justify-between hover:bg-gray-50"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{shop.shop_name}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {shop.city}
                        <span className="text-gray-400">•</span>
                        <span className="capitalize">{shop.shop_type?.replace('_', ' ')}</span>
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
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
