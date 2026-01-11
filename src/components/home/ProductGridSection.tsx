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
      gradient: "from-pink-500/80 to-purple-600/80",
      alt: "Women cotton night pants wholesale manufacturer Tiruppur for export"
    },
    {
      name: "Women Night Tops",
      image: nightTopsImg,
      gradient: "from-purple-500/80 to-indigo-600/80",
      alt: "Ladies night tops loungewear manufacturer India for wholesale"
    },
    {
      name: "Kids Sets",
      image: kidsSetsImg,
      gradient: "from-teal-500/80 to-cyan-600/80",
      alt: "Kids cotton clothing sets exporter Tiruppur India for global markets"
    },
    {
      name: "Kids Pyjamas",
      image: kidsPyjamasImg,
      gradient: "from-sky-500/80 to-blue-600/80",
      alt: "Kids nightwear pyjamas wholesale supplier India for export"
    },
  ];

  return (
    <section className="py-24 bg-secondary relative overflow-hidden" aria-labelledby="product-catalog-heading">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5" aria-hidden="true">
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
          <h2 id="product-catalog-heading" className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Visual{" "}
            <span className="text-gradient-gold">Product Grid</span>
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Premium export-quality nightwear and kidswear at wholesale prices
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6" role="list">
          {products.map((product, index) => (
            <Link 
              key={index}
              to="/products"
              className="group relative overflow-hidden rounded-2xl aspect-[3/4] cursor-pointer"
              role="listitem"
              aria-label={`View ${product.name} wholesale collection`}
            >
              {/* Image with lazy loading */}
              <img 
                src={product.image} 
                alt={product.alt}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                width={300}
                height={400}
                loading="lazy"
                decoding="async"
              />
              
              {/* Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t ${product.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} aria-hidden="true" />
              
              {/* Default Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" aria-hidden="true" />
              
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
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
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
            <Link to="/products" aria-label="View full wholesale garment catalog">
              View Full Wholesale Catalog
              <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ProductGridSection;
