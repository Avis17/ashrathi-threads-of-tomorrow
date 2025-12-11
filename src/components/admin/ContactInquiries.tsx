import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/useDebounce';
import { Search, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import noDataImg from '@/assets/no-data.png';

interface Inquiry {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: string;
  admin_notes: string | null;
}

const ITEMS_PER_PAGE = 6;

const ContactInquiries = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingNotes, setEditingNotes] = useState<{ [key: string]: string }>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: inquiries, isLoading } = useQuery({
    queryKey: ['contact-inquiries', debouncedSearch, statusFilter, currentPage],
    queryFn: async () => {
      let query = supabase
        .from('contact_inquiries')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (debouncedSearch) {
        query = query.or(`name.ilike.%${debouncedSearch}%,email.ilike.%${debouncedSearch}%,message.ilike.%${debouncedSearch}%`);
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error, count } = await query
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

      if (error) throw error;
      return { data, count };
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('contact_inquiries')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-inquiries'] });
      toast({ title: 'Status updated successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to update status', variant: 'destructive' });
    },
  });

  const saveNotesMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      const { error } = await supabase
        .from('contact_inquiries')
        .update({ admin_notes: notes })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-inquiries'] });
      toast({ title: 'Notes saved successfully' });
      setEditingNotes({});
    },
    onError: () => {
      toast({ title: 'Failed to save notes', variant: 'destructive' });
    },
  });

  const totalPages = inquiries?.count ? Math.ceil(inquiries.count / ITEMS_PER_PAGE) : 0;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Contact Inquiries</h2>
        <p className="text-muted-foreground">Manage customer inquiries and feedback</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or message..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={(value) => {
          setStatusFilter(value);
          setCurrentPage(1);
        }}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {inquiries?.data?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <img src={noDataImg} alt="No data found" className="w-48 h-36 object-contain opacity-50" />
          <div className="text-center">
            <p className="text-lg font-semibold text-muted-foreground">No inquiries found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your filters or search</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {inquiries?.data?.map((inquiry: Inquiry) => (
            <Card key={inquiry.id} className="animate-fade-in">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{inquiry.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{inquiry.email}</p>
                    {inquiry.phone && <p className="text-sm text-muted-foreground">{inquiry.phone}</p>}
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(inquiry.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Badge className={inquiry.status === 'new' ? 'bg-blue-500 text-white' : inquiry.status === 'completed' ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'}>
                      {inquiry.status}
                    </Badge>
                    <Select
                      value={inquiry.status}
                      onValueChange={(value) => updateStatusMutation.mutate({ id: inquiry.id, status: value })}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-semibold mb-2 text-sm">Message:</p>
                  <p className="text-sm">{inquiry.message}</p>
                </div>
                <div>
                  <p className="font-semibold mb-2 text-sm">Admin Notes:</p>
                  <Textarea
                    placeholder="Add notes..."
                    value={editingNotes[inquiry.id] ?? inquiry.admin_notes ?? ''}
                    onChange={(e) =>
                      setEditingNotes({ ...editingNotes, [inquiry.id]: e.target.value })
                    }
                    rows={3}
                  />
                  <Button
                    size="sm"
                    className="mt-2"
                    onClick={() => saveNotesMutation.mutate({ 
                      id: inquiry.id, 
                      notes: editingNotes[inquiry.id] ?? inquiry.admin_notes ?? '' 
                    })}
                    disabled={saveNotesMutation.isPending}
                  >
                    Save Notes
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => setCurrentPage(page)}
                  isActive={currentPage === page}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default ContactInquiries;
