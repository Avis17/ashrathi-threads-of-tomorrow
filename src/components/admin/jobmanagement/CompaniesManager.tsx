import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Phone, Mail, MapPin, Eye, Search, Factory, Users, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UnifiedCompany {
  id: string;
  name: string;
  contact_person: string;
  phone: string;
  email: string | null;
  address: string | null;
  is_active: boolean;
  source: 'external' | 'job_worker' | 'both';
}

const CompaniesManager = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSource, setActiveSource] = useState('all');
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [companyToSave, setCompanyToSave] = useState<string | null>(null);

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

  const saveAsJobWorker = useMutation({
    mutationFn: async (companyId: string) => {
      const company = externalCompanies.find((c) => c.id === companyId);
      if (!company) throw new Error('Company not found');
      const { error } = await supabase.from('job_workers').insert({
        name: company.company_name,
        contact_person: company.contact_person,
        phone: company.contact_number,
        email: company.email,
        address: company.address,
        gstin: company.gst_number,
        alternate_number: company.alternate_number,
        upi_id: company.upi_id,
        account_details: company.account_details,
        notes: company.notes,
        is_active: company.is_active ?? true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-job-workers'] });
      toast.success('Company saved as Job Worker successfully');
      setSaveDialogOpen(false);
      setCompanyToSave(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to save as Job Worker');
    },
  });

  const isLoading = loadingExternal || loadingWorkers;

  // Build a set of external company names that already exist as job workers (case-insensitive)
  const jobWorkerNames = new Set(jobWorkers.map((w) => w.name.toLowerCase().trim()));

  const unified: UnifiedCompany[] = [
    ...externalCompanies.map((c) => {
      const alreadyWorker = jobWorkerNames.has(c.company_name.toLowerCase().trim());
      return {
        id: c.id,
        name: c.company_name,
        contact_person: c.contact_person,
        phone: c.contact_number,
        email: c.email,
        address: c.address,
        is_active: c.is_active ?? true,
        source: alreadyWorker ? 'both' as const : 'external' as const,
      };
    }),
    // Only show job workers that are NOT already matched to an external company
    ...jobWorkers
      .filter((w) => !externalCompanies.some((c) => c.company_name.toLowerCase().trim() === w.name.toLowerCase().trim()))
      .map((w) => ({
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
    .filter((c) => {
      if (activeSource === 'all') return true;
      if (activeSource === 'external') return c.source === 'external' || c.source === 'both';
      if (activeSource === 'job_worker') return c.source === 'job_worker' || c.source === 'both';
      return true;
    })
    .filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.contact_person.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery)
    );

  const getSourceBadge = (source: 'external' | 'job_worker' | 'both') => {
    if (source === 'both') {
      return (
        <div className="flex gap-1">
          <Badge variant="outline" className="text-xs">Company</Badge>
          <Badge variant="outline" className="text-xs">Job Worker</Badge>
        </div>
      );
    }
    return (
      <Badge variant="outline" className="text-xs">
        {source === 'external' ? 'Company' : 'Job Worker'}
      </Badge>
    );
  };

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
                      <div className={`p-2 rounded-lg ${company.source === 'job_worker' ? 'bg-secondary/20' : 'bg-primary/10'}`}>
                        {company.source === 'job_worker' ? (
                          <Users className="h-4 w-4 text-secondary-foreground" />
                        ) : (
                          <Building2 className="h-4 w-4 text-primary" />
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
                  <TableCell>{getSourceBadge(company.source)}</TableCell>
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
                    <div className="flex items-center justify-end gap-2">
                      {company.source === 'external' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs gap-1"
                          onClick={() => {
                            setCompanyToSave(company.id);
                            setSaveDialogOpen(true);
                          }}
                        >
                          <UserPlus className="h-3.5 w-3.5" />
                          Save as Job Worker
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          navigate(`/admin/company-view/${company.source === 'job_worker' ? 'job_worker' : 'external'}/${company.id}`)
                        }
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <AlertDialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save as Job Worker</AlertDialogTitle>
            <AlertDialogDescription>
              This will create a new Job Worker entry with all the details from this company. The company will then appear as both "Company" and "Job Worker" in the list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => companyToSave && saveAsJobWorker.mutate(companyToSave)}
              disabled={saveAsJobWorker.isPending}
            >
              {saveAsJobWorker.isPending ? 'Saving...' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CompaniesManager;
