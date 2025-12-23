import SEOHead from "@/components/seo/SEOHead";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import CategorySEOContent from "@/components/seo/CategorySEOContent";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const MensShorts = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Men's Shorts Manufacturer in India",
    "description": "Premium men's shorts manufactured in India. Sports shorts, gym shorts, running shorts, and casual shorts.",
    "url": "https://featherfashions.in/mens-shorts"
  };

  const seoContent = `
    <h2>Leading Men's Shorts Manufacturer in India</h2>
    <p>Feather Fashions has carved a niche as a premium men's shorts manufacturer, producing high-quality athletic and casual shorts from our state-of-the-art facility in Tirupur. Our shorts combine functional design with superior fabric technology to deliver products that perform excellently during sports activities while maintaining style for casual settings.</p>

    <h3>Performance-Focused Fabric Technology</h3>
    <p>Our men's shorts collection utilizes cutting-edge fabric technology for optimal performance. We manufacture using lightweight polyester mesh (120-150 GSM) for maximum breathability, polyester-spandex blends for unrestricted movement, moisture-wicking microfiber for intense workouts, and premium cotton blends for casual comfort. All athletic fabrics feature quick-dry technology and anti-odor treatment.</p>

    <h3>Comprehensive Shorts Collection</h3>
    <p>We produce a diverse range of men's shorts including athletic running shorts with split-leg design, gym shorts with compression liner options, basketball-style loose-fit shorts, casual cotton shorts for everyday wear, swim shorts with quick-dry fabric, and training shorts with secure pocket solutions. Inseam lengths range from 5" to 9" to accommodate various preferences.</p>

    <h3>Functional Design Features</h3>
    <p>Our shorts incorporate practical features demanded by active users. These include elastic waistbands with internal drawcords, side pockets with secure closures, back pockets for storage, built-in compression briefs for support, reflective elements for low-light visibility, and ventilation panels for enhanced airflow. Each design element is carefully engineered for performance.</p>

    <h3>Size Range for All Body Types</h3>
    <p>We offer comprehensive sizing from S to 4XL, ensuring every man finds their perfect fit. Our size development considers waist measurements, hip proportions, and thigh room specific to Indian body types. Elastic waistbands provide flexibility within sizes, while adjustable drawcords enable personalized fit for optimal comfort and performance.</p>

    <h3>Bulk Supply for Commercial Partners</h3>
    <p>As a reliable shorts manufacturer, we supply sports equipment retailers, fitness centers, school uniform suppliers, and athletic brand owners. Our bulk programs feature competitive pricing starting at 500-piece minimums, consistent quality across large orders, and the capacity to fulfill seasonal demand spikes efficiently.</p>

    <h3>Custom Manufacturing Solutions</h3>
    <p>Develop your unique shorts line with our custom manufacturing expertise. We offer fabric customization, color matching to brand specifications, custom print and embroidery placement, unique pocket configurations, branded waistband elastics, and complete packaging solutions. Our design team collaborates with clients to create distinctive products that stand out in competitive markets.</p>
  `;

  const relatedCategories = [
    { label: "Men's Sportswear", href: "/mens-sportswear" },
    { label: "Men's Joggers", href: "/mens-joggers" },
    { label: "Men's Track Pants", href: "/mens-track-pants" },
    { label: "Men's T-Shirts", href: "/mens-tshirts" },
  ];

  return (
    <>
      <SEOHead
        title="Men's Shorts Manufacturer in India | Feather Fashions"
        description="Premium men's shorts manufactured in India. Sports shorts, gym shorts, running shorts & casual shorts. Bulk orders available."
        canonicalUrl="/mens-shorts"
        keywords="mens shorts manufacturer India, sports shorts supplier, gym shorts wholesale, running shorts manufacturer Tirupur"
        structuredData={structuredData}
      />

      <div className="min-h-screen bg-background">
        <section className="relative py-20 md:py-28 bg-gradient-to-br from-background via-muted/20 to-background overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(0,144,255,0.1),transparent_50%)]" />
          <div className="container mx-auto px-4 relative z-10">
            <Breadcrumbs items={[
              { label: "Men's", href: "/mens" },
              { label: "Shorts" }
            ]} />
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground mb-6 leading-tight">
              Men's <span className="text-neon">Shorts</span> Manufacturer in India
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8">
              High-performance shorts for sports, gym, and casual wear. Factory-direct quality at competitive prices.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-neon hover:bg-neon/90 text-black font-bold">
                <Link to="/men">
                  Shop Shorts
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

export default MensShorts;
