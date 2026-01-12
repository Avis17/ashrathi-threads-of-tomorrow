import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  Upload,
  FileText,
  Image,
  Save,
  Send,
  User,
  Package,
  Scissors,
  Ruler,
  Tag,
  CreditCard,
  Paperclip,
  StickyNote,
} from "lucide-react";
import logo from "@/assets/logo.png";

type SampleStatus = "draft" | "awaiting_payment" | "in_progress" | "completed";

interface SamplingFormData {
  // Buyer Details
  buyerName: string;
  companyName: string;
  country: string;
  contactEmail: string;
  whatsappNumber: string;
  buyerReferenceId: string;
  inquirySource: string;
  // Product Information
  productCategory: string;
  styleCode: string;
  gender: string;
  targetMarket: string;
  intendedOrderQty: string;
  // Fabric Details
  fabricType: string;
  gsm: string;
  stretchType: string;
  composition: string;
  fabricSource: string;
  color: string;
  specialTreatments: string;
  // Size & Fit
  sizeRange: string;
  sizeChartSource: string;
  fitType: string;
  sampleSizeRequired: string;
  // Branding
  brandName: string;
  brandingType: string;
  labelType: string[];
  brandingPlacement: string;
  brandingAllowedStage: string;
  // Commercials
  sampleCost: string;
  costAdjustable: string;
  paymentStatus: string;
  courierMode: string;
  courierCharges: string;
  expectedDispatchDate: string;
  // Notes
  internalNotes: string;
}

const initialFormData: SamplingFormData = {
  buyerName: "",
  companyName: "",
  country: "",
  contactEmail: "",
  whatsappNumber: "",
  buyerReferenceId: "",
  inquirySource: "",
  productCategory: "",
  styleCode: "",
  gender: "",
  targetMarket: "",
  intendedOrderQty: "",
  fabricType: "",
  gsm: "",
  stretchType: "",
  composition: "",
  fabricSource: "",
  color: "",
  specialTreatments: "",
  sizeRange: "",
  sizeChartSource: "",
  fitType: "",
  sampleSizeRequired: "",
  brandName: "",
  brandingType: "",
  labelType: [],
  brandingPlacement: "",
  brandingAllowedStage: "",
  sampleCost: "",
  costAdjustable: "",
  paymentStatus: "",
  courierMode: "",
  courierCharges: "",
  expectedDispatchDate: "",
  internalNotes: "",
};

const statusConfig: Record<SampleStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft: { label: "Draft", variant: "secondary" },
  awaiting_payment: { label: "Awaiting Payment", variant: "destructive" },
  in_progress: { label: "In Progress", variant: "default" },
  completed: { label: "Completed", variant: "outline" },
};

export default function SamplingPreparation() {
  const [formData, setFormData] = useState<SamplingFormData>(initialFormData);
  const [status, setStatus] = useState<SampleStatus>("draft");
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: File[] }>({
    techPack: [],
    referenceImages: [],
    sizeChart: [],
    brandingArtwork: [],
  });

  const updateField = (field: keyof SamplingFormData, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (category: string, files: FileList | null) => {
    if (files) {
      setUploadedFiles((prev) => ({
        ...prev,
        [category]: [...prev[category], ...Array.from(files)],
      }));
    }
  };

  const removeFile = (category: string, index: number) => {
    setUploadedFiles((prev) => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== index),
    }));
  };

  const handleSaveDraft = () => {
    toast.success("Draft saved successfully");
  };

  const handleSubmit = () => {
    // Validate required fields
    if (!formData.buyerName || !formData.styleCode || !formData.gsm || !formData.sampleSizeRequired) {
      toast.error("Please fill in all mandatory fields");
      return;
    }
    setStatus("awaiting_payment");
    toast.success("Sample request submitted successfully");
  };

  const RequiredMark = () => <span className="text-destructive ml-0.5">*</span>;

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={logo} alt="Feather Fashions" className="h-10 w-auto" />
              <div>
                <h1 className="text-xl font-semibold text-foreground">Sampling Preparation</h1>
                <p className="text-sm text-muted-foreground">Internal – Pre-Production Documentation</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">
                  {formData.buyerName || "New Sample Request"}
                </p>
              </div>
              <Badge variant={statusConfig[status].variant} className="text-xs px-3 py-1">
                {statusConfig[status].label}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Section 1: Buyer & Reference Details */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Buyer & Reference Details</CardTitle>
                <CardDescription>Primary contact and inquiry information</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="buyerName" className="text-sm font-medium">
                  Buyer Name<RequiredMark />
                </Label>
                <Input
                  id="buyerName"
                  value={formData.buyerName}
                  onChange={(e) => updateField("buyerName", e.target.value)}
                  placeholder="Enter buyer name"
                  className="border-accent/30 focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-sm font-medium">Company Name</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => updateField("companyName", e.target.value)}
                  placeholder="Enter company name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country" className="text-sm font-medium">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => updateField("country", e.target.value)}
                  placeholder="Enter country"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail" className="text-sm font-medium">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => updateField("contactEmail", e.target.value)}
                  placeholder="email@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsappNumber" className="text-sm font-medium">WhatsApp Number</Label>
                <Input
                  id="whatsappNumber"
                  value={formData.whatsappNumber}
                  onChange={(e) => updateField("whatsappNumber", e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="buyerReferenceId" className="text-sm font-medium">Buyer Reference ID</Label>
                <Input
                  id="buyerReferenceId"
                  value={formData.buyerReferenceId}
                  onChange={(e) => updateField("buyerReferenceId", e.target.value)}
                  placeholder="Reference ID"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="inquirySource" className="text-sm font-medium">Inquiry Source</Label>
                <Select value={formData.inquirySource} onValueChange={(v) => updateField("inquirySource", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="trade_platform">Trade Platform</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="exhibition">Exhibition</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Product Information */}
        <Card className="shadow-sm border-2 border-primary/20 bg-primary/5">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Package className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg">Product Information</CardTitle>
                <CardDescription>Core product category and style details</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Product Category</Label>
                <Select value={formData.productCategory} onValueChange={(v) => updateField("productCategory", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="leggings">Leggings</SelectItem>
                    <SelectItem value="gym_shorts">Gym Shorts</SelectItem>
                    <SelectItem value="sports_bra">Sports Bra</SelectItem>
                    <SelectItem value="top">Top</SelectItem>
                    <SelectItem value="t_shirt">T-Shirt</SelectItem>
                    <SelectItem value="track_pants">Track Pants</SelectItem>
                    <SelectItem value="nightwear">Nightwear</SelectItem>
                    <SelectItem value="kidswear">Kidswear</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="styleCode" className="text-sm font-medium">
                  Style Code / Style Name<RequiredMark />
                </Label>
                <Input
                  id="styleCode"
                  value={formData.styleCode}
                  onChange={(e) => updateField("styleCode", e.target.value)}
                  placeholder="e.g., FF-LEG-001"
                  className="border-accent/30 focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Gender</Label>
                <Select value={formData.gender} onValueChange={(v) => updateField("gender", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="women">Women</SelectItem>
                    <SelectItem value="men">Men</SelectItem>
                    <SelectItem value="kids">Kids</SelectItem>
                    <SelectItem value="unisex">Unisex</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Target Market</Label>
                <Select value={formData.targetMarket} onValueChange={(v) => updateField("targetMarket", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select market" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="domestic">Domestic</SelectItem>
                    <SelectItem value="export">Export</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2 lg:col-span-1">
                <Label htmlFor="intendedOrderQty" className="text-sm font-medium">Intended Order Quantity (Expected MOQ)</Label>
                <Input
                  id="intendedOrderQty"
                  value={formData.intendedOrderQty}
                  onChange={(e) => updateField("intendedOrderQty", e.target.value)}
                  placeholder="e.g., 500 pcs"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Fabric & Construction Details */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Scissors className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Fabric & Construction Details</CardTitle>
                <CardDescription>Material specifications and treatments</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Fabric Type</Label>
                <Select value={formData.fabricType} onValueChange={(v) => updateField("fabricType", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select fabric" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cotton">Cotton</SelectItem>
                    <SelectItem value="polyester">Polyester</SelectItem>
                    <SelectItem value="nylon">Nylon</SelectItem>
                    <SelectItem value="blend">Blend</SelectItem>
                    <SelectItem value="spandex">Spandex</SelectItem>
                    <SelectItem value="modal">Modal</SelectItem>
                    <SelectItem value="bamboo">Bamboo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="gsm" className="text-sm font-medium">
                  GSM<RequiredMark />
                </Label>
                <Input
                  id="gsm"
                  value={formData.gsm}
                  onChange={(e) => updateField("gsm", e.target.value)}
                  placeholder="e.g., 220"
                  className="border-accent/30 focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Stretch Type</Label>
                <Select value={formData.stretchType} onValueChange={(v) => updateField("stretchType", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select stretch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2way">2-Way Stretch</SelectItem>
                    <SelectItem value="4way">4-Way Stretch</SelectItem>
                    <SelectItem value="none">No Stretch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="composition" className="text-sm font-medium">Composition (% values)</Label>
                <Input
                  id="composition"
                  value={formData.composition}
                  onChange={(e) => updateField("composition", e.target.value)}
                  placeholder="e.g., 80% Nylon, 20% Spandex"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Fabric Source</Label>
                <Select value={formData.fabricSource} onValueChange={(v) => updateField("fabricSource", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inhouse">In-house</SelectItem>
                    <SelectItem value="buyer_nominated">Buyer Nominated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="color" className="text-sm font-medium">Color (Pantone / Shade Ref)</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => updateField("color", e.target.value)}
                  placeholder="e.g., Pantone 19-4052 TCX"
                />
              </div>
              <div className="space-y-2 md:col-span-2 lg:col-span-3">
                <Label htmlFor="specialTreatments" className="text-sm font-medium">Special Treatments</Label>
                <Input
                  id="specialTreatments"
                  value={formData.specialTreatments}
                  onChange={(e) => updateField("specialTreatments", e.target.value)}
                  placeholder="e.g., Moisture-wicking, Anti-pilling, UV Protection"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Size & Fit Details */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Ruler className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Size & Fit Details</CardTitle>
                <CardDescription>Size specifications and fit requirements</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <Label htmlFor="sizeRange" className="text-sm font-medium">Size Range</Label>
                <Input
                  id="sizeRange"
                  value={formData.sizeRange}
                  onChange={(e) => updateField("sizeRange", e.target.value)}
                  placeholder="e.g., XS–XXL or S-L"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Size Chart Source</Label>
                <Select value={formData.sizeChartSource} onValueChange={(v) => updateField("sizeChartSource", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buyer">Buyer Provided</SelectItem>
                    <SelectItem value="feather">Feather Fashions Standard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Fit Type</Label>
                <Select value={formData.fitType} onValueChange={(v) => updateField("fitType", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select fit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compression">Compression</SelectItem>
                    <SelectItem value="regular">Regular</SelectItem>
                    <SelectItem value="relaxed">Relaxed</SelectItem>
                    <SelectItem value="slim">Slim Fit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sampleSizeRequired" className="text-sm font-medium">
                  Sample Size Required<RequiredMark />
                </Label>
                <Input
                  id="sampleSizeRequired"
                  value={formData.sampleSizeRequired}
                  onChange={(e) => updateField("sampleSizeRequired", e.target.value)}
                  placeholder="e.g., M"
                  className="border-accent/30 focus:border-primary"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 5: Branding & Labeling */}
        <Card className="shadow-sm border-2 border-accent/30 bg-accent/5">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent rounded-lg">
                <Tag className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg">Branding & Labeling</CardTitle>
                <CardDescription>Brand specifications and label requirements</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="brandName" className="text-sm font-medium">Brand Name</Label>
                <Input
                  id="brandName"
                  value={formData.brandName}
                  onChange={(e) => updateField("brandName", e.target.value)}
                  placeholder="Enter brand name"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Branding Type</Label>
                <Select value={formData.brandingType} onValueChange={(v) => updateField("brandingType", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="heat_transfer">Heat Transfer</SelectItem>
                    <SelectItem value="screen_print">Screen Print</SelectItem>
                    <SelectItem value="embroidery">Embroidery</SelectItem>
                    <SelectItem value="sublimation">Sublimation</SelectItem>
                    <SelectItem value="no_branding">No Branding</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="brandingPlacement" className="text-sm font-medium">Branding Placement</Label>
                <Input
                  id="brandingPlacement"
                  value={formData.brandingPlacement}
                  onChange={(e) => updateField("brandingPlacement", e.target.value)}
                  placeholder="e.g., Center chest, Left hip"
                />
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-medium">Label Type</Label>
              <div className="flex flex-wrap gap-4">
                {["Main Label", "Care Label", "Size Label", "Hang Tag"].map((label) => (
                  <div key={label} className="flex items-center space-x-2">
                    <Checkbox
                      id={label}
                      checked={formData.labelType.includes(label)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateField("labelType", [...formData.labelType, label]);
                        } else {
                          updateField("labelType", formData.labelType.filter((l) => l !== label));
                        }
                      }}
                    />
                    <Label htmlFor={label} className="text-sm">{label}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-medium">Branding Allowed Stage</Label>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="afterSamplePayment"
                    checked={formData.brandingAllowedStage === "after_sample_payment"}
                    onCheckedChange={(checked) => {
                      updateField("brandingAllowedStage", checked ? "after_sample_payment" : "");
                    }}
                  />
                  <Label htmlFor="afterSamplePayment" className="text-sm">After Sample Payment</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="afterBulkConfirmation"
                    checked={formData.brandingAllowedStage === "after_bulk_confirmation"}
                    onCheckedChange={(checked) => {
                      updateField("brandingAllowedStage", checked ? "after_bulk_confirmation" : "");
                    }}
                  />
                  <Label htmlFor="afterBulkConfirmation" className="text-sm">After Bulk Confirmation</Label>
                </div>
              </div>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg border border-muted">
              <p className="text-sm text-muted-foreground">
                ⚠️ <strong>Note:</strong> Brand-labeled samples are provided only as per company sampling policy.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Section 6: Sampling Commercials */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Sampling Commercials</CardTitle>
                <CardDescription>Pricing, payment and delivery terms</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="sampleCost" className="text-sm font-medium">Sample Cost</Label>
                <Input
                  id="sampleCost"
                  value={formData.sampleCost}
                  onChange={(e) => updateField("sampleCost", e.target.value)}
                  placeholder="e.g., ₹500 or $15"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Sample Cost Adjustable Against Order</Label>
                <Select value={formData.costAdjustable} onValueChange={(v) => updateField("costAdjustable", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Sample Payment Status</Label>
                <Select value={formData.paymentStatus} onValueChange={(v) => updateField("paymentStatus", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="received">Received</SelectItem>
                    <SelectItem value="waived">Waived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Courier Mode</Label>
                <Select value={formData.courierMode} onValueChange={(v) => updateField("courierMode", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="express">Express (DHL/FedEx)</SelectItem>
                    <SelectItem value="standard">Standard Courier</SelectItem>
                    <SelectItem value="pickup">Buyer Pickup</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Courier Charges Borne By</Label>
                <Select value={formData.courierCharges} onValueChange={(v) => updateField("courierCharges", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buyer">Buyer</SelectItem>
                    <SelectItem value="feather">Feather Fashions</SelectItem>
                    <SelectItem value="shared">Shared</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expectedDispatchDate" className="text-sm font-medium">Expected Sample Dispatch Date</Label>
                <Input
                  id="expectedDispatchDate"
                  type="date"
                  value={formData.expectedDispatchDate}
                  onChange={(e) => updateField("expectedDispatchDate", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 7: Uploads & References */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Paperclip className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Uploads & References</CardTitle>
                <CardDescription>Attach supporting documents and artwork</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { key: "techPack", label: "Tech Pack", icon: FileText, accept: ".pdf,.jpg,.png" },
                { key: "referenceImages", label: "Reference Images", icon: Image, accept: ".jpg,.jpeg,.png,.webp" },
                { key: "sizeChart", label: "Size Chart", icon: FileText, accept: ".pdf,.jpg,.png,.xlsx" },
                { key: "brandingArtwork", label: "Branding Artwork", icon: Image, accept: ".ai,.eps,.pdf,.png,.svg" },
              ].map(({ key, label, icon: Icon, accept }) => (
                <div key={key} className="space-y-3">
                  <Label className="text-sm font-medium">{label}</Label>
                  <div
                    className="border-2 border-dashed border-muted rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => document.getElementById(`file-${key}`)?.click()}
                  >
                    <input
                      id={`file-${key}`}
                      type="file"
                      accept={accept}
                      multiple
                      className="hidden"
                      onChange={(e) => handleFileUpload(key, e.target.files)}
                    />
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Drag & drop or click to upload</p>
                    <p className="text-xs text-muted-foreground mt-1">{accept.replace(/\./g, "").toUpperCase()}</p>
                  </div>
                  {uploadedFiles[key].length > 0 && (
                    <div className="space-y-2">
                      {uploadedFiles[key].map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-muted/50 rounded-md"
                        >
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(key, index)}
                            className="h-6 w-6 p-0 text-destructive"
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Section 8: Internal Notes */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <StickyNote className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg">Internal Notes</CardTitle>
                <CardDescription>Internal team notes – not shared with buyer</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.internalNotes}
              onChange={(e) => updateField("internalNotes", e.target.value)}
              placeholder="Add any internal notes, observations, or special instructions..."
              className="min-h-[120px]"
            />
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4 pb-8">
          <Button variant="outline" size="lg" onClick={handleSaveDraft} className="gap-2">
            <Save className="h-4 w-4" />
            Save as Draft
          </Button>
          <Button size="lg" onClick={handleSubmit} className="gap-2">
            <Send className="h-4 w-4" />
            Submit for Sampling
          </Button>
        </div>
      </div>
    </div>
  );
}
