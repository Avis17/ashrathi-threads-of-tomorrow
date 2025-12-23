import SEOHead from "@/components/seo/SEOHead";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import CategorySEOContent from "@/components/seo/CategorySEOContent";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const MensJoggers = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Men's Joggers Manufacturer in India",
    "description": "Premium men's joggers manufactured in India. Stylish and comfortable athletic joggers for gym, running, and casual wear.",
    "url": "https://featherfashions.in/mens-joggers"
  };

  const seoContent = `
    <h2>Premium Men's Joggers Manufacturing in India</h2>
    <p>Feather Fashions has positioned itself at the forefront of men's joggers manufacturing in India, producing athletic wear that perfectly balances sporty aesthetics with all-day comfort. Our joggers have become the preferred choice for fitness enthusiasts, athletes, and fashion-forward individuals who refuse to compromise on quality or style.</p>

    <h3>Advanced Fabric Technology for Active Lifestyles</h3>
    <p>Our men's joggers feature innovative fabric compositions designed for maximum performance. We utilize premium French terry (260-300 GSM) for superior softness, moisture-wicking polyester blends for active wear, and cotton-elastane combinations that offer 4-way stretch. Each fabric undergoes anti-pilling treatment and enzyme washing for that premium lived-in feel from day one.</p>

    <h3>Contemporary Designs That Move With You</h3>
    <p>Our joggers collection showcases modern tapered silhouettes with elasticated cuffs that create a clean, athletic profile. Design features include ergonomic knee articulation for unrestricted movement, reinforced gussets for durability, and strategically placed pockets—including zippered side pockets and back pockets with secure closures. Available in solid colors, heather tones, and contemporary color-blocking options.</p>

    <h3>Perfect Fit for Indian Body Types</h3>
    <p>We've developed our sizing matrix specifically for Indian consumers, offering sizes from S to 4XL with both regular and slim-fit options. The elastic waistband with internal drawcord ensures a customizable fit, while the rise measurements are optimized for comfort during various activities—from high-intensity workouts to relaxed weekends.</p>

    <h3>Ideal for Multiple Use Cases</h3>
    <p>Our joggers seamlessly transition between different settings. Wear them to the gym for intense training sessions, during morning runs for unrestricted movement, while traveling for long-lasting comfort, or as stylish casual wear for everyday activities. The versatile design ensures you always look put-together without sacrificing comfort.</p>

    <h3>Wholesale and Bulk Order Capabilities</h3>
    <p>As an established joggers manufacturer, we supply to retail chains, online brands, fitness centers, and corporate clients across India. Our bulk ordering program offers tiered pricing based on quantity, with minimum orders starting at 300 pieces. We maintain buffer stock for popular styles to ensure quick turnaround for repeat orders.</p>

    <h3>Customization and Private Label Services</h3>
    <p>Build your activewear brand with our comprehensive customization options. We offer custom color development, embroidered or printed branding, custom waistband elastics, unique pocket configurations, and specialized packaging. Our product development team collaborates closely with clients to create exclusive jogger designs that stand out in the market.</p>
  `;

  const relatedCategories = [
    { label: "Men's Sportswear", href: "/mens-sportswear" },
    { label: "Men's Track Pants", href: "/mens-track-pants" },
    { label: "Men's Shorts", href: "/mens-shorts" },
    { label: "Men's T-Shirts", href: "/mens-tshirts" },
  ];

  return (
    <>
      <SEOHead
        title="Men's Joggers Manufacturer in India | Feather Fashions"
        description="Premium men's joggers manufactured in India. Stylish athletic joggers for gym, running & casual wear. Bulk orders & private labeling available."
        canonicalUrl="/mens-joggers"
        keywords="mens joggers manufacturer India, athletic joggers wholesale, slim fit joggers supplier, cotton joggers manufacturer Tirupur"
        structuredData={structuredData}
      />

      <div className="min-h-screen bg-background">
        <section className="relative py-20 md:py-28 bg-gradient-to-br from-background via-muted/20 to-background overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(0,144,255,0.1),transparent_50%)]" />
          <div className="container mx-auto px-4 relative z-10">
            <Breadcrumbs items={[
              { label: "Men's", href: "/mens" },
              { label: "Joggers" }
            ]} />
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground mb-6 leading-tight">
              Men's <span className="text-neon">Joggers</span> Manufacturer in India
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8">
              Stylish and comfortable joggers for the modern active lifestyle. Factory-direct quality at competitive prices.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-neon hover:bg-neon/90 text-black font-bold">
                <Link to="/men">
                  Shop Joggers
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/bulk-order">Request Bulk Quote</Link>
              </Button>
            </div>
          </div>
        </section>

        <CategorySEOContent 
          content={seoContent}
          relatedCategories={relatedCategories}
          parentCategory={{ label: "Men's Collection", href: "/mens" }}
        />
      </div>
    </>
  );
};

export default MensJoggers;
