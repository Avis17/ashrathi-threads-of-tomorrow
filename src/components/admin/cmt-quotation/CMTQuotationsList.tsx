import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Edit2, Trash2, Plus, FileText, Download, Search, Eye, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Badge } from '@/components/ui/badge';
import { useCMTQuotations, useDeleteCMTQuotation, CMTQuotationRecord, recordToQuotationData } from '@/hooks/useCMTQuotations';
import { generateCMTPdf } from '@/lib/cmtPdfGenerator';
import { toast } from 'sonner';

interface CMTQuotationsListProps {
  onEdit: (record: CMTQuotationRecord) => void;
  onCreateNew: () => void;
  onClone: (record: CMTQuotationRecord) => void;
}

export function CMTQuotationsList({ onEdit, onCreateNew, onClone }: CMTQuotationsListProps) {
  const navigate = useNavigate();
  const { data: quotations, isLoading } = useCMTQuotations();
  const deleteQuotation = useDeleteCMTQuotation();
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredQuotations = quotations?.filter((q) => {
    const query = searchQuery.toLowerCase();
    return (
      q.quotation_no.toLowerCase().includes(query) ||
      q.buyer_name.toLowerCase().includes(query) ||
      q.style_name.toLowerCase().includes(query)
    );
  });

  const handleDownloadPdf = async (record: CMTQuotationRecord) => {
    try {
      toast.info('Generating PDF...');
      const data = recordToQuotationData(record);
      await generateCMTPdf(data);
      toast.success('PDF downloaded!');
    } catch (error) {
      toast.error('Failed to generate PDF');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      draft: 'secondary',
      sent: 'default',
      in_progress: 'outline',
      approved: 'default',
      accepted: 'default',
      rejected: 'destructive',
    };
    const colors: Record<string, string> = {
      approved: 'bg-green-500 text-white hover:bg-green-600',
      in_progress: 'bg-yellow-500 text-white hover:bg-yellow-600',
    };
    return (
      <Badge 
        variant={variants[status] || 'outline'} 
        className={colors[status] || ''}
      >
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading quotations...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold">CMT Quotations</h1>
        </div>
        <Button onClick={onCreateNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Create New
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by quotation no, buyer, style..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredQuotations?.length || 0} quotation(s)
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Quotation No</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Buyer</TableHead>
              <TableHead>Style</TableHead>
              <TableHead>Code</TableHead>
              <TableHead className="text-right">Final CMT</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-32">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!filteredQuotations?.length ? (
              <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No quotations found. Create your first quotation!
                </TableCell>
              </TableRow>
            ) : (
              filteredQuotations.map((q) => (
                <TableRow key={q.id}>
                   <TableCell className="font-medium">{q.quotation_no}</TableCell>
                   <TableCell>{format(new Date(q.date), 'dd MMM yyyy')}</TableCell>
                   <TableCell>{q.buyer_name}</TableCell>
                   <TableCell>{q.style_name}</TableCell>
                   <TableCell className="text-muted-foreground">{q.style_code || '—'}</TableCell>
                   <TableCell className="text-right font-semibold">
                    ₹{Number(q.final_cmt_per_piece).toFixed(2)}
                  </TableCell>
                  <TableCell>{getStatusBadge(q.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => navigate(`/admin/cmt-quotation/view/${q.id}`)}
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onEdit(q)}
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onClone(q)}
                        title="Clone as new"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDownloadPdf(q)}
                        title="Download PDF"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(q.id)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Quotation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this quotation? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteId) {
                  deleteQuotation.mutate(deleteId);
                  setDeleteId(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
