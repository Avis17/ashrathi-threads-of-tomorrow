import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Maximize } from "lucide-react";
import ImageZoomDialog from "@/components/ImageZoomDialog";
import product1 from "@/assets/products/cloud-whisper-lounge-set.jpg";
import product2 from "@/assets/products/feathersoft-lounge-tee.jpg";
import product3 from "@/assets/products/dreamease-night-pants.jpg";
import product4 from "@/assets/products/featherflow-coord-set.jpg";
import product5 from "@/assets/products/free-spirit-tshirt.jpg";
import product6 from "@/assets/products/serenity-cardigan.jpg";
import product7 from "@/assets/products/cloudyday-cotton-set.jpg";
import product8 from "@/assets/products/dreamnest-pyjama-set.jpg";

const Collections = () => {
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string } | null>(null);
  const newArrivals = [
    { name: "Cloud Whisper Lounge Set", fabric: "Modal Cotton", category: "Women", color: "Cream", image: product1, tag: "Bestseller" },
    { name: "FeatherSoft Lounge Tee", fabric: "Bamboo Blend", category: "Unisex", color: "Moss Green", image: product2, tag: "New" },
    { name: "DreamEase Night Pants", fabric: "Modal Cotton", category: "Women", color: "Lavender", image: product3, tag: "New" },
    { name: "FeatherFlow Co-ord Set", fabric: "French Terry", category: "Women", color: "Beige", image: product4, tag: "Trending" },
    { name: "Free Spirit T-Shirt", fabric: "Slub Cotton", category: "Women", color: "Natural", image: product5, tag: "Premium" },
    { name: "Serenity Cardigan", fabric: "Lightweight Knit", category: "Women", color: "Blush Pink", image: product6, tag: "New" },
    { name: "CloudyDay Cotton Set", fabric: "Organic Cotton", category: "Kids", color: "Pastel Multi", image: product7, tag: "New" },
    { name: "DreamNest Pyjama Set", fabric: "Muslin Cotton", category: "Kids", color: "Cream & Blue", image: product8, tag: "New" },
  ];

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-accent text-accent-foreground text-base px-4 py-2">NEW ARRIVALS</Badge>
          <div className="divider-accent mb-6" />
          <h1 className="text-5xl md:text-6xl font-bold mb-4">Discover What's New</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Fresh designs in sustainable fabrics</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
          {newArrivals.map((item, idx) => (
            <Card key={idx} className="overflow-hidden card-hover group">
              <div className="relative h-96 bg-muted cursor-pointer overflow-hidden" onClick={() => setSelectedImage({ src: item.image, alt: item.name })}>
                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <Badge className="absolute top-4 left-4 bg-accent text-accent-foreground">{item.tag}</Badge>
                <Button variant="ghost" size="icon" className="absolute top-4 right-4 bg-white/90 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); setSelectedImage({ src: item.image, alt: item.name }); }}>
                  <Maximize className="h-4 w-4" />
                </Button>
              </div>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg">{item.name}</h3>
                  <Badge variant="outline" className="text-xs border-2">{item.category}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{item.fabric} • {item.color}</p>
                <Button asChild variant="outline" className="w-full hover:bg-secondary hover:text-secondary-foreground border-2">
                  <Link to="/contact">Request Sample</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-gradient-to-r from-primary to-secondary text-primary-foreground p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Want to See Our Full Catalog?</h2>
          <p className="text-lg mb-6 text-primary-foreground/90 max-w-2xl mx-auto">Request our complete product catalog or discuss custom designs.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
              <Link to="/contact">Request Catalog</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-white/10 border-white border-2 text-white hover:bg-white hover:text-primary">
              <Link to="/products">Browse All</Link>
            </Button>
          </div>
        </Card>

        <ImageZoomDialog imageSrc={selectedImage?.src || ""} imageAlt={selectedImage?.alt || ""} isOpen={!!selectedImage} onClose={() => setSelectedImage(null)} />
      </div>
    </div>
  );
};

export default Collections;
