// Admin Dashboard Router
import { useEffect, lazy, Suspense } from 'react';
import { useNavigate, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import ProductsManager from '@/components/admin/ProductsManager';
import NewsletterManager from '@/components/admin/NewsletterManager';
import CustomersManager from '@/components/admin/CustomersManager';
import CustomerDetails from './admin/CustomerDetails';
import { OrdersManager } from '@/components/admin/OrdersManager';
import { EmployeeContactsManager } from '@/components/admin/EmployeeContactsManager';
import BranchesManager from '@/components/admin/BranchesManager';
import ExpensesManager from '@/components/admin/ExpensesManager';
import InvoiceGenerator from './admin/InvoiceGenerator';
import InvoiceHistory from './admin/InvoiceHistory';
import InvoiceDetails from './admin/InvoiceDetails';
import InvoiceEdit from './admin/InvoiceEdit';
import InvoiceReset from './admin/InvoiceReset';
import Dashboard from './admin/Dashboard';
import AdminOrderDetails from './admin/OrderDetails';
import Production from './admin/Production';
import JobOrders from './admin/JobOrders';
import JobManagement from './admin/JobManagement';
import EmployeeDetailsPage from './admin/EmployeeDetailsPage';
import Settings from './admin/Settings';
import AddProduct from './admin/AddProduct';
import ExternalJobOrders from './admin/external-jobs/ExternalJobOrders';
import RegisterCompany from './admin/external-jobs/RegisterCompany';
import AddJob from './admin/external-jobs/AddJob';
import JobDetails from './admin/external-jobs/JobDetails';
import ExternalJobDashboard from './admin/external-jobs/Dashboard';
import CompanyDetails from './admin/external-jobs/CompanyDetails';
import CompanyEdit from './admin/external-jobs/CompanyEdit';
import GenerateInvoice from './admin/external-jobs/GenerateInvoice';
import RateCards from './admin/external-jobs/RateCards';
import AddRateCard from './admin/external-jobs/AddRateCard';
import RateCardsDashboard from './admin/external-jobs/RateCardsDashboard';
import CompanyLetterhead from './admin/CompanyLetterhead';
import CompaniesList from './admin/external-jobs/CompaniesList';
import GenericJobExpenses from './admin/external-jobs/GenericJobExpenses';
import ExternalJobSalaries from './admin/external-jobs/ExternalJobSalaries';
import AddSalaryEntry from './admin/external-jobs/AddSalaryEntry';
import ExternalJobInvoiceHistory from './admin/external-jobs/ExternalJobInvoiceHistory';
import LabelGenerator from './admin/LabelGenerator';
import FeatherApps from './admin/FeatherApps';
import AppAccessManagement from './admin/AppAccessManagement';
import ActivityLogs from './admin/ActivityLogs';
import BuyerFollowups from './admin/BuyerFollowups';
import ExportBuyerContacts from './admin/ExportBuyerContacts';
import Enquiries from './admin/Enquiries';
import DeliveryChallanList from './admin/delivery-challan/DeliveryChallanList';
import CreateDeliveryChallan from './admin/delivery-challan/CreateDeliveryChallan';
import DeliveryChallanView from './admin/delivery-challan/DeliveryChallanView';
import PrintDeliveryChallan from './admin/delivery-challan/PrintDeliveryChallan';
import SamplingPreparation from './admin/SamplingPreparation';
import SamplingTermsGenerator from './admin/SamplingTermsGenerator';
import QuotationGenerator from './admin/QuotationGenerator';
import ExportersList from './admin/ExportersList';
const CompanyProfile = lazy(() => import('./admin/CompanyProfile'));

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
              <Route path="/customers/:id" element={<CustomerDetails />} />
              <Route path="/products" element={<ProductsManager />} />
              <Route path="/products/add" element={<AddProduct />} />
              <Route path="/contacts" element={<EmployeeContactsManager />} />
              <Route path="/history" element={<InvoiceHistory />} />
              <Route path="/invoices/:id" element={<InvoiceDetails />} />
              <Route path="/invoices/edit/:id" element={<InvoiceEdit />} />
              <Route path="/enquiries" element={<Enquiries />} />
              <Route path="/newsletter" element={<NewsletterManager />} />
              <Route path="/invoice-reset" element={<InvoiceReset />} />
              <Route path="/letterhead" element={<CompanyLetterhead />} />
              <Route path="/company-profile" element={<Suspense fallback={<div className="p-6">Loading...</div>}><CompanyProfile /></Suspense>} />
              <Route path="/label-generator" element={<LabelGenerator />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/apps" element={<FeatherApps />} />
              <Route path="/app-access" element={<AppAccessManagement />} />
              <Route path="/buyer-followups" element={<BuyerFollowups />} />
              <Route path="/export-buyers" element={<ExportBuyerContacts />} />
              <Route path="/exporters" element={<ExportersList />} />
              <Route path="/activity-logs" element={<ActivityLogs />} />
              <Route path="/activity-logs" element={<ActivityLogs />} />
              <Route path="/sampling" element={<SamplingPreparation />} />
              <Route path="/sampling-terms" element={<SamplingTermsGenerator />} />
              <Route path="/quotation" element={<QuotationGenerator />} />
              <Route path="/external-jobs" element={<ExternalJobOrders />} />
              <Route path="/external-jobs/register-company" element={<RegisterCompany />} />
              <Route path="/external-jobs/add-job" element={<AddJob />} />
              <Route path="/external-jobs/details/:id" element={<JobDetails />} />
              <Route path="/external-jobs/dashboard" element={<ExternalJobDashboard />} />
              <Route path="/external-jobs/company/:id" element={<CompanyDetails />} />
              <Route path="/external-jobs/company/edit/:id" element={<CompanyEdit />} />
              <Route path="/external-jobs/invoice/:id" element={<GenerateInvoice />} />
              <Route path="/external-jobs/rate-cards" element={<RateCards />} />
              <Route path="/external-jobs/rate-cards-dashboard" element={<RateCardsDashboard />} />
              <Route path="/external-jobs/add-rate-card" element={<AddRateCard />} />
              <Route path="/external-jobs/edit-rate-card/:id" element={<AddRateCard />} />
              <Route path="/external-jobs/companies" element={<CompaniesList />} />
              <Route path="/external-jobs/generic-expenses" element={<GenericJobExpenses />} />
              <Route path="/external-jobs/salaries" element={<ExternalJobSalaries />} />
              <Route path="/external-jobs/salaries/add" element={<AddSalaryEntry />} />
              <Route path="/external-jobs/invoices" element={<ExternalJobInvoiceHistory />} />
              <Route path="/delivery-challan" element={<DeliveryChallanList />} />
              <Route path="/delivery-challan/create" element={<CreateDeliveryChallan />} />
              <Route path="/delivery-challan/:id" element={<DeliveryChallanView />} />
              <Route path="/delivery-challan/edit/:id" element={<CreateDeliveryChallan />} />
              <Route path="/delivery-challan/print/:id" element={<PrintDeliveryChallan />} />
            </Routes>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Admin;
