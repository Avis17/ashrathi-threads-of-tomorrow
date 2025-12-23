import SEOHead from "@/components/seo/SEOHead";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import CategorySEOContent from "@/components/seo/CategorySEOContent";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const MensInnerwear = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Men's Innerwear Manufacturer in India",
    "description": "Premium men's innerwear manufactured in India. Comfortable briefs, trunks, boxers, and vests with superior fabric quality.",
    "url": "https://featherfashions.in/mens-innerwear"
  };

  const seoContent = `
    <h2>Trusted Men's Innerwear Manufacturer in India</h2>
    <p>Feather Fashions is a leading manufacturer of premium men's innerwear based in Tirupur, India's textile capital. Our commitment to quality, comfort, and hygiene has made us a preferred supplier for retail brands, distributors, and e-commerce platforms across the country. We manufacture a comprehensive range of innerwear including briefs, trunks, boxer briefs, boxers, and vests.</p>

    <h3>Superior Fabrics for Ultimate Comfort</h3>
    <p>Our men's innerwear collection is crafted from the finest fabrics to ensure all-day comfort against the skin. We use 100% combed cotton (180-220 GSM) for breathability, cotton-modal blends for luxurious softness, and micro-modal variants for premium offerings. All fabrics undergo bio-polishing for smooth texture and are tested for skin sensitivity, making them safe for everyday wear.</p>

    <h3>Complete Range of Innerwear Styles</h3>
    <p>Our comprehensive product line includes classic briefs with supportive pouch construction, modern trunks with square-cut leg openings, athletic boxer briefs offering coverage and support, relaxed-fit boxers for comfort seekers, and ribbed cotton vests in both sleeveless and half-sleeve options. Each style is available in multiple waistband designs—covered elastic, exposed elastic, and branded waistband options.</p>

    <h3>Designed for Indian Climate and Preferences</h3>
    <p>Understanding the demands of India's tropical climate, our innerwear features moisture-wicking properties, anti-bacterial treatments, and enhanced breathability. Sizing ranges from S to 4XL with options for regular and extended waist sizes. The fabric weight and construction are optimized to prevent chafing and provide support during daily activities.</p>

    <h3>Bulk Manufacturing for Commercial Partners</h3>
    <p>We serve as a reliable innerwear manufacturing partner for retail chains, brand owners, and distributors. Our production capacity supports orders from 5,000 to 500,000+ pieces monthly with consistent quality and competitive pricing. We offer flexible packaging options including individual polybags, multi-pack configurations, and custom retail-ready packaging.</p>

    <h3>Private Label Innerwear Solutions</h3>
    <p>Launch or expand your innerwear brand with our comprehensive private label services. We provide custom fabric development, unique color and pattern options, branded elastic waistbands, custom hang tags and packaging, and exclusive design development. Our team works closely with clients from concept to delivery, ensuring brand vision is accurately translated into products.</p>

    <h3>Stringent Quality and Hygiene Standards</h3>
    <p>Given the intimate nature of innerwear, we maintain exceptional hygiene and quality standards. Our facility follows clean room protocols for finishing and packing, all products undergo pre-dispatch sanitization, and we conduct 100% inspection for defects. Fabric testing includes color fastness, shrinkage, pilling resistance, and tensile strength verification.</p>
  `;

  const relatedCategories = [
    { label: "Men's Sportswear", href: "/mens-sportswear" },
    { label: "Men's T-Shirts", href: "/mens-tshirts" },
    { label: "Men's Shorts", href: "/mens-shorts" },
    { label: "Men's Track Pants", href: "/mens-track-pants" },
  ];

  return (
    <>
      <SEOHead
        title="Men's Innerwear Manufacturer in India | Feather Fashions"
        description="Premium men's innerwear manufactured in India. Comfortable briefs, trunks, boxers & vests with superior fabric quality. Bulk orders available."
        canonicalUrl="/mens-innerwear"
        keywords="mens innerwear manufacturer India, briefs manufacturer Tirupur, boxers wholesale supplier, cotton vest manufacturer India"
        structuredData={structuredData}
      />

      <div className="min-h-screen bg-background">
        <section className="relative py-20 md:py-28 bg-gradient-to-br from-background via-muted/20 to-background overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(0,144,255,0.1),transparent_50%)]" />
          <div className="container mx-auto px-4 relative z-10">
            <Breadcrumbs items={[
              { label: "Men's", href: "/mens" },
              { label: "Innerwear" }
            ]} />
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground mb-6 leading-tight">
              Men's <span className="text-neon">Innerwear</span> Manufacturer in India
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8">
              Premium quality innerwear with superior comfort and durability. Trusted by leading brands across India.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-neon hover:bg-neon/90 text-black font-bold">
                <Link to="/categories/innerwear">
                  Shop Innerwear
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

export default MensInnerwear;
