import SEOHead from "@/components/seo/SEOHead";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import CategorySEOContent from "@/components/seo/CategorySEOContent";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const MensTshirts = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Men's T-Shirts Manufacturer in India",
    "description": "Premium men's t-shirts manufactured in India. Round neck, V-neck, polo, and sports t-shirts with export quality.",
    "url": "https://featherfashions.in/mens-tshirts"
  };

  const seoContent = `
    <h2>Premium Men's T-Shirts Manufacturing in India</h2>
    <p>Feather Fashions is recognized as one of India's foremost manufacturers of premium men's t-shirts, operating from our advanced facility in Tirupur—the country's knitwear capital. We produce a comprehensive range of t-shirts that combine contemporary styling, superior comfort, and exceptional durability, serving both domestic and export markets.</p>

    <h3>Diverse Fabric Options for Every Preference</h3>
    <p>Our t-shirt manufacturing covers an extensive fabric range. Choose from 100% combed cotton (160-200 GSM) for everyday comfort, cotton-lycra blends for enhanced fit and stretch, premium Supima and Pima cotton for luxury offerings, polyester-cotton combinations for performance wear, and organic cotton options for eco-conscious brands. Each fabric is available in regular and bio-washed finishes.</p>

    <h3>Complete Style Range</h3>
    <p>Our t-shirt collection encompasses all popular styles including classic round neck t-shirts in regular and slim fits, sophisticated V-neck options in varying depths, premium polo t-shirts with various collar styles, performance-oriented sports t-shirts with moisture management, and Henley t-shirts with button plackets. Sleeve options include half sleeves, three-quarter sleeves, and full sleeves.</p>

    <h3>Engineered for Indian Consumers</h3>
    <p>We've developed our fit and sizing specifically for Indian body proportions, offering sizes from XS to 5XL. Our t-shirts feature optimal body length and width ratios, comfortable armhole depths, and neck openings that don't stretch out. The fabric weight is balanced for India's climate—substantial enough for quality feel yet breathable for year-round wear.</p>

    <h3>Extensive Customization Capabilities</h3>
    <p>Our customization services cover every aspect of t-shirt production. We offer screen printing in up to 12 colors, high-definition digital printing, sublimation printing for all-over designs, embroidery with up to 15 colors, and specialty techniques including puff print, foil print, and discharge printing. Custom labels, tags, and packaging complete the branding experience.</p>

    <h3>Bulk Manufacturing Excellence</h3>
    <p>As an established t-shirt manufacturer, we serve diverse clients including retail brands, promotional merchandise companies, e-commerce platforms, and corporate buyers. Our capacity supports orders from 1,000 to 100,000+ pieces with consistent quality. We offer competitive pricing with volume-based discounts and maintain inventory of blanks for faster turnaround on repeat orders.</p>

    <h3>Export-Quality Standards</h3>
    <p>Every t-shirt we produce meets international quality benchmarks. Our quality control includes fabric inspection, size accuracy verification, color matching, print quality assessment, and final inspection. We comply with global testing standards including OEKO-TEX certification, ensuring our products are safe for consumers and suitable for export to demanding markets.</p>
  `;

  const relatedCategories = [
    { label: "Men's Sportswear", href: "/mens-sportswear" },
    { label: "Men's Joggers", href: "/mens-joggers" },
    { label: "Men's Track Pants", href: "/mens-track-pants" },
    { label: "Men's Shorts", href: "/mens-shorts" },
  ];

  return (
    <>
      <SEOHead
        title="Men's T-Shirts Manufacturer in India | Feather Fashions"
        description="Premium men's t-shirts manufactured in India. Round neck, V-neck, polo & sports t-shirts with export quality. Bulk orders & custom printing available."
        canonicalUrl="/mens-tshirts"
        keywords="mens tshirts manufacturer India, cotton tshirt supplier, polo tshirts wholesale, round neck tshirt manufacturer Tirupur"
        structuredData={structuredData}
      />

      <div className="min-h-screen bg-background">
        <section className="relative py-20 md:py-28 bg-gradient-to-br from-background via-muted/20 to-background overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(0,144,255,0.1),transparent_50%)]" />
          <div className="container mx-auto px-4 relative z-10">
            <Breadcrumbs items={[
              { label: "Men's", href: "/mens" },
              { label: "T-Shirts" }
            ]} />
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground mb-6 leading-tight">
              Men's <span className="text-neon">T-Shirts</span> Manufacturer in India
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8">
              Premium quality t-shirts in all styles. Custom printing and branding available for bulk orders.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-neon hover:bg-neon/90 text-black font-bold">
                <Link to="/men">
                  Shop T-Shirts
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

export default MensTshirts;
