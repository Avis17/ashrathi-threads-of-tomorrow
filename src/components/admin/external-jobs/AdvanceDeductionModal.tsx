import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useOpenAdvancesByOperation, SalaryAdvanceEntry } from "@/hooks/useSalaryAdvances";
import { Loader2, AlertCircle } from "lucide-react";

interface AdvanceDeductionModalProps {
  isOpen: boolean;
  onClose: () => void;
  operation: string;
  onSelect: (advances: SalaryAdvanceEntry[]) => void;
  selectedAdvances: SalaryAdvanceEntry[];
}

export const AdvanceDeductionModal = ({
  isOpen,
  onClose,
  operation,
  onSelect,
  selectedAdvances,
}: AdvanceDeductionModalProps) => {
  const { data: advances, isLoading } = useOpenAdvancesByOperation(operation);
  const [selected, setSelected] = useState<string[]>(
    selectedAdvances.map(a => a.id)
  );
  
  useEffect(() => {
    setSelected(selectedAdvances.map(a => a.id));
  }, [selectedAdvances]);
  
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  const handleToggle = (advanceId: string) => {
    setSelected(prev => 
      prev.includes(advanceId)
        ? prev.filter(id => id !== advanceId)
        : [...prev, advanceId]
    );
  };
  
  const handleConfirm = () => {
    const selectedAdvanceObjects = advances?.filter(a => selected.includes(a.id)) || [];
    onSelect(selectedAdvanceObjects);
    onClose();
  };
  
  const totalSelected = advances
    ?.filter(a => selected.includes(a.id))
    .reduce((sum, a) => sum + a.amount, 0) || 0;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Deduct Advance Payments</DialogTitle>
          <DialogDescription>
            Select the advance payments to deduct from this salary entry for <strong>{operation}</strong>
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !advances || advances.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <AlertCircle className="h-12 w-12 mb-2" />
            <p>No open advances found for this operation</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="border rounded-lg divide-y">
              {advances.map((advance) => (
                <div
                  key={advance.id}
                  className={`p-4 flex items-start gap-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                    selected.includes(advance.id) ? 'bg-primary/5' : ''
                  }`}
                  onClick={() => handleToggle(advance.id)}
                >
                  <Checkbox
                    checked={selected.includes(advance.id)}
                    onCheckedChange={() => handleToggle(advance.id)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{advance.employee?.name || 'Unknown'}</span>
                        {advance.employee?.employee_code && (
                          <span className="text-sm text-muted-foreground">
                            ({advance.employee.employee_code})
                          </span>
                        )}
                      </div>
                      <span className="font-bold text-amber-600">
                        {formatAmount(advance.amount)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span>{format(new Date(advance.advance_date), 'dd MMM yyyy, hh:mm a')}</span>
                      <Badge variant="outline" className="text-xs">Open</Badge>
                    </div>
                    {advance.notes && (
                      <p className="text-sm text-muted-foreground mt-1 truncate">
                        {advance.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Summary */}
            {selected.length > 0 && (
              <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      {selected.length} advance{selected.length > 1 ? 's' : ''} selected
                    </p>
                  </div>
                  <p className="text-xl font-bold text-amber-800 dark:text-amber-200">
                    -{formatAmount(totalSelected)}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            Confirm Selection ({selected.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
