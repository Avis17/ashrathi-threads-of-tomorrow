import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Maximize } from "lucide-react";
import ImageZoomDialog from "@/components/ImageZoomDialog";
import { useProducts } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";
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
import mensTrackPantsTeal from "@/assets/products/mens-track-pants-teal.png";
import mensShortsTeal from "@/assets/products/mens-shorts-teal.png";
import mensPoloOrange from "@/assets/products/mens-polo-orange.png";
import feathersoftSage from "@/assets/products/feathersoft-lounge-tee-sage.png";
import freeSpiritWhite from "@/assets/products/free-spirit-white-vneck.png";
import littleExplorerBlue from "@/assets/products/little-explorer-blue-feather.png";
import dreamnestTeal from "@/assets/products/dreamnest-teal-feather.png";
import featherflowKidsGreen from "@/assets/products/featherflow-kids-green.png";
import mensTrackPantsNavy from "@/assets/products/mens-track-pants-navy.jpg";
import mensTshirtCharcoal from "@/assets/products/mens-tshirt-charcoal.jpg";
import mensLoungeSetSage from "@/assets/products/mens-lounge-set-sage.jpg";
import mensTrackPantsBeige from "@/assets/products/mens-track-pants-beige.jpg";
import mensHenleyMoss from "@/assets/products/mens-henley-moss.jpg";
import mensCoordSetBW from "@/assets/products/mens-coord-set-bw.jpg";

const Products = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string } | null>(null);
  const { data: products = [], isLoading, error } = useProducts();
  
  const categories = ["All", ...Array.from(new Set(products.map(p => p.category)))];
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

        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-96 w-full" />
                <CardContent className="p-5 space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-destructive">Failed to load products. Please try again later.</p>
          </div>
        )}

        {!isLoading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden card-hover group">
                <div className="h-96 bg-muted relative cursor-pointer overflow-hidden" onClick={() => setSelectedImage({ src: product.image_url, alt: product.name })}>
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <Badge className="absolute top-4 left-4 bg-secondary text-secondary-foreground">{product.category}</Badge>
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
