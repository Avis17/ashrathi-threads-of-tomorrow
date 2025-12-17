import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAppAccess } from '@/hooks/useAppAccess';
import MarketIntelHome from './MarketIntelHome';
import NewVisitForm from './NewVisitForm';
import ShopsList from './ShopsList';
import VisitsList from './VisitsList';
import VisitDetails from './VisitDetails';
import MarketIntelDashboard from './MarketIntelDashboard';
import { ShieldX, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

function AccessDenied() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-md text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center">
          <ShieldX className="w-10 h-10 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">Access Denied</h1>
        <p className="text-slate-300 mb-8">
          You don't have permission to access the Market Intel app. Please contact your administrator to request access.
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

export default function MarketIntelApp() {
  const { user, loading: authLoading } = useAuth();
  const { hasAccess, accessLoading } = useAppAccess('market_intel');

  if (authLoading || accessLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl mx-auto mb-4 animate-pulse" />
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
      <Route path="/" element={<MarketIntelHome />} />
      <Route path="/new-visit" element={<NewVisitForm />} />
      <Route path="/shops" element={<ShopsList />} />
      <Route path="/visits" element={<VisitsList />} />
      <Route path="/visits/:id" element={<VisitDetails />} />
      <Route path="/dashboard" element={<MarketIntelDashboard />} />
    </Routes>
  );
}
