import { useEffect } from 'react';
import { useNavigate, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import ContactInquiries from '@/components/admin/ContactInquiries';
import ProductsManager from '@/components/admin/ProductsManager';
import BulkOrdersManager from '@/components/admin/BulkOrdersManager';
import NewsletterManager from '@/components/admin/NewsletterManager';
import CustomersManager from '@/components/admin/CustomersManager';
import { OrdersManager } from '@/components/admin/OrdersManager';
import { EmployeeContactsManager } from '@/components/admin/EmployeeContactsManager';
import BranchesManager from '@/components/admin/BranchesManager';
import ExpensesManager from '@/components/admin/ExpensesManager';
import InvoiceGenerator from './admin/InvoiceGenerator';
import InvoiceHistory from './admin/InvoiceHistory';
import InvoiceReset from './admin/InvoiceReset';
import Dashboard from './admin/Dashboard';
import AdminOrderDetails from './admin/OrderDetails';
import Production from './admin/Production';
import JobOrders from './admin/JobOrders';
import JobManagement from './admin/JobManagement';
import EmployeeDetailsPage from './admin/EmployeeDetailsPage';
import Settings from './admin/Settings';
import SeedProducts from './admin/SeedProducts';

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
        <div className="flex-1 flex flex-col">
          <AdminHeader />
          <main className="flex-1 p-6 overflow-auto">
            <Routes>
              <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/orders" element={<OrdersManager />} />
              <Route path="/orders/:orderId" element={<AdminOrderDetails />} />
              <Route path="/production" element={<Production />} />
              <Route path="/job-orders" element={<JobOrders />} />
              <Route path="/job-management" element={<JobManagement />} />
              <Route path="/job-management/employee/:id" element={<EmployeeDetailsPage />} />
              <Route path="/branches" element={<BranchesManager />} />
              <Route path="/expenses" element={<ExpensesManager />} />
              <Route path="/invoice" element={<InvoiceGenerator />} />
              <Route path="/customers" element={<CustomersManager />} />
              <Route path="/products" element={<ProductsManager />} />
              <Route path="/seed-products" element={<SeedProducts />} />
              <Route path="/contacts" element={<EmployeeContactsManager />} />
              <Route path="/history" element={<InvoiceHistory />} />
              <Route path="/inquiries" element={<ContactInquiries />} />
              <Route path="/bulk-orders" element={<BulkOrdersManager />} />
              <Route path="/newsletter" element={<NewsletterManager />} />
              <Route path="/invoice-reset" element={<InvoiceReset />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Admin;
