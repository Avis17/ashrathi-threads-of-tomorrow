import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

const ContactInquiries = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingNotes, setEditingNotes] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    const { data, error } = await supabase
      .from('contact_inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load inquiries');
    } else {
      setInquiries(data || []);
    }
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('contact_inquiries')
      .update({ status })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update status');
    } else {
      toast.success('Status updated');
      fetchInquiries();
    }
  };

  const saveNotes = async (id: string) => {
    const { error } = await supabase
      .from('contact_inquiries')
      .update({ admin_notes: editingNotes[id] })
      .eq('id', id);

    if (error) {
      toast.error('Failed to save notes');
    } else {
      toast.success('Notes saved');
      fetchInquiries();
      setEditingNotes({ ...editingNotes, [id]: '' });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Contact Inquiries ({inquiries.length})</h2>
      {inquiries.map((inquiry) => (
        <Card key={inquiry.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{inquiry.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{inquiry.email}</p>
                {inquiry.phone && <p className="text-sm text-muted-foreground">{inquiry.phone}</p>}
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(inquiry.created_at).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant={inquiry.status === 'new' ? 'default' : 'secondary'}>
                  {inquiry.status}
                </Badge>
                <Select
                  value={inquiry.status}
                  onValueChange={(value) => updateStatus(inquiry.id, value)}
                >
                  <SelectTrigger className="w-40">
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
              <p className="font-semibold mb-2">Message:</p>
              <p className="text-sm">{inquiry.message}</p>
            </div>
            <div>
              <p className="font-semibold mb-2">Admin Notes:</p>
              <Textarea
                placeholder="Add notes..."
                value={editingNotes[inquiry.id] ?? inquiry.admin_notes ?? ''}
                onChange={(e) =>
                  setEditingNotes({ ...editingNotes, [inquiry.id]: e.target.value })
                }
              />
              <Button
                size="sm"
                className="mt-2"
                onClick={() => saveNotes(inquiry.id)}
              >
                Save Notes
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ContactInquiries;
