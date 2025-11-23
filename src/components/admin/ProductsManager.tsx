import { ViewEditProducts } from './products/ViewEditProducts';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProductsManager() {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Product Management</h2>
          <p className="text-muted-foreground">View and manage your products</p>
        </div>
        <Button onClick={() => navigate('/admin/products/add')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      <ViewEditProducts />
    </div>
  );
}
