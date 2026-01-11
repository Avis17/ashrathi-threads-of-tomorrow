import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SEO from "@/components/seo/SEO";
import womenActivewear from "@/assets/b2b/products-women-activewear.jpg";
import menSportswear from "@/assets/b2b/products-men-sportswear.jpg";

const ProductShowcase = () => {
  const categories = [
    {
      id: "womens-activewear",
      title: "Women's Activewear",
      subtitle: "Leggings, Sports Bras & Tops",
      image: womenActivewear,
      description: "Premium compression leggings, high-support sports bras, and performance tops designed for comfort and style.",
      specs: [
        { label: "Fabrics", value: "Cotton Lycra, Polyester Blend" },
        { label: "GSM Range", value: "180-280 GSM" },
        { label: "Sizes", value: "XS to 3XL" },
        { label: "Customization", value: "Available" },
      ],
      link: "/contact",
    },
    {
      id: "mens-sportswear",
      title: "Men's Sportswear",
      subtitle: "Track Pants, T-Shirts & Shorts",
      image: menSportswear,
      description: "Performance-driven sportswear including training tees, joggers, and athletic shorts for active lifestyles.",
      specs: [
        { label: "Fabrics", value: "Cotton, Dry-Fit Polyester" },
        { label: "GSM Range", value: "160-270 GSM" },
        { label: "Sizes", value: "S to 4XL" },
        { label: "Customization", value: "Available" },
      ],
      link: "/contact",
    },
  ];

  const productTypes = [
    { name: "Leggings", types: ["7/8 Length", "Ankle Length", "Full Length", "High Waist", "Maternity"] },
    { name: "Sports Bras", types: ["Low Support", "Medium Support", "High Impact", "Padded", "Racerback"] },
    { name: "T-Shirts", types: ["Crew Neck", "V-Neck", "Polo", "Sleeveless", "Long Sleeve"] },
    { name: "Track Pants", types: ["Joggers", "Straight Fit", "Slim Fit", "Cargo Style", "Zip Pocket"] },
    { name: "Shorts", types: ["Training", "Running", "2-in-1", "Compression", "Boxer Style"] },
    { name: "Custom Knitwear", types: ["Corporate Wear", "School Uniforms", "Event Apparel", "Team Wear"] },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Product Categories | Feather Fashions - Apparel Manufacturer India"
        description="Explore our activewear and sportswear categories. Premium leggings, sports bras, t-shirts, and custom knitwear for export. No MOQ barriers for sampling."
        canonicalUrl="/products"
      />

      {/* Hero Section */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-accent font-medium tracking-[0.3em] mb-4 text-sm uppercase">
              Product Portfolio
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-athletic font-black mb-6 leading-tight">
              MANUFACTURING
              <span className="block text-accent">CAPABILITIES</span>
            </h1>
            <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
              Explore our range of activewear and sportswear. Each category can be customized 
              to your brand specifications with private labeling options.
            </p>
          </div>
        </div>
      </section>

      {/* Main Categories */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="space-y-24">
            {categories.map((category, index) => (
              <div 
                key={category.id} 
                className={`grid lg:grid-cols-2 gap-16 items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}
              >
                <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                  <div className="relative group">
                    <img 
                      src={category.image} 
                      alt={category.title}
                      className="w-full rounded-2xl shadow-2xl"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                  <p className="text-accent font-medium tracking-[0.2em] mb-2 text-sm uppercase">
                    {category.subtitle}
                  </p>
                  <h2 className="text-3xl md:text-4xl font-athletic font-bold text-foreground mb-6">
                    {category.title.toUpperCase()}
                  </h2>
                  <p className="text-muted-foreground mb-8 leading-relaxed">
                    {category.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    {category.specs.map((spec, idx) => (
                      <div key={idx} className="bg-muted/50 p-4 rounded-lg">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                          {spec.label}
                        </p>
                        <p className="font-semibold text-foreground">{spec.value}</p>
                      </div>
                    ))}
                  </div>

                  <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                    <Link to={category.link}>
                      Enquire for Export / Bulk Orders
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* All Product Types */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-accent font-medium tracking-[0.3em] mb-4 text-sm uppercase">
              Full Range
            </p>
            <h2 className="text-3xl md:text-4xl font-athletic font-bold text-foreground">
              PRODUCT TYPES WE MANUFACTURE
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {productTypes.map((product, index) => (
              <Card key={index} className="border-2 hover:border-accent/50 transition-colors">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4 text-foreground">{product.name}</h3>
                  <ul className="space-y-2">
                    {product.types.map((type, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                        {type}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Customization Options */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-accent font-medium tracking-[0.3em] mb-4 text-sm uppercase">
                Private Labeling
              </p>
              <h2 className="text-3xl md:text-4xl font-athletic font-bold text-foreground">
                CUSTOMIZATION OPTIONS
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold mb-4">Branding Options</h3>
                  <ul className="space-y-3 text-muted-foreground">
                    <li>• Custom hang tags & labels</li>
                    <li>• Woven brand labels</li>
                    <li>• Screen printing</li>
                    <li>• Heat transfer prints</li>
                    <li>• Embroidery</li>
                    <li>• Custom packaging</li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold mb-4">Design Services</h3>
                  <ul className="space-y-3 text-muted-foreground">
                    <li>• Tech pack development</li>
                    <li>• Pattern making</li>
                    <li>• Sample development</li>
                    <li>• Color matching</li>
                    <li>• Fabric sourcing</li>
                    <li>• Size grading</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-athletic font-bold mb-6">
            Ready to Start Your Order?
          </h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            Whether you need samples or bulk production, our team is ready to assist. 
            Contact us with your requirements for a detailed quotation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link to="/contact">
                Request Quotation
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <Link to="/manufacturing">
                View Manufacturing
                <ArrowUpRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductShowcase;
