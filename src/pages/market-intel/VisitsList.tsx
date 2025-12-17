import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MapPin, Search, ChevronRight, TrendingUp, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useMarketIntel, INTEREST_LEVELS, VISIT_PURPOSES } from '@/hooks/useMarketIntel';
import { useState } from 'react';
import { format } from 'date-fns';

export default function VisitsList() {
  const navigate = useNavigate();
  const { visits, visitsLoading } = useMarketIntel();
  const [search, setSearch] = useState('');

  const filteredVisits = visits.filter(visit => 
    visit.market_intel_shops?.shop_name?.toLowerCase().includes(search.toLowerCase()) ||
    visit.market_intel_shops?.city?.toLowerCase().includes(search.toLowerCase())
  );

  const getInterestBadge = (level: string | null) => {
    const interest = INTEREST_LEVELS.find(i => i.value === level);
    if (!interest) return null;
    return (
      <Badge className={`${interest.color} text-white text-xs`}>
        {interest.label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/market-intel')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-semibold text-gray-900">Visit History</h1>
              <p className="text-xs text-gray-500">{visits.length} total visits</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search visits..."
              className="pl-10 h-11"
            />
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {visitsLoading ? (
          <div className="text-center py-10 text-gray-500">Loading...</div>
        ) : filteredVisits.length === 0 ? (
          <div className="text-center py-10">
            <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No visits found</p>
          </div>
        ) : (
          filteredVisits.map(visit => (
            <Card 
              key={visit.id} 
              className="bg-white cursor-pointer hover:shadow-lg transition-all duration-200 active:scale-[0.98]"
              onClick={() => navigate(`/market-intel/visits/${visit.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {visit.market_intel_shops?.shop_name}
                      </h3>
                      {getInterestBadge(visit.interest_level)}
                    </div>
                    
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {visit.visit_date ? format(new Date(visit.visit_date), 'dd MMM yyyy') : '-'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {visit.visit_time?.slice(0, 5)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {visit.market_intel_shops?.city}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs capitalize">
                        {visit.visit_purpose?.replace('_', ' ')}
                      </Badge>
                      {visit.order_taken && (
                        <Badge className="bg-green-100 text-green-700 text-xs">
                          Order: ₹{visit.order_amount?.toLocaleString()}
                        </Badge>
                      )}
                      {visit.sample_given && (
                        <Badge variant="secondary" className="text-xs">
                          <Package className="w-3 h-3 mr-1" />
                          Sample
                        </Badge>
                      )}
                    </div>

                    {visit.visit_outcome && (
                      <p className="text-xs text-gray-500 mt-2 line-clamp-1">
                        {visit.visit_outcome}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
