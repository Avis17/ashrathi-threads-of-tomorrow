import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

const Products = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  
  const categories = ["All", "Men", "Women", "Kids", "Custom Orders"];
  
  const products = [
    { name: "SR Boys Super Poly Shorts", category: "Kids", fabric: "Super Poly", design: "1079" },
    { name: "Boys Track Pants", category: "Kids", fabric: "Cotton Blend", design: "2045" },
    { name: "Girls Printed Pant", category: "Kids", fabric: "Cotton", design: "3012" },
    { name: "Teenage HOS Pant Saleena", category: "Women", fabric: "Premium Cotton", design: "4567" },
    { name: "Kids Balloon Pant", category: "Kids", fabric: "Soft Cotton", design: "5089" },
    { name: "Men's Poly Shorts", category: "Men", fabric: "Polyester", design: "6123" },
    { name: "Girls Leggings", category: "Kids", fabric: "Stretch Cotton", design: "7234" },
    { name: "Zara Pant", category: "Women", fabric: "Premium Fabric", design: "8345" },
    { name: "SR Boys Poly Track Pant", category: "Kids", fabric: "Polyester Blend", design: "9456" },
    { name: "Girls Printed 3/4th", category: "Kids", fabric: "Cotton Print", design: "1567" },
    { name: "Men's Track Pants", category: "Men", fabric: "Sports Fabric", design: "2678" },
    { name: "Women's Leggings", category: "Women", fabric: "Elastic Cotton", design: "3789" },
  ];

  const filteredProducts = activeCategory === "All" 
    ? products 
    : products.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="divider-gold mb-6" />
          <h1 className="text-5xl md:text-6xl font-bold mb-4">Our Range of Products</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore the craftsmanship behind every stitch. Quality apparel designed for comfort and style.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <Button
              key={category}
              variant={activeCategory === category ? "default" : "outline"}
              onClick={() => setActiveCategory(category)}
              className={activeCategory === category ? "bg-secondary hover:bg-secondary/90" : ""}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
          {filteredProducts.map((product, idx) => (
            <Card key={idx} className="overflow-hidden card-hover">
              <div className="h-72 bg-gradient-to-br from-primary/5 via-secondary/10 to-accent/5 relative flex items-center justify-center">
                <span className="text-8xl opacity-10">👔</span>
                <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-accent font-semibold">
                  {product.category}
                </div>
              </div>
              <CardContent className="p-5">
                <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                <div className="flex justify-between text-sm text-muted-foreground mb-4">
                  <span>Fabric: {product.fabric}</span>
                  <span>#{product.design}</span>
                </div>
                <Button asChild variant="outline" className="w-full hover:bg-secondary hover:text-secondary-foreground">
                  <Link to="/contact">Request Quote</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Custom Orders CTA */}
        <Card className="bg-gradient-to-r from-primary to-secondary text-white p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Need Custom Manufacturing?</h2>
          <p className="text-lg mb-6 text-white/90 max-w-2xl mx-auto">
            We specialize in bulk orders, private labeling, and custom designs. Let's discuss your requirements.
          </p>
          <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
            <Link to="/contact">Get in Touch</Link>
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default Products;
