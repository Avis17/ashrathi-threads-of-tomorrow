import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';

export default function SeedProducts() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [progress, setProgress] = useState<string>('');

  const handleSeedProducts = async () => {
    setIsSeeding(true);
    setProgress('Starting product generation...');

    try {
      const { data, error } = await supabase.functions.invoke('seed-products', {
        method: 'POST'
      });

      if (error) throw error;

      setProgress('Products created successfully!');
      toast.success(`Created ${data.products?.length || 0} products with AI-generated images`);
    } catch (error) {
      console.error('Error seeding products:', error);
      toast.error('Failed to create products. Please try again.');
      setProgress('Error occurred');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <div className="container mx-auto p-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Generate Sample Products</CardTitle>
            <CardDescription>
              This will create sample products with AI-generated images including:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Ladies Tops (4 varieties with multiple colors)</li>
                <li>Gents T-Shirts (3 varieties with 7-8 colors each)</li>
                <li>Kids Sets (3 varieties with 3-4 colors each)</li>
              </ul>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleSeedProducts} 
              disabled={isSeeding}
              className="w-full"
              size="lg"
            >
              {isSeeding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Products...
                </>
              ) : (
                'Generate Products'
              )}
            </Button>
            
            {progress && (
              <div className="p-4 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground">{progress}</p>
              </div>
            )}

            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-2">Note:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>This process takes 2-3 minutes to complete</li>
                <li>AI will generate unique product images for each item</li>
                <li>Inventory will be automatically created for all size-color combinations</li>
                <li>Each product will have 100 units in stock initially</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
