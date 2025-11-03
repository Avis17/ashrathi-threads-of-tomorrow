import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RawMaterialsManager } from "@/components/admin/production/RawMaterialsManager";
import { BillOfMaterialsManager } from "@/components/admin/production/BillOfMaterialsManager";
import { PurchaseBatchManager } from "@/components/admin/production/PurchaseBatchManager";
import { ProductionRunManager } from "@/components/admin/production/ProductionRunManager";
import { PredictionAnalytics } from "@/components/admin/production/PredictionAnalytics";

const Production = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Production Management</h1>
        <p className="text-muted-foreground">
          Manage purchase batches, track production runs from start to finish with complete cost breakdown
        </p>
      </div>

      <Tabs defaultValue="purchase-batches" className="space-y-4">
        <TabsList>
          <TabsTrigger value="purchase-batches">Purchase Batches</TabsTrigger>
          <TabsTrigger value="production-runs">Production Runs</TabsTrigger>
          <TabsTrigger value="raw-materials">Raw Materials</TabsTrigger>
          <TabsTrigger value="bom">Bill of Materials</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="purchase-batches">
          <PurchaseBatchManager />
        </TabsContent>

        <TabsContent value="production-runs">
          <ProductionRunManager />
        </TabsContent>

        <TabsContent value="raw-materials">
          <RawMaterialsManager />
        </TabsContent>

        <TabsContent value="bom">
          <BillOfMaterialsManager />
        </TabsContent>

        <TabsContent value="analytics">
          <PredictionAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Production;
