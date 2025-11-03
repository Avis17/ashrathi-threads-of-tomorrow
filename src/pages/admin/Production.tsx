import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RawMaterialsManager } from "@/components/admin/production/RawMaterialsManager";
import { BillOfMaterialsManager } from "@/components/admin/production/BillOfMaterialsManager";
import { ProductionBatchesManager } from "@/components/admin/production/ProductionBatchesManager";
import { ProductionAnalytics } from "@/components/admin/production/ProductionAnalytics";
import { PurchasesManager } from "@/components/admin/production/PurchasesManager";
import { PredictionAnalytics } from "@/components/admin/production/PredictionAnalytics";

const Production = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Production Cost Management</h1>
        <p className="text-muted-foreground">
          Track materials, purchases, production batches, and analyze manufacturing costs with predictions
        </p>
      </div>

      <Tabs defaultValue="purchases" className="space-y-4">
        <TabsList>
          <TabsTrigger value="purchases">Purchases</TabsTrigger>
          <TabsTrigger value="raw-materials">Raw Materials</TabsTrigger>
          <TabsTrigger value="bom">Bill of Materials</TabsTrigger>
          <TabsTrigger value="batches">Production Batches</TabsTrigger>
          <TabsTrigger value="predictions">Prediction Analytics</TabsTrigger>
          <TabsTrigger value="analytics">Cost Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="purchases">
          <PurchasesManager />
        </TabsContent>

        <TabsContent value="raw-materials">
          <RawMaterialsManager />
        </TabsContent>

        <TabsContent value="bom">
          <BillOfMaterialsManager />
        </TabsContent>

        <TabsContent value="batches">
          <ProductionBatchesManager />
        </TabsContent>

        <TabsContent value="predictions">
          <PredictionAnalytics />
        </TabsContent>

        <TabsContent value="analytics">
          <ProductionAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Production;
