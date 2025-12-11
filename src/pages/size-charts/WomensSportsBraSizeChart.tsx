import { useState } from "react";
import { Link } from "react-router-dom";
import { Ruler, ArrowLeft, Calculator, Check, Info, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SizeData {
  size: string;
  bust: string;
  underbust: string;
  cupSize: string;
  popular?: boolean;
}

const lowImpactSizes: SizeData[] = [
  { size: "XS", bust: "30-32", underbust: "26-28", cupSize: "A-B" },
  { size: "S", bust: "32-34", underbust: "28-30", cupSize: "A-B", popular: true },
  { size: "M", bust: "34-36", underbust: "30-32", cupSize: "B-C", popular: true },
  { size: "L", bust: "36-38", underbust: "32-34", cupSize: "C-D", popular: true },
  { size: "XL", bust: "38-40", underbust: "34-36", cupSize: "D-DD" },
  { size: "XXL", bust: "40-42", underbust: "36-38", cupSize: "DD+" },
];

const mediumImpactSizes: SizeData[] = [
  { size: "XS", bust: "30-32", underbust: "26-28", cupSize: "A-B" },
  { size: "S", bust: "32-34", underbust: "28-30", cupSize: "B-C", popular: true },
  { size: "M", bust: "34-36", underbust: "30-32", cupSize: "C-D", popular: true },
  { size: "L", bust: "36-38", underbust: "32-34", cupSize: "D-DD", popular: true },
  { size: "XL", bust: "38-40", underbust: "34-36", cupSize: "DD-E" },
  { size: "XXL", bust: "40-42", underbust: "36-38", cupSize: "E+" },
];

const highImpactSizes: SizeData[] = [
  { size: "XS", bust: "30-32", underbust: "26-28", cupSize: "A-C" },
  { size: "S", bust: "32-34", underbust: "28-30", cupSize: "B-D", popular: true },
  { size: "M", bust: "34-36", underbust: "30-32", cupSize: "C-DD", popular: true },
  { size: "L", bust: "36-38", underbust: "32-34", cupSize: "D-E", popular: true },
  { size: "XL", bust: "38-40", underbust: "34-36", cupSize: "DD-F" },
  { size: "XXL", bust: "40-42", underbust: "36-38", cupSize: "E+" },
];

type BraType = "low-impact" | "medium-impact" | "high-impact";

const braTypes = [
  { id: "low-impact" as BraType, name: "Low Impact", description: "Yoga, Pilates, Walking" },
  { id: "medium-impact" as BraType, name: "Medium Impact", description: "Cycling, Hiking, Weight Training" },
  { id: "high-impact" as BraType, name: "High Impact", description: "Running, HIIT, Aerobics" },
];

export default function WomensSportsBraSizeChart() {
  const [selectedType, setSelectedType] = useState<BraType>("medium-impact");
  const [bustInput, setBustInput] = useState("");
  const [underbustInput, setUnderbustInput] = useState("");
  const [recommendedSize, setRecommendedSize] = useState<string | null>(null);

  const getSizes = () => {
    switch (selectedType) {
      case "low-impact": return lowImpactSizes;
      case "high-impact": return highImpactSizes;
      default: return mediumImpactSizes;
    }
  };

  const calculateSize = () => {
    const bust = parseInt(bustInput);
    if (isNaN(bust)) return;

    let size = "XS";
    if (bust >= 40) size = "XXL";
    else if (bust >= 38) size = "XL";
    else if (bust >= 36) size = "L";
    else if (bust >= 34) size = "M";
    else if (bust >= 32) size = "S";
    setRecommendedSize(size);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 bg-gradient-to-b from-[#1A1A1A] via-[#0F0F0F] to-background overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(212,175,55,0.1),transparent_50%)]" />
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
              <Heart className="h-4 w-4 text-accent" />
              <span className="text-accent text-sm font-medium tracking-wide uppercase">Size Guide</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white mb-6 leading-tight">
              Women's Sports Bras
              <span className="block text-accent mt-2">Size Guide</span>
            </h1>

            <p className="text-lg text-white/70 max-w-xl mx-auto">
              Find the perfect support for every activity
            </p>
          </div>
        </div>
      </section>

      {/* Type Selector */}
      <section className="py-12 border-b border-border/50">
        <div className="container mx-auto px-6 lg:px-12">
          <h2 className="text-2xl font-serif text-center mb-8">Select Impact Level</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {braTypes.map((type) => (
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
                  {selectedType === "low-impact" ? "Low Impact" : selectedType === "high-impact" ? "High Impact" : "Medium Impact"} Sports Bra Size Chart
                </h3>
                <p className="text-sm text-muted-foreground">All measurements in inches (Indian Standard)</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-secondary/30">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Size</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Bust</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Underbust</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Cup Size</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getSizes().map((size) => (
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
                        <td className="px-6 py-4 text-muted-foreground">{size.bust}"</td>
                        <td className="px-6 py-4 text-muted-foreground">{size.underbust}"</td>
                        <td className="px-6 py-4 text-muted-foreground">{size.cupSize}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Measurement Guide & Calculator */}
            <div className="mt-12 grid md:grid-cols-2 gap-8">
              <Card className="p-6 border-border/50">
                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Info className="h-5 w-5 text-accent" />
                  How to Measure
                </h4>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                    <span><strong>Bust:</strong> Measure around the fullest part of your bust</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                    <span><strong>Underbust:</strong> Measure directly under your bust, keeping tape snug</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                    <span><strong>Tip:</strong> Wear an unpadded bra while measuring</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                    <span><strong>Fit:</strong> Sports bras should fit snugly without restricting breathing</span>
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
                    <label className="text-sm text-muted-foreground mb-2 block">Your Bust (inches)</label>
                    <input
                      type="number"
                      value={bustInput}
                      onChange={(e) => setBustInput(e.target.value)}
                      placeholder="e.g., 34"
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
