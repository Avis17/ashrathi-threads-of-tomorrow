import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AddCustomer } from './customers/AddCustomer';
import { ViewEditCustomers } from './customers/ViewEditCustomers';

export default function CustomersManager() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Customer Management</h2>
        <p className="text-muted-foreground">Add and manage your customers</p>
      </div>

      <Tabs defaultValue="view" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="add">Add Customer</TabsTrigger>
          <TabsTrigger value="view">View/Edit Customers</TabsTrigger>
        </TabsList>
        <TabsContent value="add">
          <AddCustomer />
        </TabsContent>
        <TabsContent value="view">
          <ViewEditCustomers />
        </TabsContent>
      </Tabs>
    </div>
  );
}