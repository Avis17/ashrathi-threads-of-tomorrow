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
import RBACManagement from './admin/RBACManagement';
import { PermissionGuard } from '@/components/PermissionGuard';

const Admin = () => {
  const { isAdmin, isSuperAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAdmin && !isSuperAdmin) {
      console.log('[Admin] Access denied - redirecting to auth');
      navigate('/auth');
    }
  }, [isAdmin, isSuperAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-2">Loading admin panel...</p>
          <div className="text-xs text-muted-foreground">Checking permissions...</div>
        </div>
      </div>
    );
  }

  if (!isAdmin && !isSuperAdmin) {
    console.log('[Admin] Access check failed');
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
              <Route path="/dashboard" element={<PermissionGuard permission="view_dashboard"><Dashboard /></PermissionGuard>} />
              <Route path="/orders" element={<PermissionGuard permission="view_orders"><OrdersManager /></PermissionGuard>} />
              <Route path="/orders/:orderId" element={<PermissionGuard permission="view_orders"><AdminOrderDetails /></PermissionGuard>} />
              <Route path="/production" element={<PermissionGuard permission="view_production"><Production /></PermissionGuard>} />
              <Route path="/branches" element={<PermissionGuard permission="view_branches"><BranchesManager /></PermissionGuard>} />
              <Route path="/expenses" element={<PermissionGuard permission="view_expenses"><ExpensesManager /></PermissionGuard>} />
              <Route path="/invoice" element={<PermissionGuard permission="view_invoice"><InvoiceGenerator /></PermissionGuard>} />
              <Route path="/customers" element={<PermissionGuard permission="view_customers"><CustomersManager /></PermissionGuard>} />
              <Route path="/products" element={<PermissionGuard permission="view_products"><ProductsManager /></PermissionGuard>} />
              <Route path="/contacts" element={<PermissionGuard permission="view_contacts"><EmployeeContactsManager /></PermissionGuard>} />
              <Route path="/history" element={<PermissionGuard permission="view_history"><InvoiceHistory /></PermissionGuard>} />
              <Route path="/inquiries" element={<PermissionGuard permission="view_inquiries"><ContactInquiries /></PermissionGuard>} />
              <Route path="/bulk-orders" element={<PermissionGuard permission="view_bulk_orders"><BulkOrdersManager /></PermissionGuard>} />
              <Route path="/newsletter" element={<PermissionGuard permission="view_newsletter"><NewsletterManager /></PermissionGuard>} />
              <Route path="/invoice-reset" element={<PermissionGuard permission="manage_invoice_reset"><InvoiceReset /></PermissionGuard>} />
              <Route path="/rbac" element={<PermissionGuard permission="manage_rbac"><RBACManagement /></PermissionGuard>} />
            </Routes>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Admin;
