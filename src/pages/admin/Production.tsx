import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductionBatchManager } from "@/components/admin/production/ProductionBatchManager";
import { MaterialsManager } from "@/components/admin/production/MaterialsManager";
import { ProductionAnalytics } from "@/components/admin/production/ProductionAnalytics";

const Production = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Production Management</h1>
        <p className="text-muted-foreground">
          Complete workflow tracking from fabric purchase to sales
        </p>
      </div>

      <Tabs defaultValue="batches" className="space-y-4">
        <TabsList>
          <TabsTrigger value="batches">Production Batches</TabsTrigger>
          <TabsTrigger value="materials">Materials</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="batches">
          <ProductionBatchManager />
        </TabsContent>

        <TabsContent value="materials">
          <MaterialsManager />
        </TabsContent>

        <TabsContent value="analytics">
          <ProductionAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Production;
