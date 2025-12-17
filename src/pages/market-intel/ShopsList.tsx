import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Store, MapPin, Phone, Search, Filter, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useMarketIntel, SHOP_TYPES } from '@/hooks/useMarketIntel';
import { useState } from 'react';

export default function ShopsList() {
  const navigate = useNavigate();
  const { shops, shopsLoading } = useMarketIntel();
  const [search, setSearch] = useState('');

  const filteredShops = shops.filter(shop => 
    shop.shop_name.toLowerCase().includes(search.toLowerCase()) ||
    shop.city.toLowerCase().includes(search.toLowerCase()) ||
    shop.phone.includes(search)
  );

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
              <h1 className="font-semibold text-gray-900">All Shops</h1>
              <p className="text-xs text-gray-500">{shops.length} shops registered</p>
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
              placeholder="Search shops..."
              className="pl-10 h-11"
            />
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {shopsLoading ? (
          <div className="text-center py-10 text-gray-500">Loading...</div>
        ) : filteredShops.length === 0 ? (
          <div className="text-center py-10">
            <Store className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No shops found</p>
          </div>
        ) : (
          filteredShops.map(shop => (
            <Card key={shop.id} className="bg-white">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 truncate">{shop.shop_name}</h3>
                      {shop.is_verified && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                          Verified
                        </Badge>
                      )}
                    </div>
                    {shop.owner_name && (
                      <p className="text-sm text-gray-600 mt-0.5">{shop.owner_name}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {shop.city}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {shop.phone}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {SHOP_TYPES.find(t => t.value === shop.shop_type)?.label || shop.shop_type}
                      </Badge>
                      {shop.product_categories?.slice(0, 2).map(cat => (
                        <Badge key={cat} variant="secondary" className="text-xs">
                          {cat}
                        </Badge>
                      ))}
                    </div>
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
