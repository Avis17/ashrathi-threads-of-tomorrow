import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Building2, Phone, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const CompanyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!company) {
    return <div>Company not found</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin/external-jobs")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{company.company_name}</h1>
            <p className="text-muted-foreground mt-1">Company Details</p>
          </div>
        </div>
        <Button onClick={() => navigate(`/admin/external-jobs/company/edit/${company.id}`)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Company
        </Button>
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Building2 className="h-4 w-4" />
                <span className="text-sm">Company Name</span>
              </div>
              <p className="font-semibold">{company.company_name}</p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Phone className="h-4 w-4" />
                <span className="text-sm">Contact Person</span>
              </div>
              <p className="font-semibold">{company.contact_person}</p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Phone className="h-4 w-4" />
                <span className="text-sm">Contact Number</span>
              </div>
              <p className="font-semibold">{company.contact_number}</p>
            </div>

            {company.alternate_number && (
              <div>
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Phone className="h-4 w-4" />
                  <span className="text-sm">Alternate Number</span>
                </div>
                <p className="font-semibold">{company.alternate_number}</p>
              </div>
            )}

            {company.email && (
              <div>
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">Email</span>
                </div>
                <p className="font-semibold">{company.email}</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">Address</span>
              </div>
              <p className="font-semibold">{company.address}</p>
            </div>

            {company.gst_number && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">GST Number</p>
                <p className="font-semibold">{company.gst_number}</p>
              </div>
            )}

            {company.upi_id && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">UPI ID</p>
                <p className="font-semibold">{company.upi_id}</p>
              </div>
            )}

            <div>
              <p className="text-sm text-muted-foreground mb-1">Status</p>
              <Badge variant={company.is_active ? "default" : "destructive"}>
                {company.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
        </div>

        {company.account_details && (
          <div className="mt-6 pt-6 border-t">
            <p className="text-sm text-muted-foreground mb-2">Account Details</p>
            <p className="whitespace-pre-wrap">{company.account_details}</p>
          </div>
        )}

        {company.notes && (
          <div className="mt-6 pt-6 border-t">
            <p className="text-sm text-muted-foreground mb-2">Notes</p>
            <p className="whitespace-pre-wrap">{company.notes}</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default CompanyDetails;
