import { useState } from "react";
import { Link } from "react-router-dom";
import { Ruler, ArrowLeft, Calculator, Printer, Sparkles, Check, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SizeData {
  size: string;
  waist: string;
  hip: string;
  inseam: string;
  outseam: string;
  thigh: string;
  popular?: boolean;
}

const trackPantsSizes: SizeData[] = [
  { size: "S", waist: "28-30", hip: "36-38", inseam: "28", outseam: "38", thigh: "22" },
  { size: "M", waist: "30-32", hip: "38-40", inseam: "29", outseam: "39", thigh: "23", popular: true },
  { size: "L", waist: "32-34", hip: "40-42", inseam: "30", outseam: "40", thigh: "24", popular: true },
  { size: "XL", waist: "34-36", hip: "42-44", inseam: "31", outseam: "41", thigh: "25", popular: true },
  { size: "XXL", waist: "36-38", hip: "44-46", inseam: "31", outseam: "42", thigh: "26" },
  { size: "3XL", waist: "38-40", hip: "46-48", inseam: "32", outseam: "43", thigh: "27" },
  { size: "4XL", waist: "40-42", hip: "48-50", inseam: "32", outseam: "44", thigh: "28" },
];

const joggerSizes: SizeData[] = [
  { size: "S", waist: "28-30", hip: "36-38", inseam: "27", outseam: "37", thigh: "22" },
  { size: "M", waist: "30-32", hip: "38-40", inseam: "28", outseam: "38", thigh: "23", popular: true },
  { size: "L", waist: "32-34", hip: "40-42", inseam: "29", outseam: "39", thigh: "24", popular: true },
  { size: "XL", waist: "34-36", hip: "42-44", inseam: "30", outseam: "40", thigh: "25" },
  { size: "XXL", waist: "36-38", hip: "44-46", inseam: "30", outseam: "41", thigh: "26" },
  { size: "3XL", waist: "38-40", hip: "46-48", inseam: "31", outseam: "42", thigh: "27" },
];

type PantType = "track-pants" | "joggers";

const pantTypes = [
  { id: "track-pants" as PantType, name: "Track Pants", description: "Classic straight fit" },
  { id: "joggers" as PantType, name: "Joggers", description: "Tapered fit with cuffed ankles" },
];

export default function MensTrackPantsSizeChart() {
  const [selectedType, setSelectedType] = useState<PantType>("track-pants");
  const [showCalculator, setShowCalculator] = useState(false);
  const [waistInput, setWaistInput] = useState("");
  const [recommendedSize, setRecommendedSize] = useState<string | null>(null);

  const currentSizes = selectedType === "track-pants" ? trackPantsSizes : joggerSizes;

  const calculateSize = () => {
    const waist = parseInt(waistInput);
    if (isNaN(waist)) return;

    let size = "S";
    if (waist >= 40) size = "4XL";
    else if (waist >= 38) size = "3XL";
    else if (waist >= 36) size = "XXL";
    else if (waist >= 34) size = "XL";
    else if (waist >= 32) size = "L";
    else if (waist >= 30) size = "M";
    setRecommendedSize(size);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 bg-gradient-to-b from-[#1A1A1A] via-[#0F0F0F] to-background overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(212,175,55,0.1),transparent_50%)]" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <Link 
            to="/size-guide" 
            className="inline-flex items-center gap-2 text-white/60 hover:text-accent transition-colors mb-8 group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Size Guide
          </Link>

          <div className="text-center max-w-3xl mx-auto">
            <img 
              src="/logo.png" 
              alt="Feather Fashions" 
              className="h-32 w-auto mx-auto mb-6 opacity-90"
            />

            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 rounded-full mb-6">
              <Ruler className="h-4 w-4 text-accent" />
              <span className="text-accent text-sm font-medium tracking-wide uppercase">Size Guide</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white mb-6 leading-tight">
              Men's Track Pants
              <span className="block text-accent mt-2">Size Guide</span>
            </h1>

            <p className="text-lg text-white/70 max-w-xl mx-auto">
              Find your perfect fit with our comprehensive size chart for Indian body types
            </p>
          </div>
        </div>
      </section>

      {/* Type Selector */}
      <section className="py-12 border-b border-border/50">
        <div className="container mx-auto px-6 lg:px-12">
          <h2 className="text-2xl font-serif text-center mb-8">Select Style</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {pantTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`px-6 py-4 rounded-xl border-2 transition-all duration-300 ${
                  selectedType === type.id
                    ? "border-accent bg-accent/10 text-foreground"
                    : "border-border hover:border-accent/50 text-muted-foreground"
                }`}
              >
                <div className="text-lg font-semibold">{type.name}</div>
                <div className="text-sm opacity-70">{type.description}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Size Table */}
      <section className="py-16">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-5xl mx-auto">
            <Card className="overflow-hidden border-border/50">
              <div className="bg-gradient-to-r from-accent/20 via-accent/10 to-accent/20 px-6 py-4">
                <h3 className="text-xl font-serif text-foreground">
                  {selectedType === "track-pants" ? "Track Pants" : "Joggers"} Size Chart
                </h3>
                <p className="text-sm text-muted-foreground">All measurements in inches (Indian Standard)</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-secondary/30">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Size</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Waist</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Hip</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Inseam</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Outseam</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Thigh</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentSizes.map((size, index) => (
                      <tr 
                        key={size.size} 
                        className={`border-t border-border/50 hover:bg-accent/5 transition-colors ${
                          size.popular ? "bg-accent/5" : ""
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">{size.size}</span>
                            {size.popular && (
                              <Badge variant="secondary" className="bg-accent/20 text-accent text-xs">
                                Popular
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">{size.waist}"</td>
                        <td className="px-6 py-4 text-muted-foreground">{size.hip}"</td>
                        <td className="px-6 py-4 text-muted-foreground">{size.inseam}"</td>
                        <td className="px-6 py-4 text-muted-foreground">{size.outseam}"</td>
                        <td className="px-6 py-4 text-muted-foreground">{size.thigh}"</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Measurement Guide */}
            <div className="mt-12 grid md:grid-cols-2 gap-8">
              <Card className="p-6 border-border/50">
                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Info className="h-5 w-5 text-accent" />
                  How to Measure
                </h4>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                    <span><strong>Waist:</strong> Measure around your natural waistline</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                    <span><strong>Hip:</strong> Measure around the fullest part of your hips</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                    <span><strong>Inseam:</strong> From crotch to bottom of leg</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                    <span><strong>Thigh:</strong> Around the fullest part of your thigh</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6 border-border/50">
                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-accent" />
                  Quick Size Finder
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Your Waist (inches)</label>
                    <input
                      type="number"
                      value={waistInput}
                      onChange={(e) => setWaistInput(e.target.value)}
                      placeholder="e.g., 32"
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors"
                    />
                  </div>
                  <Button onClick={calculateSize} className="w-full" variant="gold">
                    Find My Size
                  </Button>
                  {recommendedSize && (
                    <div className="p-4 bg-accent/10 rounded-lg text-center">
                      <p className="text-sm text-muted-foreground">Recommended Size</p>
                      <p className="text-3xl font-bold text-accent">{recommendedSize}</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-b from-background to-secondary/20">
        <div className="container mx-auto px-6 lg:px-12 text-center">
          <h2 className="text-3xl font-serif mb-4">Need More Help?</h2>
          <p className="text-muted-foreground mb-8">Our sizing experts are here to assist you</p>
          <Button asChild size="lg" variant="gold">
            <Link to="/contact">Contact Us</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
