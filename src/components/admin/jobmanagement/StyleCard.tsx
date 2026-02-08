import { Shirt, Edit, Eye, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { JobStyle } from '@/hooks/useJobStyles';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';
import { useDeleteJobStyle } from '@/hooks/useJobStyles';

interface StyleCardProps {
  style: JobStyle;
  onView: (style: JobStyle) => void;
  onEdit: (style: JobStyle) => void;
}

const StyleCard = ({ style, onView, onEdit }: StyleCardProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const deleteMutation = useDeleteJobStyle();

  // Calculate total operations rate (excluding company profit, accessories, transportation)
  const processRateDetails = style.process_rate_details as any;
  const operations = processRateDetails?.operations || [];
  const hasNewOperations = operations.length > 0;
  
  let totalRate: number;
  if (hasNewOperations) {
    // Sum only operations (exclude accessories, transportation, company profit)
    totalRate = operations.reduce((sum: number, op: any) => sum + (op.rate || 0), 0);
  } else {
    // Legacy: sum all process rates
    totalRate = 
      style.rate_cutting +
      style.rate_stitching_singer +
      style.rate_stitching_power_table +
      style.rate_ironing +
      style.rate_checking +
      style.rate_packing;
  }

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(style.id);
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Style?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-semibold">{style.style_name}</span> ({style.style_code})? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    <Card className="hover:shadow-2xl hover:scale-105 transition-all duration-300 border-l-4 border-l-primary overflow-hidden group">
      <div className="relative h-48 bg-gradient-to-br from-primary/10 to-secondary/10 overflow-hidden">
        {style.style_image_url ? (
          <img 
            src={style.style_image_url} 
            alt={style.style_name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Shirt className="h-24 w-24 text-muted-foreground/30" />
          </div>
        )}
        <div className="absolute top-2 right-2 flex gap-2">
          {style.garment_type && (
            <Badge className="bg-primary/90 backdrop-blur-sm">
              {style.garment_type}
            </Badge>
          )}
        </div>
      </div>
      
      <CardContent className="p-4 space-y-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-lg text-foreground line-clamp-1">
              {style.style_name}
            </h3>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-mono bg-muted px-2 py-0.5 rounded">
              {style.style_code}
            </span>
            <span>•</span>
            <span>Pattern: {style.pattern_number}</span>
          </div>
        </div>

        {style.category && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {style.category}
            </Badge>
            {style.season && (
              <Badge variant="outline" className="text-xs">
                {style.season}
              </Badge>
            )}
          </div>
        )}

        <div className="pt-2 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Rate:</span>
            <span className="font-bold text-lg text-primary">
              ₹{totalRate.toFixed(2)}/pc
            </span>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onView(style);
            }}
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          <Button 
            size="sm" 
            className="flex-1 bg-gradient-to-r from-primary to-secondary"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(style);
            }}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button 
            size="sm" 
            variant="destructive"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteDialogOpen(true);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
    </>
  );
};

export default StyleCard;
