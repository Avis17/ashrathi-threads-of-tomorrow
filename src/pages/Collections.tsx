import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Maximize } from "lucide-react";
import ImageZoomDialog from "@/components/ImageZoomDialog";

const Collections = () => {
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string } | null>(null);
  const newArrivals = [
    { name: "Piping Shorts", design: "1079", category: "Kids", color: "Navy & Teal" },
    { name: "Premium Track Pants", design: "2180", category: "Men", color: "Charcoal Grey" },
    { name: "Comfort Leggings Pro", design: "3281", category: "Women", color: "Black & Purple" },
    { name: "Athletic Shorts Elite", design: "4382", category: "Kids", color: "Royal Blue" },
    { name: "Casual Cotton Pants", design: "5483", category: "Women", color: "Beige" },
    { name: "Sport Track Pants", design: "6584", category: "Men", color: "Navy & Orange" },
    { name: "Kids Balloon Pants", design: "7685", category: "Kids", color: "Multicolor" },
    { name: "Printed 3/4th Pants", design: "8786", category: "Kids", color: "Pink & White" },
  ];

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-accent text-accent-foreground">NEW ARRIVALS</Badge>
          <div className="divider-gold mb-6" />
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            Discover What's New
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Fresh designs and trending styles in Ashrathi Apparels. Explore our latest collection of premium garments.
          </p>
        </div>

        {/* New Arrivals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
          {newArrivals.map((item, idx) => (
            <Card key={idx} className="overflow-hidden card-hover group">
              <div 
                className="relative h-80 bg-gradient-to-br from-primary/10 via-secondary/15 to-accent/10 flex items-center justify-center cursor-pointer"
                onClick={() => setSelectedImage({ src: "", alt: item.name })}
              >
                <span className="text-9xl opacity-10 group-hover:scale-110 transition-transform">🧥</span>
                <Badge className="absolute top-4 left-4 bg-accent text-accent-foreground font-accent">
                  New Arrival
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage({ src: "", alt: item.name });
                  }}
                >
                  <Maximize className="h-4 w-4" />
                </Button>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <div className="text-white">
                    <p className="text-sm mb-1">Design #{item.design}</p>
                    <p className="text-sm">Color: {item.color}</p>
                  </div>
                </div>
              </div>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg">{item.name}</h3>
                  <Badge variant="outline" className="text-xs">
                    {item.category}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">Design No. {item.design}</p>
                <Button asChild variant="outline" className="w-full hover:bg-secondary hover:text-secondary-foreground">
                  <Link to="/contact">Request Sample</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-3">🎨</div>
              <h3 className="font-accent font-semibold text-xl mb-2">Modern Designs</h3>
              <p className="text-muted-foreground">Trending styles that appeal to all age groups</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-3">✨</div>
              <h3 className="font-accent font-semibold text-xl mb-2">Premium Fabrics</h3>
              <p className="text-muted-foreground">Quality materials for lasting comfort</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-3">🚀</div>
              <h3 className="font-accent font-semibold text-xl mb-2">Quick Turnaround</h3>
              <p className="text-muted-foreground">Fast production and delivery timelines</p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className="bg-primary text-primary-foreground p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Want to See Our Full Catalog?
          </h2>
          <p className="text-lg mb-6 text-primary-foreground/90 max-w-2xl mx-auto">
            Request our complete product catalog or get in touch to discuss custom designs and bulk orders.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-secondary hover:bg-secondary/90">
              <Link to="/contact">Request Catalog PDF</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-white/10 border-white text-white hover:bg-white hover:text-primary">
              <Link to="/products">Browse All Products</Link>
            </Button>
          </div>
        </Card>

        {/* Image Zoom Dialog */}
        <ImageZoomDialog
          imageSrc={selectedImage?.src || ""}
          imageAlt={selectedImage?.alt || ""}
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      </div>
    </div>
  );
};

export default Collections;
