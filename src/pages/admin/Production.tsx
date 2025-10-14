import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RawMaterialsManager } from "@/components/admin/production/RawMaterialsManager";
import { BillOfMaterialsManager } from "@/components/admin/production/BillOfMaterialsManager";
import { ProductionBatchesManager } from "@/components/admin/production/ProductionBatchesManager";
import { ProductionAnalytics } from "@/components/admin/production/ProductionAnalytics";

const Production = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Production Cost Management</h1>
        <p className="text-muted-foreground">
          Track materials, production batches, and analyze manufacturing costs
        </p>
      </div>

      <Tabs defaultValue="raw-materials" className="space-y-4">
        <TabsList>
          <TabsTrigger value="raw-materials">Raw Materials</TabsTrigger>
          <TabsTrigger value="bom">Bill of Materials</TabsTrigger>
          <TabsTrigger value="batches">Production Batches</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="raw-materials">
          <RawMaterialsManager />
        </TabsContent>

        <TabsContent value="bom">
          <BillOfMaterialsManager />
        </TabsContent>

        <TabsContent value="batches">
          <ProductionBatchesManager />
        </TabsContent>

        <TabsContent value="analytics">
          <ProductionAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Production;
