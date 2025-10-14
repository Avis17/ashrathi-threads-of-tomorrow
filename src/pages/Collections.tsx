import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Maximize } from "lucide-react";
import ImageZoomDialog from "@/components/ImageZoomDialog";
import product1 from "@/assets/products/cloud-whisper-lounge-set.jpg";
import product1b from "@/assets/products/cloud-whisper-lounge-set-2.png";
import product2 from "@/assets/products/feathersoft-lounge-tee.jpg";
import product2b from "@/assets/products/feathersoft-lounge-tee-2.png";
import product2c from "@/assets/products/feathersoft-lounge-tee-3.png";
import product3 from "@/assets/products/dreamease-night-pants.jpg";
import product3b from "@/assets/products/dreamease-night-pants-2.png";
import product4 from "@/assets/products/featherflow-coord-set.jpg";
import product4b from "@/assets/products/featherflow-coord-set-2.png";
import product5 from "@/assets/products/free-spirit-tshirt.jpg";
import product6 from "@/assets/products/serenity-cardigan.jpg";
import product6b from "@/assets/products/serenity-cardigan-2.png";
import product7 from "@/assets/products/cloudyday-cotton-set.jpg";
import product7b from "@/assets/products/cloudyday-cotton-set-2.png";
import product7c from "@/assets/products/cloudyday-cotton-set-3.png";
import product7d from "@/assets/products/cloudyday-cotton-set-4.png";
import product8 from "@/assets/products/dreamnest-pyjama-set.jpg";
import product9 from "@/assets/products/dream-weaver-kids-set-2.png";
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

const Collections = () => {
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string } | null>(null);
  const newArrivals = [
    { name: "Cloud Whisper Lounge Set", fabric: "Modal Cotton", category: "Women", color: "Cream", image: product1, tag: "Bestseller" },
    { name: "Cloud Whisper - Grey Feather", fabric: "Modal Cotton", category: "Women", color: "Grey", image: product1b, tag: "New" },
    { name: "FeatherSoft Lounge Tee", fabric: "Bamboo Blend", category: "Unisex", color: "Moss Green", image: product2, tag: "New" },
    { name: "FeatherSoft - Horse Print", fabric: "Bamboo Blend", category: "Loungewear", color: "Blush Pink", image: product2b, tag: "Trending" },
    { name: "FeatherSoft - Cat Print", fabric: "Bamboo Blend", category: "Loungewear", color: "Cream", image: product2c, tag: "Premium" },
    { name: "DreamEase Night Pants", fabric: "Modal Cotton", category: "Women", color: "Lavender", image: product3, tag: "New" },
    { name: "DreamEase - Floral Dots", fabric: "Modal Cotton", category: "Sleepwear", color: "Sage Green", image: product3b, tag: "New" },
    { name: "FeatherFlow Co-ord Set", fabric: "French Terry", category: "Women", color: "Beige", image: product4, tag: "Trending" },
    { name: "FeatherFlow Kids - Koala", fabric: "Organic Cotton", category: "Kids", color: "Cream & Green", image: product4b, tag: "New" },
    { name: "Free Spirit T-Shirt", fabric: "Slub Cotton", category: "Women", color: "Natural", image: product5, tag: "Premium" },
    { name: "Serenity Cardigan", fabric: "Lightweight Knit", category: "Women", color: "Blush Pink", image: product6, tag: "New" },
    { name: "Serenity Wrap - Beige", fabric: "Soft Knit", category: "Women", color: "Beige", image: product6b, tag: "Bestseller" },
    { name: "CloudyDay Cotton Set", fabric: "Organic Cotton", category: "Kids", color: "Pastel Multi", image: product7, tag: "New" },
    { name: "CloudyDay - Sweet Dreams", fabric: "Organic Cotton", category: "Kids", color: "Navy", image: product7b, tag: "New" },
    { name: "CloudyDay - Bunny Bliss", fabric: "Organic Cotton", category: "Kids", color: "Sky Blue", image: product7c, tag: "New" },
    { name: "CloudyDay - Moon Rabbit", fabric: "Organic Cotton", category: "Kids", color: "Coral", image: product7d, tag: "Premium" },
    { name: "DreamNest Pyjama Set", fabric: "Muslin Cotton", category: "Kids", color: "Cream & Blue", image: product8, tag: "New" },
    { name: "Dream Weaver - Red Panda", fabric: "Organic Cotton", category: "Kids", color: "Sky Blue", image: product9, tag: "New" },
    { name: "Men's Track Pants - Teal", fabric: "Premium Cotton", category: "Men", color: "Deep Teal", image: mensTrackPantsTeal, tag: "New" },
    { name: "Men's Athletic Shorts - Teal", fabric: "Performance Cotton", category: "Men", color: "Deep Teal", image: mensShortsTeal, tag: "Bestseller" },
    { name: "Men's Polo - Orange", fabric: "Pique Cotton", category: "Men", color: "Bright Orange", image: mensPoloOrange, tag: "Premium" },
    { name: "FeatherSoft Lounge - Sage", fabric: "Bamboo Blend", category: "Women", color: "Sage Green", image: feathersoftSage, tag: "New" },
    { name: "Free Spirit - White V-Neck", fabric: "Slub Cotton", category: "Women", color: "Pure White", image: freeSpiritWhite, tag: "Bestseller" },
    { name: "Little Explorer - Blue Print", fabric: "Organic Cotton", category: "Kids", color: "Azure Blue", image: littleExplorerBlue, tag: "New" },
    { name: "DreamNest - Teal Bold", fabric: "Cotton Jersey", category: "Sleepwear", color: "Teal & White", image: dreamnestTeal, tag: "Trending" },
    { name: "FeatherFlow Kids - Stars", fabric: "Organic Cotton", category: "Kids", color: "Sage & Cream", image: featherflowKidsGreen, tag: "New" },
    { name: "Men's Joggers - Navy", fabric: "100% Cotton", category: "Men", color: "Navy Blue", image: mensTrackPantsNavy, tag: "New" },
    { name: "Men's Essential Tee - Charcoal", fabric: "Premium Cotton", category: "Men", color: "Charcoal Grey", image: mensTshirtCharcoal, tag: "Premium" },
    { name: "Men's Lounge Set - Sage", fabric: "Bamboo Cotton", category: "Men", color: "Sage Green", image: mensLoungeSetSage, tag: "Bestseller" },
    { name: "Men's Track Pants - Beige", fabric: "Organic Cotton", category: "Men", color: "Sand Beige", image: mensTrackPantsBeige, tag: "New" },
    { name: "Men's Henley - Moss", fabric: "Premium Cotton", category: "Men", color: "Moss Green", image: mensHenleyMoss, tag: "Premium" },
    { name: "Men's Co-ord - Black/White", fabric: "Cotton Jersey", category: "Men", color: "Monochrome", image: mensCoordSetBW, tag: "Trending" },
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
