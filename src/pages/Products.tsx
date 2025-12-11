import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Maximize, ShoppingCart, Plus, Minus, Check, Shield, Award, Sparkles, PackageSearch, ChevronRight, Star } from "lucide-react";
import ImageZoomDialog from "@/components/ImageZoomDialog";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductImageLoader } from "@/components/product/ProductImageLoader";
import noDataImage from "@/assets/no-data.png";

// Model showcase images
import heroModelWoman1 from "@/assets/hero-model-woman-1.jpg";
import heroModelMan1 from "@/assets/hero-model-man-1.jpg";
import heroModelKid1 from "@/assets/hero-model-kid-1.jpg";
import heroModelWoman2 from "@/assets/hero-model-woman-2.jpg";
import heroModelMan2 from "@/assets/hero-model-man-2.jpg";
import heroModelKid2 from "@/assets/hero-model-kid-2.jpg";
import heroModelWoman3 from "@/assets/hero-model-woman-3.jpg";
import heroModelMan3 from "@/assets/hero-model-man-3.jpg";
import heroModelKid3 from "@/assets/hero-model-kid-3.jpg";
import heroModelWoman4 from "@/assets/hero-model-woman-4.jpg";

// Leggings collection images
import leggingsYogaPose from "@/assets/leggings-carousel/yoga-pose.jpg";
import leggingsStanding from "@/assets/leggings-carousel/standing-pose.jpg";
import leggingsOffice from "@/assets/leggings-carousel/office-style.jpg";
import leggingsStreet from "@/assets/leggings-carousel/street-style.jpg";
import leggingsCozy from "@/assets/leggings-carousel/cozy-home.jpg";
import leggingsProfessional from "@/assets/leggings-carousel/professional-look.jpg";
import leggingsSidePocket from "@/assets/leggings-carousel/side-pocket.jpg";
import leggingsPhonePocket from "@/assets/leggings-carousel/phone-pocket.jpg";
import leggingsAthletic from "@/assets/leggings-carousel/athletic-pose.jpg";
import leggingsSeated from "@/assets/leggings-carousel/seated-stretch.jpg";

// Hero image
import productsHero from "@/assets/products-showcase.jpg";

const PLACEHOLDER_IMAGE = '/placeholder.svg';

const modelShowcaseImages = [
  { src: heroModelWoman1, alt: "Women's Fashion Collection", category: "Women" },
  { src: heroModelMan1, alt: "Men's Fashion Collection", category: "Men" },
  { src: heroModelKid1, alt: "Kids' Fashion Collection", category: "Kids" },
  { src: heroModelWoman2, alt: "Women's Premium Loungewear", category: "Women" },
  { src: heroModelMan2, alt: "Men's Active Wear", category: "Men" },
  { src: heroModelKid2, alt: "Kids' Colorful Outfits", category: "Kids" },
  { src: heroModelWoman3, alt: "Women's Trendy Styles", category: "Women" },
  { src: heroModelMan3, alt: "Men's Casual Collection", category: "Men" },
  { src: heroModelKid3, alt: "Kids' Comfortable Wear", category: "Kids" },
  { src: heroModelWoman4, alt: "Women's Casual Comfort", category: "Women" },
];

const leggingsCollection = [
  { src: leggingsYogaPose, alt: "Premium Leggings - Yoga Pose", title: "Yoga & Wellness", description: "Maximum flexibility for your practice" },
  { src: leggingsStanding, alt: "Premium Leggings - Standing Studio", title: "Studio Performance", description: "Premium support for every move" },
  { src: leggingsSidePocket, alt: "Premium Leggings - Side Pocket Feature", title: "Functional Design", description: "Deep pockets for active lifestyle" },
  { src: leggingsPhonePocket, alt: "Premium Leggings - Phone Pocket", title: "Smart Storage", description: "Secure phone pocket for workouts" },
  { src: leggingsStreet, alt: "Premium Leggings - Street Fashion", title: "Urban Lifestyle", description: "Fashion-forward street style" },
  { src: leggingsCozy, alt: "Premium Leggings - Cozy Home", title: "Home Comfort", description: "Ultimate relaxation & loungewear" },
  { src: leggingsProfessional, alt: "Premium Leggings - Professional Look", title: "Business Casual", description: "Polished elegance for the office" },
  { src: leggingsAthletic, alt: "Premium Leggings - Athletic Performance", title: "Peak Performance", description: "High-intensity training ready" },
  { src: leggingsSeated, alt: "Premium Leggings - Seated Stretch", title: "Flexibility & Stretch", description: "4-way stretch for total freedom" },
];

const OfferMessageCycle = ({ messages }: { messages: string[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (messages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="mb-2 inline-flex relative">
      {messages.map((message, index) => (
        <Badge
          key={index}
          className={`absolute whitespace-nowrap bg-accent text-accent-foreground text-[10px] font-medium px-2 py-0.5 rounded-full transition-all duration-700 ${
            index === currentIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
          }`}
        >
          {message}
        </Badge>
      ))}
      <span className="invisible text-[10px] font-medium px-2 py-0.5">
        {messages[currentIndex] || messages[0]}
      </span>
    </div>
  );
};

const Products = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [selectedTier, setSelectedTier] = useState<'elite' | 'smart_basics'>('smart_basics');
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string } | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [selectedVariants, setSelectedVariants] = useState<Record<string, { size?: string; color?: string }>>({});
  const [displayImages, setDisplayImages] = useState<Record<string, string>>({});
  const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>({});
  const { data: products = [], isLoading, error, refetch } = useProducts();

  // Fetch inventory data for all products
  const productIds = products.map(p => p.id);
  const { data: inventoryData = [] } = useQuery({
    queryKey: ['products-inventory', productIds],
    queryFn: async () => {
      if (productIds.length === 0) return [];
      const { data, error } = await supabase
        .from('product_inventory')
        .select('*')
        .in('product_id', productIds)
        .gt('available_quantity', 0);
      if (error) throw error;
      return data || [];
    },
    enabled: productIds.length > 0,
  });

  // Helper functions
  const getInventoryForProduct = (productId: string) => inventoryData.filter(inv => inv.product_id === productId);

  const getAvailableColors = (productId: string, selectedSize?: string) => {
    const inventory = getInventoryForProduct(productId);
    if (!selectedSize) return [...new Set(inventory.map(inv => inv.color))];
    return inventory.filter(inv => inv.size === selectedSize).map(inv => inv.color);
  };

  const getAvailableSizes = (productId: string, selectedColor?: string) => {
    const inventory = getInventoryForProduct(productId);
    if (!selectedColor) return [...new Set(inventory.map(inv => inv.size))];
    return inventory.filter(inv => inv.color === selectedColor).map(inv => inv.size);
  };

  const handleQuantityChange = (productId: string, delta: number) => {
    setQuantities((prev) => ({ ...prev, [productId]: Math.max(1, (prev[productId] || 1) + delta) }));
  };

  const handleSizeSelect = (productId: string, size: string) => {
    setSelectedVariants((prev) => ({ ...prev, [productId]: { ...prev[productId], size } }));
  };

  const handleColorSelect = async (productId: string, color: string) => {
    setSelectedVariants((prev) => ({ ...prev, [productId]: { ...prev[productId], color } }));
    setLoadingImages(prev => ({ ...prev, [productId]: true }));

    const product = filteredProducts.find(p => p.id === productId);
    const colorData = product?.available_colors?.find(c => c.name.toLowerCase() === color.toLowerCase());

    if (product && (!colorData || !colorData.image_url)) {
      setDisplayImages(prev => ({ ...prev, [productId]: product.image_url }));
      try {
        const { data, error } = await supabase.functions.invoke('product-color-image', {
          body: { productId, colorName: color, colorHex: colorData?.hex }
        });
        if (!error && data?.imageUrl) {
          setDisplayImages(prev => ({ ...prev, [productId]: data.imageUrl }));
          refetch();
        }
      } catch (e) {
        console.error('Failed to generate color image:', e);
        toast({ title: "Image generation failed", description: "Using default image", variant: "destructive" });
      }
    }
    setTimeout(() => setLoadingImages(prev => ({ ...prev, [productId]: false })), 500);
  };

  useEffect(() => {
    if (!products) return;
    const newDisplayImages: Record<string, string> = {};
    products.forEach(product => {
      const selectedColor = selectedVariants[product.id]?.color;
      if (selectedColor && product.available_colors) {
        const colorData = product.available_colors.find(c => c.name.toLowerCase() === selectedColor.toLowerCase());
        newDisplayImages[product.id] = colorData?.image_url || product.image_url;
      } else {
        newDisplayImages[product.id] = product.image_url;
      }
    });
    setDisplayImages(newDisplayImages);
  }, [selectedVariants, products]);

  const handleAddToCart = async (product: any) => {
    if (!user) {
      toast({ title: "Please login first", description: "You need to be logged in to add items to cart", variant: "destructive" });
      navigate("/auth");
      return;
    }

    const selectedVariant = selectedVariants[product.id];
    if (product.available_sizes?.length > 0 && !selectedVariant?.size) {
      toast({ title: "Please select a size", description: "Choose a size before adding to cart", variant: "destructive" });
      return;
    }
    if (product.available_colors?.length > 0 && !selectedVariant?.color) {
      toast({ title: "Please select a color", description: "Choose a color before adding to cart", variant: "destructive" });
      return;
    }

    const inventory = inventoryData.find(inv => inv.product_id === product.id && inv.size === selectedVariant?.size && inv.color === selectedVariant?.color);
    const quantity = quantities[product.id] || 1;
    
    if (!inventory || inventory.available_quantity < quantity) {
      toast({ title: "Insufficient Stock", description: `Only ${inventory?.available_quantity || 0} pieces available for this combination`, variant: "destructive" });
      return;
    }

    addToCart({ productId: product.id, quantity, size: selectedVariant?.size, color: selectedVariant?.color });
    setQuantities((prev) => ({ ...prev, [product.id]: 1 }));
    setSelectedVariants((prev) => ({ ...prev, [product.id]: {} }));
  };

  const filteredProducts = products.filter((product) => {
    const matchesTier = product.quality_tier === selectedTier;
    const matchesCategory = activeCategory === "All" || product.category === activeCategory;
    return matchesTier && matchesCategory;
  });

  const categories = ["All", ...Array.from(new Set(filteredProducts.map(p => p.category)))];

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <p className="text-center text-destructive">Failed to load products. Please try again later.</p>
      </div>
    );
  }

  // Product Card Component for cleaner code
  const ProductCard = ({ product, accentColor }: { product: any; accentColor: 'green' | 'amber' }) => {
    const isGreen = accentColor === 'green';
    
    return (
      <div className="group relative bg-card rounded-none overflow-hidden border-0 hover:shadow-2xl transition-all duration-500">
        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
          <img
            src={displayImages[product.id] || product.image_url || PLACEHOLDER_IMAGE}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          {loadingImages[product.id] && <ProductImageLoader />}
          
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500" />
          
          {/* Quick view button */}
          <Button
            size="icon"
            variant="secondary"
            className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/90 hover:bg-white rounded-full shadow-lg"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImage({ src: displayImages[product.id] || product.image_url, alt: product.name });
            }}
          >
            <Maximize className="h-4 w-4 text-foreground" />
          </Button>

          {/* Badge */}
          <div className="absolute top-4 left-4">
            <span className={`text-[10px] font-medium tracking-wider uppercase px-3 py-1.5 ${
              isGreen 
                ? 'bg-emerald-900/90 text-white' 
                : 'bg-amber-900/90 text-white'
            }`}>
              {isGreen ? 'Smart Value' : 'Premium'}
            </span>
          </div>

          {/* Discount badge */}
          {product.discount_percentage && product.discount_percentage > 0 && (
            <div className="absolute bottom-4 left-4">
              <span className="bg-red-600 text-white text-xs font-bold px-2 py-1">
                -{product.discount_percentage}%
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 bg-card">
          {/* Offer messages */}
          {product.offer_messages && product.offer_messages.length > 0 && (
            <OfferMessageCycle messages={product.offer_messages} />
          )}

          {/* Title */}
          <div>
            <h3 className="font-serif text-lg font-medium text-foreground leading-tight line-clamp-2 group-hover:text-accent transition-colors">
              {product.name}
            </h3>
            {product.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{product.description}</p>
            )}
          </div>

          {/* Price */}
          {product.price && (
            <div className="flex items-baseline gap-2">
              {product.discount_percentage && product.discount_percentage > 0 ? (
                <>
                  <span className={`text-xl font-semibold ${isGreen ? 'text-emerald-600' : 'text-amber-600'}`}>
                    ₹{Math.round(product.price * (1 - product.discount_percentage / 100))}
                  </span>
                  <span className="text-sm text-muted-foreground line-through">₹{Math.round(product.price)}</span>
                </>
              ) : (
                <span className={`text-xl font-semibold ${isGreen ? 'text-emerald-600' : 'text-amber-600'}`}>
                  ₹{Math.round(product.price)}
                </span>
              )}
            </div>
          )}

          {/* Combo Offers */}
          {product.combo_offers && product.combo_offers.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {product.combo_offers.slice(0, 2).map((combo: { quantity: number; price: number }, idx: number) => {
                const regularPrice = product.price * combo.quantity;
                const savingsPercent = (((regularPrice - combo.price) / regularPrice) * 100).toFixed(0);
                return (
                  <span key={idx} className={`text-[10px] px-2 py-1 ${isGreen ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'}`}>
                    Buy {combo.quantity} Save {savingsPercent}%
                  </span>
                );
              })}
            </div>
          )}

          {/* Size Selection */}
          {product.available_sizes && product.available_sizes.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Size</Label>
              <RadioGroup
                value={selectedVariants[product.id]?.size || ""}
                onValueChange={(value) => handleSizeSelect(product.id, value)}
                className="flex flex-wrap gap-1.5"
              >
                {product.available_sizes.map((size: string) => {
                  const availableSizes = getAvailableSizes(product.id, selectedVariants[product.id]?.color);
                  const isAvailable = availableSizes.includes(size);
                  const isSelected = selectedVariants[product.id]?.size === size;
                  
                  return (
                    <div key={size} className="flex items-center">
                      <RadioGroupItem value={size} id={`${product.id}-size-${size}`} className="sr-only" disabled={!isAvailable} />
                      <Label
                        htmlFor={`${product.id}-size-${size}`}
                        className={`w-9 h-9 flex items-center justify-center text-xs font-medium border transition-all cursor-pointer ${
                          !isAvailable 
                            ? "opacity-30 cursor-not-allowed line-through border-muted" 
                            : isSelected
                            ? `border-foreground bg-foreground text-background`
                            : "border-border hover:border-foreground"
                        }`}
                      >
                        {size}
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            </div>
          )}

          {/* Color Selection */}
          {product.available_colors && product.available_colors.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Color {selectedVariants[product.id]?.color && <span className="normal-case">— {selectedVariants[product.id]?.color}</span>}
              </Label>
              <RadioGroup
                value={selectedVariants[product.id]?.color || ""}
                onValueChange={(value) => handleColorSelect(product.id, value)}
                className="flex flex-wrap gap-2"
              >
                {product.available_colors.map((color: { name: string; hex: string }) => {
                  const availableColors = getAvailableColors(product.id, selectedVariants[product.id]?.size);
                  const isAvailable = availableColors.includes(color.name);
                  const isSelected = selectedVariants[product.id]?.color === color.name;
                  
                  return (
                    <div key={color.name} className="flex items-center">
                      <RadioGroupItem value={color.name} id={`${product.id}-color-${color.name}`} className="sr-only" disabled={!isAvailable} />
                      <Label
                        htmlFor={`${product.id}-color-${color.name}`}
                        className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer flex items-center justify-center ${
                          !isAvailable
                            ? "opacity-30 cursor-not-allowed"
                            : isSelected
                            ? "border-foreground ring-2 ring-foreground ring-offset-2 ring-offset-background"
                            : "border-transparent hover:border-muted-foreground"
                        }`}
                        title={color.name}
                      >
                        <span className="w-5 h-5 rounded-full" style={{ backgroundColor: color.hex }} />
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            </div>
          )}

          {/* Quantity and Add to Cart */}
          <div className="flex items-center gap-3 pt-2">
            <div className="flex items-center border border-border">
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-none" onClick={() => handleQuantityChange(product.id, -1)} disabled={quantities[product.id] === 1}>
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-10 text-center text-sm font-medium">{quantities[product.id] || 1}</span>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-none" onClick={() => handleQuantityChange(product.id, 1)}>
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            <Button
              className={`flex-1 h-10 rounded-none font-medium text-sm tracking-wide ${
                isGreen 
                  ? 'bg-emerald-900 hover:bg-emerald-800 text-white' 
                  : 'bg-amber-900 hover:bg-amber-800 text-white'
              }`}
              onClick={() => handleAddToCart(product)}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Bag
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${productsHero})` }} />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
        <div className="relative z-10 text-center px-4 max-w-4xl">
          <p className="text-accent font-medium tracking-[0.3em] mb-4 text-xs uppercase">Shop Collection</p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-6 tracking-tight">
            THE SHOP
          </h1>
          <p className="text-white/80 text-lg md:text-xl font-light max-w-2xl mx-auto">
            Curated essentials designed for movement and comfort
          </p>
        </div>
      </section>

      {/* Trust Strip */}
      <div className="border-y border-border bg-muted/30">
        <div className="container mx-auto px-4 py-5">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-accent" />
              <span className="text-xs font-medium tracking-wide uppercase">Quality Assured</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-accent" />
              <span className="text-xs font-medium tracking-wide uppercase">Transparent Pricing</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-accent" />
              <span className="text-xs font-medium tracking-wide uppercase">Premium Fabrics</span>
            </div>
          </div>
        </div>
      </div>

      {/* Collection Tabs */}
      <div className="container mx-auto px-4 py-12">
        <Tabs value={selectedTier} onValueChange={(value) => { setSelectedTier(value as 'elite' | 'smart_basics'); setActiveCategory("All"); }} className="w-full">
          {/* Premium Tab Design */}
          <div className="flex justify-center mb-10">
            <TabsList className="h-auto p-0 bg-transparent gap-0 border-b border-border rounded-none">
              <TabsTrigger 
                value="smart_basics"
                className="px-8 py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none text-muted-foreground data-[state=active]:text-foreground transition-all"
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="text-sm md:text-base font-medium tracking-wide">SMART BASICS</span>
                  <span className="text-[10px] text-muted-foreground hidden md:block">Everyday Comfort</span>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="elite" 
                className="px-8 py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-amber-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none text-muted-foreground data-[state=active]:text-foreground transition-all"
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="text-sm md:text-base font-medium tracking-wide">ELITE COLLECTION</span>
                  <span className="text-[10px] text-muted-foreground hidden md:block">Premium Quality</span>
                </div>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Smart Basics Tab */}
          <TabsContent value="smart_basics" className="mt-0">
            {/* Collection Description */}
            <div className="text-center mb-10 max-w-2xl mx-auto">
              <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-3">Everyday Comfort, Smart Value</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Quality fabrics at economical prices. Smart choices without compromising comfort.
              </p>
              <div className="flex justify-center gap-6 mt-6">
                {['Economical', 'Comfortable', 'Daily Wear', 'Great Value'].map((item) => (
                  <div key={item} className="flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-emerald-600" />
                    <span className="text-xs text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex justify-center gap-2 mb-10 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant="ghost"
                  onClick={() => setActiveCategory(category)}
                  className={`px-5 py-2 text-xs font-medium tracking-wide uppercase rounded-none border-b-2 transition-all ${
                    activeCategory === category 
                      ? 'border-foreground text-foreground' 
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
                  }`}
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {[...Array(8)].map((_, i) => <Skeleton key={i} className="aspect-[3/4]" />)}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-4">
                <img src={noDataImage} alt="Products coming soon" className="w-32 h-32 object-contain opacity-50 mb-6" />
                <h3 className="font-serif text-2xl text-foreground mb-2">Coming Soon</h3>
                <p className="text-muted-foreground text-sm text-center max-w-md">
                  We're curating a premium selection of Smart Basics collection just for you.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} accentColor="green" />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Elite Collection Tab */}
          <TabsContent value="elite" className="mt-0">
            {/* Collection Description */}
            <div className="text-center mb-10 max-w-2xl mx-auto">
              <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-3">Premium Craftsmanship</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Experience the finest fabrics with superior stitching, higher GSM for durability, and designer-level finishing.
              </p>
              <div className="flex justify-center gap-6 mt-6">
                {['Higher GSM', 'Designer Finish', 'Superior Stitch', 'Premium Feel'].map((item) => (
                  <div key={item} className="flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-amber-600" />
                    <span className="text-xs text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex justify-center gap-2 mb-10 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant="ghost"
                  onClick={() => setActiveCategory(category)}
                  className={`px-5 py-2 text-xs font-medium tracking-wide uppercase rounded-none border-b-2 transition-all ${
                    activeCategory === category 
                      ? 'border-foreground text-foreground' 
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
                  }`}
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {[...Array(8)].map((_, i) => <Skeleton key={i} className="aspect-[3/4]" />)}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-4">
                <img src={noDataImage} alt="Products coming soon" className="w-32 h-32 object-contain opacity-50 mb-6" />
                <h3 className="font-serif text-2xl text-foreground mb-2">Coming Soon</h3>
                <p className="text-muted-foreground text-sm text-center max-w-md">
                  Our Elite Collection is being carefully curated with premium products.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} accentColor="amber" />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Quality Promise */}
      <section className="bg-foreground text-background py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-accent font-medium tracking-[0.3em] mb-4 text-xs uppercase">Our Promise</p>
            <h2 className="font-serif text-3xl md:text-4xl mb-6">Honest Quality, Honest Prices</h2>
            <p className="text-background/70 leading-relaxed">
              Unlike others, we don't sell low-quality products at premium prices. Our transparent tier system lets you choose what matters to you.
              Whether you choose Elite Collection for premium durability or Smart Basics for everyday value, you always know exactly what you're getting.
            </p>
            <p className="text-accent text-sm mt-6 italic">
              "No deception. No false promises. Just honest quality at honest prices."
            </p>
          </div>
        </div>
      </section>

      {/* Model Showcase */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <p className="text-accent font-medium tracking-[0.3em] mb-2 text-xs uppercase">Lookbook</p>
            <h2 className="font-serif text-3xl md:text-4xl text-foreground">Our Collections</h2>
          </div>
          <Carousel opts={{ align: "start", loop: true }} plugins={[Autoplay({ delay: 3000 })]} className="w-full">
            <CarouselContent className="-ml-4">
              {modelShowcaseImages.map((image, index) => (
                <CarouselItem key={index} className="pl-4 basis-full md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                  <div className="group relative aspect-[3/4] overflow-hidden">
                    <img src={image.src} alt={image.alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <span className="text-[10px] font-medium tracking-wider uppercase text-white/70 block mb-1">{image.category}</span>
                      <p className="text-white font-medium text-sm">{image.alt}</p>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2 bg-white/90 hover:bg-white border-0" />
            <CarouselNext className="right-2 bg-white/90 hover:bg-white border-0" />
          </Carousel>
        </div>
      </section>

      {/* Leggings Collection */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <p className="text-accent font-medium tracking-[0.3em] mb-2 text-xs uppercase">Featured</p>
            <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-4">Women's Leggings</h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm mb-6">
              Discover your perfect fit from our range of premium leggings designed for every lifestyle
            </p>
            <Link to="/leggings-features">
              <Button variant="outline" className="rounded-none px-8 py-5 text-sm font-medium tracking-wide border-foreground hover:bg-foreground hover:text-background transition-all group">
                Discover Features
                <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          
          <Carousel opts={{ align: "start", loop: true }} plugins={[Autoplay({ delay: 4000 })]} className="w-full">
            <CarouselContent className="-ml-4">
              {leggingsCollection.map((legging, index) => (
                <CarouselItem key={index} className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                  <div className="group relative aspect-[3/4] overflow-hidden">
                    <img src={legging.src} alt={legging.alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute bottom-0 left-0 right-0 p-5 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <h3 className="text-white font-medium mb-1">{legging.title}</h3>
                      <p className="text-white/70 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                        {legging.description}
                      </p>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2 bg-white/90 hover:bg-white border-0" />
            <CarouselNext className="right-2 bg-white/90 hover:bg-white border-0" />
          </Carousel>
        </div>
      </section>

      {/* Image Zoom Dialog */}
      <ImageZoomDialog
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        imageSrc={selectedImage?.src || ""}
        imageAlt={selectedImage?.alt || ""}
      />
    </div>
  );
};

export default Products;
