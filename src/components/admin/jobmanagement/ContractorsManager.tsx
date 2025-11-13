import { useState } from 'react';
import { useJobContractors } from '@/hooks/useJobContractors';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Mail, Phone, MapPin, Edit, Building2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import ContractorForm from './ContractorForm';

const ContractorsManager = () => {
  const { data: contractors, isLoading } = useJobContractors();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingContractor, setEditingContractor] = useState<any>(null);

  const filteredContractors = contractors?.filter(c => 
    c.contractor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.contractor_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (contractor: any) => {
    setEditingContractor(contractor);
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setEditingContractor(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Contractors</h2>
          <p className="text-muted-foreground">Manage contractor information</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Contractor
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, code, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Contractors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-8 w-3/4 mb-4" />
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </Card>
          ))
        ) : filteredContractors?.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No contractors found</p>
          </div>
        ) : (
          filteredContractors?.map((contractor) => (
            <Card key={contractor.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{contractor.contractor_name}</h3>
                  <p className="text-sm text-muted-foreground">{contractor.contractor_code}</p>
                </div>
                <Badge variant={contractor.is_active ? "default" : "secondary"}>
                  {contractor.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              <div className="space-y-2 text-sm">
                {contractor.contact_person && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="font-medium">Contact:</span>
                    {contractor.contact_person}
                  </div>
                )}
                {contractor.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    {contractor.phone}
                  </div>
                )}
                {contractor.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    {contractor.email}
                  </div>
                )}
                {contractor.address && (
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{contractor.address}</span>
                  </div>
                )}
                {contractor.payment_terms && (
                  <div className="pt-2 border-t">
                    <span className="font-medium">Payment Terms:</span>
                    <p className="text-muted-foreground">{contractor.payment_terms}</p>
                  </div>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(contractor)}
                className="w-full mt-4 gap-2"
              >
                <Edit className="h-3 w-3" />
                Edit
              </Button>
            </Card>
          ))
        )}
      </div>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingContractor ? 'Edit Contractor' : 'Add Contractor'}
            </DialogTitle>
          </DialogHeader>
          <ContractorForm
            contractor={editingContractor}
            onSuccess={() => handleClose()}
            onCancel={handleClose}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContractorsManager;