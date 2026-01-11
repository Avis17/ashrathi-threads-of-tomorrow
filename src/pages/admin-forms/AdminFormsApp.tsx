import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAppAccess } from '@/hooks/useAppAccess';
import AdminFormsHome from './AdminFormsHome';
import AddJobForm from './forms/AddJobForm';
import AddCompanyForm from './forms/AddCompanyForm';
import AddExpenseForm from './forms/AddExpenseForm';
import AddCustomerForm from './forms/AddCustomerForm';
import AddProductForm from './forms/AddProductForm';
import { ShieldX, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

function AccessDenied() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-teal-900 flex items-center justify-center p-4">
      <div className="max-w-md text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center">
          <ShieldX className="w-10 h-10 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">Access Denied</h1>
        <p className="text-slate-300 mb-8">
          You don't have permission to access the Admin Forms app. Please contact your administrator to request access.
        </p>
        <Button 
          variant="default" 
          className="bg-white text-slate-900 hover:bg-slate-100"
          onClick={() => window.location.href = '/'}
        >
          <Home className="w-4 h-4 mr-2" />
          Go to Home
        </Button>
      </div>
    </div>
  );
}

export default function AdminFormsApp() {
  const { user, loading: authLoading } = useAuth();
  const { hasAccess, accessLoading } = useAppAccess('admin_forms');

  if (authLoading || accessLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-teal-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl mx-auto mb-4 animate-pulse" />
          <p className="text-white/70">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!hasAccess) {
    return <AccessDenied />;
  }

  return (
    <Routes>
      <Route path="/" element={<AdminFormsHome />} />
      <Route path="/add-job" element={<AddJobForm />} />
      <Route path="/add-company" element={<AddCompanyForm />} />
      <Route path="/add-expense" element={<AddExpenseForm />} />
      <Route path="/add-customer" element={<AddCustomerForm />} />
      <Route path="/add-product" element={<AddProductForm />} />
    </Routes>
  );
}
