import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Shield, Sparkles, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
      const waistRange = size.waist.split("-").map(v => parseFloat(v));
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

  if (step === 0) {
    return (
      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader className="bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10">
          <CardTitle className="text-2xl flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Find Your Perfect Size
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <p className="text-lg">
            Answer 4 quick questions to get your personalized size recommendation
          </p>
          
          <div className="bg-muted/50 rounded-lg p-6 space-y-3">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold mb-2">Privacy Notice</h4>
                <p className="text-sm text-muted-foreground">
                  Your information is <strong>NOT stored</strong> and will <strong>NEVER be used</strong> for any purpose beyond this recommendation. All calculations happen in your browser.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button onClick={() => setStep(1)} size="lg" className="flex-1 gap-2">
              Start Calculator
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => {}}>
              Skip
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === 1) {
    return (
      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <Badge variant="secondary">Step 1 of 4</Badge>
          </div>
          <CardTitle>What's your waist measurement?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="waist">Waist (in inches)</Label>
            <Input
              id="waist"
              type="number"
              placeholder="e.g., 28"
              value={data.waist}
              onChange={(e) => setData({ ...data, waist: e.target.value })}
              className="text-lg"
            />
            <p className="text-sm text-muted-foreground">
              💡 Measure around the narrowest part of your natural waistline
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(0)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={() => setStep(2)}
              disabled={!data.waist}
              className="flex-1 gap-2"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === 2) {
    return (
      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <Badge variant="secondary">Step 2 of 4</Badge>
          </div>
          <CardTitle>What's your hip measurement?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="hips">Hips (in inches)</Label>
            <Input
              id="hips"
              type="number"
              placeholder="e.g., 38"
              value={data.hips}
              onChange={(e) => setData({ ...data, hips: e.target.value })}
              className="text-lg"
            />
            <p className="text-sm text-muted-foreground">
              💡 Measure around the fullest part of your hips
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={() => setStep(3)}
              disabled={!data.hips}
              className="flex-1 gap-2"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === 3) {
    return (
      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <Badge variant="secondary">Step 3 of 4</Badge>
          </div>
          <CardTitle>How do you prefer your leggings to fit?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup
            value={data.fitPreference}
            onValueChange={(value) => setData({ ...data, fitPreference: value as FitPreference })}
          >
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="snug" id="snug" />
                <Label htmlFor="snug" className="cursor-pointer flex-1">
                  <div className="font-semibold">Snug</div>
                  <div className="text-sm text-muted-foreground">
                    Tight, compression fit for active wear
                  </div>
                </Label>
              </div>

              <div className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="comfortable" id="comfortable" />
                <Label htmlFor="comfortable" className="cursor-pointer flex-1">
                  <div className="font-semibold">Comfortable (Recommended)</div>
                  <div className="text-sm text-muted-foreground">
                    True to size, comfortable everyday fit
                  </div>
                </Label>
              </div>

              <div className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="loose" id="loose" />
                <Label htmlFor="loose" className="cursor-pointer flex-1">
                  <div className="font-semibold">Loose</div>
                  <div className="text-sm text-muted-foreground">
                    Relaxed fit with extra room
                  </div>
                </Label>
              </div>
            </div>
          </RadioGroup>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(2)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button onClick={() => setStep(4)} className="flex-1 gap-2">
              Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === 4) {
    return (
      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <Badge variant="secondary">Step 4 of 4</Badge>
          </div>
          <CardTitle>Which style are you buying?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="type">Legging Type</Label>
            <Select
              value={data.selectedTypeId}
              onValueChange={(value) => setData({ ...data, selectedTypeId: value })}
            >
              <SelectTrigger className="text-lg">
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

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(3)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={handleComplete}
              disabled={!data.selectedTypeId}
              className="flex-1 gap-2"
            >
              Get Recommendation
              <CheckCircle2 className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Step 5: Results
  return (
    <Card className="max-w-2xl mx-auto shadow-xl">
      <CardHeader className="bg-gradient-to-r from-green-500/10 to-emerald-500/10">
        <CardTitle className="text-2xl flex items-center gap-2">
          <CheckCircle2 className="w-6 h-6 text-green-500" />
          Your Recommended Size
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8 space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-primary to-secondary text-white text-5xl font-bold mb-4 shadow-xl">
            {recommendation || "?"}
          </div>
          <h3 className="text-3xl font-bold mb-2">
            {recommendation ? `Size ${recommendation}` : "No Match Found"}
          </h3>
        </div>

        {recommendation ? (
          <div className="bg-muted/50 rounded-lg p-6 space-y-3">
            <h4 className="font-semibold">Based on your measurements:</h4>
            <ul className="text-sm space-y-2">
              <li>• Waist: {data.waist}"</li>
              <li>• Hips: {data.hips}"</li>
              <li>• Fit preference: {data.fitPreference}</li>
            </ul>
            {data.selectedTypeId === "maternity" && (
              <p className="text-sm text-muted-foreground mt-4 p-3 bg-primary/5 rounded-lg">
                💡 <strong>Tip:</strong> For maternity leggings, consider sizing up for extra comfort during pregnancy.
              </p>
            )}
          </div>
        ) : (
          <div className="bg-yellow-500/10 rounded-lg p-6">
            <p className="text-sm">
              We couldn't find a perfect match. Please consult our size chart or contact us for personalized assistance.
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <Button variant="outline" onClick={resetCalculator} className="flex-1">
            Try Again
          </Button>
          <Button onClick={() => {}} className="flex-1">
            View Size Chart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
