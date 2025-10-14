import { useEffect } from 'react';
import { useNavigate, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import ContactInquiries from '@/components/admin/ContactInquiries';
import ProductsManager from '@/components/admin/ProductsManager';
import BulkOrdersManager from '@/components/admin/BulkOrdersManager';
import NewsletterManager from '@/components/admin/NewsletterManager';
import CustomersManager from '@/components/admin/CustomersManager';
import InvoiceGenerator from './admin/InvoiceGenerator';
import InvoiceHistory from './admin/InvoiceHistory';
import InvoiceReset from './admin/InvoiceReset';

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
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <main className="flex-1 p-6 overflow-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/admin/invoice" replace />} />
            <Route path="/invoice" element={<InvoiceGenerator />} />
            <Route path="/customers" element={<CustomersManager />} />
            <Route path="/products" element={<ProductsManager />} />
            <Route path="/history" element={<InvoiceHistory />} />
            <Route path="/inquiries" element={<ContactInquiries />} />
            <Route path="/bulk-orders" element={<BulkOrdersManager />} />
            <Route path="/newsletter" element={<NewsletterManager />} />
            <Route path="/invoice-reset" element={<InvoiceReset />} />
          </Routes>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Admin;
