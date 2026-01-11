import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Download, FileText } from "lucide-react";

interface BrochureDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const countries = [
  "India", "United Arab Emirates", "Saudi Arabia", "United States", "United Kingdom",
  "Germany", "France", "Australia", "Canada", "South Africa", "Kenya", "Nigeria",
  "Egypt", "Qatar", "Kuwait", "Oman", "Bahrain", "Singapore", "Malaysia", "Indonesia",
  "Bangladesh", "Sri Lanka", "Nepal", "Other"
];

const purposes = [
  { value: "importer", label: "Importer" },
  { value: "buying_house", label: "Buying House" },
  { value: "agent", label: "Agent / Broker" },
  { value: "distributor", label: "Distributor" },
  { value: "retail_chain", label: "Retail Chain" },
  { value: "other", label: "Other" },
];

const BrochureDownloadModal = ({ isOpen, onClose, onSuccess }: BrochureDownloadModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    country: "",
    email: "",
    phone: "",
    purpose: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.company || !formData.country || !formData.email || !formData.purpose) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("brochure_leads")
        .insert({
          name: formData.name,
          company: formData.company,
          country: formData.country,
          email: formData.email,
          phone: formData.phone || null,
          purpose: formData.purpose,
        });

      if (error) throw error;

      toast.success("Thank you! Your download is starting...");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error submitting lead:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-secondary border-border">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold/20 to-amber-500/20 flex items-center justify-center">
              <FileText className="h-6 w-6 text-gold" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-white">
                Download Export Brochure
              </DialogTitle>
              <DialogDescription className="text-white/60">
                Get our complete catalog with pricing info
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white/80">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your full name"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company" className="text-white/80">Company *</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Company name"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country" className="text-white/80">Country *</Label>
              <Select
                value={formData.country}
                onValueChange={(value) => setFormData({ ...formData, country: value })}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="purpose" className="text-white/80">Purpose *</Label>
              <Select
                value={formData.purpose}
                onValueChange={(value) => setFormData({ ...formData, purpose: value })}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Your role" />
                </SelectTrigger>
                <SelectContent>
                  {purposes.map((purpose) => (
                    <SelectItem key={purpose.value} value={purpose.value}>
                      {purpose.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/80">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@company.com"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-white/80">Phone (Optional)</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 99999 99999"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
              />
            </div>
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-gold to-amber-500 text-black hover:from-gold/90 hover:to-amber-500/90 font-bold py-6"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-5 w-5" />
                  Download Brochure (PDF)
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-white/40 text-center">
            By downloading, you agree to receive export-related communications from Feather Fashions.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BrochureDownloadModal;
