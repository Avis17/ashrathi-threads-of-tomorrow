import SEOHead from "@/components/seo/SEOHead";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import CategorySEOContent from "@/components/seo/CategorySEOContent";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const MensSportswear = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Men's Sportswear Manufacturer in India",
    "description": "Premium men's sportswear manufactured in India with export-quality fabric. Bulk orders and private labeling available.",
    "url": "https://featherfashions.in/mens-sportswear",
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": [
        { "@type": "Product", "name": "Men's Sports T-Shirts", "category": "Sportswear" },
        { "@type": "Product", "name": "Men's Track Pants", "category": "Sportswear" },
        { "@type": "Product", "name": "Men's Joggers", "category": "Sportswear" },
        { "@type": "Product", "name": "Men's Sports Shorts", "category": "Sportswear" }
      ]
    }
  };

  const seoContent = `
    <h2>Premium Men's Sportswear Manufacturing in India</h2>
    <p>Feather Fashions stands as India's trusted manufacturer of premium men's sportswear, delivering performance-driven apparel that meets international quality standards. Our state-of-the-art facility in Tirupur produces sportswear designed for athletes, fitness enthusiasts, and active lifestyle seekers who demand nothing but the best in comfort and durability.</p>

    <h3>Superior Fabric Technology for Peak Performance</h3>
    <p>Our men's sportswear collection features carefully selected fabrics including moisture-wicking polyester blends (180-220 GSM), breathable cotton-polyester combinations, and advanced 4-way stretch materials with spandex integration. Each garment undergoes rigorous testing to ensure optimal sweat management, quick-dry capabilities, and exceptional shape retention even after multiple washes.</p>

    <h3>Versatile Sportswear for Every Activity</h3>
    <p>Whether you're training at the gym, running outdoors, playing team sports, or simply enjoying an active lifestyle, our men's sportswear range covers all bases. From lightweight performance tees and compression wear to track pants and athletic shorts, each piece is engineered for movement, comfort, and style. Our designs incorporate ergonomic cuts that allow unrestricted motion during high-intensity activities.</p>

    <h3>Fit and Comfort Engineered for Indian Athletes</h3>
    <p>Understanding the unique requirements of Indian body types, we've developed size charts specifically calibrated for our domestic market. Our sportswear features flatlock seams to prevent chafing, reinforced stitching at stress points, and strategic ventilation zones for enhanced breathability during intense workouts in India's varied climate conditions.</p>

    <h3>Bulk Orders and Private Label Solutions</h3>
    <p>As a leading sportswear manufacturer, we offer comprehensive bulk ordering options for gyms, sports clubs, corporate wellness programs, and retail businesses. Our private label services enable brands to launch their own sportswear lines with customized designs, branding, and packaging. Minimum order quantities start from 500 pieces per style with competitive pricing that improves with volume.</p>

    <h3>Export-Quality Manufacturing Standards</h3>
    <p>Our production facility adheres to international manufacturing standards, making our sportswear suitable for global markets. We maintain strict quality control protocols at every stage—from fabric inspection and cutting to stitching and final finishing. This commitment to excellence has earned us partnerships with brands across India, the Middle East, Europe, and North America.</p>

    <h3>Sustainable and Responsible Manufacturing</h3>
    <p>Feather Fashions is committed to sustainable manufacturing practices. We utilize eco-friendly dyes, minimize water consumption through advanced processing techniques, and ensure ethical working conditions throughout our supply chain. Our facility is equipped with modern effluent treatment systems, and we continuously invest in reducing our environmental footprint while maintaining product quality.</p>
  `;

  const relatedCategories = [
    { label: "Men's Track Pants", href: "/mens-track-pants" },
    { label: "Men's Joggers", href: "/mens-joggers" },
    { label: "Men's T-Shirts", href: "/mens-tshirts" },
    { label: "Men's Shorts", href: "/mens-shorts" },
    { label: "Men's Innerwear", href: "/mens-innerwear" },
  ];

  return (
    <>
      <SEOHead
        title="Men's Sportswear Manufacturer in India | Feather Fashions"
        description="Premium men's sportswear manufactured in India with export-quality fabric. Gym wear, track pants, joggers & athletic apparel. Bulk orders & private labeling available."
        canonicalUrl="/mens-sportswear"
        keywords="mens sportswear manufacturer India, bulk sportswear supplier, athletic wear manufacturer Tirupur, gym clothing wholesale, performance apparel India"
        structuredData={structuredData}
      />

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative py-20 md:py-28 bg-gradient-to-br from-background via-muted/20 to-background overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(0,144,255,0.1),transparent_50%)]" />
          <div className="container mx-auto px-4 relative z-10">
            <Breadcrumbs items={[
              { label: "Men's", href: "/mens" },
              { label: "Sportswear" }
            ]} />
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground mb-6 leading-tight">
              Men's <span className="text-neon">Sportswear</span> Manufacturer in India
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8">
              Premium performance sportswear engineered for athletes. Factory-direct pricing with export-quality manufacturing standards.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-neon hover:bg-neon/90 text-black font-bold">
                <Link to="/men">
                  Shop Men's Collection
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/bulk-order">Request Bulk Quote</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Product Categories Grid */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">
              Men's Sportswear Categories
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedCategories.map((cat) => (
                <Link
                  key={cat.href}
                  to={cat.href}
                  className="p-6 bg-background border border-border rounded-xl hover:border-neon/50 hover:shadow-lg hover:shadow-neon/10 transition-all group text-center"
                >
                  <h3 className="font-semibold text-foreground group-hover:text-neon transition-colors">
                    {cat.label}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* SEO Content */}
        <CategorySEOContent 
          content={seoContent}
          relatedCategories={relatedCategories}
          parentCategory={{ label: "Men's Collection", href: "/mens" }}
        />
      </div>
    </>
  );
};

export default MensSportswear;
