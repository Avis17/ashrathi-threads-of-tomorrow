import { useState } from "react";
import { Link } from "react-router-dom";
import { Ruler, Heart, Sparkles, ArrowLeft, Calculator, Printer } from "lucide-react";
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
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 bg-gradient-to-b from-[#1A1A1A] to-[#0A0A0A] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(212,175,55,0.08),transparent_50%)]" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
        
        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          {/* Back Button */}
          <Link 
            to="/size-guide" 
            className="inline-flex items-center gap-2 text-white/60 hover:text-accent transition-colors mb-8 group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-sm font-medium">Back to Size Guide</span>
          </Link>

          <div className="text-center max-w-3xl mx-auto">
            {/* Logo */}
            <img 
              src="/logo.png" 
              alt="Feather Fashions" 
              className="h-16 w-auto mx-auto mb-8 opacity-90"
            />
            
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 rounded-full mb-6">
              <Ruler className="h-4 w-4 text-accent" />
              <span className="text-accent text-sm font-medium tracking-wide uppercase">Size Chart</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white mb-6 leading-tight">
              Women's Leggings
              <span className="block text-accent mt-2">Size Guide</span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-8">
              Find your perfect fit with our interactive size chart. 
              Select your legging type below to see detailed measurements.
            </p>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 text-white/60">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent" />
                <span className="text-sm">10,000+ Happy Customers</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-white/20" />
              <div className="hidden sm:flex items-center gap-2">
                <Heart className="w-4 h-4 text-accent" />
                <span className="text-sm">5 Legging Styles</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions Bar */}
      <section className="sticky top-0 z-30 bg-[#1A1A1A]/95 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button
              variant={showCalculator ? "gold" : "outline"}
              onClick={() => setShowCalculator(!showCalculator)}
              className={`gap-2 ${!showCalculator ? 'border-white/20 text-white hover:bg-white/10 hover:text-white' : ''}`}
            >
              <Calculator className="w-4 h-4" />
              {showCalculator ? "Hide Calculator" : "Size Calculator"}
            </Button>
            <Button
              variant="outline"
              onClick={() => window.print()}
              className="gap-2 border-white/20 text-white hover:bg-white/10 hover:text-white"
            >
              <Printer className="w-4 h-4" />
              Print Chart
            </Button>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 lg:px-12 py-16 max-w-7xl">
        {/* Size Calculator */}
        {showCalculator && (
          <div className="mb-16 animate-fade-in">
            <SizeCalculator
              leggingTypes={leggingTypes}
              onTypeSelect={setSelectedType}
            />
          </div>
        )}

        {/* Type Selector */}
        <section className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-serif text-foreground mb-4">
              Select Your Legging Type
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Choose a style to view its detailed size chart and measurements
            </p>
          </div>
          <LeggingTypeSelector
            types={leggingTypes}
            selectedType={selectedType}
            onSelectType={setSelectedType}
          />
        </section>

        {/* Dynamic Size Table */}
        {selectedType && (
          <section className="mb-16 animate-fade-in">
            <DynamicSizeTable selectedType={selectedType} />
          </section>
        )}

        {/* Care Instructions */}
        <section className="mb-16">
          <div className="bg-[#1A1A1A] rounded-2xl p-8 lg:p-12 border border-white/10">
            <h3 className="text-2xl md:text-3xl font-serif text-white mb-8 text-center">
              Care Instructions
            </h3>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-accent" />
                  </span>
                  Washing
                </h4>
                <ul className="text-white/70 space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0" />
                    Machine wash cold with similar colors
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0" />
                    Use mild detergent
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0" />
                    Turn inside out before washing
                  </li>
                </ul>
              </div>
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                    <Heart className="w-4 h-4 text-accent" />
                  </span>
                  Drying & Storage
                </h4>
                <ul className="text-white/70 space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0" />
                    Tumble dry low or air dry
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0" />
                    Do not bleach or iron
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0" />
                    Store folded in a cool, dry place
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="text-center">
          <div className="bg-gradient-to-r from-accent/10 via-accent/5 to-accent/10 rounded-2xl p-8 lg:p-12 border border-accent/20">
            <h3 className="text-2xl md:text-3xl font-serif text-foreground mb-4">
              Still Unsure About Your Size?
            </h3>
            <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
              Our size experts are here to help you find the perfect fit
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button asChild size="xl" variant="gold">
                <Link to="/contact">Contact Us</Link>
              </Button>
              <Button asChild variant="outline" size="xl">
                <Link to="/shop">Browse Products</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          .sticky, button, nav, footer { display: none !important; }
          * { print-color-adjust: exact !important; }
        }
      `}</style>
    </div>
  );
}
