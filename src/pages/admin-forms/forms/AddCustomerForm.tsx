import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { CustomerForm, CustomerFormData } from "@/components/admin/customers/CustomerForm";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function AddCustomerForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createCustomer = useMutation({
    mutationFn: async (data: CustomerFormData) => {
      const { error } = await supabase.from('customers').insert(data as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success("Customer added successfully!");
      navigate("/admin-forms");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add customer");
    }
  });

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
            <h1 className="text-3xl font-bold text-white">Add Customer</h1>
            <p className="text-slate-300 mt-1">
              Register a new wholesale customer
            </p>
          </div>
        </div>

        <Card className="p-6 bg-white border-0">
          <CustomerForm
            onSubmit={(data) => createCustomer.mutate(data)}
            isLoading={createCustomer.isPending}
          />
        </Card>
      </div>
    </div>
  );
}
