import SEOHead from "@/components/seo/SEOHead";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import CategorySEOContent from "@/components/seo/CategorySEOContent";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const WomensSportsBra = () => {
  const seoContent = `
    <h2>Women's Sports Bra Manufacturing in India</h2>
    <p>Feather Fashions is a trusted manufacturer of women's sports bras, producing supportive, comfortable, and stylish athletic bras from our Tirupur facility. Our sports bras are engineered for performance across all impact levels—from yoga and pilates to running and high-intensity training.</p>

    <h3>Support Levels for Every Activity</h3>
    <p>We manufacture light support bras for yoga and stretching, medium support for cycling and weight training, and high support for running and HIIT workouts. Each support level features appropriate compression and encapsulation design elements.</p>

    <h3>Premium Technical Fabrics</h3>
    <p>Our sports bras use moisture-wicking polyester-spandex blends with anti-bacterial treatment, breathable mesh panels, and smooth edges that eliminate chafing. Power mesh provides structure while maintaining comfort during extended wear.</p>

    <h3>Inclusive Sizing</h3>
    <p>We offer sizes from XS to 3XL with band sizes 28-44 and cup equivalents A-DD. Our patterns are developed for Indian body proportions, ensuring proper coverage and support across all size ranges.</p>

    <h3>Bulk and Private Label Manufacturing</h3>
    <p>We serve fitness brands, lingerie retailers, and athletic wear companies with comprehensive manufacturing solutions including custom colors, prints, and branded elements.</p>
  `;

  const relatedCategories = [
    { label: "Women's Leggings", href: "/womens-leggings" },
    { label: "Women's Gym Wear", href: "/womens-gym-wear" },
    { label: "Women's Innerwear", href: "/womens-innerwear" },
  ];

  return (
    <>
      <SEOHead title="Women's Sports Bra Manufacturer in India | Feather Fashions" description="Premium women's sports bras manufactured in India. High support athletic bras for gym, yoga & running. Bulk orders available." canonicalUrl="/womens-sports-bra" />
      <div className="min-h-screen bg-background">
        <section className="relative py-20 md:py-28 bg-gradient-to-br from-background via-muted/20 to-background">
          <div className="container mx-auto px-4">
            <Breadcrumbs items={[{ label: "Women's", href: "/womens" }, { label: "Sports Bra" }]} />
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground mb-6">Women's <span className="text-neon">Sports Bra</span> Manufacturer</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mb-8">High-performance sports bras for all activity levels.</p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-neon hover:bg-neon/90 text-black font-bold"><Link to="/women">Shop Sports Bras <ArrowRight className="ml-2 h-5 w-5" /></Link></Button>
              <Button asChild size="lg" variant="outline"><Link to="/bulk-order">Request Bulk Quote</Link></Button>
            </div>
          </div>
        </section>
        <CategorySEOContent content={seoContent} relatedCategories={relatedCategories} parentCategory={{ label: "Women's Collection", href: "/womens" }} />
      </div>
    </>
  );
};

export default WomensSportsBra;
