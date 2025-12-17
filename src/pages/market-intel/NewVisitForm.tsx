import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Store, MapPin, Package, DollarSign, MessageSquare, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { 
  useMarketIntel, 
  SHOP_TYPES, 
  VISIT_PURPOSES, 
  INTEREST_LEVELS, 
  PAYMENT_TERMS,
  PRODUCT_CATEGORIES,
  PRICE_SEGMENTS,
  CITIES,
  Shop 
} from '@/hooks/useMarketIntel';

const STEPS = [
  { id: 1, title: 'Shop', icon: Store },
  { id: 2, title: 'Visit', icon: MapPin },
  { id: 3, title: 'Products', icon: Package },
  { id: 4, title: 'Business', icon: DollarSign },
  { id: 5, title: 'Notes', icon: MessageSquare },
];

export default function NewVisitForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { shops, createShop, createVisit } = useMarketIntel();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isNewShop, setIsNewShop] = useState(false);
  const [showNewShopDialog, setShowNewShopDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Shop selection/creation
  const [selectedShopId, setSelectedShopId] = useState<string>('');
  const [newShop, setNewShop] = useState({
    shop_name: '',
    owner_name: '',
    phone: '',
    alternate_phone: '',
    email: '',
    address: '',
    city: 'Tiruppur',
    district: '',
    state: 'Tamil Nadu',
    pincode: '',
    landmark: '',
    gst_number: '',
    shop_type: 'retail_showroom' as const,
    established_year: null as number | null,
    shop_size: '',
    employee_count: '',
    monthly_purchase_volume: '',
    current_brands: [] as string[],
    product_categories: [] as string[],
    price_segment: '',
    is_active: true,
  });

  // Visit details
  const [visitData, setVisitData] = useState({
    visit_purpose: 'new_lead' as const,
    interest_level: '' as string,
    products_shown: [] as string[],
    products_interested: [] as string[],
    sample_given: false,
    sample_details: '',
    order_taken: false,
    order_amount: null as number | null,
    payment_collected: false,
    payment_amount: null as number | null,
    payment_terms_preferred: '' as string,
    competitor_products: [] as string[],
    market_feedback: '',
    next_visit_date: '',
    next_action: '',
    visit_outcome: '',
    visit_rating: null as number | null,
    notes: '',
  });

  const [competitorInput, setCompetitorInput] = useState('');
  const [brandInput, setBrandInput] = useState('');

  const toggleProductCategory = (category: string, field: 'products_shown' | 'products_interested' | 'product_categories') => {
    if (field === 'product_categories') {
      setNewShop(prev => ({
        ...prev,
        product_categories: prev.product_categories.includes(category)
          ? prev.product_categories.filter(c => c !== category)
          : [...prev.product_categories, category]
      }));
    } else {
      setVisitData(prev => ({
        ...prev,
        [field]: prev[field].includes(category)
          ? prev[field].filter(c => c !== category)
          : [...prev[field], category]
      }));
    }
  };

  const addCompetitor = () => {
    if (competitorInput.trim()) {
      setVisitData(prev => ({
        ...prev,
        competitor_products: [...prev.competitor_products, competitorInput.trim()]
      }));
      setCompetitorInput('');
    }
  };

  const addBrand = () => {
    if (brandInput.trim()) {
      setNewShop(prev => ({
        ...prev,
        current_brands: [...prev.current_brands, brandInput.trim()]
      }));
      setBrandInput('');
    }
  };

  const handleCreateShop = async () => {
    if (!newShop.shop_name || !newShop.phone || !newShop.address || !newShop.city) {
      toast({ title: 'Please fill required fields', variant: 'destructive' });
      return;
    }

    try {
      const result = await createShop.mutateAsync(newShop);
      setSelectedShopId(result.id);
      setIsNewShop(false);
      setShowNewShopDialog(false);
      toast({ title: 'Shop created successfully' });
    } catch (error) {
      // Error handled in mutation
    }
  };

  const handleSubmit = async () => {
    if (!selectedShopId) {
      toast({ title: 'Please select a shop', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      await createVisit.mutateAsync({
        shop_id: selectedShopId,
        visited_by: user?.id || '',
        visit_date: new Date().toISOString().split('T')[0],
        visit_time: new Date().toTimeString().split(' ')[0],
        visit_purpose: visitData.visit_purpose,
        interest_level: visitData.interest_level || null,
        products_shown: visitData.products_shown.length > 0 ? visitData.products_shown : null,
        products_interested: visitData.products_interested.length > 0 ? visitData.products_interested : null,
        sample_given: visitData.sample_given,
        sample_details: visitData.sample_details || null,
        order_taken: visitData.order_taken,
        order_amount: visitData.order_amount,
        payment_collected: visitData.payment_collected,
        payment_amount: visitData.payment_amount,
        payment_terms_preferred: visitData.payment_terms_preferred || null,
        competitor_products: visitData.competitor_products.length > 0 ? visitData.competitor_products : null,
        competitor_prices: null,
        market_feedback: visitData.market_feedback || null,
        next_visit_date: visitData.next_visit_date || null,
        next_action: visitData.next_action || null,
        visit_outcome: visitData.visit_outcome || null,
        visit_rating: visitData.visit_rating,
        photos: null,
        location_lat: null,
        location_lng: null,
        notes: visitData.notes || null,
      });
      navigate('/market-intel');
    } catch (error) {
      // Error handled in mutation
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedShopId !== '';
      case 2:
        return !!visitData.visit_purpose;
      default:
        return true;
    }
  };

  const selectedShop = shops.find(s => s.id === selectedShopId);

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
              <h1 className="font-semibold text-gray-900">New Shop Visit</h1>
              <p className="text-xs text-gray-500">Step {currentStep} of {STEPS.length}</p>
            </div>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="px-4 pb-3">
          <div className="flex justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    currentStep > step.id 
                      ? 'bg-green-500 text-white' 
                      : currentStep === step.id 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
                </div>
                <span className={`text-xs mt-1 ${currentStep === step.id ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 pb-24">
        {/* Step 1: Shop Selection */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Select or Add Shop</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={selectedShopId} onValueChange={setSelectedShopId}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Search existing shop..." />
                  </SelectTrigger>
                  <SelectContent>
                    {shops.map(shop => (
                      <SelectItem key={shop.id} value={shop.id}>
                        <div className="flex flex-col">
                          <span>{shop.shop_name}</span>
                          <span className="text-xs text-gray-500">{shop.city} • {shop.phone}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex items-center justify-center">
                  <span className="text-sm text-gray-400">or</span>
                </div>

                <Dialog open={showNewShopDialog} onOpenChange={setShowNewShopDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full h-12">
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Shop
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add New Shop</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Shop Name *</Label>
                        <Input
                          value={newShop.shop_name}
                          onChange={e => setNewShop(prev => ({ ...prev, shop_name: e.target.value }))}
                          placeholder="Enter shop name"
                          className="h-12"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Owner Name</Label>
                        <Input
                          value={newShop.owner_name}
                          onChange={e => setNewShop(prev => ({ ...prev, owner_name: e.target.value }))}
                          placeholder="Enter owner name"
                          className="h-12"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Phone *</Label>
                          <Input
                            value={newShop.phone}
                            onChange={e => setNewShop(prev => ({ ...prev, phone: e.target.value }))}
                            placeholder="Phone number"
                            className="h-12"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Alt Phone</Label>
                          <Input
                            value={newShop.alternate_phone}
                            onChange={e => setNewShop(prev => ({ ...prev, alternate_phone: e.target.value }))}
                            placeholder="Alternate"
                            className="h-12"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Shop Type *</Label>
                        <Select 
                          value={newShop.shop_type} 
                          onValueChange={v => setNewShop(prev => ({ ...prev, shop_type: v as any }))}
                        >
                          <SelectTrigger className="h-12">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {SHOP_TYPES.map(type => (
                              <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Address *</Label>
                        <Textarea
                          value={newShop.address}
                          onChange={e => setNewShop(prev => ({ ...prev, address: e.target.value }))}
                          placeholder="Full address"
                          rows={2}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>City *</Label>
                          <Select 
                            value={newShop.city} 
                            onValueChange={v => setNewShop(prev => ({ ...prev, city: v }))}
                          >
                            <SelectTrigger className="h-12">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {CITIES.map(city => (
                                <SelectItem key={city} value={city}>{city}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Pincode</Label>
                          <Input
                            value={newShop.pincode || ''}
                            onChange={e => setNewShop(prev => ({ ...prev, pincode: e.target.value }))}
                            placeholder="Pincode"
                            className="h-12"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Product Categories</Label>
                        <div className="flex flex-wrap gap-2">
                          {PRODUCT_CATEGORIES.map(cat => (
                            <Badge
                              key={cat}
                              variant={newShop.product_categories.includes(cat) ? 'default' : 'outline'}
                              className="cursor-pointer h-8 px-3"
                              onClick={() => toggleProductCategory(cat, 'product_categories')}
                            >
                              {cat}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Price Segment</Label>
                        <Select 
                          value={newShop.price_segment} 
                          onValueChange={v => setNewShop(prev => ({ ...prev, price_segment: v }))}
                        >
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select segment" />
                          </SelectTrigger>
                          <SelectContent>
                            {PRICE_SEGMENTS.map(seg => (
                              <SelectItem key={seg.value} value={seg.value}>{seg.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <Button 
                        onClick={handleCreateShop} 
                        className="w-full h-12"
                        disabled={createShop.isPending}
                      >
                        {createShop.isPending ? 'Creating...' : 'Create Shop'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            {selectedShop && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Store className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{selectedShop.shop_name}</p>
                      <p className="text-sm text-gray-600">{selectedShop.owner_name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {selectedShop.city} • {selectedShop.phone}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Step 2: Visit Details */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Visit Purpose *</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {VISIT_PURPOSES.map(purpose => (
                    <Button
                      key={purpose.value}
                      variant={visitData.visit_purpose === purpose.value ? 'default' : 'outline'}
                      className="h-12 justify-start"
                      onClick={() => setVisitData(prev => ({ ...prev, visit_purpose: purpose.value as any }))}
                    >
                      {purpose.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Interest Level</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  {INTEREST_LEVELS.map(level => (
                    <Button
                      key={level.value}
                      variant={visitData.interest_level === level.value ? 'default' : 'outline'}
                      className={`flex-1 h-12 ${visitData.interest_level === level.value ? level.color : ''}`}
                      onClick={() => setVisitData(prev => ({ ...prev, interest_level: level.value }))}
                    >
                      {level.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Products */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Products Shown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {PRODUCT_CATEGORIES.map(cat => (
                    <Badge
                      key={cat}
                      variant={visitData.products_shown.includes(cat) ? 'default' : 'outline'}
                      className="cursor-pointer h-9 px-3 text-sm"
                      onClick={() => toggleProductCategory(cat, 'products_shown')}
                    >
                      {cat}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Products Interested</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {PRODUCT_CATEGORIES.map(cat => (
                    <Badge
                      key={cat}
                      variant={visitData.products_interested.includes(cat) ? 'default' : 'outline'}
                      className="cursor-pointer h-9 px-3 text-sm"
                      onClick={() => toggleProductCategory(cat, 'products_interested')}
                    >
                      {cat}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Sample Given?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Sample provided to shop</span>
                  <Switch
                    checked={visitData.sample_given}
                    onCheckedChange={v => setVisitData(prev => ({ ...prev, sample_given: v }))}
                  />
                </div>
                {visitData.sample_given && (
                  <Textarea
                    value={visitData.sample_details}
                    onChange={e => setVisitData(prev => ({ ...prev, sample_details: e.target.value }))}
                    placeholder="Sample details (products, sizes, colors)"
                    rows={2}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 4: Business */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Order Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Order Taken?</span>
                  <Switch
                    checked={visitData.order_taken}
                    onCheckedChange={v => setVisitData(prev => ({ ...prev, order_taken: v }))}
                  />
                </div>
                {visitData.order_taken && (
                  <div className="space-y-2">
                    <Label>Order Amount (₹)</Label>
                    <Input
                      type="number"
                      value={visitData.order_amount || ''}
                      onChange={e => setVisitData(prev => ({ ...prev, order_amount: e.target.value ? Number(e.target.value) : null }))}
                      placeholder="Enter amount"
                      className="h-12"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Payment Collection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Payment Collected?</span>
                  <Switch
                    checked={visitData.payment_collected}
                    onCheckedChange={v => setVisitData(prev => ({ ...prev, payment_collected: v }))}
                  />
                </div>
                {visitData.payment_collected && (
                  <div className="space-y-2">
                    <Label>Payment Amount (₹)</Label>
                    <Input
                      type="number"
                      value={visitData.payment_amount || ''}
                      onChange={e => setVisitData(prev => ({ ...prev, payment_amount: e.target.value ? Number(e.target.value) : null }))}
                      placeholder="Enter amount"
                      className="h-12"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Payment Terms Preference</CardTitle>
              </CardHeader>
              <CardContent>
                <Select 
                  value={visitData.payment_terms_preferred} 
                  onValueChange={v => setVisitData(prev => ({ ...prev, payment_terms_preferred: v }))}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select terms" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_TERMS.map(term => (
                      <SelectItem key={term.value} value={term.value}>{term.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Competitor Products Seen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={competitorInput}
                    onChange={e => setCompetitorInput(e.target.value)}
                    placeholder="Enter brand/product"
                    className="h-12"
                    onKeyDown={e => e.key === 'Enter' && addCompetitor()}
                  />
                  <Button onClick={addCompetitor} className="h-12">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {visitData.competitor_products.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {visitData.competitor_products.map((comp, idx) => (
                      <Badge 
                        key={idx} 
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => setVisitData(prev => ({
                          ...prev,
                          competitor_products: prev.competitor_products.filter((_, i) => i !== idx)
                        }))}
                      >
                        {comp} ✕
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 5: Notes & Feedback */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Visit Outcome</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={visitData.visit_outcome}
                  onChange={e => setVisitData(prev => ({ ...prev, visit_outcome: e.target.value }))}
                  placeholder="Summary of what happened..."
                  rows={3}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Market Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={visitData.market_feedback}
                  onChange={e => setVisitData(prev => ({ ...prev, market_feedback: e.target.value }))}
                  placeholder="Any market insights or trends..."
                  rows={3}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Next Steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Next Visit Date</Label>
                  <Input
                    type="date"
                    value={visitData.next_visit_date}
                    onChange={e => setVisitData(prev => ({ ...prev, next_visit_date: e.target.value }))}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Next Action</Label>
                  <Textarea
                    value={visitData.next_action}
                    onChange={e => setVisitData(prev => ({ ...prev, next_action: e.target.value }))}
                    placeholder="What to do next..."
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Visit Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <Button
                      key={rating}
                      variant={visitData.visit_rating === rating ? 'default' : 'outline'}
                      className="flex-1 h-12"
                      onClick={() => setVisitData(prev => ({ ...prev, visit_rating: rating }))}
                    >
                      {rating}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Additional Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={visitData.notes}
                  onChange={e => setVisitData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any other observations..."
                  rows={3}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex gap-3">
        {currentStep > 1 && (
          <Button
            variant="outline"
            onClick={() => setCurrentStep(prev => prev - 1)}
            className="flex-1 h-12"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        )}
        
        {currentStep < STEPS.length ? (
          <Button
            onClick={() => setCurrentStep(prev => prev + 1)}
            disabled={!canProceed()}
            className="flex-1 h-12 bg-blue-600 hover:bg-blue-700"
          >
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 h-12 bg-green-600 hover:bg-green-700"
          >
            <Check className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Saving...' : 'Save Visit'}
          </Button>
        )}
      </div>
    </div>
  );
}
