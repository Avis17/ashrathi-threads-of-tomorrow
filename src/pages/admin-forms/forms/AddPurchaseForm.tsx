import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import PurchaseOrderForm from "@/components/admin/purchases/PurchaseOrderForm";
import { usePurchaseOrders } from "@/hooks/usePurchaseOrders";

export default function AddPurchaseForm() {
  const navigate = useNavigate();
  const { suppliers } = usePurchaseOrders();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-teal-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
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
            <h1 className="text-3xl font-bold text-white">Create Purchase Order</h1>
            <p className="text-slate-300 mt-1">
              Record a new purchase with supplier and line items
            </p>
          </div>
        </div>

        <Card className="p-6 bg-white border-0">
          <PurchaseOrderForm 
            purchaseOrder={null}
            suppliers={suppliers || []} 
            onClose={() => {
              toast.success("Purchase order created successfully!");
              navigate("/admin-forms");
            }} 
          />
        </Card>
      </div>
    </div>
  );
}
