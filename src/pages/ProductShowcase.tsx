import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, CheckCircle, Package, Truck, Shield, Factory } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SEO from "@/components/seo/SEO";

// Import all product images
import womenNightwearImg from "@/assets/brochure/women-nightwear-brochure.jpg";
import kidsClothingImg from "@/assets/brochure/kids-clothing-brochure.jpg";
import cottonTshirtsImg from "@/assets/export-cotton-tshirts.jpg";
import pyjamasCasualImg from "@/assets/export-pyjamas-casualwear.jpg";
import innerwearBasicsImg from "@/assets/export-innerwear-basics.jpg";
import womenActivewear from "@/assets/b2b/products-women-activewear.jpg";
import menSportswear from "@/assets/b2b/products-men-sportswear.jpg";

const ProductShowcase = () => {
  // Main export categories with detailed descriptions
  const exportCategories = [
    {
      id: "womens-nightwear",
      title: "Women's Nightwear",
      subtitle: "Night Pants, Night Tops & Loungewear Sets",
      image: womenNightwearImg,
      description: "Premium women's nightwear collection designed for international wholesale and export markets. Our range includes comfortable night pants, breathable night tops, and coordinated loungewear sets manufactured with soft cotton and cotton-blend fabrics ideal for year-round comfort.",
      exportDetails: "High repeat-order potential with strong demand across Middle East, Africa, and Asian markets. Ideal for buying houses and retail chain procurement.",
      specs: [
        { label: "Fabrics", value: "100% Cotton, Cotton Blends" },
        { label: "GSM Range", value: "160-200 GSM" },
        { label: "Sizes", value: "S to 3XL" },
        { label: "MOQ", value: "Flexible for Exporters" },
      ],
      highlights: [
        "Color-fast dyeing (export standard)",
        "Consistent sizing across batches",
        "Soft breathable fabrics",
        "Export-ready packing options"
      ],
      link: "/contact",
    },
    {
      id: "kids-clothing",
      title: "Kids Cotton Clothing",
      subtitle: "Kids Sets, Pyjamas & Casual Wear",
      image: kidsClothingImg,
      description: "Vibrant, colorful kids clothing manufactured with child-safe, skin-friendly cotton fabrics. Our kidswear range includes coordinated sets, comfortable pyjamas, and casual wear designed for durability and comfort in international retail markets.",
      exportDetails: "Popular across Middle East, Africa, and Asian markets due to bright colors, quality construction, and competitive pricing. Strong repeat-order category.",
      specs: [
        { label: "Fabrics", value: "100% Cotton, Soft Blends" },
        { label: "GSM Range", value: "140-180 GSM" },
        { label: "Sizes", value: "1Y to 14Y" },
        { label: "MOQ", value: "Flexible for Bulk" },
      ],
      highlights: [
        "Vibrant, export-approved colors",
        "Durable stitching for active wear",
        "Skin-friendly fabrics",
        "Solid & printed options"
      ],
      link: "/contact",
    },
    {
      id: "cotton-tshirts",
      title: "Cotton T-Shirts",
      subtitle: "Wholesale Export Essential",
      image: cottonTshirtsImg,
      description: "High-demand cotton T-shirts designed for bulk export and wholesale supply. Manufactured with consistent sizing, smooth collar finishes, and long-lasting fabric quality suitable for international retail markets and private label programs.",
      exportDetails: "Essential export category with stable year-round demand. Suitable for private label, white label, and bulk wholesale programs across all international markets.",
      specs: [
        { label: "Fabrics", value: "100% Cotton, Combed Cotton" },
        { label: "GSM Range", value: "160-220 GSM" },
        { label: "Sizes", value: "XS to 4XL" },
        { label: "MOQ", value: "500+ pcs/color" },
      ],
      highlights: [
        "Consistent GSM & sizing",
        "Smooth collar finishing",
        "Ideal for bulk export programs",
        "Private label ready"
      ],
      link: "/contact",
    },
    {
      id: "pyjamas-casualwear",
      title: "Pyjamas & Casual Wear",
      subtitle: "Fast-Moving Export Category",
      image: pyjamasCasualImg,
      description: "Comfortable, climate-friendly pyjamas and casual wear collections developed for strong repeat demand in domestic and international markets. Relaxed fits with quality elastic and stitching for durability.",
      exportDetails: "Fast-moving category with year-round demand. High repeat-order potential from established buyers. Popular in comfort-focused retail segments.",
      specs: [
        { label: "Fabrics", value: "Cotton, Cotton Blends" },
        { label: "GSM Range", value: "150-190 GSM" },
        { label: "Sizes", value: "S to 3XL" },
        { label: "MOQ", value: "300+ pcs/style" },
      ],
      highlights: [
        "Breathable cotton fabrics",
        "Comfort-focused relaxed fits",
        "Year-round demand products",
        "High repeat-order potential"
      ],
      link: "/contact",
    },
    {
      id: "innerwear-basics",
      title: "Innerwear & Basics",
      subtitle: "Stable Export Demand",
      image: innerwearBasicsImg,
      description: "Essential innerwear and basic garments manufactured with quality consistency, durability, and comfort. Suitable for bulk wholesale and export markets with low return rates and high turnover potential.",
      exportDetails: "Stable demand category with consistent reorder patterns. Ideal for distributor supply chains and large retail programs. Low return rates.",
      specs: [
        { label: "Fabrics", value: "100% Cotton, Soft Cotton" },
        { label: "GSM Range", value: "140-180 GSM" },
        { label: "Sizes", value: "S to 3XL" },
        { label: "MOQ", value: "500+ pcs/style" },
      ],
      highlights: [
        "Soft, skin-friendly fabrics",
        "Consistent bulk production",
        "Ideal for distributor supply",
        "Low return, high turnover"
      ],
      link: "/contact",
    },
    {
      id: "womens-activewear",
      title: "Women's Activewear",
      subtitle: "Leggings, Sports Bras & Performance Tops",
      image: womenActivewear,
      description: "Premium compression leggings, high-support sports bras, and performance tops designed for comfort, style, and athletic functionality. Manufactured with stretch fabrics and moisture-wicking properties.",
      exportDetails: "Growing demand in fitness and athleisure segments. Suitable for private label brands and specialty activewear retailers.",
      specs: [
        { label: "Fabrics", value: "Cotton Lycra, Polyester Blend" },
        { label: "GSM Range", value: "180-280 GSM" },
        { label: "Sizes", value: "XS to 3XL" },
        { label: "MOQ", value: "200+ pcs/style" },
      ],
      highlights: [
        "4-way stretch fabrics",
        "Moisture-wicking properties",
        "Squat-proof construction",
        "Custom printing available"
      ],
      link: "/contact",
    },
    {
      id: "mens-sportswear",
      title: "Men's Sportswear",
      subtitle: "Track Pants, T-Shirts & Training Shorts",
      image: menSportswear,
      description: "Performance-driven sportswear including training tees, joggers, and athletic shorts for active lifestyles. Designed with durable construction and comfortable fits for everyday athletic use.",
      exportDetails: "Strong demand in sports retail and athleisure markets. Suitable for team wear, corporate fitness programs, and retail distribution.",
      specs: [
        { label: "Fabrics", value: "Cotton, Dry-Fit Polyester" },
        { label: "GSM Range", value: "160-270 GSM" },
        { label: "Sizes", value: "S to 4XL" },
        { label: "MOQ", value: "200+ pcs/style" },
      ],
      highlights: [
        "Durable athletic construction",
        "Comfortable relaxed fits",
        "Zip pocket options",
        "Team wear customization"
      ],
      link: "/contact",
    },
  ];

  // Product sub-types grid
  const productTypes = [
    { name: "Night Pants", types: ["Elastic Waist", "Drawstring", "Full Length", "Capri", "Printed"] },
    { name: "Night Tops", types: ["Short Sleeve", "Sleeveless", "Button Front", "V-Neck", "Round Neck"] },
    { name: "Kids Sets", types: ["Pyjama Sets", "Casual Sets", "Play Wear", "Sleep Sets", "Summer Sets"] },
    { name: "Cotton T-Shirts", types: ["Crew Neck", "V-Neck", "Polo", "Henley", "Long Sleeve"] },
    { name: "Loungewear", types: ["Coord Sets", "Shorts Sets", "Kaftan Style", "Nightgowns", "Robes"] },
    { name: "Basics & Innerwear", types: ["Vests", "Briefs", "Boxers", "Camisoles", "Slips"] },
    { name: "Track Pants", types: ["Joggers", "Straight Fit", "Slim Fit", "Cargo Style", "Zip Pocket"] },
    { name: "Activewear", types: ["Leggings", "Sports Bras", "Tank Tops", "Shorts", "Jackets"] },
  ];

  // Export advantages
  const exportAdvantages = [
    { icon: Factory, title: "Manufacturer Direct", desc: "No middlemen, competitive factory pricing" },
    { icon: Package, title: "Export Packing", desc: "International standard packaging & labeling" },
    { icon: Truck, title: "Reliable Dispatch", desc: "On-time delivery with tracking support" },
    { icon: Shield, title: "Quality Assured", desc: "Multi-stage inspection before shipment" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Export Products | Women's Nightwear, Kidswear, T-Shirts | Feather Fashions"
        description="Export-ready garment categories: Women's nightwear, kidswear, cotton T-shirts, pyjamas, innerwear & activewear. Wholesale manufacturer from Tiruppur, India for global markets."
        canonicalUrl="/products"
      />

      {/* Hero Section */}
      <section className="py-20 md:py-28 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-accent/5 pointer-events-none" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-block px-4 py-1.5 bg-accent/20 text-accent text-xs font-semibold tracking-[0.2em] uppercase rounded-full mb-6">
              Export Product Catalog
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Export-Ready
              <span className="block text-accent">Garment Categories</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-8">
              Complete range of export-quality apparel manufactured in Tiruppur, India. 
              Women's nightwear, kidswear, T-shirts, and essentials for international wholesale markets.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Link to="/export-brochure">
                  Download Export Brochure
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                <Link to="/contact">
                  Send Export Enquiry
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Export Advantages Strip */}
      <section className="py-8 bg-accent/10 border-y border-accent/20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {exportAdvantages.map((adv, index) => (
              <div key={index} className="flex items-center gap-3 justify-center md:justify-start">
                <adv.icon className="h-5 w-5 text-accent flex-shrink-0" />
                <div>
                  <p className="font-semibold text-foreground text-sm">{adv.title}</p>
                  <p className="text-xs text-muted-foreground hidden md:block">{adv.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Export Categories */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-accent text-sm font-semibold tracking-[0.2em] uppercase mb-4 block">
              Product Categories
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Export Garment Categories
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Each category manufactured with consistent quality, sizing accuracy, and export-ready specifications.
            </p>
          </div>

          <div className="space-y-20">
            {exportCategories.map((category, index) => (
              <article 
                key={category.id} 
                id={category.id}
                className={`grid lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}
              >
                {/* Image */}
                <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                  <div className="relative group rounded-2xl overflow-hidden">
                    <img 
                      src={category.image} 
                      alt={`${category.title} manufacturer India for export`}
                      className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                      width={600}
                      height={450}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="inline-block px-3 py-1 bg-accent text-accent-foreground text-xs font-semibold rounded-full">
                        Export Ready
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                  <span className="text-accent font-medium tracking-[0.15em] mb-2 text-sm uppercase block">
                    {category.subtitle}
                  </span>
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                    {category.title}
                  </h3>
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    {category.description}
                  </p>
                  <p className="text-sm text-accent/80 bg-accent/10 p-3 rounded-lg mb-6 border-l-2 border-accent">
                    <strong>Export Note:</strong> {category.exportDetails}
                  </p>
                  
                  {/* Specs Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {category.specs.map((spec, idx) => (
                      <div key={idx} className="bg-muted/50 p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                          {spec.label}
                        </p>
                        <p className="font-semibold text-foreground text-sm">{spec.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Highlights */}
                  <div className="grid grid-cols-2 gap-2 mb-6">
                    {category.highlights.map((highlight, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-accent flex-shrink-0" />
                        <span>{highlight}</span>
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
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* All Product Types Grid */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-accent font-medium tracking-[0.2em] mb-4 text-sm uppercase block">
              Full Product Range
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Product Types We Manufacture
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {productTypes.map((product, index) => (
              <Card key={index} className="border-2 hover:border-accent/50 transition-colors">
                <CardContent className="p-5">
                  <h3 className="text-lg font-bold mb-3 text-foreground">{product.name}</h3>
                  <ul className="space-y-1.5">
                    {product.types.map((type, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
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
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-accent font-medium tracking-[0.2em] mb-4 text-sm uppercase block">
                Private Label & OEM
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Export Customization Options
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-0 shadow-lg bg-card">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold mb-4 text-foreground">Branding Options</h3>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-accent" />
                      Custom hang tags & labels
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-accent" />
                      Woven brand labels
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-accent" />
                      Screen printing
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-accent" />
                      Heat transfer prints
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-accent" />
                      Custom packaging
                    </li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg bg-card">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold mb-4 text-foreground">Design Services</h3>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-accent" />
                      Tech pack development
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-accent" />
                      Pattern making
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-accent" />
                      Sample development
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-accent" />
                      Color matching
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-accent" />
                      Size grading
                    </li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg bg-card">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold mb-4 text-foreground">Export Support</h3>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-accent" />
                      Export documentation
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-accent" />
                      Quality inspection reports
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-accent" />
                      Packing list preparation
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-accent" />
                      Shipping coordination
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-accent" />
                      Bulk packing options
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Your Export Order?
          </h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            Whether you're a buying house, importer, or distributor looking for reliable manufacturing, 
            we're ready to discuss your requirements and provide competitive quotations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link to="/contact">
                Request Export Quotation
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
              <Link to="/export-brochure">
                Download Brochure
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
