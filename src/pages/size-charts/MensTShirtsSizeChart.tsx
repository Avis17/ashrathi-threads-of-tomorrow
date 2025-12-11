import { useState } from "react";
import { Link } from "react-router-dom";
import { Ruler, ArrowLeft, Calculator, Check, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SizeData {
  size: string;
  chest: string;
  length: string;
  shoulder: string;
  sleeve: string;
  popular?: boolean;
}

const roundNeckSizes: SizeData[] = [
  { size: "S", chest: "36-38", length: "26", shoulder: "17", sleeve: "8" },
  { size: "M", chest: "38-40", length: "27", shoulder: "18", sleeve: "8.5", popular: true },
  { size: "L", chest: "40-42", length: "28", shoulder: "19", sleeve: "9", popular: true },
  { size: "XL", chest: "42-44", length: "29", shoulder: "20", sleeve: "9.5", popular: true },
  { size: "XXL", chest: "44-46", length: "30", shoulder: "21", sleeve: "10" },
  { size: "3XL", chest: "46-48", length: "31", shoulder: "22", sleeve: "10.5" },
];

const poloSizes: SizeData[] = [
  { size: "S", chest: "36-38", length: "27", shoulder: "17", sleeve: "9" },
  { size: "M", chest: "38-40", length: "28", shoulder: "18", sleeve: "9.5", popular: true },
  { size: "L", chest: "40-42", length: "29", shoulder: "19", sleeve: "10", popular: true },
  { size: "XL", chest: "42-44", length: "30", shoulder: "20", sleeve: "10.5" },
  { size: "XXL", chest: "44-46", length: "31", shoulder: "21", sleeve: "11" },
  { size: "3XL", chest: "46-48", length: "32", shoulder: "22", sleeve: "11.5" },
];

const vNeckSizes: SizeData[] = [
  { size: "S", chest: "36-38", length: "26", shoulder: "17", sleeve: "8" },
  { size: "M", chest: "38-40", length: "27", shoulder: "18", sleeve: "8.5", popular: true },
  { size: "L", chest: "40-42", length: "28", shoulder: "19", sleeve: "9", popular: true },
  { size: "XL", chest: "42-44", length: "29", shoulder: "20", sleeve: "9.5" },
  { size: "XXL", chest: "44-46", length: "30", shoulder: "21", sleeve: "10" },
  { size: "3XL", chest: "46-48", length: "31", shoulder: "22", sleeve: "10.5" },
];

type TShirtType = "round-neck" | "polo" | "v-neck";

const tShirtTypes = [
  { id: "round-neck" as TShirtType, name: "Round Neck", description: "Classic crew neck" },
  { id: "polo" as TShirtType, name: "Polo T-Shirt", description: "Collar with buttons" },
  { id: "v-neck" as TShirtType, name: "V-Neck", description: "Modern V-shaped neckline" },
];

export default function MensTShirtsSizeChart() {
  const [selectedType, setSelectedType] = useState<TShirtType>("round-neck");
  const [chestInput, setChestInput] = useState("");
  const [recommendedSize, setRecommendedSize] = useState<string | null>(null);

  const getSizes = () => {
    switch (selectedType) {
      case "polo": return poloSizes;
      case "v-neck": return vNeckSizes;
      default: return roundNeckSizes;
    }
  };

  const calculateSize = () => {
    const chest = parseInt(chestInput);
    if (isNaN(chest)) return;

    let size = "S";
    if (chest >= 46) size = "3XL";
    else if (chest >= 44) size = "XXL";
    else if (chest >= 42) size = "XL";
    else if (chest >= 40) size = "L";
    else if (chest >= 38) size = "M";
    setRecommendedSize(size);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 bg-gradient-to-b from-[#1A1A1A] via-[#0F0F0F] to-background overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(212,175,55,0.1),transparent_50%)]" />
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/2" />

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
              Men's T-Shirts
              <span className="block text-accent mt-2">Size Guide</span>
            </h1>

            <p className="text-lg text-white/70 max-w-xl mx-auto">
              Perfect fit guide for all our men's t-shirt styles
            </p>
          </div>
        </div>
      </section>

      {/* Type Selector */}
      <section className="py-12 border-b border-border/50">
        <div className="container mx-auto px-6 lg:px-12">
          <h2 className="text-2xl font-serif text-center mb-8">Select Style</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {tShirtTypes.map((type) => (
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
                  {selectedType === "round-neck" ? "Round Neck" : selectedType === "polo" ? "Polo" : "V-Neck"} Size Chart
                </h3>
                <p className="text-sm text-muted-foreground">All measurements in inches (Indian Standard)</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-secondary/30">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Size</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Chest</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Length</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Shoulder</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Sleeve</th>
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
                        <td className="px-6 py-4 text-muted-foreground">{size.chest}"</td>
                        <td className="px-6 py-4 text-muted-foreground">{size.length}"</td>
                        <td className="px-6 py-4 text-muted-foreground">{size.shoulder}"</td>
                        <td className="px-6 py-4 text-muted-foreground">{size.sleeve}"</td>
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
                    <span><strong>Chest:</strong> Measure around the fullest part of your chest</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                    <span><strong>Length:</strong> From shoulder seam to bottom hem</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                    <span><strong>Shoulder:</strong> From shoulder seam to shoulder seam</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                    <span><strong>Sleeve:</strong> From shoulder seam to sleeve end</span>
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
                    <label className="text-sm text-muted-foreground mb-2 block">Your Chest (inches)</label>
                    <input
                      type="number"
                      value={chestInput}
                      onChange={(e) => setChestInput(e.target.value)}
                      placeholder="e.g., 40"
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
