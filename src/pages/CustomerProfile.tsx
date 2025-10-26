import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import MyOrders from './MyOrders';
import { AddressList } from '@/components/customer/AddressList';
import { ProfileDetailsForm } from '@/components/customer/ProfileDetailsForm';

export default function CustomerProfile() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="details">Profile Details</TabsTrigger>
          <TabsTrigger value="orders">My Orders</TabsTrigger>
          <TabsTrigger value="addresses">Delivery Addresses</TabsTrigger>
        </TabsList>
        <TabsContent value="details">
          <Card className="p-6">
            <ProfileDetailsForm />
          </Card>
        </TabsContent>
        <TabsContent value="orders">
          <MyOrders />
        </TabsContent>
        <TabsContent value="addresses">
          <Card className="p-6">
            <AddressList />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
