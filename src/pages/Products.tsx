import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Maximize } from "lucide-react";
import ImageZoomDialog from "@/components/ImageZoomDialog";
import product1 from "@/assets/products/cloud-whisper-lounge-set.jpg";
import product1b from "@/assets/products/cloud-whisper-lounge-set-2.png";
import product2 from "@/assets/products/dream-weaver-kids-set.jpg";
import product2b from "@/assets/products/dream-weaver-kids-set-2.png";
import product3 from "@/assets/products/free-spirit-tshirt.jpg";
import product4 from "@/assets/products/little-explorer-kids-set.jpg";
import product5 from "@/assets/products/serenity-cardigan.jpg";
import product5b from "@/assets/products/serenity-cardigan-2.png";
import product6 from "@/assets/products/feathersoft-lounge-tee.jpg";
import product6b from "@/assets/products/feathersoft-lounge-tee-2.png";
import product6c from "@/assets/products/feathersoft-lounge-tee-3.png";
import product7 from "@/assets/products/dreamease-night-pants.jpg";
import product7b from "@/assets/products/dreamease-night-pants-2.png";
import product8 from "@/assets/products/featherflow-coord-set.jpg";
import product8b from "@/assets/products/featherflow-coord-set-2.png";
import product9 from "@/assets/products/cloudyday-cotton-set.jpg";
import product9b from "@/assets/products/cloudyday-cotton-set-2.png";
import product9c from "@/assets/products/cloudyday-cotton-set-3.png";
import product9d from "@/assets/products/cloudyday-cotton-set-4.png";
import product10 from "@/assets/products/dreamnest-pyjama-set.jpg";

const Products = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string } | null>(null);
  
  const categories = ["All", "Women", "Kids", "Loungewear", "Sleepwear"];
  
  const products = [
    { name: "Cloud Whisper Lounge Set", category: "Loungewear", fabric: "50% Modal, 50% Cotton", description: "Luxurious two-piece with wide-leg pants", image: product1 },
    { name: "Cloud Whisper Lounge Set - Grey", category: "Loungewear", fabric: "50% Modal, 50% Cotton", description: "Premium feather-print loungewear", image: product1b },
    { name: "Dream Weaver Sleep Set", category: "Kids", fabric: "100% Organic Cotton", description: "Cozy sleep tee and leggings", image: product2 },
    { name: "Dream Weaver Kids Set - Blue", category: "Kids", fabric: "100% Organic Cotton", description: "Adorable feathered friends design", image: product2b },
    { name: "Free Spirit T-Shirt", category: "Women", fabric: "Premium Slub Cotton", description: "Draped oversized tee", image: product3 },
    { name: "Little Explorer Set", category: "Kids", fabric: "100% Durable Cotton", description: "Adventure shorts and tee", image: product4 },
    { name: "Serenity Cardigan", category: "Women", fabric: "Lightweight Knit", description: "Flowing elegant cardigan", image: product5 },
    { name: "Serenity Wrap Cardigan - Beige", category: "Women", fabric: "Soft Knit Blend", description: "Cozy open-front layering piece", image: product5b },
    { name: "FeatherSoft Lounge Tee", category: "Loungewear", fabric: "95% Bamboo, 5% Spandex", description: "Ultra-soft relaxed fit", image: product6 },
    { name: "FeatherSoft Lounge Tee - Horse Print", category: "Loungewear", fabric: "95% Bamboo, 5% Spandex", description: "Playful pattern for comfort", image: product6b },
    { name: "FeatherSoft Lounge Tee - Cat Print", category: "Loungewear", fabric: "95% Bamboo, 5% Spandex", description: "Whimsical and ultra-soft", image: product6c },
    { name: "DreamEase Night Pants", category: "Sleepwear", fabric: "Modal Cotton", description: "Breathable with side pockets", image: product7 },
    { name: "DreamEase Night Pants - Floral", category: "Sleepwear", fabric: "Modal Cotton Blend", description: "Elegant polka dot sleepwear", image: product7b },
    { name: "FeatherFlow Co-ord Set", category: "Women", fabric: "French Terry", description: "Chic matching set", image: product8 },
    { name: "FeatherFlow Kids Set - Koala", category: "Kids", fabric: "100% Organic Cotton", description: "Adorable koala print for kids", image: product8b },
    { name: "CloudyDay Cotton Set", category: "Kids", fabric: "100% Organic Cotton", description: "Feather print tee and shorts", image: product9 },
    { name: "CloudyDay Set - Sweet Dreams", category: "Kids", fabric: "100% Organic Cotton", description: "Navy sleep set with bear print", image: product9b },
    { name: "CloudyDay Set - Bunny Bliss", category: "Kids", fabric: "100% Organic Cotton", description: "Charming bunny and floral design", image: product9c },
    { name: "CloudyDay Set - Moon Rabbit", category: "Kids", fabric: "100% Organic Cotton", description: "Dreamy moon and star pattern", image: product9d },
    { name: "DreamNest Pyjama Set", category: "Sleepwear", fabric: "Soft Muslin", description: "Feather-patterned nightwear", image: product10 },
  ];

  const filteredProducts = activeCategory === "All" ? products : products.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="divider-accent mb-6" />
          <h1 className="text-5xl md:text-6xl font-bold mb-4">Our Premium Collection</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Sustainable comfort meets modern style</p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <Button key={category} variant={activeCategory === category ? "default" : "outline"} onClick={() => setActiveCategory(category)} className={activeCategory === category ? "bg-secondary hover:bg-secondary/90" : "border-2"}>
              {category}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
          {filteredProducts.map((product, idx) => (
            <Card key={idx} className="overflow-hidden card-hover group">
              <div className="h-96 bg-muted relative cursor-pointer overflow-hidden" onClick={() => setSelectedImage({ src: product.image, alt: product.name })}>
                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <Badge className="absolute top-4 left-4 bg-secondary text-secondary-foreground">{product.category}</Badge>
                <Button variant="ghost" size="icon" className="absolute top-4 right-4 bg-white/90 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); setSelectedImage({ src: product.image, alt: product.name }); }}>
                  <Maximize className="h-4 w-4" />
                </Button>
              </div>
              <CardContent className="p-5">
                <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">{product.description}</p>
                <p className="text-sm font-medium text-primary mb-4">Fabric: {product.fabric}</p>
                <Button asChild variant="outline" className="w-full hover:bg-secondary hover:text-secondary-foreground border-2">
                  <Link to="/contact">Request Quote</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-gradient-to-r from-primary via-secondary to-accent text-white p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Need Custom Manufacturing?</h2>
          <p className="text-lg mb-6 text-white/90 max-w-2xl mx-auto">We specialize in bulk orders and custom designs with sustainable fabrics.</p>
          <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
            <Link to="/contact">Get in Touch</Link>
          </Button>
        </Card>

        <ImageZoomDialog imageSrc={selectedImage?.src || ""} imageAlt={selectedImage?.alt || ""} isOpen={!!selectedImage} onClose={() => setSelectedImage(null)} />
      </div>
    </div>
  );
};

export default Products;
