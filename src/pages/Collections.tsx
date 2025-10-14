import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Maximize } from "lucide-react";
import ImageZoomDialog from "@/components/ImageZoomDialog";
import { useNewArrivals } from "@/hooks/useCollections";
import { Skeleton } from "@/components/ui/skeleton";

const Collections = () => {
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string } | null>(null);
  const { data: newArrivals = [], isLoading, error } = useNewArrivals();

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-accent text-accent-foreground text-base px-4 py-2">NEW ARRIVALS</Badge>
          <div className="divider-accent mb-6" />
          <h1 className="text-5xl md:text-6xl font-bold mb-4">Discover What's New</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Fresh designs in sustainable fabrics</p>
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-96 w-full" />
                <CardContent className="p-5 space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-destructive">Failed to load new arrivals. Please try again later.</p>
          </div>
        )}

        {!isLoading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
            {newArrivals.map((product) => (
              <Card key={product.id} className="overflow-hidden card-hover group">
                <div className="relative h-96 bg-muted cursor-pointer overflow-hidden" onClick={() => setSelectedImage({ src: product.image_url, alt: product.name })}>
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <Badge className="absolute top-4 left-4 bg-accent text-accent-foreground">{product.category}</Badge>
                  <Button variant="ghost" size="icon" className="absolute top-4 right-4 bg-white/90 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); setSelectedImage({ src: product.image_url, alt: product.name }); }}>
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
        )}

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
