import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Maximize, ShoppingCart, Plus, Minus, Check } from "lucide-react";
import ImageZoomDialog from "@/components/ImageZoomDialog";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

const PLACEHOLDER_IMAGE = '/placeholder.svg';

const Products = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string } | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [selectedVariants, setSelectedVariants] = useState<Record<string, { size?: string; color?: string }>>({});
  const { data: products = [], isLoading, error } = useProducts();

  const handleQuantityChange = (productId: string, delta: number) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] || 1) + delta),
    }));
  };

  const handleSizeSelect = (productId: string, size: string) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], size },
    }));
  };

  const handleColorSelect = (productId: string, color: string) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], color },
    }));
  };

  const handleAddToCart = (productId: string, product: any) => {
    if (!user) {
      navigate('/auth?redirect=/products');
      return;
    }
    
    const variants = selectedVariants[productId];
    const hasAvailableSizes = product.available_sizes && product.available_sizes.length > 0;
    const hasAvailableColors = product.available_colors && product.available_colors.length > 0;
    
    // Validate size selection
    if (hasAvailableSizes && !variants?.size) {
      toast({
        title: 'Please select a size',
        variant: 'destructive',
      });
      return;
    }
    
    // Validate color selection
    if (hasAvailableColors && !variants?.color) {
      toast({
        title: 'Please select a color',
        variant: 'destructive',
      });
      return;
    }
    
    const quantity = quantities[productId] || 1;
    addToCart({ 
      productId, 
      quantity,
      size: variants?.size,
      color: variants?.color,
    });
    setQuantities((prev) => ({ ...prev, [productId]: 1 }));
    setSelectedVariants((prev) => ({ ...prev, [productId]: {} }));
  };
  
  const categories = ["All", ...Array.from(new Set(products.map(p => p.category)))];
  const filteredProducts = activeCategory === "All" ? products : products.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="divider-accent mb-6" />
          <h1 className="text-5xl md:text-6xl font-bold mb-4">Our Premium Collection</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Sustainable comfort meets modern style</p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <Button key={category} variant={activeCategory === category ? "default" : "outline"} onClick={() => setActiveCategory(category)} className={activeCategory === category ? "bg-secondary hover:bg-secondary/90" : "border-2"}>
              {category}
            </Button>
          ))}
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-96 w-full" />
                <CardContent className="p-5 space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-destructive">Failed to load products. Please try again later.</p>
          </div>
        )}

        {!isLoading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
            {filteredProducts.map((product) => {
              const isUnavailable = !product.is_active;
              return (
                <Card key={product.id} className={`overflow-hidden card-hover group ${isUnavailable ? 'opacity-60 grayscale' : ''}`}>
                  <div className="h-96 bg-muted relative cursor-pointer overflow-hidden" onClick={() => setSelectedImage({ src: product.image_url || PLACEHOLDER_IMAGE, alt: product.name })}>
                    <img 
                      src={product.image_url || PLACEHOLDER_IMAGE} 
                      alt={product.name} 
                      onError={(e) => {
                        e.currentTarget.src = PLACEHOLDER_IMAGE;
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  <Badge className="absolute top-4 left-4 bg-secondary text-secondary-foreground">{product.category}</Badge>
                  {isUnavailable && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <Badge variant="secondary" className="text-sm font-semibold">Not Available</Badge>
                    </div>
                  )}
                    <Button variant="ghost" size="icon" className="absolute top-4 right-4 bg-white/90 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); setSelectedImage({ src: product.image_url, alt: product.name }); }}>
                      <Maximize className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardContent className="p-5">
                    {/* Offer Message Badge */}
                    {product.offer_message && (
                      <Badge className="mb-2 bg-black text-white font-semibold">{product.offer_message}</Badge>
                    )}
                    
                    <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{product.description}</p>
                    <p className="text-sm font-medium text-primary mb-2">Fabric: {product.fabric}</p>
                    
                    {/* Price with Discount */}
                    <div className="mb-4">
                      {product.price ? (
                        <div>
                          {product.discount_percentage && product.discount_percentage > 0 ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <p className="text-2xl font-bold text-foreground">
                                  ₹{Math.round(product.price * (1 - product.discount_percentage / 100)).toLocaleString()}
                                </p>
                                <p className="text-lg text-muted-foreground line-through">₹{product.price.toLocaleString()}</p>
                                <Badge variant="destructive" className="text-xs">
                                  {product.discount_percentage}% off
                                </Badge>
                              </div>
                            </div>
                          ) : (
                            <p className="text-2xl font-bold text-foreground">₹{product.price.toLocaleString()}</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">Contact for Price</p>
                      )}
                    </div>

                  {/* Size Selection */}
                  {product.available_sizes && product.available_sizes.length > 0 && (
                    <div className="mb-4">
                      <Label className="text-sm font-medium mb-2 block">Size</Label>
                      <RadioGroup
                        value={selectedVariants[product.id]?.size || ""}
                        onValueChange={(value) => handleSizeSelect(product.id, value)}
                        className="flex flex-wrap gap-2"
                      >
                        {product.available_sizes.map((size) => (
                          <div key={size} className="flex items-center">
                            <RadioGroupItem value={size} id={`${product.id}-${size}`} className="peer sr-only" />
                            <Label
                              htmlFor={`${product.id}-${size}`}
                              className="flex items-center justify-center px-4 py-2 border-2 rounded-md cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 hover:border-primary/50 min-w-[3rem]"
                            >
                              {size}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  )}

                  {/* Color Selection */}
                  {product.available_colors && product.available_colors.length > 0 && (
                    <div className="mb-4">
                      <Label className="text-sm font-medium mb-2 block">Color</Label>
                      <div className="flex flex-wrap gap-2">
                        {product.available_colors.map((color) => (
                          <button
                            key={color.name}
                            onClick={() => handleColorSelect(product.id, color.name)}
                            className={`relative w-10 h-10 rounded-full border-2 transition-all hover:scale-110 ${
                              selectedVariants[product.id]?.color === color.name
                                ? 'border-primary ring-2 ring-primary ring-offset-2'
                                : 'border-border hover:border-primary/50'
                            }`}
                            style={{ backgroundColor: color.hex }}
                            title={color.name}
                          >
                            {selectedVariants[product.id]?.color === color.name && (
                              <Check className="h-5 w-5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white drop-shadow-md" strokeWidth={3} />
                            )}
                          </button>
                        ))}
                      </div>
                      {selectedVariants[product.id]?.color && (
                        <p className="text-xs text-muted-foreground mt-1">Selected: {selectedVariants[product.id].color}</p>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 mb-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleQuantityChange(product.id, -1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-medium">{quantities[product.id] || 1}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleQuantityChange(product.id, 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <Button 
                    onClick={() => handleAddToCart(product.id, product)}
                    className="w-full"
                    disabled={isUnavailable}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    {isUnavailable ? 'Unavailable' : (user ? 'Add to Cart' : 'Login to Add')}
                  </Button>
                </CardContent>
              </Card>
            );
            })}
          </div>
        )}

        <Card className="bg-gradient-to-r from-primary via-secondary to-accent text-white p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Need Custom Manufacturing?</h2>
          <p className="text-lg mb-6 text-white/90 max-w-2xl mx-auto">We specialize in bulk orders and custom designs with sustainable fabrics.</p>
          <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
            <Link to="/contact">Get in Touch</Link>
          </Button>
        </Card>

        <ImageZoomDialog imageSrc={selectedImage?.src || ""} imageAlt={selectedImage?.alt || ""} isOpen={!!selectedImage} onClose={() => setSelectedImage(null)} />
      </div>
    </div>
  );
};

export default Products;
