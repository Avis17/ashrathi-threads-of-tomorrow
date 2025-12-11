import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LeggingType } from "@/pages/LeggingsSizeChart";
import { Shield, Sparkles, ArrowRight, ArrowLeft, CheckCircle2, Calculator, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface SizeCalculatorProps {
  leggingTypes: LeggingType[];
  onTypeSelect?: (type: LeggingType) => void;
}

type FitPreference = "snug" | "comfortable" | "loose";

interface CalculatorData {
  waist: string;
  hips: string;
  height: string;
  fitPreference: FitPreference;
  selectedTypeId: string;
}

export default function SizeCalculator({ leggingTypes, onTypeSelect }: SizeCalculatorProps) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<CalculatorData>({
    waist: "",
    hips: "",
    height: "",
    fitPreference: "comfortable",
    selectedTypeId: "",
  });
  const [recommendation, setRecommendation] = useState<string | null>(null);

  const calculateSize = () => {
    const waist = parseFloat(data.waist);
    const hips = parseFloat(data.hips);
    
    if (!waist || !hips) return null;

    const selectedType = leggingTypes.find(t => t.id === data.selectedTypeId);
    if (!selectedType) return null;

    // Find matching size based on measurements
    let matchedSize = null;
    for (const size of selectedType.sizes) {
      const waistRange = size.waist?.split("-").map(v => parseFloat(v)) || [0, 0];
      const hipsRange = size.hips.split("-").map(v => parseFloat(v));

      if (
        waist >= waistRange[0] && waist <= waistRange[1] &&
        hips >= hipsRange[0] && hips <= hipsRange[1]
      ) {
        matchedSize = size.size;
        break;
      }
    }

    // Adjust for fit preference
    if (matchedSize && data.fitPreference === "snug") {
      const sizeIndex = selectedType.sizes.findIndex(s => s.size === matchedSize);
      if (sizeIndex > 0) matchedSize = selectedType.sizes[sizeIndex - 1].size;
    } else if (matchedSize && data.fitPreference === "loose") {
      const sizeIndex = selectedType.sizes.findIndex(s => s.size === matchedSize);
      if (sizeIndex < selectedType.sizes.length - 1) {
        matchedSize = selectedType.sizes[sizeIndex + 1].size;
      }
    }

    return matchedSize;
  };

  const handleComplete = () => {
    const size = calculateSize();
    setRecommendation(size);
    setStep(5);

    if (onTypeSelect && data.selectedTypeId) {
      const type = leggingTypes.find(t => t.id === data.selectedTypeId);
      if (type) onTypeSelect(type);
    }
  };

  const resetCalculator = () => {
    setStep(0);
    setData({
      waist: "",
      hips: "",
      height: "",
      fitPreference: "comfortable",
      selectedTypeId: "",
    });
    setRecommendation(null);
  };

  const progressPercentage = step === 0 ? 0 : (step / 4) * 100;

  // Step 0: Introduction
  if (step === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-xl">
          <div className="p-8 bg-gradient-to-r from-accent/10 via-accent/5 to-accent/10 border-b border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                <Calculator className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h2 className="text-2xl font-serif text-foreground">Size Calculator</h2>
                <p className="text-muted-foreground text-sm">Find your perfect fit in 4 steps</p>
              </div>
            </div>
          </div>
          
          <div className="p-8 space-y-6">
            <p className="text-lg text-muted-foreground">
              Answer 4 quick questions to get your personalized size recommendation
            </p>
            
            <div className="bg-secondary/50 rounded-xl p-6 border border-border">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Privacy First</h4>
                  <p className="text-sm text-muted-foreground">
                    Your measurements are <strong>never stored</strong> and won't be used for any purpose beyond this recommendation. All calculations happen locally in your browser.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button onClick={() => setStep(1)} size="xl" variant="gold" className="flex-1 gap-2">
                Start Calculator
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Steps 1-4: Questions
  if (step >= 1 && step <= 4) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-xl">
          {/* Progress Bar */}
          <div className="h-1 bg-secondary">
            <div 
              className="h-full bg-accent transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          <div className="p-8">
            {/* Step Indicator */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2 px-4 py-2 bg-accent/20 rounded-full">
                <span className="text-accent text-sm font-semibold">Step {step} of 4</span>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((s) => (
                  <div
                    key={s}
                    className={cn(
                      "w-2 h-2 rounded-full transition-colors",
                      s <= step ? "bg-accent" : "bg-border"
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Step 1: Waist */}
            {step === 1 && (
              <div className="space-y-6">
                <h3 className="text-2xl font-serif text-foreground">What's your waist measurement?</h3>
                <div className="space-y-3">
                  <Label htmlFor="waist" className="text-muted-foreground">Waist (in inches)</Label>
                  <Input
                    id="waist"
                    type="number"
                    placeholder="e.g., 28"
                    value={data.waist}
                    onChange={(e) => setData({ ...data, waist: e.target.value })}
                    className="text-lg h-14 bg-secondary/50 border-border"
                  />
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-accent" />
                    Measure around the narrowest part of your natural waistline
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Hips */}
            {step === 2 && (
              <div className="space-y-6">
                <h3 className="text-2xl font-serif text-foreground">What's your hip measurement?</h3>
                <div className="space-y-3">
                  <Label htmlFor="hips" className="text-muted-foreground">Hips (in inches)</Label>
                  <Input
                    id="hips"
                    type="number"
                    placeholder="e.g., 38"
                    value={data.hips}
                    onChange={(e) => setData({ ...data, hips: e.target.value })}
                    className="text-lg h-14 bg-secondary/50 border-border"
                  />
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-accent" />
                    Measure around the fullest part of your hips
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Fit Preference */}
            {step === 3 && (
              <div className="space-y-6">
                <h3 className="text-2xl font-serif text-foreground">How do you prefer your leggings to fit?</h3>
                <RadioGroup
                  value={data.fitPreference}
                  onValueChange={(value) => setData({ ...data, fitPreference: value as FitPreference })}
                  className="space-y-3"
                >
                  {[
                    { value: "snug", label: "Snug", desc: "Tight, compression fit for active wear" },
                    { value: "comfortable", label: "Comfortable", desc: "True to size, comfortable everyday fit", recommended: true },
                    { value: "loose", label: "Loose", desc: "Relaxed fit with extra room" },
                  ].map((option) => (
                    <div
                      key={option.value}
                      className={cn(
                        "flex items-start space-x-3 p-4 rounded-xl border transition-all cursor-pointer",
                        data.fitPreference === option.value
                          ? "border-accent bg-accent/5"
                          : "border-border hover:border-accent/50 hover:bg-secondary/30"
                      )}
                      onClick={() => setData({ ...data, fitPreference: option.value as FitPreference })}
                    >
                      <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                      <Label htmlFor={option.value} className="cursor-pointer flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{option.label}</span>
                          {option.recommended && (
                            <span className="px-2 py-0.5 bg-accent/20 text-accent text-xs font-medium rounded-full">
                              Recommended
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {option.desc}
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {/* Step 4: Legging Type */}
            {step === 4 && (
              <div className="space-y-6">
                <h3 className="text-2xl font-serif text-foreground">Which style are you buying?</h3>
                <div className="space-y-3">
                  <Label htmlFor="type" className="text-muted-foreground">Legging Type</Label>
                  <Select
                    value={data.selectedTypeId}
                    onValueChange={(value) => setData({ ...data, selectedTypeId: value })}
                  >
                    <SelectTrigger className="text-lg h-14 bg-secondary/50 border-border">
                      <SelectValue placeholder="Select a legging type" />
                    </SelectTrigger>
                    <SelectContent>
                      {leggingTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-3 mt-8">
              <Button 
                variant="outline" 
                onClick={() => setStep(step - 1)}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              {step < 4 ? (
                <Button
                  onClick={() => setStep(step + 1)}
                  disabled={(step === 1 && !data.waist) || (step === 2 && !data.hips)}
                  className="flex-1 gap-2"
                  variant="gold"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  disabled={!data.selectedTypeId}
                  className="flex-1 gap-2"
                  variant="gold"
                >
                  Get Recommendation
                  <CheckCircle2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 5: Results
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-xl">
        <div className="p-8 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-green-500/10 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <h2 className="text-2xl font-serif text-foreground">Your Recommended Size</h2>
              <p className="text-muted-foreground text-sm">Based on your measurements</p>
            </div>
          </div>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="text-center py-6">
            <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-gradient-to-br from-accent to-accent/70 text-black text-5xl font-bold mb-4 shadow-xl shadow-accent/30">
              {recommendation || "?"}
            </div>
            <h3 className="text-3xl font-serif text-foreground">
              {recommendation ? `Size ${recommendation}` : "No Match Found"}
            </h3>
          </div>

          {recommendation ? (
            <div className="bg-secondary/50 rounded-xl p-6 border border-border">
              <h4 className="font-semibold text-foreground mb-4">Your Measurements</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-accent">{data.waist}"</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Waist</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-accent">{data.hips}"</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Hips</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-accent capitalize">{data.fitPreference}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Fit</p>
                </div>
              </div>
              {data.selectedTypeId === "maternity" && (
                <p className="text-sm text-muted-foreground mt-4 p-3 bg-accent/10 rounded-lg border border-accent/20">
                  <Sparkles className="w-4 h-4 text-accent inline mr-2" />
                  <strong>Tip:</strong> For maternity leggings, consider sizing up for extra comfort during pregnancy.
                </p>
              )}
            </div>
          ) : (
            <div className="bg-amber-500/10 rounded-xl p-6 border border-amber-500/20">
              <p className="text-foreground">
                We couldn't find a perfect match for your measurements. Please consult our size chart below or contact us for personalized assistance.
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={resetCalculator} className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Try Again
            </Button>
            <Button 
              variant="gold" 
              className="flex-1"
              onClick={() => {
                const element = document.querySelector('[data-size-table]');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              View Full Size Chart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
