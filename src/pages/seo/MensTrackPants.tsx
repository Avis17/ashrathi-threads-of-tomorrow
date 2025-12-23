import SEOHead from "@/components/seo/SEOHead";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import CategorySEOContent from "@/components/seo/CategorySEOContent";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const MensTrackPants = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Men's Track Pants Manufacturer in India",
    "description": "Premium men's track pants manufactured in India. Comfortable joggers and athletic pants for sports, gym, and daily wear.",
    "url": "https://featherfashions.in/mens-track-pants"
  };

  const seoContent = `
    <h2>India's Leading Men's Track Pants Manufacturer</h2>
    <p>Feather Fashions has established itself as a premier manufacturer of men's track pants in India, combining decades of textile expertise with modern production technology. Our Tirupur-based facility produces track pants that seamlessly blend comfort, durability, and contemporary style—making them ideal for sports, fitness activities, travel, and everyday casual wear.</p>

    <h3>Premium Fabric Selection for Optimal Comfort</h3>
    <p>Our track pants collection features carefully curated fabric blends designed for maximum comfort and longevity. We use 100% cotton terry (240-280 GSM) for plush comfort, cotton-polyester blends (60/40 or 70/30) for balanced breathability and shape retention, and premium polyester with spandex (2-5%) for athletic performance wear. Each fabric undergoes pre-shrunk treatment and colorfastness testing to ensure lasting quality.</p>

    <h3>Versatile Designs for Every Occasion</h3>
    <p>Our men's track pants range encompasses various styles to suit different preferences and activities. Choose from classic straight-leg track pants for timeless appeal, tapered joggers with cuffed ankles for a modern athletic look, slim-fit options for streamlined styling, or relaxed-fit comfort wear for lounging. All designs feature practical elements including deep side pockets, secure zippered pockets, and adjustable drawstring waistbands.</p>

    <h3>Engineered for the Indian Consumer</h3>
    <p>Understanding the diverse requirements of Indian men, we've developed comprehensive sizing from XS to 5XL, with regular and tall inseam options. Our track pants are designed with consideration for India's varied climate—breathable fabrics for summer, and fleece-lined options for cooler regions. The elastic waistbands are engineered for durability without losing stretch over time.</p>

    <h3>Bulk Manufacturing Excellence</h3>
    <p>As a bulk track pants manufacturer, we cater to diverse client needs including uniform suppliers, retail brands, corporate gifting companies, and sports organizations. Our production capacity allows for orders ranging from 500 to 50,000+ pieces per style with consistent quality across batches. We offer competitive MOQ-based pricing, customizable designs, and reliable delivery timelines.</p>

    <h3>Private Label and Custom Branding</h3>
    <p>Launch your own track pants line with our comprehensive private label services. We provide end-to-end support including custom design development, fabric selection, sample creation, branding integration, and packaging solutions. Our design team can work with your specifications or help develop new styles that align with current market trends.</p>

    <h3>Quality Control at Every Step</h3>
    <p>Every pair of track pants undergoes rigorous quality inspection including fabric quality verification, stitching integrity checks, wash tests for shrinkage and color bleeding, and final piece inspection before packaging. Our quality control processes ensure that each garment meets export-grade standards, making our products suitable for both domestic and international markets.</p>
  `;

  const relatedCategories = [
    { label: "Men's Sportswear", href: "/mens-sportswear" },
    { label: "Men's Joggers", href: "/mens-joggers" },
    { label: "Men's Shorts", href: "/mens-shorts" },
    { label: "Men's T-Shirts", href: "/mens-tshirts" },
  ];

  return (
    <>
      <SEOHead
        title="Men's Track Pants Manufacturer in India | Feather Fashions"
        description="Premium men's track pants manufactured in India. Comfortable joggers and athletic pants for sports, gym & daily wear. Bulk orders available."
        canonicalUrl="/mens-track-pants"
        keywords="mens track pants manufacturer India, bulk joggers supplier, athletic pants wholesale Tirupur, cotton track pants manufacturer"
        structuredData={structuredData}
      />

      <div className="min-h-screen bg-background">
        <section className="relative py-20 md:py-28 bg-gradient-to-br from-background via-muted/20 to-background overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(0,144,255,0.1),transparent_50%)]" />
          <div className="container mx-auto px-4 relative z-10">
            <Breadcrumbs items={[
              { label: "Men's", href: "/mens" },
              { label: "Track Pants" }
            ]} />
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground mb-6 leading-tight">
              Men's <span className="text-neon">Track Pants</span> Manufacturer in India
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8">
              Premium quality track pants with superior comfort. Perfect for sports, gym, and everyday wear.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-neon hover:bg-neon/90 text-black font-bold">
                <Link to="/men">
                  Shop Track Pants
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

export default MensTrackPants;
