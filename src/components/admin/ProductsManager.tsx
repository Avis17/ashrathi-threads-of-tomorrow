import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AddProduct } from './products/AddProduct';
import { ViewEditProducts } from './products/ViewEditProducts';

export default function ProductsManager() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Product Management</h2>
        <p className="text-muted-foreground">Add and manage your products</p>
      </div>

      <Tabs defaultValue="view" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="add">Add Product</TabsTrigger>
          <TabsTrigger value="view">View/Edit Products</TabsTrigger>
        </TabsList>
        <TabsContent value="add">
          <AddProduct />
        </TabsContent>
        <TabsContent value="view">
          <ViewEditProducts />
        </TabsContent>
      </Tabs>
    </div>
  );
}
