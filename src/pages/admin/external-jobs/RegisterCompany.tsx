import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
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

const RegisterCompany = () => {
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
    navigate("/admin/external-jobs");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/admin/external-jobs")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Register New Company</h1>
          <p className="text-muted-foreground mt-1">
            Add a new company for job order management
          </p>
        </div>
      </div>

      <Card className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="company_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter company name" />
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
                    <FormLabel>Contact Person *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter contact person" />
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
                    <FormLabel>Contact Number *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="+91 9876543210" />
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
                    <FormLabel>Alternate Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="+91 9876543210" />
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="company@example.com" />
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
                    <FormLabel>GST Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="29XXXXX1234X1Z5" />
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
                    <FormLabel>UPI ID</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="company@upi" />
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
                  <FormLabel>Address *</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Enter complete address" rows={3} />
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
                  <FormLabel>Account Details</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Bank name, Account number, IFSC, etc." rows={3} />
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
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Additional notes about the company" rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/admin/external-jobs")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createCompany.isPending}>
                {createCompany.isPending ? "Registering..." : "Register Company"}
              </Button>
            </div>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default RegisterCompany;