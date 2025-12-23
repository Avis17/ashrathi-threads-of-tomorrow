import SEOHead from "@/components/seo/SEOHead";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import CategorySEOContent from "@/components/seo/CategorySEOContent";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const WomensLeggings = () => {
  const seoContent = `
    <h2>Premium Women's Leggings Manufacturing in India</h2>
    <p>Feather Fashions stands as India's premier manufacturer of women's leggings, crafting high-performance activewear from our advanced Tirupur facility. Our leggings combine cutting-edge fabric technology with flattering designs that empower women during workouts, yoga sessions, and everyday activities.</p>

    <h3>Advanced Performance Fabrics</h3>
    <p>Our leggings feature premium 270 GSM polyester-spandex blends with 4-way stretch technology. The fabric offers superior compression, moisture-wicking properties, and squat-proof opacity. Available in matte, sheen, and brushed finishes for different aesthetic preferences.</p>

    <h3>Flattering Designs for Every Body</h3>
    <p>We manufacture high-waisted leggings with tummy control panels, mid-rise options for versatile wear, and seamless designs for maximum comfort. Features include hidden waistband pockets, mesh ventilation panels, and contour stitching that enhances natural curves.</p>

    <h3>Size-Inclusive Manufacturing</h3>
    <p>Our size range spans XS to 4XL, developed specifically for Indian body proportions. Each size is tested for stretch recovery, opacity, and comfortable compression that supports without restricting movement.</p>

    <h3>Bulk Orders and Private Label</h3>
    <p>We serve fitness brands, retail chains, and e-commerce platforms with minimum orders from 300 pieces. Custom options include unique prints, branded waistbands, and exclusive color development.</p>
  `;

  const relatedCategories = [
    { label: "Women's 7/8 Leggings", href: "/womens-7-8-leggings" },
    { label: "Women's Sports Bra", href: "/womens-sports-bra" },
    { label: "Women's Joggers", href: "/womens-joggers" },
    { label: "Women's Gym Wear", href: "/womens-gym-wear" },
  ];

  return (
    <>
      <SEOHead
        title="Women's Leggings Manufacturer in India | Feather Fashions"
        description="Premium women's leggings manufactured in India. High-waisted, squat-proof activewear with 4-way stretch. Bulk orders & private labeling available."
        canonicalUrl="/womens-leggings"
      />
      <div className="min-h-screen bg-background">
        <section className="relative py-20 md:py-28 bg-gradient-to-br from-background via-muted/20 to-background">
          <div className="container mx-auto px-4">
            <Breadcrumbs items={[{ label: "Women's", href: "/womens" }, { label: "Leggings" }]} />
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground mb-6">
              Women's <span className="text-neon">Leggings</span> Manufacturer in India
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mb-8">Premium performance leggings with 4-way stretch technology.</p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-neon hover:bg-neon/90 text-black font-bold">
                <Link to="/women">Shop Leggings <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline"><Link to="/bulk-order">Request Bulk Quote</Link></Button>
            </div>
          </div>
        </section>
        <CategorySEOContent content={seoContent} relatedCategories={relatedCategories} parentCategory={{ label: "Women's Collection", href: "/womens" }} />
      </div>
    </>
  );
};

export default WomensLeggings;
