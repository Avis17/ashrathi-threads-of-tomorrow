import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  Droplets, 
  Zap, 
  Wind, 
  ChevronLeft, 
  ChevronRight,
  Factory,
  Sparkles,
  Timer,
  Star,
  Play
} from "lucide-react";
import { useState, useEffect } from "react";

// Hero slides
import heroSlide1 from "@/assets/hero-slide-1.jpg";
import heroSlide2 from "@/assets/hero-slide-2.jpg";
import heroSlide3 from "@/assets/hero-slide-3.jpg";
import heroSlide4 from "@/assets/hero-slide-4.jpg";

// Category images
import categoryLeggings from "@/assets/category-leggings.jpg";
import categoryTshirts from "@/assets/category-tshirts.jpg";
import categorySportsbra from "@/assets/category-sportsbra.jpg";
import categoryJoggers from "@/assets/category-joggers.jpg";

// Highlights
import highlightCampaign from "@/assets/highlight-campaign.jpg";
import highlightDetail from "@/assets/highlight-detail.jpg";

// New arrivals
import newArrival1 from "@/assets/new-arrival-1.jpg";
import newArrival2 from "@/assets/new-arrival-2.jpg";

// Hero model
import heroModel1 from "@/assets/hero-model-woman-1.jpg";

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeAccordion, setActiveAccordion] = useState<number | null>(0);

  const storyFeatures = [
    {
      icon: (
        <svg className="w-5 h-5 text-neon flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      ),
      title: "Designed for your confidence",
      content: "Every stitch is crafted to make you feel unstoppable. Our designs blend style with performance, so whether you're hitting the gym or grabbing coffee, you look and feel your absolute best."
    },
    {
      icon: (
        <svg className="w-5 h-5 text-neon flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
      title: "Premium fabrics that move with you",
      content: "We source only the finest 270 GSM performance fabrics with 4-way stretch technology. Buttery-soft against your skin, yet durable enough to keep up with your most intense workouts."
    },
    {
      icon: (
        <svg className="w-5 h-5 text-neon flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
          <line x1="9" y1="9" x2="9.01" y2="9" />
          <line x1="15" y1="9" x2="15.01" y2="9" />
        </svg>
      ),
      title: "Happy customers, always",
      content: "From factory floor to your doorstep, we eliminate middlemen to bring you luxury activewear at honest prices. Plus, hassle-free returns and dedicated support because your satisfaction is our priority."
    }
  ];

  const heroSlides = [
    {
      image: heroSlide1,
      subtitle: "PERFORMANCE WEAR",
      title: "ENGINEERED FOR",
      highlight: "COMFORT",
      description: "Premium Quality • Factory Direct Pricing",
      ctaMain: "/women",
      ctaMainText: "SHOP WOMEN",
      ctaSecondary: "/men",
      ctaSecondaryText: "SHOP MEN"
    },
    {
      image: heroSlide2,
      subtitle: "MEN'S ACTIVEWEAR",
      title: "PUSH YOUR",
      highlight: "LIMITS",
      description: "270 GSM Premium Fabric • Built to Last",
      ctaMain: "/men",
      ctaMainText: "SHOP MEN",
      ctaSecondary: "/shop",
      ctaSecondaryText: "VIEW ALL"
    },
    {
      image: heroSlide3,
      subtitle: "NEW COLLECTION",
      title: "MOVE WITHOUT",
      highlight: "BOUNDARIES",
      description: "4-Way Stretch • Ultimate Freedom",
      ctaMain: "/shop",
      ctaMainText: "SHOP NOW",
      ctaSecondary: "/collections",
      ctaSecondaryText: "COLLECTIONS"
    },
    {
      image: heroSlide4,
      subtitle: "WORKOUT ESSENTIALS",
      title: "TRAIN",
      highlight: "HARDER",
      description: "Sweat-Wicking Technology • Quick Dry",
      ctaMain: "/shop",
      ctaMainText: "EXPLORE",
      ctaSecondary: "/women",
      ctaSecondaryText: "WOMEN"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const uspFeatures = [
    { icon: Droplets, title: "SWEAT-WICKING", desc: "Stay Dry" },
    { icon: Zap, title: "4-WAY STRETCH", desc: "Move Free" },
    { icon: Timer, title: "QUICK DRY", desc: "Fast Dry" },
    { icon: Factory, title: "FACTORY DIRECT", desc: "Best Price" },
    { icon: Sparkles, title: "PREMIUM FABRIC", desc: "270 GSM" },
    { icon: Wind, title: "BREATHABLE", desc: "Stay Cool" },
  ];

  const categories = [
    { 
      name: "MEN'S ACTIVEWEAR", 
      subtitle: "Performance Essentials",
      image: categoryTshirts, 
      link: "/men",
      count: "50+ Products"
    },
    { 
      name: "WOMEN'S ACTIVEWEAR", 
      subtitle: "Style Meets Comfort",
      image: categoryLeggings, 
      link: "/women",
      count: "60+ Products"
    },
    { 
      name: "TRACK PANTS", 
      subtitle: "All Day Comfort",
      image: categoryJoggers, 
      link: "/shop",
      count: "30+ Products"
    },
    { 
      name: "T-SHIRTS", 
      subtitle: "Essential Basics",
      image: categorySportsbra, 
      link: "/shop",
      count: "40+ Products"
    },
  ];

  const trendingProducts = [
    { name: "Pro Training Tee", price: "₹799", originalPrice: "₹1,299", image: newArrival1, discount: "38% OFF" },
    { name: "Performance Joggers", price: "₹1,299", originalPrice: "₹1,999", image: newArrival2, discount: "35% OFF" },
    { name: "Compression Shorts", price: "₹699", originalPrice: "₹1,099", image: highlightCampaign, discount: "36% OFF" },
    { name: "Sports Tank Top", price: "₹599", originalPrice: "₹999", image: highlightDetail, discount: "40% OFF" },
    { name: "Training Leggings", price: "₹1,199", originalPrice: "₹1,799", image: categoryLeggings, discount: "33% OFF" },
  ];

  const reviews = [
    { name: "Rahul S.", rating: 5, comment: "Best quality activewear I've ever owned. The fabric is premium and the fit is perfect!", location: "Mumbai" },
    { name: "Priya M.", rating: 5, comment: "Love the 4-way stretch! Perfect for my yoga sessions. Will definitely order more.", location: "Bangalore" },
    { name: "Amit K.", rating: 5, comment: "Factory direct pricing with premium quality. Can't beat this value!", location: "Delhi" },
  ];

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Hero Section with Full-Width Slider */}
      <section className="relative h-screen overflow-hidden">
        {/* Slides */}
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-1000 ${
              index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[8000ms] ease-out"
              style={{ 
                backgroundImage: `url(${slide.image})`,
                transform: index === currentSlide ? "scale(1.1)" : "scale(1)"
              }}
            />
            {/* Dark overlay with gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
          </div>
        ))}
        
        {/* Content - Left Aligned */}
        <div className="relative z-20 h-full flex items-center px-6 md:px-12 lg:px-20">
          <div className="max-w-3xl">
            {/* Subtitle with neon accent */}
            <div className="inline-flex items-center gap-2 mb-6">
              <div className="w-12 h-[2px] bg-neon" />
              <p className="text-xs md:text-sm tracking-[0.4em] text-neon font-bold uppercase">
                {heroSlides[currentSlide].subtitle}
              </p>
            </div>
            
            {/* Main Title - Bold Athletic Typography */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-2 text-white leading-[0.9] uppercase">
              {heroSlides[currentSlide].title}
            </h1>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6 text-neon leading-[0.9] uppercase">
              {heroSlides[currentSlide].highlight}
            </h1>
            
            {/* Description */}
            <p className="text-base md:text-lg text-white/80 max-w-xl mb-10 font-medium tracking-wide">
              {heroSlides[currentSlide].description}
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Button 
                asChild 
                size="lg" 
                className="px-8 md:px-12 py-6 md:py-7 text-sm md:text-base font-bold tracking-[0.1em] bg-neon hover:bg-neon/90 text-black rounded-none uppercase transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(0,212,255,0.5)]"
              >
                <Link to={heroSlides[currentSlide].ctaMain}>
                  {heroSlides[currentSlide].ctaMainText}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button 
                asChild 
                size="lg" 
                variant="outline" 
                className="px-8 md:px-12 py-6 md:py-7 text-sm md:text-base font-bold tracking-[0.1em] border-2 border-white text-white hover:bg-white hover:text-black rounded-none uppercase transition-all duration-300"
              >
                <Link to={heroSlides[currentSlide].ctaSecondary}>
                  {heroSlides[currentSlide].ctaSecondaryText}
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 md:w-14 md:h-14 bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-neon hover:text-black hover:border-neon transition-all duration-300"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 md:w-14 md:h-14 bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-neon hover:text-black hover:border-neon transition-all duration-300"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Slide Indicators - Vertical on right */}
        <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-3 translate-x-20 md:translate-x-0">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-1 transition-all duration-500 ${
                index === currentSlide 
                  ? "h-12 bg-neon" 
                  : "h-6 bg-white/30 hover:bg-white/60"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Bottom Slide Counter */}
        <div className="absolute bottom-8 left-6 md:left-20 z-30 flex items-center gap-4">
          <span className="text-5xl md:text-6xl font-black text-neon">0{currentSlide + 1}</span>
          <div className="w-12 h-[1px] bg-white/30" />
          <span className="text-xl text-white/50 font-medium">0{heroSlides.length}</span>
        </div>
      </section>

      {/* Premium Service Benefits Strip */}
      <section className="py-6 md:py-8 bg-gradient-to-r from-[#0a0a0a] via-[#111] to-[#0a0a0a] border-y border-neon/20 relative overflow-hidden">
        {/* Background Glow Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-1/4 top-0 w-64 h-32 bg-neon/5 blur-3xl rounded-full" />
          <div className="absolute right-1/4 bottom-0 w-64 h-32 bg-neon/5 blur-3xl rounded-full" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-0">
            {/* Free Shipping */}
            <div className="flex items-center justify-center gap-4 md:gap-5 py-3 md:py-0 group cursor-pointer md:border-r md:border-neon/20">
              <div className="relative">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-neon/20 to-neon/5 border border-neon/30 flex items-center justify-center group-hover:border-neon group-hover:shadow-[0_0_20px_rgba(0,144,255,0.3)] transition-all duration-500">
                  <svg className="w-7 h-7 md:w-8 md:h-8 text-neon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 2v1m0 18v1m-7-7H4m17 0h-1M7.05 7.05L6.34 6.34m11.31 11.31-.71-.71M7.05 16.95l-.71.71m11.31-11.31-.71-.71" />
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 8v4l2 2" />
                  </svg>
                  <svg className="w-7 h-7 md:w-8 md:h-8 text-neon absolute" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4z" />
                    <circle cx="6" cy="17" r="2" />
                    <circle cx="18" cy="17" r="2" />
                  </svg>
                </div>
                {/* Animated Ring */}
                <div className="absolute inset-0 rounded-2xl border border-neon/50 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
              </div>
              <div className="text-left">
                <h3 className="text-base md:text-lg font-black text-white tracking-wide group-hover:text-neon transition-colors duration-300">
                  FREE SHIPPING
                </h3>
                <p className="text-xs md:text-sm text-white/60 font-medium">
                  above <span className="text-neon font-bold">₹999</span>
                </p>
              </div>
            </div>

            {/* Cash on Delivery */}
            <div className="flex items-center justify-center gap-4 md:gap-5 py-3 md:py-0 group cursor-pointer md:border-r md:border-neon/20">
              <div className="relative">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-neon/20 to-neon/5 border border-neon/30 flex items-center justify-center group-hover:border-neon group-hover:shadow-[0_0_20px_rgba(0,144,255,0.3)] transition-all duration-500">
                  <svg className="w-7 h-7 md:w-8 md:h-8 text-neon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="8" width="18" height="13" rx="2" />
                    <path d="M12 12v5" />
                    <path d="M9.5 14.5L12 12l2.5 2.5" />
                    <path d="M7 8V6a5 5 0 0 1 10 0v2" />
                    <circle cx="12" cy="17" r="1" fill="currentColor" />
                  </svg>
                </div>
                {/* Animated Ring */}
                <div className="absolute inset-0 rounded-2xl border border-neon/50 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
              </div>
              <div className="text-left">
                <h3 className="text-base md:text-lg font-black text-white tracking-wide group-hover:text-neon transition-colors duration-300">
                  CASH ON DELIVERY
                </h3>
                <p className="text-xs md:text-sm text-white/60 font-medium">
                  on <span className="text-neon font-bold">all orders</span>
                </p>
              </div>
            </div>

            {/* Easy Returns */}
            <div className="flex items-center justify-center gap-4 md:gap-5 py-3 md:py-0 group cursor-pointer">
              <div className="relative">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-neon/20 to-neon/5 border border-neon/30 flex items-center justify-center group-hover:border-neon group-hover:shadow-[0_0_20px_rgba(0,144,255,0.3)] transition-all duration-500">
                  <svg className="w-7 h-7 md:w-8 md:h-8 text-neon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 8V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2" />
                    <path d="M16 12H8" />
                    <path d="M12 16l-4-4 4-4" />
                    <path d="M21 12h-5" />
                  </svg>
                </div>
                {/* Animated Ring */}
                <div className="absolute inset-0 rounded-2xl border border-neon/50 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
              </div>
              <div className="text-left">
                <h3 className="text-base md:text-lg font-black text-white tracking-wide group-hover:text-neon transition-colors duration-300">
                  EASY RETURNS
                </h3>
                <p className="text-xs md:text-sm text-white/60 font-medium">
                  within <span className="text-neon font-bold">7 days</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Accent Line */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-[2px] bg-gradient-to-r from-transparent via-neon to-transparent" />
      </section>

      {/* Product Features Strip */}
      <section className="py-4 md:py-5 bg-black/80 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-start md:justify-center gap-6 md:gap-10 lg:gap-14 overflow-x-auto scrollbar-hide pb-2 md:pb-0">
            {uspFeatures.map((feature, index) => (
              <div 
                key={index} 
                className="flex items-center gap-2 flex-shrink-0 group cursor-pointer"
              >
                <feature.icon className="h-4 w-4 text-neon/80 group-hover:text-neon transition-colors" />
                <span className="text-xs font-bold text-white/70 tracking-wider group-hover:text-white transition-colors whitespace-nowrap">
                  {feature.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category Cards Section */}
      <section className="py-16 md:py-24 bg-[#0a0a0a]">
        <div className="container mx-auto px-4 md:px-6">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10 md:mb-14">
            <div>
              <p className="text-xs tracking-[0.3em] text-neon mb-3 font-bold uppercase">SHOP BY CATEGORY</p>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white uppercase">
                EXPLORE <span className="text-neon">COLLECTIONS</span>
              </h2>
            </div>
            <Link 
              to="/shop" 
              className="hidden md:inline-flex items-center text-white hover:text-neon transition-colors font-bold text-sm tracking-wide mt-4 md:mt-0"
            >
              VIEW ALL <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
          
          {/* Category Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {categories.map((category, index) => (
              <Link
                key={index}
                to={category.link}
                className="group relative h-[280px] md:h-[450px] overflow-hidden"
              >
                {/* Image */}
                <img 
                  src={category.image} 
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                
                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-6">
                  <p className="text-[10px] md:text-xs text-neon font-bold mb-1 tracking-wider">{category.count}</p>
                  <h3 className="text-sm md:text-xl font-black text-white uppercase mb-1 tracking-wide">
                    {category.name}
                  </h3>
                  <p className="text-xs md:text-sm text-white/60 mb-3 hidden md:block">{category.subtitle}</p>
                  
                  {/* Hover CTA */}
                  <div className="flex items-center gap-2 text-neon opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    <span className="text-xs md:text-sm font-bold tracking-wide">SHOP NOW</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>

                {/* Corner accent */}
                <div className="absolute top-0 right-0 w-0 h-0 border-t-[50px] md:border-t-[80px] border-t-neon border-l-[50px] md:border-l-[80px] border-l-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
            ))}
          </div>

          {/* Mobile View All */}
          <Link 
            to="/shop" 
            className="md:hidden flex items-center justify-center text-white hover:text-neon transition-colors font-bold text-sm tracking-wide mt-8 py-4 border border-white/20"
          >
            VIEW ALL CATEGORIES <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Trending Products Slider */}
      <section className="py-16 md:py-24 bg-[#111]">
        <div className="container mx-auto px-4 md:px-6">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10 md:mb-14">
            <div>
              <p className="text-xs tracking-[0.3em] text-neon mb-3 font-bold uppercase">HOT RIGHT NOW</p>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white uppercase">
                TRENDING <span className="text-neon">PRODUCTS</span>
              </h2>
            </div>
            <Link 
              to="/shop" 
              className="hidden md:inline-flex items-center text-white hover:text-neon transition-colors font-bold text-sm tracking-wide"
            >
              SHOP ALL <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          {/* Products Horizontal Scroll */}
          <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
            {trendingProducts.map((product, index) => (
              <Link
                key={index}
                to="/shop"
                className="group flex-shrink-0 w-[220px] md:w-[280px] snap-start"
              >
                {/* Product Card */}
                <div className="relative h-[280px] md:h-[360px] overflow-hidden bg-[#1a1a1a] mb-4">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                  />
                  
                  {/* Discount Badge */}
                  <div className="absolute top-3 left-3 bg-neon text-black px-3 py-1 text-xs font-black tracking-wide">
                    {product.discount}
                  </div>

                  {/* Quick Add Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                    <button className="bg-neon text-black px-6 py-3 font-bold text-sm tracking-wide transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 hover:bg-white">
                      + QUICK ADD
                    </button>
                  </div>
                </div>

                {/* Product Info */}
                <div>
                  <h3 className="text-sm md:text-base font-bold text-white mb-2 group-hover:text-neon transition-colors tracking-wide">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="text-lg md:text-xl font-black text-neon">{product.price}</span>
                    <span className="text-sm text-white/40 line-through">{product.originalPrice}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Video Section */}
      <section className="relative h-[70vh] md:h-[90vh] overflow-hidden bg-black">
        {/* Video Background */}
        <div className="absolute inset-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            poster="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1920&q=80"
          >
            <source 
              src="https://cdn.coverr.co/videos/coverr-woman-doing-yoga-at-sunrise-1565/1080p.mp4" 
              type="video/mp4" 
            />
          </video>
          {/* Fallback gradient overlay for when video doesn't load */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/80" />
        </div>

        {/* Animated Grain Overlay */}
        <div className="absolute inset-0 opacity-20 mix-blend-overlay bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')]" />

        {/* Cinematic Bars */}
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black to-transparent z-10" />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black to-transparent z-10" />

        {/* Main Content */}
        <div className="relative z-20 h-full flex items-center justify-center">
          <div className="text-center px-6 max-w-5xl">
            {/* Animated Play Button */}
            <div className="mb-8 md:mb-12">
              <button className="group relative w-24 h-24 md:w-32 md:h-32">
                {/* Outer ring animation */}
                <span className="absolute inset-0 rounded-full border-2 border-neon/50 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
                <span className="absolute inset-2 rounded-full border border-neon/30 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite_0.5s]" />
                
                {/* Main button */}
                <span className="relative flex items-center justify-center w-full h-full rounded-full bg-neon/20 backdrop-blur-md border border-neon/50 group-hover:bg-neon group-hover:scale-110 transition-all duration-500">
                  <Play className="h-8 w-8 md:h-10 md:w-10 text-neon group-hover:text-black ml-1 transition-colors duration-300" fill="currentColor" />
                </span>
              </button>
            </div>

            {/* Premium Typography */}
            <p className="text-xs md:text-sm tracking-[0.5em] text-neon mb-4 md:mb-6 font-bold uppercase animate-fade-in">
              WATCH THE JOURNEY
            </p>
            <h2 className="text-4xl md:text-6xl lg:text-8xl font-black text-white mb-4 md:mb-6 leading-[0.85] uppercase tracking-tight">
              CRAFTED FOR
              <br />
              <span className="bg-gradient-to-r from-neon via-cyan-300 to-neon bg-clip-text text-transparent animate-pulse">
                ATHLETES
              </span>
            </h2>
            <p className="text-sm md:text-lg text-white/60 max-w-2xl mx-auto mb-8 md:mb-10 leading-relaxed">
              From the manufacturing floor to your workout routine. 
              Experience the quality that sets us apart.
            </p>

            {/* Glassmorphism CTA */}
            <div className="inline-flex flex-col sm:flex-row items-center gap-4">
              <Link 
                to="/about"
                className="group flex items-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 hover:bg-neon hover:border-neon transition-all duration-500"
              >
                <span className="text-sm font-bold tracking-[0.15em] text-white group-hover:text-black uppercase">
                  Watch Full Story
                </span>
                <ArrowRight className="h-4 w-4 text-neon group-hover:text-black transition-colors" />
              </Link>
              <Link 
                to="/shop"
                className="text-sm font-bold tracking-[0.15em] text-white/60 hover:text-neon transition-colors uppercase"
              >
                Skip to Shop →
              </Link>
            </div>
          </div>
        </div>

        {/* Side Decorative Elements */}
        <div className="absolute left-6 md:left-12 top-1/2 -translate-y-1/2 z-20 hidden lg:flex flex-col gap-4 items-center">
          <div className="w-[1px] h-20 bg-gradient-to-b from-transparent via-neon to-transparent" />
          <span className="text-[10px] tracking-[0.3em] text-neon font-bold uppercase rotate-[-90deg] whitespace-nowrap">
            Premium Quality
          </span>
          <div className="w-[1px] h-20 bg-gradient-to-b from-transparent via-neon to-transparent" />
        </div>

        <div className="absolute right-6 md:right-12 top-1/2 -translate-y-1/2 z-20 hidden lg:flex flex-col gap-4 items-center">
          <div className="w-[1px] h-20 bg-gradient-to-b from-transparent via-white/30 to-transparent" />
          <span className="text-[10px] tracking-[0.3em] text-white/50 font-bold uppercase rotate-90 whitespace-nowrap">
            Since 2015
          </span>
          <div className="w-[1px] h-20 bg-gradient-to-b from-transparent via-white/30 to-transparent" />
        </div>

        {/* Bottom Stats Bar */}
        <div className="absolute bottom-0 left-0 right-0 z-20">
          <div className="flex items-center justify-center gap-8 md:gap-16 py-6 bg-gradient-to-t from-black/80 to-transparent backdrop-blur-sm">
            {[
              { value: "270", label: "GSM Fabric" },
              { value: "20+", label: "Machines" },
              { value: "10K+", label: "Happy Customers" },
              { value: "100%", label: "Quality Promise" },
            ].map((stat, index) => (
              <div key={index} className="text-center hidden sm:block">
                <p className="text-2xl md:text-3xl font-black text-neon">{stat.value}</p>
                <p className="text-[10px] md:text-xs text-white/50 font-medium tracking-wider uppercase">{stat.label}</p>
              </div>
            ))}
            {/* Mobile: Show only 2 stats */}
            {[
              { value: "270", label: "GSM" },
              { value: "10K+", label: "Customers" },
            ].map((stat, index) => (
              <div key={index} className="text-center sm:hidden">
                <p className="text-xl font-black text-neon">{stat.value}</p>
                <p className="text-[10px] text-white/50 font-medium tracking-wider uppercase">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="relative h-[60vh] md:h-[80vh] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{ backgroundImage: `url(${heroModel1})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
        
        <div className="relative z-10 h-full flex items-center px-6 md:px-12 lg:px-20">
          <div className="max-w-2xl">
            <p className="text-xs tracking-[0.4em] text-neon mb-4 font-bold uppercase">DESIGNED FOR PERFORMANCE</p>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-[0.9] uppercase">
              ELEVATE YOUR
              <br />
              <span className="text-neon">WORKOUT</span>
            </h2>
            <p className="text-base md:text-lg text-white/70 mb-8 max-w-lg">
              From intense gym sessions to peaceful yoga flows, our activewear moves with you. 
              Premium fabric technology meets style.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                asChild 
                size="lg" 
                className="px-10 py-7 text-sm font-bold tracking-[0.1em] bg-neon hover:bg-neon/90 text-black rounded-none uppercase"
              >
                <Link to="/shop">
                  SHOP NOW <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button 
                asChild 
                size="lg" 
                variant="outline" 
                className="px-10 py-7 text-sm font-bold tracking-[0.1em] border-2 border-white text-white hover:bg-white hover:text-black rounded-none uppercase"
              >
                <Link to="/about" className="flex items-center gap-2">
                  <Play className="h-4 w-4" /> WATCH VIDEO
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Section - Premium Split Layout */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-[#f5f5f0] via-[#faf9f5] to-[#f0efe8]">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            {/* Left - Premium Image Card */}
            <div className="relative group">
              {/* Main Image Container with Frame Effect */}
              <div className="relative overflow-hidden bg-gradient-to-br from-[#e8e6dd] to-[#d9d5c8] p-3 md:p-4">
                {/* Inner Border */}
                <div className="relative overflow-hidden border-2 border-[#c9c4b5]">
                  <img 
                    src={highlightCampaign}
                    alt="Feather Fashions Manufacturing Unit"
                    className="w-full h-[350px] md:h-[450px] object-cover group-hover:scale-105 transition-transform duration-1000"
                  />
                  
                  {/* Premium Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Decorative Corner Elements */}
                  <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-neon opacity-80" />
                  <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-neon opacity-80" />
                  <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-neon opacity-80" />
                  <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-neon opacity-80" />
                </div>
                
                {/* Bottom Stats Bar */}
                <div className="relative mt-4 pt-4 border-t-2 border-[#c9c4b5]">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-black text-2xl md:text-3xl text-[#c65a10] tracking-tight uppercase" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        OUR STORY
                      </h3>
                    </div>
                    <div className="text-right">
                      <p className="text-xs md:text-sm font-bold text-[#c65a10] tracking-wide uppercase leading-tight">
                        STATE OF THE ART MANUFACTURING.
                        <br />
                        <span className="text-[#d97a3a]">20+ MACHINES. 270 GSM QUALITY.</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Accent */}
              <div className="absolute -z-10 -bottom-4 -right-4 w-full h-full bg-neon/10 transform translate-x-2 translate-y-2" />
            </div>
            
            {/* Right - Content with Accordion Features */}
            <div className="lg:pl-6">
              {/* Section Title */}
              <h2 className="font-black text-4xl md:text-5xl lg:text-6xl text-[#1a1a1a] mb-6 leading-[1.1]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Our story
              </h2>
              
              {/* Description */}
              <p className="text-base md:text-lg text-[#555] mb-10 leading-relaxed">
                Feather Fashions is a premium activewear manufacturing unit; 100% made in India. 
                Where innovation meets craftsmanship, we're redefining performance wear standards 
                for the modern athlete and fitness enthusiast.
              </p>
              
              {/* Interactive Accordion Features */}
              <div className="space-y-0 mb-10">
                {storyFeatures.map((feature, index) => (
                  <div 
                    key={index}
                    className={`border-t border-[#ddd] ${index === storyFeatures.length - 1 ? 'border-b' : ''} transition-all duration-300 ${
                      activeAccordion === index ? 'bg-gradient-to-r from-neon/5 to-transparent' : 'hover:bg-[#f0efe8]/50'
                    }`}
                  >
                    <button 
                      onClick={() => setActiveAccordion(activeAccordion === index ? null : index)}
                      className="w-full py-5 flex items-start justify-between cursor-pointer text-left"
                    >
                      <div className="flex items-start gap-3">
                        <span className={`mt-0.5 transition-transform duration-300 ${activeAccordion === index ? 'scale-110' : ''}`}>
                          {feature.icon}
                        </span>
                        <h4 className="font-bold text-lg text-[#1a1a1a]">{feature.title}</h4>
                      </div>
                      <span className={`text-2xl font-light ml-4 flex-shrink-0 transition-transform duration-300 ${
                        activeAccordion === index ? 'text-neon rotate-0' : 'text-[#1a1a1a]'
                      }`}>
                        {activeAccordion === index ? '−' : '+'}
                      </span>
                    </button>
                    
                    {/* Expandable Content */}
                    <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
                      activeAccordion === index ? 'max-h-40 opacity-100 pb-5' : 'max-h-0 opacity-0'
                    }`}>
                      <p className="text-sm text-[#666] leading-relaxed pl-8 pr-4">
                        {feature.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Read More Button */}
              <Button 
                asChild 
                className="px-10 py-6 text-sm font-bold tracking-[0.05em] bg-[#0090FF] hover:bg-[#0077d4] text-white rounded-none uppercase transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-neon/20 group"
              >
                <Link to="/about" className="inline-flex items-center gap-2">
                  Read More
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="py-16 md:py-24 bg-[#111]">
        <div className="container mx-auto px-4 md:px-6">
          {/* Section Header */}
          <div className="text-center mb-10 md:mb-14">
            <p className="text-xs tracking-[0.3em] text-neon mb-3 font-bold uppercase">TESTIMONIALS</p>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white uppercase">
              WHAT OUR <span className="text-neon">CUSTOMERS SAY</span>
            </h2>
          </div>

          {/* Reviews Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {reviews.map((review, index) => (
              <div 
                key={index} 
                className="bg-[#1a1a1a] p-6 md:p-8 border border-white/5 hover:border-neon/30 transition-all duration-300 group"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-neon text-neon" />
                  ))}
                </div>
                
                {/* Comment */}
                <p className="text-white/70 mb-6 text-sm md:text-base leading-relaxed">
                  "{review.comment}"
                </p>
                
                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-neon/20 flex items-center justify-center">
                    <span className="text-neon font-bold text-sm">{review.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">{review.name}</p>
                    <p className="text-white/40 text-xs">{review.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-neon">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-black mb-6 uppercase tracking-tight">
            READY TO UPGRADE YOUR
            <br />
            ACTIVEWEAR GAME?
          </h2>
          <p className="text-black/70 max-w-2xl mx-auto mb-10 text-base md:text-lg">
            Join thousands of fitness enthusiasts who trust Feather Fashions for premium quality activewear 
            at factory-direct prices.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              asChild 
              size="lg" 
              className="px-10 md:px-14 py-7 text-sm md:text-base font-bold tracking-[0.1em] bg-black hover:bg-black/80 text-white rounded-none uppercase"
            >
              <Link to="/shop">SHOP NOW</Link>
            </Button>
            <Button 
              asChild 
              size="lg" 
              variant="outline" 
              className="px-10 md:px-14 py-7 text-sm md:text-base font-bold tracking-[0.1em] border-2 border-black text-black hover:bg-black hover:text-white rounded-none uppercase"
            >
              <Link to="/contact">CONTACT US</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
