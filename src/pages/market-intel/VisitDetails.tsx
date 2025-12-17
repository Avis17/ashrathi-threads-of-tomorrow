import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  Store, 
  User, 
  Package, 
  DollarSign, 
  MessageSquare,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Star,
  Building2,
  Mail,
  FileText,
  Target,
  Users,
  ShieldCheck,
  Edit3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { INTEREST_LEVELS, VISIT_PURPOSES, PAYMENT_TERMS, SHOP_TYPES } from '@/hooks/useMarketIntel';

export default function VisitDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const { data: visit, isLoading, error } = useQuery({
    queryKey: ['market-intel-visit', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('market_intel_visits')
        .select('*, market_intel_shops(*)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Check if user can view/edit this visit
  const canEdit = isAdmin || (visit && visit.visited_by === user?.id);

  const getInterestConfig = (level: string | null) => {
    const interest = INTEREST_LEVELS.find(i => i.value === level);
    return interest || { label: 'Unknown', color: 'bg-gray-500' };
  };

  const getPurposeLabel = (purpose: string) => {
    const found = VISIT_PURPOSES.find(p => p.value === purpose);
    return found?.label || purpose;
  };

  const getPaymentTermsLabel = (terms: string | null) => {
    if (!terms) return null;
    const found = PAYMENT_TERMS.find(p => p.value === terms);
    return found?.label || terms;
  };

  const getShopTypeLabel = (type: string) => {
    const found = SHOP_TYPES.find(t => t.value === type);
    return found?.label || type;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl mx-auto mb-4 animate-bounce" />
          <p className="text-slate-600 font-medium">Loading visit details...</p>
        </div>
      </div>
    );
  }

  if (error || !visit) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-rose-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-red-200 shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Access Denied</h2>
            <p className="text-slate-600 mb-6">
              You don't have permission to view this visit or it doesn't exist.
            </p>
            <Button onClick={() => navigate('/market-intel/visits')} className="w-full">
              Go Back to Visits
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const shop = visit.market_intel_shops;
  const interest = getInterestConfig(visit.interest_level);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate('/market-intel/visits')}
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="font-bold text-lg">Visit Details</h1>
                <p className="text-xs text-white/70">
                  {visit.visit_date ? format(new Date(visit.visit_date), 'EEEE, dd MMMM yyyy') : '-'}
                </p>
              </div>
            </div>
            {canEdit && (
              <Button 
                variant="secondary" 
                size="sm"
                className="bg-white/10 hover:bg-white/20 text-white border-0"
              >
                <Edit3 className="w-4 h-4 mr-1" />
                Edit
              </Button>
            )}
          </div>
        </div>

        {/* Hero Card */}
        <div className="px-4 pb-6">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white shadow-2xl">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg">
                  <Store className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-xl truncate">{shop?.shop_name}</h2>
                  <p className="text-white/80 text-sm">{shop?.owner_name || 'Owner not specified'}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={`${interest.color} text-white shadow-md`}>
                      {interest.label}
                    </Badge>
                    <Badge variant="outline" className="border-white/30 text-white/90 capitalize">
                      {visit.visit_purpose?.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 pb-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-white shadow-md border-0 overflow-hidden">
            <CardContent className="p-3 text-center">
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-xs text-slate-500">Date</p>
              <p className="font-bold text-slate-900 text-sm">
                {visit.visit_date ? format(new Date(visit.visit_date), 'dd MMM') : '-'}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-md border-0 overflow-hidden">
            <CardContent className="p-3 text-center">
              <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-xs text-slate-500">Time</p>
              <p className="font-bold text-slate-900 text-sm">
                {visit.visit_time?.slice(0, 5) || '-'}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-md border-0 overflow-hidden">
            <CardContent className="p-3 text-center">
              <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Star className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-xs text-slate-500">Rating</p>
              <p className="font-bold text-slate-900 text-sm">
                {visit.visit_rating ? `${visit.visit_rating}/5` : '-'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Shop Information */}
        <Card className="bg-white shadow-lg border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              Shop Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <Store className="w-3 h-3" /> Shop Type
                </p>
                <p className="font-medium text-slate-900 text-sm capitalize">
                  {getShopTypeLabel(shop?.shop_type || '')}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Location
                </p>
                <p className="font-medium text-slate-900 text-sm">{shop?.city}</p>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-slate-400" />
                <span className="text-slate-900">{shop?.phone}</span>
              </div>
              {shop?.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-900">{shop.email}</span>
                </div>
              )}
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                <span className="text-slate-900">{shop?.address}</span>
              </div>
            </div>
            {shop?.product_categories && shop.product_categories.length > 0 && (
              <>
                <Separator />
                <div>
                  <p className="text-xs text-slate-500 mb-2">Product Categories</p>
                  <div className="flex flex-wrap gap-1.5">
                    {shop.product_categories.map((cat: string) => (
                      <Badge key={cat} variant="secondary" className="text-xs">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Visit Purpose & Outcome */}
        <Card className="bg-white shadow-lg border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-600" />
              Visit Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-slate-500">Purpose</p>
                <p className="font-semibold text-slate-900 capitalize">
                  {getPurposeLabel(visit.visit_purpose)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-500">Interest Level</p>
                <Badge className={`${interest.color} text-white`}>
                  {interest.label}
                </Badge>
              </div>
            </div>
            {visit.visit_outcome && (
              <>
                <Separator />
                <div>
                  <p className="text-xs text-slate-500 mb-1">Outcome</p>
                  <p className="text-sm text-slate-800 bg-slate-50 p-3 rounded-lg">
                    {visit.visit_outcome}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Products Section */}
        {((visit.products_shown && visit.products_shown.length > 0) || 
          (visit.products_interested && visit.products_interested.length > 0)) && (
          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="w-5 h-5 text-green-600" />
                Products
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {visit.products_shown && visit.products_shown.length > 0 && (
                <div>
                  <p className="text-xs text-slate-500 mb-2">Products Shown</p>
                  <div className="flex flex-wrap gap-1.5">
                    {visit.products_shown.map((product: string) => (
                      <Badge key={product} variant="outline" className="text-xs">
                        {product}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {visit.products_interested && visit.products_interested.length > 0 && (
                <div>
                  <p className="text-xs text-slate-500 mb-2">Interested In</p>
                  <div className="flex flex-wrap gap-1.5">
                    {visit.products_interested.map((product: string) => (
                      <Badge key={product} className="bg-green-100 text-green-700 text-xs">
                        {product}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Business Details */}
        <Card className="bg-white shadow-lg border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-amber-600" />
              Business Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                <div className="flex items-center gap-2 mb-2">
                  {visit.order_taken ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-slate-400" />
                  )}
                  <span className="text-xs font-medium text-slate-600">Order</span>
                </div>
                <p className="font-bold text-lg text-slate-900">
                  {visit.order_taken ? `₹${visit.order_amount?.toLocaleString() || 0}` : 'No Order'}
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  {visit.payment_collected ? (
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-slate-400" />
                  )}
                  <span className="text-xs font-medium text-slate-600">Payment</span>
                </div>
                <p className="font-bold text-lg text-slate-900">
                  {visit.payment_collected ? `₹${visit.payment_amount?.toLocaleString() || 0}` : 'No Payment'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-slate-500">Sample Given</p>
                <div className="flex items-center gap-2">
                  {visit.sample_given ? (
                    <Badge className="bg-purple-100 text-purple-700">Yes</Badge>
                  ) : (
                    <Badge variant="secondary">No</Badge>
                  )}
                </div>
                {visit.sample_details && (
                  <p className="text-xs text-slate-600">{visit.sample_details}</p>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-500">Payment Terms</p>
                <p className="font-medium text-sm text-slate-900">
                  {getPaymentTermsLabel(visit.payment_terms_preferred) || '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Competitor & Market Feedback */}
        {(visit.competitor_products?.length > 0 || visit.market_feedback) && (
          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-rose-600" />
                Market Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {visit.competitor_products && visit.competitor_products.length > 0 && (
                <div>
                  <p className="text-xs text-slate-500 mb-2">Competitor Products</p>
                  <div className="flex flex-wrap gap-1.5">
                    {visit.competitor_products.map((comp: string, i: number) => (
                      <Badge key={i} variant="outline" className="text-xs border-rose-200 text-rose-700">
                        {comp}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {visit.market_feedback && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Market Feedback</p>
                  <p className="text-sm text-slate-800 bg-slate-50 p-3 rounded-lg">
                    {visit.market_feedback}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Next Actions */}
        {(visit.next_visit_date || visit.next_action) && (
          <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xl border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-white">
                <TrendingUp className="w-5 h-5" />
                Follow Up
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {visit.next_visit_date && (
                <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
                  <Calendar className="w-5 h-5 text-white/80" />
                  <div>
                    <p className="text-xs text-white/70">Next Visit</p>
                    <p className="font-semibold">
                      {format(new Date(visit.next_visit_date), 'dd MMMM yyyy')}
                    </p>
                  </div>
                </div>
              )}
              {visit.next_action && (
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-xs text-white/70 mb-1">Action Item</p>
                  <p className="text-sm">{visit.next_action}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        {visit.notes && (
          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-slate-600" />
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-700 whitespace-pre-wrap bg-slate-50 p-4 rounded-lg">
                {visit.notes}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Admin Badge */}
        {isAdmin && (
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 py-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Viewing as Admin</span>
          </div>
        )}
      </div>
    </div>
  );
}