import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JobOrdersManager } from "@/components/admin/joborders/JobOrdersManager";
import { JobOrderForm } from "@/components/admin/joborders/JobOrderForm";
import { JobOrderDetails } from "@/components/admin/joborders/JobOrderDetails";

type View = "list" | "create" | "edit" | "view";

const JobOrders = () => {
  const [currentView, setCurrentView] = useState<View>("list");
  const [selectedJobOrderId, setSelectedJobOrderId] = useState<string>();

  const handleCreateNew = () => {
    setSelectedJobOrderId(undefined);
    setCurrentView("create");
  };

  const handleEdit = (id: string) => {
    setSelectedJobOrderId(id);
    setCurrentView("edit");
  };

  const handleView = (id: string) => {
    setSelectedJobOrderId(id);
    setCurrentView("view");
  };

  const handleBack = () => {
    setCurrentView("list");
    setSelectedJobOrderId(undefined);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Job Orders</h1>
        <p className="text-muted-foreground">
          Manage external job work orders and track progress
        </p>
      </div>

      {currentView === "list" && (
        <JobOrdersManager
          onCreateNew={handleCreateNew}
          onEdit={handleEdit}
          onView={handleView}
        />
      )}

      {(currentView === "create" || currentView === "edit") && (
        <JobOrderForm
          jobOrderId={selectedJobOrderId}
          onBack={handleBack}
        />
      )}

      {currentView === "view" && selectedJobOrderId && (
        <JobOrderDetails
          jobOrderId={selectedJobOrderId}
          onBack={handleBack}
        />
      )}
    </div>
  );
};

export default JobOrders;
