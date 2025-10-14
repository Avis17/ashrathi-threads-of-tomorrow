import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface Subscriber {
  id: string;
  email: string;
  subscribed_at: string;
  is_active: boolean;
}

const NewsletterManager = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .order('subscribed_at', { ascending: false });

    if (error) {
      toast.error('Failed to load subscribers');
    } else {
      setSubscribers(data || []);
    }
    setLoading(false);
  };

  const exportToCSV = () => {
    const csv = [
      ['Email', 'Subscribed At', 'Status'],
      ...subscribers.map((sub) => [
        sub.email,
        new Date(sub.subscribed_at).toLocaleString(),
        sub.is_active ? 'Active' : 'Inactive',
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Exported successfully');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const activeCount = subscribers.filter((s) => s.is_active).length;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Newsletter Subscribers</h2>
          <p className="text-sm text-muted-foreground">
            {activeCount} active out of {subscribers.length} total
          </p>
        </div>
        <Button onClick={exportToCSV}>Export to CSV</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subscribers.map((subscriber) => (
          <Card key={subscriber.id}>
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between items-start">
                <p className="font-medium break-all">{subscriber.email}</p>
                <Badge variant={subscriber.is_active ? 'default' : 'secondary'}>
                  {subscriber.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Subscribed: {new Date(subscriber.subscribed_at).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default NewsletterManager;
