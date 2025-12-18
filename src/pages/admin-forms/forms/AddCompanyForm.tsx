import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useCreateExternalJobCompany } from "@/hooks/useExternalJobOrders";

const companySchema = z.object({
  company_name: z.string().min(1, "Company name is required"),
  address: z.string().min(1, "Address is required"),
  contact_number: z.string().min(10, "Valid contact number required"),
  contact_person: z.string().min(1, "Contact person is required"),
  email: z.string().email("Valid email required").optional().or(z.literal("")),
  alternate_number: z.string().optional(),
  gst_number: z.string().optional(),
  upi_id: z.string().optional(),
  account_details: z.string().optional(),
  notes: z.string().optional(),
});

type CompanyFormData = z.infer<typeof companySchema>;

export default function AddCompanyForm() {
  const navigate = useNavigate();
  const createCompany = useCreateExternalJobCompany();

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      company_name: "",
      address: "",
      contact_number: "",
      contact_person: "",
      email: "",
      alternate_number: "",
      gst_number: "",
      upi_id: "",
      account_details: "",
      notes: "",
    },
  });

  const onSubmit = async (data: CompanyFormData) => {
    await createCompany.mutateAsync({
      company_name: data.company_name,
      address: data.address,
      contact_number: data.contact_number,
      contact_person: data.contact_person,
      email: data.email || undefined,
      alternate_number: data.alternate_number || undefined,
      gst_number: data.gst_number || undefined,
      upi_id: data.upi_id || undefined,
      account_details: data.account_details || undefined,
      notes: data.notes || undefined,
    });
    toast.success("Company registered successfully!");
    navigate("/admin-forms");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-teal-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin-forms")}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">Register New Company</h1>
            <p className="text-slate-300 mt-1">
              Add a new company for job order management
            </p>
          </div>
        </div>

        <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="company_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200">Company Name *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter company name" className="bg-white/10 border-white/20 text-white placeholder:text-slate-400" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contact_person"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200">Contact Person *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter contact person" className="bg-white/10 border-white/20 text-white placeholder:text-slate-400" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contact_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200">Contact Number *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="+91 9876543210" className="bg-white/10 border-white/20 text-white placeholder:text-slate-400" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="alternate_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200">Alternate Number</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="+91 9876543210" className="bg-white/10 border-white/20 text-white placeholder:text-slate-400" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200">Email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="company@example.com" className="bg-white/10 border-white/20 text-white placeholder:text-slate-400" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gst_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200">GST Number</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="29XXXXX1234X1Z5" className="bg-white/10 border-white/20 text-white placeholder:text-slate-400" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="upi_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200">UPI ID</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="company@upi" className="bg-white/10 border-white/20 text-white placeholder:text-slate-400" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">Address *</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Enter complete address" rows={3} className="bg-white/10 border-white/20 text-white placeholder:text-slate-400" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="account_details"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">Account Details</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Bank name, Account number, IFSC, etc." rows={3} className="bg-white/10 border-white/20 text-white placeholder:text-slate-400" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">Notes</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Additional notes about the company" rows={3} className="bg-white/10 border-white/20 text-white placeholder:text-slate-400" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/admin-forms")}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createCompany.isPending} className="bg-emerald-600 hover:bg-emerald-700">
                  {createCompany.isPending ? "Registering..." : "Register Company"}
                </Button>
              </div>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  );
}
