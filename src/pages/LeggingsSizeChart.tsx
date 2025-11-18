import { useState } from "react";
import { Ruler, Heart, Sparkles } from "lucide-react";
import LeggingTypeSelector from "@/components/leggings/LeggingTypeSelector";
import DynamicSizeTable from "@/components/leggings/DynamicSizeTable";
import SizeCalculator from "@/components/leggings/SizeCalculator";
import { Button } from "@/components/ui/button";

export interface SizeData {
  size: string;
  waist?: string;
  hips: string;
  inseam?: string;
  [key: string]: string | undefined;
}

export interface LeggingType {
  id: string;
  name: string;
  description: string;
  bestFor: string;
  icon: typeof Ruler;
  sizes: SizeData[];
  color: string;
}

export const leggingTypes: LeggingType[] = [
  {
    id: "active-78",
    name: "High-Rise 7/8 Length Active Leggings",
    description: "Perfect for workouts and active lifestyle",
    bestFor: "Workouts, Yoga, Active Lifestyle",
    icon: Sparkles,
    color: "from-purple-500 to-pink-500",
    sizes: [
      { size: "XS", waist: "22-24", hips: "32-34", inseam: "24", thigh: "18-19" },
      { size: "S", waist: "24-26", hips: "34-36", inseam: "24", thigh: "19-20" },
      { size: "M", waist: "26-28", hips: "36-38", inseam: "24", thigh: "20-21" },
      { size: "L", waist: "28-30", hips: "38-40", inseam: "24", thigh: "21-22" },
      { size: "XL", waist: "30-32", hips: "40-42", inseam: "24", thigh: "22-23" },
      { size: "XXL", waist: "32-34", hips: "42-44", inseam: "24", thigh: "23-24" },
    ],
  },
  {
    id: "ankle-length",
    name: "High-Rise Ankle Length Leggings",
    description: "Versatile everyday wear",
    bestFor: "Everyday Wear, Office Casual",
    icon: Heart,
    color: "from-blue-500 to-cyan-500",
    sizes: [
      { size: "XS", waist: "22-24", hips: "32-34", inseam: "26", rise: "11" },
      { size: "S", waist: "24-26", hips: "34-36", inseam: "26", rise: "11" },
      { size: "M", waist: "26-28", hips: "36-38", inseam: "26", rise: "11" },
      { size: "L", waist: "28-30", hips: "38-40", inseam: "26", rise: "11" },
      { size: "XL", waist: "30-32", hips: "40-42", inseam: "26", rise: "11" },
      { size: "XXL", waist: "32-34", hips: "42-44", inseam: "26", rise: "11" },
      { size: "XXXL", waist: "34-36", hips: "44-46", inseam: "26", rise: "11" },
    ],
  },
  {
    id: "cotton-lycra",
    name: "Everyday Cotton Lycra Leggings",
    description: "Maximum comfort for daily wear",
    bestFor: "Daily Comfort, Loungewear",
    icon: Ruler,
    color: "from-green-500 to-emerald-500",
    sizes: [
      { size: "S", waist: "24-26", hips: "34-36", length: "38", stretch: "4-way" },
      { size: "M", waist: "26-28", hips: "36-38", length: "38", stretch: "4-way" },
      { size: "L", waist: "28-30", hips: "38-40", length: "38", stretch: "4-way" },
      { size: "XL", waist: "30-32", hips: "40-42", length: "38", stretch: "4-way" },
      { size: "XXL", waist: "32-34", hips: "42-44", length: "38", stretch: "4-way" },
      { size: "XXXL", waist: "34-36", hips: "44-46", length: "38", stretch: "4-way" },
      { size: "4XL", waist: "36-38", hips: "46-48", length: "38", stretch: "4-way" },
    ],
  },
  {
    id: "straight-fit",
    name: "Straight Fit Leggings",
    description: "Relaxed fit with comfort",
    bestFor: "Relaxed Fit, Tall Women",
    icon: Ruler,
    color: "from-amber-500 to-orange-500",
    sizes: [
      { size: "XS", waist: "22-24", hips: "32-34", legOpening: "7", length: "39" },
      { size: "S", waist: "24-26", hips: "34-36", legOpening: "7", length: "39" },
      { size: "M", waist: "26-28", hips: "36-38", legOpening: "7", length: "39" },
      { size: "L", waist: "28-30", hips: "38-40", legOpening: "7", length: "39" },
      { size: "XL", waist: "30-32", hips: "40-42", legOpening: "7", length: "39" },
      { size: "XXL", waist: "32-34", hips: "42-44", legOpening: "7", length: "39" },
    ],
  },
  {
    id: "maternity",
    name: "Maternity Leggings",
    description: "Designed for pregnancy comfort",
    bestFor: "Pregnancy (All Trimesters), Postpartum",
    icon: Heart,
    color: "from-pink-500 to-rose-500",
    sizes: [
      { size: "S", underBump: "24-26", overBump: "28-30", hips: "36-38", length: "38" },
      { size: "M", underBump: "26-28", overBump: "30-32", hips: "38-40", length: "38" },
      { size: "L", underBump: "28-30", overBump: "32-34", hips: "40-42", length: "38" },
      { size: "XL", underBump: "30-32", overBump: "34-36", hips: "42-44", length: "38" },
      { size: "XXL", underBump: "32-34", overBump: "36-38", hips: "44-46", length: "38" },
    ],
  },
];

export default function LeggingsSizeChart() {
  const [selectedType, setSelectedType] = useState<LeggingType | null>(null);
  const [showCalculator, setShowCalculator] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Hero Section */}
      <section className="relative py-12 px-4 text-center border-b bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5">
        <div className="container mx-auto max-w-4xl">
          <img 
            src="/logo.png" 
            alt="Feather Fashions" 
            className="h-20 w-auto mx-auto mb-6 animate-fade-in"
          />
          <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-fade-in">
            Women's Leggings Size Guide
          </h1>
          <p className="text-lg text-muted-foreground mb-6 animate-fade-in">
            Find Your Perfect Fit with Our Interactive Size Chart
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>10,000+ Happy Customers</span>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-wrap gap-3 justify-center">
            <Button
              variant={showCalculator ? "default" : "outline"}
              onClick={() => setShowCalculator(!showCalculator)}
              className="gap-2"
            >
              <Ruler className="w-4 h-4" />
              {showCalculator ? "Hide" : "Size"} Calculator
            </Button>
            <Button
              variant="outline"
              onClick={() => window.print()}
              className="gap-2"
            >
              Print Chart
            </Button>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Size Calculator */}
        {showCalculator && (
          <div className="mb-12 animate-fade-in">
            <SizeCalculator
              leggingTypes={leggingTypes}
              onTypeSelect={setSelectedType}
            />
          </div>
        )}

        {/* Type Selector */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">
            Select Your Legging Type
          </h2>
          <LeggingTypeSelector
            types={leggingTypes}
            selectedType={selectedType}
            onSelectType={setSelectedType}
          />
        </section>

        {/* Dynamic Size Table */}
        {selectedType && (
          <section className="mb-12 animate-fade-in">
            <DynamicSizeTable selectedType={selectedType} />
          </section>
        )}

        {/* Care Instructions */}
        <section className="bg-muted/50 rounded-2xl p-8 mb-12">
          <h3 className="text-2xl font-bold mb-4 text-center">Care Instructions</h3>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div>
              <h4 className="font-semibold mb-2">Washing</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Machine wash cold with similar colors</li>
                <li>• Use mild detergent</li>
                <li>• Turn inside out before washing</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Drying & Storage</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Tumble dry low or air dry</li>
                <li>• Do not bleach or iron</li>
                <li>• Store folded in a cool, dry place</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="text-center bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 rounded-2xl p-8">
          <h3 className="text-2xl font-bold mb-3">Still Unsure About Your Size?</h3>
          <p className="text-muted-foreground mb-6">
            Our size experts are here to help you find the perfect fit
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild size="lg">
              <a href="/contact">Contact Us</a>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="/">Browse Products</a>
            </Button>
          </div>
        </section>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          .sticky, button { display: none !important; }
          * { print-color-adjust: exact !important; }
        }
      `}</style>
    </div>
  );
}
