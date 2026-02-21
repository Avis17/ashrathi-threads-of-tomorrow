import { useState } from 'react';
import { Shirt, Edit, Eye, Trash2, Calculator } from 'lucide-react';
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
import { useDeleteJobStyle, useUpdateJobStyle } from '@/hooks/useJobStyles';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import CostingDialog, { CostingData, calculateTotalRate } from './CostingDialog';

interface StyleCardProps {
  style: JobStyle;
  onView: (style: JobStyle) => void;
  onEdit: (style: JobStyle) => void;
}

const StyleCard = ({ style, onView, onEdit }: StyleCardProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [costingOpen, setCostingOpen] = useState(false);
  const deleteMutation = useDeleteJobStyle();
  const updateStyle = useUpdateJobStyle();

  // Fetch linked CMT quotation rate if available
  const { data: linkedCmt } = useQuery({
    queryKey: ['cmt-for-card', style.linked_cmt_quotation_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cmt_quotations')
        .select('final_cmt_per_piece, approved_rates, status')
        .eq('id', style.linked_cmt_quotation_id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!style.linked_cmt_quotation_id,
  });

  // Get CMT rate
  let cmtRate = 0;
  if (linkedCmt) {
    const approvedRates = linkedCmt.approved_rates as any;
    if (linkedCmt.status === 'approved' && approvedRates?.finalCMTPerPiece) {
      cmtRate = approvedRates.finalCMTPerPiece;
    } else {
      cmtRate = Number(linkedCmt.final_cmt_per_piece) || 0;
    }
  }

  // Get costing data from process_rate_details
  const processRateDetails = style.process_rate_details as any;
  const costingData = processRateDetails?.costing as CostingData | null;

  // Calculate total rate from costing if available
  let totalRate = 0;
  let hasCosting = false;
  if (costingData && costingData.pieceWeightGrams > 0) {
    hasCosting = true;
    const calc = calculateTotalRate(costingData, cmtRate);
    totalRate = calc.total;
  }

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(style.id);
    setDeleteDialogOpen(false);
  };

  const handleSaveCosting = (data: CostingData) => {
    const existing = (style.process_rate_details as any) || {};
    updateStyle.mutate({
      id: style.id,
      data: {
        process_rate_details: { ...existing, costing: data } as any,
      },
    });
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

      <CostingDialog
        open={costingOpen}
        onOpenChange={setCostingOpen}
        initialData={costingData}
        cmtRate={cmtRate}
        onSave={handleSaveCosting}
      />

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
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">Total Rate:</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  setCostingOpen(true);
                }}
                title="Edit costing"
              >
                <Calculator className="h-3.5 w-3.5" />
              </Button>
            </div>
            <span className="font-bold text-lg text-primary">
              {hasCosting ? `₹${totalRate.toFixed(2)}/pc` : '—'}
            </span>
          </div>
          {hasCosting && cmtRate > 0 && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Fabric: ₹{calculateTotalRate(costingData!, cmtRate).fabricCost.toFixed(2)} + CMT: ₹{cmtRate.toFixed(2)}
              {costingData!.additionalOpsAmount > 0 && ` + Ops: ₹${costingData!.additionalOpsAmount.toFixed(2)}`}
            </p>
          )}
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
