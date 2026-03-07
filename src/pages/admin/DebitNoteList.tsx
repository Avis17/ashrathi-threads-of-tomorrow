import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Plus, Download, Edit, Trash2, Search, FileMinus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/invoiceUtils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { generateDebitNotePDF } from '@/lib/debitNoteUtils';

export default function DebitNoteList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: debitNotes = [], isLoading } = useQuery({
    queryKey: ['debit-notes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('debit_notes')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('debit_notes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debit-notes'] });
      toast({ title: 'Deleted', description: 'Debit note deleted successfully.' });
      setDeleteId(null);
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to delete debit note.', variant: 'destructive' });
    },
  });

  const handleDownload = async (id: string) => {
    try {
      const { data: note, error: noteError } = await supabase
        .from('debit_notes')
        .select('*')
        .eq('id', id)
        .single();
      if (noteError) throw noteError;

      const { data: items, error: itemsError } = await supabase
        .from('debit_note_items')
        .select('*')
        .eq('debit_note_id', id)
        .order('sort_order');
      if (itemsError) throw itemsError;

      await generateDebitNotePDF(note, items, 'download');
      toast({ title: 'Downloaded', description: 'Debit note PDF saved.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to download PDF.', variant: 'destructive' });
    }
  };

  const filtered = debitNotes.filter(
    (n) =>
      n.debit_note_no?.toLowerCase().includes(search.toLowerCase()) ||
      n.party_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Debit Notes</h1>
        <Button onClick={() => navigate('/admin/debit-note/create')}>
          <Plus className="h-4 w-4 mr-2" />New Debit Note
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <CardTitle className="text-lg">All Debit Notes</CardTitle>
            <div className="relative ml-auto w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by number or party..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground text-center py-8">Loading...</p>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileMinus className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p>No debit notes found.</p>
              <Button variant="link" onClick={() => navigate('/admin/debit-note/create')}>
                Create your first debit note
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Debit Note No.</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Party Name</TableHead>
                  <TableHead>Orig. Invoice</TableHead>
                  <TableHead className="text-right">Total Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((note) => (
                  <TableRow key={note.id}>
                    <TableCell className="font-medium">{note.debit_note_no}</TableCell>
                    <TableCell>{format(new Date(note.debit_note_date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>{note.party_name}</TableCell>
                    <TableCell>{note.original_invoice_no || '-'}</TableCell>
                    <TableCell className="text-right">{formatCurrency(Number(note.total_amount))}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => handleDownload(note.id)} title="Download PDF">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => navigate(`/admin/debit-note/edit/${note.id}`)} title="Edit">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => setDeleteId(note.id)} title="Delete">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Debit Note?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && deleteMutation.mutate(deleteId)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
