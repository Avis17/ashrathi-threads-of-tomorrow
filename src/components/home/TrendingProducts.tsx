import { Link } from "react-router-dom";
import { ArrowUpRight, Flame, Star, ShoppingBag } from "lucide-react";
import trendingJoggers from "@/assets/home/trending-joggers.jpg";
import trendingLeggings from "@/assets/home/trending-leggings.jpg";
import trendingTee from "@/assets/home/trending-tee.jpg";
import trendingSportsbra from "@/assets/home/trending-sportsbra.jpg";
import trendingTank from "@/assets/home/trending-tank.jpg";
import trendingShorts from "@/assets/home/trending-shorts.jpg";

const products = [
  {
    id: 1,
    name: "Pro Performance Joggers",
    category: "Men",
    price: 1499,
    originalPrice: 2499,
    image: trendingJoggers,
    badge: "Best Seller",
    rating: 4.9,
  },
  {
    id: 2,
    name: "Elite Compression Leggings",
    category: "Women",
    price: 1299,
    originalPrice: 1999,
    image: trendingLeggings,
    badge: "Trending",
    rating: 4.8,
  },
  {
    id: 3,
    name: "DriFit Performance Tee",
    category: "Men",
    price: 799,
    originalPrice: 1299,
    image: trendingTee,
    badge: null,
    rating: 4.7,
  },
  {
    id: 4,
    name: "Support Sports Bra",
    category: "Women",
    price: 899,
    originalPrice: 1499,
    image: trendingSportsbra,
    badge: "New",
    rating: 4.9,
  },
  {
    id: 5,
    name: "Breathable Tank Top",
    category: "Women",
    price: 699,
    originalPrice: 999,
    image: trendingTank,
    badge: null,
    rating: 4.6,
  },
  {
    id: 6,
    name: "Training Shorts 2-in-1",
    category: "Men",
    price: 999,
    originalPrice: 1599,
    image: trendingShorts,
    badge: "Hot",
    rating: 4.8,
  },
];

const TrendingProducts = () => {
  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`;

  return (
    <section className="py-24 lg:py-32 bg-muted/30">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-16">
          <div>
            <div className="inline-flex items-center gap-2 mb-4">
              <Flame className="w-5 h-5 text-accent" />
              <span className="text-accent font-medium tracking-[0.3em] text-sm">
                HOT RIGHT NOW
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-athletic font-black text-foreground">
              TRENDING PRODUCTS
            </h2>
          </div>
          
          <Link 
            to="/shop" 
            className="inline-flex items-center gap-2 px-6 py-3 border border-border text-foreground font-athletic font-bold tracking-wider text-sm hover:bg-accent hover:text-accent-foreground hover:border-accent transition-all group"
          >
            VIEW ALL
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6">
          {products.map((product, index) => (
            <Link
              key={product.id}
              to="/shop"
              className="group relative bg-background rounded-xl overflow-hidden border border-border hover:border-accent/50 transition-all duration-300 hover:shadow-xl"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Image Container */}
              <div className="relative aspect-square overflow-hidden bg-muted">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                {/* Badge */}
                {product.badge && (
                  <div className={`absolute top-3 left-3 px-3 py-1 text-xs font-bold tracking-wide rounded-full ${
                    product.badge === 'Best Seller' ? 'bg-accent text-accent-foreground' :
                    product.badge === 'Trending' ? 'bg-rose-500 text-white' :
                    product.badge === 'New' ? 'bg-emerald-500 text-white' :
                    'bg-orange-500 text-white'
                  }`}>
                    {product.badge.toUpperCase()}
                  </div>
                )}
                
                {/* Discount Badge */}
                <div className="absolute top-3 right-3 px-2 py-1 bg-foreground text-background text-xs font-bold rounded">
                  {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                </div>
                
                {/* Quick Add Overlay */}
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground font-medium text-sm rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform">
                    <ShoppingBag className="w-4 h-4" />
                    Quick View
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-4">
                {/* Category & Rating */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground tracking-wider">{product.category.toUpperCase()}</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-medium">{product.rating}</span>
                  </div>
                </div>
                
                {/* Name */}
                <h3 className="font-medium text-foreground text-sm leading-tight mb-3 line-clamp-2 group-hover:text-accent transition-colors">
                  {product.name}
                </h3>
                
                {/* Price */}
                <div className="flex items-center gap-2">
                  <span className="text-lg font-athletic font-bold text-foreground">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-sm text-muted-foreground line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <Link 
            to="/shop" 
            className="inline-flex items-center gap-3 px-10 py-4 bg-foreground text-background font-athletic font-bold tracking-wider hover:bg-accent hover:text-accent-foreground transition-all group"
          >
            EXPLORE ALL PRODUCTS
            <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TrendingProducts;
