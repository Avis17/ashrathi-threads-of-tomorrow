import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Phone, Mail, MapPin, Eye, Search, Factory, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface UnifiedCompany {
  id: string;
  name: string;
  contact_person: string;
  phone: string;
  email: string | null;
  address: string | null;
  is_active: boolean;
  source: 'external' | 'job_worker';
}

const CompaniesManager = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSource, setActiveSource] = useState('all');

  const { data: externalCompanies = [], isLoading: loadingExternal } = useQuery({
    queryKey: ['all-external-job-companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('external_job_companies')
        .select('*')
        .order('company_name');
      if (error) throw error;
      return data;
    },
  });

  const { data: jobWorkers = [], isLoading: loadingWorkers } = useQuery({
    queryKey: ['all-job-workers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_workers')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const isLoading = loadingExternal || loadingWorkers;

  const unified: UnifiedCompany[] = [
    ...externalCompanies.map((c) => ({
      id: c.id,
      name: c.company_name,
      contact_person: c.contact_person,
      phone: c.contact_number,
      email: c.email,
      address: c.address,
      is_active: c.is_active ?? true,
      source: 'external' as const,
    })),
    ...jobWorkers.map((w) => ({
      id: w.id,
      name: w.name,
      contact_person: w.contact_person || '-',
      phone: w.phone || '-',
      email: w.email,
      address: w.address,
      is_active: w.is_active ?? true,
      source: 'job_worker' as const,
    })),
  ];

  const filtered = unified
    .filter((c) => activeSource === 'all' || c.source === activeSource)
    .filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.contact_person.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery)
    );

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {externalCompanies.length} companies · {jobWorkers.length} job workers
        </p>
        <Button onClick={() => navigate('/admin/external-jobs/register-company')} size="sm" className="gap-2">
          <Building2 className="h-4 w-4" />
          Register New
        </Button>
      </div>

      <Card className="p-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search companies or job workers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Tabs value={activeSource} onValueChange={setActiveSource}>
            <TabsList className="h-9">
              <TabsTrigger value="all" className="text-xs px-3">All ({unified.length})</TabsTrigger>
              <TabsTrigger value="external" className="text-xs px-3">Companies ({externalCompanies.length})</TabsTrigger>
              <TabsTrigger value="job_worker" className="text-xs px-3">Job Workers ({jobWorkers.length})</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Contact Person</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {searchQuery ? 'No results match your search' : 'No companies or job workers registered yet'}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((company) => (
                <TableRow key={`${company.source}-${company.id}`}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${company.source === 'external' ? 'bg-primary/10' : 'bg-secondary/20'}`}>
                        {company.source === 'external' ? (
                          <Building2 className="h-4 w-4 text-primary" />
                        ) : (
                          <Users className="h-4 w-4 text-secondary-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{company.name}</p>
                        {company.address && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {company.address.slice(0, 40)}{company.address.length > 40 ? '...' : ''}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {company.source === 'external' ? 'Company' : 'Job Worker'}
                    </Badge>
                  </TableCell>
                  <TableCell>{company.contact_person}</TableCell>
                  <TableCell>
                    {company.phone !== '-' ? (
                      <span className="flex items-center gap-1 text-sm">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        {company.phone}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {company.email ? (
                      <span className="flex items-center gap-1 text-sm">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        {company.email}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={company.is_active ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}>
                      {company.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        navigate(`/admin/company-view/${company.source === 'external' ? 'external' : 'job_worker'}/${company.id}`)
                      }
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default CompaniesManager;
