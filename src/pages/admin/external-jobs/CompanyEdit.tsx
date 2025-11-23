import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

const CompanyEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: company, isLoading } = useQuery({
    queryKey: ['external-job-company', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('external_job_companies')
        .select('*')
        .eq('id', id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const updateCompany = useMutation({
    mutationFn: async (data: CompanyFormData) => {
      const { error } = await supabase
        .from('external_job_companies')
        .update(data)
        .eq('id', id!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['external-job-companies'] });
      queryClient.invalidateQueries({ queryKey: ['external-job-company', id] });
      toast.success('Company updated successfully');
      navigate(`/admin/external-jobs/company/${id}`);
    },
    onError: () => {
      toast.error('Failed to update company');
    },
  });

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    values: company ? {
      company_name: company.company_name,
      address: company.address,
      contact_number: company.contact_number,
      contact_person: company.contact_person,
      email: company.email || "",
      alternate_number: company.alternate_number || "",
      gst_number: company.gst_number || "",
      upi_id: company.upi_id || "",
      account_details: company.account_details || "",
      notes: company.notes || "",
    } : undefined,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const onSubmit = async (data: CompanyFormData) => {
    await updateCompany.mutateAsync(data);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/admin/external-jobs/company/${id}`)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Company</h1>
          <p className="text-muted-foreground mt-1">
            Update company details
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
                onClick={() => navigate(`/admin/external-jobs/company/${id}`)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateCompany.isPending}>
                {updateCompany.isPending ? "Updating..." : "Update Company"}
              </Button>
            </div>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default CompanyEdit;
