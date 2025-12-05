import { useNavigate } from "react-router-dom";
import { Plus, Building2, TrendingUp, CreditCard, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExternalJobOrdersList } from "@/components/admin/external-jobs/ExternalJobOrdersList";

const ExternalJobOrders = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Job Order Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage external job work orders and track progress
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Button
            onClick={() => navigate("/admin/external-jobs/dashboard")}
            variant="outline"
            className="gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            Dashboard
          </Button>
          <Button
            onClick={() => navigate("/admin/external-jobs/rate-cards")}
            variant="outline"
            className="gap-2"
          >
            <CreditCard className="h-4 w-4" />
            View Rate Cards
          </Button>
          <Button
            onClick={() => navigate("/admin/external-jobs/companies")}
            variant="outline"
            className="gap-2"
          >
            <List className="h-4 w-4" />
            List Companies
          </Button>
          <Button
            onClick={() => navigate("/admin/external-jobs/register-company")}
            variant="outline"
            className="gap-2"
          >
            <Building2 className="h-4 w-4" />
            Register Company
          </Button>
          <Button
            onClick={() => navigate("/admin/external-jobs/add-job")}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add New Job
          </Button>
        </div>
      </div>

      <ExternalJobOrdersList />
    </div>
  );
};

export default ExternalJobOrders;