import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import nightPantsImg from "@/assets/b2b/product-night-pants.jpg";
import nightTopsImg from "@/assets/b2b/product-night-tops.jpg";
import kidsSetsImg from "@/assets/b2b/product-kids-sets.jpg";
import kidsPyjamasImg from "@/assets/b2b/product-kids-pyjamas.jpg";

const ProductGridSection = () => {
  const products = [
    {
      name: "Women Night Pants",
      image: nightPantsImg,
      gradient: "from-pink-500/80 to-purple-600/80"
    },
    {
      name: "Women Night Tops",
      image: nightTopsImg,
      gradient: "from-purple-500/80 to-indigo-600/80"
    },
    {
      name: "Kids Sets",
      image: kidsSetsImg,
      gradient: "from-teal-500/80 to-cyan-600/80"
    },
    {
      name: "Kids Pyjamas",
      image: kidsPyjamasImg,
      gradient: "from-sky-500/80 to-blue-600/80"
    },
  ];

  return (
    <section className="py-24 bg-secondary relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-white/5 border border-white/10 rounded-full text-gold text-sm font-semibold tracking-wide uppercase mb-6">
            Product Catalog
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Visual{" "}
            <span className="text-gradient-gold">Product Grid</span>
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Premium export-quality nightwear and kidswear at wholesale prices
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <Link 
              key={index}
              to="/products"
              className="group relative overflow-hidden rounded-2xl aspect-[3/4] cursor-pointer"
            >
              {/* Image */}
              <img 
                src={product.image} 
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              {/* Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t ${product.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              {/* Default Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              
              {/* Badge */}
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1.5 bg-gold/90 text-black text-xs font-bold rounded-full">
                  WHOLESALE / EXPORT ONLY
                </span>
              </div>
              
              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-xl font-bold text-white mb-2">{product.name}</h3>
                <div className="flex items-center gap-2 text-white/80 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span>View Collection</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button 
            asChild 
            size="lg"
            className="bg-gradient-to-r from-gold to-amber-500 text-black hover:from-gold/90 hover:to-amber-500/90 px-8"
          >
            <Link to="/products">
              View Full Wholesale Catalog
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ProductGridSection;
