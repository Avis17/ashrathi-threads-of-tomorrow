import { Link } from "react-router-dom";
import { ArrowRight, Star, Heart, Sparkles, Zap, Shield, Leaf } from "lucide-react";
import { motion } from "framer-motion";

// Import images
import heroKids from "@/assets/kids/hero-kids.jpg";
import girlLeggings from "@/assets/kids/girl-leggings.jpg";
import boyJoggers from "@/assets/kids/boy-joggers.jpg";
import girlShorts from "@/assets/kids/girl-shorts.jpg";
import boyTee from "@/assets/kids/boy-tee.jpg";
import girlDress from "@/assets/kids/girl-dress.jpg";
import boyTank from "@/assets/kids/boy-tank.jpg";
import girlHoodie from "@/assets/kids/girl-hoodie.jpg";
import kidsGroup from "@/assets/kids/kids-group.jpg";
import boyJacket from "@/assets/kids/boy-jacket.jpg";

const Kids = () => {
  const categories = [
    { id: 1, title: "Girls Leggings", subtitle: "Stretchy & Comfy", image: girlLeggings, color: "from-pink-400 to-rose-500" },
    { id: 2, title: "Boys Joggers", subtitle: "Active & Cool", image: boyJoggers, color: "from-cyan-400 to-blue-500" },
    { id: 3, title: "Girls Shorts", subtitle: "Fun & Free", image: girlShorts, color: "from-lime-400 to-green-500" },
    { id: 4, title: "Boys Tees", subtitle: "Bold Colors", image: boyTee, color: "from-orange-400 to-red-500" },
    { id: 5, title: "Girls Skirts", subtitle: "Twirl Ready", image: girlDress, color: "from-purple-400 to-violet-500" },
    { id: 6, title: "Boys Tank Tops", subtitle: "Summer Vibes", image: boyTank, color: "from-yellow-400 to-amber-500" },
  ];

  const products = [
    { id: 1, name: "Pink Active Set", price: "₹899", image: girlLeggings, badge: "Bestseller", color: "bg-pink-500" },
    { id: 2, name: "Turquoise Tracksuit", price: "₹1,199", image: boyJoggers, badge: "New", color: "bg-cyan-500" },
    { id: 3, name: "Lime Running Shorts", price: "₹599", image: girlShorts, badge: "Sale", color: "bg-lime-500" },
    { id: 4, name: "Orange Sport Tee", price: "₹499", image: boyTee, badge: "Popular", color: "bg-orange-500" },
    { id: 5, name: "Purple Dance Skirt", price: "₹749", image: girlDress, badge: "Trending", color: "bg-purple-500" },
    { id: 6, name: "Yellow Tank Set", price: "₹699", image: boyTank, badge: "Hot", color: "bg-yellow-500" },
    { id: 7, name: "Coral Cozy Hoodie", price: "₹999", image: girlHoodie, badge: "Comfy", color: "bg-coral-500" },
    { id: 8, name: "Green Sport Jacket", price: "₹1,099", image: boyJacket, badge: "Premium", color: "bg-green-500" },
  ];

  const features = [
    { icon: Shield, title: "Safe Materials", desc: "Non-toxic, skin-friendly fabrics", color: "text-cyan-500" },
    { icon: Leaf, title: "Organic Cotton", desc: "100% certified organic", color: "text-green-500" },
    { icon: Zap, title: "Super Stretchy", desc: "Moves with your child", color: "text-yellow-500" },
    { icon: Heart, title: "Comfort First", desc: "Soft & breathable", color: "text-pink-500" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-pink-50/30 to-cyan-50/30 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-pink-300/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-cyan-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-40 left-1/3 w-80 h-80 bg-yellow-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-purple-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Colorful Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-cyan-500/10 to-yellow-500/10" />
        
        {/* Hero Image */}
        <div className="absolute inset-0">
          <img 
            src={heroKids} 
            alt="Kids Collection" 
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-white/60 via-transparent to-white/60" />
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-[10%] animate-bounce" style={{ animationDuration: '3s' }}>
          <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-rose-500 rounded-2xl rotate-12 shadow-lg shadow-pink-500/30" />
        </div>
        <div className="absolute top-40 right-[15%] animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full shadow-lg shadow-cyan-500/30" />
        </div>
        <div className="absolute bottom-40 left-[20%] animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '1s' }}>
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl shadow-lg shadow-yellow-500/30" />
        </div>
        <div className="absolute bottom-60 right-[10%] animate-bounce" style={{ animationDuration: '2.8s', animationDelay: '0.3s' }}>
          <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-violet-500 rounded-2xl -rotate-12 shadow-lg shadow-purple-500/30" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-cyan-500 text-white px-6 py-2 rounded-full mb-6 animate-pulse">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-semibold tracking-wide">NEW COLLECTION 2025</span>
            <Sparkles className="w-4 h-4" />
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-none">
            <span className="block bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
              KIDS
            </span>
            <span className="block text-[#111] mt-2">COLLECTION</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            Playful, comfortable & safe activewear designed for little champions. 
            Made with love, worn with joy.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/shop"
              className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-white px-8 py-4 rounded-full font-bold text-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/30"
            >
              <span className="relative z-10">SHOP NOW</span>
              <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            
            <Link 
              to="/size-chart/kids"
              className="inline-flex items-center gap-2 border-2 border-gray-900 text-gray-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-900 hover:text-white transition-all duration-300"
            >
              SIZE GUIDE
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 mt-12">
            {[
              { value: "100%", label: "Safe Materials" },
              { value: "50+", label: "Fun Colors" },
              { value: "2-13Y", label: "Age Range" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-black bg-gradient-to-r from-pink-500 to-cyan-500 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500 font-medium tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Strip */}
      <section className="relative py-8 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 overflow-hidden">
        <div className="absolute inset-0 opacity-50" />
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {features.map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-white">
                <feature.icon className="w-6 h-6" />
                <div>
                  <div className="font-bold text-sm tracking-wide">{feature.title}</div>
                  <div className="text-xs text-white/80">{feature.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="relative py-20 md:py-32">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block text-sm font-bold tracking-[0.3em] text-pink-500 mb-4">
              EXPLORE STYLES
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#111]">
              SHOP BY <span className="bg-gradient-to-r from-pink-500 to-cyan-500 bg-clip-text text-transparent">CATEGORY</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {categories.map((cat, i) => (
              <Link
                key={cat.id}
                to="/shop"
                className="group relative aspect-[3/4] rounded-3xl overflow-hidden cursor-pointer"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <img 
                  src={cat.image} 
                  alt={cat.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} opacity-0 group-hover:opacity-60 transition-opacity duration-500`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                <div className="absolute bottom-0 left-0 right-0 p-6 transform transition-transform duration-500 group-hover:translate-y-0">
                  <div className="text-white/80 text-xs font-semibold tracking-widest mb-1">{cat.subtitle}</div>
                  <h3 className="text-white text-xl md:text-2xl font-bold">{cat.title}</h3>
                  <div className="flex items-center gap-2 mt-3 text-white font-semibold opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                    <span className="text-sm">SHOP NOW</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="relative py-20 md:py-32 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block text-sm font-bold tracking-[0.3em] text-cyan-500 mb-4">
              TRENDING NOW
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#111]">
              KIDS <span className="bg-gradient-to-r from-cyan-500 to-purple-500 bg-clip-text text-transparent">FAVORITES</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {products.map((product, i) => (
              <Link 
                key={product.id}
                to="/shop"
                className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
              >
                {/* Badge */}
                <div className={`absolute top-4 left-4 z-10 ${product.color} text-white text-xs font-bold px-3 py-1 rounded-full`}>
                  {product.badge}
                </div>
                
                {/* Wishlist */}
                <button className="absolute top-4 right-4 z-10 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-pink-500 hover:text-white">
                  <Heart className="w-4 h-4" />
                </button>

                {/* Image */}
                <div className="aspect-square overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 group-hover:text-pink-500 transition-colors">{product.name}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-lg font-black bg-gradient-to-r from-pink-500 to-cyan-500 bg-clip-text text-transparent">
                      {product.price}
                    </span>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link 
              to="/shop"
              className="inline-flex items-center gap-2 bg-[#111] text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-gradient-to-r hover:from-pink-500 hover:to-cyan-500 transition-all duration-300"
            >
              VIEW ALL PRODUCTS
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Group Banner */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={kidsGroup} 
            alt="Kids Group" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/90 via-purple-500/80 to-cyan-500/90" />
        </div>
        
        <div className="relative z-10 container mx-auto px-6 text-center text-white">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6">
            MADE FOR <span className="text-yellow-300">PLAY</span>
          </h2>
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8 text-white/90">
            Every piece is designed to keep up with your child's endless energy. 
            Durable, washable, and always comfortable.
          </p>
          <Link 
            to="/categories/kids"
            className="inline-flex items-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-yellow-300 transition-all duration-300"
          >
            EXPLORE COLLECTION
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Age Groups */}
      <section className="relative py-20 md:py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block text-sm font-bold tracking-[0.3em] text-purple-500 mb-4">
              PERFECT FIT
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#111]">
              SHOP BY <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">AGE</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { age: "2-4Y", label: "Toddlers", color: "from-pink-400 to-rose-500", image: girlShorts },
              { age: "4-6Y", label: "Little Kids", color: "from-cyan-400 to-blue-500", image: boyTank },
              { age: "6-10Y", label: "Big Kids", color: "from-purple-400 to-violet-500", image: girlHoodie },
              { age: "10-13Y", label: "Pre-Teens", color: "from-orange-400 to-red-500", image: boyJacket },
            ].map((group, i) => (
              <Link 
                key={i}
                to="/shop"
                className="group relative aspect-square rounded-3xl overflow-hidden"
              >
                <img 
                  src={group.image} 
                  alt={group.label}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${group.color} opacity-70 group-hover:opacity-80 transition-opacity`} />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <span className="text-4xl md:text-5xl font-black">{group.age}</span>
                  <span className="text-sm md:text-base font-semibold tracking-wide mt-2">{group.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 md:py-32 bg-gradient-to-br from-[#111] via-gray-900 to-[#111] overflow-hidden">
        {/* Animated Dots */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i}
              className="absolute w-2 h-2 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: ['#ec4899', '#06b6d4', '#a855f7', '#eab308'][i % 4],
                opacity: 0.5,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        <div className="relative z-10 container mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500/20 to-cyan-500/20 border border-white/20 text-white px-6 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-semibold tracking-wide">SPECIAL OFFER</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6">
            GET <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">20% OFF</span>
          </h2>
          <p className="text-lg text-white/70 max-w-xl mx-auto mb-8">
            On your first kids collection order. Use code <span className="text-yellow-400 font-bold">KIDSFIRST</span> at checkout.
          </p>
          
          <Link 
            to="/shop"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-white px-10 py-5 rounded-full font-bold text-lg hover:scale-105 transition-transform duration-300 shadow-2xl shadow-purple-500/30"
          >
            SHOP KIDS COLLECTION
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Kids;
