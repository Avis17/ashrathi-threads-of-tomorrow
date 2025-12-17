import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAppAccess } from '@/hooks/useAppAccess';
import MarketIntelHome from './MarketIntelHome';
import NewVisitForm from './NewVisitForm';
import ShopsList from './ShopsList';
import VisitsList from './VisitsList';
import { ShieldX, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

function AccessDenied() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="h-20 w-20 mx-auto rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg shadow-red-500/30 mb-6">
          <ShieldX className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
        <p className="text-slate-600 mb-6">
          You don't have permission to access this application. Please contact an administrator to request access.
        </p>
        <Button 
          variant="outline" 
          onClick={() => window.close()}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Close Tab
        </Button>
      </div>
    </div>
  );
}

export default function MarketIntelApp() {
  const { user, loading: authLoading } = useAuth();
  const { hasAccess, accessLoading } = useAppAccess('market_intel');

  if (authLoading || accessLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-500 mt-3 font-medium">Loading...</p>
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
      <Route path="/" element={<MarketIntelHome />} />
      <Route path="/new-visit" element={<NewVisitForm />} />
      <Route path="/shops" element={<ShopsList />} />
      <Route path="/visits" element={<VisitsList />} />
    </Routes>
  );
}
