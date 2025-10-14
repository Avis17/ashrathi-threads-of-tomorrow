import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ContactInquiries from '@/components/admin/ContactInquiries';
import ProductsManager from '@/components/admin/ProductsManager';
import BulkOrdersManager from '@/components/admin/BulkOrdersManager';
import NewsletterManager from '@/components/admin/NewsletterManager';

const Admin = () => {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/auth');
    }
  }, [isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>
      <Tabs defaultValue="inquiries" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="inquiries">Contact Inquiries</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="bulk-orders">Bulk Orders</TabsTrigger>
          <TabsTrigger value="newsletter">Newsletter</TabsTrigger>
        </TabsList>
        <TabsContent value="inquiries">
          <ContactInquiries />
        </TabsContent>
        <TabsContent value="products">
          <ProductsManager />
        </TabsContent>
        <TabsContent value="bulk-orders">
          <BulkOrdersManager />
        </TabsContent>
        <TabsContent value="newsletter">
          <NewsletterManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
