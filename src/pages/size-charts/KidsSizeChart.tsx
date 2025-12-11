import { useState } from "react";
import { Link } from "react-router-dom";
import { Ruler, ArrowLeft, Calculator, Check, Info, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SizeData {
  size: string;
  age: string;
  height: string;
  chest: string;
  waist: string;
  popular?: boolean;
}

const boysSizes: SizeData[] = [
  { size: "2-3Y", age: "2-3 Years", height: "92-98", chest: "20-21", waist: "19-20" },
  { size: "3-4Y", age: "3-4 Years", height: "98-104", chest: "21-22", waist: "20-21" },
  { size: "4-5Y", age: "4-5 Years", height: "104-110", chest: "22-23", waist: "21-22", popular: true },
  { size: "5-6Y", age: "5-6 Years", height: "110-116", chest: "23-24", waist: "22-23", popular: true },
  { size: "6-7Y", age: "6-7 Years", height: "116-122", chest: "24-25", waist: "23-24", popular: true },
  { size: "7-8Y", age: "7-8 Years", height: "122-128", chest: "25-26", waist: "24-25" },
  { size: "8-9Y", age: "8-9 Years", height: "128-134", chest: "26-27", waist: "25-26" },
  { size: "9-10Y", age: "9-10 Years", height: "134-140", chest: "27-28", waist: "26-27" },
  { size: "10-12Y", age: "10-12 Years", height: "140-152", chest: "28-30", waist: "27-29" },
  { size: "12-14Y", age: "12-14 Years", height: "152-164", chest: "30-32", waist: "29-31" },
];

const girlsSizes: SizeData[] = [
  { size: "2-3Y", age: "2-3 Years", height: "92-98", chest: "20-21", waist: "19-20" },
  { size: "3-4Y", age: "3-4 Years", height: "98-104", chest: "21-22", waist: "19.5-20.5" },
  { size: "4-5Y", age: "4-5 Years", height: "104-110", chest: "22-23", waist: "20-21", popular: true },
  { size: "5-6Y", age: "5-6 Years", height: "110-116", chest: "23-24", waist: "21-22", popular: true },
  { size: "6-7Y", age: "6-7 Years", height: "116-122", chest: "24-25", waist: "22-23", popular: true },
  { size: "7-8Y", age: "7-8 Years", height: "122-128", chest: "25-26", waist: "23-24" },
  { size: "8-9Y", age: "8-9 Years", height: "128-134", chest: "26-27", waist: "24-25" },
  { size: "9-10Y", age: "9-10 Years", height: "134-140", chest: "27-28", waist: "25-26" },
  { size: "10-12Y", age: "10-12 Years", height: "140-152", chest: "28-30", waist: "26-28" },
  { size: "12-14Y", age: "12-14 Years", height: "152-164", chest: "30-32", waist: "28-30" },
];

type KidsCategory = "boys" | "girls";

const categories = [
  { id: "boys" as KidsCategory, name: "Boys", description: "T-Shirts, Tracks, Shorts" },
  { id: "girls" as KidsCategory, name: "Girls", description: "T-Shirts, Leggings, Dresses" },
];

export default function KidsSizeChart() {
  const [selectedCategory, setSelectedCategory] = useState<KidsCategory>("boys");
  const [ageInput, setAgeInput] = useState("");
  const [recommendedSize, setRecommendedSize] = useState<string | null>(null);

  const currentSizes = selectedCategory === "boys" ? boysSizes : girlsSizes;

  const calculateSize = () => {
    const age = parseInt(ageInput);
    if (isNaN(age)) return;

    let size = "2-3Y";
    if (age >= 12) size = "12-14Y";
    else if (age >= 10) size = "10-12Y";
    else if (age >= 9) size = "9-10Y";
    else if (age >= 8) size = "8-9Y";
    else if (age >= 7) size = "7-8Y";
    else if (age >= 6) size = "6-7Y";
    else if (age >= 5) size = "5-6Y";
    else if (age >= 4) size = "4-5Y";
    else if (age >= 3) size = "3-4Y";
    setRecommendedSize(size);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 bg-gradient-to-b from-[#1A1A1A] via-[#0F0F0F] to-background overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(212,175,55,0.1),transparent_50%)]" />
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
              <Sparkles className="h-4 w-4 text-accent" />
              <span className="text-accent text-sm font-medium tracking-wide uppercase">Size Guide</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white mb-6 leading-tight">
              Kids Collection
              <span className="block text-accent mt-2">Size Guide</span>
            </h1>

            <p className="text-lg text-white/70 max-w-xl mx-auto">
              Age-based sizing for boys and girls (2-14 years)
            </p>
          </div>
        </div>
      </section>

      {/* Category Selector */}
      <section className="py-12 border-b border-border/50">
        <div className="container mx-auto px-6 lg:px-12">
          <h2 className="text-2xl font-serif text-center mb-8">Select Category</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-8 py-5 rounded-xl border-2 transition-all duration-300 ${
                  selectedCategory === cat.id
                    ? "border-accent bg-accent/10 text-foreground"
                    : "border-border hover:border-accent/50 text-muted-foreground"
                }`}
              >
                <div className="text-xl font-semibold">{cat.name}</div>
                <div className="text-sm opacity-70">{cat.description}</div>
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
                  {selectedCategory === "boys" ? "Boys" : "Girls"} Size Chart
                </h3>
                <p className="text-sm text-muted-foreground">Height in cm, Chest & Waist in inches (Indian Standard)</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-secondary/30">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Size</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Age</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Height (cm)</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Chest</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Waist</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentSizes.map((size) => (
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
                        <td className="px-6 py-4 text-muted-foreground">{size.age}</td>
                        <td className="px-6 py-4 text-muted-foreground">{size.height}</td>
                        <td className="px-6 py-4 text-muted-foreground">{size.chest}"</td>
                        <td className="px-6 py-4 text-muted-foreground">{size.waist}"</td>
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
                  Sizing Tips for Kids
                </h4>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                    <span><strong>Height:</strong> Measure from top of head to floor without shoes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                    <span><strong>Chest:</strong> Measure around the fullest part of the chest</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                    <span><strong>Waist:</strong> Measure around the natural waistline</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                    <span><strong>Tip:</strong> Size up if between sizes for room to grow</span>
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
                    <label className="text-sm text-muted-foreground mb-2 block">Child's Age (years)</label>
                    <input
                      type="number"
                      value={ageInput}
                      onChange={(e) => setAgeInput(e.target.value)}
                      placeholder="e.g., 6"
                      min="2"
                      max="14"
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors"
                    />
                  </div>
                  <Button onClick={calculateSize} className="w-full" variant="gold">
                    Find Size
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
