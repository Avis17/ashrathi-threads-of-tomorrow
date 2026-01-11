import { useState, useMemo } from 'react';
import { 
  Globe, Plus, Pencil, Trash2, Search, Filter, 
  Phone, Mail, MapPin, MessageCircle, User
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { 
  useExportBuyerContacts, 
  useCreateBuyerContact, 
  useUpdateBuyerContact, 
  useDeleteBuyerContact,
  EXPORT_COUNTRIES,
  ExportBuyerContact,
  CreateBuyerContactData
} from '@/hooks/useExportBuyerContacts';

const ITEMS_PER_PAGE = 10;

export default function ExportBuyerContacts() {
  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<ExportBuyerContact | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<CreateBuyerContactData>({
    buyer_name: '',
    email: '',
    phone: '',
    country: '',
    state: '',
    notes: '',
    is_active: true,
  });

  // Hooks
  const { data: contacts = [], isLoading } = useExportBuyerContacts({
    country: countryFilter,
    searchTerm,
  });
  const createMutation = useCreateBuyerContact();
  const updateMutation = useUpdateBuyerContact();
  const deleteMutation = useDeleteBuyerContact();

  // Pagination
  const totalPages = Math.ceil(contacts.length / ITEMS_PER_PAGE);
  const paginatedContacts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return contacts.slice(start, start + ITEMS_PER_PAGE);
  }, [contacts, currentPage]);

  // Reset to page 1 when filters change
  const handleFilterChange = (value: string) => {
    setCountryFilter(value);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // WhatsApp link
  const getWhatsAppLink = (phone: string) => {
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    return `https://wa.me/${cleanPhone.startsWith('+') ? cleanPhone.substring(1) : cleanPhone}`;
  };

  // Form handlers
  const openAddForm = () => {
    setFormData({ buyer_name: '', email: '', phone: '', country: '', state: '', notes: '', is_active: true });
    setEditingContact(null);
    setIsFormOpen(true);
  };

  const openEditForm = (contact: ExportBuyerContact) => {
    setFormData({
      buyer_name: contact.buyer_name,
      email: contact.email || '',
      phone: contact.phone,
      country: contact.country,
      state: contact.state || '',
      notes: contact.notes || '',
      is_active: contact.is_active,
    });
    setEditingContact(contact);
    setIsFormOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.buyer_name || !formData.phone || !formData.country) return;

    const submitData = {
      ...formData,
      email: formData.email || undefined,
      state: formData.state || undefined,
      notes: formData.notes || undefined,
    };

    if (editingContact) {
      await updateMutation.mutateAsync({ id: editingContact.id, data: submitData });
    } else {
      await createMutation.mutateAsync(submitData);
    }
    setIsFormOpen(false);
  };

  const handleDelete = async () => {
    if (deleteConfirmId) {
      await deleteMutation.mutateAsync(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const getCountryFlag = (country: string) => {
    const flags: Record<string, string> = {
      'UAE': '🇦🇪',
      'Saudi Arabia': '🇸🇦',
      'Kuwait': '🇰🇼',
      'Qatar': '🇶🇦',
      'Oman': '🇴🇲',
      'Bahrain': '🇧🇭',
      'South Africa': '🇿🇦',
      'Kenya': '🇰🇪',
      'Nigeria': '🇳🇬',
      'Egypt': '🇪🇬',
      'Morocco': '🇲🇦',
      'USA': '🇺🇸',
      'UK': '🇬🇧',
      'Germany': '🇩🇪',
      'France': '🇫🇷',
      'Italy': '🇮🇹',
      'Spain': '🇪🇸',
      'Australia': '🇦🇺',
      'Canada': '🇨🇦',
      'Singapore': '🇸🇬',
      'Malaysia': '🇲🇾',
      'Japan': '🇯🇵',
    };
    return flags[country] || '🌍';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <Globe className="h-6 w-6 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold">Export Buyer Contacts</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Manage your international buyer contacts for export business
          </p>
        </div>
        <Button onClick={openAddForm} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Buyer Contact
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{contacts.length}</div>
            <p className="text-sm text-muted-foreground">Total Contacts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {new Set(contacts.map(c => c.country)).size}
            </div>
            <p className="text-sm text-muted-foreground">Countries</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {contacts.filter(c => c.country === 'UAE' || c.country === 'Saudi Arabia').length}
            </div>
            <p className="text-sm text-muted-foreground">GCC Buyers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {contacts.filter(c => c.email).length}
            </div>
            <p className="text-sm text-muted-foreground">With Email</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, phone, email..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={countryFilter} onValueChange={handleFilterChange}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by country" />
                </SelectTrigger>
                <SelectContent>
                  {EXPORT_COUNTRIES.map((country) => (
                    <SelectItem key={country.value} value={country.value}>
                      {country.value !== 'all' && `${getCountryFlag(country.value)} `}
                      {country.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contacts Table */}
      {isLoading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-full" />
              <div className="h-8 bg-muted rounded w-full" />
              <div className="h-8 bg-muted rounded w-full" />
            </div>
          </CardContent>
        </Card>
      ) : contacts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Globe className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No buyer contacts found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm || countryFilter !== 'all' 
                ? 'Try adjusting your filters'
                : 'Get started by adding your first buyer contact'}
            </p>
            <Button onClick={openAddForm} variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Buyer Contact
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Buyer Name</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead className="hidden md:table-cell">Email</TableHead>
                    <TableHead className="hidden lg:table-cell">Notes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedContacts.map((contact) => (
                    <TableRow key={contact.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{contact.buyer_name}</div>
                            {contact.state && (
                              <div className="text-xs text-muted-foreground">{contact.state}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="gap-1">
                          <span>{getCountryFlag(contact.country)}</span>
                          {contact.country}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{contact.phone}</span>
                          <a
                            href={getWhatsAppLink(contact.phone)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:text-green-700"
                          >
                            <MessageCircle className="h-4 w-4" />
                          </a>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {contact.email ? (
                          <a 
                            href={`mailto:${contact.email}`}
                            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <Mail className="h-3 w-3" />
                            {contact.email}
                          </a>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span className="text-sm text-muted-foreground line-clamp-1 max-w-[200px]">
                          {contact.notes || '—'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => openEditForm(contact)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteConfirmId(contact.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                {[...Array(totalPages)].map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      onClick={() => setCurrentPage(i + 1)}
                      isActive={currentPage === i + 1}
                      className="cursor-pointer"
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingContact ? 'Edit Buyer Contact' : 'Add New Buyer Contact'}
            </DialogTitle>
            <DialogDescription>
              {editingContact ? 'Update the buyer contact details.' : 'Add a new export buyer to your contacts.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="buyer_name">Buyer Name *</Label>
              <Input
                id="buyer_name"
                placeholder="e.g., Ahmed Trading LLC"
                value={formData.buyer_name}
                onChange={(e) => setFormData({ ...formData, buyer_name: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Select 
                  value={formData.country} 
                  onValueChange={(value) => setFormData({ ...formData, country: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPORT_COUNTRIES.filter(c => c.value !== 'all').map((country) => (
                      <SelectItem key={country.value} value={country.value}>
                        {getCountryFlag(country.value)} {country.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="state">State/Region</Label>
                <Input
                  id="state"
                  placeholder="e.g., Dubai"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                placeholder="e.g., +971 50 123 4567"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email (Optional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="e.g., buyer@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional notes about this buyer..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!formData.buyer_name || !formData.phone || !formData.country || createMutation.isPending || updateMutation.isPending}
            >
              {editingContact ? 'Update' : 'Add'} Contact
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Buyer Contact?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The buyer contact will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
