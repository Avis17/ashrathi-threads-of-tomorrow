import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import MarketIntelHome from './MarketIntelHome';
import NewVisitForm from './NewVisitForm';
import ShopsList from './ShopsList';
import VisitsList from './VisitsList';

export default function MarketIntelApp() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-500 mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
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
