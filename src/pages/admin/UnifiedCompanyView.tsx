import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Building2, Users, Pencil, Save, X, Phone, Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const companySchema = z.object({
  name: z.string().min(1, 'Company/Worker name is required'),
  contact_person: z.string().optional().default(''),
  phone: z.string().optional().default(''),
  alternate_number: z.string().optional().default(''),
  email: z.string().email('Valid email required').optional().or(z.literal('')),
  address: z.string().optional().default(''),
  gst_number: z.string().optional().default(''),
  upi_id: z.string().optional().default(''),
  account_details: z.string().optional().default(''),
  notes: z.string().optional().default(''),
  is_active: z.boolean().default(true),
});

type CompanyFormData = z.infer<typeof companySchema>;

interface UnifiedCompanyData {
  id: string;
  name: string;
  contact_person: string;
  phone: string;
  alternate_number: string;
  email: string;
  address: string;
  gst_number: string;
  upi_id: string;
  account_details: string;
  notes: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const UnifiedCompanyView = () => {
  const { source, id } = useParams<{ source: string; id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const isExternal = source === 'external';

  const { data: company, isLoading } = useQuery({
    queryKey: ['unified-company', source, id],
    queryFn: async (): Promise<UnifiedCompanyData> => {
      if (isExternal) {
        const { data, error } = await supabase
          .from('external_job_companies')
          .select('*')
          .eq('id', id!)
          .single();
        if (error) throw error;
        return {
          id: data.id,
          name: data.company_name,
          contact_person: data.contact_person || '',
          phone: data.contact_number || '',
          alternate_number: data.alternate_number || '',
          email: data.email || '',
          address: data.address || '',
          gst_number: data.gst_number || '',
          upi_id: data.upi_id || '',
          account_details: data.account_details || '',
          notes: data.notes || '',
          is_active: data.is_active ?? true,
          created_at: data.created_at || '',
          updated_at: data.updated_at || '',
        };
      } else {
        const { data, error } = await supabase
          .from('job_workers')
          .select('*')
          .eq('id', id!)
          .single();
        if (error) throw error;
        return {
          id: data.id,
          name: data.name,
          contact_person: data.contact_person || '',
          phone: data.phone || '',
          alternate_number: (data as any).alternate_number || '',
          email: data.email || '',
          address: data.address || '',
          gst_number: data.gstin || '',
          upi_id: (data as any).upi_id || '',
          account_details: (data as any).account_details || '',
          notes: (data as any).notes || '',
          is_active: data.is_active ?? true,
          created_at: data.created_at || '',
          updated_at: data.updated_at || '',
        };
      }
    },
    enabled: !!id && !!source,
  });

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    values: company
      ? {
          name: company.name,
          contact_person: company.contact_person,
          phone: company.phone,
          alternate_number: company.alternate_number,
          email: company.email,
          address: company.address,
          gst_number: company.gst_number,
          upi_id: company.upi_id,
          account_details: company.account_details,
          notes: company.notes,
          is_active: company.is_active,
        }
      : undefined,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: CompanyFormData) => {
      if (isExternal) {
        const { error } = await supabase
          .from('external_job_companies')
          .update({
            company_name: data.name,
            contact_person: data.contact_person,
            contact_number: data.phone,
            alternate_number: data.alternate_number || null,
            email: data.email || null,
            address: data.address,
            gst_number: data.gst_number || null,
            upi_id: data.upi_id || null,
            account_details: data.account_details || null,
            notes: data.notes || null,
            is_active: data.is_active,
          })
          .eq('id', id!);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('job_workers')
          .update({
            name: data.name,
            contact_person: data.contact_person || null,
            phone: data.phone || null,
            alternate_number: data.alternate_number || null,
            email: data.email || null,
            address: data.address || null,
            gstin: data.gst_number || null,
            upi_id: data.upi_id || null,
            account_details: data.account_details || null,
            notes: data.notes || null,
            is_active: data.is_active,
          } as any)
          .eq('id', id!);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unified-company', source, id] });
      queryClient.invalidateQueries({ queryKey: ['all-external-job-companies'] });
      queryClient.invalidateQueries({ queryKey: ['all-job-workers'] });
      toast.success('Company updated successfully');
      setIsEditing(false);
    },
    onError: () => {
      toast.error('Failed to update company');
    },
  });

  const onSubmit = (data: CompanyFormData) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <p className="text-lg text-muted-foreground">Company not found</p>
        <Button variant="outline" onClick={() => navigate('/admin/job-management')}>
          Go Back
        </Button>
      </div>
    );
  }

  const DetailRow = ({ label, value }: { label: string; value: string }) => (
    <div className="py-3 border-b last:border-b-0">
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className="text-sm font-medium">{value || <span className="text-muted-foreground italic">Not provided</span>}</p>
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/job-management')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${isExternal ? 'bg-primary/10' : 'bg-secondary/20'}`}>
              {isExternal ? (
                <Building2 className="h-6 w-6 text-primary" />
              ) : (
                <Users className="h-6 w-6 text-secondary-foreground" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{company.name}</h1>
                <Badge variant={company.is_active ? 'default' : 'secondary'}>
                  {company.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="outline" className="text-xs">
                  {isExternal ? 'External Company' : 'Job Worker'}
                </Badge>
                {company.phone && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" /> {company.phone}
                  </span>
                )}
                {company.email && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" /> {company.email}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} className="gap-2">
            <Pencil className="h-4 w-4" />
            Edit Details
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                form.reset();
                setIsEditing(false);
              }}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={updateMutation.isPending}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      {isEditing ? (
        <Card className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company / Worker Name *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter name" />
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
                      <FormLabel>Contact Person</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Contact person name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
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
                        <Input {...field} type="email" placeholder="email@example.com" />
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
                <div className="flex items-center gap-3 pt-6">
                  <FormField
                    control={form.control}
                    name="is_active"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-3">
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <Label>Active Status</Label>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Enter complete address" rows={2} />
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
                    <FormLabel>Bank / Account Details</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Bank name, Account number, IFSC, etc." rows={2} />
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
                      <Textarea {...field} placeholder="Additional notes" rows={2} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Info */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Basic Information
            </h3>
            <DetailRow label="Company / Worker Name" value={company.name} />
            <DetailRow label="Contact Person" value={company.contact_person} />
            <DetailRow label="Type" value={isExternal ? 'External Company' : 'Job Worker'} />
            <DetailRow label="Status" value={company.is_active ? 'Active' : 'Inactive'} />
          </Card>

          {/* Contact Info */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Contact Details
            </h3>
            <DetailRow label="Phone" value={company.phone} />
            <DetailRow label="Alternate Number" value={company.alternate_number} />
            <DetailRow label="Email" value={company.email} />
            <DetailRow label="Address" value={company.address} />
          </Card>

          {/* Financial Info */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Financial Details
            </h3>
            <DetailRow label="GST Number" value={company.gst_number} />
            <DetailRow label="UPI ID" value={company.upi_id} />
            <DetailRow label="Bank / Account Details" value={company.account_details} />
          </Card>

          {/* Additional Info */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Additional Information
            </h3>
            <DetailRow label="Notes" value={company.notes} />
            <DetailRow label="Created" value={company.created_at ? new Date(company.created_at).toLocaleDateString('en-IN') : ''} />
            <DetailRow label="Last Updated" value={company.updated_at ? new Date(company.updated_at).toLocaleDateString('en-IN') : ''} />
          </Card>
        </div>
      )}
    </div>
  );
};

export default UnifiedCompanyView;
