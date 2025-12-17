import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Shop {
  id: string;
  shop_name: string;
  owner_name: string | null;
  phone: string;
  alternate_phone: string | null;
  email: string | null;
  address: string;
  city: string;
  district: string | null;
  state: string;
  pincode: string | null;
  landmark: string | null;
  gst_number: string | null;
  shop_type: string;
  established_year: number | null;
  shop_size: string | null;
  employee_count: string | null;
  monthly_purchase_volume: string | null;
  current_brands: string[] | null;
  product_categories: string[] | null;
  price_segment: string | null;
  is_verified: boolean;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Visit {
  id: string;
  shop_id: string;
  visited_by: string;
  visit_date: string;
  visit_time: string;
  visit_purpose: string;
  interest_level: string | null;
  products_shown: string[] | null;
  products_interested: string[] | null;
  sample_given: boolean;
  sample_details: string | null;
  order_taken: boolean;
  order_amount: number | null;
  payment_collected: boolean;
  payment_amount: number | null;
  payment_terms_preferred: string | null;
  competitor_products: string[] | null;
  competitor_prices: Record<string, any> | null;
  market_feedback: string | null;
  next_visit_date: string | null;
  next_action: string | null;
  visit_outcome: string | null;
  visit_rating: number | null;
  photos: string[] | null;
  location_lat: number | null;
  location_lng: number | null;
  notes: string | null;
  is_synced: boolean;
  created_at: string;
  market_intel_shops?: Shop;
}

export const SHOP_TYPES = [
  { value: 'retail_showroom', label: 'Retail Showroom' },
  { value: 'wholesale_dealer', label: 'Wholesale Dealer' },
  { value: 'distributor', label: 'Distributor' },
  { value: 'boutique', label: 'Boutique' },
  { value: 'department_store', label: 'Department Store' },
  { value: 'online_seller', label: 'Online Seller' },
  { value: 'factory_outlet', label: 'Factory Outlet' },
  { value: 'other', label: 'Other' },
];

export const VISIT_PURPOSES = [
  { value: 'new_lead', label: 'New Lead' },
  { value: 'follow_up', label: 'Follow Up' },
  { value: 'order_collection', label: 'Order Collection' },
  { value: 'payment_collection', label: 'Payment Collection' },
  { value: 'complaint', label: 'Complaint Resolution' },
  { value: 'market_survey', label: 'Market Survey' },
  { value: 'competitor_analysis', label: 'Competitor Analysis' },
  { value: 'other', label: 'Other' },
];

export const INTEREST_LEVELS = [
  { value: 'hot', label: 'Hot 🔥', color: 'bg-red-500' },
  { value: 'warm', label: 'Warm', color: 'bg-orange-500' },
  { value: 'cold', label: 'Cold', color: 'bg-blue-500' },
  { value: 'not_interested', label: 'Not Interested', color: 'bg-gray-500' },
];

export const PAYMENT_TERMS = [
  { value: 'advance', label: 'Advance Payment' },
  { value: 'cod', label: 'Cash on Delivery' },
  { value: 'credit_7', label: '7 Days Credit' },
  { value: 'credit_15', label: '15 Days Credit' },
  { value: 'credit_30', label: '30 Days Credit' },
  { value: 'credit_45', label: '45 Days Credit' },
  { value: 'credit_60', label: '60 Days Credit' },
];

export const PRODUCT_CATEGORIES = [
  'Leggings',
  'Track Pants',
  'T-Shirts',
  'Sports Bras',
  'Shorts',
  'Joggers',
  'Coord Sets',
  'Nightwear',
  'Kids Wear',
  'Innerwear',
];

export const PRICE_SEGMENTS = [
  { value: 'budget', label: 'Budget (₹100-300)' },
  { value: 'mid', label: 'Mid Range (₹300-600)' },
  { value: 'premium', label: 'Premium (₹600-1000)' },
  { value: 'luxury', label: 'Luxury (₹1000+)' },
];

export const CITIES = [
  'Tiruppur',
  'Coimbatore',
  'Erode',
  'Salem',
  'Chennai',
  'Madurai',
  'Trichy',
  'Bangalore',
  'Hyderabad',
  'Mumbai',
  'Delhi',
  'Kolkata',
  'Other',
];

export function useMarketIntel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all shops
  const { data: shops = [], isLoading: shopsLoading, error: shopsError } = useQuery({
    queryKey: ['market-intel-shops'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('market_intel_shops')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Shop[];
    },
  });

  // Fetch visits with shop details
  const { data: visits = [], isLoading: visitsLoading, error: visitsError } = useQuery({
    queryKey: ['market-intel-visits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('market_intel_visits')
        .select('*, market_intel_shops(*)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Visit[];
    },
  });

  // Fetch today's visits
  const { data: todayVisits = [], isLoading: todayLoading } = useQuery({
    queryKey: ['market-intel-visits-today'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('market_intel_visits')
        .select('*, market_intel_shops(*)')
        .eq('visit_date', today)
        .order('visit_time', { ascending: false });
      if (error) throw error;
      return data as Visit[];
    },
  });

  // Create shop
  const createShop = useMutation({
    mutationFn: async (shop: Partial<Shop>) => {
      const { data: { user } } = await supabase.auth.getUser();
      const insertData = {
        shop_name: shop.shop_name!,
        phone: shop.phone!,
        address: shop.address!,
        city: shop.city!,
        state: shop.state || 'Tamil Nadu',
        shop_type: shop.shop_type as any,
        owner_name: shop.owner_name || null,
        alternate_phone: shop.alternate_phone || null,
        email: shop.email || null,
        district: shop.district || null,
        pincode: shop.pincode || null,
        landmark: shop.landmark || null,
        gst_number: shop.gst_number || null,
        established_year: shop.established_year || null,
        shop_size: shop.shop_size || null,
        employee_count: shop.employee_count || null,
        monthly_purchase_volume: shop.monthly_purchase_volume || null,
        current_brands: shop.current_brands || null,
        product_categories: shop.product_categories || null,
        price_segment: shop.price_segment || null,
        is_active: shop.is_active ?? true,
        created_by: user?.id,
      };
      const { data, error } = await supabase
        .from('market_intel_shops')
        .insert(insertData)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['market-intel-shops'] });
      toast({ title: 'Shop added successfully' });
    },
    onError: (error: any) => {
      if (error.message?.includes('duplicate')) {
        toast({ title: 'Shop with this phone already exists in this city', variant: 'destructive' });
      } else {
        toast({ title: 'Failed to add shop', description: error.message, variant: 'destructive' });
      }
    },
  });

  // Create visit
  const createVisit = useMutation({
    mutationFn: async (visit: Partial<Visit>) => {
      const insertData = {
        shop_id: visit.shop_id!,
        visited_by: visit.visited_by!,
        visit_date: visit.visit_date!,
        visit_time: visit.visit_time!,
        visit_purpose: visit.visit_purpose as any,
        interest_level: visit.interest_level as any || null,
        products_shown: visit.products_shown || null,
        products_interested: visit.products_interested || null,
        sample_given: visit.sample_given ?? false,
        sample_details: visit.sample_details || null,
        order_taken: visit.order_taken ?? false,
        order_amount: visit.order_amount || null,
        payment_collected: visit.payment_collected ?? false,
        payment_amount: visit.payment_amount || null,
        payment_terms_preferred: visit.payment_terms_preferred as any || null,
        competitor_products: visit.competitor_products || null,
        competitor_prices: visit.competitor_prices || null,
        market_feedback: visit.market_feedback || null,
        next_visit_date: visit.next_visit_date || null,
        next_action: visit.next_action || null,
        visit_outcome: visit.visit_outcome || null,
        visit_rating: visit.visit_rating || null,
        photos: visit.photos || null,
        location_lat: visit.location_lat || null,
        location_lng: visit.location_lng || null,
        notes: visit.notes || null,
      };
      const { data, error } = await supabase
        .from('market_intel_visits')
        .insert(insertData)
        .select('*, market_intel_shops(*)')
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['market-intel-visits'] });
      queryClient.invalidateQueries({ queryKey: ['market-intel-visits-today'] });
      toast({ title: 'Visit recorded successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Failed to record visit', description: error.message, variant: 'destructive' });
    },
  });

  // Update shop
  const updateShop = useMutation({
    mutationFn: async ({ id, ...shop }: Partial<Shop> & { id: string }) => {
      const updateData: Record<string, any> = {};
      if (shop.shop_name !== undefined) updateData.shop_name = shop.shop_name;
      if (shop.owner_name !== undefined) updateData.owner_name = shop.owner_name;
      if (shop.phone !== undefined) updateData.phone = shop.phone;
      if (shop.address !== undefined) updateData.address = shop.address;
      if (shop.city !== undefined) updateData.city = shop.city;
      if (shop.shop_type !== undefined) updateData.shop_type = shop.shop_type;
      
      const { data, error } = await supabase
        .from('market_intel_shops')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['market-intel-shops'] });
      toast({ title: 'Shop updated successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Failed to update shop', description: error.message, variant: 'destructive' });
    },
  });

  // Get stats
  const getStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const thisMonth = new Date().toISOString().slice(0, 7);

    const todayVisitCount = visits.filter(v => v.visit_date === today).length;
    const monthVisitCount = visits.filter(v => v.visit_date?.startsWith(thisMonth)).length;
    const hotLeads = visits.filter(v => v.interest_level === 'hot').length;
    const ordersThisMonth = visits.filter(v => v.visit_date?.startsWith(thisMonth) && v.order_taken).length;
    const totalOrderValue = visits
      .filter(v => v.visit_date?.startsWith(thisMonth) && v.order_taken)
      .reduce((sum, v) => sum + (v.order_amount || 0), 0);

    return {
      totalShops: shops.length,
      todayVisitCount,
      monthVisitCount,
      hotLeads,
      ordersThisMonth,
      totalOrderValue,
    };
  };

  return {
    shops,
    visits,
    todayVisits,
    shopsLoading,
    visitsLoading,
    todayLoading,
    shopsError,
    visitsError,
    createShop,
    createVisit,
    updateShop,
    getStats,
  };
}
